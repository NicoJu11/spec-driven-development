import { api } from './api.js'

const albumId   = parseInt(sessionStorage.getItem('currentAlbumId') ?? '', 10)
const albumName = sessionStorage.getItem('currentAlbumName') ?? 'Album'

// ── DOM refs ──────────────────────────────────────────────────────────────
const albumTitle     = document.getElementById('album-title')
const photoGrid      = document.getElementById('photo-grid')
const emptyAlbumState = document.getElementById('empty-album-state')
const btnBack        = document.getElementById('btn-back')
const btnImport      = document.getElementById('btn-import')
const errorBanner    = document.getElementById('error-banner')

albumTitle.textContent = albumName

// ── Helpers ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function showError(msg, durationMs = 4000) {
  errorBanner.textContent = msg
  errorBanner.classList.remove('hidden')
  setTimeout(() => errorBanner.classList.add('hidden'), durationMs)
}

// ── Thumbnail generation ──────────────────────────────────────────────────
/**
 * Generate a base64 JPEG thumbnail (max 300 × 300, aspect-ratio preserved)
 * from a local file path using the Canvas API.
 * @param {string} filepath - absolute path on the local filesystem
 * @returns {Promise<string>} data URL (data:image/jpeg;base64,…)
 */
export function generateThumbnail(filepath) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 300
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > h) { h = Math.round(h * MAX / w); w = MAX }
      else       { w = Math.round(w * MAX / h); h = MAX }
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${filepath}`))
    img.src = `file://${filepath}`
  })
}

// ── Rendering ─────────────────────────────────────────────────────────────
function renderPhotos(photos) {
  photoGrid.innerHTML = ''
  if (photos.length === 0) {
    emptyAlbumState.classList.remove('hidden')
    return
  }
  emptyAlbumState.classList.add('hidden')
  photos.forEach(photo => photoGrid.appendChild(createPhotoTile(photo)))
}

function createPhotoTile(photo) {
  const tile = document.createElement('div')
  tile.className = 'photo-tile'
  tile.innerHTML = `
    <img src="${escHtml(photo.thumbnail)}" alt="${escHtml(photo.filename)}" loading="lazy" />
    <button class="photo-tile-remove" aria-label="Remove photo" title="Remove ${escHtml(photo.filename)}">✕</button>
  `
  tile.querySelector('.photo-tile-remove').addEventListener('click', async () => {
    if (!confirm(`Remove "${photo.filename}" from this album?`)) return
    const result = await api.photos.remove({ id: photo.id })
    if (!result.success) { showError(result.error); return }
    tile.remove()
    if (photoGrid.children.length === 0) emptyAlbumState.classList.remove('hidden')
  })
  return tile
}

// ── Import ────────────────────────────────────────────────────────────────
btnImport.addEventListener('click', async () => {
  const { filepaths } = await api.dialog.openPhotos()
  if (!filepaths || filepaths.length === 0) return

  const photosToImport = []
  for (const filepath of filepaths) {
    try {
      const thumbnail = await generateThumbnail(filepath)
      const filename  = filepath.split(/[\\/]/).pop() ?? filepath
      photosToImport.push({ filepath, filename, thumbnail })
    } catch {
      showError(`Could not generate thumbnail for: ${filepath.split(/[\\/]/).pop()}`)
    }
  }

  if (photosToImport.length === 0) return

  const result = await api.photos.import({ albumId, photos: photosToImport })
  if (result.skipped.length > 0) {
    showError(`${result.skipped.length} file(s) skipped: ${result.skipped[0].reason}`)
  }
  if (result.imported.length > 0) {
    const { photos } = await api.photos.list({ albumId })
    renderPhotos(photos)
  }
})

// ── Navigation ────────────────────────────────────────────────────────────
btnBack.addEventListener('click', () => { window.location.href = 'index.html' })

// ── Boot ──────────────────────────────────────────────────────────────────
async function loadPhotos() {
  if (!albumId || isNaN(albumId)) { window.location.href = 'index.html'; return }
  const { photos } = await api.photos.list({ albumId })
  renderPhotos(photos)
}

loadPhotos()
