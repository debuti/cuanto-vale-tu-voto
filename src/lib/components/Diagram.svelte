<script lang="ts">
  import type { Fig } from '#lib/content/es';
  import { allocate } from '#lib/core/allocate';
  import { fmt, m, num, rich } from '#lib/i18n';

  let { fig }: { fig: Fig } = $props();
  const COLORS = ['#5b3fd6', '#e8590c', '#1f7a4d', '#b0257a', '#6a6382'];

  const dh = $derived.by(() => {
    if (fig.kind !== 'dhondt') return null;
    const votes = fig.parties.map((p) => p.votes);
    const valid = votes.reduce((a, b) => a + b, 0);
    const seats = allocate(votes, fig.seats, { blank: 0 });
    return fig.parties.map((p, i) => ({
      ...p,
      seats: seats[i],
      out: p.votes < 0.03 * valid,
      q: Array.from({ length: fig.seats }, (_, k) => ({ v: p.votes / (k + 1), win: k < seats[i] }))
    }));
  });
  // Only the columns where some list wins a seat.
  const cols = $derived(Math.max(1, ...(dh ?? []).map((p) => p.seats)));
</script>

{#if fig.kind === 'flow'}
  <ol class="flow">
    {#each fig.steps as s, i (i)}
      <li class:alt={s.alt}>
        <span class="ico" aria-hidden="true">{s.icon}</span>
        <div>
          {#if s.tag}<span class="tag">{s.tag}</span>{/if}
          <strong>{s.t}</strong>
          <p>{s.d}</p>
        </div>
      </li>
    {/each}
  </ol>
{:else if fig.kind === 'cards'}
  <div class="cards">
    {#each fig.cards as c (c.t)}
      <div class="fc">
        <span class="ico" aria-hidden="true">{c.icon}</span>
        <h3>{c.t}</h3>
        <ul>
          {#each c.lines as l (l)}<li>{@html rich(l)}</li>{/each}
        </ul>
      </div>
    {/each}
  </div>
{:else if fig.kind === 'split'}
  <div class="split">
    <div class="strip" aria-hidden="true">
      {#each fig.parts as p, i (p.label)}
        <span style:flex={p.n} style:background={COLORS[i]}></span>
      {/each}
    </div>
    <ul>
      {#each fig.parts as p, i (p.label)}
        <li><span class="sw" style:background={COLORS[i]}></span><strong>{p.n}</strong> {p.label}</li>
      {/each}
      <li class="sum"><strong>= {fig.total}</strong> {fig.unit}</li>
    </ul>
  </div>
{:else if fig.kind === 'dhondt' && dh}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="scroll" role="region" aria-label={fig.caption} tabindex="0">
    <table class="data dh">
      <caption>{fig.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{fig.head.party}</th>
          {#each { length: cols } as _, k (k)}<th scope="col">{k ? `÷ ${k + 1}` : fig.head.votes}</th>{/each}
          <th scope="col">{fig.head.seats}</th>
        </tr>
      </thead>
      <tbody>
        {#each dh as p (p.name)}
          <tr>
            <th scope="row">{p.name}</th>
            {#if p.out}
              <td colspan={cols} class="out">{fig.head.out}</td>
            {:else}
              {#each p.q.slice(0, cols) as q, k (k)}<td class:win={q.win}>{num(Math.round(q.v))}{q.win ? ' 🪑' : ''}</td>{/each}
            {/if}
            <td><strong>{p.seats}</strong></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="moral">💡 {fig.moral}</p>
{:else if fig.kind === 'bars'}
  <ul class="bars">
    {#each fig.rows as r (r.label)}
      <li>
        <div class="bh"><strong>{r.label}</strong><span class="num">{r.n ?? r.open}</span></div>
        <div class="track" aria-hidden="true">
          {#if r.n}<span style:width="{(100 * r.n) / fig.total}%"></span>{:else}<span class="open"></span>{/if}
          <i></i>
        </div>
        <p>{r.what}</p>
      </li>
    {/each}
    <li class="legend" aria-hidden="true"><i></i> {fig.mark}: {fmt(m.units.outOf, { a: fig.total / 2, b: fig.total })}</li>
  </ul>
{/if}

<style>
  .flow {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    gap: 1.6rem;
  }
  .flow li {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
    background: var(--card);
    border: 3px solid var(--primary);
    border-radius: var(--radius-s);
    padding: 0.8rem 1rem;
    margin: 0;
  }
  .flow li + li::before {
    content: '▼';
    position: absolute;
    top: -1.55rem;
    left: 1.6rem;
    color: var(--primary);
    font-size: 1.1rem;
  }
  .flow li.alt {
    border-color: var(--warn);
    border-style: dashed;
    background: var(--peach);
  }
  .flow li.alt::before {
    content: 'o';
    color: var(--warn);
    font-weight: 800;
  }
  .ico {
    font-size: 2rem;
    line-height: 1.1;
  }
  .flow strong {
    display: block;
    font-family: var(--font-title);
    font-weight: 600;
    font-size: 1.2rem;
  }
  .flow p {
    margin: 0.15rem 0 0;
  }
  .tag {
    display: inline-block;
    background: var(--primary);
    color: #fff;
    border-radius: 999px;
    padding: 0.05rem 0.7rem;
    font-size: 0.85rem;
    font-weight: 800;
    margin-bottom: 0.2rem;
  }
  .alt .tag {
    background: var(--warn);
  }
  .cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    margin: 1rem 0;
  }
  .fc {
    background: var(--card);
    border: 3px solid var(--line);
    border-radius: var(--radius);
    padding: 1rem 1.1rem;
  }
  .fc h3 {
    margin: 0.2rem 0 0.4rem;
    font-size: 1.25rem;
  }
  .fc ul {
    margin: 0;
    padding-left: 1.1rem;
  }
  .split .strip,
  .track {
    display: flex;
    height: 30px;
    border-radius: 15px;
    overflow: hidden;
    gap: 2px;
  }
  .split .strip span {
    min-width: 6px;
  }
  .split ul {
    list-style: none;
    padding: 0;
    margin: 0.7rem 0 1rem;
  }
  .split li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .split li.sum {
    margin-top: 0.3rem;
    font-size: 1.15rem;
  }
  .sw {
    flex: 0 0 18px;
    height: 18px;
    border-radius: 5px;
  }
  .dh caption {
    text-align: left;
    white-space: normal;
    font-weight: 800;
    margin-bottom: 0.4rem;
  }
  .dh td,
  .dh th {
    white-space: nowrap;
    padding: 0.55rem 0.4rem;
    font-size: 0.92rem;
  }
  .dh td.win {
    background: var(--mint);
    font-weight: 800;
  }
  .dh td.out {
    text-align: center;
    color: var(--muted);
    background: repeating-linear-gradient(45deg, transparent 0 8px, rgba(0, 0, 0, 0.04) 8px 16px);
  }
  .moral {
    background: var(--sun);
    border-radius: var(--radius-s);
    padding: 0.8rem 1rem;
  }
  .bars {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    gap: 1.1rem;
  }
  .bars li {
    margin: 0;
  }
  .bh {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }
  .bh strong {
    font-family: var(--font-title);
    font-weight: 600;
    font-size: 1.2rem;
  }
  .num {
    font-family: var(--font-title);
    font-weight: 600;
    font-size: 1.4rem;
    color: var(--primary);
    text-align: right;
  }
  .track {
    position: relative;
    background: var(--line);
    overflow: visible;
  }
  .track span {
    border-radius: 15px;
    background: var(--primary);
  }
  .track span.open {
    width: 100%;
    background: repeating-linear-gradient(45deg, #cfc6f5 0 10px, #e4defb 10px 20px);
  }
  .track i,
  .legend i {
    background: var(--ink);
    border-radius: 2px;
  }
  .track i {
    position: absolute;
    left: 50%;
    top: -5px;
    bottom: -5px;
    width: 4px;
    margin-left: -2px;
    box-shadow: 0 0 0 2px #fff;
  }
  .bars p {
    margin: 0.4rem 0 0;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .legend i {
    width: 4px;
    height: 20px;
  }
</style>
