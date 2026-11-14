<script lang="ts">
  import { ELECTIONS, PROVINCE_CODES, party, provinces } from '#lib/core/data';
  import { hasSenate } from '#lib/core/scenario';
  import { fmt, m } from '#lib/i18n';
  import { app, type VoteOption } from '#lib/state.svelte';

  const OPTIONS: { id: VoteOption; icon: string }[] = [
    { id: 'party', icon: '🗳️' },
    { id: 'blank', icon: '✉️' },
    { id: 'null', icon: '✖️' },
    { id: 'abstain', icon: '🏠' }
  ];
  const SHOWN = 8;
  let all = $state(false);

  // The joint Senate list only exists in the Senate of 2026.
  function choose(set: () => void) {
    set();
    if (app.party === 'sdp' && !(app.election === 'e2026' && app.chamber === 'senado')) app.party = '';
  }

  const place = $derived(app.constituency.name);
  const ids = $derived(app.choices);
  const visible = $derived(all || ids.length <= SHOWN + 1 ? ids : ids.filter((id, i) => i < SHOWN || id === app.partyId));
</script>

<div class="card picker">
  <fieldset class="setup">
    <legend>{m.steps.election}</legend>
    <div class="choices compact">
      {#each ELECTIONS as e (e.id)}
        <button type="button" class="choice" aria-pressed={app.election === e.id} onclick={() => choose(() => (app.election = e.id))}>
          {m.elections[e.id].short}
          <small>{m.elections[e.id].tag}</small>
        </button>
      {/each}
    </div>
  </fieldset>
  <fieldset class="setup">
    <legend>{m.steps.chamber}</legend>
    <div class="choices compact two">
      {#each ['congreso', 'senado'] as const as c (c)}
        <button type="button" class="choice" aria-pressed={app.chamber === c} onclick={() => choose(() => (app.chamber = c))}>
          {m.chambers[c]}
          <small>{m.chambers[`${c}Hint`]}</small>
        </button>
      {/each}
    </div>
    {#if app.chamber === 'senado' && !hasSenate(app.election)}
      <p class="warn" role="status">{m.chambers.senadoMissing}</p>
    {/if}
  </fieldset>

  <section class="step">
    <h2><span class="n" aria-hidden="true">1</span><label for="prov">{m.steps.where}</label></h2>
    <select id="prov" class="big" bind:value={app.prov} onchange={() => (app.cons = '')}>
      {#each PROVINCE_CODES as code (code)}
        <option value={code}>{provinces[code].name}</option>
      {/each}
    </select>
    <p class="note">{m.steps.whereHint}</p>
    {#if app.local.length > 1}
      <label class="sub" for="island">{m.steps.island}</label>
      <select id="island" class="big" value={app.constituency.id} onchange={(e) => (app.cons = e.currentTarget.value)}>
        {#each app.local as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
    {/if}
  </section>

  <section class="step">
    <h2><span class="n" aria-hidden="true">2</span>{app.projected ? m.steps.what : m.steps.whatPast}</h2>
    <div class="choices" role="group" aria-label={app.projected ? m.steps.what : m.steps.whatPast}>
      {#each OPTIONS as o (o.id)}
        <button type="button" class="choice opt" aria-pressed={app.option === o.id} onclick={() => (app.option = o.id)}>
          <span class="ico" aria-hidden="true">{o.icon}</span>
          <span>{m.options[o.id].title}<small>{m.options[o.id].hint}</small></span>
        </button>
      {/each}
    </div>
  </section>

  {#if app.option === 'party'}
    <section class="step">
      <h2><span class="n" aria-hidden="true">3</span>{m.steps.which}</h2>
      <p class="note">{fmt(app.projected ? m.steps.whichHint : m.steps.whichHintPast, { place })}</p>
      <div class="parties" role="group" aria-label={m.steps.which}>
        {#each visible as id (id)}
          <button type="button" class="chip" aria-pressed={app.partyId === id} title={party(id).name} onclick={() => (app.party = id)}>
            <span class="dot" style:background={party(id).color}></span>
            {party(id).short}
          </button>
        {/each}
      </div>
      {#if ids.length > SHOWN + 1}
        <button type="button" class="btn small more" aria-expanded={all} onclick={() => (all = !all)}>
          {all ? m.steps.showLess : fmt(m.steps.showAll, { n: ids.length })}
        </button>
      {/if}
    </section>
  {/if}
</div>

<style>
  fieldset {
    border: 0;
    padding: 0;
    margin: 0 0 1rem;
    min-width: 0;
  }
  legend {
    font-weight: 800;
    color: var(--ink-2);
    padding: 0;
    margin-bottom: 0.4rem;
  }
  .compact {
    grid-template-columns: repeat(4, 1fr);
  }
  .compact.two {
    grid-template-columns: repeat(2, 1fr);
  }
  .compact .choice {
    min-height: 56px;
    padding: 0.5rem 0.75rem;
  }
  @media (max-width: 640px) {
    .compact {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .warn {
    background: var(--sun);
    border-radius: var(--radius-s);
    padding: 0.6rem 0.9rem;
    margin-top: 0.6rem;
    font-weight: 700;
  }
  .step {
    border-top: 2px dashed var(--line);
    padding-top: 1.1rem;
    margin-top: 1.1rem;
  }
  .step h2 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: clamp(1.3rem, 4.5vw, 1.7rem);
    margin-bottom: 0.7rem;
  }
  .n {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    flex: none;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    font-size: 1.2rem;
  }
  .sub {
    display: block;
    font-weight: 800;
    margin: 0.6rem 0 0.3rem;
  }
  .note {
    margin: 0.4rem 0 0;
  }
  .opt {
    flex-direction: row;
    align-items: center;
    gap: 0.7rem;
    min-height: 76px;
  }
  .opt span:last-child {
    display: flex;
    flex-direction: column;
  }
  .ico {
    font-size: 1.6rem;
  }
  .parties {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.7rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 48px;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: 2px solid var(--line);
    background: #fff;
    font-weight: 800;
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--primary);
  }
  .chip[aria-pressed='true'] {
    border-color: var(--primary);
    background: var(--primary-soft);
    box-shadow: inset 0 0 0 2px var(--primary);
  }
  .more {
    margin-top: 0.8rem;
  }
</style>
