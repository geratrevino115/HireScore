from __future__ import annotations
import asyncio
import time
from typing import Any
from pydantic import ValidationError
from handlers.llm.base import LLMProvider, LLMError
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
)
from handlers.llm import prompts
from handlers.observability import get_logger, log_event, UsageEvent, add_usage
from handlers.observability.logger import timed

_log = get_logger("llm.claude")


class ClaudeProvider(LLMProvider):
    """Proveedor cloud via Anthropic API.

    Usa tool use para garantizar JSON valido contra el esquema Pydantic.
    Aplica prompt caching sobre el system prompt para reducir costo en lotes.
    """

    name = "claude"

    def __init__(self, api_key: str, model: str, timeout: float = 120.0):
        try:
            from anthropic import AsyncAnthropic
        except ImportError as e:
            raise LLMError(
                "anthropic SDK no instalado. Agrega 'anthropic' a requirements.txt"
            ) from e
        if not api_key:
            raise LLMError("ANTHROPIC_API_KEY no configurada")
        self.client = AsyncAnthropic(api_key=api_key, timeout=timeout)
        self.model = model

    async def _call_with_tool(
        self,
        system: str,
        user: str,
        tool_name: str,
        tool_schema: dict,
        operacion: str,
        retries: int = 1,
    ) -> dict:
        last_error: Exception | None = None
        for intento in range(retries + 1):
            inicio = time.perf_counter()
            try:
                with timed(_log, "llm.call", provider="claude", model=self.model, operacion=operacion, intento=intento + 1) as fields:
                    resp = await self.client.messages.create(
                        model=self.model,
                        max_tokens=4096,
                        system=[
                            {
                                "type": "text",
                                "text": system,
                                "cache_control": {"type": "ephemeral"},
                            }
                        ],
                        tools=[
                            {
                                "name": tool_name,
                                "description": f"Devuelve el resultado estructurado de {tool_name}.",
                                "input_schema": tool_schema,
                            }
                        ],
                        tool_choice={"type": "tool", "name": tool_name},
                        messages=[{"role": "user", "content": user}],
                    )
                    usage = getattr(resp, "usage", None)
                    tokens_input = getattr(usage, "input_tokens", 0) or 0 if usage else 0
                    tokens_output = getattr(usage, "output_tokens", 0) or 0 if usage else 0
                    tokens_cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0 if usage else 0
                    tokens_cache_creation = getattr(usage, "cache_creation_input_tokens", 0) or 0 if usage else 0
                    fields["tokens_input"] = tokens_input
                    fields["tokens_output"] = tokens_output
                    fields["tokens_cache_read"] = tokens_cache_read
                    fields["tokens_cache_creation"] = tokens_cache_creation
                    add_usage(UsageEvent(
                        provider="claude",
                        model=self.model,
                        operacion=operacion,
                        tokens_input=tokens_input,
                        tokens_output=tokens_output,
                        tokens_cache_read=tokens_cache_read,
                        tokens_cache_creation=tokens_cache_creation,
                        duracion_ms=round((time.perf_counter() - inicio) * 1000, 2),
                    ))
                    for block in resp.content:
                        if block.type == "tool_use" and block.name == tool_name:
                            return block.input
                    raise LLMError("Claude no devolvio el tool_use esperado")
            except Exception as e:
                last_error = e
                if intento < retries:
                    await asyncio.sleep(0.5 * (intento + 1))
                    continue
        raise LLMError(f"Claude fallo despues de {retries+1} intentos: {last_error}")

    async def extract_cv(self, cv_texto: str) -> CVEstructurado:
        data = await self._call_with_tool(
            prompts.CV_SYSTEM,
            prompts.CV_USER_TEMPLATE.format(cv_texto=cv_texto[:30000]),
            "registrar_cv_estructurado",
            _pydantic_to_tool_schema(CVEstructurado),
            operacion="extract_cv",
        )
        try:
            return CVEstructurado.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"CV no valida el esquema: {e}") from e

    async def extract_requisitos(self, requisitos_texto: str) -> RequisitosEstructurados:
        data = await self._call_with_tool(
            prompts.REQ_SYSTEM,
            prompts.REQ_USER_TEMPLATE.format(requisitos_texto=requisitos_texto[:15000]),
            "registrar_requisitos",
            _pydantic_to_tool_schema(RequisitosEstructurados),
            operacion="extract_requisitos",
        )
        try:
            return RequisitosEstructurados.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"Requisitos no validan el esquema: {e}") from e

    async def evaluate_soft_skills(self, transcripcion: str) -> SoftSkillsResult:
        data = await self._call_with_tool(
            prompts.SOFT_SYSTEM,
            prompts.SOFT_USER_TEMPLATE.format(transcripcion=transcripcion[:40000]),
            "registrar_soft_skills",
            _pydantic_to_tool_schema(SoftSkillsResult),
            operacion="evaluate_soft_skills",
        )
        try:
            return SoftSkillsResult.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"Soft skills no validan el esquema: {e}") from e

    async def health(self) -> bool:
        try:
            await self.client.messages.create(
                model=self.model,
                max_tokens=8,
                messages=[{"role": "user", "content": "ping"}],
            )
            return True
        except Exception:
            return False


def _pydantic_to_tool_schema(model_cls: type) -> dict[str, Any]:
    """Convierte un modelo Pydantic en JSON Schema apto para tool_use de Anthropic.

    Anthropic acepta JSON Schema estandar; Pydantic v2 lo emite con $defs/refs que
    el API resuelve sin problema, pero limpiamos campos no soportados como 'title'.
    """
    schema = model_cls.model_json_schema()
    schema.pop("title", None)
    return schema
