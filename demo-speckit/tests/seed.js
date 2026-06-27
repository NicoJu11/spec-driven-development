/**
 * Performance seed script — T046
 *
 * Seeds an in-memory SQLite database with 500 albums × 500 photos (250,000 rows)
 * then benchmarks the two key queries against SC-001 and SC-008 targets.
 *
 * Run:  node tests/seed.js
 */
import { createDb } from '../electron/db.js'

const db = createDb(':memory:')

// ── Seed 500 albums ───────────────────────────────────────────────────────
console.log('Seeding 500 albums…')
const insertAlbum = db.prepare(
  'INSERT INTO albums (name, album_date, display_order) VALUES (?, ?, ?)'
)
const albumIds = []
db.transaction(() => {
  for (let i = 0; i < 500; i++) {
    const year  = 2020 + Math.floor(i / 12)
    const month = String((i % 12) + 1).padStart(2, '0')
    const r = insertAlbum.run(`Album ${i + 1}`, `${year}-${month}-01`, i)
    albumIds.push(r.lastInsertRowid)
  }
})()
console.log(`  ✓ ${albumIds.length} albums inserted`)

// ── Seed 500 photos per album (250,000 total) ─────────────────────────────
console.log('Seeding 250,000 photos (500 × 500)…')
const insertPhoto = db.prepare(
  'INSERT INTO photos (album_id, filepath, filename, thumbnail) VALUES (?, ?, ?, ?)'
)
db.transaction(() => {
  for (const albumId of albumIds) {
    for (let j = 0; j < 500; j++) {
      insertPhoto.run(albumId, `/photos/album_${albumId}_photo_${j}.jpg`, `photo_${j}.jpg`, null)
    }
  }
})()
console.log('  ✓ Photos inserted')

// ── SC-001: albums:list (500 albums, complex JOIN + subquery) ──────────────
console.log('\nBenchmarking albums:list (500 albums with photo_count)…')
const t1 = performance.now()
db.prepare(`
  SELECT a.*,
    p.thumbnail AS cover_thumbnail,
    (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count
  FROM albums a
  LEFT JOIN photos p ON p.id = a.cover_photo_id
  ORDER BY a.display_order ASC
`).all()
const t2 = performance.now()
const listMs  = (t2 - t1).toFixed(2)
const sc001Ok = (t2 - t1) < 3000
console.log(`  albums:list:  ${listMs} ms  →  SC-001 (≤ 3000 ms): ${sc001Ok ? '✓ PASS' : '✗ FAIL'}`)

// ── SC-008: photos:list for one album (500 photos) ────────────────────────
console.log('\nBenchmarking photos:list (500 photos in one album)…')
const t3 = performance.now()
db.prepare('SELECT * FROM photos WHERE album_id = ? ORDER BY added_at ASC').all(albumIds[0])
const t4 = performance.now()
const photosMs = (t4 - t3).toFixed(2)
const sc008Ok  = (t4 - t3) < 150
console.log(`  photos:list:  ${photosMs} ms  →  SC-008 (≤ 150 ms): ${sc008Ok ? '✓ PASS' : '✗ FAIL'}`)

db.close()

const allPass = sc001Ok && sc008Ok
process.exit(allPass ? 0 : 1)
