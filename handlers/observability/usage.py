"""Captura de uso de tokens por request via ContextVar.

El pipeline llama `start_collection()` antes de empezar, ejecuta,
y luego `pop_collection()` para obtener todos los eventos LLM emitidos.
Los providers llaman `add_usage(event)` despues de cada llamada al modelo.
"""
from __future__ import annotations
from contextvars import ContextVar
from dataclasses import dataclass, field

from handlers.observability.costs import calcular_costo_usd


@dataclass
class UsageEvent:
    provider: str
    model: str
    operacion: str
    tokens_input: int = 0
    tokens_output: int = 0
    tokens_cache_read: int = 0
    tokens_cache_creation: int = 0
    duracion_ms: float = 0.0

    @property
    def costo_usd(self) -> float:
        return calcular_costo_usd(
            self.provider, self.model,
            self.tokens_input, self.tokens_output,
            self.tokens_cache_read, self.tokens_cache_creation,
        )

    def to_dict(self) -> dict:
        return {
            "provider": self.provider,
            "model": self.model,
            "operacion": self.operacion,
            "tokens_input": self.tokens_input,
            "tokens_output": self.tokens_output,
            "tokens_cache_read": self.tokens_cache_read,
            "tokens_cache_creation": self.tokens_cache_creation,
            "duracion_ms": self.duracion_ms,
            "costo_usd": self.costo_usd,
        }


_collector: ContextVar[list[UsageEvent] | None] = ContextVar(
    "usage_collector", default=None
)


def start_collection() -> list[UsageEvent]:
    """Inicia coleccion de eventos para el contexto actual y devuelve la lista."""
    eventos: list[UsageEvent] = []
    _collector.set(eventos)
    return eventos


def stop_collection() -> None:
    _collector.set(None)


def add_usage(event: UsageEvent) -> None:
    coll = _collector.get()
    if coll is not None:
        coll.append(event)


def costo_total(eventos: list[UsageEvent]) -> float:
    return round(sum(e.costo_usd for e in eventos), 6)
