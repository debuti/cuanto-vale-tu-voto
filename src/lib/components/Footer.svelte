<script lang="ts">
  import { m } from '#lib/i18n';
  import { href } from '#lib/site';
  import AdSlot from './AdSlot.svelte';
  import ByNubuza from './ByNubuza.svelte';
</script>

<AdSlot slot="footer" />
<footer>
  <div class="wrap">
    <p class="neutral">{m.app.neutral}</p>
    <nav aria-label={m.nav.about}>
      <a href={href()}>{m.nav.home}</a>
      <a href={href('how-spain-votes/')}>{m.nav.basics}</a>
      <a href={href('methodology/')}>{m.nav.methodology}</a>
      <a href={href('faq/')}>{m.nav.faq}</a>
      <a href={href('privacy/')}>{m.nav.cookies}</a>
      <a href={href('terms/')}>{m.nav.terms}</a>
    </nav>
    <p class="note">{m.footer.sources}</p>
    <p class="note">{m.footer.rights}</p>
    <ByNubuza />
  </div>
</footer>

<style>
  footer {
    margin-top: 3rem;
    padding: 2rem 0 3rem;
    border-top: 2px solid var(--line);
    background: rgba(255, 255, 255, 0.6);
  }
  .neutral {
    font-weight: 800;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 1.2rem;
    margin-bottom: 1rem;
  }
  nav a {
    padding-block: 0.4rem;
    font-weight: 700;
  }
</style>
