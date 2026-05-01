"""Tests del endpoint de explicabilidad."""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.crud import create_candidato, create_vacante, create_analisis, get_analisis_by_id


@pytest_asyncio.fixture
async def db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_analisis_persiste_snapshot_completo(db):
    candidato = await create_candidato(db, "Juan")
    vacante = await create_vacante(db, "Backend")

    cv_dump = {"datos_personales": {"nombre": "Juan"}, "skills": []}
    req_dump = {"skills_requeridos": []}
    soft_dump = {"comunicacion": {"puntaje": 80, "evidencias": ["Habla claro"]}}

    analisis = await create_analisis(
        db,
        candidato_id=candidato.id, vacante_id=vacante.id,
        puntaje_total=78,
        desglose=[{"categoria": "Skills obligatorios", "puntaje": 90}],
        cv_estructurado_json=cv_dump,
        requisitos_snapshot_json=req_dump,
        soft_skills_json=soft_dump,
        features_crudos_json={"match_skills_obligatorios": 0.9},
        pesos_aplicados_json={"match_skills_obligatorios": 0.35},
        skills_match=["Python"],
        skills_faltantes=["Rust"],
    )
    refreshed = await get_analisis_by_id(db, analisis.id)
    assert refreshed.cv_estructurado_json == cv_dump
    assert refreshed.requisitos_snapshot_json == req_dump
    assert refreshed.soft_skills_json == soft_dump
    assert refreshed.skills_match == ["Python"]
    assert refreshed.skills_faltantes == ["Rust"]


@pytest.mark.asyncio
async def test_get_analisis_by_id_devuelve_none_si_no_existe(db):
    assert await get_analisis_by_id(db, 9999) is None


@pytest.mark.asyncio
async def test_create_analisis_sin_explicabilidad_funciona(db):
    """Compatibilidad: si no se pasan los campos extra, sigue funcionando."""
    candidato = await create_candidato(db, "Ana")
    vacante = await create_vacante(db, "QA")
    analisis = await create_analisis(
        db, candidato_id=candidato.id, vacante_id=vacante.id,
        puntaje_total=70, desglose=[],
    )
    assert analisis.cv_estructurado_json is None
    assert analisis.skills_match is None
