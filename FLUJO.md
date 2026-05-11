# HireScore — Flujo objetivo (centrado en vacantes)

> Definido con el reclutador. Estado: por implementar.
> El flujo actual del MVP sigue funcionando hasta que se construya esto.

---

## 1. User journey completo

```mermaid
flowchart TD
    Login([Login del reclutador]) --> Dashboard

    Dashboard{¿Tiene vacantes?}
    Dashboard -->|No| Empty[Estado vacío<br/>CTA: crear primera vacante]
    Dashboard -->|Sí| VList[Lista de vacantes<br/>con métricas: candidatos, score promedio, etapa]

    Empty --> NewVac
    VList -->|+ Nueva vacante| NewVac
    VList -->|abrir vacante| VWorkspace

    %% Crear vacante con bifurcación
    NewVac{¿Tiene descripción<br/>de la vacante?}
    NewVac -->|Sí| UploadJD[Subir PDF/DOCX<br/>extracción automática]
    NewVac -->|No, ayúdame| AIGen[IA conversacional<br/>genera la descripción<br/>iterando con el reclutador]

    UploadJD --> Extract[LLM extrae:<br/>· título<br/>· descripción<br/>· skills obligatorios/deseables<br/>· experiencia mínima<br/>· educación]
    AIGen --> Extract

    Extract --> Review[Revisar/editar<br/>descripción + skills + ponderación]
    Review --> Guia[IA genera guía técnica<br/>preguntas de entrevista por skill]
    Guia --> VWorkspace

    %% Workspace de la vacante
    VWorkspace[Workspace de la vacante]
    VWorkspace --> AddCV[Agregar candidatos<br/>CV individual o bulk]
    AddCV --> Pipeline

    %% Pipeline por candidato
    subgraph Pipeline[Procesamiento por candidato]
        direction TB
        P1[Extraer CV estructurado] --> P2[Score vs requisitos]
        P2 --> P3[Genera preguntas extra<br/>basadas en su CV]
    end

    Pipeline --> CandView[Vista del candidato<br/>en la vacante]

    CandView --> CV[CV virtual estructurado<br/>datos · skills · educación · experiencia · proyectos]
    CandView --> ScoreCV[Score CV vs vacante]
    CandView --> InterviewGuide[Guía de entrevista personalizada<br/>= preguntas vacante + preguntas CV]

    InterviewGuide --> Interview{Entrevista}
    Interview -->|link de reunión| RecordLink[Pegar link Zoom/Meet/Teams]
    Interview -->|grabación| UploadAudio[Subir audio]

    RecordLink --> Transcribe[Transcripción + diarización]
    UploadAudio --> Transcribe

    Transcribe --> EvalInt[Evaluar entrevista<br/>vs CV + vs vacante:<br/>consistencia, profundidad técnica,<br/>soft skills, sentimiento]

    EvalInt --> Final[Reporte final del candidato]
    Final --> Strengths[Fortalezas]
    Final --> Gaps[Puntos débiles / a desarrollar]
    Final --> FinalScore[Puntuación final ponderada]

    style Dashboard fill:#6366f1,stroke:#4f46e5,color:#fff
    style VWorkspace fill:#6366f1,stroke:#4f46e5,color:#fff
    style Final fill:#34d399,stroke:#10b981,color:#000
    style FinalScore fill:#fbbf24,stroke:#f59e0b,color:#000
```

---

## 2. Crear vacante (zoom — paso 3 y 4)

```mermaid
flowchart LR
    Start([+ Nueva vacante]) --> Q{Tienes la<br/>descripción?}

    Q -->|Sí| Path1[Subir archivo<br/>PDF / DOCX / texto pegado]
    Q -->|No| Path2[Modo asistido por IA]

    Path1 --> ExtractDoc[Extraer descripción<br/>+ requisitos del documento]

    Path2 --> Wizard[Wizard conversacional<br/>· puesto<br/>· seniority<br/>· stack/industria<br/>· responsabilidades clave]
    Wizard --> Generate[IA propone JD completa]
    Generate --> Iter{¿Te gusta?}
    Iter -->|No, ajusta| Wizard
    Iter -->|Sí| ExtractDoc

    ExtractDoc --> Structured[Vacante estructurada<br/>· skills obligatorios<br/>· skills deseables<br/>· experiencia<br/>· educación]

    Structured --> Weights[Reclutador ajusta<br/>ponderación por importancia<br/>opcional, hay default]

    Weights --> InterviewGuide[IA genera<br/>guía de entrevista técnica<br/>preguntas + criterios de evaluación]

    InterviewGuide --> Done([Vacante lista<br/>para recibir CVs])

    style Path2 fill:#6366f1,stroke:#4f46e5,color:#fff
    style InterviewGuide fill:#fbbf24,stroke:#f59e0b,color:#000
    style Done fill:#34d399,stroke:#10b981,color:#000
```

---

## 3. Procesamiento de un candidato dentro de una vacante (zoom — pasos 5-8)

```mermaid
flowchart TB
    Add([Reclutador agrega CV<br/>a la vacante]) --> Stage1

    subgraph Stage1[Etapa 1 - Análisis del CV]
        direction TB
        S1A[Subir CV pdf/docx] --> S1B[Extracción estructurada<br/>datos · skills · educación · experiencia · proyectos]
        S1B --> S1C[Score CV vs requisitos<br/>desglose por dimensión]
        S1C --> S1D[Generar preguntas extra<br/>específicas a su CV]
    end

    Stage1 --> Decide{¿Avanzar a<br/>entrevista?}
    Decide -->|No, descartar| Reject[Marcar como rechazado<br/>con razón]
    Decide -->|Sí| Stage2

    subgraph Stage2[Etapa 2 - Entrevista]
        direction TB
        S2A[Guía de entrevista lista<br/>preguntas vacante + preguntas CV] --> S2B{Cómo<br/>llega el audio?}
        S2B -->|link reunión| S2C[Pegar URL<br/>el sistema obtiene la grabación]
        S2B -->|archivo| S2D[Subir audio]
        S2C --> S2E[Transcripción + diarización<br/>identifica entrevistador vs candidato]
        S2D --> S2E
        S2E --> S2F[Evaluación vs CV<br/>consistencia, profundidad, mentiras]
        S2E --> S2G[Evaluación vs vacante<br/>cubre los temas que importan?]
        S2E --> S2H[Soft skills + sentimiento]
    end

    Stage2 --> Stage3

    subgraph Stage3[Etapa 3 - Reporte final]
        direction TB
        S3A[Score final ponderado<br/>CV + entrevista + soft skills] --> S3B[Fortalezas]
        S3A --> S3C[Puntos débiles]
        S3A --> S3D[Recomendación<br/>contratar / segunda entrevista / descartar]
    end

    Stage3 --> Export[Exportar PDF / compartir<br/>con stakeholder]

    style Stage1 fill:#1e293b,stroke:#475569,color:#e2e8f0
    style Stage2 fill:#1e293b,stroke:#475569,color:#e2e8f0
    style Stage3 fill:#1e293b,stroke:#475569,color:#e2e8f0
    style Export fill:#34d399,stroke:#10b981,color:#000
```

---

## 4. Estructura de datos propuesta

```mermaid
erDiagram
    USER ||--o{ VACANTE : "crea"
    VACANTE ||--o{ APLICACION : "recibe"
    VACANTE ||--|| GUIA_ENTREVISTA : "tiene"
    CANDIDATO ||--o{ APLICACION : "presenta"
    APLICACION ||--|| ANALISIS_CV : "tiene"
    APLICACION ||--o| ANALISIS_ENTREVISTA : "tiene si hubo"
    APLICACION ||--|| REPORTE_FINAL : "consolida"

    USER {
        int id
        string email
        string nombre
        string rol "reclutador, admin"
    }

    VACANTE {
        int id
        int user_id FK
        string titulo
        text descripcion
        text descripcion_fuente "pdf, ia_asistida, manual"
        json requisitos_estructurados "skills obl/des, experiencia, educación"
        json pesos_json
        string estado "abierta, pausada, cerrada"
        datetime creada_en
    }

    GUIA_ENTREVISTA {
        int id
        int vacante_id FK
        json preguntas_base "generadas de la vacante"
        json criterios_evaluacion
    }

    CANDIDATO {
        int id
        string nombre
        string email
        string telefono
        text cv_texto
    }

    APLICACION {
        int id
        int vacante_id FK
        int candidato_id FK
        string etapa "nueva, en_revision, shortlist, entrevista, oferta, rechazada"
        text notas_reclutador
        datetime aplicado_en
    }

    ANALISIS_CV {
        int id
        int aplicacion_id FK
        int score
        json desglose
        json cv_estructurado
        list skills_match
        list skills_faltantes
        json preguntas_extra "generadas del CV"
    }

    ANALISIS_ENTREVISTA {
        int id
        int aplicacion_id FK
        string fuente_audio "link, upload"
        text transcripcion
        json segmentos_diarizados
        json eval_consistencia "CV vs lo dicho"
        json eval_cobertura "temas vacante cubiertos"
        json soft_skills
        float sentimiento
    }

    REPORTE_FINAL {
        int id
        int aplicacion_id FK
        int score_final
        json fortalezas
        json puntos_debiles
        string recomendacion "contratar, segunda_entrevista, descartar"
        datetime generado_en
    }
```

**Cambio clave vs hoy:** se introduce `APLICACION` como la tabla pivote. Un candidato puede aplicar a varias vacantes, y cada aplicación tiene su propio análisis CV + análisis entrevista + reporte final.

---

## 5. Mapeo a las pantallas que hay que construir

| # | Pantalla | Reemplaza/extiende |
|---|----------|-------------------|
| 1 | **Login** | nueva — hoy no hay auth |
| 2 | **Dashboard de vacantes** | extiende `Vacantes` actual con métricas por vacante |
| 3 | **Wizard crear vacante** | nueva — hoy es solo un modal con texto plano |
| 3.1 | **Modo IA asistida** | nueva — generación conversacional |
| 4 | **Editor de vacante** (revisar skills + ponderación + guía) | extiende tabs actuales de vacante |
| 5 | **Workspace de vacante** (lista de aplicantes + bulk upload) | nuevo — la vista más usada |
| 6 | **Detalle de aplicación** (CV virtual + score + preguntas + entrevista) | reemplaza vista de Análisis actual |
| 7 | **Pipeline / kanban de etapas** | nuevo — mover candidatos entre etapas |
| 8 | **Reporte final exportable** | nuevo — PDF brandeable |

---

## 6. Recomendaciones — qué seguir, en orden de impacto

### A. Decisiones que conviene cerrar antes de codear

**A1. Etapas del pipeline.** Propongo: `nueva → en_revisión → shortlist → entrevista → oferta → rechazada`. Confirma o ajusta. Define cuáles son terminales.

**A2. Cómo se obtiene el audio del link de reunión.** Zoom, Meet y Teams *no* exponen la grabación por URL públicamente. Opciones realistas:
- Pegar el link → el sistema solo guarda referencia, el reclutador sube el archivo después manualmente (simple, recomiendo empezar aquí).
- Integración OAuth con Zoom Cloud Recording / Meet recordings (requiere apps publicadas en cada marketplace, semanas de trabajo).
- Bot que se une a la reunión y graba (Recall.ai, Read.ai) — más rápido pero costo extra por minuto.

**A3. Identidad del candidato.** ¿Se crea automáticamente extrayendo el nombre del CV? ¿Se deduplica si el mismo candidato aplica a 2 vacantes? Recomiendo: extraer email del CV → si existe el candidato, vincular; si no, crear.

**A4. Alcance de "evaluación de la entrevista".** Hoy haces sentimiento + soft skills básicas. Lo que pediste ("evalúa lo que dice conforme al CV y a la vacante") implica cruce semántico no trivial. Sugerencia mínima viable:
- *Cobertura*: ¿se tocaron los skills obligatorios? (busca menciones)
- *Consistencia*: ¿hay contradicciones entre lo dicho y el CV? (LLM compara)
- *Profundidad*: ¿el candidato dio detalles concretos o respuestas genéricas? (LLM clasifica)

### B. Roadmap sugerido (4 fases, ~6-8 semanas a tu ritmo)

```mermaid
gantt
    title Roadmap propuesto
    dateFormat YYYY-MM-DD
    section Fase 1: Fundamentos
    Auth + multi-usuario          :a1, 2026-05-05, 5d
    Modelo Aplicacion + migración :a2, after a1, 3d
    Refactor UI a "vacante-first" :a3, after a2, 5d
    section Fase 2: Crear vacante
    Subir JD + extracción         :b1, after a3, 3d
    Wizard IA asistido            :b2, after b1, 5d
    Generación de guía entrevista :b3, after b2, 4d
    section Fase 3: Pipeline
    Workspace + bulk upload CVs   :c1, after b3, 5d
    Etapas (kanban)               :c2, after c1, 4d
    section Fase 4: Entrevista
    Audio + transcripción         :d1, after c2, 3d
    Eval CV vs entrevista (LLM)   :d2, after d1, 5d
    Reporte final + export PDF    :d3, after d2, 4d
```

### C. Cosas que vas a querer pero no son MVP

- **Bulk upload con dedupe** por email/nombre — crítico cuando el reclutador tira 30 CVs de un drop.
- **Comparar candidatos lado a lado** (top 3 en una tabla con sus desgloses).
- **Notas y tags por aplicación** — los reclutadores trabajan con anotaciones libres.
- **Compartir reporte vía link público** con expiración (para mandar al cliente sin que tenga cuenta).
- **Export PDF brandeable** (logo del cliente, colores) — diferenciador comercial.
- **Niveles de confianza del LLM** ("este CV no traía email, lo extraje con baja certeza") — vital para que el reclutador sepa cuándo verificar.
- **Consentimiento del candidato** y aviso de procesamiento automático — obligatorio en UE/MX antes de vender.

### D. Cosas que NO recomiendo agregar todavía

- Calendario integrado (programar entrevistas dentro de HireScore) — muerte por scope.
- Comunicación al candidato desde el sistema (emails, status) — alcance enorme, se hace en ATS dedicados.
- ATS completo (career page pública, postulaciones desde candidato) — eres una herramienta de evaluación, no un ATS. Mantente en el nicho.
- Mobile app — los reclutadores trabajan desde laptop.

### E. Mi recomendación de qué hacer ahora mismo

1. **Confirma A1, A2, A3, A4** (15 min de discusión, sin código).
2. **Empieza por el modelo de datos**: agregar `Aplicacion` y migrar. Sin eso, el resto se complica.
3. **Refactoriza la UI a "vacante-first"** sin tocar lógica de negocio. La pantalla actual de Procesar desaparece; subir CVs vive dentro de la vacante.
4. Recién entonces atacar la generación asistida por IA y la evaluación de entrevista, que son las features brillantes pero dependen de los cimientos.

¿Confirmamos A1-A4 y empezamos por el modelo `Aplicacion` + refactor UI?
