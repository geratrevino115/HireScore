import re

texto = """```\n{\n  \"resumen\": \"Ingeniero de Mecatrónica con experiencia en diseño de productos, automatización industrial y proyectos nuevos. Especializado en diseño mecánico y eléctrico, y Industry 4.0. Tiene habilidades sólidas para resolver problemas, ser resultado orientado y proactivo en la optimización del proceso.\",\n  \"experiencia_tecnica\": [\n    {\n      \"empresa\": \"Brembo Calipers\",\n      \"Cargo\": \"Asistente de Ingeniería\"\n    },\n    {\n      \"empresa\": \"AI Eléctrica Integral\",\n      \"Cargo\": \"Ingeniero Técnico de Producto (Eléctrico)\"\n    }\n  ],\n  \"proyectos_relevantes\": [\n    \"Diseño de bocinetos eléctricos para Nissan, DeAcero y Henkel.\",\n    \"Creación de panelas eléctricas con normativas UL, NEMA & IEC.\",\n    \"Desarrollo del sistema de visión en la línea de montaje de Tesla Cybertruck.\",\n    \"Creación de funciones para robots KUKA.\"\n  ],\n  \"educacion\": [\n    {\n      \"institución\": \"FIME - UANL\",\n      \"grado\": \"Ingeniero en Mecatrónica\",\n      \"fecha\": \"07/2019 - 06/2024\"\n    },\n    {\n      \"institución\": \"CBTis No.36\",\n      \"grado\": \"Technólogo en Mechatrónica\",\n      \"fecha\": \"08/2016 - 06/2019\"\n    }\n  ],\n  \"certificaciones\": [\n    \"CSWA Mechanical Design\",\n    \"CSWA-S Mech. Simulation\",\n    \"CSWA-AM Additive Manuf.\",\n    \"CSWA-SD Sustainable Design\",\n    \"AutoCAD 2D & 3D\",\n    \"On Course: TIA Portal Advanced Ignition - Inductive Softwares\"\n  ],\n  \"sistema_categorizacion_skills\": [\n    {\n      \"cat\": \"Diseño Mecánico\",\n      \"habilidades\": [\"Diseño de bocinetos\", \"Creación de panelas eléctricas\"]\n    },\n    {\n      \"cat\": \"Automatización Industrial\",\n      \"habilidades\": [\"Programación PLC\", \"Optimización de procesos\"]\n    },\n    {\n      \"cat\": \"Proyectos y Gestión\",\n      \"habilidades\": [\"Gestión de proyectos\", \"Realización de SoP\"]\n    }\n  ]\n}\n```

"""

# Reemplaza todos los saltos de línea por un espacio
texto_limpio = re.sub(r'[\n\\`]+', ' ', texto).strip()

# Guarda el texto limpio en un archivo
with open("output.json", "w", encoding="utf-8") as file:
    file.write(texto_limpio)

print("Archivo guardado como output.json")