"""Tests del nuevo flujo de transcripciones (in-memory + Postgres)."""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.database import Base
from db.models import Candidato, Vacante, Analisis, Transcripcion
from db.crud import (
    create_candidato,
    create_vacante,
    create_analisis,
    crear_transcripciones_lote,
    get_transcripciones_por_analisis,
    _formato_tiempo,
)
from handlers.interview.analisis_sentimiento import (
    analizar_sentimiento,
    anotar_sentimiento_segmentos,
    sentimiento_promedio,
)


# ---------- analisis_sentimiento ----------

def test_analizar_sentimiento_devuelve_keys_vader():
    r = analizar_sentimiento("Estoy muy feliz con el resultado")
    assert set(r.keys()) == {"neg", "neu", "pos", "compound"}
    assert -1 <= r["compound"] <= 1


def test_anotar_sentimiento_agrega_campos_a_cada_segmento():
    segs = [
        {"texto": "Me encanto el proyecto", "hablante": 1},
        {"texto": "Fue muy dificil", "hablante": 2},
    ]
    out = anotar_sentimiento_segmentos(segs)
    for s in out:
        assert "sentimiento_neg" in s
        assert "sentimiento_neu" in s
        assert "sentimiento_pos" in s
        assert "sentimiento_compound" in s


def test_sentimiento_promedio_devuelve_none_si_vacio():
    assert sentimiento_promedio([]) is None


def test_sentimiento_promedio_ignora_none():
    segs = [
        {"sentimiento_compound": 0.5},
        {"sentimiento_compound": None},
        {"sentimiento_compound": -0.5},
    ]
    assert sentimiento_promedio(segs) == 0.0


def test_formato_tiempo_redondea_correctamente():
    assert _formato_tiempo(0) == "00:00:00.000"
    assert _formato_tiempo(65.5) == "00:01:05.500"
    assert _formato_tiempo(None) is None


# ---------- crud transcripciones ----------

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
async def test_crear_transcripciones_lote_persiste_y_recupera(db):
    candidato = await create_candidato(db, "Juan")
    vacante = await create_vacante(db, "Backend", requisitos_texto="Python")
    analisis = await create_analisis(
        db, candidato_id=candidato.id, vacante_id=vacante.id,
        puntaje_total=80, desglose=[],
    )

    segmentos = [
        {
            "inicio": 0.0, "fin": 5.5, "hablante": 1, "texto": "Hola",
            "sentimiento_neg": 0.0, "sentimiento_neu": 1.0, "sentimiento_pos": 0.0, "sentimiento_compound": 0.0,
        },
        {
            "inicio": 5.5, "fin": 10.0, "hablante": 2, "texto": "Me encanta el equipo",
            "sentimiento_neg": 0.0, "sentimiento_neu": 0.5, "sentimiento_pos": 0.5, "sentimiento_compound": 0.6,
        },
    ]
    n = await crear_transcripciones_lote(db, segmentos, "audio.mp3", analisis.id)
    assert n == 2

    rows = await get_transcripciones_por_analisis(db, analisis.id)
    assert len(rows) == 2
    assert rows[0].texto == "Hola"
    assert rows[1].sentimiento_compound == 0.6
    assert rows[0].inicio == "00:00:00.000"


@pytest.mark.asyncio
async def test_crear_transcripciones_lote_vacio_es_no_op(db):
    n = await crear_transcripciones_lote(db, [], "audio.mp3", None)
    assert n == 0


@pytest.mark.asyncio
async def test_transcripciones_se_borran_con_analisis_cascade(db):
    candidato = await create_candidato(db, "Ana")
    vacante = await create_vacante(db, "DevOps")
    analisis = await create_analisis(
        db, candidato_id=candidato.id, vacante_id=vacante.id,
        puntaje_total=70, desglose=[],
    )
    await crear_transcripciones_lote(
        db, [{"texto": "x", "hablante": 1, "inicio": 0, "fin": 1}], "a.mp3", analisis.id,
    )
    await db.delete(analisis)
    await db.commit()

    rows = await get_transcripciones_por_analisis(db, analisis.id)
    assert rows == []
