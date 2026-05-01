from __future__ import annotations
import json
import re
import time
import asyncio
import httpx
from pydantic import ValidationError
from handlers.llm.base import LLMProvider, LLMError
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
)
from handlers.llm import prompts
from handlers.observability import get_logger, UsageEvent, add_usage
from handlers.observability.logger import timed

_log = get_logger("llm.ollama")


class OllamaProvider(LLMProvider):
    """Proveedor local via Ollama. Usa format=json para forzar salida estructurada."""

    name = "ollama"

    def __init__(self, base_url: str, model: str, timeout: float = 180.0):
        self.base_url = base_url.rstrip("/")
        self.generate_url = f"{self.base_url}/api/generate"
        self.tags_url = f"{self.base_url}/api/tags"
        self.model = model
        self.timeout = timeout

    async def _generate_json(self, system: str, user: str, operacion: str, retries: int = 2) -> dict:
        prompt = f"{system}\n\n{user}\n\nResponde UNICAMENTE con JSON valido."
        last_error: Exception | None = None
        for intento in range(retries + 1):
            inicio = time.perf_counter()
            try:
                with timed(_log, "llm.call", provider="ollama", model=self.model, operacion=operacion, intento=intento + 1) as fields:
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        resp = await client.post(
                            self.generate_url,
                            json={
                                "model": self.model,
                                "prompt": prompt,
                                "stream": False,
                                "format": "json",
                            },
                        )
                        resp.raise_for_status()
                        body = resp.json()
                        raw = body.get("response", "")
                    fields["tokens_input"] = body.get("prompt_eval_count", 0)
                    fields["tokens_output"] = body.get("eval_count", 0)
                    add_usage(UsageEvent(
                        provider="ollama",
                        model=self.model,
                        operacion=operacion,
                        tokens_input=body.get("prompt_eval_count", 0) or 0,
                        tokens_output=body.get("eval_count", 0) or 0,
                        duracion_ms=round((time.perf_counter() - inicio) * 1000, 2),
                    ))
                    return _safe_parse_json(raw)
            except (httpx.HTTPError, ValueError) as e:
                last_error = e
                if intento < retries:
                    await asyncio.sleep(0.5 * (intento + 1))
                    continue
        raise LLMError(f"Ollama fallo despues de {retries+1} intentos: {last_error}")

    async def extract_cv(self, cv_texto: str) -> CVEstructurado:
        data = await self._generate_json(
            prompts.CV_SYSTEM,
            prompts.CV_USER_TEMPLATE.format(cv_texto=cv_texto[:20000]),
            operacion="extract_cv",
        )
        try:
            return CVEstructurado.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"CV no valida el esquema: {e}") from e

    async def extract_requisitos(self, requisitos_texto: str) -> RequisitosEstructurados:
        data = await self._generate_json(
            prompts.REQ_SYSTEM,
            prompts.REQ_USER_TEMPLATE.format(requisitos_texto=requisitos_texto[:10000]),
            operacion="extract_requisitos",
        )
        try:
            return RequisitosEstructurados.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"Requisitos no validan el esquema: {e}") from e

    async def evaluate_soft_skills(self, transcripcion: str) -> SoftSkillsResult:
        data = await self._generate_json(
            prompts.SOFT_SYSTEM,
            prompts.SOFT_USER_TEMPLATE.format(transcripcion=transcripcion[:30000]),
            operacion="evaluate_soft_skills",
        )
        try:
            return SoftSkillsResult.model_validate(data)
        except ValidationError as e:
            raise LLMError(f"Soft skills no validan el esquema: {e}") from e

    async def health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(self.tags_url)
                return resp.status_code == 200
        except Exception:
            return False


def _safe_parse_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw)
    raw = re.sub(r"```$", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise ValueError("respuesta no contiene JSON")
        return json.loads(match.group())
