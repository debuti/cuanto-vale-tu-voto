<script lang="ts">
  import { onMount } from 'svelte';
  import { m, rich } from '#lib/i18n';
  import { SITE, href } from '#lib/site';
  import { app } from '#lib/state.svelte';
  import type { SimResult } from '#lib/core/montecarlo';
  import AdSlot from '#lib/components/AdSlot.svelte';
  import ChamberView from '#lib/components/ChamberView.svelte';
  import Picker from '#lib/components/Picker.svelte';
  import Ranking from '#lib/components/Ranking.svelte';
  import Result from '#lib/components/Result.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import SpainMap from '#lib/components/SpainMap.svelte';
  import Urni from '#lib/components/Urni.svelte';
  import ValueRank from '#lib/components/ValueRank.svelte';

  let mounted = $state(false);
  let worker: Worker | undefined;
  let job = 0;

  onMount(() => {
    mounted = true;
    worker = new Worker(new URL('../lib/core/sim.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; result: SimResult }>) => {
      if (e.data.id === job) app.sim = e.data.result;
    };
    return () => worker?.terminate();
  });

  // Simulations: only for the Congress forecast, recomputed (off the main thread) when the scenario moves.
  $effect(() => {
    if (!mounted) return;
    const s = app.scenario;
    if (!s.projected || s.chamber !== 'congreso') {
      job++;
      app.sim = null;
      return;
    }
    const input = { constituencies: s.constituencies.map(({ id, seats, blank, parties }) => ({ id, seats, blank, parties })) };
    const t = setTimeout(() => worker?.postMessage({ id: ++job, input }), 200);
    return () => clearTimeout(t);
  });

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: m.app.name,
    url: `${SITE}/`,
    description: m.app.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    inLanguage: 'es',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: 'nubuza', url: 'https://nubuza.com' }
  };
</script>

<Seo {jsonld} />

<div class="wrap">
  <section class="hero">
    <div>
      <h1>{m.hero.title}</h1>
      <p class="lead">{@html rich(m.hero.lead)}</p>
      <p class="neutral">🤝 {m.app.neutral}</p>
    </div>
    <Urni size={150} />
  </section>

  <Picker />
  <Result />
  <ValueRank />
  <SpainMap />
  <Ranking />
</div>
<AdSlot slot="main" />
<div class="wrap">
  <ChamberView />

  <section class="section more">
    <a class="btn primary" href={href('how-spain-votes/')}>🏛️ {m.nav.basics}</a>
    <a class="btn" href={href('methodology/')}>📐 {m.nav.methodology}</a>
    <a class="btn" href={href('faq/')}>💬 {m.nav.faq}</a>
  </section>
</div>

<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: clamp(1.2rem, 5vw, 2.5rem) 0 1.2rem;
  }
  .hero .lead {
    font-size: clamp(1.1rem, 3.5vw, 1.3rem);
  }
  .neutral {
    display: inline-block;
    background: var(--mint);
    border-radius: var(--radius-s);
    padding: 0.5rem 0.9rem;
    font-weight: 700;
    font-size: 0.95rem;
  }
  .more {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  @media (max-width: 640px) {
    .hero :global(.urni) {
      width: 84px;
      height: 84px;
      align-self: flex-start;
    }
  }
</style>
