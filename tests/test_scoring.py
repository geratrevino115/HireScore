"""Tests del scoring deterministico.

No mockean red ni LLM: el scorer es puro Python sobre features tipados.
"""
import pytest
from handlers.llm.schemas import (
    CVEstructurado,
    Skill,
    Experiencia,
    Educacion,
    DatosPersonales,
    SkillCategoria,
    NivelEducativo,
    RequisitosEstructurados,
    SkillRequerido,
    SoftSkillsResult,
    DimensionSoftSkill,
)
from handlers.scoring.scorer import calcular_score, ResultadoScoring
from handlers.scoring.weights import PesosScoring


def _cv_demo() -> CVEstructurado:
    return CVEstructurado(
        datos_personales=DatosPersonales(nombre="Juan Perez"),
        skills=[
            Skill(nombre="Python", categoria=SkillCategoria.LENGUAJE, años_experiencia=5),
            Skill(nombre="FastAPI", categoria=SkillCategoria.FRAMEWORK, años_experiencia=3),
            Skill(nombre="PostgreSQL", categoria=SkillCategoria.BASE_DATOS, años_experiencia=4),
            Skill(nombre="Docker", categoria=SkillCategoria.DEVOPS, años_experiencia=2),
        ],
        experiencia=[
            Experiencia(empresa="Acme", puesto="Backend dev", años=5),
        ],
        educacion=[
            Educacion(institucion="UNAM", titulo="Ing. Sistemas", nivel=NivelEducativo.LICENCIATURA),
        ],
        años_experiencia_total=5.0,
    )


def _req_demo(años_min=3, nivel_edu=NivelEducativo.LICENCIATURA) -> RequisitosEstructurados:
    return RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(nombre="Python", obligatorio=True),
            SkillRequerido(nombre="PostgreSQL", obligatorio=True),
            SkillRequerido(nombre="Docker", obligatorio=False),
            SkillRequerido(nombre="Kubernetes", obligatorio=False),
        ],
        años_experiencia_min=años_min,
        nivel_educativo_min=nivel_edu,
    )


def test_score_es_deterministico():
    cv = _cv_demo()
    req = _req_demo()
    r1 = calcular_score(cv, req)
    r2 = calcular_score(cv, req)
    assert r1.puntaje_total == r2.puntaje_total
    assert r1.features_crudos == r2.features_crudos


def test_match_obligatorios_perfecto():
    cv = _cv_demo()
    req = _req_demo()
    r = calcular_score(cv, req)
    assert r.features_crudos["match_skills_obligatorios"] == 1.0


def test_match_obligatorios_parcial():
    cv = _cv_demo()
    req = RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(nombre="Python", obligatorio=True),
            SkillRequerido(nombre="Java", obligatorio=True),  # falta
        ],
    )
    r = calcular_score(cv, req)
    assert r.features_crudos["match_skills_obligatorios"] == 0.5


def test_experiencia_capea_a_uno():
    cv = _cv_demo()
    req = _req_demo(años_min=2)  # cv tiene 5
    r = calcular_score(cv, req)
    assert r.features_crudos["experiencia"] == 1.0


def test_experiencia_insuficiente():
    cv = _cv_demo()
    req = _req_demo(años_min=10)
    r = calcular_score(cv, req)
    assert r.features_crudos["experiencia"] == 0.5


def test_educacion_no_alcanza_minimo():
    cv = CVEstructurado(
        skills=[Skill(nombre="Python")],
        educacion=[Educacion(nivel=NivelEducativo.TECNICO)],
    )
    req = _req_demo(nivel_edu=NivelEducativo.MAESTRIA)
    r = calcular_score(cv, req)
    assert 0 < r.features_crudos["educacion"] < 1


def test_puntaje_en_rango():
    cv = _cv_demo()
    req = _req_demo()
    r = calcular_score(cv, req)
    assert 0 <= r.puntaje_total <= 100


def test_desglose_tiene_seis_categorias():
    r = calcular_score(_cv_demo(), _req_demo())
    assert len(r.desglose) == 6


def test_skills_match_y_faltantes_se_reportan():
    cv = _cv_demo()
    req = RequisitosEstructurados(
        skills_requeridos=[
            SkillRequerido(nombre="Python", obligatorio=True),
            SkillRequerido(nombre="Rust", obligatorio=True),
        ],
    )
    r = calcular_score(cv, req)
    assert "Python" in r.skills_match
    assert "Rust" in r.skills_faltantes


def test_soft_skills_suben_puntaje():
    cv = _cv_demo()
    req = _req_demo()
    soft_alta = SoftSkillsResult(
        comunicacion=DimensionSoftSkill(puntaje=90),
        resolucion_problemas=DimensionSoftSkill(puntaje=85),
        trabajo_equipo=DimensionSoftSkill(puntaje=88),
    )
    soft_baja = SoftSkillsResult(
        comunicacion=DimensionSoftSkill(puntaje=20),
        resolucion_problemas=DimensionSoftSkill(puntaje=30),
        trabajo_equipo=DimensionSoftSkill(puntaje=25),
    )
    r_alta = calcular_score(cv, req, soft_skills=soft_alta)
    r_baja = calcular_score(cv, req, soft_skills=soft_baja)
    assert r_alta.puntaje_total > r_baja.puntaje_total


def test_sentimiento_normaliza_correctamente():
    cv = _cv_demo()
    req = _req_demo()
    r_pos = calcular_score(cv, req, sentimiento_compound=1.0)
    r_neg = calcular_score(cv, req, sentimiento_compound=-1.0)
    assert r_pos.features_crudos["sentimiento"] == 1.0
    assert r_neg.features_crudos["sentimiento"] == 0.0


def test_pesos_personalizados_se_aplican():
    cv = _cv_demo()
    req = _req_demo()
    pesos_custom = PesosScoring(
        match_skills_obligatorios=0.50,
        match_skills_deseables=0.20,
        experiencia=0.10,
        educacion=0.10,
        soft_skills=0.05,
        sentimiento=0.05,
    )
    r = calcular_score(cv, req, pesos=pesos_custom)
    assert r.pesos_usados["match_skills_obligatorios"] == 0.50


def test_pesos_que_no_suman_uno_lanzan_error():
    with pytest.raises(ValueError):
        PesosScoring(
            match_skills_obligatorios=0.9,
            match_skills_deseables=0.9,
            experiencia=0.9,
            educacion=0.9,
            soft_skills=0.9,
            sentimiento=0.9,
        )


def test_resultado_es_pydantic_serializable():
    r = calcular_score(_cv_demo(), _req_demo())
    assert isinstance(r, ResultadoScoring)
    dump = r.model_dump()
    assert "puntaje_total" in dump
    assert "desglose" in dump
    assert "features_crudos" in dump
