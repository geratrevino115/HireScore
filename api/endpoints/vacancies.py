from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import VacanteCreate, VacanteRead, VacanteUpdateRequisitos, VacanteUpdatePesos, CandidatoRanking, CostoVacanteResumen
from db.crud import create_vacante, get_vacantes, get_vacante, update_vacante_requisitos, update_vacante_pesos, get_ranking_por_vacante, get_costo_total_vacante
from handlers.scoring.weights import PesosScoring
from handlers.cvs.parsers.cv_reader import extract_text
import os, uuid, shutil

router = APIRouter(prefix="/vacancies", tags=["Vacantes"])

REQ_FOLDER = "data/req_data"


@router.post("/", response_model=VacanteRead)
async def add_vacante(vacante: VacanteCreate, db: AsyncSession = Depends(get_db)):
    return await create_vacante(db, vacante.titulo, vacante.descripcion, vacante.requisitos_texto)


@router.get("/", response_model=list[VacanteRead])
async def list_vacantes(db: AsyncSession = Depends(get_db)):
    return await get_vacantes(db)


@router.get("/{vacante_id}", response_model=VacanteRead)
async def get_vacante_by_id(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put("/{vacante_id}/requisitos", response_model=VacanteRead)
async def set_requisitos(vacante_id: int, body: VacanteUpdateRequisitos, db: AsyncSession = Depends(get_db)):
    vacante = await update_vacante_requisitos(db, vacante_id, body.requisitos_texto)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.post("/{vacante_id}/requisitos/from-file", response_model=VacanteRead)
async def set_requisitos_from_file(
    vacante_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF o DOCX")

    os.makedirs(REQ_FOLDER, exist_ok=True)
    path = os.path.join(REQ_FOLDER, f"{uuid.uuid4()}{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        texto = extract_text(path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el archivo: {e}")

    vacante = await update_vacante_requisitos(db, vacante_id, texto)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put("/{vacante_id}/pesos", response_model=VacanteRead)
async def set_pesos(vacante_id: int, body: VacanteUpdatePesos, db: AsyncSession = Depends(get_db)):
    """Configura pesos custom del scoring para esta vacante. Deben sumar ~1.0."""
    try:
        pesos = PesosScoring(**body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    vacante = await update_vacante_pesos(db, vacante_id, pesos.as_dict())
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.delete("/{vacante_id}/pesos", response_model=VacanteRead)
async def reset_pesos(vacante_id: int, db: AsyncSession = Depends(get_db)):
    """Limpia los pesos custom; vuelve a usar PESOS_DEFAULT."""
    vacante = await update_vacante_pesos(db, vacante_id, None)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.get("/{vacante_id}/costo-total", response_model=CostoVacanteResumen)
async def costo_total_vacante(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    resumen = await get_costo_total_vacante(db, vacante_id)
    return CostoVacanteResumen(vacante_id=vacante_id, **resumen)


@router.get("/{vacante_id}/ranking", response_model=list[CandidatoRanking])
async def ranking_candidatos(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    rows = await get_ranking_por_vacante(db, vacante_id)
    return [
        CandidatoRanking(
            candidato_id=analisis.candidato_id,
            nombre=candidato.nombre,
            puntaje_total=analisis.puntaje_total,
            sentimiento_compound=analisis.sentimiento_compound,
            analisis_id=analisis.id,
            analizado_en=analisis.analizado_en,
        )
        for analisis, candidato in rows
    ]
