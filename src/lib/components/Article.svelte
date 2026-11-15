<script lang="ts">
  import type { Page } from '#lib/content/es';
  import { m, rich } from '#lib/i18n';
  import { SITE, href } from '#lib/site';
  import Diagram from './Diagram.svelte';
  import Seo from './Seo.svelte';
  import Urni from './Urni.svelte';

  let { page, path, faq = false }: { page: Page; path: string; faq?: boolean } = $props();
  const jsonld = $derived(
    faq
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: page.sections.map((s) => ({
            '@type': 'Question',
            name: s.h,
            acceptedAnswer: { '@type': 'Answer', text: s.body.join(' ').replace(/\*\*/g, '') }
          }))
        }
      : { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, url: `${SITE}/${path}`, inLanguage: 'es' }
  );
  // Groups consecutive "- " lines into one list.
  const blocks = (body: string[]) =>
    body.reduce<(string | string[])[]>((out, line) => {
      const last = out[out.length - 1];
      if (line.startsWith('- ')) {
        if (Array.isArray(last)) last.push(line.slice(2));
        else out.push([line.slice(2)]);
      } else out.push(line);
      return out;
    }, []);
</script>

<Seo title={page.title} description={page.description} {path} {jsonld} />

<article class="wrap prose">
  <p><a href={href()}>← {m.nav.back}</a></p>
  <header>
    <Urni size={72} mood="think" />
    <h1>{page.title}</h1>
  </header>
  <p class="lead">{page.intro}</p>
  {#if page.related}<p><a class="btn" href={href(page.related.path)}>{page.related.label}</a></p>{/if}
  {#each page.sections as s (s.h)}
    <section>
      <h2>{s.h}</h2>
      {#each blocks(s.body) as b, i (i)}
        {#if Array.isArray(b)}
          <ul>
            {#each b as li (li)}<li>{@html rich(li)}</li>{/each}
          </ul>
        {:else}
          <p>{@html rich(b)}</p>
        {/if}
      {/each}
      {#if s.fig}<Diagram fig={s.fig} />{/if}
    </section>
  {/each}
  <p><a class="btn primary" href={href()}>{m.nav.back}</a></p>
</article>

<style>
  article {
    padding-top: 1.5rem;
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  h1 {
    font-size: clamp(1.9rem, 6vw, 2.6rem);
    margin: 0;
  }
</style>
