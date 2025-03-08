from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Esquemas para Vacantes
class VacancyCreate(BaseModel):
    name: str

class VacancyRead(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        orm_mode = True

# Esquemas para Análisis
class AnalysisCreate(BaseModel):
    candidate_id: int
    vacancy_id: str
    compatibility: int
    requirements: List[int]
    analyzed_at: Optional[datetime] = None

class AnalysisRead(BaseModel):
    id: int
    candidate_id: int
    vacancy_id: str
    compatibility: int
    requirements: List[int]
    analyzed_at: datetime

    class Config:
        orm_mode = True
