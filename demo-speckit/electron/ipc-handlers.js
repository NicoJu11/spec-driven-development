import { existsSync } from 'fs'
import path from 'path'
import { validateAlbum } from '../src/js/lib/albums.js'
import { validateFilepath } from '../src/js/lib/photos.js'
import { computeReorderFromIds } from '../src/js/lib/ordering.js'

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

function getExtension(filepath) {
  return path.extname(filepath).toLowerCase().replace('.', '')
}

function validateId(id) {
  return Number.isInteger(id) && id > 0
}

/**
 * Register all IPC handlers with the provided ipcMain and db instances.
 * @param {Electron.IpcMain} ipcMain
 * @param {import('better-sqlite3').Database} db
 * @param {{ dialog?: Electron.Dialog }} deps - injectable dependencies for testing
 */
export function registerHandlers(ipcMain, db, deps = {}) {
  const { dialog } = deps

  // ── albums:list ──────────────────────────────────────────────────────────
  ipcMain.handle('albums:list', () => {
    const albums = db.prepare(`
      SELECT a.*,
        p.thumbnail AS cover_thumbnail,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count
      FROM albums a
      LEFT JOIN photos p ON p.id = a.cover_photo_id
      ORDER BY a.display_order ASC
    `).all()
    return { albums }
  })

  // ── albums:create ─────────────────────────────────────────────────────────
  ipcMain.handle('albums:create', (_, args) => {
    const { name, album_date } = args ?? {}
    const validation = validateAlbum({ name, album_date })
    if (!validation.valid) return { success: false, error: validation.errors.join(', ') }

    const maxRow = db.prepare('SELECT MAX(display_order) AS m FROM albums').get()
    const nextOrder = (maxRow?.m ?? -1) + 1

    const stmt = db.prepare(
      'INSERT INTO albums (name, album_date, display_order) VALUES (?, ?, ?)'
    )
    const result = stmt.run(name.trim(), album_date, nextOrder)
    const album = db.prepare(`
      SELECT a.*, NULL AS cover_thumbnail, 0 AS photo_count
      FROM albums a WHERE a.id = ?
    `).get(result.lastInsertRowid)
    return { success: true, album }
  })

  // ── albums:rename ─────────────────────────────────────────────────────────
  ipcMain.handle('albums:rename', (_, args) => {
    const { id, name } = args ?? {}
    if (!validateId(id)) return { success: false, error: 'Invalid album ID' }
    const validation = validateAlbum({ name, album_date: '2000-01-01' })
    if (!validation.valid) return { success: false, error: validation.errors.join(', ') }

    db.prepare('UPDATE albums SET name = ? WHERE id = ?').run(name.trim(), id)
    const album = db.prepare(`
      SELECT a.*,
        p.thumbnail AS cover_thumbnail,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count
      FROM albums a
      LEFT JOIN photos p ON p.id = a.cover_photo_id
      WHERE a.id = ?
    `).get(id)
    if (!album) return { success: false, error: 'Album not found' }
    return { success: true, album }
  })

  // ── albums:delete ─────────────────────────────────────────────────────────
  ipcMain.handle('albums:delete', (_, args) => {
    const { id } = args ?? {}
    if (!validateId(id)) return { success: false, error: 'Invalid album ID' }
    db.prepare('DELETE FROM albums WHERE id = ?').run(id)
    return { success: true }
  })

  // ── albums:reorder ────────────────────────────────────────────────────────
  ipcMain.handle('albums:reorder', (_, args) => {
    const { orderedIds } = args ?? {}
    if (!Array.isArray(orderedIds))
      return { success: false, error: 'orderedIds must be an array' }
    if (!orderedIds.every(id => validateId(id)))
      return { success: false, error: 'All IDs must be positive integers' }

    const existingIds = db.prepare('SELECT id FROM albums').all().map(r => r.id)
    if (orderedIds.length !== existingIds.length)
      return { success: false, error: 'orderedIds length does not match album count' }

    const existingSet = new Set(existingIds)
    if (!orderedIds.every(id => existingSet.has(id)))
      return { success: false, error: 'orderedIds contains unknown album IDs' }

    const updates = computeReorderFromIds(orderedIds)
    const stmt = db.prepare('UPDATE albums SET display_order = ? WHERE id = ?')
    const reorder = db.transaction(() => {
      for (const { id, display_order } of updates) stmt.run(display_order, id)
    })
    reorder()
    return { success: true }
  })

  // ── photos:list ───────────────────────────────────────────────────────────
  ipcMain.handle('photos:list', (_, args) => {
    const { albumId } = args ?? {}
    if (!validateId(albumId)) return { photos: [] }
    const photos = db.prepare(
      'SELECT * FROM photos WHERE album_id = ? ORDER BY added_at ASC'
    ).all(albumId)
    return { photos }
  })

  // ── photos:import ─────────────────────────────────────────────────────────
  ipcMain.handle('photos:import', (_, args) => {
    const { albumId, photos: incoming } = args ?? {}
    if (!validateId(albumId))
      return { imported: [], skipped: [{ filepath: '', reason: 'Invalid album ID' }] }
    if (!Array.isArray(incoming)) return { imported: [], skipped: [] }

    const imported = []
    const skipped = []

    const insertPhoto = db.prepare(
      'INSERT OR IGNORE INTO photos (album_id, filepath, filename, thumbnail) VALUES (?, ?, ?, ?)'
    )
    const setCover = db.prepare(
      'UPDATE albums SET cover_photo_id = ? WHERE id = ? AND cover_photo_id IS NULL'
    )

    const doImport = db.transaction(() => {
      for (const photo of incoming) {
        const { filepath, filename, thumbnail } = photo ?? {}
        if (!filepath || !filename || !thumbnail) {
          skipped.push({ filepath: filepath ?? '', reason: 'Missing required fields' })
          continue
        }
        const ext = getExtension(filepath)
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          skipped.push({ filepath, reason: `Unsupported extension: .${ext}` })
          continue
        }
        if (!existsSync(filepath)) {
          skipped.push({ filepath, reason: 'File not found on filesystem' })
          continue
        }
        const fpValidation = validateFilepath(filepath)
        if (!fpValidation.valid) {
          skipped.push({ filepath, reason: fpValidation.error })
          continue
        }
        const result = insertPhoto.run(albumId, filepath, filename, thumbnail)
        if (result.changes === 0) {
          skipped.push({ filepath, reason: 'Duplicate — file already in this album' })
          continue
        }
        const row = db.prepare('SELECT * FROM photos WHERE id = ?').get(result.lastInsertRowid)
        imported.push(row)
        setCover.run(row.id, albumId)
      }
    })
    doImport()
    return { imported, skipped }
  })

  // ── photos:remove ─────────────────────────────────────────────────────────
  ipcMain.handle('photos:remove', (_, args) => {
    const { id } = args ?? {}
    if (!validateId(id)) return { success: false, error: 'Invalid photo ID' }

    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id)
    if (!photo) return { success: false, error: 'Photo not found' }

    db.prepare('DELETE FROM photos WHERE id = ?').run(id)

    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(photo.album_id)
    if (album?.cover_photo_id === id) {
      const nextPhoto = db.prepare(
        'SELECT id FROM photos WHERE album_id = ? ORDER BY added_at ASC LIMIT 1'
      ).get(photo.album_id)
      db.prepare('UPDATE albums SET cover_photo_id = ? WHERE id = ?')
        .run(nextPhoto?.id ?? null, photo.album_id)
    }
    return { success: true }
  })

  // ── dialog:open-photos ────────────────────────────────────────────────────
  ipcMain.handle('dialog:open-photos', async () => {
    if (!dialog) return { filepaths: null }
    const result = await dialog.showOpenDialog({
      title: 'Select Photos',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }],
    })
    return { filepaths: result.canceled ? null : result.filePaths }
  })
}
