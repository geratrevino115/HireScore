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

# Inicializar la base de datos al iniciar la app
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
