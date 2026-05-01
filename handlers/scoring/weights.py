from __future__ import annotations
from pydantic import BaseModel, Field, field_validator


class PesosScoring(BaseModel):
    """Pesos del algoritmo de scoring. Suman aproximadamente 1.0.

    Cada peso multiplica un feature normalizado [0..1]. El puntaje final es
    sum(pesos[k] * features[k]) * 100 -> entero 0..100.
    """
    match_skills_obligatorios: float = Field(default=0.35, ge=0, le=1)
    match_skills_deseables: float = Field(default=0.15, ge=0, le=1)
    experiencia: float = Field(default=0.20, ge=0, le=1)
    educacion: float = Field(default=0.10, ge=0, le=1)
    soft_skills: float = Field(default=0.15, ge=0, le=1)
    sentimiento: float = Field(default=0.05, ge=0, le=1)

    @field_validator("sentimiento")
    @classmethod
    def _suman_aprox_uno(cls, v, info):
        valores = list(info.data.values()) + [v]
        total = sum(valores)
        if not 0.95 <= total <= 1.05:
            raise ValueError(f"los pesos deben sumar ~1.0, suman {total:.3f}")
        return v

    def as_dict(self) -> dict[str, float]:
        return self.model_dump()


PESOS_DEFAULT = PesosScoring()
