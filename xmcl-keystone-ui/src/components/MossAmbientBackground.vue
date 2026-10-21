<template>
  <div class="moss-ambient" data-testid="moss-ambient" aria-hidden="true">
    <div class="moss-ambient__tiles">
      <i v-for="n in 6" :key="n" :style="{ '--tile': n }" />
    </div>
  </div>
</template>
<style scoped>
.moss-ambient { position: absolute; inset: 0; overflow: hidden; pointer-events: none; background: var(--color-bg); }
.moss-ambient__tiles { position: absolute; width: min(44vw, 38rem); height: 24rem; right: -2rem; bottom: -3rem; color: var(--moss-primary); transform: rotate(-14deg); opacity: .07; }
.moss-ambient i { position: absolute; display: block; width: 4rem; height: 4rem; border: 1px solid currentColor; border-radius: .75rem; left: calc(var(--tile) * 13%); top: calc(mod(var(--tile), 3) * 5rem); animation: moss-tile-float 9s ease-in-out infinite alternate; animation-delay: calc(var(--tile) * -1.5s); }
.moss-ambient i:nth-child(2n) { width: 2rem; height: 2rem; background: currentColor; border-radius: .375rem; }
.moss-ambient i:nth-child(3n) { width: 7rem; height: 7rem; }
@keyframes moss-tile-float { from { transform: translate3d(0, 0, 0) rotate(0); } to { transform: translate3d(-1rem, -2rem, 0) rotate(12deg); } }
@media (prefers-reduced-motion: reduce) { .moss-ambient i { animation: none; } }
</style>
