# Wir nutzen ein leichtgewichtiges Node.js Image (passend zum Frontend-Build)
FROM node:20-alpine

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# Zuerst nur die Package-Dateien kopieren (für besseres Docker-Layer-Caching)
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Den restlichen Quellcode kopieren
COPY . .

# Port 8080 freigeben (muss mit server.js und docker-compose übereinstimmen)
EXPOSE 8080

# Server starten
CMD ["node", "server.js"]