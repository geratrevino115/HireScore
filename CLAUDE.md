# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripcion del proyecto

HireScore es un sistema de evaluacion de CVs y entrevistas que extrae informacion estructurada de CVs (PDF/DOCX), transcribe y diariza audio de entrevistas, analiza el sentimiento de los candidatos y genera comparaciones de puntuacion contra vacantes. El idioma principal del codigo, datos y comentarios es el espanol.

## Iniciar la API

```bash
# Instalar dependencias
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Iniciar el servidor FastAPI (desde la raiz del proyecto)
python main.py
# Corre en http://localhost:8000 con hot-reload
# Documentacion interactiva en http://localhost:8000/docs
```

**Prerequisitos:**
- PostgreSQL corriendo localmente: `postgresql+asyncpg://postgres@localhost:5432/hirescore` (sin contrasena)
- Ollama corriendo localmente en `http://localhost:11434` con el modelo `llama3.2` descargado

Las tablas de la base de datos se crean automaticamente al iniciar la app via `Base.metadata.create_all`.

## Arquitectura

```
api/              # Aplicacion FastAPI
  app.py          # Factory de la app, CORS, registro de routers, init de BD al arrancar
  schemas.py      # Modelos Pydantic de request/response
  endpoints/
    vacancies.py  # CRUD de vacantes (prefijo: /vacancies)
    analyses.py   # CRUD de analisis de scoring (prefijo: /analyses)
    uploads.py    # Endpoints de carga de archivos (/upload/audio, /upload/cv, /upload/requisitos)
    ollamaAPI.py  # Proxy al LLM local Ollama (/generate, /generate_stream, /generate_keypoints)

db/               # ORM asincrono SQLAlchemy (asyncpg + PostgreSQL)
  database.py     # Motor, sesion, dependencia get_db
  models.py       # Dos conjuntos de modelos paralelos (ver nota abajo)
  crud.py         # Funciones CRUD asincronas

handlers/
  cvs/parsers/cv_reader.py          # Extraccion de texto de PDF (PyMuPDF/fitz) y DOCX (python-docx)
  interview/transcriptor.py         # Transcripcion con Whisper + diarizacion con pyannote → SQLite
  interview/analisis_sentimiento.py # Analisis de sentimiento VADER (NLTK) sobre SQLite de transcripciones
  scoring/                          # Aun no implementado

dashboard/        # Frontend estatico (HTML/CSS/JS en templates/ y public/)
notebooks/        # Scripts exploratorios/prototipo, no forman parte de la API de produccion
```

### Nota sobre los modelos de BD

`db/models.py` tiene dos conjuntos de modelos paralelos que aun no estan unificados:
- **Ingles** (`Vacancy`, `Analysis`, `Upload`): usados por los endpoints de la API
- **Espanol** (`Vacante`, `Requisito`, `Candidato`, `CVComponente`, `Aplicacion`): definidos pero sin conectar a ningun endpoint todavia

### Almacenamiento de archivos

Los archivos subidos se guardan con nombres generados por UUID:
- `data/cv_data/` — PDFs y DOCX de CVs
- `data/audio_data/` — audios de entrevistas
- `data/req_data/` — documentos de requisitos de vacantes
- `handlers/cvs/outputs/` — texto extraido de CVs (TXT)

### Integracion con Ollama (LLM)

`/generate_keypoints` envia el texto de un CV al Ollama local (llama3.2) y le pide devolver un JSON estructurado con las claves: `datos_personales`, `resumen`, `experiencia_tecnica`, `proyectos_relevantes`, `educacion`, `certificaciones`, `sistema_categorizacion_skills`. El resultado se guarda en `data/cv_data/datos.json`.

### Pipeline de audio

`handlers/interview/transcriptor.py` ejecuta un pipeline en dos pasos: Whisper (modelo `base` por defecto) para la transcripcion, luego `pyannote` + AgglomerativeClustering para la diarizacion de hablantes. La salida se persiste en un archivo SQLite (no PostgreSQL) en `interview_processor/outputs/<nombre_archivo>.db`. El analisis de sentimiento en `analisis_sentimiento.py` lee ese SQLite y actualiza las filas directamente.

## Pendiente de implementar

- Sistema de categorizacion de skills (`handlers/scoring/` esta vacio)
- Deteccion de keywords tecnicos en entrevistas
- Evaluacion de soft skills
- Algoritmo de puntuacion ponderada
- El dashboard frontend es HTML estatico sin integracion con el backend
