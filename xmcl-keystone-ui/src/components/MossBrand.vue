<template>
  <router-link to="/" class="moss-brand non-moveable" aria-label="MOSS X">
    <span class="moss-brand__mark" aria-hidden="true">
      <MossLogo :size="32" data-testid="moss-brand-icon" />
    </span>
    <span class="moss-brand__word">MOSS X<small>{{ t('moss.edition') }}</small></span>
  </router-link>
</template>

<script setup lang="ts">
import MossLogo from '@/components/MossLogo.vue'
const { t } = useI18n()
</script>

<style scoped>
.moss-brand { display: flex; align-items: center; gap: .625rem; padding: 1.25rem .75rem 1.5rem; text-decoration: none; color: var(--moss-ink); }
.moss-brand__mark { display: grid; place-items: center; flex-shrink: 0; width: 2rem; height: 2.5rem; }
.moss-brand__word { min-width: 0; flex: 1; font: 700 1.5rem/1 var(--moss-font-display); letter-spacing: -.025em; }
.moss-brand small { display: block; overflow: hidden; text-overflow: ellipsis; margin-top: .4375rem; font: 400 .5625rem/1.4 var(--moss-font-body); letter-spacing: .04em; color: var(--moss-muted); white-space: nowrap; }
@media (max-width: 999px), (max-height: 559px) { .moss-brand { justify-content: center; padding: .75rem 0; } .moss-brand__word { display: none; } }
</style>
