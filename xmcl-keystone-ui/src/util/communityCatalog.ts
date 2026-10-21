export type CommunitySource = 'mcmod-mod' | 'mcmod-pack' | 'mcbbs'
export interface CommunityProject {
  id: string
  title: string
  description: string
  url: string
  image: string
  author: string
  tags?: string[]
  kind: 'mod' | 'modpack'
  compatibility: { loader: string; versions: string[] }[]
}
export interface CommunityPage { items: CommunityProject[]; pages: number }
export interface CommunityFilters { query: string; version: string; loaders: string[]; sort: string; page: number }

const origins = { 'mcmod-mod': 'https://www.mcmod.cn', 'mcmod-pack': 'https://www.mcmod.cn', mcbbs: 'https://www.mcbbs.app' }
export const communityNames = { 'mcmod-mod': 'MC百科 · 模组', 'mcmod-pack': 'MC百科 · 整合包', mcbbs: 'MCBBS 2nd' }
export function isCommunitySource(value: string): value is CommunitySource { return Object.hasOwn(origins, value) }
export function safeCommunityUrl(raw: string, base: string, image = false) {
  if (!raw.trim()) return ''
  try {
    const url = new URL(raw, base)
    if (url.protocol !== 'https:') return ''
    if (image) return ['www.mcmod.cn', 'i.mcmod.cn', 'www.mcbbs.app'].includes(url.hostname) ? url.href : ''
    return url.origin === new URL(base).origin && /^(\/(class|modpack)\/\d+\.html|\/resources\/[^?]+\.[0-9]+\/?$)/.test(url.pathname) ? url.href : ''
  } catch { return '' }
}
const text = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
const cleanDescription = (value: string) => value.replace(/\[\/?(?:h[1-6]|mark|ban|img|url|b|i|u|color|size|media|style)(?:[:=][^\]]*)?\]/gi, '').trim()
export function parseCommunityPage(html: string, source: CommunitySource): CommunityPage {
  const document = new DOMParser().parseFromString(html, 'text/html')
  if (/just a moment|attention required|访问验证|安全验证/i.test(document.title)) throw new Error('community-challenge')
  const base = origins[source]
  const items: CommunityProject[] = []
  const rows = document.querySelectorAll(source === 'mcbbs' ? '.structItem--resource' : '.modlist-block, .result-item')
  for (const row of rows) {
    const link = source === 'mcbbs'
      ? row.querySelector<HTMLAnchorElement>('.structItem-title a[data-tp-primary]')
      : row.querySelector<HTMLAnchorElement>('.title .name a, .head > a')
    const url = safeCommunityUrl(link?.getAttribute('href') ?? '', base)
    if (!url || !text(link)) continue
    if (source === 'mcbbs' && !/categories\/(mo-zu|forge|fabric|lite-loader|zheng-he-bao)\./.test(row.innerHTML)) continue
    const image = row.querySelector('img')
    items.push({
      id: url,
      url,
      title: text(link),
      description: cleanDescription(text(row.querySelector('.intro-content span, .body, .structItem-resourceTagLine')) || text(row.querySelector('.ename'))),
      image: safeCommunityUrl(image?.getAttribute('src') ?? '', base, true),
      author: text(row.querySelector('.username')),
      tags: Array.from(row.querySelectorAll('.structItem-parts a[href*="/categories/"], .structItem-title .label')).map(text),
      kind: source === 'mcmod-pack' || /categories\/zheng-he-bao\./.test(row.innerHTML) ? 'modpack' : 'mod',
      compatibility: [],
    })
  }
  const pageNumbers = Array.from(document.querySelectorAll('[data-page], .pageNav-page a')).map(a => {
    const match = a.getAttribute('data-page') || new URL(a.getAttribute('href') || '/', base).searchParams.get('page') || text(a)
    return Number(match) || 1
  })
  const totalPages = text(document.querySelector('.modlist-pages-block, .search-result-pages, .pageNav-jump')).match(/(?:\/|共约)\s*(\d+)\s*(?:页|$)/)
  if (!rows.length && !/没有|暂无|无资源|no resources|找到约?\s*0|共计\s*0/i.test(text(document.body))) throw new Error('community-layout')
  return { items: [...new Map(items.map(i => [i.url, i])).values()], pages: Math.max(1, ...pageNumbers, Number(totalPages?.[1]) || 1) }
}
export function readCommunityCompatibility(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(document.querySelectorAll('.mcver .mcver-title')).map(title => ({
    loader: text(title).split(' ')[0].toLowerCase().replace('neoforged', 'neoforge'),
    versions: Array.from(title.nextElementSibling?.querySelectorAll('a[href*="mcver="]') ?? []).map(a => new URL(a.getAttribute('href')!, 'https://www.mcmod.cn').searchParams.get('mcver')!).filter(Boolean),
  }))
}
export function matchesCompatibility(item: Pick<CommunityProject, 'compatibility'>, version: string, loaders: string[]) {
  if (!version && !loaders.length) return true
  return item.compatibility.some(c => (!version || c.versions.includes(version)) && (!loaders.length || loaders.some(l => l.toLowerCase() === c.loader)))
}
export function matchesCommunityText(haystack: string, version: string, loaders: string[]) {
  const versions: string[] = haystack.match(/\d+(?:\.\d+)+/g) ?? []
  const platforms: string[] = haystack.toLowerCase().match(/\b(?:forge|fabric|quilt|neoforge)\b/g) ?? []
  return (!version || versions.includes(version)) && (!loaders.length || loaders.some(l => platforms.includes(l.toLowerCase())))
}
export function getCommunityUrl(source: CommunitySource, filters: CommunityFilters, loader?: string) {
  if (source === 'mcbbs') return 'https://www.mcbbs.app/resources/categories/java-ban-you-xi-zi-yuan.13/?page=' + filters.page
  if (filters.query.trim()) {
    const url = new URL('https://search.mcmod.cn/s')
    url.search = new URLSearchParams({ key: filters.query.trim(), filter: source === 'mcmod-mod' ? '1' : '2', page: String(filters.page) }).toString()
    return url.href
  }
  const url = new URL(source === 'mcmod-mod' ? '/modlist.html' : '/modpack.html', origins[source])
  url.searchParams.set('page', String(filters.page))
  if (source === 'mcmod-mod') url.searchParams.set('platform', '1')
  if (filters.version) url.searchParams.set('mcver', filters.version)
  const apis: Record<string, number> = source === 'mcmod-mod' ? { forge: 1, fabric: 2, quilt: 11, neoforge: 13 } : { forge: 1, fabric: 2, quilt: 3, neoforge: 7 }
  if (loader && apis[loader]) url.searchParams.set('api', String(apis[loader]))
  if (filters.sort === 'newest') url.searchParams.set('sort', 'createtime')
  if (filters.sort === 'updated') url.searchParams.set('sort', 'lastedittime')
  return url.href
}
const cache = new Map<string, { html: string; time: number }>()
export function clearCommunityCache() { cache.clear() }
async function loadHtml(url: string, signal: AbortSignal) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.time < 600000) return cached.html
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), credentials: 'omit' })
  if (!response.ok) throw new Error('HTTP ' + response.status)
  const html = await response.text()
  if (html.length > 3000000) throw new Error('community-size')
  if (cache.size > 150) cache.delete(cache.keys().next().value!)
  cache.set(url, { html, time: Date.now() })
  return html
}
export async function loadCommunityCatalog(source: CommunitySource, filters: CommunityFilters, signal: AbortSignal): Promise<CommunityPage & { partial: boolean }> {
  if (source === 'mcbbs') {
    // Public XenForo search requires a login. Read the small public mod/pack
    // categories and search/filter the loaded catalogue locally instead.
    const collected: CommunityProject[] = []
    let partial = false
    for (const category of ['mo-zu.2', 'zheng-he-bao.11']) {
      const base = 'https://www.mcbbs.app/resources/categories/' + category + '/'
      const first = parseCommunityPage(await loadHtml(base, signal), source)
      collected.push(...first.items)
      for (let p = 2; p <= Math.min(first.pages, 5); p++) {
        collected.push(...parseCommunityPage(await loadHtml(base + '?page=' + p, signal), source).items)
      }
      partial ||= first.pages > 5
    }
    const query = filters.query.toLowerCase().trim()
    const filtered = [...new Map(collected.map(i => [i.url, i])).values()].filter(i => {
      const haystack = (i.title + ' ' + i.description + ' ' + i.author + ' ' + (i.tags ?? []).join(' ')).toLowerCase()
      return (!query || haystack.includes(query)) && matchesCommunityText(haystack, filters.version, filters.loaders)
    })
    return { items: filtered.slice((filters.page - 1) * 20, filters.page * 20), pages: Math.max(1, Math.ceil(filtered.length / 20)), partial }
  }
  const loaders = filters.query || !filters.loaders.length ? [undefined] : filters.loaders
  const pages: CommunityPage[] = []
  for (const loader of loaders) {
    if (loader && !['forge', 'fabric', 'quilt', 'neoforge'].includes(loader)) continue
    pages.push(parseCommunityPage(await loadHtml(getCommunityUrl(source, filters, loader), signal), source))
  }
  let items = [...new Map(pages.flatMap(p => p.items).map(i => [i.url, i])).values()]
  let partial = false
  if (filters.query && (filters.version || filters.loaders.length)) {
    let next = 0
    await Promise.all([0, 1].map(async () => {
      while (next < items.length) {
        const item = items[next++]
        signal.throwIfAborted()
        try { item.compatibility = readCommunityCompatibility(await loadHtml(item.url, signal)) } catch (error) {
          if (signal.aborted) throw error
          partial = true
        }
      }
    }))
    items = items.filter(i => matchesCompatibility(i, filters.version, filters.loaders))
  }
  return { items, pages: Math.max(1, ...pages.map(p => p.pages)), partial }
}

