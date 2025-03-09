import json
import re

response_text = """
{
    "response": "{\n    \"resumen\": \"Experiencia de liderazgo en desarrollo de sistemas de visión artificial para aplicaciones de seguridad y defensa. Experiencia previa en desarrollo de software y hardware, con habilidades en lenguajes como Python, JavaScript y C.\",\n    \"experiencia_tecnica\": [\n        {\n            \"titulo\": \"Computer Vision Lead Engineer\",\n            \"empresa\": \"Spacelab MX\",\n            \"lugar\": \"Monterrey NL\",\n            \"fecha\": \"Jun 2023 - Presente\",\n            \"descripcion\": \"Desarrollo de sistemas de visión artificial para aplicaciones de seguridad y defensa\"\n        },\n        {\n            \"titulo\": \"Computer Vision Engineer\",\n            \"empresa\": \"CIMA\",\n            \"lugar\": \"Querétaro QRO\",\n            \"fecha\": \"Jun 2020 - Abr 2022\",\n            \"descripcion\": \"Desarrollo de algoritmos de visión artificial para aplicaciones de drones\"\n        },\n        {\n            \"titulo\": \"Industrial Application Developer\",\n            \"empresa\": \"INDUTELSA\",\n            \"lugar\": \"Saltillo COA\",\n            \"fecha\": \"Mar 2019 - Nov 2019\",\n            \"descripcion\": \"Desarrollo de hardware y software para dispositivos industriales\"\n        }\n    ],\n    \"proyectos_relevantes\": [\n        {\n            \"titulo\": \"Skyprotector\",\n            \"descripcion\": \"Sistema de vigilancia diseñado para industrias, con detección de intrusos y respuesta rápida a emergencias\"\n        }\n    ],\n    \"educacion\": [\n        {\n            \"titulo\": \"MSc en Inteligencia Artificial\",\n            \"institucion\": \"Autonomous University of Querétaro\",\n            \"fecha\": \"Jun 2020 - Dic 2021\",\n            \"descripcion\": \"Estudios de posgrado en inteligencia artificial\"\n        },\n        {\n            \"titulo\": \"BSc en Electrónica\",\n            \"institucion\": \"Autonomous University of Coahuila\",\n            \"fecha\": \"Aug 2015 - Dic 2018\",\n            \"descripcion\": \"Estudios de pregrado en electrónica\"\n        }\n    ],\n    \"certificaciones\": [],\n    \"sistema_categorizacion_skills\": {\n        \"Liderazgo\": 1,\n        \"Desarrollo de software\": 2,\n        \"Desarrollo de hardware\": 2,\n        \"Visión artificial\": 3,\n        \"Inteligencia artificial\": 4,\n        \"Diseño de sistemas\": 5\n    },\n    \"lenguajes\": [\"Python\", \"JavaScript\", \"C\"],\n    \"herramientas\": [\"Pytorch\", \"Docker\", \"AWS\", \"Figma\", \"Notion\", \"Jira\", \"GitHub\", \"Arduino\", \"Opencv\"]\n}"
}
"""

# Extraer la parte JSON de la cadena
match = re.search(r'"response":\s*"({.*})"', response_text, re.DOTALL)
if match:
    json_str = match.group(1)
    json_str = json_str.encode('utf-8').decode('unicode_escape')  # Decodifica correctamente los caracteres de escape
    json_str = json_str.replace('\n', '').replace('\\"', '"')
    
    # Convertir a JSON
    try:
        data = json.loads(json_str)
        
        # Guardar en un archivo JSON
        with open("datos_formateados.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print("Archivo JSON creado exitosamente como 'datos_formateados.json'")
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
else:
    print("No se encontró JSON válido en el texto.")
