import { describe, it, expect } from 'vitest'
import { validateFilepath, validateFilepaths, isDuplicate } from '../../src/js/lib/photos.js'

describe('validateFilepath', () => {
  it('accepts valid jpg path', () => {
    expect(validateFilepath('/Users/joe/photo.jpg').valid).toBe(true)
  })
  it('accepts jpeg extension', () => {
    expect(validateFilepath('/photos/image.jpeg').valid).toBe(true)
  })
  it('accepts png extension', () => {
    expect(validateFilepath('/photos/image.png').valid).toBe(true)
  })
  it('accepts gif extension', () => {
    expect(validateFilepath('/photos/anim.gif').valid).toBe(true)
  })
  it('accepts webp extension', () => {
    expect(validateFilepath('/photos/modern.webp').valid).toBe(true)
  })
  it('accepts uppercase extension (case-insensitive)', () => {
    expect(validateFilepath('/photos/image.PNG').valid).toBe(true)
  })
  it('rejects empty string', () => {
    const result = validateFilepath('')
    expect(result.valid).toBe(false)
  })
  it('rejects whitespace-only string', () => {
    expect(validateFilepath('   ').valid).toBe(false)
  })
  it('rejects unsupported extension .bmp', () => {
    const result = validateFilepath('/photo.bmp')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/extension/i)
  })
  it('rejects unsupported extension .tiff', () => {
    expect(validateFilepath('/photo.tiff').valid).toBe(false)
  })
  it('rejects null input', () => {
    expect(validateFilepath(null).valid).toBe(false)
  })
  it('rejects undefined input', () => {
    expect(validateFilepath(undefined).valid).toBe(false)
  })
  it('rejects numeric input', () => {
    expect(validateFilepath(42).valid).toBe(false)
  })
  it('returns error string for invalid input', () => {
    expect(validateFilepath('/photo.bmp').error).toBeTruthy()
    expect(validateFilepath('').error).toBeTruthy()
  })
  it('returns null error for valid input', () => {
    expect(validateFilepath('/photo.jpg').error).toBeNull()
  })
})

describe('validateFilepaths', () => {
  it('splits into valid and invalid arrays', () => {
    const paths = ['/a.jpg', '/b.bmp', '/c.png']
    const { valid, invalid } = validateFilepaths(paths)
    expect(valid).toEqual(['/a.jpg', '/c.png'])
    expect(invalid).toHaveLength(1)
    expect(invalid[0].filepath).toBe('/b.bmp')
  })
  it('returns all valid when every path is acceptable', () => {
    const { valid, invalid } = validateFilepaths(['/a.jpg', '/b.jpeg'])
    expect(valid).toHaveLength(2)
    expect(invalid).toHaveLength(0)
  })
  it('returns all invalid when every path is bad', () => {
    const { valid, invalid } = validateFilepaths(['/a.bmp', '/b.tiff'])
    expect(valid).toHaveLength(0)
    expect(invalid).toHaveLength(2)
  })
  it('handles empty input array', () => {
    const { valid, invalid } = validateFilepaths([])
    expect(valid).toHaveLength(0)
    expect(invalid).toHaveLength(0)
  })
})

describe('isDuplicate', () => {
  const existing = [{ filepath: '/photos/a.jpg' }, { filepath: '/photos/b.png' }]

  it('returns true for an existing filepath', () => {
    expect(isDuplicate('/photos/a.jpg', existing)).toBe(true)
  })
  it('returns false for a new filepath', () => {
    expect(isDuplicate('/photos/c.png', existing)).toBe(false)
  })
  it('returns false for empty existing array', () => {
    expect(isDuplicate('/any.jpg', [])).toBe(false)
  })
  it('is case-sensitive', () => {
    expect(isDuplicate('/photos/A.jpg', existing)).toBe(false)
  })
})
