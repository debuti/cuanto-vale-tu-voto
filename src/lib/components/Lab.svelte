<script lang="ts">
  import { onMount } from 'svelte';
  import { meta, party } from '#lib/core/data';
  import { pollsters } from '#lib/core/polls';
  import { date, dec, fmt, m } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  const firms = pollsters();
  const main = $derived(
    Object.entries(app.pollBase.shares).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id)
  );
  let frozen = $state(false);
  onMount(() => {
    frozen = new Date().toISOString().slice(0, 10) >= '2026-11-24';
  });
  function nudge(id: string, d: number) {
    const v = Math.round(((app.nudges[id] ?? 0) + d) * 2) / 2;
    if (Math.abs(v) <= 10 && (app.pollBase.shares[id] ?? 0) + v >= 0) app.nudges = { ...app.nudges, [id]: v };
  }
</script>

<section class="section" aria-labelledby="lab-title">
  <h2 id="lab-title">🧪 {m.lab.title}</h2>
  <p class="lead">{m.lab.lead}</p>
  <div class="card">
    <div class="cols">
      <div>
        <label for="pollster">{m.lab.source}</label>
        <select id="pollster" class="big" bind:value={app.pollster} onchange={() => (app.nudges = {})}>
          <option value="avg">{fmt(m.lab.average, { n: firms.length })}</option>
          {#each firms as f (f)}<option value={f}>{f}</option>{/each}
        </select>

        <label for="turnout">{m.lab.turnout}</label>
        <input id="turnout" type="range" min="-10" max="10" step="1" bind:value={app.turnout} aria-valuetext={app.turnout === 0 ? m.lab.turnoutSame : fmt(m.lab.turnoutValue, { sign: app.turnout > 0 ? '+' : '−', n: Math.abs(app.turnout) })} />
        <p class="val" aria-hidden="true">
          {app.turnout === 0 ? m.lab.turnoutSame : fmt(m.lab.turnoutValue, { sign: app.turnout > 0 ? '+' : '−', n: Math.abs(app.turnout) })}
        </p>
      </div>
      <fieldset>
        <legend>{m.lab.nudge}</legend>
        <ul>
          {#each main as id (id)}
            <li>
              <span class="pn"><span class="dot" style:background={party(id).color}></span>{party(id).short}</span>
              <button type="button" class="step" onclick={() => nudge(id, -0.5)} aria-label="− {party(id).short}">−</button>
              <output>{fmt(m.lab.nudgeValue, { pct: dec(app.shares[id] ?? 0, 1) })}</output>
              <button type="button" class="step" onclick={() => nudge(id, 0.5)} aria-label="+ {party(id).short}">+</button>
            </li>
          {/each}
        </ul>
      </fieldset>
    </div>
    {#if app.modified}
      <button type="button" class="btn primary" onclick={() => app.resetLab()}>↺ {m.lab.reset}</button>
    {/if}
    {#if frozen}<p class="frozen">{m.lab.blackout}</p>{/if}
    <p class="note">{m.lab.sources} {fmt(m.lab.updated, { date: date(meta.lastPoll), updated: date(meta.updated) })}</p>
  </div>
</section>

<style>
  .cols {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    margin-bottom: 1rem;
  }
  label,
  legend {
    display: block;
    font-weight: 800;
    margin: 0 0 0.35rem;
    padding: 0;
  }
  label[for='turnout'] {
    margin-top: 1.1rem;
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
  }
  input[type='range'] {
    width: 100%;
    height: 44px;
    accent-color: var(--primary);
  }
  .val {
    font-weight: 800;
    margin: 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.45rem;
  }
  li {
    display: grid;
    grid-template-columns: 1fr 48px 8.2rem 48px;
    align-items: center;
    gap: 0.4rem;
  }
  .pn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 800;
    min-width: 0;
  }
  output {
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }
  .step {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--ink);
    background: #fff;
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 2px 0 var(--ink);
  }
  .step:active {
    transform: translateY(2px);
    box-shadow: none;
  }
  .frozen {
    background: var(--sun);
    border-radius: var(--radius-s);
    padding: 0.7rem 1rem;
    font-weight: 700;
    margin-top: 0.8rem;
  }
  .note {
    margin-top: 0.8rem;
  }
</style>
