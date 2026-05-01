"""Plantillas de prompts centralizadas. Cualquier ajuste de tono/formato vive aqui."""

CV_SYSTEM = (
    "Eres un asistente experto en extraer informacion estructurada de CVs en espanol. "
    "Devuelves siempre datos consistentes con el esquema solicitado. "
    "Si un dato no aparece en el CV, omitelo o usa null; nunca lo inventes."
)

CV_USER_TEMPLATE = """Extrae la informacion del siguiente CV y devuelvela en JSON.

Campos obligatorios:
- datos_personales: nombre, email, telefono, ubicacion, linkedin
- resumen: 1-2 oraciones del perfil profesional
- skills: lista de habilidades. Para cada una: nombre, categoria (lenguaje, framework, base_datos, cloud, devops, herramienta, metodologia, soft, otro), años_experiencia (si se infiere), nivel (junior, mid, senior, desconocido)
- experiencia: lista de trabajos con empresa, puesto, fecha_inicio, fecha_fin, años, descripcion, skills_usadas
- educacion: institucion, titulo, nivel (ninguno, tecnico, licenciatura, maestria, doctorado), año_fin
- certificaciones: nombre, emisor, año
- proyectos: nombre, descripcion, skills_usadas
- años_experiencia_total: suma estimada en años

CV:
\"\"\"
{cv_texto}
\"\"\"
"""

REQ_SYSTEM = (
    "Eres un asistente que extrae requisitos estructurados de descriptores de vacantes en espanol. "
    "Distingue entre obligatorios y deseables. No inventes requisitos que no esten en el texto."
)

REQ_USER_TEMPLATE = """Extrae los requisitos del siguiente descriptor de vacante.

Campos:
- skills_requeridos: lista con nombre, obligatorio (true si es requisito duro, false si es deseable), años_minimos
- años_experiencia_min: minimo de años pedidos en general
- nivel_educativo_min: ninguno, tecnico, licenciatura, maestria, doctorado
- certificaciones_deseadas: lista
- palabras_clave: terminos tecnicos relevantes

Descriptor:
\"\"\"
{requisitos_texto}
\"\"\"
"""

SOFT_SYSTEM = (
    "Eres un evaluador experto de entrevistas en espanol. Evaluas tres dimensiones de soft skills "
    "asignando un puntaje 0-100 con justificacion breve y citas literales del candidato como evidencia. "
    "Se conservador: si no hay evidencia clara, asigna puntajes medios (40-60)."
)

SOFT_USER_TEMPLATE = """Evalua las soft skills del candidato sobre la siguiente transcripcion.

Dimensiones:
1. comunicacion: claridad, estructura, vocabulario tecnico apropiado
2. resolucion_problemas: pensamiento estructurado, metodologia, ejemplos concretos (STAR)
3. trabajo_equipo: colaboracion, mencion de equipos, atribucion de logros compartidos

Para cada dimension devuelve: puntaje (0-100), justificacion (1-2 oraciones), evidencias (2-3 citas literales del candidato).

Transcripcion:
\"\"\"
{transcripcion}
\"\"\"
"""
