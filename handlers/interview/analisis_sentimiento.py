"""Analisis de sentimiento VADER. Trabaja sobre listas de segmentos en memoria;
ya no toca SQLite — la persistencia se hace por separado contra Postgres.
"""
from __future__ import annotations
from typing import Iterable
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

_SIA: SentimentIntensityAnalyzer | None = None


def _get_analyzer() -> SentimentIntensityAnalyzer:
    global _SIA
    if _SIA is None:
        try:
            nltk.data.find("sentiment/vader_lexicon")
        except LookupError:
            nltk.download("vader_lexicon", quiet=True)
        _SIA = SentimentIntensityAnalyzer()
    return _SIA


def analizar_sentimiento(texto: str) -> dict:
    """Devuelve {neg, neu, pos, compound} para un texto."""
    return _get_analyzer().polarity_scores(texto or "")


def anotar_sentimiento_segmentos(segmentos: list[dict]) -> list[dict]:
    """Agrega claves sentimiento_{neg,neu,pos,compound} a cada segmento."""
    analyzer = _get_analyzer()
    for seg in segmentos:
        scores = analyzer.polarity_scores(seg.get("texto", ""))
        seg["sentimiento_neg"] = scores["neg"]
        seg["sentimiento_neu"] = scores["neu"]
        seg["sentimiento_pos"] = scores["pos"]
        seg["sentimiento_compound"] = scores["compound"]
    return segmentos


def sentimiento_promedio(segmentos: Iterable[dict]) -> float | None:
    valores = [s["sentimiento_compound"] for s in segmentos if s.get("sentimiento_compound") is not None]
    if not valores:
        return None
    return sum(valores) / len(valores)
