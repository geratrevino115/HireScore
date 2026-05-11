from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from sqlalchemy import func as sql_func
from db.models import (
    Candidato,
    Vacante,
    Analisis,
    Transcripcion,
    CostoLLM,
    Aplicacion,
    GuiaEntrevista,
    ETAPAS_APLICACION,
)


async def create_candidato(
    db: AsyncSession,
    nombre: str,
    email: str | None = None,
    telefono: str | None = None,
):
    candidato = Candidato(nombre=nombre, email=email, telefono=telefono)
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


async def get_candidato_por_email(db: AsyncSession, email: str):
    """Lookup por email normalizado (lower + strip). Devuelve None si no existe."""
    if not email:
        return None
    norm = email.strip().lower()
    if not norm:
        return None
    result = await db.execute(
        select(Candidato).where(sql_func.lower(Candidato.email) == norm)
    )
    return result.scalar_one_or_none()


async def find_or_create_candidato(
    db: AsyncSession,
    nombre: str,
    email: str | None = None,
    telefono: str | None = None,
):
    """Dedupe por email. Si existe, actualiza nombre/teléfono si vienen vacios.
    Si no existe (o no hay email), crea uno nuevo."""
    if email and email.strip():
        existente = await get_candidato_por_email(db, email)
        if existente:
            cambios = False
            if not existente.nombre and nombre:
                existente.nombre = nombre
                cambios = True
            if not existente.telefono and telefono:
                existente.telefono = telefono
                cambios = True
            if cambios:
                await db.commit()
                await db.refresh(existente)
            return existente, False  # (candidato, fue_creado)
    nuevo = await create_candidato(db, nombre=nombre or "(sin nombre)", email=email, telefono=telefono)
    return nuevo, True


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
    aplicacion_id: int | None = None,
    preguntas_cv_json: list | None = None,
):
    analisis = Analisis(
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        aplicacion_id=aplicacion_id,
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
        preguntas_cv_json=preguntas_cv_json,
    )
    db.add(analisis)
    await db.commit()
    await db.refresh(analisis)
    return analisis


async def get_analisis_by_id(db: AsyncSession, analisis_id: int):
    result = await db.execute(select(Analisis).where(Analisis.id == analisis_id))
    return result.scalar_one_or_none()


async def get_ultimo_analisis_de_aplicacion(db: AsyncSession, aplicacion_id: int):
    """Devuelve el Analisis mas reciente asociado a una Aplicacion, o None."""
    result = await db.execute(
        select(Analisis)
        .where(Analisis.aplicacion_id == aplicacion_id)
        .order_by(desc(Analisis.id))
        .limit(1)
    )
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


# ---------------------------------------------------------------------------
# Aplicaciones (pipeline candidato-vacante)
# ---------------------------------------------------------------------------


async def get_aplicacion(db: AsyncSession, aplicacion_id: int):
    result = await db.execute(
        select(Aplicacion).where(Aplicacion.id == aplicacion_id)
    )
    return result.scalar_one_or_none()


async def get_aplicacion_por_vacante_candidato(
    db: AsyncSession, vacante_id: int, candidato_id: int
):
    result = await db.execute(
        select(Aplicacion).where(
            Aplicacion.vacante_id == vacante_id,
            Aplicacion.candidato_id == candidato_id,
        )
    )
    return result.scalar_one_or_none()


async def get_or_create_aplicacion(
    db: AsyncSession, vacante_id: int, candidato_id: int
):
    """Crea la aplicacion en etapa 'nueva' si no existe ya. Idempotente:
    re-procesar el CV del mismo candidato en la misma vacante reusa su
    Aplicacion existente."""
    existente = await get_aplicacion_por_vacante_candidato(db, vacante_id, candidato_id)
    if existente:
        return existente, False
    aplicacion = Aplicacion(
        vacante_id=vacante_id,
        candidato_id=candidato_id,
        etapa="nueva",
    )
    db.add(aplicacion)
    await db.commit()
    await db.refresh(aplicacion)
    return aplicacion, True


async def get_aplicaciones_por_vacante(db: AsyncSession, vacante_id: int):
    """Devuelve aplicaciones con datos del candidato y ultimo analisis (si hay).
    Cada fila: (Aplicacion, Candidato, Analisis | None)."""
    sub_ultimo_analisis = (
        select(
            Analisis.candidato_id,
            Analisis.vacante_id,
            sql_func.max(Analisis.id).label("ultimo_analisis_id"),
        )
        .where(Analisis.vacante_id == vacante_id)
        .group_by(Analisis.candidato_id, Analisis.vacante_id)
        .subquery()
    )
    result = await db.execute(
        select(Aplicacion, Candidato, Analisis)
        .join(Candidato, Aplicacion.candidato_id == Candidato.id)
        .join(
            sub_ultimo_analisis,
            (sub_ultimo_analisis.c.candidato_id == Aplicacion.candidato_id)
            & (sub_ultimo_analisis.c.vacante_id == Aplicacion.vacante_id),
            isouter=True,
        )
        .join(
            Analisis,
            Analisis.id == sub_ultimo_analisis.c.ultimo_analisis_id,
            isouter=True,
        )
        .where(Aplicacion.vacante_id == vacante_id)
        .order_by(desc(Aplicacion.fecha_aplicacion))
    )
    return result.all()


async def update_etapa_aplicacion(
    db: AsyncSession, aplicacion_id: int, etapa: str
):
    """Cambia la etapa del pipeline. Valida contra ETAPAS_APLICACION."""
    if etapa not in ETAPAS_APLICACION:
        raise ValueError(
            f"Etapa invalida: {etapa!r}. Validas: {ETAPAS_APLICACION}"
        )
    aplicacion = await get_aplicacion(db, aplicacion_id)
    if not aplicacion:
        return None
    aplicacion.etapa = etapa
    await db.commit()
    await db.refresh(aplicacion)
    return aplicacion


async def update_notas_aplicacion(
    db: AsyncSession, aplicacion_id: int, notas: str | None
):
    aplicacion = await get_aplicacion(db, aplicacion_id)
    if not aplicacion:
        return None
    aplicacion.notas = notas
    await db.commit()
    await db.refresh(aplicacion)
    return aplicacion


# ---------------------------------------------------------------------------
# Guía de entrevista
# ---------------------------------------------------------------------------


async def get_guia_entrevista(db: AsyncSession, vacante_id: int):
    result = await db.execute(
        select(GuiaEntrevista).where(GuiaEntrevista.vacante_id == vacante_id)
    )
    return result.scalar_one_or_none()


async def upsert_guia_entrevista(
    db: AsyncSession,
    vacante_id: int,
    preguntas: list[dict],
    criterios: list[str] | None,
    senales_alerta: list[str] | None,
):
    """Crea o reemplaza la guia de entrevista de una vacante."""
    existente = await get_guia_entrevista(db, vacante_id)
    if existente:
        existente.preguntas_json = preguntas
        existente.criterios_json = criterios or []
        existente.senales_alerta_json = senales_alerta or []
        existente.generada_en = datetime.now(timezone.utc)
        guia = existente
    else:
        guia = GuiaEntrevista(
            vacante_id=vacante_id,
            preguntas_json=preguntas,
            criterios_json=criterios or [],
            senales_alerta_json=senales_alerta or [],
        )
        db.add(guia)
    await db.commit()
    await db.refresh(guia)
    return guia


async def delete_guia_entrevista(db: AsyncSession, vacante_id: int) -> bool:
    guia = await get_guia_entrevista(db, vacante_id)
    if not guia:
        return False
    await db.delete(guia)
    await db.commit()
    return True


async def get_resumen_pipeline_vacante(db: AsyncSession, vacante_id: int) -> dict:
    """Cuenta de aplicaciones por etapa para una vacante. Devuelve dict
    con todas las etapas (las que no tienen aplicantes salen en 0)."""
    result = await db.execute(
        select(Aplicacion.etapa, sql_func.count(Aplicacion.id))
        .where(Aplicacion.vacante_id == vacante_id)
        .group_by(Aplicacion.etapa)
    )
    counts = {etapa: 0 for etapa in ETAPAS_APLICACION}
    for etapa, n in result.all():
        if etapa in counts:
            counts[etapa] = int(n)
    return counts
