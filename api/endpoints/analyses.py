import os
import uuid
import json
import re
import sqlite3
import requests
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db, AsyncSessionLocal
from api.schemas import AnalisisRead, JobStatus
from api.config import OLLAMA_URL, OLLAMA_MODEL
from db.crud import create_analisis, get_analisis_por_vacante, get_analisis, get_vacante, get_candidato
from handlers.cvs.parsers.cv_reader import extract_text
from handlers.scoring.scorer import calcular_score

router = APIRouter(prefix="/analyses", tags=["Analisis"])

CV_FOLDER = "data/cv_data"
AUDIO_FOLDER = "data/audio_data"

KEYPOINTS_PROMPT = (
    "Por favor, organiza la respuesta en un JSON con las siguientes claves: "
    "-datos_personales - resumen - experiencia_tecnica - proyectos_relevantes "
    "- educacion - certificaciones - sistema_categorizacion_skills, "
    "Limitate a unicamente contestar con el archivo json"
)

# Almacén en memoria de jobs asíncronos
_jobs: dict[str, dict] = {}


def _extract_cv_json(texto: str, modelo: str = OLLAMA_MODEL) -> dict:
    combined = f"{KEYPOINTS_PROMPT}\n{texto}"
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": modelo, "prompt": combined, "stream": False},
            timeout=120,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "{}")
        raw = re.sub(r'```(?:json)?', '', raw).strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return {}


def _procesar_audio(audio_path: str) -> Optional[float]:
    try:
        from handlers.interview.transcriptor import transcribir_con_identificacion, guardar_transcripcion_sqlite
        from handlers.interview.analisis_sentimiento import analizar_base_datos

        segmentos = transcribir_con_identificacion(audio_path)
        if not segmentos:
            return None

        guardar_transcripcion_sqlite(segmentos, audio_path)
        db_path = f"handlers/interview/outputs/{os.path.splitext(os.path.basename(audio_path))[0]}.db"
        analizar_base_datos(db_path)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT AVG(sentimiento_compound) FROM transcripciones")
            row = cursor.fetchone()
            return float(row[0]) if row and row[0] is not None else None
        finally:
            conn.close()
    except Exception:
        return None


async def _pipeline(
    job_id: str,
    cv_path: str,
    audio_path: Optional[str],
    candidato_id: int,
    vacante_id: int,
    requisitos_texto: str,
):
    try:
        texto_cv = extract_text(cv_path)
        cv_json = _extract_cv_json(texto_cv)
        resultado = calcular_score(cv_json, requisitos_texto)

        sentimiento_compound = None
        if audio_path:
            sentimiento_compound = _procesar_audio(audio_path)

        async with AsyncSessionLocal() as db:
            analisis = await create_analisis(
                db,
                candidato_id=candidato_id,
                vacante_id=vacante_id,
                puntaje_total=resultado["puntaje_total"],
                desglose=resultado["desglose"],
                sentimiento_compound=sentimiento_compound,
            )
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
        raise HTTPException(status_code=400, detail=f"Extensión {ext} no permitida")
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

    try:
        texto_cv = extract_text(cv_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el CV: {e}")

    cv_json = _extract_cv_json(texto_cv)
    resultado = calcular_score(cv_json, vacante.requisitos_texto or "")

    sentimiento_compound = None
    if audio_file and audio_file.filename:
        audio_path = await _save_upload(audio_file, AUDIO_FOLDER, [".wav", ".mp3", ".ogg", ".m4a", ".flac"])
        sentimiento_compound = _procesar_audio(audio_path)

    analisis = await create_analisis(
        db,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=resultado["puntaje_total"],
        desglose=resultado["desglose"],
        sentimiento_compound=sentimiento_compound,
    )
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
        _pipeline,
        job_id=job_id,
        cv_path=cv_path,
        audio_path=audio_path,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        requisitos_texto=vacante.requisitos_texto or "",
    )

    return JobStatus(job_id=job_id, status="procesando")


@router.get("/job/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return JobStatus(job_id=job_id, **job)


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
