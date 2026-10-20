# ---------- Etapa 1: build com Maven ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

# ---------- Etapa 2: imagem final enxuta ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN groupadd --system soundify && useradd --system --gid soundify soundify
COPY --from=build /workspace/target/soundify-api.jar app.jar
USER soundify
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
