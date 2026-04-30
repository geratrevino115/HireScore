import re
import json
import requests
from api.config import OLLAMA_URL, OLLAMA_MODEL as DEFAULT_MODEL

PROMPT_TEMPLATE = """Eres un evaluador experto de candidatos. Compara el siguiente CV estructurado con los requisitos del puesto y genera una evaluacion objetiva.

CV DEL CANDIDATO (JSON estructurado):
{cv_json}

REQUISITOS DEL PUESTO:
{requisitos_texto}

Responde UNICAMENTE con un JSON valido con la siguiente estructura, sin texto adicional:
{{
  "puntaje_total": <entero del 0 al 100>,
  "desglose": [
    {{"categoria": "Experiencia Tecnica", "puntaje": <0-100>, "comentario": "<max 1 oracion>"}},
    {{"categoria": "Educacion", "puntaje": <0-100>, "comentario": "<max 1 oracion>"}},
    {{"categoria": "Skills", "puntaje": <0-100>, "comentario": "<max 1 oracion>"}},
    {{"categoria": "Proyectos", "puntaje": <0-100>, "comentario": "<max 1 oracion>"}}
  ]
}}"""

FALLBACK = {
    "puntaje_total": 0,
    "desglose": [
        {"categoria": "Experiencia Tecnica", "puntaje": 0, "comentario": "Error al procesar"},
        {"categoria": "Educacion", "puntaje": 0, "comentario": "Error al procesar"},
        {"categoria": "Skills", "puntaje": 0, "comentario": "Error al procesar"},
        {"categoria": "Proyectos", "puntaje": 0, "comentario": "Error al procesar"},
    ],
}


def calcular_score(cv_json: dict, requisitos_texto: str, modelo: str = None) -> dict:
    if modelo is None:
        modelo = DEFAULT_MODEL
    """
    Compara un CV estructurado (JSON de Ollama) contra requisitos de vacante.
    Devuelve: {puntaje_total: int, desglose: [{categoria, puntaje, comentario}]}
    """
    if not requisitos_texto or not requisitos_texto.strip():
        requisitos_texto = "No se especificaron requisitos para esta vacante."

    prompt = PROMPT_TEMPLATE.format(
        cv_json=json.dumps(cv_json, ensure_ascii=False, indent=2),
        requisitos_texto=requisitos_texto,
    )

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": modelo, "prompt": prompt, "stream": False},
            timeout=120,
        )
        response.raise_for_status()
        texto = response.json().get("response", "")
    except Exception:
        return FALLBACK

    # Extraer bloque JSON de la respuesta (Ollama puede incluir texto extra)
    match = re.search(r'\{.*\}', texto, re.DOTALL)
    if not match:
        return FALLBACK

    try:
        resultado = json.loads(match.group())
    except json.JSONDecodeError:
        return FALLBACK

    # Validar estructura mínima
    puntaje = resultado.get("puntaje_total", 0)
    desglose = resultado.get("desglose", [])

    if not isinstance(puntaje, (int, float)) or not isinstance(desglose, list):
        return FALLBACK

    return {
        "puntaje_total": max(0, min(100, int(puntaje))),
        "desglose": desglose,
    }
