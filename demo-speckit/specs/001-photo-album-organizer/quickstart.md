# Quickstart & Validation Guide: Photo Album Organizer

**Phase 1 output** | **Date**: 2026-06-26 | **Plan**: [plan.md](plan.md)

This guide describes how to set up, run, and manually validate that the feature works end-to-end. It is **not** an implementation guide — implementation details live in `tasks.md`. For data shapes see [data-model.md](data-model.md); for the IPC API see [contracts/ipc-api.md](contracts/ipc-api.md).

---

## Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | 20+ | `node --version` |
| npm | 9+ | `npm --version` |
| Operating system | Windows 10+, macOS 13+, or Linux (GNOME/KDE) | — |

---

## Setup

```bash
# Install all dependencies (Electron, Vite, better-sqlite3, Vitest)
npm install
```

`better-sqlite3` contains native bindings — it is automatically rebuilt for the installed Electron version by the `install` script (configured in `package.json` via `electron-rebuild` or the `postinstall` hook).

---

## Run in Development

```bash
npm run dev
```

This command:
1. Starts the Vite dev server for the renderer (`src/`).
2. Launches Electron, loading the renderer from the Vite dev server URL.

The app window opens. The SQLite database is created automatically on first launch at:
- **macOS**: `~/Library/Application Support/<AppName>/photoalbums.db`
- **Windows**: `%APPDATA%\<AppName>\photoalbums.db`
- **Linux**: `~/.config/<AppName>/photoalbums.db`

---

## Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests run in Node via Vitest — no Electron instance required. `src/js/lib/` unit tests and `electron/` integration tests (using in-memory SQLite) both execute in the same run.

---

## Validation Scenarios

Use these scenarios to verify the feature works end-to-end after implementation. Each scenario is independent and maps to a user story in the spec.

---

### Scenario 1 — Main Page Renders Albums in Date Order (US1 / P1)

**Precondition**: At least 3 albums exist with different `album_date` values.

**Steps**:
1. Launch the app (`npm run dev`).
2. Observe the main page.

**Expected outcomes**:
- All albums are visible as tiles.
- Albums appear in chronological order (earliest date first, or most-recent-first depending on sort direction choice in implementation).
- Each album tile shows: name, date, and a cover photo thumbnail (or placeholder if empty).
- Empty state message is shown if no albums exist at all.

**Maps to**: FR-001, FR-002, FR-007, FR-008, FR-014, SC-001

---

### Scenario 2 — Drag-and-Drop Reorder Persists (US2 / P2)

**Precondition**: At least 3 albums exist on the main page.

**Steps**:
1. Note the current order of album tiles (Album A, Album B, Album C).
2. Drag Album C to the first position.
3. Close the app.
4. Relaunch the app.

**Expected outcomes**:
- After the drag, Album C immediately appears first on the main page — no reload required.
- After relaunch, the custom order (C, A, B) is preserved.
- No album was dropped into another album (nesting attempt should be rejected).

**Maps to**: FR-003, FR-004, FR-005, SC-002, SC-003

---

### Scenario 3 — Album Photo Tile Grid (US3 / P3)

**Precondition**: An album with at least 6 photos exists.

**Steps**:
1. Click on the album tile from the main page.
2. Observe the album view.
3. Scroll if needed.

**Expected outcomes**:
- All photos are displayed as consistently sized tiles in a grid layout.
- Thumbnails load and render within 500 ms of opening the album (broadband).
- Scrolling is smooth with no visible frame drops.
- Clicking "Back" or navigating back returns to the main page with album positions unchanged.

**Maps to**: FR-006, SC-004, SC-008

---

### Scenario 4 — Create Album and Import Photos (US4 / P4)

**Steps**:
1. On the main page, trigger album creation (e.g., click "New Album").
2. Enter name: `"Summer 2026"`, date: `2026-07-15`. Confirm.
3. Open the new album.
4. Trigger photo import (e.g., click "Add Photos").
5. Select 3 image files from the OS file picker (JPEG or PNG).
6. Observe the album view.

**Expected outcomes**:
- The new album appears on the main page at the correct date position.
- After import, all 3 photos appear as tiles.
- The first photo becomes the album cover (visible on the tile on the main page).
- Attempting to import the same file a second time is silently skipped (no duplicate tile).

**Maps to**: FR-007, FR-008, FR-009, FR-010 (local), FR-013, SC-005

---

### Scenario 5 — Delete Photo and Album (US4 / P4)

**Precondition**: An album with at least 2 photos exists.

**Steps**:
1. Open the album.
2. Remove one photo.
3. Navigate back to the main page.
4. Delete the album.

**Expected outcomes**:
- After photo removal, the tile disappears from the album view. The remaining photo tile is unaffected.
- If the removed photo was the cover, the next photo becomes the new cover thumbnail on the main page.
- After album deletion, the album tile is gone from the main page. All other albums and their positions are unaffected.

**Maps to**: FR-011, FR-012, SC-006

---

### Scenario 6 — Nesting Rejection (FR-005 hard constraint)

**Steps**:
1. On the main page with multiple albums, drag one album tile and attempt to drop it directly on top of another album tile (not in the gap between tiles).

**Expected outcomes**:
- The drop is rejected — the dragged album returns to its original position.
- No album is nested inside another album.
- No error message is required; the visual snap-back is sufficient.

**Maps to**: FR-005, SC-006

---

### Scenario 7 — Scale Test (SC-001, SC-009)

> Run this only when testing performance targets.

**Setup**: Seed the database with 500 albums (use a setup script or manual insertion).

**Steps**:
1. Launch the app and measure time to interactive (main page fully rendered).
2. Open any album with 500 photos and measure thumbnail load time for visible viewport.

**Expected outcomes**:
- Main page interactive in ≤ 3 seconds (SC-001).
- Initial viewport thumbnails rendered in ≤ 500 ms (SC-008).
- No functional issues or data loss at maximum scale (SC-009).

---

## Key File References

| Artifact | Path |
|----------|------|
| SQLite schema | [data-model.md](data-model.md) |
| IPC channel definitions | [contracts/ipc-api.md](contracts/ipc-api.md) |
| Implementation tasks | `tasks.md` _(generated by `/speckit.tasks`)_ |
| Feature specification | [spec.md](spec.md) |
