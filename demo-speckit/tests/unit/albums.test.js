import { describe, it, expect } from 'vitest'
import {
  validateAlbum,
  appendOrder,
  sortByOrder,
  sortByDate,
} from '../../src/js/lib/albums.js'

describe('validateAlbum', () => {
  it('returns valid for correct input', () => {
    const result = validateAlbum({ name: 'Vacation', album_date: '2026-07-01' })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
  it('fails on empty name', () => {
    expect(validateAlbum({ name: '', album_date: '2026-07-01' }).valid).toBe(false)
  })
  it('fails on whitespace-only name', () => {
    expect(validateAlbum({ name: '   ', album_date: '2026-07-01' }).valid).toBe(false)
  })
  it('fails on name exceeding 255 characters', () => {
    expect(validateAlbum({ name: 'a'.repeat(256), album_date: '2026-07-01' }).valid).toBe(false)
  })
  it('fails on invalid date format', () => {
    const result = validateAlbum({ name: 'Trip', album_date: '07-01-2026' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/date/)
  })
  it('fails on missing date', () => {
    expect(validateAlbum({ name: 'Trip', album_date: undefined }).valid).toBe(false)
  })
  it('fails on non-string name', () => {
    expect(validateAlbum({ name: 42, album_date: '2026-01-01' }).valid).toBe(false)
  })
  it('includes descriptive error message', () => {
    const result = validateAlbum({ name: '', album_date: '2026-01-01' })
    expect(result.errors[0]).toBeTruthy()
  })
})

describe('appendOrder', () => {
  it('returns 0 for empty album list', () => {
    expect(appendOrder([])).toBe(0)
  })
  it('returns max display_order + 1', () => {
    const albums = [{ display_order: 2 }, { display_order: 0 }, { display_order: 5 }]
    expect(appendOrder(albums)).toBe(6)
  })
  it('works when all orders are 0', () => {
    expect(appendOrder([{ display_order: 0 }])).toBe(1)
  })
})

describe('sortByOrder', () => {
  it('sorts albums by display_order ascending', () => {
    const albums = [
      { id: 1, display_order: 2 },
      { id: 2, display_order: 0 },
      { id: 3, display_order: 1 },
    ]
    expect(sortByOrder(albums).map(a => a.id)).toEqual([2, 3, 1])
  })
  it('does not mutate the original array', () => {
    const albums = [{ id: 1, display_order: 1 }, { id: 2, display_order: 0 }]
    sortByOrder(albums)
    expect(albums[0].id).toBe(1)
  })
  it('handles single-element array', () => {
    expect(sortByOrder([{ id: 9, display_order: 0 }])).toHaveLength(1)
  })
})

describe('sortByDate', () => {
  it('sorts albums by album_date descending (most recent first)', () => {
    const albums = [
      { id: 1, album_date: '2024-03-01' },
      { id: 2, album_date: '2026-01-15' },
      { id: 3, album_date: '2025-06-20' },
    ]
    expect(sortByDate(albums).map(a => a.id)).toEqual([2, 3, 1])
  })
  it('does not mutate the original array', () => {
    const albums = [{ id: 1, album_date: '2026-01-01' }, { id: 2, album_date: '2024-01-01' }]
    sortByDate(albums)
    expect(albums[0].id).toBe(1)
  })
  it('handles albums with the same date', () => {
    const albums = [{ id: 1, album_date: '2026-01-01' }, { id: 2, album_date: '2026-01-01' }]
    expect(sortByDate(albums)).toHaveLength(2)
  })
})
