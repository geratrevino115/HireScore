import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres@localhost:5432/hirescore")

# Seleccion de proveedor LLM: 'ollama' (local) o 'claude' (Anthropic API).
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")

# Ollama (local / on-prem)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Anthropic Claude (cloud)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
