from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from sqlalchemy import func as sql_func
from db.models import Candidato, Vacante, Analisis, Transcripcion, CostoLLM


async def create_candidato(db: AsyncSession, nombre: str):
    candidato = Candidato(nombre=nombre)
    db.add(candidato)
    await db.commit()
    await db.refresh(candidato)
    return candidato

async def get_candidatos(db: AsyncSession):
    result = await db.execute(select(Candidato))
    return result.scalars().all()

async def get_candidato(db: AsyncSession, candidato_id: int):
    result = await db.execute(select(Candidato).where(Candidato.id == candidato_id))
    return result.scalar_one_or_none()


async def create_vacante(db: AsyncSession, titulo: str, descripcion: str = None, requisitos_texto: str = None):
    vacante = Vacante(titulo=titulo, descripcion=descripcion, requisitos_texto=requisitos_texto)
    db.add(vacante)
    await db.commit()
    await db.refresh(vacante)
    return vacante

async def get_vacantes(db: AsyncSession):
    result = await db.execute(select(Vacante))
    return result.scalars().all()

async def get_vacante(db: AsyncSession, vacante_id: int):
    result = await db.execute(select(Vacante).where(Vacante.id == vacante_id))
    return result.scalar_one_or_none()

async def update_vacante_requisitos(db: AsyncSession, vacante_id: int, requisitos_texto: str):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        return None
    vacante.requisitos_texto = requisitos_texto
    # cambio de texto invalida la cache de extraccion estructurada
    vacante.requisitos_estructurados_json = None
    vacante.requisitos_texto_hash = None
    await db.commit()
    await db.refresh(vacante)
    return vacante


async def update_vacante_pesos(
    db: AsyncSession, vacante_id: int, pesos: dict | None
):
    """Persiste pesos custom o limpia (None vuelve al default)."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        return None
    vacante.pesos_json = pesos
    await db.commit()
    await db.refresh(vacante)
    return vacante


async def cache_requisitos_estructurados(
    db: AsyncSession, vacante_id: int, texto_hash: str, estructurados: dict
):
    """Persiste la extraccion del LLM como cache, indexada por hash del texto fuente."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        return None
    vacante.requisitos_texto_hash = texto_hash
    vacante.requisitos_estructurados_json = estructurados
    await db.commit()
    await db.refresh(vacante)
    return vacante


async def create_analisis(
    db: AsyncSession,
    candidato_id: int,
    vacante_id: int,
    puntaje_total: int,
    desglose: list,
    sentimiento_compound: float = None,
    cv_estructurado_json: dict | None = None,
    requisitos_snapshot_json: dict | None = None,
    soft_skills_json: dict | None = None,
    features_crudos_json: dict | None = None,
    pesos_aplicados_json: dict | None = None,
    skills_match: list | None = None,
    skills_faltantes: list | None = None,
):
    analisis = Analisis(
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=puntaje_total,
        desglose=[d if isinstance(d, dict) else d.model_dump() for d in desglose],
        sentimiento_compound=sentimiento_compound,
        cv_estructurado_json=cv_estructurado_json,
        requisitos_snapshot_json=requisitos_snapshot_json,
        soft_skills_json=soft_skills_json,
        features_crudos_json=features_crudos_json,
        pesos_aplicados_json=pesos_aplicados_json,
        skills_match=skills_match,
        skills_faltantes=skills_faltantes,
    )
    db.add(analisis)
    await db.commit()
    await db.refresh(analisis)
    return analisis


async def get_analisis_by_id(db: AsyncSession, analisis_id: int):
    result = await db.execute(select(Analisis).where(Analisis.id == analisis_id))
    return result.scalar_one_or_none()

async def get_analisis_por_vacante(db: AsyncSession, vacante_id: int):
    result = await db.execute(select(Analisis).where(Analisis.vacante_id == vacante_id))
    return result.scalars().all()

async def get_analisis(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Analisis).offset(skip).limit(limit))
    return result.scalars().all()

async def search_candidatos(db: AsyncSession, nombre: str):
    result = await db.execute(
        select(Candidato).where(Candidato.nombre.ilike(f"%{nombre}%"))
    )
    return result.scalars().all()

async def get_ranking_por_vacante(db: AsyncSession, vacante_id: int):
    result = await db.execute(
        select(Analisis, Candidato)
        .join(Candidato, Analisis.candidato_id == Candidato.id)
        .where(Analisis.vacante_id == vacante_id)
        .order_by(desc(Analisis.puntaje_total))
    )
    return result.all()


async def crear_transcripciones_lote(
    db: AsyncSession,
    segmentos: list[dict],
    audio_path: str,
    analisis_id: int | None = None,
) -> int:
    """Persiste un lote de segmentos transcritos. Devuelve cuantos se insertaron."""
    if not segmentos:
        return 0
    objetos = [
        Transcripcion(
            analisis_id=analisis_id,
            archivo=audio_path,
            inicio=seg.get("inicio_str") or _formato_tiempo(seg.get("inicio")),
            fin=seg.get("fin_str") or _formato_tiempo(seg.get("fin")),
            hablante=int(seg["hablante"]) if seg.get("hablante") is not None else None,
            texto=seg.get("texto", ""),
            sentimiento_neg=seg.get("sentimiento_neg"),
            sentimiento_neu=seg.get("sentimiento_neu"),
            sentimiento_pos=seg.get("sentimiento_pos"),
            sentimiento_compound=seg.get("sentimiento_compound"),
        )
        for seg in segmentos
    ]
    db.add_all(objetos)
    await db.commit()
    return len(objetos)


async def get_transcripciones_por_analisis(db: AsyncSession, analisis_id: int):
    result = await db.execute(
        select(Transcripcion)
        .where(Transcripcion.analisis_id == analisis_id)
        .order_by(Transcripcion.id)
    )
    return result.scalars().all()


async def crear_costos_llm_lote(
    db: AsyncSession, eventos: list[dict], analisis_id: int | None
) -> int:
    """Persiste un lote de UsageEvent (cada uno como dict via to_dict())."""
    if not eventos:
        return 0
    objetos = [
        CostoLLM(
            analisis_id=analisis_id,
            provider=e.get("provider"),
            model=e.get("model"),
            operacion=e.get("operacion"),
            tokens_input=e.get("tokens_input", 0),
            tokens_output=e.get("tokens_output", 0),
            tokens_cache_read=e.get("tokens_cache_read", 0),
            tokens_cache_creation=e.get("tokens_cache_creation", 0),
            duracion_ms=e.get("duracion_ms", 0.0),
            costo_usd=e.get("costo_usd", 0.0),
        )
        for e in eventos
    ]
    db.add_all(objetos)
    await db.commit()
    return len(objetos)


async def get_costos_por_analisis(db: AsyncSession, analisis_id: int):
    result = await db.execute(
        select(CostoLLM).where(CostoLLM.analisis_id == analisis_id).order_by(CostoLLM.id)
    )
    return result.scalars().all()


async def get_costo_total_vacante(db: AsyncSession, vacante_id: int) -> dict:
    """Suma costos de todos los analisis de una vacante."""
    result = await db.execute(
        select(
            sql_func.coalesce(sql_func.sum(CostoLLM.costo_usd), 0.0),
            sql_func.count(CostoLLM.id),
        )
        .join(Analisis, Analisis.id == CostoLLM.analisis_id)
        .where(Analisis.vacante_id == vacante_id)
    )
    total, n = result.one()
    return {"costo_usd": float(total), "llamadas_llm": int(n)}


def _formato_tiempo(segundos: float | None) -> str | None:
    if segundos is None:
        return None
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    segs = segundos % 60
    return f"{horas:02d}:{minutos:02d}:{segs:06.3f}"
