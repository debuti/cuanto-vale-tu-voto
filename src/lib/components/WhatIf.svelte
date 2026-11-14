<script lang="ts">
  import { party } from '#lib/core/data';
  import { SYSTEMS, recount, type SystemId } from '#lib/core/whatif';
  import { m } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  let system = $state<SystemId>('nacional');
  const cons = $derived(app.scenario.constituencies);
  const base = $derived(recount(cons, 'actual'));
  const alt = $derived(recount(cons, system));
  const rows = $derived.by(() => {
    const a = new Map(alt.map((p) => [p.id, p.seats]));
    const b = new Map(base.map((p) => [p.id, p.seats]));
    return [...new Set([...b.keys(), ...a.keys()])]
      .map((id) => ({ id, now: b.get(id) ?? 0, then: a.get(id) ?? 0 }))
      .filter((r) => r.now > 0 || r.then > 0)
      .sort((x, y) => y.then - x.then || y.now - x.now);
  });
  const max = $derived(Math.max(1, ...rows.map((r) => Math.max(r.now, r.then))));
</script>

<section class="section" aria-labelledby="whatif-title">
  <h2 id="whatif-title">{m.whatif.title}</h2>
  <p class="lead">{m.whatif.lead}</p>
  <div class="card">
    <div class="choices" role="group" aria-label={m.whatif.title}>
      {#each SYSTEMS.filter((x) => x !== 'actual') as id (id)}
        <button type="button" class="choice" aria-pressed={system === id} onclick={() => (system = id)}>
          {m.whatif.systems[id].name}
          <small>{m.whatif.systems[id].hint}</small>
        </button>
      {/each}
    </div>
    <div class="scroll">
      <table class="data">
        <thead>
          <tr>
            <th scope="col">{m.chamber.table}</th>
            <th scope="col">{m.whatif.systems.actual.name}</th>
            <th scope="col">{m.whatif.systems[system].name}</th>
            <th scope="col">{m.whatif.diff}</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as r (r.id)}
            <tr class:me={app.option === 'party' && r.id === app.partyId}>
              <td><span class="pn"><span class="dot" style:background={party(r.id).color}></span>{party(r.id).short}</span></td>
              <td>{r.now}</td>
              <td>
                <strong>{r.then}</strong>
                <span class="bars" aria-hidden="true">
                  <span class="b0" style:width="{(100 * r.now) / max}%"></span>
                  <span class="b1" style:width="{(100 * r.then) / max}%"></span>
                </span>
              </td>
              <td class="diff">
                {#if r.then > r.now}▲ +{r.then - r.now}{:else if r.then < r.now}▼ −{r.now - r.then}{:else}<small>{m.whatif.same}</small>{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="legend note" aria-hidden="true">
      <span class="sw b0"></span>{m.whatif.systems.actual.name}
      <span class="sw b1"></span>{m.whatif.systems[system].name}
    </p>
  </div>
</section>

<style>
  .choices {
    margin-bottom: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }
  .pn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 800;
  }
  thead th {
    max-width: 9rem;
  }
  .bars {
    display: grid;
    gap: 2px;
    margin-top: 3px;
    margin-left: auto;
    max-width: 180px;
  }
  .bars span {
    height: 6px;
    border-radius: 3px;
    min-width: 2px;
    margin-left: auto;
  }
  .b0 {
    background: #b9b1c9;
  }
  .b1 {
    background: var(--primary);
  }
  .diff {
    font-weight: 800;
    white-space: nowrap;
  }
  .diff small {
    font-weight: 600;
    color: var(--muted);
  }
  .legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.8rem;
  }
  .sw {
    display: inline-block;
    width: 22px;
    height: 8px;
    border-radius: 4px;
    margin-left: 0.6rem;
  }
</style>
