"""Extraccion de features comparables a partir de CV + Requisitos.

Cada funcion devuelve un valor en [0, 1]. Son inputs del scorer determinístico.
"""
from __future__ import annotations
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
    NivelEducativo,
)
from handlers.scoring import taxonomy


_NIVEL_EDU_RANK = {
    NivelEducativo.NINGUNO: 0,
    NivelEducativo.TECNICO: 1,
    NivelEducativo.LICENCIATURA: 2,
    NivelEducativo.MAESTRIA: 3,
    NivelEducativo.DOCTORADO: 4,
}


def _skills_canonicos_cv(cv: CVEstructurado) -> set[str]:
    canonicos: set[str] = set()
    for s in cv.skills:
        c = s.nombre_normalizado or taxonomy.normalizar(s.nombre)
        if c:
            canonicos.add(c)
    return canonicos


def feature_match_skills(
    cv: CVEstructurado,
    requisitos: RequisitosEstructurados,
    obligatorios: bool,
) -> float:
    """Fraccion de skills (obligatorios o deseables) que cubre el CV. 0..1."""
    relevantes = [r for r in requisitos.skills_requeridos if r.obligatorio == obligatorios]
    if not relevantes:
        return 1.0  # nada que cumplir -> match perfecto
    requeridos_canon: set[str] = set()
    for r in relevantes:
        c = r.nombre_normalizado or taxonomy.normalizar(r.nombre)
        if c:
            requeridos_canon.add(c)
    if not requeridos_canon:
        # los requeridos no existen en taxonomia: comparamos por substring lowercase
        cv_blob = " ".join(s.nombre.lower() for s in cv.skills)
        hits = sum(1 for r in relevantes if r.nombre.lower() in cv_blob)
        return hits / len(relevantes)
    cv_canon = _skills_canonicos_cv(cv)
    return len(requeridos_canon & cv_canon) / len(requeridos_canon)


def feature_experiencia(cv: CVEstructurado, requisitos: RequisitosEstructurados) -> float:
    """Razon años_cv / años_requeridos, capada a 1.0. Si no hay requisito, 1.0."""
    minimo = requisitos.años_experiencia_min
    if minimo is None or minimo <= 0:
        return 1.0
    if cv.años_experiencia_total <= 0:
        return 0.0
    return min(1.0, cv.años_experiencia_total / minimo)


def feature_educacion(cv: CVEstructurado, requisitos: RequisitosEstructurados) -> float:
    """1.0 si el nivel educativo del CV alcanza el minimo; degrada linealmente si no."""
    minimo = _NIVEL_EDU_RANK[requisitos.nivel_educativo_min]
    if minimo == 0:
        return 1.0
    if not cv.educacion:
        return 0.0
    max_cv = max(_NIVEL_EDU_RANK[e.nivel] for e in cv.educacion)
    if max_cv >= minimo:
        return 1.0
    return max_cv / minimo


def feature_soft_skills(soft: SoftSkillsResult | None) -> float:
    if soft is None:
        return 0.5  # neutro si no hay entrevista
    return soft.promedio / 100.0


def feature_sentimiento(sentimiento_compound: float | None) -> float:
    """VADER compound viene en [-1, 1]; lo mapeamos a [0, 1]."""
    if sentimiento_compound is None:
        return 0.5
    return max(0.0, min(1.0, (sentimiento_compound + 1) / 2))


def extraer_todos(
    cv: CVEstructurado,
    requisitos: RequisitosEstructurados,
    soft: SoftSkillsResult | None,
    sentimiento: float | None,
) -> dict[str, float]:
    return {
        "match_skills_obligatorios": feature_match_skills(cv, requisitos, obligatorios=True),
        "match_skills_deseables":    feature_match_skills(cv, requisitos, obligatorios=False),
        "experiencia":               feature_experiencia(cv, requisitos),
        "educacion":                 feature_educacion(cv, requisitos),
        "soft_skills":               feature_soft_skills(soft),
        "sentimiento":               feature_sentimiento(sentimiento),
    }
