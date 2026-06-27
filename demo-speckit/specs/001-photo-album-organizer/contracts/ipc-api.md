# IPC API Contract: Photo Album Organizer

**Phase 1 output** | **Date**: 2026-06-26 | **Plan**: [../plan.md](../plan.md)

This document defines the complete contract between the Electron renderer process (vanilla JS in `src/js/`) and the Electron main process (Node.js in `electron/`). All communication flows through the `contextBridge` defined in `electron/preload.cjs`.

The renderer calls `window.api.<method>(args)` — each method sends an IPC message and returns a `Promise`. The main process handles it in `electron/ipc-handlers.js`.

---

## Shared Types

```ts
type Album = {
  id:             number        // positive integer, stable identity
  name:           string        // 1–255 chars
  album_date:     string        // YYYY-MM-DD
  display_order:  number        // 0-based position on main page
  cover_photo_id: number | null // null when album is empty
  cover_thumbnail: string | null // base64 data URL or null
  photo_count:    number        // total photos in album
  created_at:     string        // ISO 8601 datetime
}

type Photo = {
  id:         number  // positive integer, stable identity
  album_id:   number
  filepath:   string  // absolute path on user's filesystem
  filename:   string  // basename of filepath
  thumbnail:  string  // base64 data URL (300×300 max, JPEG)
  added_at:   string  // ISO 8601 datetime
}

type SuccessResponse = {
  success: true
}

type ErrorResponse = {
  success: false
  error:   string    // human-readable error description
}
```

---

## Channels

### `albums:list`

Returns all albums ordered by `display_order ASC`, with `cover_thumbnail` and `photo_count` included.

**Request**: _(no arguments)_

**Response**:
```ts
{ albums: Album[] }
```

**Errors**: None expected. Returns empty array if no albums exist.

---

### `albums:create`

Creates a new album appended to the end of the current `display_order` sequence.

**Request**:
```ts
{ name: string, album_date: string }
```

**Validation**:
- `name`: non-empty string, max 255 chars
- `album_date`: matches `YYYY-MM-DD` regex

**Response (success)**:
```ts
{ success: true, album: Album }
```

**Response (error)**:
```ts
{ success: false, error: string }
```

---

### `albums:rename`

Updates the name of an existing album.

**Request**:
```ts
{ id: number, name: string }
```

**Validation**:
- `id`: positive integer, must match an existing album
- `name`: non-empty string, max 255 chars

**Response (success)**:
```ts
{ success: true, album: Album }
```

**Response (error)**:
```ts
{ success: false, error: string }
```

---

### `albums:delete`

Deletes an album and all its associated photos (cascade).

**Request**:
```ts
{ id: number }
```

**Validation**:
- `id`: positive integer, must match an existing album

**Response (success)**:
```ts
{ success: true }
```

**Response (error)**:
```ts
{ success: false, error: string }
```

---

### `albums:reorder`

Persists a new `display_order` sequence for all albums. The array must contain all current album IDs — partial reorders are rejected.

**Request**:
```ts
{ orderedIds: number[] }
```

**Validation**:
- `orderedIds`: array of positive integers
- Length must equal the current total number of albums
- Must contain exactly the same IDs as current albums (no extras, no missing)

**Response (success)**:
```ts
{ success: true }
```

**Response (error)**:
```ts
{ success: false, error: string }
```

---

### `photos:list`

Returns all photos for a given album, ordered by `added_at ASC`.

**Request**:
```ts
{ albumId: number }
```

**Validation**:
- `albumId`: positive integer, must match an existing album

**Response**:
```ts
{ photos: Photo[] }
```

**Errors**: Returns empty array if album has no photos.

---

### `photos:import`

Imports one or more photo files into an album. For each valid file: validates extension, checks for duplicates, generates a 300×300 thumbnail via the Canvas API in the renderer _(thumbnails are generated before calling this channel and passed in as base64 strings)_, and inserts the row. The first photo imported into an empty album automatically becomes the cover.

**Request**:
```ts
{
  albumId:   number,
  photos: {
    filepath:  string,   // absolute path, pre-validated by dialog
    filename:  string,
    thumbnail: string    // base64 data URL generated in renderer
  }[]
}
```

**Validation** (per photo):
- `filepath`: absolute path, `fs.existsSync` must be true, extension in `['jpg','jpeg','png','gif','webp']`
- `filename`: non-empty string
- `thumbnail`: non-empty string starting with `data:image/`
- `(albumId, filepath)` must not already exist (deduplication)

**Response**:
```ts
{
  imported: Photo[],             // successfully imported rows
  skipped:  { filepath: string, reason: string }[]  // duplicates or invalid files
}
```

---

### `photos:remove`

Removes a single photo from its album. If the removed photo was the album's cover, `cover_photo_id` is updated to the next photo in the album (by `added_at`), or set to `NULL` if the album becomes empty.

**Request**:
```ts
{ id: number }
```

**Validation**:
- `id`: positive integer, must match an existing photo

**Response (success)**:
```ts
{ success: true }
```

**Response (error)**:
```ts
{ success: false, error: string }
```

---

### `dialog:open-photos`

Opens the OS-native file picker filtered to supported image formats. Returns selected file paths, or `null` if the user cancelled.

**Request**: _(no arguments)_

**Response**:
```ts
{ filepaths: string[] | null }
```

**Behaviour**: Uses `dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','gif','webp'] }] })`.

---

## contextBridge Exposure (`electron/preload.cjs`)

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  albums: {
    list:    ()      => ipcRenderer.invoke('albums:list'),
    create:  (args)  => ipcRenderer.invoke('albums:create',  args),
    rename:  (args)  => ipcRenderer.invoke('albums:rename',  args),
    delete:  (args)  => ipcRenderer.invoke('albums:delete',  args),
    reorder: (args)  => ipcRenderer.invoke('albums:reorder', args),
  },
  photos: {
    list:    (args)  => ipcRenderer.invoke('photos:list',    args),
    import:  (args)  => ipcRenderer.invoke('photos:import',  args),
    remove:  (args)  => ipcRenderer.invoke('photos:remove',  args),
  },
  dialog: {
    openPhotos: ()   => ipcRenderer.invoke('dialog:open-photos'),
  },
})
```

The renderer accesses all functionality via `window.api.*`. No Node.js modules are exposed directly.

---

## Security Notes

- `contextIsolation: true` and `nodeIntegration: false` MUST be set on `BrowserWindow`.
- All IPC handler inputs are validated before reaching the database (see Validation rules per channel above).
- File paths received from the renderer are re-validated in the main process (`fs.existsSync`, extension allowlist) — the renderer is not trusted.
- `ipcRenderer.invoke` / `ipcMain.handle` pattern is used (request-response); `ipcRenderer.send` (fire-and-forget) is not used in this API.
