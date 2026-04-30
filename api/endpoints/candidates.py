from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import CandidatoCreate, CandidatoRead
from db.crud import create_candidato, get_candidatos, get_candidato

router = APIRouter(prefix="/candidates", tags=["Candidatos"])


@router.post("/", response_model=CandidatoRead)
async def add_candidato(candidato: CandidatoCreate, db: AsyncSession = Depends(get_db)):
    return await create_candidato(db, candidato.nombre)


@router.get("/", response_model=list[CandidatoRead])
async def list_candidatos(db: AsyncSession = Depends(get_db)):
    return await get_candidatos(db)


@router.get("/{candidato_id}", response_model=CandidatoRead)
async def get_candidato_by_id(candidato_id: int, db: AsyncSession = Depends(get_db)):
    candidato = await get_candidato(db, candidato_id)
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    return candidato
