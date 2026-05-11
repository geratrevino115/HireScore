"""Tests de las preguntas de entrevista personalizadas al CV:
- el pipeline las genera best-effort y las persiste en el analisis
- /explicacion las expone
- POST /analyses/{id}/preguntas-cv las regenera
- si el LLM falla, el analisis sigue valido (preguntas en None)
"""
import pytest
import pytest_asyncio
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from api.app import app
from db.database import get_db, Base
from handlers.llm.base import LLMError
from handlers.llm.schemas import (
    CVEstructurado,
    DatosPersonales,
    Skill,
    SkillCategoria,
    NivelSkill,
    RequisitosEstructurados,
    SkillRequerido,
    PreguntasPorCV,
    PreguntaEntrevista,
)


TEST_DB = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(TEST_DB, echo=False)
TestSession = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_db():
    async with TestSession() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup(monkeypatch):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.dependency_overrides[get_db] = override_db
    import db.database as db_module
    import api.endpoints.analyses as analyses_module
    monkeypatch.setattr(db_module, "AsyncSessionLocal", TestSession)
    monkeypatch.setattr(analyses_module, "AsyncSessionLocal", TestSession)
    yield
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def _cv_falso(email="ana@x.com"):
    return CVEstructurado(
        datos_personales=DatosPersonales(nombre="Ana García", email=email),
        resumen="Backend developer con 5 años de experiencia.",
        skills=[
            Skill(
                nombre="Python", nombre_normalizado="python",
                categoria=SkillCategoria.LENGUAJE, nivel=NivelSkill.SENIOR,
                años_experiencia=5,
            ),
        ],
        años_experiencia_total=5,
    )


def _requisitos_falsos():
    return RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(nombre="Python", nombre_normalizado="python", obligatorio=True),
        ],
    )


def _preguntas_falsas():
    return PreguntasPorCV(preguntas=[
        PreguntaEntrevista(
            pregunta="Has trabajado 5 años con Python — cuéntame del proyecto más complejo.",
            skill_relacionada="Python",
            objetivo="Validar seniority real",
            tipo="tecnica",
        ),
        PreguntaEntrevista(
            pregunta="Tu CV menciona TechCorp, ¿cómo era el día a día?",
            skill_relacionada=None,
            objetivo="Contexto de la experiencia",
            tipo="comportamiento",
        ),
    ])


class _FakeProvider:
    name = "fake"
    fail_questions = False

    async def extract_cv(self, texto):
        return _cv_falso()

    async def extract_requisitos(self, texto):
        return _requisitos_falsos()

    async def evaluate_soft_skills(self, transcripcion):
        return None

    async def generate_questions_from_cv(self, cv, requisitos):
        if self.fail_questions:
            raise LLMError("simulated failure")
        return _preguntas_falsas()

    async def health(self):
        return True


@pytest.mark.asyncio
async def test_pipeline_persiste_preguntas_cv():
    """Tras procesar un CV, /explicacion devuelve preguntas_cv pobladas."""
    provider = _FakeProvider()
    with patch("api.endpoints.analyses.get_llm_provider", return_value=provider), \
         patch("api.endpoints.analyses.extract_text", return_value="texto"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vid = vac.json()["id"]
            files = {"cv_file": ("cv.pdf", b"fake", "application/pdf")}
            r = await c.post("/analyses/procesar", files=files, data={"vacante_id": str(vid)})
            assert r.status_code == 200
            analisis_id = r.json()["analisis"]["id"]

            exp = await c.get(f"/analyses/{analisis_id}/explicacion")
    assert exp.status_code == 200
    body = exp.json()
    assert "preguntas_cv" in body
    assert body["preguntas_cv"] is not None
    assert len(body["preguntas_cv"]) == 2
    assert "Python" in body["preguntas_cv"][0]["pregunta"]


@pytest.mark.asyncio
async def test_falla_llm_no_rompe_analisis():
    """Si la generación de preguntas falla, el análisis sigue válido pero
    preguntas_cv queda en None — best-effort."""
    provider = _FakeProvider()
    provider.fail_questions = True

    with patch("api.endpoints.analyses.get_llm_provider", return_value=provider), \
         patch("api.endpoints.analyses.extract_text", return_value="texto"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vid = vac.json()["id"]
            files = {"cv_file": ("cv.pdf", b"fake", "application/pdf")}
            r = await c.post("/analyses/procesar", files=files, data={"vacante_id": str(vid)})

    assert r.status_code == 200, r.text
    analisis_id = r.json()["analisis"]["id"]
    # El análisis se persistió correctamente
    assert r.json()["analisis"]["puntaje_total"] is not None
    # /explicacion devuelve preguntas_cv en None
    with patch("api.endpoints.analyses.get_llm_provider", return_value=provider), \
         patch("api.endpoints.analyses.extract_text", return_value="texto"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            exp = await c.get(f"/analyses/{analisis_id}/explicacion")
    assert exp.status_code == 200
    assert exp.json()["preguntas_cv"] in (None, [])


@pytest.mark.asyncio
async def test_endpoint_regenerar_preguntas_cv():
    """POST /analyses/{id}/preguntas-cv reemplaza las preguntas existentes."""
    provider = _FakeProvider()
    provider.fail_questions = True  # primera pasada falla → preguntas en None

    with patch("api.endpoints.analyses.get_llm_provider", return_value=provider), \
         patch("api.endpoints.analyses.extract_text", return_value="texto"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vid = vac.json()["id"]
            files = {"cv_file": ("cv.pdf", b"fake", "application/pdf")}
            r = await c.post("/analyses/procesar", files=files, data={"vacante_id": str(vid)})
            analisis_id = r.json()["analisis"]["id"]

    # Ahora el provider responde OK; regeneramos
    provider.fail_questions = False
    with patch("api.endpoints.analyses.get_llm_provider", return_value=provider):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            r = await c.post(f"/analyses/{analisis_id}/preguntas-cv")

    assert r.status_code == 200, r.text
    assert r.json()["preguntas_cv"] is not None
    assert len(r.json()["preguntas_cv"]) == 2


@pytest.mark.asyncio
async def test_regenerar_falla_si_no_hay_snapshot():
    """Si por alguna razón el análisis no tiene cv_estructurado_json, devuelve 422."""
    # Creamos un Analisis crudo sin snapshot
    from db.crud import create_candidato, create_vacante, create_analisis
    async with TestSession() as s:
        c = await create_candidato(s, "X", email="x@x.com")
        v = await create_vacante(s, "Backend", requisitos_texto="Python")
        a = await create_analisis(
            s, candidato_id=c.id, vacante_id=v.id,
            puntaje_total=70, desglose=[],
            cv_estructurado_json=None,  # explícitamente sin snapshot
            requisitos_snapshot_json=None,
        )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        r = await c.post(f"/analyses/{a.id}/preguntas-cv")
    assert r.status_code == 422
    assert "snapshot" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_regenerar_analisis_inexistente():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        r = await c.post("/analyses/9999/preguntas-cv")
    assert r.status_code == 404
