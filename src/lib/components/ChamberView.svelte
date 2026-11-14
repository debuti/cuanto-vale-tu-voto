<script lang="ts">
  import { party } from '#lib/core/data';
  import { hemicycle } from '#lib/core/hemicycle';
  import { approx, fmt, m, num, pct } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  const s = $derived(app.scenario);
  const ch = $derived(app.effectiveChamber);
  const withSeats = $derived(s.national.filter((p) => p.seats > 0));
  const rows = $derived(
    s.national.filter((p) => p.seats > 0 || (app.option === 'party' && p.id === app.partyId && p.votes > 0))
  );
  const hemi = $derived(hemicycle(s.totalSeats));
  const colors = $derived(withSeats.flatMap((p) => Array<string>(p.seats).fill(p.id)));
  const majority = $derived(Math.floor(s.totalSeats / 2) + 1);
  const valid = $derived(s.constituencies.reduce((a, c) => a + c.valid, 0));
  const maxCost = $derived(Math.max(1, ...withSeats.map((p) => p.votes / p.seats)));
  const range = (id: string) => (app.projected && ch === 'congreso' ? app.sim?.national[id] : undefined);
  const n = (v: number) => (app.projected ? approx(v) : num(v));
  let hover = $state<string | null>(null);
  const lit = $derived(hover ?? (app.option === 'party' ? app.partyId : null));
  const litOn = $derived(!!lit && withSeats.some((p) => p.id === lit));
</script>

<section class="section" aria-labelledby="chamber-title">
  <h2 id="chamber-title">{(app.projected ? m.chamber.titleNow : m.chamber.titlePast)[ch]}</h2>
  <div class="card">
    <div class="layout">
      <figure>
        <svg viewBox="0 0 {hemi.w} {hemi.h}" role="img" aria-label="{(app.projected ? m.chamber.titleNow : m.chamber.titlePast)[ch]}. {fmt(m.chamber.majority, { n: majority })}">
          {#each hemi.seats as seat, i (i)}
            <circle
              cx={seat.x}
              cy={seat.y}
              r={hemi.r}
              fill={party(colors[i] ?? '').color}
              opacity={litOn && colors[i] !== lit ? 0.25 : 1}
              stroke="rgba(42,36,64,.3)"
              stroke-width="0.6"
            />
          {/each}
          <text x={hemi.w / 2} y={hemi.h - 44} text-anchor="middle" font-size="46" font-weight="600" fill="#2a2440" font-family="Fredoka Variable, sans-serif">
            {litOn ? (withSeats.find((p) => p.id === lit)?.seats ?? '') : s.totalSeats}
          </text>
          <text x={hemi.w / 2} y={hemi.h - 20} text-anchor="middle" font-size="17" font-weight="700" fill="#4f4868">
            {litOn ? party(lit ?? '').short : m.chamber.seats}
          </text>
        </svg>
        <figcaption class="pill">{fmt(m.chamber.majority, { n: majority })}</figcaption>
      </figure>

      <div class="scroll">
        <table class="data">
          <thead>
            <tr>
              <th scope="col">{m.chamber.table}</th>
              <th scope="col">{m.chamber.seats}</th>
              {#if ch === 'congreso'}
                <th scope="col" class="opt">{m.chamber.votes}</th>
                <th scope="col" class="opt">{m.chamber.pct}</th>
                <th scope="col">{m.chamber.perSeat}</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each rows as p (p.id)}
              {@const r = range(p.id)}
              <tr class:me={app.option === 'party' && p.id === app.partyId} onpointerenter={() => (hover = p.seats > 0 ? p.id : null)} onpointerleave={() => (hover = null)}>
                <td><span class="pn" title={party(p.id).name}><span class="dot" style:background={party(p.id).color}></span>{party(p.id).short}</span></td>
                <td>
                  <strong class="st">{p.seats}</strong>
                  {#if r && r[0] !== r[2]}<small>{fmt(m.chamber.range, { lo: r[0], hi: r[2] })}</small>{/if}
                </td>
                {#if ch === 'congreso'}
                  <td class="opt">{n(p.votes)}</td>
                  <td class="opt">{pct(p.votes / valid)}</td>
                  <td>
                    {#if p.seats > 0}
                      {n(p.votes / p.seats)}
                      <span class="cost" aria-hidden="true"><span style:width="{(100 * p.votes) / p.seats / maxCost}%"></span></span>
                    {:else}
                      <small>{m.chamber.others}</small>
                    {/if}
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {#if ch === 'congreso'}
      <p class="note">{m.chamber.perSeatLead}</p>
    {:else}
      <p class="note">{m.chamber.senateNote}</p>
      {#if app.projected}<p class="note">{m.result.senateModel}</p>{/if}
    {/if}
    <p class="note">{app.projected ? m.result.projectedNote : m.result.realNote}</p>
  </div>
</section>

<style>
  .layout {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 330px), 1fr));
    align-items: start;
    margin-bottom: 0.8rem;
  }
  figure {
    margin: 0;
    text-align: center;
    position: sticky;
    top: 80px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  circle {
    transition: opacity 0.2s;
  }
  .pn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 800;
  }
  .st {
    font-family: var(--font-title);
    font-size: 1.35rem;
    font-weight: 600;
  }
  td small {
    display: block;
    color: var(--muted);
    font-size: 0.78rem;
    white-space: nowrap;
  }
  .cost {
    display: block;
    height: 6px;
    margin-top: 3px;
    margin-left: auto;
    width: 100%;
    max-width: 120px;
  }
  .cost span {
    display: block;
    height: 100%;
    margin-left: auto;
    border-radius: 3px;
    background: #7a5ff0;
  }
  @media (max-width: 760px) {
    figure {
      position: static;
    }
  }
  @media (max-width: 560px) {
    .opt {
      display: none;
    }
  }
</style>
