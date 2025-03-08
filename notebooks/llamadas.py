import requests

response = requests.post("http://127.0.0.1:8000/generate", json={
    "model": "llama3.2",
    "prompt": "Define que es la ia"
})

print(response.json())
