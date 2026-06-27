# Research: Photo Album Organizer

**Phase 0 output** | **Date**: 2026-06-26 | **Plan**: [plan.md](plan.md)

All NEEDS CLARIFICATION items from the Technical Context are resolved below.

---

## Decision 1: Desktop Runtime — Electron + Vite

**Decision**: Electron 30 as the desktop runtime; Vite 5 as the renderer build tool.

**Rationale**: The app requires local filesystem access (reading photo files) and a native SQLite database — capabilities unavailable in a plain browser context. Electron provides a Node.js main process alongside a Chromium renderer, enabling both. Vite is the user-specified build tool and pairs naturally with Electron's renderer process via a simple `vite.config.js`. The entire stack stays in JavaScript/HTML/CSS, consistent with the "vanilla JS" constraint.

**Alternatives considered**:
- *Tauri (Rust + Vite)*: Supports local SQLite, but introduces Rust as a second language, contradicting "vanilla JavaScript as much as possible".
- *Browser + local Node.js server*: Two processes to launch and coordinate; worse developer UX; no packaging story.
- *Browser + sql.js (WASM SQLite)*: Large WASM binary (~1 MB), in-renderer execution, no native performance. Heavier than `better-sqlite3`.

---

## Decision 2: SQLite Binding — better-sqlite3 (main process only)

**Decision**: `better-sqlite3` in the Electron main process. The renderer never touches SQLite directly.

**Rationale**: `better-sqlite3` is synchronous, the fastest SQLite binding for Node.js, and has zero extra dependencies. Running it exclusively in the main process keeps the renderer context clean and enforces the security boundary (no Node.js in renderer). For ≤ 500 albums × 500 photos, all queries complete in < 5 ms — synchronous access is not a bottleneck.

**Alternatives considered**:
- *`sqlite3` (async)*: More complex Promise/callback plumbing for no practical gain at this data scale.
- *`sql.js` (WASM in renderer)*: Violates the IPC boundary; renderer gains direct data access, undermining `contextIsolation`.

---

## Decision 3: Electron + Vite Integration — Manual (no electron-vite)

**Decision**: Standard `vite.config.js` for the renderer; separate `electron/main.cjs` entry point. No `electron-vite` package.

**Rationale**: `electron-vite` is an additional abstraction and dependency. Manual integration requires ~15 lines in `vite.config.js` (set `root`, `build.outDir`, `base: './'`) and a `package.json` `scripts` entry to launch Electron after the Vite build. Keeping it manual honours the "minimal libraries" constraint and keeps the build pipeline transparent.

**Alternatives considered**:
- *`electron-vite`*: Cleaner DX, but adds a dependency and wraps both configs in one abstraction — harder to understand and debug.
- *`electron-builder`*: Distribution-focused; overkill for development setup.

---

## Decision 4: Drag-and-Drop — HTML5 Native DnD API

**Decision**: Native HTML5 Drag and Drop API with vanilla JS event handlers (`dragstart`, `dragover`, `drop`, `dragend`).

**Rationale**: No library required. Supported natively in Chromium (Electron's renderer). The position-computation logic is isolated in `src/js/lib/ordering.js` as pure functions, making it independently testable without triggering DOM events. Visual feedback (ghost image, drop indicator) is achievable with CSS custom properties and minimal JS.

**Alternatives considered**:
- *SortableJS*: Excellent library, but an external dependency. HTML5 DnD is sufficient for a flat 1D list of album tiles.
- *interact.js*: Designed for 2D positioning; overkill for a linear list reorder.

---

## Decision 5: Photo Thumbnails — HTML Canvas API (renderer)

**Decision**: Generate thumbnails in the renderer using `<canvas>` (`drawImage` + `toDataURL`) at import time. Store the resulting base64 data URL in the `photos.thumbnail` column.

**Rationale**: No server-side processing, no native image library. Electron's renderer has full Canvas API support. Thumbnails are generated once on import and stored, so subsequent album opens read a pre-computed base64 string — no re-rendering cost. Target size: 300 × 300 px (max), preserving aspect ratio.

**Alternatives considered**:
- *`sharp` (Node.js native)*: Excellent performance, but an additional dependency with native binaries that must be rebuilt per Electron version.
- *`jimp` (pure JS)*: No native binaries, but significantly slower than Canvas for large images.
- *On-the-fly resize in renderer*: Avoids storage cost but adds CPU work on every album open. For 500 photos, pre-computation at import is the right trade-off.

---

## Decision 6: Testing — Vitest

**Decision**: Vitest 1 as the sole test runner for unit and integration tests.

**Rationale**: Vitest is Vite's native test companion — zero additional config for a Vite project. It runs in Node, allowing `src/js/lib/` pure-function tests without a browser or Electron context. For integration tests (`electron/ipc-handlers.js`), an in-memory `better-sqlite3` database is used. No Electron instance is required for tests.

**Alternatives considered**:
- *Jest*: Requires extra Babel or `ts-jest` config to handle ESM modules from Vite. More friction than Vitest for a Vite project.
- *Mocha + Chai*: Older ecosystem; no ESM-native support out of the box.

---

## Decision 7: Album Ordering Algorithm — Integer Position with Full Reindex

**Decision**: Each album row has a `display_order INTEGER` column. On every drag-drop reorder, the main process runs a single SQLite transaction that updates `display_order` for all albums based on the new sequence sent from the renderer (`orderedIds: number[]`).

**Rationale**: For ≤ 500 albums, a full reindex is O(n) with a constant factor < 1 ms in SQLite (single transaction, prepared statement). Simplest correct implementation — no risk of ordering collisions or precision issues.

**Alternatives considered**:
- *Fractional indexing*: Avoids reindexing all rows but requires floating-point arithmetic and periodic rebalancing. Meaningfully more complex for negligible practical benefit at ≤ 500 rows.
- *Linked list (prev/next IDs)*: Efficient updates but complex list-traversal queries. Not justified at this scale.

---

## Decision 8: Photo Source — Local Filesystem (overrides spec FR-010)

**Decision**: Photos are imported from the user's local filesystem via `electron.dialog.showOpenDialog`. No cloud integration. No OAuth.

**Rationale**: Plan arguments ("images are not uploaded anywhere") explicitly direct local-only storage, superseding the spec's cloud clarification. This eliminates the need for NFR-001 (OS keychain for OAuth tokens), NFR-002 (cloud unavailability handling), and NFR-003 (OS encryption APIs). The security model becomes: Electron `contextIsolation: true` + IPC validation + OS filesystem permissions on the SQLite database file.

**Spec requirements superseded**:
- FR-010 (cloud photo source) → replaced by local filesystem import via `dialog.showOpenDialog`
- NFR-001 (OAuth in OS keychain) → not applicable; no authentication needed
- NFR-002 (cloud graceful degradation) → not applicable; no network dependency
- NFR-003 (OS encryption at rest) → replaced by: database file stored in `app.getPath('userData')`, protected by OS user-account filesystem permissions; no additional encryption layer required for v1

---

## Decision 9: Security Model — Electron Context Isolation + IPC Validation

**Decision**: Enforce `contextIsolation: true` and `nodeIntegration: false` in the `BrowserWindow`. The renderer communicates with the main process exclusively through a typed `contextBridge` API defined in `electron/preload.cjs`. All IPC handler inputs are validated (type-checked, sanitised) before reaching the database.

**Rationale**: Standard Electron security best practice. Prevents renderer-side XSS from escalating to Node.js / filesystem access. Aligns with OWASP injection and privilege-escalation controls without requiring external security libraries.

**Validation rules for IPC inputs**:
- Album name: non-empty string, max 255 chars
- Album date: ISO 8601 format (`YYYY-MM-DD`)
- File paths: must be absolute, must pass `fs.existsSync`, extension must be in allowlist (`jpg`, `jpeg`, `png`, `gif`, `webp`)
- IDs: must be positive integers
- `orderedIds`: must be an array of integers, length must equal current album count

---

## Resolved NEEDS CLARIFICATION Items

| Item | Resolution |
|------|------------|
| Runtime for local SQLite + filesystem | Electron 30 |
| Photo source | Local filesystem via `dialog.showOpenDialog` |
| Cloud NFRs (NFR-001, NFR-002, NFR-003) | Superseded by local-first security model |
| Test framework | Vitest 1 |
| DnD implementation | HTML5 native DnD API |
| Thumbnail generation | HTML Canvas API, stored as base64 in SQLite |
| Ordering algorithm | Integer `display_order` + full reindex per transaction |
