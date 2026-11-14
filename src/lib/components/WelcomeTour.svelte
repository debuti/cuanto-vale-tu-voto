<script lang="ts">
  import { fmt, m } from '#lib/i18n';
  import { app } from '#lib/state.svelte';
  import Modal from './Modal.svelte';
  import Urni from './Urni.svelte';

  let step = $state(0);
  const total = m.tour.steps.length;
  const moods = ['happy', 'think', 'think', 'wow'] as const;
  let js = $state(false);
  $effect(() => {
    js = true;
  });
  $effect(() => {
    if (app.tourOpen) step = 0;
  });
</script>

<Modal open={app.tourOpen} onclose={() => app.closeTour()} label={m.tour.title}>
  <div class="tour">
    <div class="top">
      <Urni size={88} mood={moods[step]} />
      <p class="note" aria-live="polite">{fmt(m.tour.progress, { n: step + 1, total })}</p>
    </div>
    <!-- Every step is in the HTML; only the current one is shown once scripts run. -->
    {#each m.tour.steps as s, i (i)}
      <section hidden={js && i !== step}>
        <h2>{s.title}</h2>
        <p>{s.body}</p>
      </section>
    {/each}
    <div class="dots" aria-hidden="true">
      {#each m.tour.steps as _, i (i)}<span class:on={i === step}></span>{/each}
    </div>
    <div class="actions">
      {#if step > 0}
        <button class="btn" type="button" onclick={() => step--}>{m.tour.prev}</button>
      {:else}
        <button class="btn ghost" type="button" onclick={() => app.closeTour()}>{m.tour.skip}</button>
      {/if}
      {#if step < total - 1}
        <button class="btn primary" type="button" onclick={() => step++}>{m.tour.next}</button>
      {:else}
        <button class="btn primary" type="button" onclick={() => app.closeTour()}>{m.tour.start}</button>
      {/if}
    </div>
  </div>
</Modal>

<style>
  .top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  h2 {
    margin-top: 0.5rem;
  }
  section p {
    font-size: 1.1rem;
  }
  .dots {
    display: flex;
    gap: 0.4rem;
    justify-content: center;
    margin: 0.75rem 0;
  }
  .dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--line);
  }
  .dots .on {
    background: var(--primary);
    width: 26px;
    border-radius: 6px;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
