"""Logging estructurado en JSON.

Diseñado para ser parseable por Datadog/Loki/CloudWatch sin transformacion.
Toda llamada al LLM y todo scoring producido emiten un evento auditable.
"""
from __future__ import annotations
import json
import logging
import os
import sys
import time
import uuid
from contextlib import contextmanager
from typing import Any

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "json")  # json | plain

_REQUEST_ID: dict[int, str] = {}  # mapeo task_id -> correlation id


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        extra = getattr(record, "extra_data", None)
        if extra:
            payload.update(extra)
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False, default=str)


def _bootstrap() -> None:
    root = logging.getLogger("hirescore")
    if root.handlers:
        return
    handler = logging.StreamHandler(sys.stdout)
    if LOG_FORMAT == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s — %(message)s"))
    root.addHandler(handler)
    root.setLevel(LOG_LEVEL)


_bootstrap()


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"hirescore.{name}")


def log_event(logger: logging.Logger, level: str, msg: str, **fields: Any) -> None:
    """Log un evento con campos estructurados."""
    logger.log(getattr(logging, level.upper()), msg, extra={"extra_data": fields})


@contextmanager
def timed(logger: logging.Logger, evento: str, **base_fields: Any):
    """Context manager que mide latencia y emite evento al cerrar."""
    correlation_id = base_fields.pop("correlation_id", None) or str(uuid.uuid4())
    fields = {"correlation_id": correlation_id, **base_fields}
    inicio = time.perf_counter()
    try:
        yield fields
        dur_ms = round((time.perf_counter() - inicio) * 1000, 2)
        log_event(logger, "INFO", evento, status="ok", duracion_ms=dur_ms, **fields)
    except Exception as e:
        dur_ms = round((time.perf_counter() - inicio) * 1000, 2)
        log_event(
            logger,
            "ERROR",
            evento,
            status="error",
            duracion_ms=dur_ms,
            error=str(e),
            error_tipo=type(e).__name__,
            **fields,
        )
        raise


def audit_scoring(
    candidato_id: int | None,
    vacante_id: int | None,
    puntaje_total: int,
    pesos: dict[str, float],
    features: dict[str, float],
    skills_match: list[str],
    skills_faltantes: list[str],
) -> None:
    """Evento de auditoria del scoring. Necesario para compliance HR (AEDT, AI Act)."""
    logger = get_logger("audit")
    log_event(
        logger,
        "INFO",
        "scoring.computed",
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=puntaje_total,
        pesos=pesos,
        features=features,
        skills_match=skills_match,
        skills_faltantes=skills_faltantes,
    )
