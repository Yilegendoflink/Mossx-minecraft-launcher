<template>
  <v-menu location="bottom start">
    <template #activator="{ props }">
      <v-btn v-bind="props" data-testid="moss-navigation-menu" class="non-moveable moss-navigation-menu"
        variant="text" size="small" :aria-label="t('moss.navigation.title')">
        <v-icon size="20">menu</v-icon><span>{{ t('moss.navigation.title') }}</span>
      </v-btn>
    </template>
    <v-list density="compact" min-width="240">
      <v-list-item to="/" prepend-icon="home" :title="t('moss.play')" />
      <v-list-item to="/me" prepend-icon="person" :title="t('moss.library')" />
      <v-list-item to="/store" prepend-icon="store" :title="t('moss.discover')" />
      <v-list-item data-testid="moss-navigation-settings" to="/setting" prepend-icon="settings" :title="t('setting.name', 2)" />
      <v-divider class="my-1" />
      <v-list-item v-if="style === 'notch' && autoHide" data-testid="moss-pin-navigation" prepend-icon="push_pin"
        :title="t('moss.navigation.pin')" @click="autoHide = false" />
      <v-list-item data-testid="moss-reset-layout" prepend-icon="view_sidebar"
        :title="t('moss.navigation.restore')" @click="restoreLayout" />
    </v-list>
  </v-menu>
</template>
<script setup lang="ts">
import { useInjectSidebarSettings } from '@/composables/sidebarSettings'
const { t } = useI18n()
const { style, position, align, scale, autoHide } = useInjectSidebarSettings()
function restoreLayout() {
  style.value = 'classic'
  position.value = 'left'
  align.value = 'center'
  scale.value = 100
  autoHide.value = false
}
</script>
<style scoped>
.moss-navigation-menu { flex-shrink: 0; min-width: 2.75rem; height: 2.5rem; padding: 0 .75rem; gap: .375rem; }
@media (max-width: 999px) { .moss-navigation-menu span { display: none; } }
</style>
