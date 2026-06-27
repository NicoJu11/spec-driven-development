# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-album-organizer` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-photo-album-organizer/spec.md`

> **Note on spec divergence**: Plan arguments override the spec's cloud-storage clarification (FR-010, NFR-001, NFR-002, NFR-003). Photos are sourced from the local filesystem; no OAuth, no cloud upload. Security model relies on Electron context isolation, OS filesystem permissions, and SQLite file stored in the user's app-data directory.

## Summary

A local-first desktop photo organizer built as an Electron + Vite application. Users manage flat photo albums on a main page where albums are displayed in date order and freely rearranged via drag-and-drop. Photo files stay on the user's device; album metadata (names, dates, ordering) is persisted in a local SQLite database. Core logic is implemented as pure-function library modules, with all side effects (database, file I/O) isolated in the Electron main process behind a typed IPC API.

## Technical Context

**Language/Version**: JavaScript ES2022 — Node.js 20+ (main process), Chromium 124+ (renderer)

**Primary Dependencies**: Electron 30, Vite 5, better-sqlite3 9, Vitest 1

**Storage**: SQLite via `better-sqlite3` in Electron main process; database file stored in `app.getPath('userData')`

**Testing**: Vitest (zero-config Vite integration; runs lib units in Node environment without DOM)

**Target Platform**: Desktop — Windows 10+, macOS 13+, Linux (Electron cross-platform)

**Project Type**: Desktop application (Electron renderer + main process, Vite-bundled frontend)

**Performance Goals**: Main page interactive in ≤ 3 s with 500 albums; album thumbnail viewport load ≤ 500 ms; smooth scroll at 500 photos/album

**Constraints**: No network calls; no cloud upload; no OAuth; Electron `contextIsolation: true` enforced; renderer has no direct Node.js or SQLite access

**Scale/Scope**: Up to 500 albums; up to 500 photos per album; single-user local data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom of document.*

### I. Library-First — PASS

Core album/photo/ordering logic lives in `src/js/lib/` as standalone pure-function modules with zero UI or Electron dependencies. They are independently importable and testable by Vitest in a plain Node environment. The UI (`src/js/`) and Electron IPC handlers (`electron/ipc-handlers.js`) compose library functions rather than duplicating logic.

### II. Test-First — PASS

Vitest is the sole test runner. Test infrastructure (T002) is established before any library or UI implementation task. Every `src/js/lib/` module has a mandatory test file. TDD workflow is enforced: write failing test → confirm it fails for the right reason → implement → green.

### III. Functional-First — PASS

`src/js/lib/albums.js`, `src/js/lib/photos.js`, and `src/js/lib/ordering.js` are pure functions — they accept data arguments and return new data with no internal state or side effects. All side effects (SQLite queries, `fs` calls, IPC) are isolated at `electron/db.js` and `electron/ipc-handlers.js`. UI event handlers call lib functions and pass results to the IPC bridge (`src/js/api.js`).

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-album-organizer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ipc-api.md       # Phase 1 output — IPC channel contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/                          # Renderer process — bundled by Vite
├── index.html                # Main page (album grid)
├── album.html                # Album view (photo tile grid)
├── css/
│   ├── base.css              # CSS reset + design tokens (custom properties)
│   ├── main-page.css         # Album tile grid layout
│   └── album-view.css        # Photo tile grid layout
└── js/
    ├── lib/                  # Standalone library modules (Library-First principle)
    │   ├── albums.js         # Pure functions: album CRUD + validation
    │   ├── photos.js         # Pure functions: photo import/remove logic
    │   └── ordering.js       # Pure functions: drag-drop position computation
    ├── api.js                # Thin IPC bridge — wraps contextBridge calls
    ├── main-page.js          # Main page: renders album grid, wires drag-drop events
    └── album-view.js         # Album view: renders photo tile grid

electron/                     # Main process — runs in Node.js
├── main.cjs                  # Electron entry: creates BrowserWindow, registers IPC
├── preload.cjs               # contextBridge: exposes typed IPC API to renderer
├── db.js                     # SQLite connection singleton + schema migrations
└── ipc-handlers.js           # IPC handlers: compose lib functions + DB + fs

tests/
├── unit/
│   ├── albums.test.js        # Unit tests for src/js/lib/albums.js
│   ├── photos.test.js        # Unit tests for src/js/lib/photos.js
│   └── ordering.test.js      # Unit tests for src/js/lib/ordering.js
└── integration/
    ├── db.test.js             # SQLite schema + migration tests
    └── ipc-handlers.test.js  # IPC handler tests (in-memory SQLite)

vite.config.js
vitest.config.js
package.json
```

**Structure Decision**: Single-project layout. Vite bundles the renderer (`src/`); Electron's main process lives in `electron/`. Library modules in `src/js/lib/` have no DOM or Electron imports, allowing Vitest to run them directly in Node without a browser context. All system resource access (SQLite, `fs`, `dialog`) flows through the IPC bridge, enforcing `contextIsolation`.

## Constitution Check — Post-Design Re-evaluation

All three gates re-confirmed after Phase 1 design:

- **Library-First**: `src/js/lib/` modules defined with pure-function signatures in `data-model.md`. No coupling to `electron/` or DOM APIs.
- **Test-First**: `quickstart.md` validation scenarios map directly to test cases. Vitest runs lib units without Electron.
- **Functional-First**: SQLite access and `fs` calls are isolated in `electron/ipc-handlers.js`. IPC responses are plain data objects (no shared mutable state crosses the IPC boundary).

## Complexity Tracking

No constitution violations — no justification required.
