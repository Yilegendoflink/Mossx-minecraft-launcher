import { isCommunitySource, type CommunitySource } from './communityCatalog'
import type { StoreSource } from './storeSort'
export type UnifiedStoreSource = StoreSource | CommunitySource
export const allStoreSources: UnifiedStoreSource[] = ['modrinth', 'curseforge', 'ftb', 'mcmod-mod', 'mcmod-pack', 'mcbbs']
export function selectedStoreSources(omitted: string[], legacyCommunity = ''): UnifiedStoreSource[] {
  return isCommunitySource(legacyCommunity) ? [legacyCommunity] : allStoreSources.filter(s => !omitted.includes(s))
}
export function toggleStoreSource(omitted: string[], source: UnifiedStoreSource, legacyCommunity = '') {
  const selected = selectedStoreSources(omitted, legacyCommunity)
  return allStoreSources.filter(s => s === source ? selected.includes(s) : !selected.includes(s))
}
/** Provider rankings are unrelated; interleave them without inventing metrics. */
export function interleaveStoreGroups<T>(groups: T[][]): T[] {
  return Array.from({ length: Math.max(0, ...groups.map(g => g.length)) }, (_, i) => groups.flatMap(g => i < g.length ? [g[i]] : [])).flat()
}
