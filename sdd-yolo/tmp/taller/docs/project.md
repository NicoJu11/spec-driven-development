# Project: Mundial Album 2026

## Mission

Educational web application that simulates a **digital FIFA World Cup 2026 sticker album**
(USA · Mexico · Canada). Students practice full-stack development with Java and Angular:
REST API, persistence, visual components, and tournament data (48 teams, 12 groups,
knockout phase through the final).

## Tech Stack

- **Language:** Java 21
- **Framework:** Spring Boot 3.5.0
- **Frontend:** Angular 19.2 (standalone components)
- **Build tool:** Maven + npm
- **Database:** PostgreSQL 16 (production) / H2 (dev and tests)
- **ORM:** Spring Data JPA
- **Migrations:** Flyway
- **API docs:** springdoc-openapi (planned)
- **Testing:** JUnit 5, Mockito (spring-boot-starter-test); Jasmine/Karma (Angular)
- **Other:** Bean Validation (spring-boot-starter-validation); Lombok, MapStruct (planned)
- **UI library:** Angular Material

## Architecture

Layered backend + Angular SPA frontend, two top-level modules:

```
taller/
├── backend-spring/   ← Spring Boot REST API
├── frontend/         ← Angular SPA
└── docs/
    ├── project.md
    └── specs-archive/
```

### Backend — Layered (controller / service / repository)

```
com.joedayz.mundial
├── controller/      ← REST controllers + request/response DTOs
├── service/         ← business logic (standings, bracket)
├── repository/      ← Spring Data JPA interfaces
├── domain/          ← JPA entities: Team, Group, Sticker, Match
├── config/          ← CORS, OpenAPI, seed data
└── exception/       ← GlobalExceptionHandler (@RestControllerAdvice)
```

### Frontend — Angular feature-based structure

```
src/app/
├── core/            ← services, interceptors, models
├── features/
│   ├── groups/      ← 12-group map + standings
│   ├── teams/       ← team list and detail
│   ├── album/       ← stickers / photos per team
│   └── bracket/     ← knockout tree R32 → Final
└── shared/          ← reusable components (flag, team-card, bracket-node)
```

## Mundial 2026 — Domain Rules

| Aspect | Value |
|--------|-------|
| Teams | 48 |
| Groups | 12 (A–L), 4 teams each |
| Group stage | 3 matches per team; FIFA points (3-1-0) |
| Qualifiers | Top 2 per group + 8 best third-place → 32 |
| Knockout | R32 → R16 → QF → SF → Final (+ 3rd place) |
| Venues | 16 cities in USA, Mexico, and Canada |
| Final | 19 July 2026, MetLife Stadium (NY/NJ) |

## Conventions

- Package naming: `com.joedayz.mundial.<layer>`
- REST base path: `/api/v1`
- Error handling: `GlobalExceptionHandler` → JSON `{ "code", "message", "timestamp" }`
- DTOs in the controller layer; JPA entities are never exposed directly
- Numeric IDs in DB; 3-letter FIFA codes for teams (`ARG`, `ESP`, `MEX`)
- CORS enabled for `http://localhost:4200` (Angular dev server)
- Seed data: 48 teams + groups A–L pre-loaded via Flyway migrations
- No authentication in MVP (sticker collection managed in localStorage)

## Approved Dependencies

**Backend:**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `flyway-core`
- `postgresql` (production)
- `h2` (dev/test, runtime scope)
- `springdoc-openapi-starter-webmvc-ui`
- `org.mapstruct:mapstruct`
- `org.projectlombok:lombok`
- `spring-boot-starter-test` (includes JUnit 5 + Mockito)

**Frontend:**
- `@angular/*` 19.2 (CLI defaults)
- `@angular/material` + `@angular/cdk`
- `rxjs` ~7.8

Anything outside this list must be flagged before adding.

## API Endpoints (MVP)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/teams` | List teams (filter `?group=A`) |
| GET | `/api/v1/teams/{code}` | Team detail + stickers |
| GET | `/api/v1/groups` | All 12 groups with standings |
| GET | `/api/v1/groups/{letter}/standings` | Standings for one group |
| GET | `/api/v1/stickers` | Stickers (filter `?team=ARG`) |
| GET | `/api/v1/bracket` | Full knockout bracket |
| GET | `/api/v1/bracket/{phase}` | Specific phase (R32, R16, QF, SF, FINAL) |

## Features Implemented

_(Updated automatically when a feature is archived with `/sdd-archive`)_
