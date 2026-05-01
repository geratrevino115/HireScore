from __future__ import annotations
from functools import lru_cache
from handlers.llm.base import LLMProvider, LLMError
from api import config


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    """Devuelve el proveedor LLM configurado via env LLM_PROVIDER.

    Valores soportados:
      - 'ollama' (default): local, llama3.2 u otro modelo via Ollama
      - 'claude': Anthropic API, modelo definido en CLAUDE_MODEL
    """
    provider = config.LLM_PROVIDER.lower()

    if provider == "ollama":
        from handlers.llm.ollama_provider import OllamaProvider
        base_url = config.OLLAMA_URL.replace("/api/generate", "").rstrip("/")
        return OllamaProvider(base_url=base_url, model=config.OLLAMA_MODEL)

    if provider == "claude":
        from handlers.llm.claude_provider import ClaudeProvider
        return ClaudeProvider(api_key=config.ANTHROPIC_API_KEY, model=config.CLAUDE_MODEL)

    raise LLMError(f"LLM_PROVIDER desconocido: {provider}")


def reset_provider_cache() -> None:
    """Util para tests: limpia el provider cacheado."""
    get_llm_provider.cache_clear()
