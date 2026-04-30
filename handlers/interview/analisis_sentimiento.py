import os
import sqlite3
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def analizar_sentimiento(texto):
    """Analiza el sentimiento de un texto usando VADER de NLTK."""
    nltk.download('vader_lexicon')
    sia = SentimentIntensityAnalyzer()
    resultado = sia.polarity_scores(texto)
    return resultado

def calcular_sentimiento_medio(resultados):
    """Calcula el promedio de sentimiento de todos los textos analizados."""
    if not resultados:
        return None

    total_neg = sum(r['neg'] for r in resultados) / len(resultados)
    total_neu = sum(r['neu'] for r in resultados) / len(resultados)
    total_pos = sum(r['pos'] for r in resultados) / len(resultados)
    total_compound = sum(r['compound'] for r in resultados) / len(resultados)

    return {
        "negativo": total_neg,
        "neutral": total_neu,
        "positivo": total_pos,
        "compound": total_compound
    }

def analizar_base_datos(db_path):
    """Lee la base de datos SQLite, analiza el sentimiento de cada transcripción y guarda los resultados."""
    if not os.path.exists(db_path):
        print(f"La base de datos {db_path} no existe.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, texto FROM transcripciones")
    filas = cursor.fetchall()
    
    resultados = []
    for id_fila, texto in filas:
        sentimiento = analizar_sentimiento(texto)
        if sentimiento:
            resultados.append(sentimiento)  # Guardamos solo el diccionario de sentimiento
    
    promedio_sentimiento = calcular_sentimiento_medio(resultados)
    
    # Agregar columnas de sentimiento si no existen
    columnas_nuevas = [
        ("sentimiento_neg", "REAL"),
        ("sentimiento_neu", "REAL"),
        ("sentimiento_pos", "REAL"),
        ("sentimiento_compound", "REAL"),
    ]
    columnas_existentes = {row[1] for row in cursor.execute("PRAGMA table_info(transcripciones)")}
    for nombre, tipo in columnas_nuevas:
        if nombre not in columnas_existentes:
            cursor.execute(f"ALTER TABLE transcripciones ADD COLUMN {nombre} {tipo} DEFAULT NULL")
    
    for (id_fila, texto), sentimiento in zip(filas, resultados):
        cursor.execute('''
            UPDATE transcripciones
            SET sentimiento_neg = ?,
                sentimiento_neu = ?,
                sentimiento_pos = ?,
                sentimiento_compound = ?
            WHERE id = ?
        ''', (sentimiento['neg'], sentimiento['neu'], sentimiento['pos'], sentimiento['compound'], id_fila))
    
    conn.commit()
    conn.close()
    print(f"Análisis de sentimiento guardado en la base de datos {db_path}")
    print(f"Sentimiento medio: {promedio_sentimiento}")


# Ejemplo de uso
if __name__ == "__main__":
    archivo_entrada = "interview_processor/outputs/prueba2.db"  # Cambia esto a la ruta de tu archivo
    analizar_base_datos(archivo_entrada)
