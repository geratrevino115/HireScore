import whisper

modelo = whisper.load_model("small", device="cpu")
resultado = modelo.transcribe("audio/pyt.mp3")
print("\nTranscripción:\n", resultado["text"])
