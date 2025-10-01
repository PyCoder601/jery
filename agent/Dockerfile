# Utiliser une image Python légère
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier des dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le script principal de l'agent
COPY main.py .

# Variables d'environnement qui devront être fournies au lancement
# docker run -e API_KEY="votre_clé" -e BACKEND_URL="ws://votre_backend_url" ...
ENV API_KEY=""
ENV BACKEND_URL="ws://localhost:8002/api/ws/metrics/"
ENV INTERVAL="2"

CMD ["python", "main.py"]
