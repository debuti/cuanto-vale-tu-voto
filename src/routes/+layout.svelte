<script lang="ts">
  import '@fontsource-variable/fredoka';
  import '@fontsource-variable/nunito';
  import '../app.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import mon from '../../monetization.config.json';
  import { page } from '$app/state';
  import { m } from '#lib/i18n';
  import { base } from '#lib/site';
  import { app } from '#lib/state.svelte';
  import About from '#lib/components/About.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import Header from '#lib/components/Header.svelte';
  import WelcomeTour from '#lib/components/WelcomeTour.svelte';

  let { children }: { children: Snippet } = $props();
  // The welcome tour belongs to the calculator; content pages open straight away.
  const home = $derived(page.url.pathname.replace(/\/$/, '') === base);

  onMount(() => {
    app.load();
    const token = mon.cloudflareAnalyticsToken;
    if (token) {
      const s = document.createElement('script');
      s.defer = true;
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.dataset.cfBeacon = JSON.stringify({ token });
      document.head.appendChild(s);
    }
  });
</script>

<a class="skip" href="#main">{m.app.skip}</a>
<Header />
<main id="main">
  {@render children()}
</main>
<Footer />
{#if home}<WelcomeTour />{/if}
<About />
