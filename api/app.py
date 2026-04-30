import requests
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db.database import init_db, engine
from api.endpoints import vacancies, analyses, ollamaAPI, uploads, candidates
from api.config import OLLAMA_URL


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

    ollama_ok = False
    try:
        resp = requests.get(OLLAMA_URL.replace("/api/generate", ""), timeout=3)
        ollama_ok = resp.status_code == 200
    except Exception:
        pass

    status = "ok" if db_ok and ollama_ok else "degradado"
    return {"status": status, "database": db_ok, "ollama": ollama_ok}


# Servir el dashboard en /app
app.mount("/app", StaticFiles(directory="dashboard/public", html=True), name="dashboard")
