import os
import uuid
import hashlib
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db, AsyncSessionLocal
from api.schemas import AnalisisRead, JobStatus, CostoLLMRead, CostoAnalisisResumen, ExplicacionAnalisis, DesglosePuntaje
from db.crud import (
    create_analisis,
    get_analisis_por_vacante,
    get_analisis,
    get_analisis_by_id,
    get_vacante,
    get_candidato,
    cache_requisitos_estructurados,
    crear_transcripciones_lote,
    crear_costos_llm_lote,
    get_costos_por_analisis,
)
from handlers.cvs.parsers.cv_reader import extract_text
from handlers.scoring.scorer import calcular_score
from handlers.scoring.weights import PesosScoring
from handlers.llm import get_llm_provider
from handlers.llm.base import LLMError
from handlers.llm.schemas import SoftSkillsResult, RequisitosEstructurados
from handlers.observability import (
    get_logger,
    log_event,
    start_collection,
    stop_collection,
    costo_total,
)

_log = get_logger("analyses")

router = APIRouter(prefix="/analyses", tags=["Analisis"])

CV_FOLDER = "data/cv_data"
AUDIO_FOLDER = "data/audio_data"

_jobs: dict[str, dict] = {}


def _procesar_audio_sync(audio_path: str) -> tuple[Optional[float], Optional[str], list[dict]]:
    """Pipeline pesado de audio: transcribe, diariza y anota sentimiento.

    Es sincrono y bloqueante (Whisper + pyannote). Se invoca via asyncio.to_thread
    desde el handler async para no bloquear el event loop.
    Devuelve (sentimiento_promedio, transcripcion_completa, segmentos_anotados).
    """
    try:
        from handlers.interview.transcriptor import transcribir_con_identificacion
        from handlers.interview.analisis_sentimiento import (
            anotar_sentimiento_segmentos,
            sentimiento_promedio,
        )

        segmentos = transcribir_con_identificacion(audio_path)
        if not segmentos:
            return None, None, []

        segmentos = anotar_sentimiento_segmentos(segmentos)
        sentimiento = sentimiento_promedio(segmentos)
        transcripcion = "\n".join(s.get("texto", "") for s in segmentos)
        return sentimiento, transcripcion, segmentos
    except Exception as e:
        log_event(_log, "ERROR", "audio.error", error=str(e), error_tipo=type(e).__name__)
        return None, None, []


async def _procesar_audio(audio_path: str) -> tuple[Optional[float], Optional[str], list[dict]]:
    """Wrapper async del pipeline de audio. Corre en thread pool."""
    return await asyncio.to_thread(_procesar_audio_sync, audio_path)


async def _evaluar_soft_skills(transcripcion: Optional[str]) -> Optional[SoftSkillsResult]:
    if not transcripcion or not transcripcion.strip():
        return None
    try:
        provider = get_llm_provider()
        return await provider.evaluate_soft_skills(transcripcion)
    except LLMError:
        return None


def _hash_texto(texto: str) -> str:
    return hashlib.sha256((texto or "").encode("utf-8")).hexdigest()


async def _obtener_requisitos_estructurados(
    vacante,
    requisitos_texto: str,
) -> RequisitosEstructurados:
    """Usa cache en BD si el hash del texto coincide; si no, re-extrae y persiste."""
    provider = get_llm_provider()
    texto_hash = _hash_texto(requisitos_texto or "")

    cached_hash = getattr(vacante, "requisitos_texto_hash", None)
    cached_json = getattr(vacante, "requisitos_estructurados_json", None)
    if cached_hash == texto_hash and cached_json:
        log_event(_log, "INFO", "requisitos.cache_hit", vacante_id=vacante.id)
        return RequisitosEstructurados.model_validate(cached_json)

    log_event(_log, "INFO", "requisitos.cache_miss", vacante_id=vacante.id)
    requisitos = await provider.extract_requisitos(requisitos_texto or "")
    async with AsyncSessionLocal() as db:
        await cache_requisitos_estructurados(
            db, vacante.id, texto_hash, requisitos.model_dump()
        )
    return requisitos


async def _ejecutar_pipeline(
    cv_path: str,
    audio_path: Optional[str],
    vacante,
    candidato_id: int | None = None,
    vacante_id: int | None = None,
):
    eventos_uso = start_collection()
    provider = get_llm_provider()

    texto_cv = extract_text(cv_path)
    cv = await provider.extract_cv(texto_cv)
    requisitos = await _obtener_requisitos_estructurados(vacante, vacante.requisitos_texto or "")
    contexto = {"cv": cv, "requisitos": requisitos, "soft": None}

    sentimiento = None
    soft = None
    segmentos: list[dict] = []
    if audio_path:
        sentimiento, transcripcion, segmentos = await _procesar_audio(audio_path)
        soft = await _evaluar_soft_skills(transcripcion)
        contexto["soft"] = soft

    pesos_custom = None
    pesos_dict = getattr(vacante, "pesos_json", None)
    if pesos_dict:
        try:
            pesos_custom = PesosScoring(**pesos_dict)
        except ValueError as e:
            log_event(_log, "WARN", "pesos.custom_invalidos", vacante_id=vacante_id, error=str(e))

    resultado = calcular_score(
        cv=cv,
        requisitos=requisitos,
        soft_skills=soft,
        sentimiento_compound=sentimiento,
        pesos=pesos_custom,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
    )
    stop_collection()
    return resultado, sentimiento, segmentos, eventos_uso, contexto


async def _persistir_transcripciones(
    db: AsyncSession, segmentos: list[dict], audio_path: str, analisis_id: int
) -> None:
    if not segmentos:
        return
    try:
        n = await crear_transcripciones_lote(db, segmentos, audio_path, analisis_id)
        log_event(_log, "INFO", "transcripciones.persisted", analisis_id=analisis_id, count=n)
    except Exception as e:
        log_event(
            _log, "ERROR", "transcripciones.persist_error",
            analisis_id=analisis_id, error=str(e), error_tipo=type(e).__name__,
        )


async def _persistir_costos(
    db: AsyncSession, eventos_uso: list, analisis_id: int
) -> None:
    if not eventos_uso:
        return
    total = costo_total(eventos_uso)
    try:
        n = await crear_costos_llm_lote(
            db, [e.to_dict() for e in eventos_uso], analisis_id,
        )
        log_event(
            _log, "INFO", "costos.persisted",
            analisis_id=analisis_id, llamadas=n, costo_usd=total,
        )
    except Exception as e:
        log_event(
            _log, "ERROR", "costos.persist_error",
            analisis_id=analisis_id, error=str(e), error_tipo=type(e).__name__,
        )


async def _pipeline_async(
    job_id: str,
    cv_path: str,
    audio_path: Optional[str],
    candidato_id: int,
    vacante_id: int,
):
    try:
        async with AsyncSessionLocal() as db_lookup:
            vacante = await get_vacante(db_lookup, vacante_id)
            if not vacante:
                raise RuntimeError(f"Vacante {vacante_id} desaparecio durante el job")
        resultado, sentimiento, segmentos, eventos_uso, contexto = await _ejecutar_pipeline(
            cv_path, audio_path, vacante,
            candidato_id=candidato_id, vacante_id=vacante_id,
        )
        async with AsyncSessionLocal() as db:
            analisis = await create_analisis(
                db,
                candidato_id=candidato_id,
                vacante_id=vacante_id,
                puntaje_total=resultado.puntaje_total,
                desglose=[d.model_dump() for d in resultado.desglose],
                sentimiento_compound=sentimiento,
                cv_estructurado_json=contexto["cv"].model_dump() if contexto.get("cv") else None,
                requisitos_snapshot_json=contexto["requisitos"].model_dump() if contexto.get("requisitos") else None,
                soft_skills_json=contexto["soft"].model_dump() if contexto.get("soft") else None,
                features_crudos_json=resultado.features_crudos,
                pesos_aplicados_json=resultado.pesos_usados,
                skills_match=resultado.skills_match,
                skills_faltantes=resultado.skills_faltantes,
            )
            if segmentos and audio_path:
                await _persistir_transcripciones(db, segmentos, audio_path, analisis.id)
            await _persistir_costos(db, eventos_uso, analisis.id)
            _jobs[job_id] = {
                "status": "completado",
                "resultado": AnalisisRead.model_validate(analisis),
                "error": None,
            }
    except Exception as e:
        _jobs[job_id] = {"status": "error", "resultado": None, "error": str(e)}


async def _save_upload(file: UploadFile, folder: str, allowed: list[str]) -> str:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Extension {ext} no permitida")
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{uuid.uuid4()}{ext}")
    with open(path, "wb") as f:
        f.write(await file.read())
    return path


@router.post("/procesar", response_model=AnalisisRead)
async def procesar_analisis(
    cv_file: UploadFile = File(...),
    audio_file: UploadFile = File(None),
    candidato_id: int = Form(...),
    vacante_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    candidato = await get_candidato(db, candidato_id)
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")

    cv_path = await _save_upload(cv_file, CV_FOLDER, [".pdf", ".docx"])

    audio_path = None
    if audio_file and audio_file.filename:
        audio_path = await _save_upload(audio_file, AUDIO_FOLDER, [".wav", ".mp3", ".ogg", ".m4a", ".flac"])

    try:
        resultado, sentimiento, segmentos, eventos_uso, contexto = await _ejecutar_pipeline(
            cv_path, audio_path, vacante,
            candidato_id=candidato_id, vacante_id=vacante_id,
        )
    except LLMError as e:
        raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo procesar el analisis: {e}")

    analisis = await create_analisis(
        db,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=resultado.puntaje_total,
        desglose=[d.model_dump() for d in resultado.desglose],
        sentimiento_compound=sentimiento,
        cv_estructurado_json=contexto["cv"].model_dump() if contexto.get("cv") else None,
        requisitos_snapshot_json=contexto["requisitos"].model_dump() if contexto.get("requisitos") else None,
        soft_skills_json=contexto["soft"].model_dump() if contexto.get("soft") else None,
        features_crudos_json=resultado.features_crudos,
        pesos_aplicados_json=resultado.pesos_usados,
        skills_match=resultado.skills_match,
        skills_faltantes=resultado.skills_faltantes,
    )
    if segmentos and audio_path:
        await _persistir_transcripciones(db, segmentos, audio_path, analisis.id)
    await _persistir_costos(db, eventos_uso, analisis.id)
    return analisis


@router.post("/procesar-async", response_model=JobStatus)
async def procesar_analisis_async(
    background_tasks: BackgroundTasks,
    cv_file: UploadFile = File(...),
    audio_file: UploadFile = File(None),
    candidato_id: int = Form(...),
    vacante_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    candidato = await get_candidato(db, candidato_id)
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")

    cv_path = await _save_upload(cv_file, CV_FOLDER, [".pdf", ".docx"])

    audio_path = None
    if audio_file and audio_file.filename:
        audio_path = await _save_upload(audio_file, AUDIO_FOLDER, [".wav", ".mp3", ".ogg", ".m4a", ".flac"])

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "procesando", "resultado": None, "error": None}

    background_tasks.add_task(
        _pipeline_async,
        job_id=job_id,
        cv_path=cv_path,
        audio_path=audio_path,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
    )

    return JobStatus(job_id=job_id, status="procesando")


@router.get("/job/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return JobStatus(job_id=job_id, **job)


@router.get("/{analisis_id}/explicacion", response_model=ExplicacionAnalisis)
async def get_explicacion(analisis_id: int, db: AsyncSession = Depends(get_db)):
    """Devuelve la explicacion completa de un puntaje: features, pesos,
    skills cubiertos, evidencias soft skills, snapshot CV/requisitos.
    Pensado para clientes finales que pidan justificacion del score."""
    analisis = await get_analisis_by_id(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Analisis no encontrado")
    return ExplicacionAnalisis(
        analisis_id=analisis.id,
        puntaje_total=analisis.puntaje_total,
        desglose=[DesglosePuntaje.model_validate(d) for d in (analisis.desglose or [])],
        features_crudos=analisis.features_crudos_json,
        pesos_aplicados=analisis.pesos_aplicados_json,
        skills_match=analisis.skills_match or [],
        skills_faltantes=analisis.skills_faltantes or [],
        cv_estructurado=analisis.cv_estructurado_json,
        requisitos=analisis.requisitos_snapshot_json,
        soft_skills=analisis.soft_skills_json,
        sentimiento_compound=analisis.sentimiento_compound,
    )


@router.get("/{analisis_id}/costo", response_model=CostoAnalisisResumen)
async def get_costo_analisis(analisis_id: int, db: AsyncSession = Depends(get_db)):
    rows = await get_costos_por_analisis(db, analisis_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Sin costos registrados para ese analisis")
    llamadas = [CostoLLMRead.model_validate(r) for r in rows]
    return CostoAnalisisResumen(
        analisis_id=analisis_id,
        costo_usd_total=round(sum(l.costo_usd for l in llamadas), 6),
        llamadas=llamadas,
    )


@router.get("/", response_model=list[AnalisisRead])
async def list_analisis(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    return await get_analisis(db, skip, limit)


@router.get("/vacante/{vacante_id}", response_model=list[AnalisisRead])
async def list_analisis_por_vacante(
    vacante_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    return await get_analisis_por_vacante(db, vacante_id)
