import { api } from './api.js'
import { sortByOrder } from './lib/albums.js'

let albums = []
let dragSourceIndex = null

// ── DOM refs ──────────────────────────────────────────────────────────────
const grid        = document.getElementById('album-grid')
const emptyState  = document.getElementById('empty-state')
const errorBanner = document.getElementById('error-banner')
const newAlbumForm  = document.getElementById('new-album-form')
const btnNewAlbum   = document.getElementById('btn-new-album')
const inputName     = document.getElementById('input-album-name')
const inputDate     = document.getElementById('input-album-date')
const btnConfirm    = document.getElementById('btn-album-confirm')
const btnCancel     = document.getElementById('btn-album-cancel')

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

// ── Grid rendering ────────────────────────────────────────────────────────
function renderGrid() {
  grid.innerHTML = ''
  if (albums.length === 0) {
    emptyState.classList.remove('hidden')
    return
  }
  emptyState.classList.add('hidden')
  albums.forEach((album, index) => grid.appendChild(createAlbumTile(album, index)))
}

function createAlbumTile(album, index) {
  const tile = document.createElement('div')
  tile.className = 'album-tile'
  tile.dataset.id = album.id
  tile.dataset.index = index
  tile.draggable = true
  tile.tabIndex = 0
  tile.setAttribute('role', 'button')
  tile.setAttribute('aria-label', `Album: ${escHtml(album.name)}`)

  const coverHtml = album.cover_thumbnail
    ? `<img src="${escHtml(album.cover_thumbnail)}" alt="Cover of ${escHtml(album.name)}" />`
    : `<span class="placeholder-icon" aria-hidden="true">🖼️</span>`

  tile.innerHTML = `
    <div class="album-tile-cover">${coverHtml}</div>
    <div class="album-tile-info">
      <div class="album-tile-name">${escHtml(album.name)}</div>
      <div class="album-tile-date">${escHtml(album.album_date)}</div>
      <div class="album-tile-count">${album.photo_count} photo${album.photo_count !== 1 ? 's' : ''}</div>
    </div>
    <div class="album-tile-actions">
      <button class="btn-secondary btn-rename" data-id="${album.id}" aria-label="Rename album">✏️</button>
      <button class="btn-danger btn-delete" data-id="${album.id}" aria-label="Delete album">🗑️</button>
    </div>
  `

  // Open album on click (but not on action buttons)
  const openAlbum = () => {
    sessionStorage.setItem('currentAlbumId', String(album.id))
    sessionStorage.setItem('currentAlbumName', album.name)
    window.location.href = 'album.html'
  }

  tile.addEventListener('click', e => {
    if (e.target.closest('.album-tile-actions')) return
    openAlbum()
  })
  tile.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAlbum() }
    if (e.key === 'Delete') handleDelete(album.id)
  })

  tile.querySelector('.btn-rename').addEventListener('click', e => {
    e.stopPropagation()
    handleRename(album.id, album.name)
  })
  tile.querySelector('.btn-delete').addEventListener('click', e => {
    e.stopPropagation()
    handleDelete(album.id)
  })

  // Drag-and-drop
  tile.addEventListener('dragstart', () => {
    dragSourceIndex = index
    tile.classList.add('dragging')
  })
  tile.addEventListener('dragend', () => {
    tile.classList.remove('dragging')
    document.querySelectorAll('.album-tile').forEach(t => t.classList.remove('drag-over'))
  })
  tile.addEventListener('dragover', e => {
    e.preventDefault()
    if (dragSourceIndex !== null && dragSourceIndex !== index) {
      e.dataTransfer.dropEffect = 'move'
      tile.classList.add('drag-over')
    }
  })
  tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'))
  tile.addEventListener('drop', async e => {
    e.preventDefault()
    tile.classList.remove('drag-over')
    if (dragSourceIndex === null || dragSourceIndex === index) return
    const reordered = [...albums]
    const [moved] = reordered.splice(dragSourceIndex, 1)
    reordered.splice(index, 0, moved)
    albums = reordered
    dragSourceIndex = null
    renderGrid()
    await api.albums.reorder({ orderedIds: reordered.map(a => a.id) })
  })

  return tile
}

// ── New album form ────────────────────────────────────────────────────────
btnNewAlbum.addEventListener('click', () => {
  newAlbumForm.classList.remove('hidden')
  inputName.focus()
})
btnCancel.addEventListener('click', () => {
  newAlbumForm.classList.add('hidden')
  inputName.value = ''
  inputDate.value = ''
})
btnConfirm.addEventListener('click', async () => {
  const name = inputName.value.trim()
  const album_date = inputDate.value
  if (!name || !album_date) { showError('Album name and date are required.'); return }
  const result = await api.albums.create({ name, album_date })
  if (!result.success) { showError(result.error); return }
  newAlbumForm.classList.add('hidden')
  inputName.value = ''
  inputDate.value = ''
  albums.push(result.album)
  renderGrid()
})

// ── Rename / Delete ───────────────────────────────────────────────────────
async function handleRename(id, currentName) {
  const newName = prompt('Rename album:', currentName)
  if (!newName || newName.trim() === currentName) return
  const result = await api.albums.rename({ id, name: newName.trim() })
  if (!result.success) { showError(result.error); return }
  albums = albums.map(a => a.id === id ? { ...a, name: newName.trim() } : a)
  renderGrid()
}

async function handleDelete(id) {
  if (!confirm('Delete this album and all its photos? This cannot be undone.')) return
  const result = await api.albums.delete({ id })
  if (!result.success) { showError(result.error); return }
  albums = albums.filter(a => a.id !== id)
  renderGrid()
}

// ── Boot ──────────────────────────────────────────────────────────────────
async function init() {
  const { albums: data } = await api.albums.list()
  albums = sortByOrder(data)
  renderGrid()
}

init()
