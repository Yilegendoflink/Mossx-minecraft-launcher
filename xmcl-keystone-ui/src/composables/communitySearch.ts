import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { clearCommunityCache, loadCommunityCatalog, type CommunityFilters, type CommunityPage, type CommunitySource } from '@/util/communityCatalog'
interface CommunityState extends CommunityPage { loading: boolean; error: boolean; partial: boolean }
export function useCommunitySearch(sources: Ref<CommunitySource[]>, filters: () => CommunityFilters) {
  const states = shallowRef<Partial<Record<CommunitySource, CommunityState>>>({})
  const revision = ref(0)
  function refresh() { clearCommunityCache(); revision.value++ }
  watch(() => [sources.value.join(','), JSON.stringify(filters()), revision.value], (_, __, onCleanup) => {
    const controller = new AbortController()
    const selected = [...sources.value]
    const request = { ...filters() }
    states.value = Object.fromEntries(selected.map(source => [source, { items: [], pages: 1, loading: true, error: false, partial: false }]))
    const timer = setTimeout(() => {
      for (const source of selected) {
        loadCommunityCatalog(source, request, controller.signal).then(data => {
          if (!controller.signal.aborted) states.value = { ...states.value, [source]: { ...data, items: request.page > data.pages ? [] : data.items, loading: false, error: false } }
        }).catch(() => {
          if (!controller.signal.aborted) states.value = { ...states.value, [source]: { items: [], pages: 1, loading: false, error: true, partial: false } }
        })
      }
    }, 400)
    onCleanup(() => { clearTimeout(timer); controller.abort() })
  }, { immediate: true })
  return {
    states,
    refresh,
    loading: computed(() => Object.values(states.value).some(s => s?.loading)),
    pages: computed(() => Math.max(1, ...Object.values(states.value).map(s => s?.pages ?? 1))),
    errors: computed(() => sources.value.filter(s => states.value[s]?.error)),
    partial: computed(() => sources.value.filter(s => states.value[s]?.partial)),
  }
}
