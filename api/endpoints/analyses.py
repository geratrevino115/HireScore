import os
import uuid
import hashlib
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db, AsyncSessionLocal
from api.schemas import (
    AnalisisRead,
    AplicacionRead,
    JobStatus,
    CostoLLMRead,
    CostoAnalisisResumen,
    ExplicacionAnalisis,
    DesglosePuntaje,
    ProcesarResultado,
)
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
    find_or_create_candidato,
    get_or_create_aplicacion,
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


async def _generar_preguntas_cv_best_effort(cv, requisitos) -> Optional[list[dict]]:
    """Genera preguntas personalizadas al CV. Best-effort: si el LLM falla,
    el análisis sigue siendo válido y devolvemos None."""
    try:
        provider = get_llm_provider()
        resultado = await provider.generate_questions_from_cv(cv, requisitos)
        return [p.model_dump() for p in resultado.preguntas]
    except Exception as e:
        log_event(
            _log,
            "WARN",
            "preguntas_cv.skip",
            error=str(e),
            error_tipo=type(e).__name__,
        )
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


async def _extraer_cv(cv_path: str):
    """Primer tramo del pipeline: solo extract_text + extract_cv via LLM.
    Es lo unico necesario para deduplicar candidatos por email antes de
    ejecutar el resto del scoring. El caller debe haber llamado
    start_collection() antes para que los tokens de esta llamada cuenten."""
    provider = get_llm_provider()
    texto_cv = extract_text(cv_path)
    cv = await provider.extract_cv(texto_cv)
    return cv


async def _completar_pipeline(
    cv,
    audio_path: Optional[str],
    vacante,
    candidato_id: int | None = None,
    vacante_id: int | None = None,
):
    """Segundo tramo del pipeline: requisitos, audio, soft skills, scoring.
    Asume que el collector de eventos ya esta activo."""
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

    # Best-effort: preguntas personalizadas al CV. Si falla, no rompe el analisis.
    contexto["preguntas_cv"] = await _generar_preguntas_cv_best_effort(cv, requisitos)

    return resultado, sentimiento, segmentos, contexto


async def _resolver_candidato(
    db: AsyncSession,
    candidato_id: Optional[int],
    cv,
):
    """Resuelve qué candidato usar para esta aplicación.
    - Si viene candidato_id explicito: lo usa (lookup + 404 si no existe).
    - Si no viene: dedupe por email extraido del CV. Si no hay email en el
      CV, crea un candidato nuevo con el nombre extraido (sin posibilidad
      de dedupe — cada subida sera un candidato distinto)."""
    if candidato_id is not None:
        candidato = await get_candidato(db, candidato_id)
        if not candidato:
            raise HTTPException(status_code=404, detail="Candidato no encontrado")
        return candidato, False

    datos = getattr(cv, "datos_personales", None)
    nombre = (getattr(datos, "nombre", None) or "").strip() if datos else ""
    email = (getattr(datos, "email", None) or "").strip() if datos else ""
    telefono = (getattr(datos, "telefono", None) or "").strip() if datos else ""

    candidato, fue_creado = await find_or_create_candidato(
        db,
        nombre=nombre or "(sin nombre)",
        email=email or None,
        telefono=telefono or None,
    )
    log_event(
        _log,
        "INFO",
        "candidato.dedupe" if not fue_creado else "candidato.creado",
        candidato_id=candidato.id,
        email_match=bool(email and not fue_creado),
    )
    return candidato, fue_creado


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
    candidato_id: Optional[int],
    vacante_id: int,
):
    try:
        async with AsyncSessionLocal() as db_lookup:
            vacante = await get_vacante(db_lookup, vacante_id)
            if not vacante:
                raise RuntimeError(f"Vacante {vacante_id} desaparecio durante el job")

        eventos_uso = start_collection()
        try:
            # Paso 1: extraer CV (necesario para obtener email del dedupe)
            cv = await _extraer_cv(cv_path)

            # Paso 2: resolver candidato + aplicacion
            async with AsyncSessionLocal() as db:
                candidato, fue_creado = await _resolver_candidato(db, candidato_id, cv)
                aplicacion, _ = await get_or_create_aplicacion(db, vacante_id, candidato.id)

            # Paso 3: completar pipeline (requisitos + audio + scoring)
            resultado, sentimiento, segmentos, contexto = await _completar_pipeline(
                cv, audio_path, vacante,
                candidato_id=candidato.id, vacante_id=vacante_id,
            )
        finally:
            stop_collection()

        # Paso 4: persistir analisis + costos
        async with AsyncSessionLocal() as db:
            analisis = await create_analisis(
                db,
                candidato_id=candidato.id,
                vacante_id=vacante_id,
                aplicacion_id=aplicacion.id,
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
                preguntas_cv_json=contexto.get("preguntas_cv"),
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


@router.post("/procesar", response_model=ProcesarResultado)
async def procesar_analisis(
    cv_file: UploadFile = File(...),
    audio_file: UploadFile = File(None),
    candidato_id: Optional[int] = Form(None),
    vacante_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Procesa un CV contra una vacante. Si no se pasa candidato_id, dedupe
    automatico por email extraido del CV. Devuelve la Aplicacion (en etapa
    'nueva' si es primera vez) y el Analisis con su score."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    cv_path = await _save_upload(cv_file, CV_FOLDER, [".pdf", ".docx"])

    audio_path = None
    if audio_file and audio_file.filename:
        audio_path = await _save_upload(audio_file, AUDIO_FOLDER, [".wav", ".mp3", ".ogg", ".m4a", ".flac"])

    eventos_uso = start_collection()
    try:
        try:
            cv = await _extraer_cv(cv_path)
        except LLMError as e:
            raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"No se pudo leer el CV: {e}")

        candidato, fue_creado = await _resolver_candidato(db, candidato_id, cv)
        aplicacion, _ = await get_or_create_aplicacion(db, vacante_id, candidato.id)

        try:
            resultado, sentimiento, segmentos, contexto = await _completar_pipeline(
                cv, audio_path, vacante,
                candidato_id=candidato.id, vacante_id=vacante_id,
            )
        except LLMError as e:
            raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"No se pudo procesar el analisis: {e}")
    finally:
        stop_collection()

    analisis = await create_analisis(
        db,
        candidato_id=candidato.id,
        vacante_id=vacante_id,
        aplicacion_id=aplicacion.id,
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
        preguntas_cv_json=contexto.get("preguntas_cv"),
    )
    if segmentos and audio_path:
        await _persistir_transcripciones(db, segmentos, audio_path, analisis.id)
    await _persistir_costos(db, eventos_uso, analisis.id)
    return ProcesarResultado(
        aplicacion=AplicacionRead.model_validate(aplicacion),
        analisis=AnalisisRead.model_validate(analisis),
        candidato_creado=fue_creado,
    )


@router.post("/procesar-async", response_model=JobStatus)
async def procesar_analisis_async(
    background_tasks: BackgroundTasks,
    cv_file: UploadFile = File(...),
    audio_file: UploadFile = File(None),
    candidato_id: Optional[int] = Form(None),
    vacante_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """Encola el procesamiento. candidato_id es opcional: si se omite, dedupe
    automatico por email durante el job."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    if candidato_id is not None:
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
        preguntas_cv=analisis.preguntas_cv_json,
        evaluacion_entrevista=analisis.evaluacion_entrevista_json,
    )


@router.post("/{analisis_id}/preguntas-cv", response_model=ExplicacionAnalisis)
async def regenerar_preguntas_cv(
    analisis_id: int, db: AsyncSession = Depends(get_db)
):
    """Regenera las preguntas personalizadas al CV de este analisis.
    Util cuando la generacion automatica fallo o quieres preguntas frescas.
    Reemplaza las anteriores."""
    from db.crud import get_analisis_by_id as _get
    analisis = await _get(db, analisis_id)
    if not analisis:
        raise HTTPException(status_code=404, detail="Analisis no encontrado")
    if not analisis.cv_estructurado_json or not analisis.requisitos_snapshot_json:
        raise HTTPException(
            status_code=422,
            detail="El analisis no tiene snapshot de CV o requisitos para generar preguntas.",
        )
    from handlers.llm.schemas import CVEstructurado as _CV, RequisitosEstructurados as _Req
    cv = _CV.model_validate(analisis.cv_estructurado_json)
    requisitos = _Req.model_validate(analisis.requisitos_snapshot_json)

    provider = get_llm_provider()
    start_collection()
    try:
        try:
            resultado = await provider.generate_questions_from_cv(cv, requisitos)
        except LLMError as e:
            raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
        analisis.preguntas_cv_json = [p.model_dump() for p in resultado.preguntas]
        await db.commit()
        await db.refresh(analisis)
    finally:
        stop_collection()

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
        preguntas_cv=analisis.preguntas_cv_json,
        evaluacion_entrevista=analisis.evaluacion_entrevista_json,
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
