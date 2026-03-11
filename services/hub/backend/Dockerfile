# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the content of the local src directory to the working directory
COPY . .

# ⭐️ NEU: Start-Skript ausführbar machen
COPY start.sh .
RUN chmod +x start.sh

# Port freigeben
EXPOSE 8080

# ⭐️ NEU: Das Skript ausführen statt python direkt
CMD ["./start.sh"]
