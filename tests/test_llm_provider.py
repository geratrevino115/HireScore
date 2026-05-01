"""Tests del provider LLM con mocks de red.

Validan que el OllamaProvider parsea correctamente JSON y reintenta ante fallo,
sin pegar al Ollama real.
"""
import json
import httpx
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from handlers.llm.ollama_provider import OllamaProvider, _safe_parse_json
from handlers.llm.base import LLMError
from handlers.llm.schemas import CVEstructurado


CV_JSON_VALIDO = {
    "datos_personales": {"nombre": "Ana Lopez", "email": "ana@example.com"},
    "resumen": "Backend dev senior",
    "skills": [
        {"nombre": "Python", "categoria": "lenguaje", "nivel": "senior", "años_experiencia": 6}
    ],
    "experiencia": [],
    "educacion": [],
    "certificaciones": [],
    "proyectos": [],
    "años_experiencia_total": 6.0,
}


def test_safe_parse_json_directo():
    assert _safe_parse_json('{"a": 1}') == {"a": 1}


def test_safe_parse_json_con_fences():
    assert _safe_parse_json('```json\n{"a": 1}\n```') == {"a": 1}


def test_safe_parse_json_con_texto_alrededor():
    assert _safe_parse_json('Aqui tienes: {"a": 1}. Listo.') == {"a": 1}


def test_safe_parse_json_invalido_lanza():
    with pytest.raises(ValueError):
        _safe_parse_json("solo texto sin nada")


@pytest.mark.asyncio
async def test_ollama_extract_cv_devuelve_pydantic():
    provider = OllamaProvider(base_url="http://fake", model="llama3.2")

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"response": json.dumps(CV_JSON_VALIDO)}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_resp):
        cv = await provider.extract_cv("texto del cv")

    assert isinstance(cv, CVEstructurado)
    assert cv.datos_personales.nombre == "Ana Lopez"
    assert len(cv.skills) == 1


@pytest.mark.asyncio
async def test_ollama_reintenta_y_falla():
    provider = OllamaProvider(base_url="http://fake", model="llama3.2")
    request = httpx.Request("POST", "http://fake/api/generate")

    with patch(
        "httpx.AsyncClient.post",
        new_callable=AsyncMock,
        side_effect=httpx.ConnectError("sin conexion", request=request),
    ):
        with pytest.raises(LLMError) as exc:
            await provider.extract_cv("cv")
    assert "Ollama fallo" in str(exc.value)


@pytest.mark.asyncio
async def test_ollama_json_invalido_lanza_llm_error():
    provider = OllamaProvider(base_url="http://fake", model="llama3.2")

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"response": "esto no es json"}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_resp):
        with pytest.raises(LLMError):
            await provider.extract_cv("cv")
