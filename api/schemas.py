from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CandidatoCreate(BaseModel):
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None

class CandidatoRead(BaseModel):
    id: int
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None

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
    pesos_json: Optional[dict] = None

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
    aplicacion_id: Optional[int] = None
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


class AplicacionRead(BaseModel):
    """Aplicacion = pivote candidato↔vacante con etapa del pipeline."""
    id: int
    vacante_id: int
    candidato_id: int
    etapa: str
    notas: Optional[str] = None
    fecha_aplicacion: Optional[datetime] = None
    actualizada_en: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AplicacionConCandidato(BaseModel):
    """Vista enriquecida de aplicacion para listados del workspace de vacante.
    Incluye datos del candidato y resumen del ultimo analisis si lo hay."""
    aplicacion_id: int
    vacante_id: int
    candidato_id: int
    candidato_nombre: str
    candidato_email: Optional[str] = None
    etapa: str
    notas: Optional[str] = None
    fecha_aplicacion: Optional[datetime] = None
    ultimo_analisis_id: Optional[int] = None
    puntaje_total: Optional[int] = None
    sentimiento_compound: Optional[float] = None


class AplicacionUpdateEtapa(BaseModel):
    etapa: str  # validado contra ETAPAS_APLICACION en el endpoint


class AplicacionUpdateNotas(BaseModel):
    notas: Optional[str] = None


class PipelineResumen(BaseModel):
    """Conteo de aplicaciones por etapa, util para el header del workspace."""
    vacante_id: int
    counts: dict  # {"nueva": N, "shortlist": N, ...}
    total: int


class ProcesarResultado(BaseModel):
    """Respuesta del endpoint /analyses/procesar — incluye la aplicacion
    creada/reutilizada y el analisis con su score."""
    aplicacion: AplicacionRead
    analisis: "AnalisisRead"
    candidato_creado: bool  # True si fue creado en este request, False si dedupe lo reuso


# ---------------------------------------------------------------------------
# Wizard de creación de vacante (subir JD / IA asistida)
# ---------------------------------------------------------------------------


class VacanteDraft(BaseModel):
    """Borrador devuelto por el LLM (extracción de archivo o generación IA).
    No se persiste todavía — el reclutador lo revisa y luego crea la vacante."""
    titulo: str
    descripcion: Optional[str] = None
    requisitos_texto: str


class GenerarVacanteBody(BaseModel):
    """Inputs del modo 'IA asistida' del wizard."""
    puesto: str
    seniority: Optional[str] = None
    industria: Optional[str] = None
    stack: List[str] = []
    responsabilidades: Optional[str] = None
    notas: Optional[str] = None


# ---------------------------------------------------------------------------
# Guía de entrevista
# ---------------------------------------------------------------------------


class PreguntaEntrevistaRead(BaseModel):
    pregunta: str
    skill_relacionada: Optional[str] = None
    objetivo: Optional[str] = None
    tipo: str = "tecnica"


class GuiaEntrevistaRead(BaseModel):
    vacante_id: int
    preguntas: List[PreguntaEntrevistaRead]
    criterios_evaluacion: List[str] = []
    senales_de_alerta: List[str] = []
    generada_en: datetime


class DimensionEvaluacionRead(BaseModel):
    puntaje: float
    justificacion: str
    evidencias: List[str] = []


class EvaluacionEntrevistaRead(BaseModel):
    """Evaluacion de entrevista transcrita en tres dimensiones."""
    cobertura: DimensionEvaluacionRead
    consistencia: DimensionEvaluacionRead
    profundidad: DimensionEvaluacionRead
    resumen_ejecutivo: Optional[str] = None
    puntaje_total: Optional[float] = None  # calculado en el frontend o al leer


class ResultadoAudioEvaluacion(BaseModel):
    """Respuesta de POST /aplicaciones/{id}/audio."""
    aplicacion_id: int
    analisis_id: int
    evaluacion_entrevista: Optional[EvaluacionEntrevistaRead] = None
    sentimiento_compound: Optional[float] = None
    n_segmentos: int = 0


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
    preguntas_cv: Optional[List[PreguntaEntrevistaRead]] = None
    evaluacion_entrevista: Optional[EvaluacionEntrevistaRead] = None
    disclaimer: str = (
        "Este puntaje es asistencia a la decision, no decision final. "
        "Toda contratacion debe involucrar revision humana."
    )
