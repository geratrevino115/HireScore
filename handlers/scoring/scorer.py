"""Scoring deterministico.

El LLM solo extrae datos; este modulo asigna la nota. Es puro Python sobre
features normalizados, sin red ni LLM. Reproducible y auditable.
"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field
from handlers.llm.schemas import (
    CVEstructurado,
    RequisitosEstructurados,
    SoftSkillsResult,
)
from handlers.scoring.weights import PesosScoring, PESOS_DEFAULT
from handlers.scoring.features import extraer_todos
from handlers.scoring import taxonomy
from handlers.observability import audit_scoring


_LABELS = {
    "match_skills_obligatorios": "Skills obligatorios",
    "match_skills_deseables":    "Skills deseables",
    "experiencia":               "Experiencia",
    "educacion":                 "Educacion",
    "soft_skills":               "Soft skills",
    "sentimiento":               "Sentimiento entrevista",
}


class CategoriaDesglose(BaseModel):
    categoria: str
    puntaje: int           # 0-100, contribucion proporcional al peso
    peso: float            # peso usado
    feature: float         # valor crudo en [0,1]
    contribucion: float    # peso * feature, en [0, peso]
    comentario: Optional[str] = None


class ResultadoScoring(BaseModel):
    puntaje_total: int
    desglose: list[CategoriaDesglose]
    features_crudos: dict[str, float]
    pesos_usados: dict[str, float]
    skills_match: list[str] = Field(default_factory=list)
    skills_faltantes: list[str] = Field(default_factory=list)


def calcular_score(
    cv: CVEstructurado,
    requisitos: RequisitosEstructurados,
    soft_skills: SoftSkillsResult | None = None,
    sentimiento_compound: float | None = None,
    pesos: PesosScoring | None = None,
    candidato_id: int | None = None,
    vacante_id: int | None = None,
) -> ResultadoScoring:
    pesos = pesos or PESOS_DEFAULT
    pesos_dict = pesos.as_dict()

    features = extraer_todos(cv, requisitos, soft_skills, sentimiento_compound)

    desglose: list[CategoriaDesglose] = []
    total = 0.0
    for clave, peso in pesos_dict.items():
        feat = features[clave]
        contribucion = peso * feat
        total += contribucion
        desglose.append(
            CategoriaDesglose(
                categoria=_LABELS[clave],
                puntaje=round(feat * 100),
                peso=peso,
                feature=feat,
                contribucion=contribucion,
                comentario=_comentario(clave, feat, soft_skills),
            )
        )

    cv_canon = {
        c for s in cv.skills
        for c in [s.nombre_normalizado or taxonomy.normalizar(s.nombre)] if c
    }
    req_canon = {
        c for r in requisitos.skills_requeridos
        for c in [r.nombre_normalizado or taxonomy.normalizar(r.nombre)] if c
    }
    match = sorted(cv_canon & req_canon)
    faltantes = sorted(req_canon - cv_canon)

    resultado = ResultadoScoring(
        puntaje_total=max(0, min(100, round(total * 100))),
        desglose=desglose,
        features_crudos=features,
        pesos_usados=pesos_dict,
        skills_match=match,
        skills_faltantes=faltantes,
    )
    audit_scoring(
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=resultado.puntaje_total,
        pesos=pesos_dict,
        features=features,
        skills_match=match,
        skills_faltantes=faltantes,
    )
    return resultado


def _comentario(clave: str, feature: float, soft: SoftSkillsResult | None) -> str:
    pct = round(feature * 100)
    if clave == "match_skills_obligatorios":
        if feature >= 0.9:    return "Cumple practicamente todos los skills obligatorios"
        if feature >= 0.6:    return f"Cumple {pct}% de los skills obligatorios"
        return f"Solo cumple {pct}% de los skills obligatorios — gap importante"
    if clave == "match_skills_deseables":
        return f"Cumple {pct}% de los skills deseables"
    if clave == "experiencia":
        if feature >= 1.0:    return "Supera el minimo de años requerido"
        return f"Tiene {pct}% del minimo de años pedido"
    if clave == "educacion":
        if feature >= 1.0:    return "Cumple el nivel educativo minimo"
        return "No alcanza el nivel educativo minimo"
    if clave == "soft_skills":
        if soft is None:      return "Sin entrevista evaluada"
        return f"Promedio soft skills: {pct}/100"
    if clave == "sentimiento":
        return f"Sentimiento normalizado: {pct}/100"
    return ""
