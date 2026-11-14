<script lang="ts">
  import mon from '../../../monetization.config.json';
  import { m } from '#lib/i18n';
  import { SITE } from '#lib/site';

  let { title = '', description = m.app.description, path = '', jsonld = null }: { title?: string; description?: string; path?: string; jsonld?: object | null } = $props();
  const full = $derived(title ? `${title} · ${m.app.name}` : `${m.app.name} Calculadora del voto, elecciones generales 2026`);
  const url = $derived(`${SITE}/${path}`);
  const ld = $derived(jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</` + 'script>' : '');
</script>

<svelte:head>
  <title>{full}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={m.app.name} />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:title" content={full} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content="{SITE}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  {#if mon.adsense.client}<meta name="google-adsense-account" content={mon.adsense.client} />{/if}
  {@html ld}
</svelte:head>
