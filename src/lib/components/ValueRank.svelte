<script lang="ts">
  import { party } from '#lib/core/data';
  import { valueRanking } from '#lib/core/value';
  import { approx, dec, fmt, m, num, rich } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  const TOP = 10;
  const MORE = 30;
  let more = $state(false);
  const rows = $derived(valueRanking(app.scenario).map((r, i) => ({ ...r, rank: i + 1 })));
  const mine = $derived(
    app.option === 'party' && app.party ? rows.find((r) => r.cons.id === app.constituency.id && r.party === app.partyId) : undefined
  );
  const visible = $derived(rows.filter((r) => r.rank <= (more ? MORE : TOP) || r === mine));
  const n = (v: number) => (app.projected ? approx(v) : num(v));
  function pick(r: (typeof rows)[number]) {
    app.prov = r.cons.prov;
    app.cons = r.cons.id === r.cons.prov ? '' : r.cons.id;
    app.option = 'party';
    app.party = r.party;
  }
</script>

<section class="section" aria-labelledby="value-title">
  <h2 id="value-title">🏆 {m.value.title}</h2>
  <p class="lead">{m.value.lead}</p>
  <div class="card">
    {#if mine}<p class="yours">{@html rich(fmt(m.value.yours, { rank: mine.rank, total: rows.length }))}</p>{/if}
    <ol>
      {#each visible as r, i (r.cons.id + r.party)}
        {#if i > 0 && r.rank - visible[i - 1].rank > 1}<li class="gap" aria-hidden="true">⋮</li>{/if}
        <li class:me={r === mine}>
          <button type="button" onclick={() => pick(r)}>
            <span class="rk">{r.rank}</span>
            <span class="who">
              <strong><span class="dot" style:background={party(r.party).color}></span>{r.cons.name} · {party(r.party).short}</strong>
              <small>{@html rich(fmt(m.value.margin, { n: n(r.margin) }))} · ×{dec(r.weight, r.weight < 1 ? 2 : 1)}</small>
              {#if r === mine}<span class="pill">{m.value.you}</span>{/if}
            </span>
            <span class="score"><strong>{r.index}</strong><small>{m.value.score}</small></span>
          </button>
        </li>
      {/each}
    </ol>
    <button type="button" class="btn small" aria-expanded={more} onclick={() => (more = !more)}>
      {more ? m.value.showLess : fmt(m.value.showMore, { n: MORE })}
    </button>
    <p class="note">{m.value.note} {app.projected ? app.projectedNote : m.result.realNote}</p>
  </div>
</section>

<style>
  ol {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: grid;
    gap: 0.4rem;
  }
  li button {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    min-height: 56px;
    padding: 0.5rem 0.8rem;
    border: 2px solid var(--line);
    border-radius: var(--radius-s);
    background: var(--card);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  li button:hover {
    border-color: var(--primary);
  }
  li.me button {
    background: var(--primary-soft);
    border-color: var(--primary);
  }
  .gap {
    text-align: center;
    color: var(--muted);
  }
  .rk {
    flex: 0 0 2.2rem;
    font-family: var(--font-title);
    font-size: 1.4rem;
    font-weight: 600;
    text-align: center;
  }
  li:nth-child(-n + 3):not(.me) .rk {
    color: var(--warn);
  }
  .who {
    flex: 1;
    min-width: 0;
    line-height: 1.3;
  }
  .who strong {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .who .pill {
    display: inline-block;
    margin-top: 0.25rem;
  }
  .who small {
    display: block;
    color: var(--ink-2);
    font-size: 0.88rem;
  }
  .score {
    text-align: right;
    line-height: 1.1;
  }
  .score strong {
    display: block;
    font-family: var(--font-title);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary);
  }
  .score small {
    color: var(--muted);
    font-size: 0.75rem;
  }
  .yours {
    font-size: 1.15rem;
  }
</style>
