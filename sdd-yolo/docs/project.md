# Project: Álbum Mundial 2026

## Mission

Aplicación web educativa que simula un **álbum de cromos digital del Mundial FIFA 2026**
(USA · México · Canadá). Los alumnos practican desarrollo full-stack con Java y Angular:
API REST, persistencia, componentes visuales y datos del torneo (48 selecciones, 12 grupos,
fase eliminatoria hasta la final).

## Tech Stack

- **Language:** Java 21
- **Backend (demo principal):** Spring Boot 3.x
- **Backend (variante alternativa):** Quarkus 3.x — misma API, distinto runtime
- **Frontend:** Angular 19 (standalone components, signals donde aplique)
- **Build tool:** Maven (multi-módulo) + npm/pnpm para Angular
- **Database:** PostgreSQL 16 (prod) / H2 (dev y tests)
- **ORM:** Spring Data JPA (Spring Boot) · Hibernate ORM Panache (Quarkus)
- **Migrations:** Flyway
- **API docs:** springdoc-openapi (Spring) · SmallRye OpenAPI (Quarkus)
- **Testing:** JUnit 5, Mockito, Testcontainers, RestAssured; Jasmine/Karma o Vitest en Angular
- **Other:** MapStruct, Lombok, Bean Validation

## Architecture

**Modular monolith** con separación clara backend / frontend:

```
mundial-album/
├── backend-spring/          ← Spring Boot REST API (demo principal)
├── backend-quarkus/         ← Quarkus REST API (opcional, misma interfaz)
├── frontend/                ← Angular SPA
└── docs/
    ├── project.md
    └── specs-archive/
```

### Backend (capas — Spring Boot)

```
com.joedayz.mundial
├── domain/          ← Team, Group, Sticker, Match, TournamentPhase
├── repository/      ← Spring Data JPA interfaces
├── service/         ← lógica de negocio (standings, bracket)
├── web/             ← REST controllers + DTOs
├── config/          ← CORS, OpenAPI, seed data
└── exception/       ← GlobalExceptionHandler (@RestControllerAdvice)
```

### Frontend (Angular)

```
src/app/
├── core/            ← services, interceptors, models
├── features/
│   ├── groups/      ← mapa de 12 grupos + clasificación
│   ├── teams/       ← listado y detalle de selecciones
│   ├── album/       ← cromos / fotos por equipo
│   └── bracket/     ← árbol eliminatorio R32 → Final
└── shared/          ← componentes reutilizables (flag, team-card, bracket-node)
```

## Mundial 2026 — Reglas de dominio

| Aspecto | Valor |
|---------|-------|
| Equipos | 48 |
| Grupos | 12 (A–L), 4 equipos cada uno |
| Fase de grupos | 3 partidos por equipo; puntos FIFA (3-1-0) |
| Clasificados | Top 2 de cada grupo + 8 mejores terceros → 32 |
| Eliminatoria | R32 → R16 → Cuartos → Semis → Final (+ 3.er puesto) |
| Sedes | 16 ciudades en USA, México y Canadá |
| Final | 19 julio 2026, MetLife Stadium (NY/NJ) |

## Conventions

- Package naming: `com.joedayz.mundial.<layer>`
- REST base path: `/api/v1`
- Error handling: `GlobalExceptionHandler` → JSON `{ "code", "message", "timestamp" }`
- DTOs en capa web; entidades JPA nunca expuestas directamente
- IDs numéricos en BD; códigos FIFA de 3 letras para equipos (`ARG`, `ESP`, `MEX`)
- CORS habilitado para `http://localhost:4200` (Angular dev server)
- Seed data: 48 equipos + grupos A–L precargados vía Flyway o `data.sql`
- Sin autenticación en el MVP del workshop (colección de cromos en localStorage)

## Approved Dependencies

**Backend Spring:** spring-boot-starter-web, spring-boot-starter-data-jpa, flyway-core,
postgresql, h2, springdoc-openapi, mapstruct, lombok, testcontainers

**Backend Quarkus:** quarkus-rest, quarkus-hibernate-orm-panache, quarkus-flyway,
quarkus-jdbc-postgresql, quarkus-smallrye-openapi

**Frontend:** Angular CLI defaults; Angular Material o PrimeNG para UI (elegir uno)

## API Endpoints (MVP)

| Method | Path | Descripción |
|--------|------|-------------|
| GET | `/api/v1/teams` | Listar equipos (filtro `?group=A`) |
| GET | `/api/v1/teams/{code}` | Detalle de equipo + cromos |
| GET | `/api/v1/groups` | 12 grupos con clasificación |
| GET | `/api/v1/groups/{letter}/standings` | Tabla de un grupo |
| GET | `/api/v1/stickers` | Cromos (filtro `?team=ARG`) |
| GET | `/api/v1/bracket` | Árbol completo eliminatorio |
| GET | `/api/v1/bracket/{phase}` | Fase concreta (R32, R16, QF, SF, FINAL) |

## Features Implemented

_(Se actualiza al archivar cada feature con `/sdd-archive`)_
