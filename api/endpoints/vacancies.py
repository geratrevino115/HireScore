from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from api.schemas import (
    VacanteCreate,
    VacanteRead,
    VacanteUpdateRequisitos,
    VacanteUpdatePesos,
    CandidatoRanking,
    CostoVacanteResumen,
    VacanteDraft,
    GenerarVacanteBody,
    GuiaEntrevistaRead,
    PreguntaEntrevistaRead,
)
from db.crud import (
    create_vacante,
    get_vacantes,
    get_vacante,
    update_vacante_requisitos,
    update_vacante_pesos,
    get_ranking_por_vacante,
    get_costo_total_vacante,
    get_guia_entrevista,
    upsert_guia_entrevista,
    delete_guia_entrevista,
    cache_requisitos_estructurados,
)
from handlers.scoring.weights import PesosScoring
from handlers.cvs.parsers.cv_reader import extract_text
from handlers.llm import get_llm_provider
from handlers.llm.base import LLMError
from handlers.llm.schemas import GenerarVacanteInputs, RequisitosEstructurados
from handlers.observability import start_collection, stop_collection
import hashlib
import os, uuid, shutil

router = APIRouter(prefix="/vacancies", tags=["Vacantes"])

REQ_FOLDER = "data/req_data"


def _hash_texto(t: str) -> str:
    return hashlib.sha256((t or "").encode("utf-8")).hexdigest()


@router.post("/", response_model=VacanteRead)
async def add_vacante(vacante: VacanteCreate, db: AsyncSession = Depends(get_db)):
    return await create_vacante(db, vacante.titulo, vacante.descripcion, vacante.requisitos_texto)


@router.get("/", response_model=list[VacanteRead])
async def list_vacantes(db: AsyncSession = Depends(get_db)):
    return await get_vacantes(db)


@router.get("/{vacante_id}", response_model=VacanteRead)
async def get_vacante_by_id(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put("/{vacante_id}/requisitos", response_model=VacanteRead)
async def set_requisitos(vacante_id: int, body: VacanteUpdateRequisitos, db: AsyncSession = Depends(get_db)):
    vacante = await update_vacante_requisitos(db, vacante_id, body.requisitos_texto)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.post("/{vacante_id}/requisitos/from-file", response_model=VacanteRead)
async def set_requisitos_from_file(
    vacante_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF o DOCX")

    os.makedirs(REQ_FOLDER, exist_ok=True)
    path = os.path.join(REQ_FOLDER, f"{uuid.uuid4()}{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        texto = extract_text(path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el archivo: {e}")

    vacante = await update_vacante_requisitos(db, vacante_id, texto)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put("/{vacante_id}/pesos", response_model=VacanteRead)
async def set_pesos(vacante_id: int, body: VacanteUpdatePesos, db: AsyncSession = Depends(get_db)):
    """Configura pesos custom del scoring para esta vacante. Deben sumar ~1.0."""
    try:
        pesos = PesosScoring(**body.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    vacante = await update_vacante_pesos(db, vacante_id, pesos.as_dict())
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.delete("/{vacante_id}/pesos", response_model=VacanteRead)
async def reset_pesos(vacante_id: int, db: AsyncSession = Depends(get_db)):
    """Limpia los pesos custom; vuelve a usar PESOS_DEFAULT."""
    vacante = await update_vacante_pesos(db, vacante_id, None)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.get("/{vacante_id}/costo-total", response_model=CostoVacanteResumen)
async def costo_total_vacante(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    resumen = await get_costo_total_vacante(db, vacante_id)
    return CostoVacanteResumen(vacante_id=vacante_id, **resumen)


# ---------------------------------------------------------------------------
# Wizard de creación: extraer desde archivo + generación asistida por IA
# ---------------------------------------------------------------------------


@router.post("/extraer-desde-archivo", response_model=VacanteDraft)
async def extraer_desde_archivo(file: UploadFile = File(...)):
    """Sube un PDF/DOCX con la JD; devuelve un draft (titulo + descripcion +
    requisitos_texto) para que el reclutador revise antes de crear la vacante.
    No persiste nada."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".pdf", ".docx"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF o DOCX")

    os.makedirs(REQ_FOLDER, exist_ok=True)
    path = os.path.join(REQ_FOLDER, f"{uuid.uuid4()}{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    try:
        texto = extract_text(path)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el archivo: {e}")

    provider = get_llm_provider()
    try:
        draft = await provider.extract_vacancy_from_text(texto)
    except LLMError as e:
        raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
    return VacanteDraft.model_validate(draft.model_dump())


@router.post("/generar", response_model=VacanteDraft)
async def generar_borrador(body: GenerarVacanteBody):
    """Modo 'IA asistida' del wizard: recibe inputs basicos y devuelve un
    borrador editable. No persiste nada."""
    provider = get_llm_provider()
    inputs = GenerarVacanteInputs(**body.model_dump())
    try:
        draft = await provider.generate_vacancy_draft(inputs)
    except LLMError as e:
        raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
    return VacanteDraft.model_validate(draft.model_dump())


# ---------------------------------------------------------------------------
# Guía de entrevista
# ---------------------------------------------------------------------------


@router.get("/{vacante_id}/guia-entrevista", response_model=GuiaEntrevistaRead)
async def obtener_guia(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    guia = await get_guia_entrevista(db, vacante_id)
    if not guia:
        raise HTTPException(
            status_code=404,
            detail="Aún no hay guía de entrevista. Genera una con POST /vacancies/{id}/guia-entrevista",
        )
    return GuiaEntrevistaRead(
        vacante_id=guia.vacante_id,
        preguntas=[PreguntaEntrevistaRead(**p) for p in (guia.preguntas_json or [])],
        criterios_evaluacion=guia.criterios_json or [],
        senales_de_alerta=guia.senales_alerta_json or [],
        generada_en=guia.generada_en,
    )


@router.post("/{vacante_id}/guia-entrevista", response_model=GuiaEntrevistaRead)
async def generar_guia(vacante_id: int, db: AsyncSession = Depends(get_db)):
    """Genera la guia de entrevista (preguntas + criterios + senales).
    Reemplaza la guia existente si la hay. Requiere que la vacante tenga
    requisitos_texto configurados."""
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    if not (vacante.requisitos_texto or "").strip():
        raise HTTPException(
            status_code=422,
            detail="La vacante no tiene requisitos. Edítalos antes de generar la guía.",
        )

    provider = get_llm_provider()
    start_collection()
    try:
        # Reusa cache de requisitos estructurados si está vigente
        texto_hash = _hash_texto(vacante.requisitos_texto or "")
        if (
            vacante.requisitos_texto_hash == texto_hash
            and vacante.requisitos_estructurados_json
        ):
            requisitos = RequisitosEstructurados.model_validate(
                vacante.requisitos_estructurados_json
            )
        else:
            try:
                requisitos = await provider.extract_requisitos(vacante.requisitos_texto)
            except LLMError as e:
                raise HTTPException(
                    status_code=502, detail=f"Error extrayendo requisitos: {e}"
                )
            await cache_requisitos_estructurados(
                db, vacante_id, texto_hash, requisitos.model_dump()
            )

        try:
            resultado = await provider.generate_interview_guide(
                requisitos, descripcion=vacante.descripcion or ""
            )
        except LLMError as e:
            raise HTTPException(status_code=502, detail=f"Error del proveedor LLM: {e}")
    finally:
        stop_collection()

    guia = await upsert_guia_entrevista(
        db,
        vacante_id,
        preguntas=[p.model_dump() for p in resultado.preguntas],
        criterios=resultado.criterios_evaluacion,
        senales_alerta=resultado.senales_de_alerta,
    )
    return GuiaEntrevistaRead(
        vacante_id=guia.vacante_id,
        preguntas=[PreguntaEntrevistaRead(**p) for p in (guia.preguntas_json or [])],
        criterios_evaluacion=guia.criterios_json or [],
        senales_de_alerta=guia.senales_alerta_json or [],
        generada_en=guia.generada_en,
    )


@router.delete("/{vacante_id}/guia-entrevista")
async def eliminar_guia(vacante_id: int, db: AsyncSession = Depends(get_db)):
    ok = await delete_guia_entrevista(db, vacante_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Guía no encontrada")
    return {"deleted": True}


@router.get("/{vacante_id}/ranking", response_model=list[CandidatoRanking])
async def ranking_candidatos(vacante_id: int, db: AsyncSession = Depends(get_db)):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    rows = await get_ranking_por_vacante(db, vacante_id)
    return [
        CandidatoRanking(
            candidato_id=analisis.candidato_id,
            nombre=candidato.nombre,
            puntaje_total=analisis.puntaje_total,
            sentimiento_compound=analisis.sentimiento_compound,
            analisis_id=analisis.id,
            analizado_en=analisis.analizado_en,
        )
        for analisis, candidato in rows
    ]
