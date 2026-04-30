import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from api.app import app
from db.database import get_db, Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.mark.asyncio
async def test_crear_vacante(client):
    async with client as c:
        response = await c.post("/vacancies/", json={"titulo": "Backend Developer", "descripcion": "Python"})
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == "Backend Developer"
    assert "id" in data


@pytest.mark.asyncio
async def test_listar_vacantes(client):
    async with client as c:
        await c.post("/vacancies/", json={"titulo": "Frontend Dev"})
        response = await c.get("/vacancies/")
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_crear_candidato(client):
    async with client as c:
        response = await c.post("/candidates/", json={"nombre": "Ana García"})
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Ana García"
    assert "id" in data


@pytest.mark.asyncio
async def test_listar_candidatos(client):
    async with client as c:
        await c.post("/candidates/", json={"nombre": "Pedro"})
        response = await c.get("/candidates/")
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_actualizar_requisitos_vacante(client):
    async with client as c:
        vacante = await c.post("/vacancies/", json={"titulo": "DevOps"})
        vacante_id = vacante.json()["id"]
        response = await c.put(
            f"/vacancies/{vacante_id}/requisitos",
            json={"requisitos_texto": "Experiencia en Docker y Kubernetes"},
        )
    assert response.status_code == 200
    assert response.json()["requisitos_texto"] == "Experiencia en Docker y Kubernetes"
