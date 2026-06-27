const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Validate album creation/update input.
 * @param {{ name: unknown, album_date: unknown }} input
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAlbum({ name, album_date }) {
  const errors = []
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Album name must be a non-empty string')
  } else if (name.length > 255) {
    errors.push('Album name must be 255 characters or fewer')
  }
  if (typeof album_date !== 'string' || !DATE_REGEX.test(album_date)) {
    errors.push('album_date must be a valid YYYY-MM-DD date string')
  }
  return { valid: errors.length === 0, errors }
}

/**
 * Compute the display_order value for a newly appended album.
 * @param {Array<{ display_order: number }>} albums
 * @returns {number}
 */
export function appendOrder(albums) {
  if (!albums.length) return 0
  return Math.max(...albums.map(a => a.display_order)) + 1
}

/**
 * Return a new array of albums sorted by display_order ascending.
 * Does not mutate the input.
 * @param {Array<{ display_order: number }>} albums
 * @returns {Array}
 */
export function sortByOrder(albums) {
  return [...albums].sort((a, b) => a.display_order - b.display_order)
}

/**
 * Return a new array of albums sorted by album_date descending (most recent first).
 * Does not mutate the input.
 * @param {Array<{ album_date: string }>} albums
 * @returns {Array}
 */
export function sortByDate(albums) {
  return [...albums].sort((a, b) => b.album_date.localeCompare(a.album_date))
}
