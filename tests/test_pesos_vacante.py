"""Tests del flujo de pesos custom por vacante."""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.crud import create_vacante, update_vacante_pesos, get_vacante


@pytest_asyncio.fixture
async def db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


PESOS_VALIDOS = {
    "match_skills_obligatorios": 0.50,
    "match_skills_deseables": 0.20,
    "experiencia": 0.10,
    "educacion": 0.10,
    "soft_skills": 0.05,
    "sentimiento": 0.05,
}


@pytest.mark.asyncio
async def test_set_pesos_persiste_y_recupera(db):
    vacante = await create_vacante(db, "Backend")
    await update_vacante_pesos(db, vacante.id, PESOS_VALIDOS)
    refreshed = await get_vacante(db, vacante.id)
    assert refreshed.pesos_json == PESOS_VALIDOS


@pytest.mark.asyncio
async def test_reset_pesos_pone_null(db):
    vacante = await create_vacante(db, "Backend")
    await update_vacante_pesos(db, vacante.id, PESOS_VALIDOS)
    await update_vacante_pesos(db, vacante.id, None)
    refreshed = await get_vacante(db, vacante.id)
    assert refreshed.pesos_json is None


@pytest.mark.asyncio
async def test_update_pesos_vacante_inexistente(db):
    result = await update_vacante_pesos(db, 9999, PESOS_VALIDOS)
    assert result is None
