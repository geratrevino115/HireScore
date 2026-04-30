import os
import torch
import whisper
import sqlite3
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from pyannote.audio import Audio
from pyannote.core import Segment
from sklearn.cluster import AgglomerativeClustering
import numpy as np
from pydub import AudioSegment

def transcribir_con_identificacion(ruta_archivo, modelo_whisper="base", num_hablantes=None):
    """
    Transcribe audio y reconoce diferentes hablantes.
    """
    print("Cargando modelos...")
    modelo = whisper.load_model(modelo_whisper)
    dispositivo = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Usando dispositivo: {dispositivo}")
    embedding_model = PretrainedSpeakerEmbedding("speechbrain/spkrec-ecapa-voxceleb", device=dispositivo)
    
    if not ruta_archivo.endswith(".wav"):
        print("Convirtiendo a WAV...")
        nombre_base, _ = os.path.splitext(ruta_archivo)
        ruta_archivo_wav = f"{nombre_base}.wav"
        audio = AudioSegment.from_file(ruta_archivo)
        audio.export(ruta_archivo_wav, format="wav")
        ruta_archivo = ruta_archivo_wav
    
    print("Procesando audio...")
    audio = AudioSegment.from_file(ruta_archivo)
    audio = audio.set_channels(1)
    audio = audio.set_frame_rate(16000)
    temp_path = "handlers/interview/outputs/temp_audio.wav"
    os.makedirs("handlers/interview/outputs", exist_ok=True)
    audio.export(temp_path, format="wav")
    
    print("Transcribiendo audio...")
    resultado = modelo.transcribe(temp_path)
    segmentos = resultado["segments"]
    
    if not segmentos:
        print("No se detectaron segmentos en el audio.")
        return []

    print("Identificando hablantes...")
    embeddings = []
    segmentos_tiempo = []
    audio_proc = Audio()
    
    for segmento in segmentos:
        inicio = segmento["start"]
        fin = segmento["end"]
        if inicio is None or fin is None or fin - inicio <= 0:
            print(f"⚠ Advertencia: segmento inválido detectado. Saltando... ({segmento})")
            continue

        segmento_audio = Segment(inicio, fin)
        segmentos_tiempo.append(segmento_audio)

        try:
            waveform, sr = audio_proc.crop(temp_path, segmento_audio)
            if waveform is None or waveform.shape[1] == 0:
                print(f"⚠ Advertencia: segmento {inicio}-{fin} vacío. Omitiendo.")
                continue

            embedding = embedding_model(waveform[None])
            if isinstance(embedding, torch.Tensor):
                embedding = embedding.detach().cpu().numpy()
            embeddings.append(embedding.squeeze())
        except Exception as e:
            print(f"Error al extraer segmento {inicio}-{fin}: {e}")
            continue

    if not embeddings:
        print("No se pudieron extraer embeddings de los segmentos de audio.")
        return []

    embeddings = np.array(embeddings)
    if embeddings.ndim != 2:
        print("Error: No se generaron suficientes datos para clustering.")
        return []

    clustering = AgglomerativeClustering(
        n_clusters=num_hablantes if num_hablantes is not None else None,
        metric='cosine', linkage='average', distance_threshold=0.3 if num_hablantes is None else None
    )
    
    etiquetas = clustering.fit_predict(embeddings)

    resultado_final = []
    for i, segmento in enumerate(segmentos):
        resultado_final.append({
            "inicio": segmento["start"],
            "fin": segmento["end"],
            "hablante": etiquetas[i]+1,
            "texto": segmento["text"]
        })
    
    if os.path.exists(temp_path):
        os.remove(temp_path)
    if os.path.exists(ruta_archivo) and ruta_archivo.endswith(".wav"):
        os.remove(ruta_archivo)
        
    return resultado_final

def guardar_transcripcion_sqlite(segmentos, ruta_archivo):
    """
    Guarda la transcripción con identificación de hablantes en una base de datos SQLite.
    """
    db_path = f"handlers/interview/outputs/{os.path.splitext(os.path.basename(ruta_archivo))[0]}.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transcripciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            archivo TEXT,
            inicio TEXT,
            fin TEXT,
            hablante INTEGER,
            texto TEXT
        )
    ''')
    
    for seg in segmentos:
        cursor.execute('''
            INSERT INTO transcripciones (archivo, inicio, fin, hablante, texto)
            VALUES (?, ?, ?, ?, ?)
        ''', (ruta_archivo, formatear_tiempo(seg['inicio']), formatear_tiempo(seg['fin']), int(seg['hablante']), seg['texto']))
    
    conn.commit()
    conn.close()
    print(f"\nTranscripción guardada en la base de datos {db_path}")

def formatear_tiempo(segundos):
    """Convierte segundos a formato HH:MM:SS.MS"""
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    segs = segundos % 60
    return f"{horas:02d}:{minutos:02d}:{segs:06.3f}"

if __name__ == "__main__":
    try:
        print("=== TRANSCRIPCIÓN DE AUDIO CON IDENTIFICACIÓN DE HABLANTES ===\n")
        
        ruta_archivo = "handlers/interview/uploads/prueba2.mp3"
        modelo_whisper = "base"
        num_hablantes = 2
        
        print("\nProcesando con parámetros:")
        print(f"- Archivo: {ruta_archivo}")
        print(f"- Modelo: {modelo_whisper}")
        print(f"- Número de hablantes: {'Automático' if num_hablantes is None else num_hablantes}")
        
        segmentos = transcribir_con_identificacion(ruta_archivo, modelo_whisper, num_hablantes)
        
        if segmentos:
            guardar_transcripcion_sqlite(segmentos, ruta_archivo)
        else:
            print("No se pudieron obtener resultados de la transcripción.")
            
    except KeyboardInterrupt:
        print("\nProceso interrumpido por el usuario.")
    except Exception as e:
        print(f"\nError inesperado: {str(e)}")
