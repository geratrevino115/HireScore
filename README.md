# HireScore

Sistema de evaluacion automatica de CVs y entrevistas para reclutamiento.
Toma un CV (PDF/DOCX) + descriptor de vacante + opcional audio de entrevista,
y devuelve un puntaje 0-100 con desglose **auditable** por dimension.

> El LLM solo extrae datos estructurados; el scoring es deterministico
> (puro Python sobre features ponderados). Reproducible, explicable y
> defensible legalmente.

---

## Caracteristicas implementadas

- **Provider LLM pluggable** — Ollama (local) o Claude (cloud) via env, mismo codigo
- **Scoring deterministico** con pesos configurables por vacante
- **Cache de extraccion de requisitos** por hash (no re-llama al LLM)
- **Tracking de costos** por analisis (tokens + USD por proveedor/modelo)
- **Endpoint de explicabilidad** que cumple AI Act Art. 13 y GDPR Art. 22
- **Logging JSON estructurado** con auditoria de cada scoring emitido
- **Pipeline async no-bloqueante** (Whisper/pyannote en thread pool)
- **Dashboard HTML** sin frameworks para probar todas las integraciones
- **64 tests** unitarios + integracion con SQLite en memoria

Plan completo del proyecto en [`PLAN.md`](PLAN.md).

---

## Requisitos

- Python 3.10+
- PostgreSQL corriendo localmente
- Uno de los dos providers:
  - **Ollama** corriendo en `http://localhost:11434` con `llama3.2` (o equivalente)
  - **Anthropic API key** (recomendado para mejor calidad)

---

## Setup

```bash
# 1. Clonar y entrar al proyecto
cd HireScore

# 2. Instalar dependencias
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 3. Crear la base de datos en Postgres
createdb hirescore

# 4. Copiar variables de entorno
cp .env.example .env
# Edita .env si quieres cambiar provider, modelo, claves
```

### Variables de entorno (`.env`)

```bash
DATABASE_URL=postgresql+asyncpg://postgres@localhost:5432/hirescore

# Eligue uno: 'ollama' (local) o 'claude' (cloud)
LLM_PROVIDER=ollama

# Si usas Ollama:
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2

# Si usas Claude:
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

Las tablas se crean automaticamente al arrancar (`Base.metadata.create_all` +
migraciones livianas idempotentes via `ADD COLUMN IF NOT EXISTS`).

---

## Como correr

```bash
python main.py
```

- API: <http://localhost:8000>
- Dashboard de prueba: <http://localhost:8000/app>
- Swagger interactivo: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

El servidor corre con `--reload`, asi que cualquier cambio en codigo
se recarga automaticamente.

---

## Dashboard de prueba

`dashboard/public/index.html` es una pagina HTML sin frameworks para
probar la API end-to-end desde el navegador. Cubre:

- Crear y listar candidatos
- Crear y listar vacantes con texto de requisitos
- Configurar pesos custom de scoring por vacante
- Subir CV (PDF/DOCX) + audio opcional, procesar sincrono o async
- Ver explicabilidad completa de un puntaje (features, pesos, skills, evidencias)
- Ver costo en USD por analisis con desglose por operacion LLM
- Ranking de candidatos por vacante

---

## Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET    | `/health` | Estado de DB y LLM provider |
| POST   | `/candidates/` | Crear candidato |
| GET    | `/candidates/` | Listar candidatos |
| POST   | `/vacancies/` | Crear vacante con requisitos |
| GET    | `/vacancies/` | Listar vacantes |
| PUT    | `/vacancies/{id}/requisitos` | Actualizar texto de requisitos (invalida cache) |
| PUT    | `/vacancies/{id}/pesos` | Configurar pesos custom de scoring |
| DELETE | `/vacancies/{id}/pesos` | Volver a pesos default |
| POST   | `/analyses/procesar` | Pipeline completo sincrono |
| POST   | `/analyses/procesar-async` | Pipeline en background con polling |
| GET    | `/analyses/job/{job_id}` | Estado de un job async |
| GET    | `/analyses/{id}/explicacion` | Justificacion auditable del puntaje |
| GET    | `/analyses/{id}/costo` | Tokens y USD por operacion |
| GET    | `/vacancies/{id}/ranking` | Candidatos ordenados por puntaje |
| GET    | `/vacancies/{id}/costo-total` | Costo acumulado de todos los analisis |

Lista completa con esquemas en `/docs`.

---

## Arquitectura

```
api/                          # FastAPI
  app.py                      # Factory, CORS, mount /app, lifespan
  config.py                   # Variables de entorno
  schemas.py                  # Pydantic request/response
  endpoints/                  # Routers por dominio

handlers/
  llm/                        # Abstraccion de proveedor LLM
    base.py                   # Interfaz LLMProvider
    schemas.py                # CVEstructurado, RequisitosEstructurados, SoftSkillsResult
    prompts.py                # Plantillas centralizadas
    ollama_provider.py        # Implementacion local (format=json)
    claude_provider.py        # Implementacion cloud (tool use + prompt caching)
    factory.py                # Selector via env

  scoring/                    # Scoring deterministico
    taxonomy.py               # Skills canonicos con sinonimos
    weights.py                # PesosScoring validado
    features.py               # Extraccion de features [0..1]
    scorer.py                 # Calculo + ResultadoScoring auditable

  cvs/parsers/cv_reader.py    # PDF (PyMuPDF) y DOCX (python-docx)

  interview/
    transcriptor.py           # Whisper + pyannote
    analisis_sentimiento.py   # VADER in-memory

  observability/
    logger.py                 # JSON logger + audit_scoring
    costs.py                  # Tabla de precios por modelo
    usage.py                  # ContextVar collector de tokens

db/
  database.py                 # Engine async + migraciones livianas
  models.py                   # Candidato, Vacante, Analisis, Transcripcion, CostoLLM
  crud.py                     # Funciones async

dashboard/public/
  index.html                  # Tester HTML single-file
  styles.css                  # CSS legacy (no usado por index.html actual)

validation/
  calibrate.py                # Spearman + MAE + grid search de pesos
  golden_set_template.csv     # Plantilla del gold set
  README.md                   # Workflow de calibracion

tests/                        # 64 tests pytest
PLAN.md                       # Plan completo del proyecto
```

---

## Cambiar de proveedor LLM

```bash
# Tier SaaS (cloud, mejor calidad, costo bajo por CV)
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-haiku-4-5-20251001

# Tier enterprise (self-hosted, sin enviar datos)
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen2.5:14b   # mejor en espanol que llama3.2
```

Sin cambios de codigo. La interfaz `LLMProvider` aisla todo.

---

## Tests

```bash
pytest -q                    # corre todos
pytest tests/test_scoring.py # un archivo
pytest -k "explicabilidad"   # por nombre
```

Los tests no llaman a Ollama ni Claude reales — usan mocks de `httpx` y
SQLite en memoria. Corren en ~5 segundos.

---

## Calibracion de pesos

```bash
# Ver workflow completo en validation/README.md
python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache --sweep
```

Bloqueo actual: necesita un gold-set real etiquetado por experto RH.
Recomendacion: empezar con CVs sinteticos para una primera senal antes
de invertir en data real (evita fricciones legales). Detalles en
[PLAN.md § A.4](PLAN.md).

---

## Estado del proyecto

- **Fase A (MVP demoable)** — completa
- **Fase B (producto vendible)** — pendiente: multi-tenancy, auth, Alembic, S3, queue real, bias auditing
- **Fase C (enterprise-ready)** — pendiente: docker, K8s, OpenTelemetry, compliance documentado

Roadmap detallado con criterios de aceptacion por fase en [`PLAN.md`](PLAN.md).

---

## Stack

- **API**: FastAPI + Uvicorn
- **DB**: PostgreSQL + SQLAlchemy 2.0 async + asyncpg
- **CV parsing**: PyMuPDF, python-docx
- **Audio**: openai-whisper + pyannote.audio + scikit-learn (clustering)
- **Sentimiento**: NLTK VADER
- **LLM**: Ollama (httpx) o Anthropic SDK
- **Tests**: pytest + pytest-asyncio + aiosqlite
