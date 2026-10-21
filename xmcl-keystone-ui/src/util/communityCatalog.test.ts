import { describe, expect, test } from 'vitest'
import { getCommunityUrl, safeCommunityUrl, isCommunitySource, matchesCompatibility, matchesCommunityText, type CommunityFilters } from './communityCatalog'
const filters: CommunityFilters = { query: '', version: '1.20.1', loaders: ['quilt'], sort: 'updated', page: 2 }
describe('Chinese community catalogue requests', () => {
  test('uses different verified Quilt filter identifiers for mods and packs', () => {
    const mod = new URL(getCommunityUrl('mcmod-mod', filters, 'quilt'))
    const pack = new URL(getCommunityUrl('mcmod-pack', filters, 'quilt'))
    expect(mod.searchParams.get('api')).toBe('11')
    expect(pack.searchParams.get('api')).toBe('3')
    expect(pack.searchParams.get('mcver')).toBe('1.20.1')
    expect(pack.searchParams.get('sort')).toBe('lastedittime')
    expect(pack.searchParams.get('page')).toBe('2')
  })
  test('searches the requested content type and encodes Chinese keywords', () => {
    const url = new URL(getCommunityUrl('mcmod-pack', { ...filters, query: '农业 & 科技' }))
    expect(url.hostname).toBe('search.mcmod.cn')
    expect(url.searchParams.get('filter')).toBe('2')
    expect(url.searchParams.get('key')).toBe('农业 & 科技')
  })
  test.each(['javascript:alert(1)', 'https://evil.example/modpack/12.html', '/class/edit/12', ''])('rejects untrusted project URLs %s', (raw) => {
    expect(safeCommunityUrl(raw, 'https://www.mcmod.cn')).toBe('')
  })
  test('normalizes genuine project and image addresses', () => {
    expect(safeCommunityUrl('/modpack/1418.html', 'https://www.mcmod.cn')).toBe('https://www.mcmod.cn/modpack/1418.html')
    expect(safeCommunityUrl('//i.mcmod.cn/cover.jpg', 'https://www.mcmod.cn', true)).toBe('https://i.mcmod.cn/cover.jpg')
    expect(isCommunitySource('__proto__')).toBe(false)
  })
  test('requires the requested game version and loader in the same compatibility group', () => {
    const item = { compatibility: [{ loader: 'forge', versions: ['1.20.1'] }, { loader: 'fabric', versions: ['1.21.1'] }] }
    expect(matchesCompatibility(item, '1.20.1', ['fabric'])).toBe(false)
    expect(matchesCompatibility(item, '1.20.1', ['forge'])).toBe(true)
    expect(matchesCompatibility({ compatibility: [] }, '1.20.1', [])).toBe(false)
  })
  test('matches exact text tokens instead of treating query values as regular expressions', () => {
    expect(matchesCommunityText('NeoForge 1.20.10', '1.20.1', ['forge'])).toBe(false)
    expect(matchesCommunityText('Forge 1.20.1', '1.20.1', ['forge'])).toBe(true)
    expect(matchesCommunityText('Forge 1.20.1', '.*', [])).toBe(false)
  })
})
