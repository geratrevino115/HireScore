from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import VacancyCreate, VacancyRead
from db.crud import create_vacancy, get_vacancies

router = APIRouter(prefix="/vacancies", tags=["Vacancies"])

@router.post("/", response_model=VacancyRead)
async def add_vacancy(vacancy: VacancyCreate, db: AsyncSession = Depends(get_db)):
    return await create_vacancy(db, vacancy.name)

@router.get("/", response_model=list[VacancyRead])
async def list_vacancies(db: AsyncSession = Depends(get_db)):
    return await get_vacancies(db)
