# Jenkins (LTS, con Java 21) con los plugins que usa el pipeline del proyecto.
FROM jenkins/jenkins:2.580.1-lts-jdk21

# git: leer el repositorio | workflow-aggregator: pipelines (Jenkinsfile)
# credentials-binding: usar el token de Docker Hub | junit: reportes de tests
# pipeline-stage-view: vista de etapas | timestamper: hora en cada línea del log
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    credentials-binding \
    junit \
    pipeline-stage-view \
    timestamper
