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


class VacanteUpdatePesos(BaseModel):
    """Pesos custom del scoring para esta vacante. Deben sumar ~1.0."""
    match_skills_obligatorios: float
    match_skills_deseables: float
    experiencia: float
    educacion: float
    soft_skills: float
    sentimiento: float


class DesglosePuntaje(BaseModel):
    categoria: str
    puntaje: int
    comentario: Optional[str] = None
    peso: Optional[float] = None
    feature: Optional[float] = None
    contribucion: Optional[float] = None

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


class JobStatus(BaseModel):
    job_id: str
    status: str  # "procesando" | "completado" | "error"
    resultado: Optional[AnalisisRead] = None
    error: Optional[str] = None


class CandidatoRanking(BaseModel):
    candidato_id: int
    nombre: str
    puntaje_total: int
    sentimiento_compound: Optional[float] = None
    analisis_id: int
    analizado_en: datetime


class CostoLLMRead(BaseModel):
    id: int
    analisis_id: Optional[int] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    operacion: Optional[str] = None
    tokens_input: int
    tokens_output: int
    tokens_cache_read: int
    tokens_cache_creation: int
    duracion_ms: float
    costo_usd: float
    creado_en: datetime

    model_config = {"from_attributes": True}


class CostoAnalisisResumen(BaseModel):
    analisis_id: int
    costo_usd_total: float
    llamadas: List[CostoLLMRead]


class CostoVacanteResumen(BaseModel):
    vacante_id: int
    costo_usd: float
    llamadas_llm: int


class ExplicacionAnalisis(BaseModel):
    """Justificacion auditable de un puntaje. Cumple AI Act Art. 13 y GDPR Art. 22.

    Incluye: features crudos por dimension, pesos aplicados, skills cubiertos
    vs faltantes, evidencias literales de soft skills si hubo entrevista,
    snapshot de los datos extraidos del CV y requisitos.
    """
    analisis_id: int
    puntaje_total: int
    desglose: List[DesglosePuntaje]
    features_crudos: Optional[dict] = None
    pesos_aplicados: Optional[dict] = None
    skills_match: List[str] = []
    skills_faltantes: List[str] = []
    cv_estructurado: Optional[dict] = None
    requisitos: Optional[dict] = None
    soft_skills: Optional[dict] = None
    sentimiento_compound: Optional[float] = None
    disclaimer: str = (
        "Este puntaje es asistencia a la decision, no decision final. "
        "Toda contratacion debe involucrar revision humana."
    )
