<template>
  <section class="moss-community" data-testid="moss-chinese-community" :aria-label="t('moss.community.import')">
    <v-btn class="mt-3" variant="tonal" color="primary" size="small" block prepend-icon="file_upload" :loading="importing" @click="importPack">{{ t('moss.community.import') }}</v-btn>
    <p>{{ t('moss.community.importHint') }}</p>
    <v-alert v-if="importError" type="error" density="compact">{{ t('moss.community.importError') }}</v-alert>
  </section>
</template>
<script setup lang="ts">
import { useDialog } from '@/composables/dialog'
import { AddInstanceDialogKey } from '@/composables/instanceTemplates'
const { t } = useI18n()
const { show } = useDialog(AddInstanceDialogKey)
const importing = ref(false)
const importError = ref(false)
async function importPack() {
  importing.value = true
  importError.value = false
  try {
    const result = await windowController.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: t('modpack.name', 2), extensions: ['zip', 'mrpack'] }],
    })
    if (!result.canceled && result.filePaths[0]) show({ format: 'modpack', path: result.filePaths[0] })
  } catch {
    importError.value = true
  } finally {
    importing.value = false
  }
}
</script>
<style scoped>
.moss-community { border-top: 1px solid var(--moss-border); padding: 1rem 0; }
.moss-community p { font-size: .6875rem; line-height: 1.6; color: var(--moss-muted); margin: .5rem 0; }
</style>
