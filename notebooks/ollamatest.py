from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import json
from typing import AsyncGenerator

# Crear instancia de FastAPI
app = FastAPI()

# Modelo de datos para la petición
class PromptRequest(BaseModel):
    model: str = "llama3.2"  # Modelo por defecto
    prompt: str = "Buenos dias"  # Prompt por defecto

# URL del servidor de Ollama (por defecto corre en localhost)
OLLAMA_URL = "http://localhost:11434/api/generate"

@app.post("/generate")
async def generate_text(request: PromptRequest):
    """
    Recibe un prompt y genera una respuesta usando Ollama sin streaming.
    """
    payload = {
        "model": request.model,
        "prompt": request.prompt,
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


@app.post("/generate_stream")
async def generate_text_stream(request: PromptRequest):
    """
    Recibe un prompt y genera una respuesta en tiempo real usando Ollama (streaming).
    """
    return StreamingResponse(stream_ollama_response(request.prompt, request.model), media_type="text/plain")


@app.get("/")
def read_root():
    return {"message": "Ollama API is running"}


if __name__ == "__main__":
    import uvicorn 

    uvicorn.run(app, host="localhost", port=8000)