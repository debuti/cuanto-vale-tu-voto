<script lang="ts">
  import { date, fmt, m } from '#lib/i18n';
  import { meta } from '#lib/core/data';
  import { CONTACT, VERSION, href } from '#lib/site';
  import { app } from '#lib/state.svelte';
  import ByNubuza from './ByNubuza.svelte';
  import Modal from './Modal.svelte';

  function tour() {
    app.aboutOpen = false;
    app.tourOpen = true;
  }
</script>

<Modal open={app.aboutOpen} onclose={() => (app.aboutOpen = false)} label={m.about.title}>
  <h2>{m.about.title}</h2>
  <p>{m.about.body}</p>
  <p class="neutral">{m.app.neutral}</p>
  <dl>
    <dt>{m.about.version}</dt>
    <dd data-testid="version">{VERSION}</dd>
    <dt>{m.about.contact}</dt>
    <dd><a href="mailto:{CONTACT}">{CONTACT}</a></dd>
  </dl>
  <p class="note">{fmt(m.about.data, { date: date(meta.updated) })}</p>
  <ul class="links">
    <li><a href={href('how-spain-votes/')}>{m.nav.basics}</a></li>
    <li><a href={href('methodology/')}>{m.nav.methodology}</a></li>
    <li><a href={href('faq/')}>{m.nav.faq}</a></li>
    <li><a href={href('privacy/')}>{m.nav.privacy}</a></li>
    <li><a href={href('terms/')}>{m.nav.terms}</a></li>
  </ul>
  <div class="actions">
    <button class="btn small" type="button" onclick={tour}>{m.about.tour}</button>
  </div>
  <div class="end">
    <ByNubuza />
    <button class="btn primary" type="button" onclick={() => (app.aboutOpen = false)}>{m.about.close}</button>
  </div>
</Modal>

<style>
  .neutral {
    background: var(--mint);
    border-radius: var(--radius-s);
    padding: 0.6rem 0.9rem;
    font-weight: 700;
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 1rem;
    margin: 0 0 0.75rem;
  }
  dt {
    font-weight: 800;
  }
  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.1rem;
    list-style: none;
    padding: 0;
  }
  .actions,
  .end {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
  }
  .end {
    justify-content: space-between;
    margin-top: 0.5rem;
  }
</style>
