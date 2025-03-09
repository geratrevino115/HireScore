from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models import Vacancy, Analysis, Upload

async def create_vacancy(db: AsyncSession, name: str):
    db_vacancy = Vacancy(name=name)
    db.add(db_vacancy)
    await db.commit()
    await db.refresh(db_vacancy)
    return db_vacancy

async def get_vacancies(db: AsyncSession):
    result = await db.execute(select(Vacancy))
    return result.scalars().all()

async def create_analysis(db: AsyncSession, candidate_id: int, vacancy_id: str, compatibility: int, requirements: list, analyzed_at):
    db_analysis = Analysis(
        candidate_id=candidate_id,
        vacancy_id=vacancy_id,
        compatibility=compatibility,
        requirements=requirements,
        analyzed_at=analyzed_at
    )
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)
    return db_analysis

async def get_analyses(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Analysis).offset(skip).limit(limit))
    return result.scalars().all()

async def create_upload_record(db: AsyncSession, candidate_id: int, cv_filename: str, audio_filename: str):
    db_upload = Upload(
        candidate_id=candidate_id, 
        cv_filename=cv_filename, 
        audio_filename=audio_filename
    )
    db.add(db_upload)
    await db.commit()
    await db.refresh(db_upload)
    return db_upload