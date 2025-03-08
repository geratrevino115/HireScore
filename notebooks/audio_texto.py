import speech_recognition as sr
from pydub import AudioSegment
import os

def transcribir_audio(ruta_archivo):
    """
    Transcribe un archivo de audio a texto.
    
    Args:
        ruta_archivo (str): Ruta al archivo de audio
    
    Returns:
        str: Texto transcrito
    """
    # Verificar que el archivo existe
    if not os.path.exists(ruta_archivo):
        return "Error: El archivo no existe."
    
    # Crear el reconocedor
    reconocedor = sr.Recognizer()
    
    # Convertir a WAV si es necesario (mp3, m4a, etc.)
    nombre_archivo, extension = os.path.splitext(ruta_archivo)
    if extension.lower() not in ['.wav']:
        try:
            print(f"Convirtiendo {extension} a formato WAV...")
            audio = AudioSegment.from_file(ruta_archivo)
            ruta_archivo = f"{nombre_archivo}.wav"
            audio.export(ruta_archivo, format="wav")
            print(f"Archivo convertido guardado como {ruta_archivo}")
        except Exception as e:
            return f"Error al convertir el archivo: {str(e)}"
    
    # Abrir el archivo de audio
    with sr.AudioFile(ruta_archivo) as fuente:
        # Ajustar para ruido ambiental
        reconocedor.adjust_for_ambient_noise(fuente)
        # Capturar el audio
        audio = reconocedor.record(fuente)
        
        try:
            # Intentar reconocer el habla usando Google Speech Recognition
            print("Transcribiendo audio...")
            texto = reconocedor.recognize_google(audio, language='es-ES')  # Puedes cambiar el idioma
            return texto
        except sr.UnknownValueError:
            return "No se pudo entender el audio"
        except sr.RequestError as e:
            return f"Error en el servicio de reconocimiento: {e}"

def main():
    print("=== PROGRAMA DE TRANSCRIPCIÓN DE AUDIO A TEXTO ===")
    ruta_archivo = "audio/pyt.mp3"  # Cambiar por la ruta de tu archivo
    
    resultado = transcribir_audio(ruta_archivo)
    
    print("\nRESULTADO DE LA TRANSCRIPCIÓN:")
    print("--------------------------------")
    print(resultado)
    print("--------------------------------")
    
    # Guardar resultado en un archivo de texto
    guardar = input("¿Deseas guardar la transcripción en un archivo? (s/n): ").lower()
    if guardar == 's':
        nombre_archivo = input("Ingresa el nombre del archivo (sin extensión): ")
        with open(f"{nombre_archivo}.txt", "w", encoding="utf-8") as archivo:
            archivo.write(resultado)
        print(f"Transcripción guardada en {nombre_archivo}.txt")

if __name__ == "__main__":
    main()