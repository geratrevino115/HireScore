import os
import uuid
import json
import requests
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import AnalisisRead
from db.crud import create_analisis, get_analisis_por_vacante, get_analisis, get_vacante
from handlers.cvs.parsers.cv_reader import extract_text
from handlers.scoring.scorer import calcular_score

router = APIRouter(prefix="/analyses", tags=["Analisis"])

CV_FOLDER = "data/cv_data"
AUDIO_FOLDER = "data/audio_data"
OLLAMA_URL = "http://localhost:11434/api/generate"

KEYPOINTS_PROMPT = (
    "Por favor, organiza la respuesta en un JSON con las siguientes claves: "
    "-datos_personales - resumen - experiencia_tecnica - proyectos_relevantes "
    "- educacion - certificaciones - sistema_categorizacion_skills, "
    "Limitate a unicamente contestar con el archivo json"
)


def _extract_cv_json(texto: str, modelo: str = "llama3.2") -> dict:
    combined = f"{KEYPOINTS_PROMPT}\n{texto}"
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": modelo, "prompt": combined, "stream": False},
            timeout=120,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "{}")
        # Limpiar posibles backticks de markdown
        import re
        raw = re.sub(r'```(?:json)?', '', raw).strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return {}


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

    # Guardar CV en disco
    os.makedirs(CV_FOLDER, exist_ok=True)
    ext = os.path.splitext(cv_file.filename)[1].lower()
    if ext not in (".pdf", ".docx"):
        raise HTTPException(status_code=400, detail="El CV debe ser PDF o DOCX")
    cv_path = os.path.join(CV_FOLDER, f"{uuid.uuid4()}{ext}")
    with open(cv_path, "wb") as f:
        f.write(await cv_file.read())

    # Extraer texto del CV
    try:
        texto_cv = extract_text(cv_path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el CV: {e}")

    # Estructurar CV con Ollama
    cv_json = _extract_cv_json(texto_cv)

    # Calcular score comparando CV vs requisitos de la vacante
    resultado = calcular_score(cv_json, vacante.requisitos_texto or "")

    # Procesar audio si se proporcionó
    sentimiento_compound = None
    if audio_file and audio_file.filename:
        try:
            os.makedirs(AUDIO_FOLDER, exist_ok=True)
            audio_ext = os.path.splitext(audio_file.filename)[1].lower()
            audio_path = os.path.join(AUDIO_FOLDER, f"{uuid.uuid4()}{audio_ext}")
            with open(audio_path, "wb") as f:
                f.write(await audio_file.read())

            from handlers.interview.transcriptor import transcribir_con_identificacion, guardar_transcripcion_sqlite
            from handlers.interview.analisis_sentimiento import analizar_base_datos

            segmentos = transcribir_con_identificacion(audio_path)
            if segmentos:
                guardar_transcripcion_sqlite(segmentos, audio_path)
                db_path = f"handlers/interview/outputs/{os.path.splitext(os.path.basename(audio_path))[0]}.db"
                analizar_base_datos(db_path)

                import sqlite3
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                try:
                    cursor.execute("SELECT AVG(sentimiento_compound) FROM transcripciones")
                    row = cursor.fetchone()
                    if row and row[0] is not None:
                        sentimiento_compound = float(row[0])
                except Exception:
                    pass
                finally:
                    conn.close()
        except Exception:
            pass  # El audio es opcional; no fallar si hay error

    # Guardar análisis en BD
    analisis = await create_analisis(
        db,
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=resultado["puntaje_total"],
        desglose=resultado["desglose"],
        sentimiento_compound=sentimiento_compound,
    )
    return analisis


@router.get("/", response_model=list[AnalisisRead])
async def list_analisis(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_analisis(db, skip, limit)


@router.get("/vacante/{vacante_id}", response_model=list[AnalisisRead])
async def list_analisis_por_vacante(vacante_id: int, db: AsyncSession = Depends(get_db)):
    return await get_analisis_por_vacante(db, vacante_id)
