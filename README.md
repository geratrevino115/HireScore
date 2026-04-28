# HireScore
 Sistema de Evaluacion de CV y Entrevistas

Sistema que analice CVs y transcripciones de entrevistas para evaluar skills
técnicos y blandos, generando puntuaciones objetivas.

Objetivos
1. Extraer información relevante de CVs
2. Analizar transcripciones de entrevistas
3. Evaluar competencias técnicas y blandas
4. Generar scores comparativos

Requerimientos Técnicos

1. Procesador de CV 
● Parser de diferentes formatos (PDF, DOCX)
-listo
● Extracción de información estructurada:
○ Experiencia técnica
○ Proyectos relevantes
○ Educación
○ Certificaciones
-falta encontrar uno mejor

● Sistema de categorización de skills
-falta totalmente

2. Análisis de Entrevistas 
● Procesamiento de transcripciones
-listo

● Análisis de sentimiento
-listo

● Detección de keywords técnicos

● Evaluación de soft skills:
○ Comunicación
○ Resolución de problemas
○ Trabajo en equipo

3. Sistema de Scoring
● Algoritmo de puntuación ponderada
● Comparación con requisitos del cargo
● Generación de reportes detallados
● Visualización de resultados


Entregables

1. API de procesamiento
2. Sistema de scoring
3. Dashboard de resultados
4. Documentación técnica
5. Tests unitarios

Criterios de Evaluación

1. Precisión (40%)
○ Exactitud en extracción de datos
○ Precisión en evaluación de skills
○ Consistencia en scoring
2. Implementación (30%)
○ Calidad del código
○ Manejo de errores
○ Performance
3. Presentación (30%)
○ Claridad de reportes
○ Usabilidad
○ Visualizaciones

Stack Tecnológico Sugerido
● Python 3.9+
● spaCy/NLTK
● TensorFlow/PyTorch
● PostgreSQL
● Flask/FastAPI
● D3.js para visualizaciones

Consideraciones
● Manejar diferentes formatos de CV
● Procesar entrevistas en español
● Validar resultados contra evaluaciones humanas

hirescore/
├── api/                        # API de procesamiento
│   ├── __init__.py
│   ├── app.py                  # Archivo principal de la API (FastAPI)
│   ├── endpoints/              # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── cv_processor.py     # Endpoints para el procesamiento de CV
│   │   ├── interview_analysis.py  # Endpoints para análisis de entrevistas
│   │   └── scoring.py          # Endpoints para el sistema de scoring
│   └── utils/                  # Funciones y utilidades compartidas
│       ├── __init__.py
│       ├── file_parser.py      # Funciones para parsear archivos (PDF, DOCX, etc.)
│       └── sentiment.py        # Funciones para análisis de sentimiento
│
├── cv_processor/               # Módulo para procesamiento de CV
│   ├── __init__.py
│   ├── parsers/                # Parseadores de diferentes formatos
│   │   ├── __init__.py
│   │   ├── pdf_parser.py
│   │   └── docx_parser.py
│   ├── extractors/             # Extracción de información estructurada
│   │   ├── __init__.py
│   │   ├── experience_extractor.py
│   │   ├── projects_extractor.py
│   │   ├── education_extractor.py
│   │   └── certifications_extractor.py
│   └── categorization/         # Sistema de categorización de skills
│       ├── __init__.py
│       └── skills_categorizer.py
│
├── interview_analysis/         # Módulo para análisis de entrevistas
│   ├── __init__.py
│   ├── transcription_processor.py  # Procesamiento de transcripciones
│   ├── sentiment_analysis.py         # Análisis de sentimiento de las entrevistas
│   ├── keywords_detector.py          # Detección de keywords técnicos
│   └── soft_skills_evaluator.py      # Evaluación de soft skills (comunicación, resolución de problemas, trabajo en equipo)
│
├── scoring/                    # Sistema de scoring
│   ├── __init__.py
│   ├── scoring_algorithm.py    # Algoritmo de puntuación ponderada
│   ├── requirements_comparator.py  # Comparación con requisitos del cargo
│   └── reports_generator.py    # Generación de reportes detallados y visualización de resultados
│
├── dashboard/                  # Dashboard de resultados (frontend)
│   ├── public/                 # Archivos estáticos (HTML, CSS, JS)
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── src/                    # Código fuente del dashboard
│       ├── App.js
│       └── components/
│
├── db/                         # Módulo de base de datos simple
│   ├── __init__.py
│   ├── database.py             # Conexión y utilidades para la base de datos (ej. SQLite, SQLAlchemy)
│   ├── models.py               # Definición de modelos o esquemas de datos
│   └── migrations/             # Scripts o configuraciones para migraciones (opcional)
│       └── README.md           # Guía para migraciones (si fuera necesario)
│
├── docs/                       # Documentación técnica
│   ├── README.md               # Introducción y guía de uso
│   ├── architecture.md         # Diseño y arquitectura del sistema
│   ├── api_documentation.md    # Documentación de la API
│   └── tests.md                # Estrategia y documentación de pruebas unitarias
│
├── tests/                      # Tests unitarios
│   ├── __init__.py
│   ├── test_cv_processor.py
│   ├── test_interview_analysis.py
│   └── test_scoring.py
│
├── requirements.txt            # Dependencias del proyecto
└── setup.py                    # Script de instalación/configuración del proyecto
