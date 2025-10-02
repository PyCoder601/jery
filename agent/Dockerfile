# Utiliser une image Python légère
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt


COPY main.py .

# docker run -e API_KEY="votre_clé"
ENV API_KEY=""

CMD ["python", "main.py"]
