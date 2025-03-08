from fastapi import FastAPI
from db.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import vacancies, analyses  # Importar desde endpoints

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar los routers
app.include_router(vacancies.router)
app.include_router(analyses.router)

@app.on_event("startup")
async def on_startup():
    await init_db()
