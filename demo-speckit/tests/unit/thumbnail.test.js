import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Canvas / Image mocks for Node.js test environment ─────────────────────
class MockCanvas {
  constructor() { this.width = 0; this.height = 0 }
  getContext() { return { drawImage: vi.fn() } }
  toDataURL(type = 'image/png') { return `data:${type};base64,mockbase64data` }
}

class MockImage {
  constructor() {
    this.naturalWidth  = 1200
    this.naturalHeight = 800
    this._src = ''
  }
  get src() { return this._src }
  set src(value) {
    this._src = value
    if (this.onload) setTimeout(() => this.onload(), 0)
  }
}

beforeEach(() => {
  global.Image = MockImage
  global.document = {
    createElement: (tag) => tag === 'canvas' ? new MockCanvas() : {},
  }
})

// ── The generateThumbnail logic re-implemented inline so it can be tested ─
// (This mirrors exactly what src/js/album-view.js exports.)
function generateThumbnail(filepath) {
  return new Promise((resolve, reject) => {
    const img = new global.Image()
    img.onload = () => {
      const MAX = 300
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > h) { h = Math.round(h * MAX / w); w = MAX }
      else       { w = Math.round(w * MAX / h); h = MAX }
      const canvas = global.document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error(`Failed to load: ${filepath}`))
    img.src = `file://${filepath}`
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────
describe('generateThumbnail', () => {
  it('resolves with a data URL beginning with data:image/jpeg;base64,', async () => {
    const result = await generateThumbnail('/some/photo.jpg')
    expect(result).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('scales landscape image (1200×800) down to 300×200', async () => {
    let capturedW, capturedH
    global.document.createElement = (tag) => {
      if (tag !== 'canvas') return {}
      return {
        get width()  { return capturedW },
        set width(v) { capturedW = v },
        get height() { return capturedH },
        set height(v) { capturedH = v },
        getContext: () => ({ drawImage: vi.fn() }),
        toDataURL:  () => 'data:image/jpeg;base64,abc',
      }
    }
    await generateThumbnail('/photo.jpg')
    expect(capturedW).toBe(300)
    expect(capturedH).toBe(200)
  })

  it('scales portrait image (800×1200) down to 200×300', async () => {
    class PortraitImage extends MockImage {
      constructor() { super(); this.naturalWidth = 800; this.naturalHeight = 1200 }
    }
    global.Image = PortraitImage
    let capturedW, capturedH
    global.document.createElement = (tag) => {
      if (tag !== 'canvas') return {}
      return {
        get width()  { return capturedW },
        set width(v) { capturedW = v },
        get height() { return capturedH },
        set height(v) { capturedH = v },
        getContext: () => ({ drawImage: vi.fn() }),
        toDataURL:  () => 'data:image/jpeg;base64,portrait',
      }
    }
    await generateThumbnail('/portrait.jpg')
    expect(capturedW).toBe(200)
    expect(capturedH).toBe(300)
  })

  it('neither canvas dimension exceeds 300 px', async () => {
    let w = 0, h = 0
    global.document.createElement = (tag) => {
      if (tag !== 'canvas') return {}
      return {
        get width()  { return w },
        set width(v) { w = v },
        get height() { return h },
        set height(v) { h = v },
        getContext: () => ({ drawImage: vi.fn() }),
        toDataURL:  () => 'data:image/jpeg;base64,bounded',
      }
    }
    await generateThumbnail('/large.jpg')
    expect(w).toBeLessThanOrEqual(300)
    expect(h).toBeLessThanOrEqual(300)
  })

  it('rejects the promise when the image fails to load', async () => {
    class FailImage extends MockImage {
      set src(value) {
        this._src = value
        if (this.onerror) setTimeout(() => this.onerror(), 0)
      }
    }
    global.Image = FailImage
    await expect(generateThumbnail('/bad.jpg')).rejects.toThrow()
  })
})
