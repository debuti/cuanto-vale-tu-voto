<script lang="ts">
  import { electorsPerSeat, weight } from '#lib/core/metrics';
  import { approx, dec, fmt, m } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  let all = $state(false);
  const s = $derived(app.scenario);
  const rows = $derived(
    [...s.constituencies].map((c) => ({ c, w: weight(c, s) })).sort((a, b) => b.w - a.w).map((r, i) => ({ ...r, rank: i + 1 }))
  );
  const max = $derived(rows[0]?.w ?? 1);
  const visible = $derived(all ? rows : rows.filter((r, i) => i < 5 || i >= rows.length - 5 || r.c.id === app.constituency.id));
  function pick(id: string, prov: string) {
    app.prov = prov;
    app.cons = id === prov ? '' : id;
  }
</script>

<section class="section" aria-labelledby="rank-title">
  <h2 id="rank-title">{m.ranking.title}</h2>
  <p class="lead">{m.ranking.lead}</p>
  <div class="card">
    <ol>
      {#each visible as r, i (r.c.id)}
        {#if i > 0 && r.rank - visible[i - 1].rank > 1}<li class="gap" aria-hidden="true">⋮</li>{/if}
        <li class:me={r.c.id === app.constituency.id}>
          <span class="rk">{r.rank}</span>
          <button type="button" class="name" onclick={() => pick(r.c.id, r.c.prov)}>
            {r.c.name}
            {#if r.c.id === app.constituency.id}<span class="pill">{m.ranking.you}</span>{/if}
          </button>
          <span class="bar" aria-hidden="true"><span style:width="{(100 * r.w) / max}%"></span></span>
          <span class="val"><strong>×{dec(r.w, r.w < 1 ? 2 : 1)}</strong><small>{fmt(m.ranking.voters, { n: approx(electorsPerSeat(r.c)) })}</small></span>
        </li>
      {/each}
    </ol>
    <p class="note">{m.ranking.col} {fmt(m.ranking.voters, { n: '…' })}</p>
    <button type="button" class="btn small" aria-expanded={all} onclick={() => (all = !all)}>{all ? m.ranking.showLess : m.ranking.showAll}</button>
  </div>
</section>

<style>
  ol {
    list-style: none;
    padding: 0;
    margin: 0 0 0.8rem;
  }
  li {
    display: grid;
    grid-template-columns: 2rem minmax(7rem, 13rem) 1fr 7.5rem;
    align-items: center;
    gap: 0.6rem;
    padding: 0.3rem 0.4rem;
    border-radius: 12px;
  }
  li.me {
    background: var(--primary-soft);
  }
  li.gap {
    display: block;
    text-align: center;
    color: var(--muted);
    padding: 0;
  }
  .rk {
    color: var(--muted);
    font-weight: 800;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .name {
    background: none;
    border: 0;
    padding: 0.3rem 0;
    text-align: left;
    font-weight: 800;
    cursor: pointer;
    min-height: 40px;
  }
  .name:hover {
    text-decoration: underline;
  }
  .bar {
    height: 14px;
  }
  .bar span {
    display: block;
    height: 100%;
    min-width: 4px;
    border-radius: 0 4px 4px 0;
    background: #7a5ff0;
  }
  .me .bar span {
    background: var(--primary);
  }
  .val {
    text-align: right;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }
  .val small {
    display: block;
    color: var(--muted);
    font-size: 0.78rem;
  }
  @media (max-width: 560px) {
    li {
      grid-template-columns: 1.6rem 1fr 6.5rem;
    }
    .bar {
      grid-column: 2 / 4;
      grid-row: 2;
      height: 10px;
    }
  }
</style>
