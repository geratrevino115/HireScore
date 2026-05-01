"""Tabla de precios por proveedor/modelo y calculo de costo en USD.

Precios al 2026-05 — actualizar contra la pagina oficial cuando cambien.
Anthropic: https://docs.anthropic.com/en/docs/about-claude/pricing
Ollama: 0 (auto-hosteado).
"""
from __future__ import annotations
from typing import TypedDict


class Pricing(TypedDict):
    input_per_mtok: float          # USD por millon de tokens input
    output_per_mtok: float
    cache_read_per_mtok: float     # cache hit
    cache_write_per_mtok: float    # creacion de cache (1 vez)


PRECIOS: dict[str, dict[str, Pricing]] = {
    "claude": {
        "claude-haiku-4-5-20251001": {
            "input_per_mtok": 1.0,
            "output_per_mtok": 5.0,
            "cache_read_per_mtok": 0.10,
            "cache_write_per_mtok": 1.25,
        },
        "claude-sonnet-4-6": {
            "input_per_mtok": 3.0,
            "output_per_mtok": 15.0,
            "cache_read_per_mtok": 0.30,
            "cache_write_per_mtok": 3.75,
        },
        "claude-opus-4-7": {
            "input_per_mtok": 15.0,
            "output_per_mtok": 75.0,
            "cache_read_per_mtok": 1.50,
            "cache_write_per_mtok": 18.75,
        },
    },
    "ollama": {
        "_default_": {
            "input_per_mtok": 0.0,
            "output_per_mtok": 0.0,
            "cache_read_per_mtok": 0.0,
            "cache_write_per_mtok": 0.0,
        }
    },
}


def get_pricing(provider: str, model: str) -> Pricing:
    by_provider = PRECIOS.get(provider.lower(), {})
    if model in by_provider:
        return by_provider[model]
    if "_default_" in by_provider:
        return by_provider["_default_"]
    return {
        "input_per_mtok": 0.0, "output_per_mtok": 0.0,
        "cache_read_per_mtok": 0.0, "cache_write_per_mtok": 0.0,
    }


def calcular_costo_usd(
    provider: str,
    model: str,
    tokens_input: int = 0,
    tokens_output: int = 0,
    tokens_cache_read: int = 0,
    tokens_cache_creation: int = 0,
) -> float:
    """Devuelve el costo en USD (float) para un set de tokens consumidos."""
    p = get_pricing(provider, model)
    # tokens_input ya excluye los del cache; los API SDKs lo separan.
    fresh_input = max(0, tokens_input - tokens_cache_read - tokens_cache_creation)
    return round(
        fresh_input            / 1_000_000 * p["input_per_mtok"]
        + tokens_output        / 1_000_000 * p["output_per_mtok"]
        + tokens_cache_read    / 1_000_000 * p["cache_read_per_mtok"]
        + tokens_cache_creation / 1_000_000 * p["cache_write_per_mtok"],
        6,
    )
