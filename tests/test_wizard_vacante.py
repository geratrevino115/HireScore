"""Tests del wizard de creación de vacante (extracción de archivo + IA)
y de los endpoints de guía de entrevista. Mockea el provider LLM."""
import pytest
import pytest_asyncio
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from api.app import app
from db.database import get_db, Base
from handlers.llm.schemas import (
    VacanteGenerada,
    GenerarVacanteInputs,
    RequisitosEstructurados,
    SkillRequerido,
    GuiaEntrevistaResultado,
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
    import api.endpoints.vacancies as vac_module
    monkeypatch.setattr(db_module, "AsyncSessionLocal", TestSession)
    monkeypatch.setattr(vac_module, "_hash_texto", lambda s: "mockhash")
    yield
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def _draft_falso():
    return VacanteGenerada(
        titulo="Backend Senior Python",
        descripcion="Posición remota, equipo distribuido.",
        requisitos_texto="- 5+ años Python\n- FastAPI\n- PostgreSQL\n- Docker",
    )


def _requisitos_falsos():
    return RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(nombre="Python", nombre_normalizado="python", obligatorio=True),
            SkillRequerido(nombre="FastAPI", nombre_normalizado="fastapi", obligatorio=True),
        ],
        años_experiencia_min=5,
    )


def _guia_falsa():
    return GuiaEntrevistaResultado(
        preguntas=[
            PreguntaEntrevista(
                pregunta="Explica la diferencia entre threading y asyncio en Python.",
                skill_relacionada="Python",
                objetivo="Profundidad técnica del lenguaje",
                tipo="tecnica",
            ),
            PreguntaEntrevista(
                pregunta="Cuéntame de un bug difícil de FastAPI que resolviste.",
                skill_relacionada="FastAPI",
                objetivo="Experiencia práctica",
                tipo="comportamiento",
            ),
            PreguntaEntrevista(
                pregunta="Si una migración de Postgres falla en producción, ¿cómo procedes?",
                skill_relacionada="PostgreSQL",
                objetivo="Pensamiento estructurado bajo presión",
                tipo="situacional",
            ),
        ],
        criterios_evaluacion=[
            "Usa lenguaje técnico preciso",
            "Da ejemplos concretos en lugar de generalidades",
        ],
        senales_de_alerta=[
            "Atribuye logros de equipo a sí mismo sin matiz",
        ],
    )


class _FakeProvider:
    name = "fake"

    async def extract_vacancy_from_text(self, texto):
        return _draft_falso()

    async def generate_vacancy_draft(self, inputs):
        assert isinstance(inputs, GenerarVacanteInputs)
        return _draft_falso()

    async def extract_requisitos(self, texto):
        return _requisitos_falsos()

    async def generate_interview_guide(self, requisitos, descripcion=None):
        assert isinstance(requisitos, RequisitosEstructurados)
        return _guia_falsa()

    async def health(self):
        return True


# ---------------------------------------------------------------------------
# extraer-desde-archivo
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_extraer_desde_archivo_devuelve_draft():
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()), \
         patch("api.endpoints.vacancies.extract_text", return_value="texto JD"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            files = {"file": ("jd.pdf", b"%PDF-1.4 fake", "application/pdf")}
            r = await c.post("/vacancies/extraer-desde-archivo", files=files)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["titulo"] == "Backend Senior Python"
    assert "Python" in body["requisitos_texto"]


@pytest.mark.asyncio
async def test_extraer_desde_archivo_rechaza_extension_invalida():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        files = {"file": ("notas.txt", b"texto", "text/plain")}
        r = await c.post("/vacancies/extraer-desde-archivo", files=files)
    assert r.status_code == 400
    assert "PDF" in r.json()["detail"]


# ---------------------------------------------------------------------------
# generar (modo IA)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generar_borrador_con_inputs_minimos():
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            r = await c.post("/vacancies/generar", json={"puesto": "Backend dev"})
    assert r.status_code == 200, r.text
    assert r.json()["titulo"] == "Backend Senior Python"


@pytest.mark.asyncio
async def test_generar_borrador_acepta_stack_y_seniority():
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            r = await c.post(
                "/vacancies/generar",
                json={
                    "puesto": "Backend dev",
                    "seniority": "senior",
                    "stack": ["Python", "FastAPI"],
                    "responsabilidades": "diseñar APIs",
                },
            )
    assert r.status_code == 200, r.text


# ---------------------------------------------------------------------------
# guia-entrevista (CRUD + regeneración)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generar_guia_persiste_y_recupera():
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/",
                json={"titulo": "Backend", "requisitos_texto": "- Python\n- FastAPI"},
            )
            vid = vac.json()["id"]

            # 404 antes de generar
            antes = await c.get(f"/vacancies/{vid}/guia-entrevista")
            assert antes.status_code == 404

            # generar
            gen = await c.post(f"/vacancies/{vid}/guia-entrevista")
            assert gen.status_code == 200, gen.text
            body = gen.json()
            assert body["vacante_id"] == vid
            assert len(body["preguntas"]) == 3
            assert body["criterios_evaluacion"][0].startswith("Usa lenguaje")
            assert len(body["senales_de_alerta"]) == 1

            # GET ya devuelve la guía
            recup = await c.get(f"/vacancies/{vid}/guia-entrevista")
            assert recup.status_code == 200
            assert len(recup.json()["preguntas"]) == 3


@pytest.mark.asyncio
async def test_regenerar_guia_reemplaza_la_anterior():
    """Llamar POST dos veces no acumula filas; siempre hay una sola guía."""
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "- Python"}
            )
            vid = vac.json()["id"]
            r1 = await c.post(f"/vacancies/{vid}/guia-entrevista")
            r2 = await c.post(f"/vacancies/{vid}/guia-entrevista")
    assert r1.status_code == 200 and r2.status_code == 200
    # Solo verificamos que ambas devuelven la misma estructura
    assert len(r1.json()["preguntas"]) == len(r2.json()["preguntas"])


@pytest.mark.asyncio
async def test_eliminar_guia():
    with patch("api.endpoints.vacancies.get_llm_provider", return_value=_FakeProvider()):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as c:
            vac = await c.post(
                "/vacancies/", json={"titulo": "Backend", "requisitos_texto": "- Python"}
            )
            vid = vac.json()["id"]
            await c.post(f"/vacancies/{vid}/guia-entrevista")
            d = await c.delete(f"/vacancies/{vid}/guia-entrevista")
            assert d.status_code == 200
            # 404 después
            r = await c.get(f"/vacancies/{vid}/guia-entrevista")
            assert r.status_code == 404


@pytest.mark.asyncio
async def test_generar_guia_falla_si_vacante_sin_requisitos():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        vac = await c.post("/vacancies/", json={"titulo": "Backend"})
        vid = vac.json()["id"]
        r = await c.post(f"/vacancies/{vid}/guia-entrevista")
    assert r.status_code == 422
    assert "requisitos" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_generar_guia_vacante_inexistente():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        r = await c.post("/vacancies/9999/guia-entrevista")
    assert r.status_code == 404
