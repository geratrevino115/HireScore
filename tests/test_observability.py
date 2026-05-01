"""Tests del logging estructurado y auditoria."""
import json
import logging
import pytest
from handlers.observability.logger import JsonFormatter, log_event, timed, audit_scoring, get_logger


def test_json_formatter_emite_json_valido():
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="hirescore.test", level=logging.INFO, pathname="x", lineno=1,
        msg="hola", args=(), exc_info=None,
    )
    record.extra_data = {"foo": "bar", "n": 42}
    out = formatter.format(record)
    parsed = json.loads(out)
    assert parsed["msg"] == "hola"
    assert parsed["foo"] == "bar"
    assert parsed["n"] == 42
    assert parsed["level"] == "INFO"


def test_log_event_acepta_campos_extra(caplog):
    logger = get_logger("test")
    with caplog.at_level(logging.INFO, logger="hirescore.test"):
        log_event(logger, "INFO", "evento.test", a=1, b="x")
    assert any("evento.test" in r.message for r in caplog.records)


def test_timed_emite_duracion_ms(caplog):
    logger = get_logger("test")
    with caplog.at_level(logging.INFO, logger="hirescore.test"):
        with timed(logger, "op.test", marca="x"):
            pass
    rec = next(r for r in caplog.records if r.message == "op.test")
    assert rec.extra_data["status"] == "ok"
    assert "duracion_ms" in rec.extra_data
    assert rec.extra_data["marca"] == "x"


def test_timed_captura_error_y_relanza(caplog):
    logger = get_logger("test")
    with caplog.at_level(logging.INFO, logger="hirescore.test"):
        with pytest.raises(RuntimeError):
            with timed(logger, "op.fail"):
                raise RuntimeError("boom")
    rec = next(r for r in caplog.records if r.message == "op.fail")
    assert rec.extra_data["status"] == "error"
    assert rec.extra_data["error_tipo"] == "RuntimeError"


def test_audit_scoring_emite_evento(caplog):
    with caplog.at_level(logging.INFO, logger="hirescore.audit"):
        audit_scoring(
            candidato_id=1, vacante_id=2, puntaje_total=78,
            pesos={"x": 0.5}, features={"x": 0.9},
            skills_match=["Python"], skills_faltantes=["Rust"],
        )
    rec = next(r for r in caplog.records if r.message == "scoring.computed")
    assert rec.extra_data["puntaje_total"] == 78
    assert rec.extra_data["skills_match"] == ["Python"]
