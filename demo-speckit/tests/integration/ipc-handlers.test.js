import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createDb } from '../../electron/db.js'
import { registerHandlers } from '../../electron/ipc-handlers.js'

// ── Test harness: mock ipcMain ────────────────────────────────────────────
function createMockIpcMain() {
  const handlers = {}
  return {
    handle:  (channel, fn) => { handlers[channel] = fn },
    invoke:  (channel, args) => handlers[channel]?.({}, args),
  }
}

let db
let ipcMain
let invoke

beforeAll(() => {
  db = createDb(':memory:')
  ipcMain = createMockIpcMain()
  registerHandlers(ipcMain, db)   // no dialog needed for core CRUD tests
  invoke = (channel, args) => ipcMain.invoke(channel, args)
})

afterAll(() => db.close())

// ── albums:list ───────────────────────────────────────────────────────────
describe('albums:list', () => {
  it('returns an empty array when no albums exist', async () => {
    const { albums } = await invoke('albums:list')
    expect(albums).toBeInstanceOf(Array)
  })
})

// ── albums:create ─────────────────────────────────────────────────────────
describe('albums:create', () => {
  it('creates an album with valid input', async () => {
    const result = await invoke('albums:create', { name: 'Summer 2026', album_date: '2026-07-01' })
    expect(result.success).toBe(true)
    expect(result.album.name).toBe('Summer 2026')
    expect(result.album.album_date).toBe('2026-07-01')
    expect(result.album.id).toBeGreaterThan(0)
  })
  it('assigns ascending display_order for successive creates', async () => {
    const r1 = await invoke('albums:create', { name: 'A1', album_date: '2026-01-01' })
    const r2 = await invoke('albums:create', { name: 'A2', album_date: '2026-02-01' })
    expect(r2.album.display_order).toBeGreaterThan(r1.album.display_order)
  })
  it('rejects empty name', async () => {
    const result = await invoke('albums:create', { name: '', album_date: '2026-01-01' })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
  it('rejects invalid date format', async () => {
    const result = await invoke('albums:create', { name: 'Trip', album_date: 'not-a-date' })
    expect(result.success).toBe(false)
  })
  it('rejects missing args', async () => {
    const result = await invoke('albums:create', undefined)
    expect(result.success).toBe(false)
  })
})

// ── albums:rename ─────────────────────────────────────────────────────────
describe('albums:rename', () => {
  let albumId
  beforeEach(async () => {
    const r = await invoke('albums:create', { name: 'Original Name', album_date: '2026-03-01' })
    albumId = r.album.id
  })

  it('renames an album and returns the updated record', async () => {
    const result = await invoke('albums:rename', { id: albumId, name: 'Renamed' })
    expect(result.success).toBe(true)
    expect(result.album.name).toBe('Renamed')
  })
  it('rejects string ID', async () => {
    const result = await invoke('albums:rename', { id: 'notanid', name: 'X' })
    expect(result.success).toBe(false)
  })
  it('rejects empty name on rename', async () => {
    const result = await invoke('albums:rename', { id: albumId, name: '' })
    expect(result.success).toBe(false)
  })
})

// ── albums:delete ─────────────────────────────────────────────────────────
describe('albums:delete', () => {
  it('deletes an album and it no longer appears in list', async () => {
    const { album } = await invoke('albums:create', { name: 'ToDelete', album_date: '2026-04-01' })
    const result = await invoke('albums:delete', { id: album.id })
    expect(result.success).toBe(true)
    const { albums } = await invoke('albums:list')
    expect(albums.find(a => a.id === album.id)).toBeUndefined()
  })
  it('rejects invalid ID', async () => {
    const result = await invoke('albums:delete', { id: 'bad' })
    expect(result.success).toBe(false)
  })
})

// ── albums:reorder ────────────────────────────────────────────────────────
describe('albums:reorder', () => {
  it('reorders albums and persists the new order', async () => {
    const db2 = createDb(':memory:')
    const ipc2 = createMockIpcMain()
    registerHandlers(ipc2, db2)
    const inv2 = (ch, args) => ipc2.invoke(ch, args)

    const { album: a1 } = await inv2('albums:create', { name: 'F1', album_date: '2026-01-01' })
    const { album: a2 } = await inv2('albums:create', { name: 'F2', album_date: '2026-02-01' })
    const { album: a3 } = await inv2('albums:create', { name: 'F3', album_date: '2026-03-01' })

    const result = await inv2('albums:reorder', { orderedIds: [a3.id, a2.id, a1.id] })
    expect(result.success).toBe(true)

    const { albums } = await inv2('albums:list')
    expect(albums[0].id).toBe(a3.id)

    db2.close()
  })
  it('rejects orderedIds with wrong length', async () => {
    const { albums } = await invoke('albums:list')
    if (albums.length > 1) {
      const partial = albums.slice(0, albums.length - 1).map(a => a.id)
      const result = await invoke('albums:reorder', { orderedIds: partial })
      expect(result.success).toBe(false)
    }
  })
  it('rejects non-array orderedIds', async () => {
    const result = await invoke('albums:reorder', { orderedIds: 'bad' })
    expect(result.success).toBe(false)
  })
})

// ── photos:list ───────────────────────────────────────────────────────────
describe('photos:list', () => {
  it('returns empty array for album with no photos', async () => {
    const { album } = await invoke('albums:create', { name: 'EmptyAlbum', album_date: '2026-05-01' })
    const { photos } = await invoke('photos:list', { albumId: album.id })
    expect(photos).toEqual([])
  })
  it('returns empty array for unknown albumId', async () => {
    const { photos } = await invoke('photos:list', { albumId: 99999 })
    expect(photos).toEqual([])
  })
  it('returns empty array for invalid albumId', async () => {
    const { photos } = await invoke('photos:list', { albumId: 'bad' })
    expect(photos).toEqual([])
  })
})

// ── photos:import ─────────────────────────────────────────────────────────
describe('photos:import', () => {
  it('skips a file that does not exist on the filesystem', async () => {
    const { album } = await invoke('albums:create', { name: 'ImportTest', album_date: '2026-06-01' })
    const result = await invoke('photos:import', {
      albumId: album.id,
      photos: [{
        filepath: '/nonexistent/missing_photo.jpg',
        filename: 'missing_photo.jpg',
        thumbnail: 'data:image/jpeg;base64,abc',
      }],
    })
    expect(result.skipped).toHaveLength(1)
    expect(result.imported).toHaveLength(0)
  })
  it('skips a file with unsupported extension', async () => {
    const { album } = await invoke('albums:create', { name: 'ImportExt', album_date: '2026-06-02' })
    const result = await invoke('photos:import', {
      albumId: album.id,
      photos: [{ filepath: '/photo.bmp', filename: 'photo.bmp', thumbnail: 'data:image/bmp;base64,abc' }],
    })
    expect(result.skipped[0].reason).toMatch(/extension/i)
  })
  it('rejects invalid albumId', async () => {
    const result = await invoke('photos:import', { albumId: 'bad', photos: [] })
    expect(result.skipped).toHaveLength(1)
    expect(result.imported).toHaveLength(0)
  })
})

// ── photos:remove ─────────────────────────────────────────────────────────
describe('photos:remove', () => {
  it('returns error for invalid ID type', async () => {
    const result = await invoke('photos:remove', { id: 'bad' })
    expect(result.success).toBe(false)
  })
  it('returns error for non-existent photo ID', async () => {
    const result = await invoke('photos:remove', { id: 99999 })
    expect(result.success).toBe(false)
  })
})
