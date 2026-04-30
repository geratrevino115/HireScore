from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.models import Candidato, Vacante, Analisis


async def create_candidato(db: AsyncSession, nombre: str):
    candidato = Candidato(nombre=nombre)
    db.add(candidato)
    await db.commit()
    await db.refresh(candidato)
    return candidato

async def get_candidatos(db: AsyncSession):
    result = await db.execute(select(Candidato))
    return result.scalars().all()

async def get_candidato(db: AsyncSession, candidato_id: int):
    result = await db.execute(select(Candidato).where(Candidato.id == candidato_id))
    return result.scalar_one_or_none()


async def create_vacante(db: AsyncSession, titulo: str, descripcion: str = None, requisitos_texto: str = None):
    vacante = Vacante(titulo=titulo, descripcion=descripcion, requisitos_texto=requisitos_texto)
    db.add(vacante)
    await db.commit()
    await db.refresh(vacante)
    return vacante

async def get_vacantes(db: AsyncSession):
    result = await db.execute(select(Vacante))
    return result.scalars().all()

async def get_vacante(db: AsyncSession, vacante_id: int):
    result = await db.execute(select(Vacante).where(Vacante.id == vacante_id))
    return result.scalar_one_or_none()

async def update_vacante_requisitos(db: AsyncSession, vacante_id: int, requisitos_texto: str):
    vacante = await get_vacante(db, vacante_id)
    if not vacante:
        return None
    vacante.requisitos_texto = requisitos_texto
    await db.commit()
    await db.refresh(vacante)
    return vacante


async def create_analisis(
    db: AsyncSession,
    candidato_id: int,
    vacante_id: int,
    puntaje_total: int,
    desglose: list,
    sentimiento_compound: float = None,
):
    analisis = Analisis(
        candidato_id=candidato_id,
        vacante_id=vacante_id,
        puntaje_total=puntaje_total,
        desglose=[d if isinstance(d, dict) else d.model_dump() for d in desglose],
        sentimiento_compound=sentimiento_compound,
    )
    db.add(analisis)
    await db.commit()
    await db.refresh(analisis)
    return analisis

async def get_analisis_por_vacante(db: AsyncSession, vacante_id: int):
    result = await db.execute(select(Analisis).where(Analisis.vacante_id == vacante_id))
    return result.scalars().all()

async def get_analisis(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Analisis).offset(skip).limit(limit))
    return result.scalars().all()
