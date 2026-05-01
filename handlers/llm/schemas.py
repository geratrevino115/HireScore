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
