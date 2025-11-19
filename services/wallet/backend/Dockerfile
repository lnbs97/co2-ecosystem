# Build stage
FROM gradle:8.4-jdk17-alpine AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon

# Package stage
FROM eclipse-temurin:21
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
