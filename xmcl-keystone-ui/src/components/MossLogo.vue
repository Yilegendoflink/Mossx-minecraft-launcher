<template>
  <span class="moss-logo" role="img" :aria-label="label"
    :style="{ width: `${size}px`, height: `${size}px`, maskImage: `url(${mark})` }" />
</template>
<script setup lang="ts">
import mark from '@/assets/moss-x.svg'
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 32, label: 'MOSS X' })
</script>
<style scoped>
.moss-logo { display: inline-block; flex-shrink: 0; color: var(--moss-primary, #254d3c); background-color: currentColor; mask-size: contain; mask-position: center; mask-repeat: no-repeat; }
</style>
