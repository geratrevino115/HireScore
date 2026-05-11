from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db.database import init_db, engine
from api.endpoints import vacancies, analyses, ollamaAPI, uploads, candidates, aplicaciones
from handlers.llm import get_llm_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await engine.dispose()

app = FastAPI(title="HireScore API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vacancies.router)
app.include_router(analyses.router)
app.include_router(aplicaciones.router)
app.include_router(ollamaAPI.router)
app.include_router(uploads.router)
app.include_router(candidates.router)


@app.get("/health", tags=["Sistema"])
async def health_check():
    from sqlalchemy import text
    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    llm_ok = False
    llm_name = "desconocido"
    try:
        provider = get_llm_provider()
        llm_name = provider.name
        llm_ok = await provider.health()
    except Exception:
        pass

    from db.models import ETAPAS_APLICACION
    status = "ok" if db_ok and llm_ok else "degradado"
    return {
        "status": status,
        "database": db_ok,
        "llm": {"provider": llm_name, "ok": llm_ok},
        "etapas_aplicacion": list(ETAPAS_APLICACION),
    }


# Servir el dashboard en /app
app.mount("/app", StaticFiles(directory="dashboard/public", html=True), name="dashboard")
