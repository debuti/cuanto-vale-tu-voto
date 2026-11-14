<script lang="ts">
  // Urni, the ballot-box mascot. Decorative: always hidden from assistive tech.
  let { size = 96, mood = 'happy' }: { size?: number; mood?: 'happy' | 'wow' | 'think' } = $props();
</script>

<svg class="urni" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="110" rx="34" ry="5" fill="#2a2440" opacity=".1" />
  <g class="env">
    <rect x="40" y="6" width="40" height="34" rx="5" fill="#fff" stroke="#2a2440" stroke-width="3" />
    <path d="M42 10l18 14 18-14" fill="none" stroke="#2a2440" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <rect x="14" y="34" width="92" height="72" rx="18" fill="#b9a8ff" stroke="#2a2440" stroke-width="3" />
  <rect x="14" y="34" width="92" height="22" rx="11" fill="#8f77f2" stroke="#2a2440" stroke-width="3" />
  <rect x="36" y="42" width="48" height="6" rx="3" fill="#2a2440" />
  <ellipse cx="34" cy="84" rx="7" ry="4.5" fill="#ff9dbb" opacity=".8" />
  <ellipse cx="86" cy="84" rx="7" ry="4.5" fill="#ff9dbb" opacity=".8" />
  {#if mood === 'think'}
    <path d="M40 74h10M70 74h10" stroke="#2a2440" stroke-width="4" stroke-linecap="round" />
    <path d="M54 88h12" stroke="#2a2440" stroke-width="3.5" stroke-linecap="round" />
  {:else}
    <circle cx="45" cy="74" r="5.5" fill="#2a2440" />
    <circle cx="75" cy="74" r="5.5" fill="#2a2440" />
    <circle cx="47" cy="72" r="1.8" fill="#fff" />
    <circle cx="77" cy="72" r="1.8" fill="#fff" />
    {#if mood === 'wow'}
      <ellipse cx="60" cy="89" rx="5" ry="6" fill="#2a2440" />
    {:else}
      <path d="M52 85q8 9 16 0" fill="none" stroke="#2a2440" stroke-width="3.5" stroke-linecap="round" />
    {/if}
  {/if}
</svg>

<style>
  .urni {
    flex: none;
    overflow: visible;
  }
  .env {
    animation: drop 3.2s ease-in-out infinite;
    transform-origin: 60px 40px;
  }
  @keyframes drop {
    0%,
    100% {
      transform: translateY(0) rotate(-4deg);
    }
    50% {
      transform: translateY(7px) rotate(3deg);
    }
  }
</style>
