# Implementation Plan: FIFA World Cup 2026 Digital Album — Full MVP

## Overview

Full-stack implementation of the Mundial Album 2026 MVP. The backend is a Spring Boot 3.5 layered REST API (Java 21, Maven, Spring Data JPA, Flyway, H2). The frontend is an Angular 19.2 SPA with Angular Material and standalone components. Seed data is loaded entirely via Flyway migrations on startup — no runtime data population needed. Collection state is persisted in the backend scoped to an anonymous session UUID generated client-side.

**Build commands:**
- Backend: `cd backend-spring && ./mvnw spring-boot:run` / `./mvnw test`
- Frontend: `cd frontend && npm start` / `npm test`

**Open questions resolved for this plan:**
- Standings: pre-computed rows in a `standings` table seeded by Flyway (not computed dynamically from matches — MVP simplicity)
- 3rd-place match: rendered as a separate panel alongside the Final, not inside the main bracket tree
- Sticker images: single `/assets/stickers/placeholder.jpg` reused for all player stickers; Sede sticker image reuses the team flag
- Confederation counts: UEFA 16, CONMEBOL 6, CONCACAF 6, CAF 9, AFC 8, OFC 1, inter-confederation playoff teams 2 (classified under CONCACAF + AFC per their qualifying region)

---

## Architecture Decisions

- **Layered backend:** `domain → repository → service → controller`; entities never leave the service layer — DTOs are assembled in the controller.
- **Enums as strings in DB:** `confederation`, `position`, `sticker_type`, and `phase` are stored as `VARCHAR` in SQL and mapped as Java `@Enumerated(EnumType.STRING)` to stay readable in migrations.
- **UUID session identity:** `collection` table has a `session_id VARCHAR(36)` column. The backend validates UUID format using `java.util.UUID.fromString()` and returns 400 on failure. No Spring Security configuration required.
- **Idempotent collection:** `POST /api/v1/collection/{id}` uses `INSERT ... ON CONFLICT DO NOTHING` (H2: `MERGE INTO`) via a custom repository method — no double-entry exception.
- **Pre-computed standings:** A `standings` table is seeded directly via Flyway V4; no computation logic is needed for the MVP.
- **Angular signals:** Angular 19.2 supports signals; use `signal()` for local component state (collected-set, active filter) and `HttpClient` for remote calls. Keep services as plain RxJS-based services for HTTP.
- **Standalone components:** All Angular components are standalone. `app.config.ts` provides `provideHttpClient()` and `provideRouter()`.
- **Optimistic UI for collection:** `CollectionService` maintains a local `Set<number>` of collected sticker IDs. On toggle, it updates the local set immediately (optimistic) and rolls back on API error.

---

## Implementation Steps

### Step 1: Backend — Project Configuration

- [ ] Add `org.projectlombok:lombok` and `org.mapstruct:mapstruct` (+ annotation processor) to `pom.xml`
- [ ] Add `springdoc-openapi-starter-webmvc-ui` to `pom.xml`
- [ ] Configure `application.properties`:
  - H2 datasource: `spring.datasource.url=jdbc:h2:mem:mundialdb`
  - JPA: `spring.jpa.hibernate.ddl-auto=validate`
  - Flyway: `spring.flyway.enabled=true`, `spring.flyway.locations=classpath:db/migration`
  - H2 console: `spring.h2.console.enabled=true` (dev convenience)

**Files to modify:**
- `backend-spring/pom.xml`
- `backend-spring/src/main/resources/application.properties`

---

### Step 2: Backend — Database Schema (Flyway V1)

- [ ] Create `V1__create_tables.sql` with DDL for all tables

```sql
-- teams
CREATE TABLE teams (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(3)   NOT NULL UNIQUE,
    name          VARCHAR(100) NOT NULL,
    group_letter  CHAR(1)      NOT NULL,
    confederation VARCHAR(20)  NOT NULL,
    flag_path     VARCHAR(100) NOT NULL
);

-- stickers
CREATE TABLE stickers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_code    VARCHAR(3)  NOT NULL,
    player_name  VARCHAR(100),
    position     VARCHAR(5),
    shirt_number INT,
    image_url    VARCHAR(200) NOT NULL,
    type         VARCHAR(10)  NOT NULL DEFAULT 'PLAYER',
    CONSTRAINT fk_sticker_team FOREIGN KEY (team_code) REFERENCES teams(code)
);

-- standings (pre-computed per group)
CREATE TABLE standings (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_letter     CHAR(1)    NOT NULL,
    team_code        VARCHAR(3) NOT NULL,
    played           INT        NOT NULL DEFAULT 0,
    won              INT        NOT NULL DEFAULT 0,
    drawn            INT        NOT NULL DEFAULT 0,
    lost             INT        NOT NULL DEFAULT 0,
    goals_for        INT        NOT NULL DEFAULT 0,
    goals_against    INT        NOT NULL DEFAULT 0,
    goal_difference  INT        GENERATED ALWAYS AS (goals_for - goals_against),  -- H2 computed col
    points           INT        NOT NULL DEFAULT 0
);

-- matches (group stage + knockout)
CREATE TABLE matches (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    phase           VARCHAR(15)  NOT NULL,
    home_team_code  VARCHAR(3),
    away_team_code  VARCHAR(3),
    home_score      INT,
    away_score      INT,
    match_date      DATE,
    venue           VARCHAR(100),
    winner_code     VARCHAR(3)
);

-- collection (anonymous session-scoped)
CREATE TABLE collection (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id   VARCHAR(36)  NOT NULL,
    sticker_id   BIGINT       NOT NULL,
    collected_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_collection UNIQUE (session_id, sticker_id),
    CONSTRAINT fk_collection_sticker FOREIGN KEY (sticker_id) REFERENCES stickers(id)
);
```

> **Note:** H2 `GENERATED ALWAYS AS` syntax may differ from PostgreSQL. Use a regular column and compute `goal_difference` in the service layer if H2 rejects it — remove the computed column and set it explicitly in the seed.

**Files to create:**
- `backend-spring/src/main/resources/db/migration/V1__create_tables.sql`

---

### Step 3: Backend — Seed Data (Flyway V2–V4)

- [ ] Create `V2__seed_teams.sql` — 48 INSERT rows, one per FIFA 2026 team with `code`, `name`, `group_letter`, `confederation`, `flag_path` (format: `/assets/flags/{CODE}.svg`)
- [ ] Create `V3__seed_stickers.sql` — 1,104 `PLAYER` stickers (23 per team × 48) + 3 `SEDE` stickers for USA, MEX, CAN. Player fields: `player_name`, `position`, `shirt_number`; `image_url = '/assets/stickers/placeholder.jpg'`. Sede: `player_name = 'Host Nation'`, `position = NULL`, `shirt_number = NULL`, `image_url` = team flag path, `type = 'SEDE'`
- [ ] Create `V4__seed_matches_standings.sql` — real 2026 group-stage results (where available; NULL scores for unplayed matches) + pre-computed standings rows, + knockout bracket matches

**Files to create:**
- `backend-spring/src/main/resources/db/migration/V2__seed_teams.sql`
- `backend-spring/src/main/resources/db/migration/V3__seed_stickers.sql`
- `backend-spring/src/main/resources/db/migration/V4__seed_matches_standings.sql`

---

### Step 4: Backend — Domain Layer

- [ ] Create enum `Confederation` with values: `UEFA`, `CONMEBOL`, `CONCACAF`, `CAF`, `AFC`, `OFC`
- [ ] Create enum `Position` with values: `GK`, `DEF`, `MID`, `FWD`
- [ ] Create enum `StickerType` with values: `PLAYER`, `SEDE`
- [ ] Create enum `Phase` with values: `R32`, `R16`, `QF`, `SF`, `FINAL`, `THIRD_PLACE`
- [ ] Create `@Entity Team` — fields: `id`, `code`, `name`, `groupLetter` (char), `confederation` (enum), `flagPath`
- [ ] Create `@Entity Sticker` — fields: `id`, `teamCode`, `playerName`, `position` (enum), `shirtNumber`, `imageUrl`, `type` (enum `StickerType`)
- [ ] Create `@Entity Standing` — fields: `id`, `groupLetter`, `teamCode`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points`
- [ ] Create `@Entity Match` — fields: `id`, `phase` (enum), `homeTeamCode`, `awayTeamCode`, `homeScore`, `awayScore`, `matchDate`, `venue`, `winnerCode`
- [ ] Create `@Entity CollectionEntry` — fields: `id`, `sessionId` (String/UUID), `stickerId` (Long), `collectedAt` (Instant)

Use `@Enumerated(EnumType.STRING)` on all enum fields. Use Lombok `@Data` / `@Builder` / `@NoArgsConstructor` / `@AllArgsConstructor`.

**Files to create:**
```
backend-spring/src/main/java/com/joedayz/mundial/domain/
├── Confederation.java
├── Position.java
├── StickerType.java
├── Phase.java
├── Team.java
├── Sticker.java
├── Standing.java
├── Match.java
└── CollectionEntry.java
```

---

### Step 5: Backend — Repository Layer

- [ ] `TeamRepository extends JpaRepository<Team, Long>`
  - `List<Team> findByGroupLetter(char groupLetter)`
  - `List<Team> findByConfederation(Confederation confederation)`
  - `Optional<Team> findByCode(String code)`
- [ ] `StickerRepository extends JpaRepository<Sticker, Long>`
  - `List<Sticker> findByTeamCode(String teamCode)`
  - `List<Sticker> findByTeamCodeOrderByTypeAscShirtNumberAsc(String teamCode)` (SEDE first)
- [ ] `StandingRepository extends JpaRepository<Standing, Long>`
  - `List<Standing> findByGroupLetterOrderByPointsDescGoalDifferenceDescGoalsForDesc(char groupLetter)`
  - `List<Standing> findAll()`
- [ ] `MatchRepository extends JpaRepository<Match, Long>`
  - `List<Match> findByPhase(Phase phase)`
  - `List<Match> findAll()`
- [ ] `CollectionEntryRepository extends JpaRepository<CollectionEntry, Long>`
  - `Optional<CollectionEntry> findBySessionIdAndStickerId(String sessionId, Long stickerId)`
  - `List<CollectionEntry> findBySessionId(String sessionId)`
  - `void deleteBySessionIdAndStickerId(String sessionId, Long stickerId)`

**Files to create:**
```
backend-spring/src/main/java/com/joedayz/mundial/repository/
├── TeamRepository.java
├── StickerRepository.java
├── StandingRepository.java
├── MatchRepository.java
└── CollectionEntryRepository.java
```

---

### Step 6: Backend — Service Layer

- [ ] `TeamService`
  - `List<TeamDto> getAll()`
  - `List<TeamDto> getByGroup(char letter)` — validates A–L
  - `List<TeamDto> getByConfederation(Confederation conf)` — validates enum
  - `TeamDetailDto getByCode(String code)` — throws `NotFoundException` if absent
  - Internal guard: if both `group` and `confederation` params are provided, throw `BadRequestException`
- [ ] `GroupService`
  - `List<GroupDto> getAllGroups()` — groups standings by letter A–L
  - `List<StandingDto> getStandings(char letter)` — validates A–L, throws `BadRequestException` if invalid
- [ ] `BracketService`
  - `BracketDto getFullBracket()` — all phases
  - `List<MatchDto> getByPhase(String phase)` — validates Phase enum, throws `BadRequestException` on invalid
- [ ] `CollectionService`
  - `List<Long> getCollection(String sessionId)` — returns list of sticker IDs
  - `void collect(String sessionId, Long stickerId)` — idempotent insert; validates sticker exists
  - `void uncollect(String sessionId, Long stickerId)` — no-op if not present

Session UUID validation helper (shared): `validateSessionId(String sessionId)` — calls `UUID.fromString()`, throws `BadRequestException` on `IllegalArgumentException`.

**Files to create:**
```
backend-spring/src/main/java/com/joedayz/mundial/service/
├── TeamService.java
├── GroupService.java
├── BracketService.java
└── CollectionService.java
```

---

### Step 7: Backend — Controller Layer, DTOs & Exception Handling

#### DTOs

- [ ] `TeamDto` — `id`, `code`, `name`, `groupLetter`, `confederation`, `flagPath`
- [ ] `TeamDetailDto` — all `TeamDto` fields + `List<StickerDto> stickers`
- [ ] `StickerDto` — `id`, `teamCode`, `playerName`, `position`, `shirtNumber`, `imageUrl`, `type`
- [ ] `StandingDto` — `teamCode`, `teamName`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points`
- [ ] `GroupDto` — `letter`, `List<StandingDto> standings`
- [ ] `MatchDto` — `id`, `phase`, `homeTeamCode`, `homeTeamName`, `awayTeamCode`, `awayTeamName`, `homeScore`, `awayScore`, `matchDate`, `venue`, `winnerCode`
- [ ] `BracketDto` — `Map<String, List<MatchDto>> phases` (key = phase name)
- [ ] `ErrorDto` — `code`, `message`, `timestamp`

#### Controllers

- [ ] `TeamController` (`@RestController @RequestMapping("/api/v1/teams")`)
  - `GET /` — `?group` or `?confederation` (mutually exclusive)
  - `GET /{code}`
- [ ] `GroupController` (`@RestController @RequestMapping("/api/v1/groups")`)
  - `GET /`
  - `GET /{letter}/standings`
- [ ] `BracketController` (`@RestController @RequestMapping("/api/v1/bracket")`)
  - `GET /`
  - `GET /{phase}`
- [ ] `CollectionController` (`@RestController @RequestMapping("/api/v1/collection")`)
  - `GET /` — reads `X-Session-Id` header
  - `POST /{stickerId}` — reads `X-Session-Id` header
  - `DELETE /{stickerId}` — reads `X-Session-Id` header

#### Exception Handling

- [ ] `NotFoundException extends RuntimeException`
- [ ] `BadRequestException extends RuntimeException`
- [ ] `GlobalExceptionHandler (@RestControllerAdvice)`
  - `@ExceptionHandler(NotFoundException.class)` → 404 + `ErrorDto`
  - `@ExceptionHandler(BadRequestException.class)` → 400 + `ErrorDto`
  - `@ExceptionHandler(Exception.class)` → 500 + `ErrorDto`

#### Config

- [ ] `CorsConfig (@Configuration)` — `WebMvcConfigurer` allowing origins `http://localhost:4200` for all endpoints and methods
- [ ] `OpenApiConfig (@Configuration)` — springdoc `OpenAPI` bean with title "Mundial Album 2026 API"

**Files to create:**
```
backend-spring/src/main/java/com/joedayz/mundial/
├── controller/
│   ├── TeamController.java
│   ├── GroupController.java
│   ├── BracketController.java
│   └── CollectionController.java
├── controller/dto/
│   ├── TeamDto.java
│   ├── TeamDetailDto.java
│   ├── StickerDto.java
│   ├── StandingDto.java
│   ├── GroupDto.java
│   ├── MatchDto.java
│   ├── BracketDto.java
│   └── ErrorDto.java
├── exception/
│   ├── NotFoundException.java
│   ├── BadRequestException.java
│   └── GlobalExceptionHandler.java
└── config/
    ├── CorsConfig.java
    └── OpenApiConfig.java
```

---

### Step 8: Backend — Tests

- [ ] `TeamControllerTest` (`@SpringBootTest + @AutoConfigureMockMvc`)
  - `getTeams_returnsAll48()`
  - `getTeams_filterByGroup_returnsExactly4()`
  - `getTeams_filterByConfederation_returnsUEFATeams()` → AC-19
  - `getTeams_invalidConfederation_returns400()` → AC-20
  - `getTeams_combinedFilters_returns400()` → AC-21
  - `getTeamByCode_ARG_returns23PlayerStickers()` → AC-02 / AC-23
  - `getTeamByCode_USA_returns24Stickers()` → AC-22
  - `getTeamByCode_notFound_returns404()` → AC-18
- [ ] `GroupControllerTest`
  - `getAllGroups_returns12Groups()` → AC-03
  - `getStandings_groupA_orderedCorrectly()` → AC-04
- [ ] `BracketControllerTest`
  - `getFullBracket_finalHasRealScores()` → AC-08
  - `getByPhase_invalidPhase_returns400()` → AC-09
- [ ] `CollectionControllerTest`
  - `collect_sticker_idempotent()` → AC-05
  - `getCollection_scopedToSession()` → AC-06
  - `uncollectSticker_removesEntry()` → AC-07
  - `collect_invalidSessionId_returns400()`
  - `collect_unknownSticker_returns404()`

**Files to create:**
```
backend-spring/src/test/java/com/joedayz/mundial/
├── TeamControllerTest.java
├── GroupControllerTest.java
├── BracketControllerTest.java
└── CollectionControllerTest.java
```

---

### Step 9: Frontend — Bootstrap & Configuration

- [ ] Install Angular Material: `ng add @angular/material` (choose a theme, enable typography and animations)
- [ ] Add `provideHttpClient()` and `provideRouter(routes)` to `app.config.ts`
- [ ] Set base SCSS styles in `styles.scss` (CSS reset, Material theme variables)
- [ ] Create `src/environments/environment.ts` with `apiUrl: 'http://localhost:8080'`

**Files to modify/create:**
- `frontend/src/app/app.config.ts`
- `frontend/src/styles.scss`
- `frontend/src/environments/environment.ts`

---

### Step 10: Frontend — Core Models & Services

#### Models (`src/app/core/models/`)

- [ ] `team.model.ts` — `interface Team { id, code, name, groupLetter, confederation, flagPath }`
- [ ] `sticker.model.ts` — `interface Sticker { id, teamCode, playerName, position, shirtNumber, imageUrl, type: 'PLAYER' | 'SEDE' }`
- [ ] `team-detail.model.ts` — `interface TeamDetail extends Team { stickers: Sticker[] }`
- [ ] `standing.model.ts` — `interface Standing { teamCode, teamName, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }`
- [ ] `group.model.ts` — `interface Group { letter, standings: Standing[] }`
- [ ] `match.model.ts` — `interface Match { id, phase, homeTeamCode, homeTeamName, awayTeamCode, awayTeamName, homeScore, awayScore, matchDate, venue, winnerCode }`

#### Services (`src/app/core/services/`)

- [ ] `session.service.ts` — reads/writes `sessionId` from `localStorage`; generates UUID v4 via `crypto.randomUUID()` on first visit; exposes `getSessionId(): string`
- [ ] `team.service.ts` — `getTeams(filter?: {group?: string; confederation?: string}): Observable<Team[]>`, `getTeamDetail(code: string): Observable<TeamDetail>`
- [ ] `group.service.ts` — `getGroups(): Observable<Group[]>`, `getStandings(letter: string): Observable<Standing[]>`
- [ ] `bracket.service.ts` — `getBracket(): Observable<Record<string, Match[]>>`
- [ ] `collection.service.ts` — maintains `collectedIds = signal<Set<number>>(new Set())`; on init loads from `GET /api/v1/collection`; exposes `isCollected(id)`, `toggle(stickerId)` (optimistic); injects `SessionService` and appends `X-Session-Id` header

**Files to create:**
```
frontend/src/app/core/
├── models/
│   ├── team.model.ts
│   ├── sticker.model.ts
│   ├── team-detail.model.ts
│   ├── standing.model.ts
│   ├── group.model.ts
│   └── match.model.ts
└── services/
    ├── session.service.ts
    ├── team.service.ts
    ├── group.service.ts
    ├── bracket.service.ts
    └── collection.service.ts
```

---

### Step 11: Frontend — Routing & Navigation Shell

- [ ] Define routes in `app.routes.ts`:
  ```ts
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
  { path: 'teams', loadComponent: () => TeamsComponent },
  { path: 'teams/:code', loadComponent: () => TeamDetailComponent },
  { path: 'groups', loadComponent: () => GroupsComponent },
  { path: 'bracket', loadComponent: () => BracketComponent },
  ```
- [ ] Update `app.component.ts` with Angular Material `MatToolbar` navigation bar showing links: **Teams**, **Groups**, **Bracket** and title "Mundial 2026"
- [ ] Update `app.component.html` with `<mat-toolbar>` + `<router-outlet>`

**Files to modify:**
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/app.component.ts`
- `frontend/src/app/app.component.html`
- `frontend/src/app/app.component.scss`

---

### Step 12: Frontend — Shared Components

- [ ] `FlagComponent` (`src/app/shared/flag/`) — `@Input() code: string`; renders `<img [src]="'/assets/flags/' + code + '.svg'" [alt]="code">`; standalone
- [ ] `TeamCardComponent` (`src/app/shared/team-card/`) — `@Input() team: Team`; shows flag, name, group badge; emits `@Output() clicked`; standalone
- [ ] `StickerCardComponent` (`src/app/shared/sticker-card/`) — `@Input() sticker: Sticker`, `@Input() collected: boolean`; emits `@Output() toggle`; applies `.sede` CSS class and `.collected` class; `aria-label`; standalone
- [ ] `BracketNodeComponent` (`src/app/shared/bracket-node/`) — `@Input() match: Match`; renders two team rows with flags + scores or "TBD"; standalone

**Files to create:**
```
frontend/src/app/shared/
├── flag/
│   ├── flag.component.ts
│   └── flag.component.scss
├── team-card/
│   ├── team-card.component.ts
│   └── team-card.component.scss
├── sticker-card/
│   ├── sticker-card.component.ts
│   └── sticker-card.component.scss
└── bracket-node/
    ├── bracket-node.component.ts
    └── bracket-node.component.scss
```

---

### Step 13: Frontend — Feature Views

#### Teams (`/teams`) — FR-09, AC-10, AC-25

- [ ] `TeamsComponent` — loads all teams on init; exposes `groupFilter = signal<string | null>(null)` and `confederationFilter = signal<string | null>(null)`; computed `filtered = computed(() => ...)` applies active filter; selecting a group chip clears confederation filter and vice versa; renders `<app-team-card>` grid; navigate to `/teams/:code` on card click

#### Team Detail + Album (`/teams/:code`) — FR-10, FR-16, AC-11–AC-13, AC-22–AC-24

- [ ] `TeamDetailComponent` — loads `TeamDetail` by `:code`; injects `CollectionService`; renders team header with `<app-flag>`, group and confederation badges; renders `<app-sticker-card>` grid (Sede stickers first); shows `MatProgressBar` with `collected / total` label; on toggle calls `CollectionService.toggle(stickerId)`

#### Groups (`/groups`) — FR-11, AC-14

- [ ] `GroupsComponent` — loads all groups on init; renders 12 `MatCard` components each with a `MatTable` for standings; column order: rank, flag, team name, P, W, D, L, GF, GA, GD, Pts; top 2 rows highlighted with a qualifier badge

#### Bracket (`/bracket`) — FR-12, AC-15

- [ ] `BracketComponent` — loads full bracket on init; renders phases in columns (R32 → R16 → QF → SF → Final); 3rd-place match rendered as a separate `MatCard` panel alongside Final; uses `<app-bracket-node>` for each match; horizontally scrollable via `overflow-x: auto` on the container

**Files to create:**
```
frontend/src/app/features/
├── teams/
│   ├── teams.component.ts
│   └── teams.component.scss
├── team-detail/
│   ├── team-detail.component.ts
│   └── team-detail.component.scss
├── groups/
│   ├── groups.component.ts
│   └── groups.component.scss
└── bracket/
    ├── bracket.component.ts
    └── bracket.component.scss
```

---

### Step 14: Frontend — Flag Assets

- [ ] Place 48 flag image files at `frontend/src/assets/flags/{CODE}.svg` (or `.png`)
- [ ] Verify that Angular serves them at `/assets/flags/{CODE}.svg` (default asset path in `angular.json`)
- [ ] If individual flag files are not available, use a single placeholder flag and configure `FlagComponent` to fall back gracefully

**Files to create:**
- `frontend/src/assets/flags/*.svg` (48 files)
- `frontend/src/assets/stickers/placeholder.jpg` (1 file)

---

### Step 15: Frontend — Tests

- [ ] `AppComponent` spec — verify nav links to Teams, Groups, Bracket are rendered → AC-17
- [ ] `TeamsComponent` spec — mock `TeamService`; verify 48 cards rendered; group filter hides non-matching cards → AC-10; confederation filter clears group filter → AC-25
- [ ] `TeamDetailComponent` spec — mock `TeamService` + `CollectionService`; ARG shows 23 stickers; USA shows 24; Sede sticker has `.sede` class and appears first; progress bar ratio correct → AC-11, AC-22, AC-23, AC-24
- [ ] `CollectionService` spec — mock `HttpClient`; toggle calls POST/DELETE; optimistic update applied before response → AC-12; sessionId header sent → AC-13
- [ ] `GroupsComponent` spec — mock `GroupService`; 12 group cards rendered; column headers present → AC-14
- [ ] `BracketComponent` spec — mock `BracketService`; all phase columns and 3rd-place panel rendered → AC-15

**Files to create:**
```
frontend/src/app/
├── app.component.spec.ts       (modify existing)
├── features/teams/teams.component.spec.ts
├── features/team-detail/team-detail.component.spec.ts
├── features/groups/groups.component.spec.ts
├── features/bracket/bracket.component.spec.ts
└── core/services/collection.service.spec.ts
```

---

## Acceptance Criteria Mapping

| AC | Verified By |
|----|-------------|
| AC-01 | `TeamControllerTest#getTeams_returnsAll48` + `getTeams_filterByGroup_returnsExactly4` |
| AC-02 | `TeamControllerTest#getTeamByCode_ARG_returns23PlayerStickers` |
| AC-03 | `GroupControllerTest#getAllGroups_returns12Groups` |
| AC-04 | `GroupControllerTest#getStandings_groupA_orderedCorrectly` |
| AC-05 | `CollectionControllerTest#collect_sticker_idempotent` |
| AC-06 | `CollectionControllerTest#getCollection_scopedToSession` |
| AC-07 | `CollectionControllerTest#uncollectSticker_removesEntry` |
| AC-08 | `BracketControllerTest#getFullBracket_finalHasRealScores` |
| AC-09 | `BracketControllerTest#getByPhase_invalidPhase_returns400` |
| AC-10 | `TeamsComponentSpec#displaysAllTeams_filtersByGroup` |
| AC-11 | `TeamDetailComponentSpec#navigatesToTeamDetail` |
| AC-12 | `TeamDetailComponentSpec#togglesCollectedState` |
| AC-13 | `CollectionServiceSpec#sessionIdHeaderSent` |
| AC-14 | `GroupsComponentSpec#displaysAllGroupTables` |
| AC-15 | `BracketComponentSpec#displaysFullBracket` |
| AC-16 | Manual: verify no 404s in browser network tab for `/assets/flags/*.svg` |
| AC-17 | `AppComponentSpec#navLinksPresent` |
| AC-18 | `TeamControllerTest#getTeamByCode_notFound_returns404` |
| AC-19 | `TeamControllerTest#getTeams_filterByConfederation_returnsUEFATeams` |
| AC-20 | `TeamControllerTest#getTeams_invalidConfederation_returns400` |
| AC-21 | `TeamControllerTest#getTeams_combinedFilters_returns400` |
| AC-22 | `TeamControllerTest#getTeamByCode_USA_returns24Stickers` + `TeamDetailComponentSpec#usaHas24Stickers` |
| AC-23 | `TeamControllerTest#getTeamByCode_ARG_returns23PlayerStickers` |
| AC-24 | `TeamDetailComponentSpec#sedeSticker_rendersDistinctly` |
| AC-25 | `TeamsComponentSpec#confederationFilter_clearsGroupFilter` |

---

## Risks & Mitigations

- **Risk:** H2 `GENERATED ALWAYS AS` computed column not supported in V1 DDL → **Mitigation:** Remove computed column; store `goal_difference` as a regular INT and set it explicitly in V4 seed data.
- **Risk:** V3 seed script (1,107 INSERTs) is large and may hit H2 statement limits → **Mitigation:** Use multi-row `INSERT INTO stickers (...) VALUES (...), (...), (...)` batching.
- **Risk:** `crypto.randomUUID()` not available in older test environments → **Mitigation:** Guard with `typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuid-fallback`. Karma test environment supports it in modern Node.
- **Risk:** Knockout bracket visual layout is complex CSS → **Mitigation:** Use CSS Flexbox columns per phase; connect nodes with pseudo-element lines. Keep it simple for the workshop — pure layout, no SVG connectors needed.
- **Risk:** Flag asset files (48 SVGs) must be manually provided → **Mitigation:** Document the expected filenames; provide a single `placeholder.svg` as fallback in `FlagComponent` (`(error)` handler on `<img>`).

---

## Estimated Complexity

**High** — Full-stack MVP with 15+ Java classes, 4 Flyway migrations (including 1,107-row V3 seed), 8 Angular standalone components, 5 Angular services, and 25 acceptance criteria spanning both tiers. The scope is large but well-bounded; each step is independent and parallelisable between backend and frontend tracks.
