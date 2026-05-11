"""Endpoints del pipeline candidato-vacante (Aplicacion)."""
import asyncio
import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.crud import (
    get_aplicacion,
    get_aplicaciones_por_vacante,
    get_ultimo_analisis_de_aplicacion,
    update_etapa_aplicacion,
    update_notas_aplicacion,
    get_resumen_pipeline_vacante,
    get_vacante,
    crear_transcripciones_lote,
)
from db.models import ETAPAS_APLICACION
from api.schemas import (
    AplicacionRead,
    AplicacionConCandidato,
    AplicacionUpdateEtapa,
    AplicacionUpdateNotas,
    PipelineResumen,
    ResultadoAudioEvaluacion,
)
from handlers.llm import get_llm_provider
from handlers.llm.base import LLMError
from handlers.llm.schemas import CVEstructurado, RequisitosEstructurados
from handlers.observability import get_logger, log_event
from api.endpoints.analyses import _procesar_audio

_log = get_logger("aplicaciones")

AUDIO_FOLDER = "data/audio_data"


router = APIRouter(tags=["Aplicaciones"])


@router.get(
    "/vacancies/{vacante_id}/aplicaciones",
    response_model=list[AplicacionConCandidato],
)
async def listar_aplicaciones_de_vacante(
    vacante_id: int,
    etapa: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Workspace de la vacante: lista de aplicantes con datos del candidato
    y resumen del ultimo analisis. Filtra por etapa si se pasa el query
    param `?etapa=shortlist`."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    if etapa is not None and etapa not in ETAPAS_APLICACION:
        raise HTTPException(
            status_code=422,
            detail=f"Etapa invalida. Validas: {', '.join(ETAPAS_APLICACION)}",
        )

    filas = await get_aplicaciones_por_vacante(db, vacante_id)
    salida = []
    for aplicacion, candidato, analisis in filas:
        if etapa and aplicacion.etapa != etapa:
            continue
        salida.append(
            AplicacionConCandidato(
                aplicacion_id=aplicacion.id,
                vacante_id=aplicacion.vacante_id,
                candidato_id=candidato.id,
                candidato_nombre=candidato.nombre,
                candidato_email=candidato.email,
                etapa=aplicacion.etapa,
                notas=aplicacion.notas,
                fecha_aplicacion=aplicacion.fecha_aplicacion,
                ultimo_analisis_id=analisis.id if analisis else None,
                puntaje_total=analisis.puntaje_total if analisis else None,
                sentimiento_compound=(
                    analisis.sentimiento_compound if analisis else None
                ),
            )
        )
    return salida


@router.get(
    "/vacancies/{vacante_id}/pipeline",
    response_model=PipelineResumen,
)
async def resumen_pipeline_vacante(
    vacante_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Conteo de aplicaciones por etapa. Util para el header del workspace
    y para mostrar el progreso del funnel."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    counts = await get_resumen_pipeline_vacante(db, vacante_id)
    total = sum(counts.values())
    return PipelineResumen(vacante_id=vacante_id, counts=counts, total=total)


@router.get("/aplicaciones/{aplicacion_id}", response_model=AplicacionRead)
async def get_aplicacion_by_id(
    aplicacion_id: int, db: AsyncSession = Depends(get_db)
):
    aplicacion = await get_aplicacion(db, aplicacion_id)
    if not aplicacion:
        raise HTTPException(status_code=404, detail="Aplicacion no encontrada")
    return aplicacion


@router.patch("/aplicaciones/{aplicacion_id}/etapa", response_model=AplicacionRead)
async def cambiar_etapa(
    aplicacion_id: int,
    body: AplicacionUpdateEtapa,
    db: AsyncSession = Depends(get_db),
):
    """Mueve la aplicacion en el pipeline. Etapas validas:
    nueva, en_revision, shortlist, entrevista, oferta, rechazada."""
    if body.etapa not in ETAPAS_APLICACION:
        raise HTTPException(
            status_code=422,
            detail=f"Etapa invalida. Validas: {', '.join(ETAPAS_APLICACION)}",
        )
    try:
        aplicacion = await update_etapa_aplicacion(db, aplicacion_id, body.etapa)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not aplicacion:
        raise HTTPException(status_code=404, detail="Aplicacion no encontrada")
    return aplicacion


@router.patch("/aplicaciones/{aplicacion_id}/notas", response_model=AplicacionRead)
async def actualizar_notas(
    aplicacion_id: int,
    body: AplicacionUpdateNotas,
    db: AsyncSession = Depends(get_db),
):
    aplicacion = await update_notas_aplicacion(db, aplicacion_id, body.notas)
    if not aplicacion:
        raise HTTPException(status_code=404, detail="Aplicacion no encontrada")
    return aplicacion


@router.post(
    "/aplicaciones/{aplicacion_id}/audio",
    response_model=ResultadoAudioEvaluacion,
)
async def subir_audio_aplicacion(
    aplicacion_id: int,
    audio_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Sube audio de entrevista, transcribe, evalua cobertura/consistencia/profundidad
    con el LLM y persiste los resultados en el Analisis de esta Aplicacion."""
    aplicacion = await get_aplicacion(db, aplicacion_id)
    if not aplicacion:
        raise HTTPException(status_code=404, detail="Aplicacion no encontrada")

    analisis = await get_ultimo_analisis_de_aplicacion(db, aplicacion_id)
    if not analisis:
        raise HTTPException(
            status_code=422,
            detail="La aplicacion no tiene ningun analisis previo. Sube primero el CV.",
        )

    # Guardar audio
    ext = os.path.splitext(audio_file.filename or "audio.wav")[1].lower() or ".wav"
    allowed = {".wav", ".mp3", ".ogg", ".m4a", ".flac"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Extension {ext} no permitida")
    os.makedirs(AUDIO_FOLDER, exist_ok=True)
    audio_path = os.path.join(AUDIO_FOLDER, f"{uuid.uuid4()}{ext}")
    with open(audio_path, "wb") as f:
        f.write(await audio_file.read())

    # Transcripcion + diarizacion + sentimiento (bloqueante → thread pool)
    sentimiento, transcripcion, segmentos = await _procesar_audio(audio_path)

    evaluacion_dict: Optional[dict] = None
    if transcripcion and transcripcion.strip():
        # Evaluar entrevista con LLM si tenemos snapshot de CV y requisitos
        if analisis.cv_estructurado_json and analisis.requisitos_snapshot_json:
            try:
                cv = CVEstructurado.model_validate(analisis.cv_estructurado_json)
                requisitos = RequisitosEstructurados.model_validate(
                    analisis.requisitos_snapshot_json
                )
                provider = get_llm_provider()
                evaluacion = await provider.evaluate_interview(transcripcion, cv, requisitos)
                evaluacion_dict = evaluacion.model_dump()
            except (LLMError, Exception) as e:
                log_event(
                    _log,
                    "WARN",
                    "evaluacion_entrevista.skip",
                    analisis_id=analisis.id,
                    error=str(e),
                    error_tipo=type(e).__name__,
                )
        else:
            log_event(
                _log,
                "WARN",
                "evaluacion_entrevista.sin_snapshot",
                analisis_id=analisis.id,
            )

    # Persistir transcripciones
    n_segmentos = 0
    if segmentos:
        try:
            n_segmentos = await crear_transcripciones_lote(
                db, segmentos, audio_path, analisis.id
            )
        except Exception as e:
            log_event(_log, "ERROR", "transcripciones.error", analisis_id=analisis.id, error=str(e))

    # Actualizar analisis con evaluacion y sentimiento
    if evaluacion_dict is not None:
        analisis.evaluacion_entrevista_json = evaluacion_dict
    if sentimiento is not None:
        analisis.sentimiento_compound = sentimiento
    await db.commit()
    await db.refresh(analisis)

    return ResultadoAudioEvaluacion(
        aplicacion_id=aplicacion_id,
        analisis_id=analisis.id,
        evaluacion_entrevista=analisis.evaluacion_entrevista_json,
        sentimiento_compound=analisis.sentimiento_compound,
        n_segmentos=n_segmentos,
    )
