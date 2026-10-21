<template>
  <SettingCard :title="t('setting.update')" icon="rocket_launch">
    <SettingItem :title="'MOSS X'" :description="t('moss.releaseUpdateHint')">
      <template #action>
        <v-btn data-testid="settings-check-update" color="primary" variant="tonal" size="small" append-icon="open_in_new" @click="openReleases">
          {{ t('moss.releaseDownloads') }}
        </v-btn>
      </template>
    </SettingItem>
    <div class="px-4 pb-2 text-caption">v{{ version }}</div>
  </SettingCard>
</template>
<script setup lang="ts">
import { injection } from '@/util/inject'
import { kUpdateSettings } from '@/composables/setting'
import SettingCard from '@/components/SettingCard.vue'
import SettingItem from '@/components/SettingItem.vue'
const { t } = useI18n()
const { version } = injection(kUpdateSettings)
function openReleases() {
  window.open('https://github.com/Yilegendoflink/Mossx-minecraft-launcher/releases', 'browser')
}
</script>
