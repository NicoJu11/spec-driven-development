import Database from 'better-sqlite3'

/**
 * Create and initialise a SQLite database at the given path.
 * Pass ':memory:' for in-memory databases (used in tests).
 * @param {string} dbPath
 * @returns {import('better-sqlite3').Database}
 */
export function createDb(dbPath) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  initSchema(db)
  return db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL CHECK(length(trim(name)) > 0) CHECK(length(name) <= 255),
      album_date     TEXT    NOT NULL CHECK(album_date GLOB '????-??-??'),
      display_order  INTEGER NOT NULL DEFAULT 0,
      cover_photo_id INTEGER,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id    INTEGER NOT NULL,
      filepath    TEXT    NOT NULL,
      filename    TEXT    NOT NULL,
      thumbnail   TEXT,
      added_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (album_id, filepath),
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_photos_album_id      ON photos(album_id);
    CREATE INDEX IF NOT EXISTS idx_albums_display_order ON albums(display_order);
    CREATE INDEX IF NOT EXISTS idx_albums_album_date    ON albums(album_date);
  `)
}
