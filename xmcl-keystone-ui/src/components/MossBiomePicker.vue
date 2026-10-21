<template>
  <fieldset class="moss-biomes" :disabled="disabled" data-testid="moss-biome-picker">
    <legend>{{ t('moss.biomes.title') }}</legend>
    <p>{{ t('moss.biomes.description') }}</p>
    <div class="moss-biomes__grid">
      <button v-for="biome in mossBiomes" :key="biome.id" type="button"
        :data-testid="`moss-biome-${biome.id}`" :aria-pressed="getMossBiome(selected).id === biome.id"
        :style="{ '--biome-primary': biome.primary }" @click="$emit('select', biome.id)">
        <img :src="biome.image" alt="" loading="lazy">
        <span>{{ t(`moss.biomes.${biome.id}`) }}<v-icon v-if="getMossBiome(selected).id === biome.id" size="16">check</v-icon></span>
      </button>
    </div>
  </fieldset>
</template>
<script setup lang="ts">
import { getMossBiome, mossBiomes } from '@/util/mossBiomes'
defineProps<{ selected?: string; disabled?: boolean }>()
defineEmits<{ (event: 'select', id: string): void }>()
const { t } = useI18n()
</script>
<style scoped>
.moss-biomes { border: 0; min-width: 0; margin: 0; padding: 1rem; color: var(--moss-ink); }
.moss-biomes legend { padding-top: .75rem; font-weight: 600; font-size: .875rem; }
.moss-biomes p { margin: 0 0 .75rem; color: var(--moss-muted); font-size: .75rem; }
.moss-biomes__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .625rem; }
.moss-biomes button { border: 2px solid transparent; border-radius: .5rem; overflow: hidden; background: var(--moss-card); text-align: left; cursor: pointer; }
.moss-biomes button[aria-pressed=true] { border-color: var(--moss-primary); }
.moss-biomes button:focus-visible { outline: 2px solid var(--moss-focus); outline-offset: 2px; }
.moss-biomes button:disabled { opacity: .5; cursor: wait; }
.moss-biomes img { display: block; width: 100%; height: 3rem; object-fit: cover; object-position: right; background: var(--biome-primary); }
.moss-biomes span { display: flex; justify-content: space-between; gap: .25rem; padding: .375rem; font-size: .75rem; }
@media (max-width: 999px) { .moss-biomes__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
