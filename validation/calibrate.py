"""Calibracion de pesos contra un gold-set evaluado por humanos.

Uso:
  python validation/calibrate.py --gold validation/golden_set.csv
  python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache
  python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache --sweep

Mide:
  - Spearman correlation: que tan bien preserva el orden de candidatos
  - MAE: promedio de distancia absoluta al puntaje humano

Si --sweep, barre combinaciones de pesos (paso 0.05) y reporta el mejor.
"""
from __future__ import annotations
import argparse
import asyncio
import csv
import hashlib
import itertools
import json
import os
import sys
from pathlib import Path
from statistics import mean

# Permitir ejecutar como script desde la raiz del repo
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from handlers.cvs.parsers.cv_reader import extract_text  # noqa: E402
from handlers.llm import get_llm_provider  # noqa: E402
from handlers.llm.schemas import CVEstructurado, RequisitosEstructurados  # noqa: E402
from handlers.scoring.scorer import calcular_score  # noqa: E402
from handlers.scoring.weights import PesosScoring  # noqa: E402


def _hash_archivo(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def _hash_texto(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()[:16]


async def _extraer_o_cargar(
    cv_path: str,
    req_path: str,
    cache_dir: Path | None,
) -> tuple[CVEstructurado, RequisitosEstructurados]:
    provider = get_llm_provider()

    cv_key = f"cv_{_hash_archivo(cv_path)}.json"
    requisitos_texto = Path(req_path).read_text(encoding="utf-8")
    req_key = f"req_{_hash_texto(requisitos_texto)}.json"

    if cache_dir:
        cache_dir.mkdir(parents=True, exist_ok=True)
        cv_cache = cache_dir / cv_key
        req_cache = cache_dir / req_key
        if cv_cache.exists():
            cv = CVEstructurado.model_validate_json(cv_cache.read_text())
        else:
            cv = await provider.extract_cv(extract_text(cv_path))
            cv_cache.write_text(cv.model_dump_json(indent=2))
        if req_cache.exists():
            req = RequisitosEstructurados.model_validate_json(req_cache.read_text())
        else:
            req = await provider.extract_requisitos(requisitos_texto)
            req_cache.write_text(req.model_dump_json(indent=2))
        return cv, req

    cv = await provider.extract_cv(extract_text(cv_path))
    req = await provider.extract_requisitos(requisitos_texto)
    return cv, req


async def _cargar_gold_set(
    gold_path: Path,
    cache_dir: Path | None,
) -> list[tuple[CVEstructurado, RequisitosEstructurados, int, str]]:
    filas: list[tuple[CVEstructurado, RequisitosEstructurados, int, str]] = []
    with open(gold_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for fila in reader:
            cv_path = fila["cv_path"]
            req_path = fila["requisitos_path"]
            puntaje = int(fila["puntaje_humano"])
            nota = fila.get("nota", "")
            print(f"  procesando {cv_path}…", flush=True)
            cv, req = await _extraer_o_cargar(cv_path, req_path, cache_dir)
            filas.append((cv, req, puntaje, nota))
    return filas


def _spearman(a: list[float], b: list[float]) -> float:
    """Spearman correlation manual; evita dependencia en scipy."""
    n = len(a)
    if n < 2:
        return 0.0

    def rangos(vals: list[float]) -> list[float]:
        ordenados = sorted(range(n), key=lambda i: vals[i])
        r = [0.0] * n
        for pos, idx in enumerate(ordenados):
            r[idx] = pos + 1
        return r

    ra, rb = rangos(a), rangos(b)
    media_a = mean(ra)
    media_b = mean(rb)
    num = sum((ra[i] - media_a) * (rb[i] - media_b) for i in range(n))
    den_a = sum((r - media_a) ** 2 for r in ra) ** 0.5
    den_b = sum((r - media_b) ** 2 for r in rb) ** 0.5
    if den_a == 0 or den_b == 0:
        return 0.0
    return num / (den_a * den_b)


def _evaluar(
    dataset: list[tuple[CVEstructurado, RequisitosEstructurados, int, str]],
    pesos: PesosScoring,
) -> tuple[float, float, list[tuple[int, int]]]:
    predichos: list[float] = []
    humanos: list[float] = []
    pares: list[tuple[int, int]] = []
    for cv, req, p_humano, _ in dataset:
        r = calcular_score(cv, req, pesos=pesos)
        predichos.append(r.puntaje_total)
        humanos.append(p_humano)
        pares.append((p_humano, r.puntaje_total))
    spearman = _spearman(predichos, humanos)
    mae = mean(abs(p - h) for p, h in zip(predichos, humanos))
    return spearman, mae, pares


def _generar_grid_pesos(paso: float = 0.05) -> list[PesosScoring]:
    """Genera combinaciones de pesos que suman 1.0 (con tolerancia) en paso de 0.05."""
    valores = [round(x * paso, 2) for x in range(int(1 / paso) + 1)]
    combos = []
    for w1, w2, w3, w4, w5, w6 in itertools.product(valores, repeat=6):
        if abs((w1 + w2 + w3 + w4 + w5 + w6) - 1.0) < 0.01:
            try:
                combos.append(PesosScoring(
                    match_skills_obligatorios=w1, match_skills_deseables=w2,
                    experiencia=w3, educacion=w4, soft_skills=w5, sentimiento=w6,
                ))
            except Exception:
                pass
    return combos


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gold", required=True, type=Path)
    parser.add_argument("--cache-dir", type=Path, default=None)
    parser.add_argument("--sweep", action="store_true")
    args = parser.parse_args()

    if not args.gold.exists():
        print(f"ERROR: no existe {args.gold}")
        sys.exit(1)

    print(f"Cargando gold set desde {args.gold}…")
    dataset = await _cargar_gold_set(args.gold, args.cache_dir)
    print(f"  {len(dataset)} ejemplos cargados\n")

    spearman, mae, pares = _evaluar(dataset, PesosScoring())
    print("Pesos default:")
    print(f"  Spearman: {spearman:.3f}")
    print(f"  MAE:      {mae:.2f}")
    print("  pares (humano, predicho):")
    for h, p in pares:
        print(f"    {h:3d}  vs  {p:3d}")

    if args.sweep:
        print("\nBuscando mejores pesos (grid 0.05)…")
        combos = _generar_grid_pesos()
        print(f"  evaluando {len(combos)} combinaciones…")
        mejor_score = -2.0
        mejor_pesos = None
        mejor_mae = None
        for pesos in combos:
            sp, m, _ = _evaluar(dataset, pesos)
            # objetivo: maximizar Spearman, desempatar por MAE bajo
            score = sp - 0.001 * m
            if score > mejor_score:
                mejor_score = score
                mejor_pesos = pesos
                mejor_mae = m
        print(f"\nMejor combinacion (Spearman {mejor_score+0.001*mejor_mae:.3f}, MAE {mejor_mae:.2f}):")
        print(json.dumps(mejor_pesos.as_dict(), indent=2))


if __name__ == "__main__":
    asyncio.run(main())
