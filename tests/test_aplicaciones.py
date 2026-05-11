"""Tests del modelo Aplicacion: dedupe de candidato por email, idempotencia
de get_or_create_aplicacion, etapas del pipeline y resumen por vacante."""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.crud import (
    create_candidato,
    create_vacante,
    find_or_create_candidato,
    get_candidato_por_email,
    get_or_create_aplicacion,
    update_etapa_aplicacion,
    update_notas_aplicacion,
    get_aplicaciones_por_vacante,
    get_resumen_pipeline_vacante,
    create_analisis,
)
from db.models import ETAPAS_APLICACION


@pytest_asyncio.fixture
async def db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


# ---------------------------------------------------------------------------
# Dedupe de candidatos por email
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_dedupe_por_email_reusa_candidato_existente(db):
    cand1, creado1 = await find_or_create_candidato(
        db, nombre="Ana García", email="ana@example.com"
    )
    assert creado1 is True

    cand2, creado2 = await find_or_create_candidato(
        db, nombre="Ana G.", email="ana@example.com"
    )
    assert creado2 is False
    assert cand1.id == cand2.id


@pytest.mark.asyncio
async def test_dedupe_email_es_case_insensitive(db):
    cand1, _ = await find_or_create_candidato(
        db, nombre="Ana", email="Ana@Example.COM"
    )
    cand2, creado = await find_or_create_candidato(
        db, nombre="Ana", email="ana@example.com"
    )
    assert creado is False
    assert cand1.id == cand2.id


@pytest.mark.asyncio
async def test_sin_email_siempre_crea_nuevo(db):
    """Sin email no podemos deduplicar; cada subida es candidato nuevo."""
    cand1, c1 = await find_or_create_candidato(db, nombre="Juan", email=None)
    cand2, c2 = await find_or_create_candidato(db, nombre="Juan", email=None)
    assert c1 is True and c2 is True
    assert cand1.id != cand2.id


@pytest.mark.asyncio
async def test_get_candidato_por_email_no_existe(db):
    resultado = await get_candidato_por_email(db, "noexiste@example.com")
    assert resultado is None


@pytest.mark.asyncio
async def test_dedupe_completa_telefono_si_falta(db):
    cand1, _ = await find_or_create_candidato(
        db, nombre="Ana", email="ana@x.com", telefono=None
    )
    assert cand1.telefono is None
    cand2, creado = await find_or_create_candidato(
        db, nombre="Ana", email="ana@x.com", telefono="+52 555 1234"
    )
    assert creado is False
    assert cand2.telefono == "+52 555 1234"


# ---------------------------------------------------------------------------
# Aplicaciones
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_or_create_aplicacion_es_idempotente(db):
    cand = await create_candidato(db, "Ana", email="ana@x.com")
    vac = await create_vacante(db, "Backend Python")

    apl1, creada1 = await get_or_create_aplicacion(db, vac.id, cand.id)
    apl2, creada2 = await get_or_create_aplicacion(db, vac.id, cand.id)

    assert creada1 is True
    assert creada2 is False
    assert apl1.id == apl2.id
    assert apl1.etapa == "nueva"


@pytest.mark.asyncio
async def test_mismo_candidato_diferentes_vacantes_genera_aplicaciones_distintas(db):
    cand = await create_candidato(db, "Ana", email="ana@x.com")
    v1 = await create_vacante(db, "Backend")
    v2 = await create_vacante(db, "Frontend")

    apl1, c1 = await get_or_create_aplicacion(db, v1.id, cand.id)
    apl2, c2 = await get_or_create_aplicacion(db, v2.id, cand.id)

    assert c1 is True and c2 is True
    assert apl1.id != apl2.id


# ---------------------------------------------------------------------------
# Etapas del pipeline
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_etapas_validas_se_guardan(db):
    cand = await create_candidato(db, "Ana")
    vac = await create_vacante(db, "Backend")
    apl, _ = await get_or_create_aplicacion(db, vac.id, cand.id)

    for etapa in ETAPAS_APLICACION:
        actualizada = await update_etapa_aplicacion(db, apl.id, etapa)
        assert actualizada.etapa == etapa


@pytest.mark.asyncio
async def test_etapa_invalida_lanza_value_error(db):
    cand = await create_candidato(db, "Ana")
    vac = await create_vacante(db, "Backend")
    apl, _ = await get_or_create_aplicacion(db, vac.id, cand.id)

    with pytest.raises(ValueError, match="Etapa invalida"):
        await update_etapa_aplicacion(db, apl.id, "etapa_inventada")


@pytest.mark.asyncio
async def test_update_etapa_aplicacion_inexistente_devuelve_none(db):
    resultado = await update_etapa_aplicacion(db, 9999, "shortlist")
    assert resultado is None


@pytest.mark.asyncio
async def test_notas_se_persisten(db):
    cand = await create_candidato(db, "Ana")
    vac = await create_vacante(db, "Backend")
    apl, _ = await get_or_create_aplicacion(db, vac.id, cand.id)

    actualizada = await update_notas_aplicacion(
        db, apl.id, "Buen perfil técnico, falta inglés."
    )
    assert actualizada.notas == "Buen perfil técnico, falta inglés."


# ---------------------------------------------------------------------------
# Listado y resumen
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_listar_aplicaciones_de_vacante_vacia(db):
    vac = await create_vacante(db, "Backend")
    filas = await get_aplicaciones_por_vacante(db, vac.id)
    assert filas == []


@pytest.mark.asyncio
async def test_listar_aplicaciones_incluye_candidato_y_ultimo_analisis(db):
    cand = await create_candidato(db, "Ana", email="ana@x.com")
    vac = await create_vacante(db, "Backend")
    apl, _ = await get_or_create_aplicacion(db, vac.id, cand.id)

    # un analisis para esa aplicacion
    await create_analisis(
        db, candidato_id=cand.id, vacante_id=vac.id,
        puntaje_total=78, desglose=[],
    )

    filas = await get_aplicaciones_por_vacante(db, vac.id)
    assert len(filas) == 1
    aplicacion, candidato, analisis = filas[0]
    assert aplicacion.id == apl.id
    assert candidato.nombre == "Ana"
    assert analisis is not None
    assert analisis.puntaje_total == 78


@pytest.mark.asyncio
async def test_listar_aplicaciones_sin_analisis_aun(db):
    cand = await create_candidato(db, "Ana")
    vac = await create_vacante(db, "Backend")
    await get_or_create_aplicacion(db, vac.id, cand.id)

    filas = await get_aplicaciones_por_vacante(db, vac.id)
    assert len(filas) == 1
    _, _, analisis = filas[0]
    assert analisis is None


@pytest.mark.asyncio
async def test_resumen_pipeline_cuenta_por_etapa(db):
    vac = await create_vacante(db, "Backend")
    for i, etapa in enumerate(["nueva", "nueva", "shortlist", "rechazada"]):
        cand = await create_candidato(db, f"C{i}", email=f"c{i}@x.com")
        apl, _ = await get_or_create_aplicacion(db, vac.id, cand.id)
        if etapa != "nueva":
            await update_etapa_aplicacion(db, apl.id, etapa)

    resumen = await get_resumen_pipeline_vacante(db, vac.id)
    assert resumen["nueva"] == 2
    assert resumen["shortlist"] == 1
    assert resumen["rechazada"] == 1
    assert resumen["entrevista"] == 0
    assert resumen["oferta"] == 0
    assert resumen["en_revision"] == 0
    # todas las etapas presentes en la respuesta
    assert set(resumen.keys()) == set(ETAPAS_APLICACION)
