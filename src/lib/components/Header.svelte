<script lang="ts">
  import { m } from '#lib/i18n';
  import { href } from '#lib/site';
  import { app } from '#lib/state.svelte';
  import Urni from './Urni.svelte';
</script>

<header class="bar">
  <div class="wrap in">
    <a class="brand" href={href()}>
      <Urni size={44} />
      <span>{m.app.name}</span>
    </a>
    <nav aria-label={m.nav.help}>
      <button class="btn small" type="button" onclick={() => (app.tourOpen = true)}>
        <span aria-hidden="true">?</span>
        {m.nav.help}
      </button>
      <button class="btn small" type="button" onclick={() => (app.aboutOpen = true)} aria-label={m.nav.about}>
        <span aria-hidden="true">ⓘ</span>
        <span class="wide">{m.nav.about}</span>
      </button>
    </nav>
  </div>
</header>

<style>
  .bar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 248, 238, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 2px solid var(--line);
  }
  .in {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 64px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-title);
    font-weight: 600;
    font-size: clamp(1rem, 4vw, 1.35rem);
    color: var(--ink);
    text-decoration: none;
    line-height: 1.1;
  }
  nav {
    display: flex;
    gap: 0.4rem;
  }
  @media (max-width: 560px) {
    .wide {
      display: none;
    }
    nav .btn {
      padding-inline: 0.8rem;
    }
  }
</style>
