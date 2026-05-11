"""Test E2E del endpoint /analyses/procesar refactorizado:
- candidato_id es opcional
- dedupe automatico por email del CV
- crea Aplicacion en etapa 'nueva'
- el Analisis queda vinculado a la Aplicacion
- segunda subida del mismo email reusa candidato y aplicacion (idempotente)

Mockea el provider LLM y el pipeline de audio para no depender de servicios externos.
"""
import io
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from api.app import app
from db.database import get_db, Base
from db.crud import get_candidato_por_email, get_aplicaciones_por_vacante
from handlers.llm.schemas import (
    CVEstructurado,
    DatosPersonales,
    Skill,
    SkillCategoria,
    NivelSkill,
    RequisitosEstructurados,
    SkillRequerido,
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
    # El pipeline usa AsyncSessionLocal directamente (no via get_db) para
    # ciertas operaciones; redirigimos al engine de prueba para no golpear
    # la BD real durante los tests.
    import db.database as db_module
    import api.endpoints.analyses as analyses_module
    monkeypatch.setattr(db_module, "AsyncSessionLocal", TestSession)
    monkeypatch.setattr(analyses_module, "AsyncSessionLocal", TestSession)
    yield
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def _cv_falso(email: str, nombre: str = "Ana García"):
    return CVEstructurado(
        datos_personales=DatosPersonales(
            nombre=nombre, email=email, telefono="+52 555 0000"
        ),
        resumen="Backend developer con 5 años de experiencia.",
        skills=[
            Skill(
                nombre="Python",
                nombre_normalizado="python",
                categoria=SkillCategoria.LENGUAJE,
                nivel=NivelSkill.SENIOR,
                años_experiencia=5,
            ),
            Skill(
                nombre="FastAPI",
                nombre_normalizado="fastapi",
                categoria=SkillCategoria.FRAMEWORK,
                nivel=NivelSkill.MID,
                años_experiencia=3,
            ),
        ],
        años_experiencia_total=5.0,
    )


def _requisitos_falsos():
    return RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(
                nombre="Python", nombre_normalizado="python", obligatorio=True
            ),
        ],
    )


class _FakeProvider:
    name = "fake"

    def __init__(self, cv):
        self._cv = cv

    async def extract_cv(self, texto):
        return self._cv

    async def extract_requisitos(self, texto):
        return _requisitos_falsos()

    async def evaluate_soft_skills(self, transcripcion):
        return None

    async def generate_questions_from_cv(self, cv, requisitos):
        from handlers.llm.schemas import PreguntasPorCV, PreguntaEntrevista
        return PreguntasPorCV(preguntas=[
            PreguntaEntrevista(
                pregunta="Mencionas FastAPI con 3 años — cuéntame del endpoint más complejo que diseñaste.",
                skill_relacionada="FastAPI",
                objetivo="Validar profundidad real",
                tipo="tecnica",
            ),
        ])

    async def health(self):
        return True


@pytest.fixture
def cv_pdf_bytes():
    """PDF mínimo válido (no necesita ser real porque mockeamos extract_text)."""
    return b"%PDF-1.4 fake pdf bytes"


@pytest.mark.asyncio
async def test_procesar_sin_candidato_id_dedupe_por_email(cv_pdf_bytes):
    """Primera subida sin candidato_id: se crea candidato con el email del CV."""
    cv = _cv_falso(email="ana@example.com", nombre="Ana García")
    provider = _FakeProvider(cv)

    with patch(
        "api.endpoints.analyses.get_llm_provider", return_value=provider
    ), patch(
        "api.endpoints.analyses.extract_text", return_value="texto del cv"
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/",
                json={
                    "titulo": "Backend",
                    "requisitos_texto": "Python obligatorio",
                },
            )
            vacante_id = vac.json()["id"]

            files = {"cv_file": ("cv.pdf", cv_pdf_bytes, "application/pdf")}
            data = {"vacante_id": str(vacante_id)}
            resp = await c.post("/analyses/procesar", files=files, data=data)

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["candidato_creado"] is True
    assert body["aplicacion"]["etapa"] == "nueva"
    assert body["aplicacion"]["vacante_id"] == vacante_id
    assert body["analisis"]["aplicacion_id"] == body["aplicacion"]["id"]
    assert body["analisis"]["candidato_id"] == body["aplicacion"]["candidato_id"]


@pytest.mark.asyncio
async def test_procesar_segunda_vez_mismo_email_reusa_candidato(cv_pdf_bytes):
    """Mismo email → mismo candidato → misma aplicacion (no duplica)."""
    cv = _cv_falso(email="ana@example.com")
    provider = _FakeProvider(cv)

    with patch(
        "api.endpoints.analyses.get_llm_provider", return_value=provider
    ), patch(
        "api.endpoints.analyses.extract_text", return_value="texto del cv"
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vacante_id = vac.json()["id"]

            files = {"cv_file": ("cv.pdf", cv_pdf_bytes, "application/pdf")}
            data = {"vacante_id": str(vacante_id)}
            r1 = await c.post("/analyses/procesar", files=files, data=data)
            r2 = await c.post("/analyses/procesar", files=files, data=data)

    assert r1.status_code == 200 and r2.status_code == 200
    b1, b2 = r1.json(), r2.json()
    assert b1["candidato_creado"] is True
    assert b2["candidato_creado"] is False
    # mismo candidato y misma aplicacion
    assert b1["aplicacion"]["candidato_id"] == b2["aplicacion"]["candidato_id"]
    assert b1["aplicacion"]["id"] == b2["aplicacion"]["id"]
    # pero analisis distintos (cada subida genera score nuevo)
    assert b1["analisis"]["id"] != b2["analisis"]["id"]


@pytest.mark.asyncio
async def test_dos_emails_distintos_dos_candidatos(cv_pdf_bytes):
    """Dos CVs con emails distintos a la misma vacante → dos aplicaciones."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        vac = await c.post(
            "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
        )
        vacante_id = vac.json()["id"]

        for email, nombre in [
            ("ana@x.com", "Ana"),
            ("juan@x.com", "Juan"),
        ]:
            cv = _cv_falso(email=email, nombre=nombre)
            with patch(
                "api.endpoints.analyses.get_llm_provider",
                return_value=_FakeProvider(cv),
            ), patch(
                "api.endpoints.analyses.extract_text", return_value="texto"
            ):
                files = {"cv_file": ("cv.pdf", cv_pdf_bytes, "application/pdf")}
                data = {"vacante_id": str(vacante_id)}
                resp = await c.post(
                    "/analyses/procesar", files=files, data=data
                )
                assert resp.status_code == 200, resp.text

        aplicaciones = await c.get(f"/vacancies/{vacante_id}/aplicaciones")
        assert aplicaciones.status_code == 200
        lista = aplicaciones.json()
        assert len(lista) == 2
        emails = sorted([a["candidato_email"] for a in lista])
        assert emails == ["ana@x.com", "juan@x.com"]


@pytest.mark.asyncio
async def test_pipeline_etapas_y_cambio(cv_pdf_bytes):
    """Procesa, lista por etapa, cambia etapa via PATCH, valida pipeline counts."""
    cv = _cv_falso(email="ana@example.com")
    provider = _FakeProvider(cv)

    with patch(
        "api.endpoints.analyses.get_llm_provider", return_value=provider
    ), patch(
        "api.endpoints.analyses.extract_text", return_value="texto"
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vacante_id = vac.json()["id"]
            files = {"cv_file": ("cv.pdf", cv_pdf_bytes, "application/pdf")}
            data = {"vacante_id": str(vacante_id)}
            r = await c.post("/analyses/procesar", files=files, data=data)
            apl_id = r.json()["aplicacion"]["id"]

            # pipeline empieza con 1 en "nueva"
            pipe = await c.get(f"/vacancies/{vacante_id}/pipeline")
            assert pipe.json()["counts"]["nueva"] == 1
            assert pipe.json()["total"] == 1

            # mover a shortlist
            patch_resp = await c.patch(
                f"/aplicaciones/{apl_id}/etapa",
                json={"etapa": "shortlist"},
            )
            assert patch_resp.status_code == 200
            assert patch_resp.json()["etapa"] == "shortlist"

            # filtrar por etapa
            por_etapa = await c.get(
                f"/vacancies/{vacante_id}/aplicaciones?etapa=shortlist"
            )
            assert len(por_etapa.json()) == 1

            # etapa invalida
            bad = await c.patch(
                f"/aplicaciones/{apl_id}/etapa",
                json={"etapa": "fantasia"},
            )
            assert bad.status_code == 422


@pytest.mark.asyncio
async def test_aplicacion_inexistente_devuelve_404(cv_pdf_bytes):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        r = await c.patch(
            "/aplicaciones/9999/etapa", json={"etapa": "shortlist"}
        )
        assert r.status_code == 404


@pytest.mark.asyncio
async def test_notas_se_guardan_y_listan(cv_pdf_bytes):
    cv = _cv_falso(email="ana@x.com")
    provider = _FakeProvider(cv)

    with patch(
        "api.endpoints.analyses.get_llm_provider", return_value=provider
    ), patch(
        "api.endpoints.analyses.extract_text", return_value="texto"
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "Python"}
            )
            vacante_id = vac.json()["id"]
            files = {"cv_file": ("cv.pdf", cv_pdf_bytes, "application/pdf")}
            r = await c.post(
                "/analyses/procesar",
                files=files,
                data={"vacante_id": str(vacante_id)},
            )
            apl_id = r.json()["aplicacion"]["id"]

            await c.patch(
                f"/aplicaciones/{apl_id}/notas",
                json={"notas": "Excelente perfil técnico"},
            )

            lista = await c.get(f"/vacancies/{vacante_id}/aplicaciones")
            data = lista.json()
            assert data[0]["notas"] == "Excelente perfil técnico"
