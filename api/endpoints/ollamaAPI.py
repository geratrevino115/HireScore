# api/enddpoints/ollamaAPI.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import os
from typing import AsyncGenerator
import json

router = APIRouter(tags=["Ollama"])

# Modelo de datos para la petición, con un campo "context" adicional
class PromptRequest(BaseModel):
    model: str = "llama3.2"  # Modelo por defecto
    context: str = "Instrucciones: Responde de forma concisa y precisa."  # Contexto por defecto
    prompt: str = "Buenos dias"  # Prompt por defecto
    keypoints: str = "Por favor, organiza la respuesta en un JSON con las siguientes claves:\n - resumen\n - experiencia_tecnica\n- proyectos_relevantes\n- educacion\n - certificaciones\n - sistema_categorizacion_skills\nAsegúrate de que la respuesta sea un JSON válido. limitate a unicamente contestar con el archivo json"  # Puntos clave para el modelo

# URL del servidor de Ollama (por defecto corre en localhost)
OLLAMA_URL = "http://localhost:11434/api/generate"

@router.post("/generate", summary="Genera texto sin streaming", response_description="Respuesta de Ollama sin streaming")
async def generate_text(request: PromptRequest):
    """
    Recibe un prompt junto con un contexto y genera una respuesta usando Ollama sin streaming.
    """
    # Combinar el contexto y el prompt
    combined_prompt = f"{request.context}\n{request.prompt}"
    payload = {
        "model": request.model,
        "prompt": combined_prompt,
        "stream": False  # Sin streaming
    }

    response = requests.post(OLLAMA_URL, json=payload)

    if response.status_code == 200:
        result = response.json()
        return {"response": result["response"]}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

async def stream_ollama_response(prompt: str, model: str) -> AsyncGenerator[str, None]:
    """
    Generador de respuesta en streaming desde Ollama.
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True  # Streaming activado
    }

    try:
        with requests.post(OLLAMA_URL, json=payload, stream=True) as response:
            if response.status_code == 200:
                for chunk in response.iter_lines():
                    if chunk:
                        yield chunk.decode() + "\n"  # Enviar fragmento de respuesta
            else:
                yield f"Error: {response.text}"
    except Exception as e:
        yield f"Error: {str(e)}"

@router.post("/generate_stream", summary="Genera texto con streaming", response_description="Respuesta de Ollama en streaming")
async def generate_text_stream(request: PromptRequest):
    """
    Recibe un prompt junto con un contexto y genera una respuesta en tiempo real usando Ollama (streaming).
    """
    # Combinar el contexto y el prompt
    combined_prompt = f"{request.context}\n{request.prompt}"
    return StreamingResponse(
        stream_ollama_response(combined_prompt, request.model),
        media_type="text/plain"
    )


@router.post("/generate_keypoints", summary="", response_description="")
async def generate_text(request: PromptRequest):
    """
    Recibe un prompt junto con un contexto y genera una respuesta usando Ollama de los keypoints de los cvs.
    """
    # Combinar el contexto y el prompt
    combined_prompt = f"{request.keypoints}\n{request.prompt}"
    payload = {
        "model": request.model,
        "prompt": combined_prompt,
        "stream": False  # Sin streaming
    }

    response = requests.post(OLLAMA_URL, json=payload)

    if response.status_code == 200:
        result = response.json()
        data = {"response": result["response"]}
    
        # Guardar la respuesta en un archivo JSON dentro de data/cv_data
        os.makedirs("data/cv_data", exist_ok=True)
        file_path = "data/cv_data/datos.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        return {"message": "Response saved successfully", "file": file_path}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
   