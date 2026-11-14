<script lang="ts">
  import map from '#lib/data/map.json';
  import { party, provinces } from '#lib/core/data';
  import { approx, count, dec, fmt, m } from '#lib/i18n';
  import { app } from '#lib/state.svelte';

  type Mode = 'weight' | 'winner' | 'party';
  type Shape = { d: string; cx: number; cy: number; tiny?: boolean };
  const shapes = map.provinces as Record<string, Shape>;
  const codes = Object.keys(shapes).sort();
  const [ix, iy, iw, ih] = map.inset;

  let mode = $state<Mode>('weight');
  let hover = $state<string | null>(null);
  let tip = $state({ x: 0, y: 0 });
  const hasParty = $derived(app.option === 'party' && !!app.party);
  const shown = $derived<Mode>(mode === 'party' && !hasParty ? 'weight' : mode);

  // The Senate has islands: the map adds them up by province.
  const byProv = $derived.by(() => {
    const out: Record<string, { seats: number; census: number; tally: Record<string, { votes: number; seats: number }> }> = {};
    for (const c of app.scenario.constituencies) {
      const o = (out[c.prov] ??= { seats: 0, census: 0, tally: {} });
      o.seats += c.seats;
      o.census += c.census;
      for (const p of c.parties) {
        const t = (o.tally[p.id] ??= { votes: 0, seats: 0 });
        t.votes += p.votes;
        t.seats += p.seats;
      }
    }
    return out;
  });
  const avg = $derived(app.scenario.totalCensus / app.scenario.totalSeats);
  const weightOf = (code: string) => avg / (byProv[code].census / byProv[code].seats);
  const winnerOf = (code: string) =>
    Object.entries(byProv[code].tally).sort((a, b) => b[1].seats - a[1].seats || b[1].votes - a[1].votes)[0]?.[0] ?? '';
  const seatsOf = (code: string) => byProv[code].tally[app.partyId]?.seats ?? 0;
  const ext = $derived.by(() => {
    const w = codes.map(weightOf);
    return { min: Math.min(...w), max: Math.max(...w), seats: Math.max(1, ...codes.map(seatsOf)) };
  });

  // One hue, light to dark (sequential).
  const RAMP = [
    [222, 213, 255],
    [155, 132, 240],
    [58, 28, 158]
  ];
  function ramp(t: number): string {
    const x = Math.min(1, Math.max(0, t)) * 2;
    const i = Math.min(1, Math.floor(x));
    const f = x - i;
    return `rgb(${RAMP[i].map((v, k) => Math.round(v + (RAMP[i + 1][k] - v) * f)).join(',')})`;
  }
  function mix(hex: string, t: number): string {
    const n = parseInt(hex.slice(1), 16);
    const rgb = [n >> 16, (n >> 8) & 255, n & 255];
    return `rgb(${rgb.map((v) => Math.round(244 + (v - 244) * t)).join(',')})`;
  }
  function fill(code: string): string {
    if (shown === 'weight') return ramp((Math.log(weightOf(code)) - Math.log(ext.min)) / (Math.log(ext.max) - Math.log(ext.min) || 1));
    if (shown === 'winner') return party(winnerOf(code)).color;
    const s = seatsOf(code);
    return s === 0 ? '#f1ece3' : mix(party(app.partyId).color, 0.3 + (0.7 * s) / ext.seats);
  }
  const winners = $derived([...new Set(codes.map(winnerOf))].filter(Boolean));

  function describe(code: string): string {
    const p = byProv[code];
    const lines = [
      fmt(m.map.tipSeats, { seats: count(m.units.seat, p.seats), eps: approx(p.census / p.seats) }),
      fmt(m.map.tipWeight, { w: dec(weightOf(code), weightOf(code) < 1 ? 2 : 1) })
    ];
    const w = winnerOf(code);
    if (w) lines.push(fmt(m.map.tipWinner, { party: party(w).short }));
    if (hasParty) lines.push(fmt(m.map.tipParty, { party: party(app.partyId).short, seats: count(m.units.seat, seatsOf(code)) }));
    return lines.join(' · ');
  }
  function pick(code: string) {
    app.prov = code;
    app.cons = '';
  }
  function move(e: PointerEvent, code: string) {
    if (e.pointerType !== 'mouse') return;
    hover = code;
    const box = (e.currentTarget as SVGElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    tip = { x: e.clientX - box.left, y: e.clientY - box.top };
  }
  const focus = $derived(hover ?? app.prov);
  const order = $derived([...codes.filter((c) => c !== app.prov), app.prov]);
</script>

<section class="section" aria-labelledby="map-title">
  <h2 id="map-title">{m.map.title}</h2>
  <p class="lead">{m.map.lead}</p>
  <div class="card">
    <div class="modes" role="group" aria-label={m.map.title}>
      <button type="button" class="choice" aria-pressed={shown === 'weight'} onclick={() => (mode = 'weight')}>⚖️ {m.map.modes.weight}</button>
      <button type="button" class="choice" aria-pressed={shown === 'winner'} onclick={() => (mode = 'winner')}>🏆 {m.map.modes.winner}</button>
      {#if hasParty}
        <button type="button" class="choice" aria-pressed={shown === 'party'} onclick={() => (mode = 'party')}>
          <span><span class="dot" style:background={party(app.partyId).color}></span> {fmt(m.map.modes.party, { party: party(app.partyId).short })}</span>
        </button>
      {/if}
    </div>

    <div class="stage">
      <svg viewBox="0 0 {map.w} {map.h}" role="img" aria-label={m.map.aria}>
        <rect x={ix} y={iy} width={iw} height={ih} rx="12" fill="none" stroke="#b9b1c9" stroke-width="1.5" stroke-dasharray="6 5" />
        <text x={ix + 10} y={iy + 20} font-size="15" font-weight="700" fill="#6a6382">{m.map.canary}</text>
        {#each order as code (code)}
          {@const s = shapes[code]}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <g class="prov" class:sel={code === app.prov} onclick={() => pick(code)} onpointermove={(e) => move(e, code)} onpointerleave={() => (hover = null)}>
            {#if s.tiny}
              <circle cx={s.cx} cy={s.cy} r="11" fill={fill(code)} />
            {:else}
              <path d={s.d} fill={fill(code)} />
            {/if}
          </g>
        {/each}
        {#each codes.filter((c) => shapes[c].tiny) as code (code)}
          <text class="lbl" x={shapes[code].cx + 17} y={shapes[code].cy + 5} font-size="15" font-weight="700" fill="#4f4868">{provinces[code].name}</text>
        {/each}
      </svg>
      {#if hover}
        <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px" aria-hidden="true">
          <strong>{provinces[hover].name}</strong>
          {#each describe(hover).split(' · ') as line (line)}<span>{line}</span>{/each}
        </div>
      {/if}
    </div>

    <p class="info" aria-live="polite"><strong>{provinces[focus].name}.</strong> {describe(focus)}</p>

    <div class="legend">
      {#if shown === 'weight'}
        <span>{m.map.legendLess} (×{dec(ext.min, 2)})</span>
        <span class="grad" aria-hidden="true"></span>
        <span>{m.map.legendMore} (×{dec(ext.max, 1)})</span>
      {:else if shown === 'winner'}
        {#each winners as id (id)}
          <span class="key"><span class="dot" style:background={party(id).color}></span>{party(id).short}</span>
        {/each}
      {:else}
        <span>0</span>
        <span class="grad" aria-hidden="true" style:background="linear-gradient(90deg, {mix(party(app.partyId).color, 0.3)}, {party(app.partyId).color})"></span>
        <span>{fmt(m.map.legendSeats, { party: party(app.partyId).short, max: ext.seats })}</span>
      {/if}
    </div>
  </div>
</section>

<style>
  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }
  .modes .choice {
    min-height: 52px;
    flex: 1 1 180px;
    justify-content: center;
  }
  .stage {
    position: relative;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    max-height: 78vh;
    touch-action: manipulation;
  }
  .prov {
    cursor: pointer;
  }
  .prov :global(path),
  .prov :global(circle) {
    stroke: #fff;
    stroke-width: 1.4;
    stroke-linejoin: round;
    transition: fill 0.35s;
  }
  .prov:hover :global(path),
  .prov:hover :global(circle) {
    stroke: var(--ink);
    stroke-width: 2;
  }
  .prov.sel :global(path),
  .prov.sel :global(circle) {
    stroke: var(--ink);
    stroke-width: 3.5;
  }
  .tip {
    position: absolute;
    transform: translate(-50%, calc(-100% - 14px));
    background: var(--ink);
    color: #fff;
    border-radius: 12px;
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
    line-height: 1.35;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    width: max-content;
    max-width: 260px;
    z-index: 2;
  }
  .info {
    background: var(--primary-soft);
    border-radius: var(--radius-s);
    padding: 0.7rem 1rem;
    margin: 0.8rem 0;
    min-height: 3.2em;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.9rem;
    font-size: 0.9rem;
    font-weight: 700;
  }
  .grad {
    flex: 1 1 120px;
    max-width: 320px;
    height: 14px;
    border-radius: 7px;
    background: linear-gradient(90deg, rgb(222, 213, 255), rgb(155, 132, 240), rgb(58, 28, 158));
  }
  .key {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
</style>
