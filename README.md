# Trabajo final: Ingeniería de Software Aplicada

Alumna: María Guadalupe Yañez

Aplicación **Blog** hecha con JHipster a partir de un modelo JDL, con tests de unidad y E2E, deploy en Docker, logs centralizados en ELK, una PWA en Ionic que consume su API y un pipeline de integración continua en Jenkins.

## Estructura

```
├── blog/        # App JHipster (Spring Boot + Angular), generada desde blog/blog.jh
├── deploy/      # Deploy en Docker: app + PostgreSQL + ELK
└── ...          # (se completa a medida que avanza el trabajo)
```

## Requisitos

| # | Requisito | Estado | Dónde |
|---|-----------|--------|-------|
| 1 | App JHipster basada en un modelo JDL | ✅ | [blog/](blog/) — modelo [blog.jh](blog/blog.jh), basado en [jdl-samples](https://github.com/jhipster/jdl-samples/blob/main/blog.jh) |
| 2 | Dos tests de unidad | ✅ | [ValidacionEntidadesTest.java](blog/src/test/java/ar/edu/um/blog/domain/ValidacionEntidadesTest.java) |
| 3 | Tres tests E2E en Cypress (con login por API) | ✅ | [blog/src/test/javascript/cypress/e2e/blog/](blog/src/test/javascript/cypress/e2e/blog/) |
| 4 | Deploy en Docker | ✅ | [deploy/docker-compose.yml](deploy/docker-compose.yml) |
| 5 | Servidor de logs (ELK) que tome los logs en Docker | ✅ | [deploy/](deploy/) |
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

## 4. Deploy en Docker

Todo el sistema corre en contenedores, definido en [`deploy/docker-compose.yml`](deploy/docker-compose.yml):

| Servicio | Imagen | Para qué | Puerto |
|----------|--------|----------|--------|
| `app` | `blog:latest` (generada con Jib) | La app JHipster en perfil **prod** | http://localhost:8080 |
| `postgresql` | `postgres:18.6` | Base de datos de producción (datos en el volumen `pgdata`) | interno |
| `elasticsearch` | `elasticsearch:9.4.6` | Guarda e indexa los logs | http://localhost:9200 |
| `logstash` | `logstash:9.4.6` | Recibe los logs de la app, los filtra y enmascara | 5000 |
| `kibana` | `kibana:9.4.6` | Búsqueda, dashboards y alertas | http://localhost:5601 |

**La imagen de la app** se construye con [Jib](https://github.com/GoogleContainerTools/jib), que ya viene configurado en el `pom.xml` de JHipster. No hace falta un Dockerfile: Jib arma la imagen en capas (dependencias, recursos y clases) sobre `eclipse-temurin:25-jre`.

Los contenedores arrancan en orden con *healthchecks*: primero PostgreSQL y Elasticsearch, después Logstash, y la app recién cuando la base y Logstash están listos.

### Cómo levantarlo

Requiere Docker. Construir la imagen de la app (unos minutos la primera vez):

    cd blog
    ./mvnw -Pprod -DskipTests verify jib:dockerBuild

Levantar todo (la primera vez descarga las imágenes de PostgreSQL y Elastic):

    cd ../deploy
    docker compose up -d

Configurar Kibana (una sola vez, con el stack levantado):

    ./kibana-setup.sh

La app queda en http://localhost:8080 (usuario `admin`, contraseña `admin`). Para apagar todo: `docker compose down` (con `-v` también se borran los datos y los logs).

Usa unos 2 GB de RAM: Elasticsearch ~1 GB, la app ~500 MB, Logstash ~200 MB, Kibana y PostgreSQL el resto.

## 5. Logs centralizados con ELK

La app, **desde su contenedor**, envía cada log en JSON a `logstash:5000` por la red interna de Docker. Logstash los filtra y los guarda en Elasticsearch, y en Kibana se consultan.

```
app (contenedor) ──JSON por TCP──► logstash ──► elasticsearch ◄── kibana
```

- **Envío desde la app:** se activa con variables de entorno en el compose (`JHIPSTER_LOGGING_LOGSTASH_ENABLED=true`, host `logstash`, puerto `5000`). El envío es asíncrono: si Logstash no responde, la app sigue funcionando. Se agregó al `pom.xml` la librería `logstash-logback-encoder`, que en JHipster 9 es opcional.
- **Logs con contexto:** con `kv()` de logstash-logback-encoder, algunos datos quedan como campos propios en Elasticsearch y se puede filtrar por ellos:

  | Dónde | Log | Campos |
  |-------|-----|--------|
  | `AuthenticateController` | `WARN Login fallido` / `INFO Login exitoso` | `usuario`, `motivo` (nunca la contraseña) |
  | `PostResource` | `INFO Post creado` | `postId`, `blogId` |
  | `PostResource` | `WARN Se intentó borrar un post que no existe` / `INFO Post borrado` | `postId` |

- **Filtros de Logstash** ([`logstash.conf`](deploy/logstash/pipeline/logstash.conf)): borran los campos `password`, `token` y `authorization` si algún log los trae, enmascaran números de tarjeta (`************1111`) y agregan `env: docker`. Los logs se guardan en índices diarios `jhipster-logs-AAAA.MM.DD`.
- **Retención** ([`kibana-setup.sh`](deploy/kibana-setup.sh)): política ILM que pasa los índices a solo lectura a los 7 días y los borra a los 30. El script también crea el data view **"Logs de JHipster"** en Kibana.

### Qué mirar en Kibana

Kibana → menú → **Discover** → data view **Logs de JHipster**:

| Consulta (KQL) | Qué muestra |
|----------------|-------------|
| `message : "Login fallido"` | Intentos de login fallidos (posible fuerza bruta) |
| `usuario : "admin"` | Todo lo que hizo un usuario |
| `postId : *` | Los posts creados y borrados |
| `level : "WARN" or level : "ERROR"` | Todo lo que merece atención |
