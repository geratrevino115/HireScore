from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from db.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import vacancies, analyses, ollamaAPI, uploads  # Importar desde endpoints
import os
import shutil
from db.crud import create_upload_record
from db.database import get_db 
from sqlalchemy.ext.asyncio import AsyncSession

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
app.include_router(ollamaAPI.router)
app.include_router(uploads.router)  # Puedes asignar un prefijo si lo deseas


@app.on_event("startup")
async def on_startup():
    await init_db()
