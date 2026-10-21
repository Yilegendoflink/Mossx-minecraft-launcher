import { describe, expect, test } from 'vitest'
import { allStoreSources, selectedStoreSources, toggleStoreSource, interleaveStoreGroups } from './storeSources'
describe('unified source filtering', () => {
  test('all six sources default to selected', () => {
    expect(selectedStoreSources([])).toEqual(allStoreSources)
  })
  test.each(allStoreSources)('%s uses the same exclusion toggle and preserves other selections', (source) => {
    const omitted = toggleStoreSource([], source)
    expect(selectedStoreSources(omitted)).toEqual(allStoreSources.filter(s => s !== source))
    expect(toggleStoreSource(omitted, source)).toEqual([])
  })
  test('supports mixed native/community selections, none selected, and legacy single-community links', () => {
    expect(selectedStoreSources(['curseforge', 'ftb', 'mcmod-mod', 'mcmod-pack'])).toEqual(['modrinth', 'mcbbs'])
    expect(selectedStoreSources(allStoreSources)).toEqual([])
    expect(selectedStoreSources([], 'mcmod-pack')).toEqual(['mcmod-pack'])
    expect(selectedStoreSources(toggleStoreSource([], 'modrinth', 'mcmod-pack'))).toEqual(['modrinth', 'mcmod-pack'])
  })
  test('interleaves unequal provider pages without dropping items or fabricating sort metrics', () => {
    expect(interleaveStoreGroups([[1, 2, 3], [4], [5, 6]])).toEqual([1, 4, 5, 2, 6, 3])
    expect(interleaveStoreGroups([])).toEqual([])
  })
})
