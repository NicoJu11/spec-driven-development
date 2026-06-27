import { describe, it, expect } from 'vitest'
import { computeReorder, computeReorderFromIds } from '../../src/js/lib/ordering.js'

const albums = [
  { id: 10, display_order: 0 },
  { id: 20, display_order: 1 },
  { id: 30, display_order: 2 },
]

describe('computeReorder', () => {
  it('moves item from index 0 to index 2', () => {
    const updates = computeReorder(albums, 0, 2)
    const map = Object.fromEntries(updates.map(u => [u.id, u.display_order]))
    expect(map[20]).toBe(0)
    expect(map[30]).toBe(1)
    expect(map[10]).toBe(2)
  })
  it('moves item from index 2 to index 0', () => {
    const updates = computeReorder(albums, 2, 0)
    const map = Object.fromEntries(updates.map(u => [u.id, u.display_order]))
    expect(map[30]).toBe(0)
    expect(map[10]).toBe(1)
    expect(map[20]).toBe(2)
  })
  it('no-op when fromIndex equals toIndex', () => {
    const updates = computeReorder(albums, 1, 1)
    const map = Object.fromEntries(updates.map(u => [u.id, u.display_order]))
    expect(map[10]).toBe(0)
    expect(map[20]).toBe(1)
    expect(map[30]).toBe(2)
  })
  it('does not mutate the original array', () => {
    computeReorder(albums, 0, 2)
    expect(albums[0].id).toBe(10)
  })
  it('returns objects with id and display_order properties', () => {
    const updates = computeReorder(albums, 0, 1)
    expect(updates).toHaveLength(3)
    expect(updates[0]).toHaveProperty('id')
    expect(updates[0]).toHaveProperty('display_order')
  })
  it('assigns contiguous 0-based display_order values', () => {
    const updates = computeReorder(albums, 0, 2)
    const orders = updates.map(u => u.display_order).sort((a, b) => a - b)
    expect(orders).toEqual([0, 1, 2])
  })
})

describe('computeReorderFromIds', () => {
  it('maps IDs to 0-based display_order', () => {
    expect(computeReorderFromIds([30, 10, 20])).toEqual([
      { id: 30, display_order: 0 },
      { id: 10, display_order: 1 },
      { id: 20, display_order: 2 },
    ])
  })
  it('handles empty array', () => {
    expect(computeReorderFromIds([])).toEqual([])
  })
  it('handles single-element array', () => {
    expect(computeReorderFromIds([42])).toEqual([{ id: 42, display_order: 0 }])
  })
})
