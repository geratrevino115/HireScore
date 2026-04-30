from fastapi import APIRouter, File, UploadFile, HTTPException
import os
import shutil
import uuid

router = APIRouter(tags=["Uploads"])

# Directorios donde se guardarán los archivos
AUDIO_UPLOAD_FOLDER = "data/audio_data"
CV_UPLOAD_FOLDER = "data/cv_data"
REQUISITOS_UPLOAD_FOLDER = "data/req_data"

# Crear las carpetas si no existen
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CV_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REQUISITOS_UPLOAD_FOLDER, exist_ok=True)

def save_file(file: UploadFile, upload_folder: str, allowed_extensions: list):
    """
    Valida la extensión, genera un nombre único y guarda el archivo.
    """
    original_filename = file.filename
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Extensión {ext} no permitida.")
    
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_folder, unique_name)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al guardar el archivo.")
    finally:
        file.file.close()
    
    return unique_name, file_path

@router.post("/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    """
    Endpoint para subir archivos de audio con nombre único.
    """
    # Extensiones de audio permitidas
    allowed_audio_extensions = [".wav", ".mp3", ".ogg", ".m4a", ".flac"]
    unique_name, file_path = save_file(file, AUDIO_UPLOAD_FOLDER, allowed_audio_extensions)
    return {"mensaje": "Archivo de audio subido correctamente", "nombre": unique_name, "ruta": file_path}

@router.post("/upload/cv")
async def upload_cv(file: UploadFile = File(...)):
    """
    Endpoint para subir archivos de CV (PDF o DOCX) con nombre único.
    """
    # Extensiones permitidas para CV
    allowed_cv_extensions = [".pdf", ".docx"]
    unique_name, file_path = save_file(file, CV_UPLOAD_FOLDER, allowed_cv_extensions)
    return {"mensaje": "Archivo de CV subido correctamente", "nombre": unique_name, "ruta": file_path}

@router.post("/upload/requisitos")
async def upload_requisitos(file: UploadFile = File(...)):
    """
    Endpoint para subir archivos de requisitos (PDF o DOCX) con nombre único.
    """
    allowed_requisitos_extensions = [".pdf", ".docx"]
    unique_name, file_path = save_file(file, REQUISITOS_UPLOAD_FOLDER, allowed_requisitos_extensions)
    return {"mensaje": "Archivo de requisitos subido correctamente", "nombre": unique_name, "ruta": file_path}


@router.post("/upload")
async def upload_cv_and_audio(
    cv: UploadFile = File(...),
    audio: UploadFile = File(None),
):
    """
    Endpoint unificado: recibe CV (obligatorio) y audio (opcional) en un solo request.
    Compatible con el frontend del dashboard.
    """
    allowed_cv = [".pdf", ".docx"]
    allowed_audio = [".wav", ".mp3", ".ogg", ".m4a", ".flac"]

    cv_name, _ = save_file(cv, CV_UPLOAD_FOLDER, allowed_cv)

    audio_name = None
    if audio and audio.filename:
        audio_name, _ = save_file(audio, AUDIO_UPLOAD_FOLDER, allowed_audio)

    return {"cv_filename": cv_name, "audio_filename": audio_name}