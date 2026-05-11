from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from api.config import DATABASE_URL

# Crear el motor de base de datos
engine = create_async_engine(DATABASE_URL, echo=True)

# Crear la sesión asíncrona
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Base para los modelos
Base = declarative_base()

# Dependencia para obtener la sesión de la BD
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Migraciones livianas idempotentes para columnas nuevas. Mientras no usemos
# Alembic, esto evita que un DB existente quede sin columnas tras un deploy.
_COLUMNAS_NUEVAS = [
    ("vacantes", "requisitos_estructurados_json", "JSONB"),
    ("vacantes", "requisitos_texto_hash", "VARCHAR(64)"),
    ("vacantes", "pesos_json", "JSONB"),
    ("analisis", "cv_estructurado_json", "JSONB"),
    ("analisis", "requisitos_snapshot_json", "JSONB"),
    ("analisis", "soft_skills_json", "JSONB"),
    ("analisis", "features_crudos_json", "JSONB"),
    ("analisis", "pesos_aplicados_json", "JSONB"),
    ("analisis", "skills_match", "JSONB"),
    ("analisis", "skills_faltantes", "JSONB"),
    ("analisis", "preguntas_cv_json", "JSONB"),
    ("analisis", "evaluacion_entrevista_json", "JSONB"),
    ("candidatos", "email", "VARCHAR(255)"),
    ("candidatos", "telefono", "VARCHAR(50)"),
    ("aplicaciones", "etapa", "VARCHAR(20) DEFAULT 'nueva' NOT NULL"),
    ("aplicaciones", "notas", "TEXT"),
    ("aplicaciones", "actualizada_en", "TIMESTAMPTZ"),
    ("analisis", "aplicacion_id", "INTEGER"),
]


_INDICES_NUEVOS = [
    ("ix_candidatos_email", "candidatos", "email"),
    ("ix_aplicaciones_etapa", "aplicaciones", "etapa"),
    ("ix_analisis_aplicacion_id", "analisis", "aplicacion_id"),
]


async def _ensure_columns(conn):
    from sqlalchemy import text
    for tabla, columna, tipo in _COLUMNAS_NUEVAS:
        await conn.execute(
            text(f'ALTER TABLE {tabla} ADD COLUMN IF NOT EXISTS {columna} {tipo}')
        )
    for indice, tabla, columna in _INDICES_NUEVOS:
        await conn.execute(
            text(f'CREATE INDEX IF NOT EXISTS {indice} ON {tabla} ({columna})')
        )


# Inicializar la base de datos al iniciar la app
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _ensure_columns(conn)
