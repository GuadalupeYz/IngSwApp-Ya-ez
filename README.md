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
| 2 | Dos tests de unidad | ✅ | [ValidacionEntidadesTest.java](blog/src/test/java/ar/edu/um/blog/domain/ValidacionEntidadesTest.java) |
| 3 | Tres tests E2E en Cypress (con login por API) | ✅ | [blog/src/test/javascript/cypress/e2e/blog/](blog/src/test/javascript/cypress/e2e/blog/) |
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

## 2. Tests de unidad

[`ValidacionEntidadesTest.java`](blog/src/test/java/ar/edu/um/blog/domain/ValidacionEntidadesTest.java) prueba que las reglas del modelo JDL se cumplan en las entidades. Son tests **de unidad**: no levantan Spring ni la base de datos, usan directamente el validador de Bean Validation (JUnit 5 + AssertJ).

| Test | Regla del JDL | Qué comprueba |
|------|---------------|---------------|
| `postSinTituloNoEsValido` | `title String required` | Un Post sin título tiene exactamente un error, en `title`; con título, ninguno |
| `blogConNombreCortoNoEsValido` | `name String required minlength(3)` | Un Blog con nombre `"ab"` tiene un error en `name`; con `"abc"`, ninguno |

Para ejecutarlos:

    cd blog
    ./mvnw test -Dtest=ValidacionEntidadesTest

Resultado esperado: `Tests run: 2, Failures: 0, Errors: 0`.

## 3. Tests E2E con Cypress

Los tres tests están en [`blog/src/test/javascript/cypress/e2e/blog/`](blog/src/test/javascript/cypress/e2e/blog/). Los tres **inician sesión por API** con el comando `cy.login` (que hace `POST /api/authenticate` y guarda el token JWT, sin pasar por la pantalla de login) y después prueban una funcionalidad desde la interfaz:

| Test | Qué hace | Qué comprueba |
|------|----------|---------------|
| `01-crear-blog.cy.ts` | Crea un Blog desde el formulario | La API responde 201 y el blog aparece en la lista |
| `02-crear-post.cy.ts` | Crea un Blog **por API** y después un Post asignado a ese blog desde el formulario; abre su detalle | La API responde 201 y el detalle muestra título, contenido y blog |
| `03-crear-y-borrar-tag.cy.ts` | Crea un Tag, lo busca en la lista y lo borra confirmando el diálogo | Aparece en la lista; después del borrado ya no aparece y la API responde 404 |

Cada test limpia por API lo que creó, para poder repetirse. Como en desarrollo JHipster carga datos de ejemplo y las listas muestran 20 elementos del más viejo al más nuevo, los tests ordenan la lista por ID (clic en la cabecera) para encontrar el registro recién creado.

Los tests de ejemplo que genera JHipster se borraron para dejar solo estos tres.

Para ejecutarlos, con la app corriendo (`./mvnw`) en otra terminal:

    cd blog
    npx cypress open      # modo interactivo: E2E Testing → Chrome → elegir el test
    npm run e2e:headless  # los tres, sin ventana

Resultado esperado: `All specs passed!` con 3 tests.
