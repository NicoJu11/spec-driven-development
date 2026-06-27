/**
 * Compute new display_order values after moving an item from fromIndex to toIndex.
 * Does not mutate the input array.
 * @param {Array<{ id: number }>} albums - current array sorted by display_order
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {{ id: number, display_order: number }[]}
 */
export function computeReorder(albums, fromIndex, toIndex) {
  const reordered = [...albums]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)
  return reordered.map((a, i) => ({ id: a.id, display_order: i }))
}

/**
 * Compute display_order update objects from an ordered list of album IDs.
 * The first ID gets display_order 0, and so on.
 * @param {number[]} orderedIds
 * @returns {{ id: number, display_order: number }[]}
 */
export function computeReorderFromIds(orderedIds) {
  return orderedIds.map((id, index) => ({ id, display_order: index }))
}
