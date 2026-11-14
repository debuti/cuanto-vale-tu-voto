<script lang="ts">
  import { onMount } from 'svelte';
  import mon from '../../../monetization.config.json';
  import { m } from '#lib/i18n';

  let { slot }: { slot: 'main' | 'footer' } = $props();
  const client = mon.adsense.client;
  const id = $derived((mon.adsense.slots as Record<string, string>)[slot] ?? '');

  onMount(() => {
    if (!client || !id) return;
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script');
      s.async = true;
      s.src = src;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
    const w = window as unknown as { adsbygoogle?: unknown[] };
    (w.adsbygoogle = w.adsbygoogle ?? []).push({});
  });
</script>

{#if client && id}
  <aside class="ad wrap" aria-label={m.ad}>
    <p class="note">{m.ad}</p>
    <ins class="adsbygoogle" style="display:block" data-ad-client={client} data-ad-slot={id} data-ad-format="auto" data-full-width-responsive="true"></ins>
  </aside>
{/if}

<style>
  .ad {
    margin-block: 3rem;
    padding-block: 1rem;
    border-block: 1px dashed var(--line);
    text-align: center;
    min-height: 140px;
  }
</style>
