<template>
  <section class="moss-welcome" :data-biome="biome.id" :style="{ backgroundImage: `url(${biome.image})`, '--biome-shade': biome.shade }" :aria-label="t('moss.welcome')">
    <v-menu :close-on-content-click="false" location="bottom end" max-width="460">
      <template #activator="{ props }">
        <v-btn v-bind="props" data-testid="moss-biome-menu" class="moss-welcome__biome" variant="flat" size="small" prepend-icon="palette">{{ t(`moss.biomes.${biome.id}`) }}</v-btn>
      </template>
      <div class="surface-card" style="max-width: 460px">
        <MossBiomePicker :selected="biome.id" :disabled="saving" @select="selectBiome" />
        <v-alert v-if="saveError" type="error" density="compact">{{ t('moss.biomes.saveError') }}</v-alert>
      </div>
    </v-menu>
    <div class="moss-welcome__content">
      <span>{{ t('moss.welcome') }}</span>
      <h2>{{ t('moss.headline') }}</h2>
      <p>{{ t('moss.description') }}</p>
      <div class="moss-welcome__actions">
        <v-btn variant="flat" color="white" prepend-icon="add" @click="showAddInstance()">{{ t('instances.add') }}</v-btn>
        <v-btn variant="text" color="white" append-icon="north_east" to="/store">{{ t('moss.discover') }}</v-btn>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/dialog'
import { AddInstanceDialogKey } from '@/composables/instanceTemplates'
import MossBiomePicker from '@/components/MossBiomePicker.vue'
import { kTheme } from '@/composables/theme'
import { kInstanceTheme } from '@/composables/instanceTheme'
import { injection } from '@/util/inject'
import { applyMossBiome, getMossBiome } from '@/util/mossBiomes'
const { activeTheme, currentTheme, saveCurrentTheme } = injection(kTheme)
const { instanceTheme, saveTheme } = injection(kInstanceTheme)
const biome = computed(() => getMossBiome(activeTheme.value.mossBiome))
const saving = ref(false)
const saveError = ref(false)
async function selectBiome(id: string) {
  if (saving.value) return
  saving.value = true
  saveError.value = false
  const theme = activeTheme.value
  const previous = { mossBiome: theme.mossBiome, colors: { ...theme.colors } }
  try {
    applyMossBiome(theme, id)
    if (theme === instanceTheme.value) await saveTheme()
    else if (theme === currentTheme.value) await saveCurrentTheme()
  } catch {
    Object.assign(theme, previous)
    saveError.value = true
  } finally {
    saving.value = false
  }
}
const { t } = useI18n()
const { show: showAddInstance } = useDialog(AddInstanceDialogKey)
</script>

<style scoped>
.moss-welcome { position: relative; overflow: clip; margin: 0 1.5rem 1rem; min-height: 11.25rem; border-radius: var(--moss-radius-card); background: #203d30 url('../assets/moss-landscape.svg') center / cover; color: #fff; }
.moss-welcome::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--biome-shade) 0%, color-mix(in srgb, var(--biome-shade) 90%, transparent) 30%, transparent 95%); }
.moss-welcome::after { content: ''; pointer-events: none; position: absolute; right: 20%; bottom: 20%; width: 3px; height: 3px; background: #fff8; box-shadow: 45px -35px #fff5, 100px 15px #fff7, -35px -60px #fff4, 150px -50px #fff6; animation: moss-scene-drift 8s ease-in-out infinite alternate; }
@keyframes moss-scene-drift { from { transform: translate3d(0, 8px, 0); opacity: .3; } to { transform: translate3d(14px, -14px, 0); opacity: .8; } }
.moss-welcome__actions .v-btn { transition: transform 180ms var(--moss-ease-out); }
.moss-welcome__actions .v-btn:hover { transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) { .moss-welcome::after { animation: none; } }
.moss-welcome__biome { position: absolute; top: .75rem; right: .75rem; z-index: 1; color: #fff !important; background: #0008 !important; }
.moss-welcome__content { position: relative; padding: 1.5rem 1.75rem; }
.moss-welcome__content > span { font-size: .625rem; letter-spacing: .08em; color: #d4e3d3; }
.moss-welcome h2 { margin: .375rem 0; font-size: 1.75rem; font-weight: 650; line-height: 1.4; letter-spacing: .04em; }
.moss-welcome p { margin: .375rem 0 1rem; font-size: .6875rem; color: #d4e3d3; }
.moss-welcome__actions { display: flex; align-items: center; gap: .5rem; }
.moss-welcome__actions .v-btn { font-size: .6875rem; letter-spacing: normal; min-height: 2rem; }
.moss-welcome__actions .v-btn--variant-flat { color: var(--biome-shade) !important; }
@media (max-height: 679px) { .moss-welcome { display: none; } }
</style>
