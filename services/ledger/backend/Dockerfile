# STAGE 1: Bauen der Anwendung mit Gradle
# Wir verwenden ein offizielles Gradle-Image, das JDK 17 enthält
FROM gradle:8.7-jdk17 AS builder

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die Gradle-Build-Dateien
# (settings.gradle.kts ist wichtig für Multi-Projekt-Builds,
# aber auch bei Einzelprojekten oft vorhanden)
COPY build.gradle.kts settings.gradle.kts ./

# Lade die Abhängigkeiten herunter (dieser Schritt nutzt den Docker-Cache)
# Wenn sich später nur der Quellcode ändert, wird dieser Schritt übersprungen
RUN gradle dependencies

# Kopiere den restlichen Quellcode
COPY src/ ./src/

# Baue die ausführbare Spring Boot JAR-Datei (ohne Tests)
# 'bootJar' ist die Spring Boot spezifische Aufgabe
RUN gradle bootJar -x test

# ---

# STAGE 2: Erstellen des finalen, schlanken Images
# Wir verwenden ein minimales Java-Runtime-Image (JRE)
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Kopiere nur die gebaute .jar-Datei aus der "builder"-Stage
# Gradle legt die Boot-JAR standardmäßig in 'build/libs/'
COPY --from=builder /app/build/libs/*.jar app.jar

# Setze den Port, auf dem der Spring Boot Service *intern* läuft
EXPOSE 8080

# Der Befehl, der beim Starten des Containers ausgeführt wird
ENTRYPOINT ["java", "-jar", "app.jar"]