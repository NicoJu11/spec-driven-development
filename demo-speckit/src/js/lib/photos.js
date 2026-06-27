const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

/**
 * Validate a single filepath for photo import.
 * Checks non-empty string and allowed extension only.
 * Filesystem existence is validated separately in the IPC handler.
 * @param {unknown} filepath
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateFilepath(filepath) {
  if (typeof filepath !== 'string' || filepath.trim().length === 0) {
    return { valid: false, error: 'Filepath must be a non-empty string' }
  }
  const ext = filepath.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Unsupported file extension: .${ext}` }
  }
  return { valid: true, error: null }
}

/**
 * Validate an array of filepaths, splitting into valid and invalid buckets.
 * @param {string[]} filepaths
 * @returns {{ valid: string[], invalid: { filepath: string, error: string }[] }}
 */
export function validateFilepaths(filepaths) {
  const valid = []
  const invalid = []
  for (const fp of filepaths) {
    const result = validateFilepath(fp)
    if (result.valid) {
      valid.push(fp)
    } else {
      invalid.push({ filepath: fp, error: result.error ?? 'Invalid filepath' })
    }
  }
  return { valid, invalid }
}

/**
 * Check if a filepath is already present in an existing collection.
 * @param {string} filepath
 * @param {Array<{ filepath: string }>} existingPhotos
 * @returns {boolean}
 */
export function isDuplicate(filepath, existingPhotos) {
  return existingPhotos.some(p => p.filepath === filepath)
}
