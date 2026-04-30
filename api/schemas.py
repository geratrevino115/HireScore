from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CandidatoCreate(BaseModel):
    nombre: str

class CandidatoRead(BaseModel):
    id: int
    nombre: str

    model_config = {"from_attributes": True}


class VacanteCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    requisitos_texto: Optional[str] = None

class VacanteRead(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str] = None
    requisitos_texto: Optional[str] = None

    model_config = {"from_attributes": True}

class VacanteUpdateRequisitos(BaseModel):
    requisitos_texto: str


class DesglosePuntaje(BaseModel):
    categoria: str
    puntaje: int
    comentario: Optional[str] = None

class AnalisisCreate(BaseModel):
    candidato_id: int
    vacante_id: int
    puntaje_total: int
    desglose: List[DesglosePuntaje]
    sentimiento_compound: Optional[float] = None

class AnalisisRead(BaseModel):
    id: int
    candidato_id: int
    vacante_id: int
    puntaje_total: int
    desglose: List[DesglosePuntaje]
    sentimiento_compound: Optional[float] = None
    analizado_en: datetime

    model_config = {"from_attributes": True}
