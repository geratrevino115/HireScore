import json
import pytest
from unittest.mock import patch, MagicMock
from handlers.scoring.scorer import calcular_score, FALLBACK


MOCK_CV_JSON = {
    "datos_personales": {"nombre": "Juan Pérez"},
    "experiencia_tecnica": "5 años en Python y FastAPI",
    "educacion": "Ingeniería en Sistemas",
    "certificaciones": [],
    "proyectos_relevantes": ["Sistema de inventario", "API REST"],
    "sistema_categorizacion_skills": ["Python", "SQL", "Docker"],
}

MOCK_REQUISITOS = "Se requiere experiencia en Python, bases de datos SQL y despliegue en contenedores."

VALID_RESPONSE = {
    "puntaje_total": 82,
    "desglose": [
        {"categoria": "Experiencia Tecnica", "puntaje": 90, "comentario": "Experiencia sólida en Python"},
        {"categoria": "Educacion", "puntaje": 80, "comentario": "Formación adecuada"},
        {"categoria": "Skills", "puntaje": 85, "comentario": "Skills alineados"},
        {"categoria": "Proyectos", "puntaje": 70, "comentario": "Proyectos relevantes"},
    ],
}


def make_mock_response(text):
    mock = MagicMock()
    mock.raise_for_status = MagicMock()
    mock.json.return_value = {"response": text}
    return mock


def test_calcular_score_retorna_estructura_correcta():
    with patch("handlers.scoring.scorer.requests.post") as mock_post:
        mock_post.return_value = make_mock_response(json.dumps(VALID_RESPONSE))
        resultado = calcular_score(MOCK_CV_JSON, MOCK_REQUISITOS)

    assert "puntaje_total" in resultado
    assert "desglose" in resultado
    assert 0 <= resultado["puntaje_total"] <= 100
    assert isinstance(resultado["desglose"], list)


def test_calcular_score_puntaje_dentro_de_rango():
    with patch("handlers.scoring.scorer.requests.post") as mock_post:
        mock_post.return_value = make_mock_response(json.dumps(VALID_RESPONSE))
        resultado = calcular_score(MOCK_CV_JSON, MOCK_REQUISITOS)

    assert resultado["puntaje_total"] == 82


def test_calcular_score_fallback_con_json_invalido():
    with patch("handlers.scoring.scorer.requests.post") as mock_post:
        mock_post.return_value = make_mock_response("esto no es json")
        resultado = calcular_score(MOCK_CV_JSON, MOCK_REQUISITOS)

    assert resultado["puntaje_total"] == 0
    assert len(resultado["desglose"]) == 4


def test_calcular_score_fallback_con_error_de_red():
    with patch("handlers.scoring.scorer.requests.post", side_effect=ConnectionError("sin conexión")):
        resultado = calcular_score(MOCK_CV_JSON, MOCK_REQUISITOS)

    assert resultado == FALLBACK


def test_calcular_score_puntaje_fuera_de_rango_se_clampea():
    respuesta_invalida = {**VALID_RESPONSE, "puntaje_total": 150}
    with patch("handlers.scoring.scorer.requests.post") as mock_post:
        mock_post.return_value = make_mock_response(json.dumps(respuesta_invalida))
        resultado = calcular_score(MOCK_CV_JSON, MOCK_REQUISITOS)

    assert resultado["puntaje_total"] == 100


def test_calcular_score_sin_requisitos_no_falla():
    with patch("handlers.scoring.scorer.requests.post") as mock_post:
        mock_post.return_value = make_mock_response(json.dumps(VALID_RESPONSE))
        resultado = calcular_score(MOCK_CV_JSON, "")

    assert "puntaje_total" in resultado
