from __future__ import annotations
from abc import ABC, abstractmethod
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
    VacanteGenerada,
    GenerarVacanteInputs,
    GuiaEntrevistaResultado,
    PreguntasPorCV,
    EvaluacionEntrevista,
)


class LLMError(Exception):
    """Error generico de un proveedor LLM (red, parseo, validacion)."""


class LLMProvider(ABC):
    """Interfaz unica para todos los proveedores LLM (Ollama, Claude, etc.).

    Cada implementacion es responsable de:
      - construir prompts
      - llamar al modelo con timeouts y reintentos
      - parsear y validar la respuesta a Pydantic
      - lanzar LLMError ante fallo no recuperable
    """

    name: str = "abstract"

    @abstractmethod
    async def extract_cv(self, cv_texto: str) -> CVEstructurado:
        """Extrae informacion estructurada de un CV en texto plano."""

    @abstractmethod
    async def extract_requisitos(self, requisitos_texto: str) -> RequisitosEstructurados:
        """Extrae requisitos estructurados del descriptor de una vacante."""

    @abstractmethod
    async def evaluate_soft_skills(self, transcripcion: str) -> SoftSkillsResult:
        """Evalua soft skills sobre la transcripcion de una entrevista."""

    @abstractmethod
    async def extract_vacancy_from_text(self, texto: str) -> VacanteGenerada:
        """Convierte un PDF/DOCX volcado a texto en una descripcion de vacante limpia."""

    @abstractmethod
    async def generate_vacancy_draft(self, inputs: GenerarVacanteInputs) -> VacanteGenerada:
        """Genera un borrador de vacante a partir de inputs basicos del reclutador."""

    @abstractmethod
    async def generate_interview_guide(
        self, requisitos: RequisitosEstructurados, descripcion: str | None = None
    ) -> GuiaEntrevistaResultado:
        """Genera la guia de entrevista (preguntas + criterios + senales) para una vacante."""

    @abstractmethod
    async def generate_questions_from_cv(
        self, cv: CVEstructurado, requisitos: RequisitosEstructurados
    ) -> PreguntasPorCV:
        """Genera preguntas personalizadas al CV de un candidato concreto,
        complementarias a la guia base de la vacante."""

    @abstractmethod
    async def evaluate_interview(
        self,
        transcripcion: str,
        cv: CVEstructurado,
        requisitos: RequisitosEstructurados,
    ) -> EvaluacionEntrevista:
        """Evalua una entrevista transcrita en tres dimensiones: cobertura,
        consistencia (CV vs entrevista) y profundidad tecnica."""

    @abstractmethod
    async def health(self) -> bool:
        """Comprueba que el proveedor responde."""
