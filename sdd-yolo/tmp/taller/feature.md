# Feature: FIFA World Cup 2026 Digital Album — Full MVP

## Summary

Build the complete MVP of the Mundial Album 2026 application: a four-view Angular SPA backed by a Spring Boot REST API. The MVP covers (1) a catalogue of all 48 national teams with flag and full 23-player squad, (2) a 12-group standings view (Groups A–L), (3) a per-team digital sticker album with collection-progress tracking persisted in the backend via an anonymous session UUID, and (4) an interactive knockout bracket from the Round of 32 through the Final and the 3rd-place match, seeded with real 2026 results via Flyway.

---

## User Stories

- As a student, I want to browse all 48 teams so I can see every participating nation with its flag.
- As a student, I want to view a team's full 23-player squad so I can explore player information.
- As a student, I want to see the group-stage standings so I can understand which teams qualified for the knockout phase.
- As a student, I want to mark individual stickers as collected so I can track my album completion progress.
- As a student, I want my collection to be remembered across browser sessions so I don't lose my progress.
- As a student, I want to see the complete knockout bracket so I can follow the tournament from R32 to the Final.

---

## Functional Requirements

### FR-01: Team Catalogue — Backend
The API must expose all 48 teams with their FIFA 3-letter code, full name, group letter, confederation, and flag asset path. Teams must be filterable by group letter **or** by confederation via independent query parameters (not combinable in a single request).

**Endpoint:** `GET /api/v1/teams` (optional `?group=A` **or** `?confederation=UEFA`)  
**Response fields:** `id`, `code` (e.g. `ARG`), `name`, `groupLetter`, `confederation`, `flagPath`  
**Valid confederation values:** `UEFA`, `CONMEBOL`, `CONCACAF`, `CAF`, `AFC`, `OFC`  
**Validation:** Providing both `?group` and `?confederation` in the same request returns HTTP 400. An unrecognised confederation value returns HTTP 400.

### FR-02: Team Detail + Squad — Backend
The API must return a single team with its full list of stickers (players).

**Endpoint:** `GET /api/v1/teams/{code}`  
**Response fields:** team object + `stickers[]` each with `id`, `playerName`, `position` (GK / DEF / MID / FWD), `shirtNumber`, `imageUrl`

### FR-03: Sticker List — Backend
The API must return stickers with an optional team filter.

**Endpoint:** `GET /api/v1/stickers` (optional `?team=ARG`)  
**Response fields:** `id`, `teamCode`, `playerName`, `position`, `shirtNumber`, `imageUrl`

### FR-04: Group Standings — Backend
The API must return all 12 groups each containing their 4 teams and standings data. A per-group endpoint must also be available.

**Endpoints:**
- `GET /api/v1/groups` — all groups  
- `GET /api/v1/groups/{letter}/standings` — standings for one group (letter A–L)

**Standing row fields:** `teamCode`, `teamName`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points`

### FR-05: Sticker Collection — Backend
The API must allow an anonymous client to mark/unmark stickers as collected, scoped to a UUID session stored client-side. No authentication is required.

**Session mechanism:** The client generates a UUID on first visit (stored in `localStorage` as `sessionId`) and sends it as the request header `X-Session-Id: <uuid>` on every collection request. The backend treats this UUID as the collection owner.

**Endpoints:**
- `POST /api/v1/collection/{stickerId}` — mark sticker as collected (idempotent; returns 200 if already collected)
- `DELETE /api/v1/collection/{stickerId}` — remove sticker from collection
- `GET /api/v1/collection` — return list of collected sticker IDs for the current session

**Validation:** `stickerId` must reference an existing sticker (return 404 if not found). `X-Session-Id` header must be a valid UUID format (return 400 if malformed or absent).

### FR-06: Knockout Bracket — Backend
The API must expose the full bracket and per-phase results. Data is seeded with real 2026 results via Flyway.

**Endpoints:**
- `GET /api/v1/bracket` — all phases with matches  
- `GET /api/v1/bracket/{phase}` — matches for a specific phase

**Valid phases:** `R32`, `R16`, `QF`, `SF`, `FINAL`, `THIRD_PLACE`  
**Match fields:** `id`, `phase`, `homeTeamCode`, `homeTeamName`, `awayTeamCode`, `awayTeamName`, `homeScore`, `awayScore`, `matchDate`, `venue`, `winnnerCode`

### FR-07: Seed Data — Flyway Migrations
All reference data must be loaded via Flyway on application startup:

| Migration | Content |
|-----------|---------|
| `V1__create_tables.sql` | DDL for `teams`, `stickers`, `groups`, `matches`, `collection` |
| `V2__seed_teams.sql` | 48 FIFA 2026 teams with code, name, group letter, confederation, flag path |
| `V3__seed_stickers.sql` | 23 `PLAYER` stickers per team + 1 `SEDE` sticker for USA, MEX, CAN = **1,107 total**; `image_url` points to `/assets/stickers/{id}.jpg` placeholder |
| `V4__seed_matches.sql` | All group-stage matches and knockout matches (real 2026 results where available, TBD otherwise) |

### FR-08: Flag Assets — Frontend
Flag images must be stored as local SVG or PNG files under `frontend/src/assets/flags/{code}.svg` (e.g. `ARG.svg`). All 48 flag files must be present. The `flagPath` field returned by the API must match the frontend asset path convention.

### FR-09: Teams View — Frontend
A routable Angular view at `/teams` must display all 48 teams as cards. Each card shows the team flag, name, and group badge. A filter bar provides two independent filter sets: group letter (A–L) chips and confederation chips (`UEFA`, `CONMEBOL`, `CONCACAF`, `CAF`, `AFC`, `OFC`). Only one filter may be active at a time; selecting a chip in one set clears the other.

### FR-10: Team Detail / Sticker Album View — Frontend
A routable Angular view at `/teams/:code` must display the team detail (flag, name, group) and the full 23-sticker grid. Each sticker card shows the player name, position, shirt number, and image. Collected stickers display a visual "collected" badge; uncollected stickers are greyed out. Clicking a sticker toggles its collected state via the backend endpoint.

A progress bar shows the number of collected stickers out of the team's total sticker count (23 for non-host teams, 24 for USA, MEX, and CAN). The Sede sticker must render with a visually distinct style (e.g. gold border, host badge) to differentiate it from player stickers.

### FR-11: Groups View — Frontend
A routable Angular view at `/groups` must display all 12 groups (A–L) as Material cards, each containing a standings table (rank, flag, name, P, W, D, L, GF, GA, GD, Pts).

### FR-12: Knockout Bracket View — Frontend
A routable Angular view at `/bracket` must render the full knockout tree visually: R32 (16 matches) → R16 (8) → QF (4) → SF (2) → Final (1) plus the 3rd-place match as a separate branch. Each match node shows both team flags, team names, and scores (or "TBD" if not yet played). The layout must be horizontally scrollable on smaller screens.

### FR-13: Navigation
A top navigation bar (Angular Material toolbar) must link to: **Teams**, **Groups**, **Bracket**. The app title "Mundial 2026" is displayed on the left.

### FR-14: Error Handling — Backend
All unexpected errors must be caught by `GlobalExceptionHandler` and return:
```json
{ "code": "ERROR_CODE", "message": "Human-readable message", "timestamp": "ISO-8601" }
```
404 for unknown team code or sticker ID; 400 for invalid path/query parameters.

### FR-15: Confederation Filter — Backend
The `GET /api/v1/teams` endpoint must accept an optional `?confederation=` query parameter. The value must be one of the six valid confederation codes. If an unrecognised value is provided, the endpoint returns HTTP 400. If both `?group` and `?confederation` are provided simultaneously, the endpoint returns HTTP 400.

### FR-16: Sede Special Sticker — Backend & Frontend
The three FIFA 2026 host nations (USA, MEX, CAN) each receive one additional sticker of type `SEDE` in the database (seeded in V3). The `Sticker` entity and DTO include a `type` field with values `PLAYER` or `SEDE`. In the frontend album view, `SEDE` stickers are rendered with a visually distinct style (gold border + host badge icon) and appear first in the sticker grid before the player stickers.

---

## Acceptance Criteria

- [ ] AC-01: `GET /api/v1/teams` returns 48 teams; filtering `?group=A` returns exactly 4.
- [ ] AC-02: `GET /api/v1/teams/ARG` returns Argentina's data with exactly 23 stickers.
- [ ] AC-03: `GET /api/v1/groups` returns 12 group objects, each with 4 teams and standing rows.
- [ ] AC-04: `GET /api/v1/groups/A/standings` returns standings ordered by points descending, then goal difference.
- [ ] AC-05: `POST /api/v1/collection/1` with a valid `X-Session-Id` header stores the collection record; calling it again is idempotent (200, not 409).
- [ ] AC-06: `GET /api/v1/collection` with a session UUID returns only the sticker IDs collected by that session.
- [ ] AC-07: `DELETE /api/v1/collection/1` removes the sticker from the session's collection.
- [ ] AC-08: `GET /api/v1/bracket` returns all phases with at least the Final match populated with real scores.
- [ ] AC-09: `GET /api/v1/bracket/INVALID` returns HTTP 400 with the standard error JSON.
- [ ] AC-10: `/teams` view displays 48 team cards; filtering by group letter filters the displayed cards.
- [ ] AC-11: Clicking a team card navigates to `/teams/:code` showing the 23-sticker grid with progress bar.
- [ ] AC-12: Clicking a sticker toggles its collected state; the change is reflected immediately in the UI and persisted to the backend.
- [ ] AC-13: Refreshing the page on `/teams/:code` restores the same collected state (session UUID sent from localStorage).
- [ ] AC-14: `/groups` view displays all 12 group standings tables with correct column headers.
- [ ] AC-15: `/bracket` view displays the full knockout tree from R32 to Final, plus the 3rd-place match.
- [ ] AC-16: All 48 flag images resolve without a 404 in the browser.
- [ ] AC-17: Navigation bar links to Teams, Groups, and Bracket views from any route.
- [ ] AC-18: An unknown team code (`GET /api/v1/teams/ZZZ`) returns HTTP 404 with the standard error JSON.
- [ ] AC-19: `GET /api/v1/teams?confederation=UEFA` returns exactly 16 teams, all with `confederation: "UEFA"`.
- [ ] AC-20: `GET /api/v1/teams?confederation=INVALID` returns HTTP 400 with the standard error JSON.
- [ ] AC-21: `GET /api/v1/teams?group=A&confederation=UEFA` returns HTTP 400 (filters are not combinable).
- [ ] AC-22: `GET /api/v1/teams/USA` returns 24 stickers — 23 of type `PLAYER` and 1 of type `SEDE`.
- [ ] AC-23: `GET /api/v1/teams/ARG` still returns exactly 23 stickers, all of type `PLAYER` (Argentina is not a host).
- [ ] AC-24: The Sede sticker in the `/teams/USA` album view renders with a visually distinct style (gold border) and appears first in the grid.
- [ ] AC-25: `/teams` view shows confederation filter chips; selecting `CONMEBOL` shows only CONMEBOL teams and clears any active group filter.

---

## Technical Scope

### Affected Modules

**Backend (`backend-spring/`):**
- `com.joedayz.mundial.domain` — new entities: `Team`, `Sticker`, `Match`, `CollectionEntry`
- `com.joedayz.mundial.repository` — new Spring Data repositories for each entity
- `com.joedayz.mundial.service` — `TeamService`, `GroupService`, `BracketService`, `CollectionService`
- `com.joedayz.mundial.controller` — `TeamController`, `GroupController`, `BracketController`, `CollectionController`
- `com.joedayz.mundial.config` — `CorsConfig`
- `com.joedayz.mundial.exception` — `GlobalExceptionHandler`, `NotFoundException`, `BadRequestException`
- `src/main/resources/db/migration/` — V1–V4 Flyway scripts
- `src/main/resources/application.properties` — datasource, JPA, Flyway config

**Frontend (`frontend/`):**
- `src/app/core/models/` — `Team`, `Sticker`, `Group`, `Standing`, `Match`, `BracketPhase`
- `src/app/core/services/` — `TeamService`, `GroupService`, `BracketService`, `CollectionService`, `SessionService`
- `src/app/features/teams/` — `TeamsComponent`, `TeamDetailComponent`
- `src/app/features/groups/` — `GroupsComponent`
- `src/app/features/album/` — `AlbumComponent` (sticker grid inside team detail)
- `src/app/features/bracket/` — `BracketComponent`
- `src/app/shared/` — `FlagComponent`, `TeamCardComponent`, `BracketNodeComponent`, `StickerCardComponent`
- `src/app/app.routes.ts` — route definitions
- `src/assets/flags/` — 48 flag SVG/PNG files
- `src/assets/stickers/` — placeholder sticker images (or single placeholder used for all)

### New Components Required

**Backend entities:**
- `Team` — `id`, `code`, `name`, `groupLetter`, `confederation` (enum: UEFA/CONMEBOL/CONCACAF/CAF/AFC/OFC), `flagPath`
- `Sticker` — `id`, `teamCode`, `playerName`, `position` (enum: GK/DEF/MID/FWD), `shirtNumber`, `imageUrl`, `type` (enum: PLAYER/SEDE)
- `Match` — `id`, `phase` (enum), `homeTeamCode`, `awayTeamCode`, `homeScore`, `awayScore`, `matchDate`, `venue`
- `CollectionEntry` — `id`, `sessionId` (UUID), `stickerId`, `collectedAt`

**Backend DTOs (in controller layer):**
- `TeamDto` (includes `confederation`), `TeamDetailDto`, `StickerDto` (includes `type`), `GroupDto`, `StandingDto`, `MatchDto`, `BracketDto`

**Frontend Angular components:**
- `TeamsComponent` — grid of team cards with group filter
- `TeamDetailComponent` — team header + sticker album + progress bar
- `GroupsComponent` — 12 group cards each with standings table
- `BracketComponent` — visual knockout bracket tree
- `FlagComponent` — reusable `<img>` wrapper for flag asset
- `TeamCardComponent` — reusable card (flag + name + group badge)
- `StickerCardComponent` — player card with collected-toggle
- `BracketNodeComponent` — single match node in bracket tree

**Frontend services:**
- `SessionService` — generates/reads UUID from localStorage; provides `sessionId$`
- `TeamService` — wraps `GET /api/v1/teams` and `GET /api/v1/teams/:code`
- `GroupService` — wraps `GET /api/v1/groups` and `GET /api/v1/groups/:letter/standings`
- `BracketService` — wraps `GET /api/v1/bracket`
- `CollectionService` — wraps collection endpoints; sends `X-Session-Id` header; maintains local collected-set for optimistic UI

### Integration Points

- Flyway runs on application startup and populates all seed data automatically.
- CORS config must allow `http://localhost:4200`.
- Angular `HttpClient` must inject `X-Session-Id` into collection requests via `CollectionService` (not a global interceptor, to avoid sending it on non-collection calls).
- Flag asset paths returned by the API (`/assets/flags/ARG.svg`) must match the Angular static asset convention (`frontend/src/assets/flags/ARG.svg`).

---

## Non-Functional Requirements

- **Performance:** All API endpoints must respond within 500 ms under single-user dev load (H2 in-memory).
- **Data completeness:** All 48 teams, 1,107 stickers (1,104 player + 3 Sede), and bracket data must be present after a fresh application startup.
- **Idempotency:** `POST /api/v1/collection/{stickerId}` is idempotent — duplicate calls return 200, not 409.
- **Statelessness:** The backend is stateless with respect to identity; the session UUID is the only user identifier and lives entirely in the client.
- **No auth:** No Spring Security configuration is required for the MVP.
- **Accessibility:** Flags must have `alt` text with the team name. Sticker cards must have `aria-label`.

---

## Out of Scope

- User authentication, login, or accounts.
- Real-time score updates or WebSocket connections.
- Admin UI to edit match results.
- Multiple collection profiles per device.
- Sharing or social features.
- PWA / offline support.
- Quarkus backend variant.
- Mobile-native layout (responsive design is fine; dedicated mobile app is not in scope).
- Pagination on any list endpoint (all 48 teams and all stickers can be returned in one response for MVP scale).

---

## Open Questions

- **Flag file format:** SVG preferred for sharpness; confirm whether all 48 SVGs are available or whether PNGs are substituted for some flags.
- **Sticker placeholder images:** Will a single generic placeholder image (`/assets/stickers/placeholder.jpg`) be reused for all players, or will individual images be provided?
- **Standings computation:** Should standings be computed dynamically from the `matches` table, or stored as pre-computed rows in a `standings` table seeded by Flyway? (Recommendation: store pre-computed for MVP simplicity.)
- **3rd-place match display:** Should the 3rd-place match appear as a branch below the semi-finals or as a separate panel alongside the Final?
- **Sede sticker image:** Should the Sede sticker have a dedicated image asset (e.g. `/assets/stickers/sede_usa.jpg`) or reuse the flag image?
- **Confederation counts:** Confirm the exact team count per confederation for seed data validation (expected: UEFA 16, CONMEBOL 6, CONCACAF 6, CAF 9, AFC 8, OFC 1 = 46 + 2 inter-confederation playoff slots — clarify how playoff teams are classified).
