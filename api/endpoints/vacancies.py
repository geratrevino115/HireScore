from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import VacanteCreate, VacanteRead, VacanteUpdateRequisitos
from db.crud import create_vacante, get_vacantes, get_vacante, update_vacante_requisitos

router = APIRouter(prefix="/vacancies", tags=["Vacantes"])


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
