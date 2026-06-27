import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createDb } from '../../electron/db.js'

let db

beforeAll(() => {
  db = createDb(':memory:')
})

afterAll(() => {
  db.close()
})

describe('albums table schema', () => {
  it('has correct columns', () => {
    const cols = db.pragma('table_info(albums)').map(c => c.name)
    expect(cols).toContain('id')
    expect(cols).toContain('name')
    expect(cols).toContain('album_date')
    expect(cols).toContain('display_order')
    expect(cols).toContain('cover_photo_id')
    expect(cols).toContain('created_at')
  })
  it('enforces NOT NULL on name', () => {
    expect(() =>
      db.prepare('INSERT INTO albums (name, album_date, display_order) VALUES (NULL, "2026-01-01", 0)').run()
    ).toThrow()
  })
  it('rejects empty-string name (CHECK constraint)', () => {
    expect(() =>
      db.prepare('INSERT INTO albums (name, album_date, display_order) VALUES ("", "2026-01-01", 0)').run()
    ).toThrow()
  })
  it('rejects whitespace-only name (CHECK constraint)', () => {
    expect(() =>
      db.prepare('INSERT INTO albums (name, album_date, display_order) VALUES ("   ", "2026-01-01", 0)').run()
    ).toThrow()
  })
  it('rejects malformed album_date (GLOB check)', () => {
    expect(() =>
      db.prepare('INSERT INTO albums (name, album_date, display_order) VALUES ("Trip", "01-01-2026", 0)').run()
    ).toThrow()
  })
  it('inserts a valid album', () => {
    const r = db.prepare(
      'INSERT INTO albums (name, album_date, display_order) VALUES (?, ?, ?)'
    ).run('Vacation 2026', '2026-07-01', 0)
    expect(r.lastInsertRowid).toBeGreaterThan(0)
  })
})

describe('photos table schema', () => {
  let albumId

  beforeAll(() => {
    albumId = db.prepare(
      'INSERT INTO albums (name, album_date, display_order) VALUES (?, ?, ?)'
    ).run('Schema Test Album', '2026-01-01', 99).lastInsertRowid
  })

  it('has correct columns', () => {
    const cols = db.pragma('table_info(photos)').map(c => c.name)
    expect(cols).toContain('id')
    expect(cols).toContain('album_id')
    expect(cols).toContain('filepath')
    expect(cols).toContain('filename')
    expect(cols).toContain('thumbnail')
    expect(cols).toContain('added_at')
  })
  it('inserts a valid photo', () => {
    const r = db.prepare(
      'INSERT INTO photos (album_id, filepath, filename) VALUES (?, ?, ?)'
    ).run(albumId, '/photos/test.jpg', 'test.jpg')
    expect(r.lastInsertRowid).toBeGreaterThan(0)
  })
  it('enforces UNIQUE(album_id, filepath) — rejects duplicate', () => {
    expect(() =>
      db.prepare('INSERT INTO photos (album_id, filepath, filename) VALUES (?, ?, ?)').run(
        albumId, '/photos/test.jpg', 'test.jpg'
      )
    ).toThrow()
  })
  it('cascade-deletes photos when the parent album is deleted', () => {
    const tmpAlbumId = db.prepare(
      'INSERT INTO albums (name, album_date, display_order) VALUES (?, ?, ?)'
    ).run('Temp', '2026-02-01', 88).lastInsertRowid
    db.prepare('INSERT INTO photos (album_id, filepath, filename) VALUES (?, ?, ?)').run(
      tmpAlbumId, '/p/q.jpg', 'q.jpg'
    )
    db.prepare('DELETE FROM albums WHERE id = ?').run(tmpAlbumId)
    expect(db.prepare('SELECT * FROM photos WHERE album_id = ?').all(tmpAlbumId)).toHaveLength(0)
  })
  it('has idx_photos_album_id index', () => {
    const idxNames = db.pragma('index_list(photos)').map(i => i.name)
    expect(idxNames).toContain('idx_photos_album_id')
  })
  it('has idx_albums_display_order index on albums', () => {
    const idxNames = db.pragma('index_list(albums)').map(i => i.name)
    expect(idxNames).toContain('idx_albums_display_order')
  })
})
