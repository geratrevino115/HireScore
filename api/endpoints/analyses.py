from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import AnalysisCreate, AnalysisRead
from db.crud import create_analysis, get_analyses
from datetime import datetime, timezone

router = APIRouter(prefix="/analyses", tags=["Analyses"])

@router.post("/", response_model=AnalysisRead)
async def add_analysis(analysis: AnalysisCreate, db: AsyncSession = Depends(get_db)):
    return await create_analysis(
        db,
        analysis.candidate_id,
        analysis.vacancy_id,
        analysis.compatibility,
        analysis.requirements,
        analysis.analyzed_at or datetime.now(timezone.utc)
    )

@router.get("/", response_model=list[AnalysisRead])
async def list_analyses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_analyses(db, skip, limit)
