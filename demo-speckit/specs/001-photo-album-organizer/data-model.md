# Data Model: Photo Album Organizer

**Phase 1 output** | **Date**: 2026-06-26 | **Plan**: [plan.md](plan.md)

---

## SQLite Schema

```sql
-- Albums: one row per user-created photo album
CREATE TABLE albums (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL CHECK(length(trim(name)) > 0)
                                  CHECK(length(name) <= 255),
  album_date     TEXT    NOT NULL CHECK(album_date GLOB '????-??-??'),  -- YYYY-MM-DD
  display_order  INTEGER NOT NULL DEFAULT 0,   -- user-defined sort position (0-based)
  cover_photo_id INTEGER,                      -- NULL until first photo imported
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL
);

-- Photos: one row per imported image, always belongs to exactly one album
CREATE TABLE photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id    INTEGER NOT NULL,
  filepath    TEXT    NOT NULL,               -- absolute path on user's filesystem
  filename    TEXT    NOT NULL,
  thumbnail   TEXT,                           -- base64 data URL (300x300 max, Canvas-generated)
  added_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (album_id, filepath),                -- deduplication: same file cannot appear twice in one album
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Indexes for common query patterns
CREATE INDEX idx_photos_album_id       ON photos(album_id);
CREATE INDEX idx_albums_display_order  ON albums(display_order);
CREATE INDEX idx_albums_album_date     ON albums(album_date);
```

---

## Entities

### Album

Represents a named, user-created collection of photos with an event date and a position on the main page.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Stable identity; never reused |
| `name` | TEXT | NOT NULL, 1–255 chars | User-assigned album name |
| `album_date` | TEXT | NOT NULL, YYYY-MM-DD | Event date used for default chronological ordering |
| `display_order` | INTEGER | NOT NULL | User-customized position on main page (0 = first); unique by application invariant |
| `cover_photo_id` | INTEGER | FK → photos.id, nullable | First photo in album; NULL when album is empty; auto-updated |
| `created_at` | TEXT | NOT NULL | ISO 8601 creation timestamp |

**Relationships**:
- Has many `Photo` (one-to-many via `photos.album_id`; cascade delete)
- Has at most one cover `Photo` via `cover_photo_id`

**Flat hierarchy invariant**: No `parent_album_id` column exists. The schema structurally prevents nesting — a `Photo` has an `album_id`; an `Album` has no parent reference. This invariant cannot be violated through normal SQL operations.

---

### Photo

Represents a single imported image, belonging to exactly one album, displayed as a tile in the album view.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Stable identity |
| `album_id` | INTEGER | NOT NULL, FK → albums.id | Owning album; cascade delete removes photos when album is deleted |
| `filepath` | TEXT | NOT NULL | Absolute path to original file on user's filesystem |
| `filename` | TEXT | NOT NULL | Display name (basename of filepath) |
| `thumbnail` | TEXT | nullable | Base64 data URL (JPEG, 300×300 max, aspect-ratio-preserving) generated at import time |
| `added_at` | TEXT | NOT NULL | ISO 8601 import timestamp |

**Relationships**:
- Belongs to one `Album` via `album_id`
- May be referenced as `cover_photo_id` by its parent `Album`

**Deduplication rule**: `UNIQUE(album_id, filepath)` — the same file cannot appear twice in the same album. The same file can appear in different albums (no cross-album constraint).

---

### Main Page Layout (derived, not a table)

The ordered list of `Album` rows sorted by `display_order ASC`. This is a query result, not a stored entity. The application reconstructs it with:

```sql
SELECT * FROM albums ORDER BY display_order ASC;
```

When the user has not customized order, `display_order` is initialized to match insertion order. After any drag-drop, the full sequence is rewritten in a single transaction (see IPC `albums:reorder`).

---

## Validation Rules

| Entity | Field | Rule | Enforcement |
|--------|-------|------|-------------|
| Album | `name` | Non-empty string, 1–255 chars | SQLite CHECK + IPC input validation |
| Album | `album_date` | Valid ISO 8601 date (YYYY-MM-DD) | SQLite GLOB CHECK + IPC regex validation |
| Album | `display_order` | Unique across all albums | Application invariant (reorder transaction rewrites all) |
| Photo | `filepath` | Absolute path, file must exist at import time | IPC handler `fs.existsSync` check |
| Photo | `filepath` | Extension in allowlist: jpg, jpeg, png, gif, webp | IPC handler allowlist check |
| Photo | `album_id` | Must reference an existing album | SQLite FK |
| Photo | `(album_id, filepath)` | Unique — no duplicates within an album | SQLite UNIQUE constraint |

---

## State Transitions

### Album lifecycle

```
created (empty)
    │  first photo imported → cover_photo_id set
    ▼
has_photos
    │  all photos removed → cover_photo_id set to NULL
    ▼
empty (re-entered)
    │  album deleted
    ▼
deleted (row removed, cascade deletes all photos)
```

### Photo lifecycle

```
imported (filepath validated, thumbnail generated, row inserted)
    │
    ▼
active (visible in album tile grid)
    │  removed by user
    ▼
removed (row deleted; if was cover photo, album.cover_photo_id set to NULL)
```

---

## Library Module Signatures

These pure-function signatures define the `src/js/lib/` interface. Functions take plain data arguments and return plain data — no DB access, no side effects.

### `src/js/lib/albums.js`

```js
// Validate album creation input; returns { valid: boolean, errors: string[] }
validateAlbum({ name, album_date })

// Compute new display_order for a newly appended album given existing album list
appendOrder(albums)  // → number

// Return albums sorted by display_order
sortByOrder(albums)  // → Album[]

// Return albums sorted by album_date (default view, before any custom ordering)
sortByDate(albums)   // → Album[]
```

### `src/js/lib/photos.js`

```js
// Validate a file path for import (extension check, non-empty)
validateFilepath(filepath)  // → { valid: boolean, error: string | null }

// Validate an array of filepaths; returns { valid: string[], invalid: {filepath, error}[] }
validateFilepaths(filepaths)

// Determine if a filepath already exists in a photo list (deduplication check)
isDuplicate(filepath, existingPhotos)  // → boolean
```

### `src/js/lib/ordering.js`

```js
// Compute new display_order values after moving item at fromIndex to toIndex
// Returns array of { id, display_order } update objects
computeReorder(albums, fromIndex, toIndex)  // → { id: number, display_order: number }[]

// Given an array of album IDs in desired order, produce update objects
computeReorderFromIds(orderedIds)  // → { id: number, display_order: number }[]
```
