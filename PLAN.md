# HireScore — Plan completo del proyecto

> Producto: sistema de evaluacion automatica de CVs y entrevistas para reclutamiento, vendible a empresas.
>
> Documento vivo. Marca cada checkbox conforme avances. Las recomendaciones al final son tan importantes como el codigo.

---

## 1. Vision y posicionamiento comercial

### 1.1 Que es HireScore
- Pipeline que toma CV + descriptor de vacante + (opcional) entrevista en audio.
- Devuelve un puntaje 0-100 con desglose auditable por dimension.
- LLM solo extrae datos; el scoring es deterministico (no caja negra).

### 1.2 A quien se vende
- **PYMEs / agencias de reclutamiento** — SaaS multi-tenant, bajo costo por analisis.
- **Empresas medianas** — SaaS con scoring mas fino y dashboard.
- **Enterprise regulado** (banca, salud, gobierno) — self-hosted con LLM local.

### 1.3 Tiers tecnicos planeados
| Tier | LLM | Despliegue | Cliente objetivo |
|------|-----|-----------|------------------|
| Starter | Claude Haiku | SaaS multi-tenant | PYME, agencias |
| Pro | Claude Sonnet | SaaS multi-tenant | Empresas medianas |
| Enterprise | Ollama (qwen2.5:14b o llama3.1:70b) | On-prem / VPC del cliente | Banca, salud, gobierno |
| BYOK | API key del cliente (Anthropic/OpenAI/Azure) | SaaS | Empresas con contrato propio |

Todos los tiers usan **el mismo codigo** gracias a la interfaz `LLMProvider`.

---

## 2. Estado actual (lo que YA esta implementado y probado)

### 2.1 Arquitectura LLM pluggable
- [x] Interfaz `LLMProvider` (`handlers/llm/base.py`) con `extract_cv`, `extract_requisitos`, `evaluate_soft_skills`, `health`
- [x] Pydantic schemas tipados (`CVEstructurado`, `RequisitosEstructurados`, `SoftSkillsResult`, etc.)
- [x] Provider Ollama con `format=json` + retry (`handlers/llm/ollama_provider.py`)
- [x] Provider Claude con tool use + prompt caching (`handlers/llm/claude_provider.py`)
- [x] Factory que selecciona via env `LLM_PROVIDER` (`handlers/llm/factory.py`)
- [x] Prompts centralizados (`handlers/llm/prompts.py`)

### 2.2 Scoring deterministico
- [x] Taxonomia de skills con sinonimos y normalizacion (`handlers/scoring/taxonomy.py`)
- [x] Pesos validados configurables (`handlers/scoring/weights.py`)
- [x] Extraccion de features [0..1] por dimension (`handlers/scoring/features.py`)
- [x] Scorer puro Python con desglose auditable, skills_match, skills_faltantes (`handlers/scoring/scorer.py`)

### 2.3 Pipeline de analisis
- [x] Endpoint sincrono `POST /analyses/procesar`
- [x] Endpoint asincrono `POST /analyses/procesar-async` con jobs en memoria
- [x] Cache de extraccion de requisitos por hash en BD (evita re-llamar LLM)
- [x] Audio en thread pool (`asyncio.to_thread`) — no bloquea event loop
- [x] Manejo de errores LLM como HTTP 502

### 2.4 Persistencia
- [x] Modelos en espanol unificados (`Candidato`, `Vacante`, `Analisis`, `Transcripcion`)
- [x] Migracion liviana idempotente (`ADD COLUMN IF NOT EXISTS`) al arrancar
- [x] Transcripciones migradas de SQLite a Postgres con FK a `Analisis` y cascade delete
- [x] CRUD async via SQLAlchemy 2.0 + asyncpg

### 2.5 Observabilidad
- [x] Logging JSON estructurado (`handlers/observability/logger.py`)
- [x] Latencia + status por cada llamada LLM (timed context manager)
- [x] Tokens y cache hits para Claude
- [x] Evento de auditoria por cada scoring emitido (`audit_scoring`)

### 2.6 Tests (49 actualmente, 100% verde)
- [x] Scorer deterministico (14 tests sin red)
- [x] LLM provider con mocks de httpx (6 tests)
- [x] Observability (5 tests)
- [x] Calibracion (5 tests)
- [x] Transcripciones con SQLite en memoria (8 tests)
- [x] API smoke tests (existentes, migrados)

### 2.7 Calibracion
- [x] Scaffold `validation/calibrate.py` con Spearman + MAE
- [x] Cache en disco de extracciones LLM para iterar pesos sin recosto
- [x] Grid search sobre combinaciones de pesos (paso 0.05)
- [x] Plantilla `golden_set_template.csv` y README de workflow

### 2.8 Configuracion
- [x] `.env.example` con `LLM_PROVIDER`, claves Anthropic, modelo Claude
- [x] `requirements.txt` con `anthropic>=0.40.0`
- [x] Endpoint legacy `/generate_keypoints` marcado deprecated

---

## 3. Roadmap pendiente — Fases priorizadas

### FASE A: lo critico para llegar a MVP demoable

#### A.1 Pesos configurables por vacante via API
- [x] Agregar columna `pesos_json` (JSONB nullable) a `vacantes`
- [x] Migracion liviana en `db/database.py:_COLUMNAS_NUEVAS`
- [x] Endpoint `PUT /vacancies/{id}/pesos` que valide via `PesosScoring` pydantic
- [x] Endpoint `DELETE /vacancies/{id}/pesos` para volver a default
- [x] Pipeline pasa los pesos custom al scorer cuando existen
- [x] Test que verifique distintos pesos producen distintos scores

#### A.2 Tracking de costos por analisis
- [x] Modelo `CostoLLM` (una fila por llamada al LLM, FK a `analisis`)
- [x] Tabla de precios estatica `handlers/observability/costs.py` (Haiku/Sonnet/Opus/Ollama)
- [x] `UsageEvent` + ContextVar collector para capturar tokens sin refactor de firmas
- [x] Capturar usage del SDK Anthropic (input/output/cache_read/cache_creation) en `claude_provider`
- [x] Capturar usage de Ollama (`prompt_eval_count`, `eval_count`) en `ollama_provider`
- [x] Persistir lote de costos tras cada analisis
- [x] Endpoint `GET /analyses/{id}/costo` y `GET /vacancies/{id}/costo-total`
- [ ] Dashboard de costos por cliente (esto va en A.5 / Fase B)

#### A.3 Endpoint de explicabilidad detallada
- [x] Persistir snapshot completo en `Analisis` (cv_estructurado, requisitos, soft_skills, features, pesos, skills_match, skills_faltantes)
- [x] `GET /analyses/{id}/explicacion` que devuelve toda la justificacion
- [x] Disclaimer legal automatico: "Este puntaje es asistencia, no decision final"
- [x] Las evidencias literales de soft skills vienen de la entrevista (campo `evidencias` en cada dimension)
- [ ] Citas literales del CV por skill: pendiente para Fase B (requiere extender prompts del LLM para que devuelva line numbers / spans)

#### A.4 Validacion del MVP — BLOQUEADO POR DATA HUMANA

**Estado**: codigo listo (`validation/calibrate.py`), falta el gold-set real.

**Criterios de aceptacion**:
- [ ] Reunir 15-20 CVs reales (autorizacion del candidato + RH para usarlos)
- [ ] Anonimizar los CVs (quitar telefono, email, direccion)
- [ ] Definir 1-3 vacantes representativas con descriptor de requisitos
- [ ] Un experto RH asigna puntaje 0-100 a cada combinacion (CV, vacante)
- [ ] Llenar `validation/golden_set.csv` con `cv_path`, `requisitos_path`, `puntaje_humano`, `nota`
- [ ] Correr `python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache`
- [ ] Si Spearman >= 0.7 y MAE <= 12 — listo, documentar
- [ ] Si no — correr con `--sweep` y aplicar mejores pesos a `weights.py:PESOS_DEFAULT`
- [ ] Si Spearman sigue < 0.7 con cualquier peso — el problema no es de pesos: revisar prompts en `handlers/llm/prompts.py` o ampliar `handlers/scoring/taxonomy.py`

**Consideracion legal antes de etiquetar CVs reales**:
- El experto RH debe firmar NDA si los CVs son de candidatos reales de un cliente.
- Para piloto interno: pedir CVs voluntarios y consentimiento expreso por escrito.
- Alternativa libre de friccion: usar CVs sinteticos generados por un LLM, calibrar
  con eso, validar con CVs reales solo en la siguiente iteracion.

#### A.5 Dashboard HTML simple (al final, solo para probar integraciones)
- [x] Pagina unica `dashboard/public/index.html`, vanilla JS sin frameworks
- [x] Health check con polling automatico
- [x] CRUD de candidatos
- [x] CRUD de vacantes con creacion de requisitos
- [x] Edicion de pesos custom por vacante (PUT/DELETE)
- [x] Upload de CV + audio + procesar sincrono o async (con polling)
- [x] Inspector: explicabilidad completa (features, pesos, skills match/faltantes, evidencias soft skills)
- [x] Vista de costos por analisis (desglose por operacion + total USD)
- [x] Ranking de candidatos por vacante con link a explicacion
- [x] Costo acumulado por vacante
- [x] Servido en `/app` (mount ya estaba)

---

### FASE B: lo necesario para vender (producto comercial)

#### B.1 Multi-tenancy basico
- [ ] Agregar columna `tenant_id` a `vacantes`, `candidatos`, `analisis`
- [ ] Middleware que extraiga `tenant_id` del header `X-Tenant-Id` (o JWT)
- [ ] Filtrar todos los queries por `tenant_id`
- [ ] Test de aislamiento (tenant A no ve datos de B)

#### B.2 Autenticacion y autorizacion
- [ ] JWT con scopes (`read:analyses`, `write:vacancies`, `admin`)
- [ ] Endpoint `POST /auth/token` (o integracion con Auth0 / Clerk)
- [ ] Decorador `require_scope` en endpoints sensibles
- [ ] Rate limiting por tenant (slowapi o similar)

#### B.3 Alembic para migraciones reales
- [ ] `alembic init alembic`
- [ ] Migracion inicial que refleje el estado actual del schema
- [ ] Reemplazar `_ensure_columns` por revisiones Alembic
- [ ] Documentar workflow `alembic upgrade head` en README

#### B.4 Storage S3-compatible para CVs y audios
- [ ] Reemplazar `data/cv_data/` y `data/audio_data/` por S3/R2/Spaces
- [ ] Variables: `STORAGE_BACKEND=local|s3`, `S3_BUCKET`, claves
- [ ] URLs presigned para upload directo desde el frontend
- [ ] Razon: no perder archivos si el contenedor reinicia, soporte multi-instancia

#### B.5 Job queue real (no BackgroundTasks)
- [ ] BackgroundTasks pierde jobs si el proceso muere — Celery + Redis o RQ
- [ ] Persistir estado de jobs en Postgres (no en `_jobs` dict)
- [ ] Reintentos automaticos con backoff
- [ ] Worker separado del web server (escalable independiente)

#### B.6 Bias auditing
- [ ] Script `validation/bias_audit.py`:
  - corre el scoring sobre el gold set particionado por genero/edad/origen (anotado manualmente)
  - reporta diferencia de medias y test estadistico (Mann-Whitney U)
  - flag si la diferencia entre grupos > 5 puntos
- [ ] Correrlo en CI antes de cada release
- [ ] Documentar metodologia para auditorias regulatorias

#### B.7 Hardening de la API
- [ ] Validacion estricta de tamanos de archivo (CV max 10MB, audio max 200MB)
- [ ] CORS especifico (no `*`) configurable por tenant
- [ ] Headers de seguridad (HSTS, CSP, X-Content-Type-Options) via middleware
- [ ] Sanitizacion de nombres de archivo subidos
- [ ] Tests de seguridad basicos (path traversal, XSS, SQL injection)

#### B.8 Documentacion de la API
- [ ] Mejorar docstrings de cada endpoint (FastAPI ya genera Swagger)
- [ ] Pagina `docs/api_documentation.md` con ejemplos curl por flujo
- [ ] Postman collection o equivalente
- [ ] Versionado de API: prefix `/v1/`

---

### FASE C: enterprise-ready

#### C.1 Despliegue self-hosted
- [ ] `Dockerfile` multi-stage para imagen produccion
- [ ] `docker-compose.yml` con Postgres + Ollama + app + worker
- [ ] Helm chart o manifiestos K8s para clientes con cluster propio
- [ ] Documento `docs/deployment-onprem.md` con prerequisitos

#### C.2 Observabilidad para produccion
- [ ] Metricas Prometheus (`prometheus_fastapi_instrumentator`)
- [ ] Tracing distribuido (OpenTelemetry → Jaeger/Tempo)
- [ ] Logs JSON ya estan; agregar correlation ID por request
- [ ] Alertas en latencia LLM, errores 5xx, fallos de extraccion

#### C.3 Compliance documentado
- [ ] Documento `docs/compliance.md` con:
  - mapeo a articulos del AI Act (sistema de alto riesgo Art. 6)
  - cumplimiento NYC AEDT (auditoria de sesgo anual)
  - LFPDPPP (Mexico): aviso de privacidad, consentimiento, derechos ARCO
  - GDPR Art. 22 (decisiones automatizadas): explicabilidad y derecho a revision humana
- [ ] DPA (Data Processing Agreement) plantilla para clientes EU
- [ ] Politica de retencion de datos configurable por tenant

#### C.4 Webhook callbacks
- [ ] `POST /webhooks/subscribe` para notificar al cliente cuando un job termina
- [ ] HMAC signing para verificar autenticidad
- [ ] Retry policy con backoff exponencial

#### C.5 Reportes PDF
- [ ] Generar PDF del analisis con desglose, evidencias y disclaimer legal
- [ ] Libreria: `weasyprint` o `reportlab`
- [ ] Plantilla brandeable por cliente (logo, colores)

---

## 4. Compliance y aspectos legales (CRITICO antes del primer cliente real)

> Vender HR tech sin esto es exponerte a multas y demandas. No es opcional.

### 4.1 Marco regulatorio aplicable
- **AI Act (UE)** — clasifica scoring de candidatos como sistema de alto riesgo. Obliga a:
  - documentacion tecnica
  - registro de logs
  - explicabilidad
  - supervision humana
- **NYC AEDT (NY, EUA)** — toda herramienta automatizada de decision de empleo requiere:
  - auditoria de sesgo independiente cada 12 meses
  - aviso al candidato 10 dias antes
  - publicacion de resultados de auditoria
- **LFPDPPP (Mexico)** — datos personales de candidatos requieren:
  - aviso de privacidad
  - consentimiento expreso para uso automatizado
  - derechos ARCO (acceso, rectificacion, cancelacion, oposicion)
- **GDPR Art. 22 (UE)** — decisiones automatizadas con efecto significativo requieren:
  - intervencion humana opcional
  - explicacion de la logica involucrada

### 4.2 Lo que se construye en el codigo para cumplir
- [x] Logs estructurados de cada scoring (auditabilidad)
- [x] Scoring deterministico y explicable (no caja negra del LLM)
- [x] Desglose por dimension con feature crudo y peso (explicabilidad Art. 22)
- [ ] Audit log persistente (no solo stdout) → tabla `audit_events` en Postgres
- [ ] Reportes de bias automaticos (B.6)
- [ ] Endpoint para ejercer derechos ARCO (DELETE candidato y cascada)
- [ ] Disclaimer en reportes: "Este score es asistencia, no decision final"

### 4.3 Lo que NO va en codigo pero hay que hacer
- [ ] Hablar con abogado especializado en HR tech (1-3 horas, ~USD 300-1000)
- [ ] Redactar aviso de privacidad y politica de cookies
- [ ] Redactar terminos de servicio con clausula de uso aceptable
- [ ] Contratar auditor externo de bias para clientes en NY (anual)
- [ ] Plantilla de DPA para EU
- [ ] Revisar seguro de responsabilidad civil profesional

---

## 5. Arquitectura tecnica — decisiones y razones

### 5.1 Por que LLM solo extrae, no califica
- Reproducibilidad: mismo CV → mismo score, siempre.
- Auditabilidad: explicar por que un candidato saco 78 con desglose numerico.
- Defensibilidad legal: no hay "caja negra" que justificar ante regulador.
- Calibracion: pesos ajustables contra ground-truth humano.

### 5.2 Por que abstraccion de provider desde dia 1
- Vendor lock-in es riesgo comercial real.
- Diferentes clientes exigen diferentes proveedores (privacidad).
- Permite A/B testing de calidad entre modelos.
- Cambio de provider sin cambios de codigo de pipeline.

### 5.3 Por que Postgres en lugar de SQLite + Postgres
- Una sola fuente de verdad simplifica backups, replicacion, queries cruzadas.
- Multi-instancia funciona out-of-the-box.
- Cascade deletes mantienen consistencia automatica.

### 5.4 Por que tool use (Claude) y format=json (Ollama)
- Antes: regex sobre texto libre → ~30% fallo en JSON valido con modelos pequenos.
- Ahora: el modelo es forzado a estructura → ~99% de JSON valido en primer intento.
- Pydantic valida el shape — el shape mal sigue lanzando `LLMError`.

### 5.5 Por que separar features del scorer
- features.py: codigo testeable sin red.
- scorer.py: aplica pesos sin conocer como se calculan los features.
- Permite agregar features nuevos (ej. similaridad semantica) sin tocar scoring.

---

## 6. Recomendaciones mas alla del codigo

### 6.1 Validacion temprana con clientes
- [ ] Antes de seguir construyendo features, conseguir **2-3 clientes piloto** (1 PYME, 1 enterprise).
- [ ] Cobrar al menos token (USD 100/mes) — gratis no genera feedback real.
- [ ] Sesion de 30min con cada uno cada 2 semanas para iterar.
- [ ] Indicador de exito: 3 clientes pagando despues de 60 dias.

### 6.2 Pricing sugerido (orientativo, validar con clientes)
| Tier | Precio | Incluye |
|------|--------|---------|
| Starter | USD 49/mes | 100 analisis, Haiku, dashboard basico |
| Pro | USD 199/mes | 500 analisis, Sonnet, dashboard avanzado, API |
| Enterprise | desde USD 2000/mes | analisis ilimitados, on-prem, SLA, soporte |
| BYOK | USD 99/mes flat | infra solamente, ellos pagan tokens |

### 6.3 Diferenciadores clave a comunicar en sales
1. **Auditable por diseno** — competidores son cajas negras.
2. **Multi-LLM real** — cliente elige donde viven sus datos.
3. **Compliance-ready** — AI Act, AEDT, GDPR mapeados.
4. **Calibrable** — el cliente puede ajustar pesos a su industria.

### 6.4 Que NO construir todavia
- ML propio entrenado (transformers fine-tuned). Tu valor es el sistema, no el modelo.
- Mobile app. Reclutadores trabajan en laptop.
- Integraciones con ATS (Greenhouse, Lever) — solo cuando un cliente lo pida.
- Generacion automatica de feedback al candidato — implicaciones legales.

### 6.5 Stack recomendado para escalar (cuando llegues a B)
- **Hosting**: Fly.io o Railway al inicio; AWS ECS o GCP Cloud Run cuando crezcas
- **DB managed**: Supabase, Neon, o RDS
- **Storage**: Cloudflare R2 (compatible S3, sin egress fees)
- **Job queue**: Redis + RQ (mas simple que Celery)
- **Auth**: Clerk o Auth0 (no construir auth tu)
- **Monitoring**: Sentry + Logtail (gratis hasta cierto volumen)
- **Email**: Resend
- **Pagos**: Stripe (subscriptions)

### 6.6 Modelo operativo
- **Fundador (tu)**: vende, atiende clientes, decide roadmap.
- **No contratar todavia**: hasta tener USD 5K MRR.
- **Primer hire**: customer success, no developer.
- **Soporte**: email + Slack share channel con clientes enterprise.

---

## 7. Riesgos identificados

### 7.1 Tecnicos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| LLM cambia API y rompe extraccion | Media | Alto | Tests de integracion contra modelo real una vez por semana |
| Ollama da resultados de baja calidad en espanol | Alta | Medio | Subir a `qwen2.5:14b` minimo en tier enterprise |
| Costos LLM se disparan con volumen | Media | Alto | Limites por tenant + alertas en `costs.py` |
| Audio largo cuelga el thread pool | Baja | Medio | Limite de duracion 30 min, mover a worker dedicado en B.5 |

### 7.2 Comerciales
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Cliente regulado pide certificacion ISO/SOC2 | Alta | Alto | Empezar con clientes no regulados; ISO toma 9-12 meses |
| Competidor grande (Greenhouse, Lever) saca feature similar | Alta | Alto | Diferencia en compliance + multi-LLM + on-prem |
| Demanda por discriminacion algoritmica | Media | Critico | Bias audits + disclaimer + abogado |

### 7.3 Regulatorios
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| AI Act entra en vigor mas estricto | Alta (2026+) | Alto | Compliance ya disenado; auditoria externa anual |
| Multa por LFPDPPP por aviso de privacidad mal | Media | Alto | Plantilla legal revisada antes del primer cliente |

---

## 8. Checklist de "listo para vender" (definicion de hecho del MVP)

Marca todo esto antes de tu primer cliente que paga:

- [ ] Fase A completa (pesos por vacante, costos, explicabilidad, gold set calibrado, dashboard)
- [ ] Multi-tenancy basico (B.1)
- [ ] Autenticacion (B.2)
- [ ] Alembic configurado (B.3)
- [ ] Storage S3 (B.4)
- [ ] Bias audit corrido y documentado (B.6)
- [ ] Hardening API (B.7)
- [ ] Aviso de privacidad y TOS publicados
- [ ] Plantilla DPA lista
- [ ] Dockerfile + deploy a hosting
- [ ] Backup automatico de Postgres
- [ ] Sentry o equivalente capturando errores
- [ ] Pagina de status publica (UptimeRobot basta)
- [ ] Email de soporte funcional
- [ ] Documentacion de API publica

---

## 9. Como usar este documento

1. **Cada sesion de trabajo** — abre este archivo, identifica la siguiente tarea no marcada, marca cuando termines.
2. **Revisar mensualmente** — actualiza estados, ajusta prioridades segun feedback de clientes piloto.
3. **Cada release** — incrementa version y nota cambios al final del archivo.

---

## 10. Historial de cambios

- **2026-05-01** — Documento inicial. Estado: 49/49 tests pasando, fases A-C planeadas, fundamentos de compliance documentados.
