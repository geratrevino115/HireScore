from __future__ import annotations
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SkillCategoria(str, Enum):
    LENGUAJE = "lenguaje"
    FRAMEWORK = "framework"
    BASE_DATOS = "base_datos"
    CLOUD = "cloud"
    DEVOPS = "devops"
    HERRAMIENTA = "herramienta"
    METODOLOGIA = "metodologia"
    SOFT = "soft"
    OTRO = "otro"


class NivelSkill(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    DESCONOCIDO = "desconocido"


class NivelEducativo(str, Enum):
    NINGUNO = "ninguno"
    TECNICO = "tecnico"
    LICENCIATURA = "licenciatura"
    MAESTRIA = "maestria"
    DOCTORADO = "doctorado"


class DatosPersonales(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None
    linkedin: Optional[str] = None


class Skill(BaseModel):
    nombre: str
    nombre_normalizado: Optional[str] = None
    categoria: SkillCategoria = SkillCategoria.OTRO
    años_experiencia: Optional[float] = None
    nivel: NivelSkill = NivelSkill.DESCONOCIDO


class Experiencia(BaseModel):
    empresa: Optional[str] = None
    puesto: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    años: Optional[float] = None
    descripcion: Optional[str] = None
    skills_usadas: list[str] = Field(default_factory=list)


class Educacion(BaseModel):
    institucion: Optional[str] = None
    titulo: Optional[str] = None
    nivel: NivelEducativo = NivelEducativo.NINGUNO
    año_fin: Optional[int] = None


class Certificacion(BaseModel):
    nombre: str
    emisor: Optional[str] = None
    año: Optional[int] = None


class Proyecto(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    skills_usadas: list[str] = Field(default_factory=list)


class CVEstructurado(BaseModel):
    datos_personales: DatosPersonales = Field(default_factory=DatosPersonales)
    resumen: Optional[str] = None
    skills: list[Skill] = Field(default_factory=list)
    experiencia: list[Experiencia] = Field(default_factory=list)
    educacion: list[Educacion] = Field(default_factory=list)
    certificaciones: list[Certificacion] = Field(default_factory=list)
    proyectos: list[Proyecto] = Field(default_factory=list)
    años_experiencia_total: float = 0.0


class SkillRequerido(BaseModel):
    nombre: str
    nombre_normalizado: Optional[str] = None
    obligatorio: bool = True
    años_minimos: Optional[float] = None


class RequisitosEstructurados(BaseModel):
    skills_requeridos: list[SkillRequerido] = Field(default_factory=list)
    años_experiencia_min: Optional[float] = None
    nivel_educativo_min: NivelEducativo = NivelEducativo.NINGUNO
    certificaciones_deseadas: list[str] = Field(default_factory=list)
    palabras_clave: list[str] = Field(default_factory=list)


class DimensionSoftSkill(BaseModel):
    puntaje: float = Field(ge=0, le=100)
    justificacion: Optional[str] = None
    evidencias: list[str] = Field(default_factory=list)


class SoftSkillsResult(BaseModel):
    comunicacion: DimensionSoftSkill
    resolucion_problemas: DimensionSoftSkill
    trabajo_equipo: DimensionSoftSkill

    @property
    def promedio(self) -> float:
        return (
            self.comunicacion.puntaje
            + self.resolucion_problemas.puntaje
            + self.trabajo_equipo.puntaje
        ) / 3


# ---------------------------------------------------------------------------
# Generación / extracción de descripción de vacante
# ---------------------------------------------------------------------------


class VacanteGenerada(BaseModel):
    """Descriptor de una vacante (titulo + descripcion + requisitos en texto).

    Es el output tanto de `extract_vacancy_from_text` (cuando el reclutador sube
    un PDF/DOCX) como de `generate_vacancy_draft` (cuando pide ayuda a la IA).
    `requisitos_texto` se procesa luego con `extract_requisitos` para tener la
    versión estructurada que usa el scorer.
    """
    titulo: str
    descripcion: Optional[str] = None
    requisitos_texto: str = Field(
        ...,
        description=(
            "Texto en formato lista o párrafos con los requisitos técnicos, "
            "experiencia mínima, educación y soft skills. Se usa como input "
            "del extractor estructurado."
        ),
    )


class GenerarVacanteInputs(BaseModel):
    """Inputs del wizard de IA cuando el reclutador no tiene JD lista."""
    puesto: str
    seniority: Optional[str] = None  # junior, mid, senior, lead, etc.
    industria: Optional[str] = None
    stack: list[str] = Field(default_factory=list)
    responsabilidades: Optional[str] = None
    notas: Optional[str] = None


# ---------------------------------------------------------------------------
# Guía de entrevista
# ---------------------------------------------------------------------------


class PreguntaEntrevista(BaseModel):
    pregunta: str
    skill_relacionada: Optional[str] = None
    objetivo: Optional[str] = Field(
        default=None,
        description="Qué busca evaluar esta pregunta (1 oración).",
    )
    tipo: str = Field(
        default="tecnica",
        description="tecnica, comportamiento, situacional",
    )


class GuiaEntrevistaResultado(BaseModel):
    """Guía técnica que el reclutador puede usar como referencia en la entrevista.

    Incluye preguntas categorizadas y criterios de evaluación. Se genera a partir
    de los requisitos estructurados de la vacante; en una iteración posterior se
    enriquecerá con preguntas específicas al CV de cada candidato.
    """
    preguntas: list[PreguntaEntrevista] = Field(default_factory=list)
    criterios_evaluacion: list[str] = Field(
        default_factory=list,
        description="Criterios cualitativos para evaluar las respuestas.",
    )
    senales_de_alerta: list[str] = Field(
        default_factory=list,
        description="Banderas rojas a vigilar durante la entrevista.",
    )


class PreguntasPorCV(BaseModel):
    """Preguntas de entrevista personalizadas al CV de un candidato concreto.

    Profundizan en proyectos, empresas o pretensiones específicas del CV; se
    combinan con la guía base de la vacante para una entrevista hecha a la medida.
    """
    preguntas: list[PreguntaEntrevista] = Field(
        default_factory=list,
        description="5-8 preguntas adaptadas al CV específico.",
    )


# ---------------------------------------------------------------------------
# Evaluación de entrevista (audio → transcripción → LLM)
# ---------------------------------------------------------------------------


class DimensionEvaluacion(BaseModel):
    """Resultado de una dimensión de evaluación de entrevista. 0-100."""
    puntaje: float = Field(ge=0, le=100)
    justificacion: str
    evidencias: list[str] = Field(
        default_factory=list,
        description="Citas literales de la transcripción que sostienen la evaluación.",
    )


class EvaluacionEntrevista(BaseModel):
    """Evaluación estructurada de una entrevista versus CV y requisitos.

    Tres dimensiones independientes:
    - cobertura: ¿cubrió los temas y skills clave de la vacante?
    - consistencia: ¿lo dicho coincide con el CV?
    - profundidad: ¿respuestas concretas y técnicas vs genéricas y vagas?
    """
    cobertura: DimensionEvaluacion
    consistencia: DimensionEvaluacion
    profundidad: DimensionEvaluacion
    resumen_ejecutivo: Optional[str] = Field(
        default=None,
        description="2-3 oraciones de resumen para el reclutador.",
    )

    @property
    def puntaje_total(self) -> float:
        return round(
            (self.cobertura.puntaje + self.consistencia.puntaje + self.profundidad.puntaje) / 3,
            1,
        )
