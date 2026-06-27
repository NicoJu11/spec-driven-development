---
description: "Task list for Photo Album Organizer — Electron + Vite + better-sqlite3"
---

# Tasks: Photo Album Organizer

**Input**: Design documents from `specs/001-photo-album-organizer/`

**Prerequisites**: [plan.md](plan.md) ✅ · [spec.md](spec.md) ✅ · [research.md](research.md) ✅ · [data-model.md](data-model.md) ✅ · [contracts/ipc-api.md](contracts/ipc-api.md) ✅ · [quickstart.md](quickstart.md) ✅

**Tests**: Included — constitution mandates TDD (Test-First, NON-NEGOTIABLE). Write every test task before its paired implementation task. Confirm it fails before implementing.

**Stack**: Electron 30 · Vite 5 · better-sqlite3 9 · Vitest 1 · Vanilla HTML/CSS/JS

---

## Format: `[ID] [P?] [Story?] Description — file/path`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label (US1–US4) for story-phase tasks only
- Exact file paths included in every description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the repository, install dependencies, configure build and test tooling.

- [X] T001 Create project directory structure per plan.md (`src/js/lib/`, `src/css/`, `electron/`, `tests/unit/`, `tests/integration/`)
- [X] T002 Initialize `package.json` with Electron 30, Vite 5, better-sqlite3 9, Vitest 1, electron-rebuild; add `"postinstall": "electron-rebuild -f -w better-sqlite3"` script; run `npm install` to install dependencies and rebuild `better-sqlite3` native bindings for the installed Electron version
- [X] T003 [P] Configure Vite renderer build — set `root: 'src'`, `base: './'`, `build.outDir: '../dist'` in `vite.config.js`
- [X] T004 [P] Configure Vitest with Node test environment, include `tests/**/*.test.js` in `vitest.config.js`
- [X] T005 [P] Add `npm run dev` (Vite dev server + Electron), `npm test`, `npm run build` scripts to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story depends on — SQLite, Electron process setup, IPC bridge, HTML shells, base styles.

**⚠️ CRITICAL**: No user story work may begin until this phase is complete.

- [X] T006 Implement `electron/db.js` — open SQLite connection to `app.getPath('userData')/photoalbums.db`, create `albums` and `photos` tables with all indexes and constraints from `data-model.md`
- [X] T006a Create `electron/ipc-handlers.js` stub — export a `registerHandlers(ipcMain, db)` function with an empty body; `electron/main.cjs` (T007) requires this file at startup and will crash if it does not exist before T016 adds real handlers
- [X] T007 Implement `electron/main.cjs` — create `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`; load Vite renderer URL; register IPC handlers module
- [X] T008 Implement `electron/preload.cjs` — expose all 8 IPC channels (`albums.list`, `albums.create`, `albums.rename`, `albums.delete`, `albums.reorder`, `photos.list`, `photos.import`, `photos.remove`, `dialog.openPhotos`) on `window.api` via `contextBridge`
- [X] T009 Implement `src/js/api.js` — thin Promise wrapper over every `window.api.*` call matching the types in `contracts/ipc-api.md`
- [X] T010 [P] Create `src/index.html` — album grid container `<div id="album-grid">`, empty-state `<div id="empty-state">`, new-album button stub
- [X] T011 [P] Create `src/album.html` — photo tile grid container `<div id="photo-grid">`, back-navigation button, import-photos button stub
- [X] T012 [P] Create `src/css/base.css` — CSS reset, custom properties (design tokens: spacing, colours, tile sizes, border-radius)

**Checkpoint**: Foundation complete — all four user story phases may now begin.

---

## Phase 3: User Story 1 — Browse Albums on Main Page (Priority: P1) 🎯 MVP

**Goal**: Main page displays all albums sorted by date as visual tiles, each with a cover thumbnail or placeholder. Empty state shown when no albums exist.

**Independent Test**: Launch with pre-seeded albums → all tiles visible in date order with correct cover previews. See quickstart.md Scenario 1.

### Tests for User Story 1 ⚠️ Write FIRST — confirm they FAIL before T015/T016/T017

- [X] T013 [P] [US1] Write failing unit tests for `albums.js` — `validateAlbum`, `appendOrder`, `sortByOrder`, `sortByDate` in `tests/unit/albums.test.js`
- [X] T014 [P] [US1] Write failing integration tests for `albums` table schema — columns, constraints, indexes, FK behaviour in `tests/integration/db.test.js`

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement `src/js/lib/albums.js` — pure functions: `validateAlbum({ name, album_date })`, `appendOrder(albums)`, `sortByOrder(albums)`, `sortByDate(albums)` per signatures in `data-model.md`
- [X] T016 [US1] Implement `albums:list` handler in `electron/ipc-handlers.js` — query all albums with `cover_thumbnail` and `photo_count`, return sorted by `display_order ASC`
- [X] T017 [US1] Implement `src/js/main-page.js` — call `api.albums.list()`, render album tiles (name, date, thumbnail or placeholder), handle empty state, wire tile click to open `album.html`
- [X] T018 [P] [US1] Style album tile grid in `src/css/main-page.css` — CSS grid layout, tile dimensions, cover image fit, placeholder graphic, empty-state message

**Checkpoint**: User Story 1 fully functional and independently testable (quickstart.md Scenario 1 passes).

---

## Phase 4: User Story 2 — Reorganize Albums via Drag-and-Drop (Priority: P2)

**Goal**: Albums on the main page can be dragged to new positions using the HTML5 DnD API. New order persists to SQLite and survives app restarts. Dropping onto another album is rejected.

**Independent Test**: Drag Album C to first position → close app → reopen → Album C remains first. See quickstart.md Scenario 2.

### Tests for User Story 2 ⚠️ Write FIRST — confirm they FAIL before T021/T022/T023

- [X] T019 [P] [US2] Write failing unit tests for `ordering.js` — `computeReorder(albums, fromIndex, toIndex)`, `computeReorderFromIds(orderedIds)` in `tests/unit/ordering.test.js`
- [X] T020 [P] [US2] Write failing integration test for `albums:reorder` IPC handler — full reindex transaction, ID mismatch rejection in `tests/integration/ipc-handlers.test.js`

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement `src/js/lib/ordering.js` — pure functions: `computeReorder(albums, fromIndex, toIndex)` and `computeReorderFromIds(orderedIds)` returning `{ id, display_order }[]` update arrays
- [X] T022 [US2] Implement `albums:reorder` handler in `electron/ipc-handlers.js` — validate `orderedIds` length equals album count and contains all existing IDs; update all `display_order` values in a single SQLite transaction
- [X] T023 [US2] Add HTML5 DnD event handlers to `src/js/main-page.js` — `dragstart`, `dragover`, `drop`, `dragend`; compute new order via `ordering.computeReorderFromIds`, call `api.albums.reorder()`; reject drop when target is an album tile (nesting prevention, FR-005)
- [X] T024 [P] [US2] Add drag-drop CSS to `src/css/main-page.css` — dragging tile opacity, drop-zone gap indicator, no-drop cursor when hovering over an album tile

**Checkpoint**: User Story 2 fully functional and independently testable (quickstart.md Scenarios 2 and 6 pass).

---

## Phase 5: User Story 3 — View Photos Inside an Album (Priority: P3)

**Goal**: Clicking an album opens the album view showing all photos as a consistent tile grid. Scrolling is smooth. Back navigation returns to the main page.

**Independent Test**: Open album with 6+ photos → all tiles visible at uniform size → scroll works → back returns to main page. See quickstart.md Scenario 3.

### Tests for User Story 3 ⚠️ Write FIRST — confirm they FAIL before T027/T028/T029

- [X] T025 [P] [US3] Write failing unit tests for `photos.js` — `validateFilepath(filepath)`, `validateFilepaths(filepaths)`, `isDuplicate(filepath, existingPhotos)` in `tests/unit/photos.test.js`
- [X] T026 [P] [US3] Write failing integration test for `photos:list` IPC handler — returns photos for album sorted by `added_at ASC`, returns empty array for unknown album in `tests/integration/ipc-handlers.test.js`

### Implementation for User Story 3

- [X] T027 [P] [US3] Implement `src/js/lib/photos.js` — pure functions: `validateFilepath`, `validateFilepaths`, `isDuplicate` per signatures in `data-model.md`
- [X] T028 [US3] Implement `photos:list` handler in `electron/ipc-handlers.js` — query photos by `album_id` ordered by `added_at ASC`
- [X] T029 [US3] Implement `src/js/album-view.js` — receive `albumId` from navigation, call `api.photos.list({ albumId })`, render photo tiles from `thumbnail` base64 data URLs, wire back button to return to `index.html`
- [X] T030 [P] [US3] Style photo tile grid in `src/css/album-view.css` — CSS grid, uniform tile size (300×300), object-fit cover, back-button layout

**Checkpoint**: User Story 3 fully functional and independently testable (quickstart.md Scenario 3 passes).

---

## Phase 6: User Story 4 — Create and Manage Albums (Priority: P4)

**Goal**: Users can create albums, rename and delete them, and import or remove photos. Canvas thumbnail is generated on import. Cover photo auto-updates.

**Independent Test**: Create album → import 3 photos → verify tiles and cover → delete one photo → verify cover updates → delete album → verify removed from main page. See quickstart.md Scenarios 4 and 5.

### Tests for User Story 4 ⚠️ Write FIRST — confirm they FAIL before T033–T042

- [X] T031 [P] [US4] Write failing integration tests for `albums:create`, `albums:rename`, `albums:delete` IPC handlers — validation errors, cascade delete, display_order append in `tests/integration/ipc-handlers.test.js`
- [X] T032 [P] [US4] Write failing integration tests for `photos:import` (validation, dedup, cover auto-set), `photos:remove` (cover auto-update), `dialog:open-photos` in `tests/integration/ipc-handlers.test.js`

### Implementation for User Story 4

- [X] T033 [US4] Implement `albums:create` handler in `electron/ipc-handlers.js` — validate name and date, compute `appendOrder`, insert row, return new `Album` object
- [X] T034 [US4] Implement `albums:rename` handler in `electron/ipc-handlers.js` — validate name, update row, return updated `Album`
- [X] T035 [US4] Implement `albums:delete` handler in `electron/ipc-handlers.js` — delete album row (cascade removes photos via FK `ON DELETE CASCADE`)
- [X] T036 [US4] Implement `dialog:open-photos` handler in `electron/ipc-handlers.js` — call `dialog.showOpenDialog` with image extension filter, return `{ filepaths }` or `{ filepaths: null }` on cancel
- [X] T037 [US4] Implement `photos:import` handler in `electron/ipc-handlers.js` — validate each filepath (existence, extension allowlist), check `UNIQUE(album_id, filepath)`, insert rows, set `cover_photo_id` if album was empty; return `{ imported, skipped }`
- [X] T038 [US4] Implement `photos:remove` handler in `electron/ipc-handlers.js` — delete photo row; if it was the cover photo, update `cover_photo_id` to next photo by `added_at` or `NULL` if album is now empty
- [X] T039a [P] [US4] Write failing unit test for `generateThumbnail` — mock `<img>` and `<canvas>` browser APIs in the Vitest Node environment; assert output string begins with `data:image/jpeg;base64,`; assert aspect ratio is preserved for a non-square input; assert neither canvas dimension exceeds 300 px — in `tests/unit/thumbnail.test.js`
- [X] T039 [US4] Add Canvas thumbnail generator to `src/js/album-view.js` — `generateThumbnail(filepath) → Promise<base64String>` using `<img>` + `<canvas>` (max 300×300, aspect-ratio-preserving, output `image/jpeg`, quality 0.85); called before `api.photos.import()`
- [X] T040 [US4] Add album creation UI to `src/js/main-page.js` — inline form with name (text input) and date (date input) fields, confirm and cancel actions; on success call `api.albums.create()` and re-render tile grid
- [X] T041 [US4] Add album rename and delete UI to `src/js/main-page.js` — context menu or action buttons on each album tile; call `api.albums.rename()` / `api.albums.delete()` and update tile grid accordingly
- [X] T042 [US4] Add photo import and remove UI to `src/js/album-view.js` — import button calls `api.dialog.openPhotos()`, generates thumbnails via `generateThumbnail`, calls `api.photos.import()`; remove button on each photo tile calls `api.photos.remove()` and updates grid

**Checkpoint**: User Story 4 fully functional and independently testable (quickstart.md Scenarios 4 and 5 pass).

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, error feedback, accessibility, performance verification.

- [X] T043 [P] Add IPC input validation to all handlers in `electron/ipc-handlers.js` — type-check every field, reject unknown keys, apply allowlists (extensions, string lengths, integer IDs) per security rules in `contracts/ipc-api.md`
- [X] T044 [P] Add empty-album-view state to `src/js/album-view.js` and `src/css/album-view.css` — when `photos:list` returns an empty array, render a placeholder message and icon ("No photos yet — click Import to add photos") instead of an empty grid
- [X] T045 [P] Add error feedback for user-facing failures in `src/js/main-page.js` and `src/js/album-view.js` — inline error messages for invalid album name, unsupported file type, duplicate import
- [X] T046 [P] Add performance seed script at `tests/seed.js` — inserts 500 albums and 500 photos into an in-memory DB; verify `albums:list` response time and `photos:list` response time meet SC-001 and SC-008 targets
- [X] T047 [P] Add keyboard accessibility to album tiles in `src/js/main-page.js` — `tabindex="0"`, `Enter`/`Space` to open album, `Delete` to trigger delete confirmation

---

## Dependencies

Story completion order:

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)
        ├── Phase 3 (US1 — Browse Albums)   ← MVP delivery point
        │     ├── Phase 4 (US2 — Drag-Drop)
        │     └── Phase 5 (US3 — View Photos)
        │           └── Phase 6 (US4 — Album Management)
        │                 └── Final Phase (Polish)
        └── [US2 and US3 may proceed in parallel after US1]
```

| Phase | Blocked by |
|-------|-----------|
| Foundational | Setup complete |
| US1 (P1) | Foundational complete |
| US2 (P2) | US1 complete — needs main page to wire drag-drop |
| US3 (P3) | US1 complete — needs main page tile click navigation |
| US4 (P4) | US1 + US3 complete — needs main page (album UI) + album view (photo UI) |
| Polish | US4 complete |

---

## Parallel Execution Examples

**Within Phase 1**: T003, T004, T005 can run simultaneously (different config files).

**Within Foundational**: T010, T011, T012 can run simultaneously after T006–T009.

**Within US1**: T013 and T014 are parallel (different test files). T015 is parallel with T013/T014 (TDD: write tests, then implement). T016 depends on T015 (lib must exist). T017 depends on T016 (handler must exist). T018 is parallel with T017 (CSS, not JS logic).

**US2 and US3 in parallel**: Once US1 is complete, a developer can begin T019–T024 (US2) while another begins T025–T030 (US3), since they modify different files (`main-page.js` DnD additions vs `album-view.js` + `photos.js`).

**Within US4**: T031 and T032 are parallel (different test groups). T033–T038 are parallel to each other (separate IPC handlers, same file — split into separate functions). T039 is parallel with T033–T038 (different file: `album-view.js`). T040, T041, T042 are sequential (same file `main-page.js`/`album-view.js`).

---

## Implementation Strategy

**MVP scope** — deliver US1 first (T001–T018). This produces a working main page with album tiles in date order. It is demonstrable and validates the full Electron + SQLite + Vite + IPC stack end-to-end.

**Increment 2** — US2 (T019–T024) + US3 (T025–T030) in parallel. Delivers drag-drop reordering and photo browsing.

**Increment 3** — US4 (T031–T042). Full album and photo CRUD, completing the organizer feature.

**Final** — Polish (T043–T047). Hardens security, improves UX, verifies performance targets.

Each increment is independently demonstrable using the corresponding validation scenarios in [quickstart.md](quickstart.md).
