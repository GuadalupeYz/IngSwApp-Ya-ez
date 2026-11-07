# Trabajo final: Ingeniería de Software Aplicada

Alumna: María Guadalupe Yañez

Aplicación **Blog** hecha con JHipster a partir de un modelo JDL, con tests de unidad y E2E, deploy en Docker, logs centralizados en ELK, una PWA en Ionic que consume su API y un pipeline de integración continua en Jenkins.

## Estructura

```
├── blog/        # App JHipster (Spring Boot + Angular), generada desde blog/blog.jh
└── ...          # (se completa a medida que avanza el trabajo)
```

## Requisitos

| # | Requisito | Estado | Dónde |
|---|-----------|--------|-------|
| 1 | App JHipster basada en un modelo JDL | ✅ | [blog/](blog/) — modelo [blog.jh](blog/blog.jh), basado en [jdl-samples](https://github.com/jhipster/jdl-samples/blob/main/blog.jh) |
| 2 | Dos tests de unidad | Pendiente | |
| 3 | Tres tests E2E en Cypress (con login por API) | Pendiente | |
| 4 | Deploy en Docker | Pendiente | |
| 5 | Servidor de logs (ELK) que tome los logs en Docker | Pendiente | |
| 6 | Aplicación progresiva en Ionic que consuma la API de JHipster | Pendiente | |
| 7 | La app Ionic como PWA que funcione sin conexión | Pendiente | |
| 8 | Integración continua con Jenkins que genere la imagen Docker y la publique en Docker Hub | Pendiente | |

## 1. App JHipster

El modelo está en [`blog/blog.jh`](blog/blog.jh): tres entidades, **Blog**, **Post** y **Tag**, relacionadas con el usuario de JHipster.

```
Blog (name, handle) ──► User
Post (title, content, date) ──► Blog
Post ◄──► Tag (name)          (muchos a muchos)
```

Configuración elegida sobre el ejemplo original:

| Opción | Valor | Por qué |
|--------|-------|---------|
| `authenticationType` | `jwt` | Login por token, que también usan la PWA y los tests de Cypress |
| `devDatabaseType` | `h2Disk` | En desarrollo no hace falta levantar una base aparte |
| `prodDatabaseType` | `postgresql` | Base real para el deploy en Docker |
| `testFrameworks` | `[cypress]` | Para los tests E2E |
| `nativeLanguage` | `es` | Interfaz en español |

Se generó con JHipster 9.4:

    cd blog
    npx generator-jhipster@9.4.0 jdl blog.jh

### Cómo ejecutarla en desarrollo

Requiere Java 21. La primera vez descarga las dependencias y Node, y compila el frontend:

    cd blog
    ./mvnw

Queda en http://localhost:8080 (usuario `admin`, contraseña `admin`).
