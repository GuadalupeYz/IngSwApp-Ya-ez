// Pipeline de integración continua del trabajo final.
// Jenkins lee este archivo del repositorio y, en cada cambio en main:
//   1. baja el código,
//   2. corre los tests de unidad,
//   3. construye la imagen Docker de la app con Jib y la publica en Docker Hub.
//
// Requiere en Jenkins una credencial "Username with password" con id "dockerhub":
//   usuario = guadayanez, contraseña = un Access Token de Docker Hub.

pipeline {
    agent any

    environment {
        IMAGEN = 'guadayanez/blog'
        // El pipeline no corre Cypress: no descargar su programa (~600 MB) en cada npm install
        CYPRESS_INSTALL_BINARY = '0'
    }

    triggers {
        // Revisa el repositorio cada 5 minutos y corre el pipeline si hay commits nuevos
        pollSCM('H/5 * * * *')
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Tests de unidad') {
            steps {
                dir('blog') {
                    // -P-webapp: no compila el frontend, solo hace falta el backend para estos tests
                    sh './mvnw -ntp -P-webapp test'
                }
            }
            post {
                always {
                    junit 'blog/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Imagen Docker → Docker Hub') {
            steps {
                dir('blog') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USUARIO', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                        // Jib construye la imagen (perfil prod, con el frontend compilado) y la sube
                        // directo a Docker Hub, sin necesitar Docker dentro de Jenkins.
                        // Se publica con el número de build y como "latest".
                        // Comillas simples: las credenciales las expande la shell y no quedan en el log.
                        sh '''
                            ./mvnw -ntp -Pprod -DskipTests verify jib:build \
                                -Djib.to.image="$IMAGEN:$BUILD_NUMBER" \
                                -Djib.to.tags=latest \
                                -Djib.to.auth.username="$DOCKERHUB_USUARIO" \
                                -Djib.to.auth.password="$DOCKERHUB_TOKEN"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Imagen publicada: https://hub.docker.com/r/${IMAGEN}/tags (tags ${BUILD_NUMBER} y latest)"
        }
    }
}
