<template>
  <div class="store-entry h-full w-full flex flex-col overflow-y-auto custom-scrollbar lg:(flex-row overflow-hidden)">
    <v-progress-linear
      class="absolute left-0 top-0 z-20 m-0 p-0"
      :active="loading"
      height="3"
      :indeterminate="true"
    />

    <!--#region Sidebar Filters -->
    <aside
      id="store-filters"
      class="store-sidebar w-auto lg:(w-88 h-full overflow-y-auto pb-20) flex-none border-b lg:(border-b-0 border-r) border-divider/40 px-4 pt-6 flex flex-col gap-6 custom-scrollbar"
    >
      <div class="flex flex-col gap-4 flex-shrink-0">
        <!-- Sources -->
        <div class="filter-group">
          <h3 class="filter-title">
            {{ t('modrinth.modpackSource.source') }}
          </h3>
          <div class="grid grid-cols-3 gap-2" data-testid="store-source-filters">
            <button
              v-for="source in sourcesList"
              :key="source.id"
              type="button"
              :aria-label="source.text"
              :aria-pressed="selectedSources.includes(source.id)"
              :data-testid="isCommunitySource(source.id) ? `community-source-${source.id}` : `store-source-${source.id}`"
              class="source-button surface-card-row rounded-xl relative flex-1 flex flex-col items-center justify-center p-2"
              :class="{ omitted: !selectedSources.includes(source.id) }"
              @click="toggleSource(source.id)"
            >
              <component v-if="source.component" :is="source.component" class="w-6 h-6 fill-current" />
              <v-icon v-else size="24">{{ source.icon }}</v-icon>
              <span class="text-xs font-bold mt-2">{{ source.text }}</span>
              <div
                class="cross-overlay absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-200"
              >
                <v-icon color="red" size="60">close</v-icon>
              </div>
            </button>
          </div>
        </div>

        <MossChineseCommunity />
        <div>
          <!-- Sort -->
          <div class="filter-group">
            <h3 class="filter-title">{{ t('modrinth.sort.title') }}</h3>
            <v-select
              v-model="sort"
              :items="sortBy"
              :disabled="selectedSources.length === 0 || (communitySources.length > 0 && !!keyword) || (selectedSources.length === 1 && ['ftb', 'mcbbs'].includes(selectedSources[0]))"
              :aria-label="t('modrinth.sort.title')"
              item-title="text"
              item-value="value"
              variant="solo"
              density="compact"
              rounded="lg"
              hide-details
              :placeholder="t('modrinth.sort.title')"
            />
          </div>
          <!-- Game Version -->
          <div class="filter-group">
            <h3 class="filter-title">{{ t('modrinth.gameVersions.name') }}</h3>
            <v-autocomplete
              v-model="gameVersion"
              :items="gameVersions"
              item-title="version"
              item-value="version"
              variant="solo"
              density="compact"
              rounded="lg"
              clearable
              hide-details
              :placeholder="t('modrinth.gameVersions.name')"
            />
          </div>
        </div>
      </div>

      <!-- ModLoaders -->
      <FilterCard
        :title="t('modrinth.modLoaders.name')"
        :items="
          catModLoaders.map((loader) => ({
            id: loader.name,
            text: loader.name[0].toUpperCase() + loader.name.slice(1),
            iconHTML: loader.icon,
          }))
        "
        :selected="modLoaders"
        :selected-count="modLoaders.length"
        @toggle="toggleModLoader"
        @clear="modLoaders = []"
      />
      <!-- Modrinth Categories -->
      <FilterCard
        v-if="!communitySources.length"
        :title="`${t('curseforge.category')} (Modrinth)`"
        :items="modrinthCategoriesDisplay"
        :selected="_modrinthCategories"
        :selected-count="_modrinthCategories.length"
        @toggle="toggleModrinthCategory"
        @clear="_modrinthCategories = []"
      />
      <!-- CurseForge Categories -->
      <FilterCard
        v-if="!communitySources.length"
        :title="`${t('curseforge.category')} (CurseForge)`"
        :items="curseforgeCategoriesDisplay"
        :selected="curseforgeCategory ? [curseforgeCategory.toString()] : []"
        :selected-count="curseforgeCategory ? 1 : 0"
        @toggle="toggleCurseforgeCategory"
        @clear="curseforgeCategory = undefined"
      />
    </aside>

    <!-- Right pane: on narrow it collapses (display:contents) so the search
         bar and content become direct children of store-entry, letting the
         search bar sit above the filters and stick to the top. -->
    <div class="contents lg:(flex flex-col flex-1 overflow-hidden relative)">
      <div
        id="store-search"
        class="store-search-bar order-first lg:order-none flex-none px-6 lg:px-10 py-5 sticky top-0 z-10 backdrop-blur-md border-b border-divider/40"
      >
        <div class="max-w-3xl">
          <v-text-field
            ref="filter"
            v-model="keyword"
            data-testid="store-search"
            variant="solo"
            flat
            hide-details
            rounded="xl"
            density="comfortable"
            :placeholder="communitySources.length ? t('moss.community.searchHint') : t('store.searchHint')"
            prepend-inner-icon="search"
            class="elevated-search"
          >
            <template #append-inner>
              <v-slide-x-transition>
                <v-icon v-if="keyword" class="cursor-pointer" @click="onClose">close</v-icon>
              </v-slide-x-transition>
            </template>
          </v-text-field>
        </div>
      </div>

      <!-- Main Content -->
      <div id="store-content" class="p-6 lg:(flex-1 overflow-y-auto p-10) custom-scrollbar relative" ref="container">
        <div v-if="communitySources.length" class="mb-4">
          <p class="text-xs mb-3">{{ t('moss.community.mixedHint') }}</p>
          <v-btn variant="text" size="small" prepend-icon="refresh" @click="communityResults.refresh">{{ t('shared.refresh') }}</v-btn>
          <v-alert v-for="source in communityErrors" :key="source" type="warning" variant="tonal" density="compact" class="mb-2">{{ communityNames[source] }}: {{ t('moss.community.loadError') }}</v-alert>
          <v-alert v-if="communityPartial.length" type="info" variant="tonal" density="compact">{{ t('moss.community.partial') }}</v-alert>
        </div>
        <!-- Featured Carousel -->
        <div v-if="!keyword && selectedCount === 0 && !communitySources.length && selectedSources.length" class="mb-12">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
            <v-icon color="orange" size="large">local_fire_department</v-icon>
            {{ t('store.trending') }}
          </h2>
          <v-carousel
            cycle
            height="400"
            hide-delimiter-background
            show-arrows="hover"
            color="white"
            class="rounded-3xl overflow-hidden"
            interval="6000"
          >
            <template #prev="{ props: btnProps }">
              <v-btn
                variant="plain"
                icon="chevron_left"
                :color="arrowColor"
                @click="btnProps.onClick"
              />
            </template>
            <template #next="{ props: btnProps }">
              <v-btn
                variant="plain"
                icon="chevron_right"
                :color="arrowColor"
                @click="btnProps.onClick"
              />
            </template>
            <v-carousel-item v-for="(g, i) in popularItems" :key="i">
              <StoreGallery :gallery="g" @enter="enter(g.type, g.id)" />
            </v-carousel-item>
          </v-carousel>
        </div>

        <!-- Latest Minecraft Section -->
        <section
          v-if="!keyword && selectedCount === 0 && !communitySources.length && selectedSources.length"
          class="mb-12"
          role="region"
          :aria-labelledby="latestMinecraftHeadingId"
        >
          <h2
            :id="latestMinecraftHeadingId"
            class="text-2xl font-bold mb-6 flex items-center gap-3"
          >
            <v-icon color="green" size="large" aria-hidden="true">xmcl:minecraft</v-icon>
            {{ t('store.latestMinecraft') }}
            <v-btn
              class="ml-2"
              icon="refresh"
              variant="text"
              size="small"
              :aria-label="t('shared.refresh')"
              @click="refreshRecentMinecraft"
            />
          </h2>
          <div
            v-roving-tabindex
            role="group"
            :aria-labelledby="latestMinecraftHeadingId"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <StoreExploreCardModern
              v-for="item in recentMinecraftItems"
              :key="`minecraft-${item.id}`"
              :value="item"
              @click="enter(item.type, item.id)"
            />
          </div>
        </section>

        <!-- Grid -->
        <section class="min-h-screen" role="region" :aria-labelledby="discoverHeadingId">
          <div class="flex flex-wrap items-end justify-between mb-6 gap-3">
            <div>
              <h2 :id="discoverHeadingId" class="text-2xl mb-3 font-bold text-gray-900 dark:text-white flex items-center gap-3 whitespace-nowrap">
                <v-icon color="primary" size="large" aria-hidden="true">{{ hasFilters ? 'search' : 'explore' }}</v-icon>
                {{ hasFilters ? t('store.searchResult') : t('store.discover') }}
              </h2>
              <p class="text-gray-500 dark:text-gray-300 text-sm mt-1 whitespace-nowrap">
                {{ t('modrinth.projects', { count: items.length }) }}
              </p>
            </div>
            <!-- Active Filters -->
            <div v-if="hasFilters" class="flex justify-end items-center gap-2">
              <div class="flex gap-2 flex-wrap items-center">
                <v-chip
                  v-for="tag in activeTags"
                  :key="`${tag.type}-${tag.id}`"
                  size="small"
                  variant="outlined"
                  closable
                  @click:close="removeTag(tag)"
                >
                  {{ tag.text }}
                </v-chip>
              </div>
              <v-btn
                v-if="hasFilters"
                color="red"
                size="small"
                variant="text"
                prepend-icon="clear"
                @click="clearAllFilters"
              >
                {{ t('shared.cancel') }}
              </v-btn>
            </div>
          </div>
          <div
            v-if="items.length === 0 && !isSearching"
            class="flex flex-col justify-center items-center h-96 text-center opacity-50"
          >
            <v-icon size="96" color="grey">mood_bad</v-icon>
            <h3 class="text-2xl font-bold mt-4">{{ t('store.empty') }}</h3>
            <p class="text-gray-400 mt-2">{{ t('store.emptyHint') }}</p>
          </div>
          <div
            v-else
            v-roving-tabindex
            role="group"
            :aria-labelledby="discoverHeadingId"
            class="store-project-grid gap-6 pb-20"
          >
            <StoreExploreCardModern
              v-for="mod in items"
              :key="`${mod.type}:${mod.id}`"
              :value="mod"
              @click="enter(mod.type, mod.id)"
            />
          </div>

          <!-- Pagination -->
          <div
            v-if="pageCount > 1"
            class="store-pagination hover:(scale-100 opacity-100) sticky bottom-3 z-10 w-full scale-95 transform opacity-60 transition duration-200 mt-4"
          >
            <v-pagination
              v-model="page"
              :length="pageCount"
              active-color="primary"
              :disabled="isSearching"
              :total-visible="6"
              rounded="circle"
              density="comfortable"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CurseforgeIcon from '@/components/CurseforgeIcon.vue'
import MossChineseCommunity from '@/components/MossChineseCommunity.vue'
import { communityNames, isCommunitySource } from '@/util/communityCatalog'
import { allStoreSources, selectedStoreSources, toggleStoreSource, interleaveStoreGroups, type UnifiedStoreSource } from '@/util/storeSources'
import { useCommunitySearch } from '@/composables/communitySearch'
import type { ExploreProjectModern } from '@/components/StoreExploreCardModern.vue'
import FilterCard from '@/components/FilterCard.vue'
import FTBIcon from '@/components/FTBIcon.vue'
import ModrinthIcon from '@/components/ModrinthIcon.vue'
import StoreExploreCardModern from '@/components/StoreExploreCardModern.vue'
import StoreGallery from '@/components/StoreGallery.vue'
import { kCurseforgeCategories, useCurseforgeCategoryI18n } from '@/composables/curseforge'
import { useDateString } from '@/composables/date'
import { kModrinthTags } from '@/composables/modrinth'
import { useQuery, useQueryNumber, useQueryStringArray } from '@/composables/query'
import { useSortByItems } from '@/composables/sortBy'
import { normalizeMarketSort } from '@/composables/marketSort'
import { useTextFieldBehavior } from '@/composables/textfieldBehavior'
import { kTheme } from '@/composables/theme'
import { usePopularItems } from '@/composables/usePopularItems'
import { useRecentMinecraftItems } from '@/composables/useRecentMinecraftItems'
import { useSearchedItems } from '@/composables/useSearchedItems'
import { useGamepadInnerNav } from '@/composables/gamepad'
import { vRovingTabindex } from '@/directives/rovingTabindex'
import { injection } from '@/util/inject'
import { useTutorial } from '@/composables/tutorial'
import { useFocus } from '@vueuse/core'
import { useId } from 'vue'

const { push, replace } = useRouter()
const route = useRoute()
const { t } = useI18n()
const { isDark } = injection(kTheme)
const arrowColor = computed(() => (isDark.value ? 'white' : 'black'))

const latestMinecraftHeadingId = useId()
const discoverHeadingId = useId()

// --- Query State ---
function ensureQuery(query: Record<string, string | (string | null)[] | null | undefined>) {
  query.page = '1'
  delete query.sortOrder
}

const query = useQuery('query', ensureQuery)
const community = useQuery('community', ensureQuery)
const selectedSources = computed(() => selectedStoreSources(omitSources.value, community.value))
const communitySources = computed(() => selectedSources.value.filter(isCommunitySource))
const nativeOmitSources = computed(() => allStoreSources.filter(s => !selectedSources.value.includes(s)))
const gameVersion = useQuery('gameVersion', ensureQuery)
const modLoaders = useQueryStringArray('modLoaders', ensureQuery)
const sortQuery = useQuery('sort', ensureQuery)
const sort = computed({
  get: () => normalizeMarketSort(sortQuery.value || (query.value || communitySources.value.length ? 'relevance' : 'downloads')),
  set: (value: string) => { sortQuery.value = value },
})
const page = useQueryNumber('page', 1)
const omitSources = useQueryStringArray('omitSources', ensureQuery)
const keyword = ref(query)
const _modrinthCategories = useQueryStringArray('modrinthCategories', ensureQuery)
const curseforgeCategory = useQueryNumber(
  'curseforgeCategory',
  undefined as undefined | number,
  ensureQuery,
)
const pageSize = 20

// --- Data Fetching Logic ---
const tCategory = useCurseforgeCategoryI18n()
const { getDateString } = useDateString()
const galleryMappings = ref<Record<string, { name: string; description: string }>>({})

const { items: nativeItems, isSearching: nativeSearching, searchError, pageCount: nativePageCount, sources } = useSearchedItems({
  query,
  gameVersion,
  modLoaders,
  sort,
  page,
  omitSources: nativeOmitSources,
  modrinthCategories: _modrinthCategories,
  curseforgeCategory,
  pageSize,
  tCategory,
})
const communityResults = useCommunitySearch(communitySources, () => ({ query: query.value, version: gameVersion.value, loaders: modLoaders.value, sort: sort.value, page: page.value }))
const { errors: communityErrors, partial: communityPartial } = communityResults
const isSearching = computed(() => (sources.value.length > 0 && nativeSearching.value) || communityResults.loading.value)
const pageCount = computed(() => Math.max(sources.value.length ? nativePageCount.value : 1, communityResults.pages.value))
const items = computed<ExploreProjectModern[]>(() => {
  const groups: ExploreProjectModern[][] = [sources.value.length ? nativeItems.value : []]
  for (const source of communitySources.value) {
    groups.push((communityResults.states.value[source]?.items ?? []).map(item => ({
      id: item.url, type: source, originalUrl: item.url, title: item.title,
      description: item.description || t('moss.community.noDescription'), iconUrl: item.image,
      author: item.author, downloadCount: '', updatedAt: '',
    })))
  }
  return interleaveStoreGroups(groups)
})

// Gamepad triggers (L2/R2) turn store result pages.
useGamepadInnerNav({
  handler: (dir) => {
    if (pageCount.value <= 1) return
    page.value = dir === 'next'
      ? Math.min(page.value + 1, pageCount.value)
      : Math.max(page.value - 1, 1)
    // scroll to top of discoverHeadingId
    const element = document.getElementById(discoverHeadingId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  },
  disabled: () => pageCount.value <= 1,
})

const { popularItems } = usePopularItems(galleryMappings)

const { recentMinecraftItems: allRecentMinecraftItems } = useRecentMinecraftItems(galleryMappings)

// Display only 8 items, with rotation support
const recentMinecraftOffset = ref(0)

const recentMinecraftItems = computed(() => {
  const items = allRecentMinecraftItems.value
  if (items.length === 0) return []
  const offset = recentMinecraftOffset.value % items.length
  // Rotate items starting from offset and take 8
  const rotated = [...items.slice(offset), ...items.slice(0, offset)]
  return rotated.slice(0, 8)
})

const refreshRecentMinecraft = () => {
  recentMinecraftOffset.value += 8
}

// Search Logic
const sortByItems = useSortByItems()
const sortBy = computed(() => sortByItems.value.filter(item => !communitySources.value.length || ['relevance', 'updated', 'newest'].includes(item.value)).map(item => ({
  ...item,
  text: item.value === 'follows' ? t('store.popularity') : item.text,
})))

const loading = computed(() => isSearching.value)

// Mappings for results
const mappings = ref<Record<string, { name: string; description: string }>>({})
const {
  refreshing: refreshingTag,
  categories: modrinthCategories,
  modLoaders: modrinthModloaders,
  gameVersions,
} = injection(kModrinthTags)
const { categories: curseforgeCategories } = injection(kCurseforgeCategories)
const catModLoaders = computed(() =>
  modrinthModloaders.value.filter((v) => communitySources.value.length ? ['forge', 'fabric', 'quilt', 'neoforge'].includes(v.name) : v.supported_project_types.includes('modpack')),
)

const enter = (type: string, id: string) => {
  if (isCommunitySource(type)) { window.open(id, 'browser'); return }
  push(`/store/${type}/${id}`)
}

// --- UI Logic for Filters ---
const sourcesList = computed(() => [
  { id: 'modrinth', text: 'Modrinth', component: ModrinthIcon },
  { id: 'curseforge', text: 'CurseForge', component: CurseforgeIcon },
  { id: 'ftb', text: 'FTB', component: FTBIcon },
  { id: 'mcmod-mod', text: t('moss.community.sourceMods'), icon: 'menu_book', component: undefined },
  { id: 'mcmod-pack', text: t('moss.community.sourcePacks'), icon: 'inventory_2', component: undefined },
  { id: 'mcbbs', text: 'MCBBS 2nd', icon: 'forum', component: undefined },
] as { id: UnifiedStoreSource; text: string; component?: typeof ModrinthIcon; icon?: string }[])

function toggleSource(id: string) {
  if (!allStoreSources.includes(id as UnifiedStoreSource)) return
  replace({ query: { ...route.query, community: undefined,
    omitSources: toggleStoreSource(omitSources.value, id as UnifiedStoreSource, community.value).join(','),
    ...(isCommunitySource(id) ? { modrinthCategories: undefined, curseforgeCategory: undefined } : {}), page: '1' } })
}

// Categories Display
const modrinthCategoriesDisplay = computed(() => {
  return modrinthCategories.value
    .filter((v) => v.project_type === 'modpack')
    .map((c) => ({
      id: c.name,
      text: t(`modrinth.categories.${c.name}`, c.name),
      iconHTML: c.icon,
    }))
})

function toggleModLoader(name: string) {
  if (modLoaders.value.includes(name)) {
    modLoaders.value = modLoaders.value.filter((n) => n !== name)
  } else {
    modLoaders.value = [...modLoaders.value, name]
  }
}

// CurseForge Categories Display
const curseforgeCategoriesDisplay = computed(() => {
  return (curseforgeCategories.value?.filter((c) => c.parentCategoryId === 4471) || []).map(
    (c) => ({
      id: c.id.toString(),
      text: tCategory(c.name),
      icon: c.iconUrl,
    }),
  )
})

function toggleModrinthCategory(id: string) {
  if (_modrinthCategories.value.includes(id)) {
    _modrinthCategories.value = _modrinthCategories.value.filter((c) => c !== id)
  } else {
    _modrinthCategories.value = [..._modrinthCategories.value, id]
  }
}

function toggleCurseforgeCategory(id: string | number) {
  id = Number(id)
  if (curseforgeCategory.value === id) {
    curseforgeCategory.value = undefined
  } else {
    curseforgeCategory.value = id
  }
}

// Active Filter Chips
const activeTags = computed(() => {
  const tags: {
    id: string
    text: string
    type: 'source' | 'version' | 'sort' | 'loader' | 'category'
  }[] = []

  omitSources.value.forEach((s) =>
    tags.push({ id: s, text: sourcesList.value.find((x) => x.id === s)?.text || s, type: 'source' }),
  )
  if (gameVersion.value)
    tags.push({ id: gameVersion.value, text: gameVersion.value, type: 'version' })
  if (sortQuery.value) {
    const label = sortBy.value.find(item => item.value === sort.value)?.text || ''
    tags.push({
      id: sort.value,
      text: label,
      type: 'sort',
    })
  }
  modLoaders.value.forEach((l) => tags.push({ id: l, text: l, type: 'loader' }))
  _modrinthCategories.value.forEach((c) =>
    tags.push({
      id: c,
      text: modrinthCategoriesDisplay.value.find((x) => x.id === c)?.text || c,
      type: 'category',
    }),
  )
  if (curseforgeCategory.value) {
    const name = curseforgeCategoriesDisplay.value.find(
      (x) => x.id === curseforgeCategory.value?.toString(),
    )?.text
    tags.push({
      id: curseforgeCategory.value.toString(),
      text: name || 'Category',
      type: 'category',
    })
  }

  return tags
})

const selectedCount = computed(() => activeTags.value.length)

function removeTag(tag: typeof activeTags.value[number]) {
  if (tag.type === 'sort') {
    replace({ query: { ...route.query, sort: undefined, sortOrder: undefined, page: '1' } })
  }
  if (tag.type === 'source') toggleSource(tag.id)
  if (tag.type === 'version') gameVersion.value = ''
  if (tag.type === 'loader') modLoaders.value = modLoaders.value.filter((l) => l !== tag.id)
  if (tag.type === 'category') {
    if (_modrinthCategories.value.includes(tag.id)) toggleModrinthCategory(tag.id)
    else toggleCurseforgeCategory(Number(tag.id))
  }
}

function clearAllFilters() {
  replace({
    query: {
      ...route.query,
      omitSources: undefined,
      community: undefined,
      gameVersion: undefined,
      modLoaders: undefined,
      modrinthCategories: undefined,
      curseforgeCategory: undefined,
      sort: undefined,
      sortOrder: undefined,
      page: '1',
    },
  })
}

function onClose() {
  query.value = ''
  keyword.value = ''
}

const hasFilters = computed(() => selectedCount.value > 0 || !!keyword.value)

const filter = ref<HTMLElement | null>(null)
const { focused } = useFocus(filter)
useTextFieldBehavior(filter, focused)

useTutorial(
  computed(() => [
    {
      element: '#store-search',
      popover: {
        title: t('modSearch.searchInMarket'),
        description: t('tutorial.storeSearchDescription'),
      },
    },
    {
      element: '#store-filters',
      popover: {
        title: t('curseforge.category'),
        description: t('tutorial.storeSearchCategoryDescription'),
      },
    },
    {
      element: '#store-content',
      popover: {
        title: t('store.trending'),
        description: t('tutorial.storePoupularModpackDescription'),
      },
    },
  ]),
)
</script>

<style scoped>
.store-entry {
  user-select: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
}

.theme--dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
}

.theme--dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Elevated Search Input */
.elevated-search :deep(.v-field) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elevated-search.v-input--focused :deep(.v-field),
.elevated-search :deep(.v-field--focused) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-1px);
}

.theme--dark .elevated-search :deep(.v-field) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.theme--dark .elevated-search :deep(.v-field--focused) {
  box-shadow: 0 8px 30px rgba(var(--v-theme-primary), 0.2) !important;
}

/* Pagination styling */
.store-pagination :deep(.v-pagination__item .v-btn),
.store-pagination :deep(.v-pagination__prev .v-btn),
.store-pagination :deep(.v-pagination__next .v-btn) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-title {
  @apply font-bold mb-3 text-xs uppercase text-gray-700 dark:text-gray-200 tracking-wider ml-1;
}

.filter-group {
  @apply mb-2;
}

/* Source Button Styles — shape + border + hover-border come from the
   shared `.surface-card-row` utility. Only the colour-tone bits and
   the omitted (off) override live here. */
.source-button {
  min-height: 5.25rem;
  @apply text-gray-600 dark:text-gray-400;
}
.source-button > span { font-size: .6875rem; line-height: 1.3; }
.store-project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)); }

.source-button .cross-overlay {
  opacity: 0;
}

/* Off-state: transparent shell, no border swap on hover */
.source-button.omitted,
.source-button.omitted:hover {
  background: transparent;
  border-color: transparent;
}

.source-button.omitted {
  @apply text-gray-400 dark:text-gray-500;
}

.source-button.omitted .cross-overlay {
  opacity: 0.5;
}

.source-button:hover .cross-overlay {
  opacity: 1;
}
</style>
