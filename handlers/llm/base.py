from __future__ import annotations
from abc import ABC, abstractmethod
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
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
    async def health(self) -> bool:
        """Comprueba que el proveedor responde."""
