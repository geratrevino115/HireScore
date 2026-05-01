# Set de validación y calibración de pesos

Este directorio sirve para medir qué tan cerca quedan los puntajes calculados
de evaluaciones humanas (criterio de Precisión = 40% del proyecto) y para
calibrar los pesos del scorer.

## Workflow

### 1. Construir el gold set (manual, una vez)

Reúne 10-30 candidatos reales con su CV (PDF/DOCX) y la vacante a la que
aplicaron. Pide a un experto de RH que les ponga un puntaje 0-100.

Formato esperado en `validation/golden_set.csv`:

```csv
cv_path,requisitos_path,puntaje_humano,nota
data/cv_data/juan.pdf,data/req_data/backend_senior.txt,85,Match fuerte en stack
data/cv_data/maria.pdf,data/req_data/backend_senior.txt,55,Falta experiencia cloud
```

`golden_set_template.csv` tiene un ejemplo en blanco.

### 2. Correr la calibración

```bash
# Mide accuracy de los pesos actuales
python validation/calibrate.py --gold validation/golden_set.csv

# Cachea las extracciones del LLM en JSON para no re-llamarlo en cada corrida
python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache

# Hace barrido (grid search) sobre los pesos
python validation/calibrate.py --gold validation/golden_set.csv --cache-dir validation/cache --sweep
```

### 3. Interpretar resultados

- **Spearman correlation** > 0.7 — el orden de candidatos coincide bien
- **MAE** < 10 — el puntaje promedio se aleja menos de 10 puntos
- Si MAE es alto pero Spearman es bueno: el modelo ranquea bien pero la escala
  está corrida — ajusta solo el escalamiento, no los pesos relativos
- Si Spearman es bajo: el modelo se equivoca de orden — revisa pesos

### 4. Aplicar pesos calibrados

El script imprime los mejores pesos. Cópialos en `handlers/scoring/weights.py`
como nuevo `PESOS_DEFAULT`, o configúralos por vacante en BD.

## Notas

- La cache de extracciones LLM es por `sha256` del archivo y del texto de
  requisitos; cambias el archivo, se re-extrae.
- El barrido es exhaustivo en grid de 0.05; puede tardar unos segundos.

## Estado actual del proyecto

**El codigo de calibracion esta listo y testeado.** Lo que falta es el gold-set
con data humana real. Mientras no exista, los pesos en `weights.py:PESOS_DEFAULT`
son una primera aproximacion educada, no calibrada empiricamente.

Para un piloto sin friccion legal: empieza con 5-10 CVs sinteticos generados con
un LLM, etiquetados manualmente por ti contra un descriptor de vacante claro.
Eso te da una primera senal de si el sistema ranquea bien antes de invertir en
un gold-set con CVs reales.
