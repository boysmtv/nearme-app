FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY api/build/libs/api.jar app.jar
COPY src/main/resources/db/migration ./db/migration
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -Dspring.flyway.locations=classpath:db/migration,filesystem:/app/db/migration -jar app.jar"]
