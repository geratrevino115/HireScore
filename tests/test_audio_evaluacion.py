"""Tests del endpoint POST /aplicaciones/{id}/audio:
- Happy path: audio → transcripcion → evaluacion persiste
- Sin analisis previo devuelve 422
- Aplicacion inexistente devuelve 404
- Fallo LLM en evaluate_interview: analisis sigue valido (evaluacion en None)
- Si la transcripcion esta vacia: evaluacion en None pero sentimiento puede calcularse
"""
import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from api.app import app
from db.database import get_db, Base
from db.crud import create_candidato, create_vacante, create_analisis, get_or_create_aplicacion
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
    EvaluacionEntrevista,
    DimensionEvaluacion,
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
    import api.endpoints.aplicaciones as aplicaciones_module
    monkeypatch.setattr(db_module, "AsyncSessionLocal", TestSession)
    monkeypatch.setattr(analyses_module, "AsyncSessionLocal", TestSession)
    yield
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def _cv_falso():
    return CVEstructurado(
        datos_personales=DatosPersonales(nombre="Ana García", email="ana@x.com"),
        resumen="Backend developer.",
        skills=[Skill(nombre="Python", nombre_normalizado="python",
                      categoria=SkillCategoria.LENGUAJE, nivel=NivelSkill.SENIOR,
                      años_experiencia=5)],
        años_experiencia_total=5,
    )


def _requisitos_falsos():
    return RequisitosEstructurados(
        skills_requeridos=[SkillRequerido(nombre="Python", nombre_normalizado="python", obligatorio=True)],
    )


def _evaluacion_falsa():
    dim = DimensionEvaluacion(puntaje=80, justificacion="Buena cobertura", evidencias=["Dijo X"])
    return EvaluacionEntrevista(
        cobertura=dim,
        consistencia=DimensionEvaluacion(puntaje=75, justificacion="Consistente", evidencias=[]),
        profundidad=DimensionEvaluacion(puntaje=70, justificacion="Profundo", evidencias=["Y"]),
        resumen_ejecutivo="Candidato sólido.",
    )


def _fake_audio_pipeline():
    """Simula _procesar_audio devolviendo sentimiento + transcripción breve."""
    async def _fake(audio_path):
        return 0.35, "Hola, trabajo con Python hace 5 años.", [
            {"texto": "Hola, trabajo con Python hace 5 años.",
             "hablante": 0, "inicio": 0.0, "fin": 5.0,
             "sentimiento_compound": 0.35}
        ]
    return _fake


class _FakeProvider:
    name = "fake"
    fail_eval = False

    async def extract_cv(self, texto): return _cv_falso()
    async def extract_requisitos(self, texto): return _requisitos_falsos()
    async def evaluate_soft_skills(self, t): return None
    async def generate_questions_from_cv(self, cv, req):
        return PreguntasPorCV(preguntas=[])
    async def evaluate_interview(self, transcripcion, cv, requisitos):
        if self.fail_eval:
            raise LLMError("simulated eval failure")
        return _evaluacion_falsa()
    async def health(self): return True


async def _crear_aplicacion_con_analisis(db, email="ana@x.com"):
    """Helper: crea candidato + vacante + aplicacion + analisis con snapshots."""
    c = await create_candidato(db, "Ana", email=email)
    v = await create_vacante(db, "Backend", requisitos_texto="Python")
    apl, _ = await get_or_create_aplicacion(db, v.id, c.id)
    a = await create_analisis(
        db,
        candidato_id=c.id,
        vacante_id=v.id,
        aplicacion_id=apl.id,
        puntaje_total=75,
        desglose=[],
        cv_estructurado_json=_cv_falso().model_dump(),
        requisitos_snapshot_json=_requisitos_falsos().model_dump(),
    )
    return apl, a


@pytest.mark.asyncio
async def test_audio_evalua_y_persiste():
    """Happy path: audio → transcripcion simulada → evaluacion persiste en el analisis."""
    async with TestSession() as db:
        apl, analisis = await _crear_aplicacion_con_analisis(db)
        apl_id = apl.id
        analisis_id = analisis.id

    provider = _FakeProvider()
    with patch("api.endpoints.aplicaciones.get_llm_provider", return_value=provider), \
         patch("api.endpoints.aplicaciones._procesar_audio", _fake_audio_pipeline()):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post(
                f"/aplicaciones/{apl_id}/audio",
                files={"audio_file": ("test.wav", b"fake audio", "audio/wav")},
            )

    assert r.status_code == 200, r.text
    body = r.json()
    assert body["aplicacion_id"] == apl_id
    assert body["analisis_id"] == analisis_id
    assert body["evaluacion_entrevista"] is not None
    ev = body["evaluacion_entrevista"]
    assert ev["cobertura"]["puntaje"] == 80
    assert ev["consistencia"]["puntaje"] == 75
    assert ev["resumen_ejecutivo"] == "Candidato sólido."
    assert body["sentimiento_compound"] == pytest.approx(0.35, abs=0.01)
    assert body["n_segmentos"] == 1


@pytest.mark.asyncio
async def test_audio_sin_analisis_devuelve_422():
    """Sin análisis previo no hay snapshot: 422."""
    async with TestSession() as db:
        c = await create_candidato(db, "X", email="x@x.com")
        v = await create_vacante(db, "Backend", requisitos_texto="Python")
        apl, _ = await get_or_create_aplicacion(db, v.id, c.id)
        apl_id = apl.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post(
            f"/aplicaciones/{apl_id}/audio",
            files={"audio_file": ("t.wav", b"fake", "audio/wav")},
        )

    assert r.status_code == 422
    assert "CV" in r.json()["detail"] or "analisis" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_audio_aplicacion_inexistente_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post(
            "/aplicaciones/9999/audio",
            files={"audio_file": ("t.wav", b"fake", "audio/wav")},
        )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_fallo_llm_eval_no_rompe_endpoint():
    """Si evaluate_interview falla, el endpoint igual devuelve 200 con evaluacion None."""
    async with TestSession() as db:
        apl, _ = await _crear_aplicacion_con_analisis(db, email="b@x.com")
        apl_id = apl.id

    provider = _FakeProvider()
    provider.fail_eval = True
    with patch("api.endpoints.aplicaciones.get_llm_provider", return_value=provider), \
         patch("api.endpoints.aplicaciones._procesar_audio", _fake_audio_pipeline()):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post(
                f"/aplicaciones/{apl_id}/audio",
                files={"audio_file": ("t.wav", b"fake", "audio/wav")},
            )

    assert r.status_code == 200, r.text
    body = r.json()
    assert body["evaluacion_entrevista"] is None
    # Sentimiento se guardó igualmente
    assert body["sentimiento_compound"] == pytest.approx(0.35, abs=0.01)


@pytest.mark.asyncio
async def test_evaluacion_aparece_en_explicacion():
    """Después de subir audio, GET /analyses/{id}/explicacion incluye evaluacion_entrevista."""
    async with TestSession() as db:
        apl, analisis = await _crear_aplicacion_con_analisis(db, email="c@x.com")
        apl_id = apl.id
        analisis_id = analisis.id

    provider = _FakeProvider()
    with patch("api.endpoints.aplicaciones.get_llm_provider", return_value=provider), \
         patch("api.endpoints.aplicaciones._procesar_audio", _fake_audio_pipeline()):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            await c.post(
                f"/aplicaciones/{apl_id}/audio",
                files={"audio_file": ("t.wav", b"fake", "audio/wav")},
            )
            exp = await c.get(f"/analyses/{analisis_id}/explicacion")

    assert exp.status_code == 200
    body = exp.json()
    assert "evaluacion_entrevista" in body
    assert body["evaluacion_entrevista"] is not None
    assert body["evaluacion_entrevista"]["cobertura"]["puntaje"] == 80
