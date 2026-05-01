"""Tests del tracking de costos LLM."""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.crud import (
    create_candidato, create_vacante, create_analisis,
    crear_costos_llm_lote, get_costos_por_analisis, get_costo_total_vacante,
)
from handlers.observability.costs import calcular_costo_usd, get_pricing
from handlers.observability.usage import (
    UsageEvent, start_collection, stop_collection, add_usage, costo_total,
)


# ---------- pricing ----------

def test_pricing_haiku_es_distinto_a_sonnet():
    p_h = get_pricing("claude", "claude-haiku-4-5-20251001")
    p_s = get_pricing("claude", "claude-sonnet-4-6")
    assert p_s["input_per_mtok"] > p_h["input_per_mtok"]


def test_pricing_ollama_es_cero():
    p = get_pricing("ollama", "llama3.2")
    assert p["input_per_mtok"] == 0.0
    assert p["output_per_mtok"] == 0.0


def test_pricing_modelo_desconocido_devuelve_cero():
    p = get_pricing("provider_x", "model_y")
    assert all(v == 0.0 for v in p.values())


def test_calcular_costo_usd_haiku():
    # 1M input + 500K output con Haiku
    costo = calcular_costo_usd(
        "claude", "claude-haiku-4-5-20251001",
        tokens_input=1_000_000, tokens_output=500_000,
    )
    # 1.0 + 0.5 * 5.0 = 3.5
    assert costo == pytest.approx(3.5, abs=0.001)


def test_calcular_costo_descuenta_cache_read_del_input():
    # Si declaras 1000 input pero 800 vinieron de cache, solo 200 son fresh
    costo = calcular_costo_usd(
        "claude", "claude-haiku-4-5-20251001",
        tokens_input=1000, tokens_output=0, tokens_cache_read=800,
    )
    # 200 fresh @ $1/Mtok + 800 cache @ $0.10/Mtok
    esperado = 200 / 1_000_000 * 1.0 + 800 / 1_000_000 * 0.10
    assert costo == pytest.approx(esperado, abs=1e-9)


# ---------- usage collector ----------

def test_collector_captura_eventos_y_costo_total():
    eventos = start_collection()
    add_usage(UsageEvent(provider="claude", model="claude-haiku-4-5-20251001",
                          operacion="extract_cv", tokens_input=10000, tokens_output=2000))
    add_usage(UsageEvent(provider="ollama", model="llama3.2",
                          operacion="extract_requisitos", tokens_input=5000, tokens_output=1000))
    stop_collection()
    assert len(eventos) == 2
    total = costo_total(eventos)
    # solo el evento de claude tiene costo
    assert total > 0
    assert eventos[1].costo_usd == 0.0


def test_add_usage_sin_collector_es_no_op():
    stop_collection()  # garantizar limpio
    add_usage(UsageEvent(provider="claude", model="x", operacion="y"))
    # no lanza


# ---------- crud ----------

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
async def test_persistir_costos_y_recuperar(db):
    candidato = await create_candidato(db, "Juan")
    vacante = await create_vacante(db, "Backend")
    analisis = await create_analisis(
        db, candidato_id=candidato.id, vacante_id=vacante.id,
        puntaje_total=80, desglose=[],
    )

    eventos = [
        UsageEvent("claude", "claude-haiku-4-5-20251001", "extract_cv",
                   tokens_input=8000, tokens_output=1500, duracion_ms=850.0).to_dict(),
        UsageEvent("claude", "claude-haiku-4-5-20251001", "extract_requisitos",
                   tokens_input=2000, tokens_output=500, duracion_ms=450.0).to_dict(),
    ]
    n = await crear_costos_llm_lote(db, eventos, analisis.id)
    assert n == 2

    rows = await get_costos_por_analisis(db, analisis.id)
    assert len(rows) == 2
    assert rows[0].operacion == "extract_cv"
    assert rows[0].costo_usd > 0


@pytest.mark.asyncio
async def test_costo_total_vacante_suma_todos_los_analisis(db):
    candidato = await create_candidato(db, "Juan")
    vacante = await create_vacante(db, "Backend")

    for puntaje in [70, 80, 90]:
        analisis = await create_analisis(
            db, candidato_id=candidato.id, vacante_id=vacante.id,
            puntaje_total=puntaje, desglose=[],
        )
        evento = UsageEvent(
            "claude", "claude-haiku-4-5-20251001", "extract_cv",
            tokens_input=10000, tokens_output=2000,
        ).to_dict()
        await crear_costos_llm_lote(db, [evento], analisis.id)

    resumen = await get_costo_total_vacante(db, vacante.id)
    assert resumen["llamadas_llm"] == 3
    assert resumen["costo_usd"] > 0
