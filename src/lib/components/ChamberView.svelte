<script lang="ts">
  import { onDestroy } from 'svelte';
  import { bySides, bySize, defaultSide, seatsOf, type Side } from '#lib/core/blocs';
  import { party } from '#lib/core/data';
  import { hemicycle } from '#lib/core/hemicycle';
  import { nationalTally } from '#lib/core/scenario';
  import { frameConstituencies, frames, type Frame } from '#lib/core/timeline';
  import { SYSTEMS, recount, type SystemId } from '#lib/core/whatif';
  import { approx, date, fmt, m, num, pct, rich } from '#lib/i18n';
  import { app } from '#lib/state.svelte';
  import Lab from './Lab.svelte';

  const s = $derived(app.scenario);
  const ch = $derived(app.effectiveChamber);
  const congress = $derived(ch === 'congreso');

  // Time travel (Congress): three real results, then the polls every few days.
  const FRAMES = frames();
  const LAST = FRAMES.length - 1;
  // The slider gives each real election a wider stretch than a poll date, so the years
  // don't pile up at the left end. pos[i] is where frame i sits on the slider.
  const REALS = FRAMES.filter((f) => f.real).length;
  const W = Math.max(1, Math.round((FRAMES.length - REALS) / 6));
  const pos = FRAMES.map((_, i) => (i < REALS ? i * W : REALS * W + (i - REALS)));
  const MAX = pos[LAST];
  const toFrame = (v: number) => {
    let i = 0;
    while (i < LAST && pos[i + 1] <= v) i++;
    return i;
  };
  const home = $derived(app.election === 'e2026' ? LAST : FRAMES.findIndex((f) => f.real && f.election === app.election));
  let fi = $state(LAST);
  $effect(() => {
    fi = home;
  });
  const live = $derived(!congress || fi === home);
  const frame = $derived<Frame>(FRAMES[fi] ?? FRAMES[LAST]);
  const cons = $derived(live ? s.constituencies : frameConstituencies(frame));
  const projected = $derived(live ? app.projected : !frame.real);
  const frameLabel = (f: Frame, i: number) =>
    f.real ? fmt(m.chamber.frameReal, { date: date(f.date) }) : i === LAST && app.pollsFresh ? m.chamber.frameNow : fmt(m.chamber.framePolls, { date: date(f.date) });

  let playing = $state(false);
  let timer: ReturnType<typeof setInterval> | undefined;
  function stop() {
    playing = false;
    clearInterval(timer);
  }
  function play() {
    if (playing) return stop();
    playing = true;
    fi = 0;
    timer = setInterval(() => {
      if (fi >= LAST) stop();
      else fi++;
    }, 1500);
  }
  onDestroy(() => clearInterval(timer));

  // The same votes counted with other rules (Congress).
  let system = $state<SystemId>('actual');
  const sys = $derived<SystemId>(congress ? system : 'actual');
  const actual = $derived(live ? s.national : nationalTally(cons));
  const tally = $derived(sys === 'actual' ? actual : recount(cons, sys));
  const actualSeats = $derived(new Map(actual.map((p) => [p.id, p.seats])));

  // Order of the chamber: by size, or two sides the reader can rearrange.
  let order = $state<'sides' | 'size'>('sides');
  let moved = $state<Record<string, Side>>({});
  const side = (id: string): Side => moved[id] ?? defaultSide(id);
  const NEXT: Record<Side, Side> = { left: 'none', none: 'right', right: 'left' };
  const withSeats = $derived(tally.filter((p) => p.seats > 0));
  const ordered = $derived(order === 'size' ? bySize(withSeats) : bySides(withSeats, side));
  const colors = $derived(ordered.flatMap((p) => Array<string>(p.seats).fill(p.id)));
  const total = $derived(cons.reduce((a, c) => a + c.seats, 0));
  const hemi = $derived(hemicycle(total));
  const majority = $derived(Math.floor(total / 2) + 1);
  const left = $derived(seatsOf(withSeats, side, 'left'));
  const right = $derived(seatsOf(withSeats, side, 'right'));
  const biggest = $derived(bySize(withSeats)[0]);
  const SIDES: Side[] = ['left', 'none', 'right'];
  const MIN_SHOWN = 0.003;
  const valid = $derived(cons.reduce((a, c) => a + c.valid, 0));

  const rows = $derived(
    bySize(tally).filter(
      // Parties left with no seat stay in the table if they got a visible share.
      (p) =>
        p.seats > 0 ||
        (actualSeats.get(p.id) ?? 0) > 0 ||
        p.votes >= MIN_SHOWN * valid ||
        (app.option === 'party' && p.id === app.partyId && p.votes > 0)
    )
  );
  const maxCost = $derived(Math.max(1, ...withSeats.map((p) => p.votes / p.seats)));
  const range = (id: string) => (live && app.projected && congress && sys === 'actual' ? app.sim?.national[id] : undefined);
  const n = (v: number) => (projected ? approx(v) : num(v));
  let hover = $state<string | null>(null);
  const lit = $derived(hover ?? (app.option === 'party' ? app.partyId : null));
  const litOn = $derived(!!lit && withSeats.some((p) => p.id === lit));
  const title = $derived((projected ? m.chamber.titleNow : m.chamber.titlePast)[ch]);

  // Seats that change hands fall out of the chamber while the new ones drop in.
  interface Ghost {
    key: string;
    x: number;
    y: number;
    id: string;
  }
  let ghosts = $state<Ghost[]>([]);
  let armed = false;
  let prev: string[] = [];
  let round = 0;
  let sweep: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const cur = colors;
    const pts = hemi.seats;
    if (armed && prev.length === cur.length) {
      const g: Ghost[] = [];
      round++;
      cur.forEach((id, i) => {
        if (prev[i] !== id) g.push({ key: `${round}-${i}`, x: pts[i].x, y: pts[i].y, id: prev[i] });
      });
      ghosts = g;
      clearTimeout(sweep);
      sweep = setTimeout(() => (ghosts = []), 900);
    }
    prev = [...cur];
    armed = true;
  });
  onDestroy(() => clearTimeout(sweep));
  function enter(node: SVGCircleElement) {
    if (armed) node.classList.add('enter');
  }
</script>

<section class="section" aria-labelledby="chamber-title">
  <h2 id="chamber-title">{title}</h2>
  <div class="card">
    <div class="controls">
      <fieldset>
        <legend>{m.chamber.order}</legend>
        <div class="choices two">
          {#each ['sides', 'size'] as const as o (o)}
            <button type="button" class="choice" aria-pressed={order === o} onclick={() => (order = o)}>
              {m.chamber.orders[o].name}
              <small>{m.chamber.orders[o].hint}</small>
            </button>
          {/each}
        </div>
      </fieldset>
      {#if congress}
        <div>
          <label for="system">{m.chamber.system}</label>
          <select id="system" class="big" bind:value={system}>
            {#each SYSTEMS as id (id)}<option value={id}>{m.whatif.systems[id].name}</option>{/each}
          </select>
          <p class="note">{m.whatif.systems[sys].hint}</p>
        </div>
        <div class="time">
          <label for="time">⏳ {m.chamber.time}</label>
          <input id="time" type="range" min="0" max={MAX} step="1" bind:value={() => pos[fi], (v) => (fi = toFrame(+v))} oninput={stop} aria-valuetext={frameLabel(frame, fi)} />
          <div class="ends" aria-hidden="true">
            <span style:--at={0}>2019</span><span style:--at={pos[REALS - 1] / MAX}>2023</span><span style:--at={1}>{m.elections.e2026.short}</span>
          </div>
          <button type="button" class="btn small" onclick={play}>{playing ? `⏸ ${m.chamber.stop}` : `▶ ${m.chamber.play}`}</button>
          {#if !live && !playing}<button type="button" class="btn small ghost" onclick={() => (fi = home)}>↺ {m.chamber.backNow}</button>{/if}
        </div>
      {/if}
    </div>

    {#if congress}<p class="when pill" class:real={!projected} aria-live="polite" data-testid="frame">{frameLabel(frame, fi)}</p>{/if}

    <div class="layout">
      <figure>
        <svg viewBox="0 -52 {hemi.w} {hemi.h + 52}" role="img" aria-label="{title}. {fmt(m.chamber.majority, { n: majority })}">
          {#each hemi.seats as seat, i (`${i}-${colors[i]}`)}
            <circle
              use:enter
              class="seat"
              cx={seat.x}
              cy={seat.y}
              r={hemi.r}
              fill={party(colors[i] ?? '').color}
              opacity={litOn && colors[i] !== lit ? 0.25 : 1}
              stroke="rgba(42,36,64,.3)"
              stroke-width="0.6"
            />
          {/each}
          {#each ghosts as g (g.key)}
            <circle class="ghost" cx={g.x} cy={g.y} r={hemi.r} fill={party(g.id).color} />
          {/each}
          <g class="half" aria-hidden="true">
            <line x1={hemi.w / 2} y1="-12" x2={hemi.w / 2} y2={hemi.h - 14 - (hemi.w / 2 - 12) * 0.4 + 12} />
            <rect x={hemi.w / 2 - 150} y="-52" width="300" height="40" rx="20" />
            <text x={hemi.w / 2} y="-24" text-anchor="middle">{m.chamber.half} · {fmt(m.chamber.majorityLine, { n: majority })}</text>
          </g>
          <text x={hemi.w / 2} y={hemi.h - 44} text-anchor="middle" font-size="46" font-weight="600" fill="#2a2440" font-family="Fredoka Variable, sans-serif">
            {litOn ? (withSeats.find((p) => p.id === lit)?.seats ?? '') : total}
          </text>
          <text x={hemi.w / 2} y={hemi.h - 20} text-anchor="middle" font-size="17" font-weight="700" fill="#4f4868">
            {litOn ? party(lit ?? '').short : m.chamber.seats}
          </text>
        </svg>

        {#if order === 'sides'}
          <div class="race" data-testid="race">
            {#each ['left', 'right'] as const as sd (sd)}
              {@const v = sd === 'left' ? left : right}
              <div class="team {sd}" class:win={v >= majority}>
                <span class="tn">{m.chamber.sides[sd]}</span>
                <strong>{v}</strong>
                <span class="ts">{v >= majority ? `✔ ${m.chamber.has}` : fmt(m.chamber.lacks, { n: majority - v })}</span>
              </div>
            {/each}
          </div>
          <div class="strip" aria-hidden="true">
            {#each ordered as p (p.id)}
              <span style:flex={p.seats} style:background={party(p.id).color} class:mid={side(p.id) === 'none'}></span>
            {/each}
            <i></i>
          </div>
        {:else}
          <p class="alone">
            {@html rich(
              biggest && biggest.seats >= majority
                ? fmt(m.chamber.alone.yes, { party: party(biggest.id).short })
                : fmt(m.chamber.alone.no, { n: majority })
            )}
          </p>
        {/if}
        <figcaption>{@html rich(fmt(m.chamber.halfHelp, { n: majority }))}</figcaption>
      </figure>

      <div>
        {#if app.projected && live}<Lab />{/if}
        {#if order === 'sides'}
          <div class="mover">
            <p class="note">👆 {m.chamber.sideHelp}</p>
            {#each SIDES as sd (sd)}
              <div class="group">
                <span class="gl">{m.chamber.sides[sd]}</span>
                <div class="parties">
                  {#each ordered.filter((p) => side(p.id) === sd) as p (p.id)}
                    <button
                      type="button"
                      class="chip"
                      aria-label={fmt(m.chamber.sideAria, { party: party(p.id).short, seats: p.seats, side: m.chamber.sides[sd] })}
                      onclick={() => (moved = { ...moved, [p.id]: NEXT[sd] })}
                    >
                      <span class="dot" style:background={party(p.id).color}></span>{party(p.id).short}
                      <b>{p.seats}</b>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
        <div class="scroll">
          <table class="data">
            <thead>
              <tr>
                <th scope="col">{m.chamber.table}</th>
                <th scope="col">{m.chamber.seats}</th>
                {#if sys !== 'actual'}<th scope="col">{m.chamber.diff}</th>{/if}
                {#if congress}
                  <th scope="col" class="opt">{m.chamber.votes}</th>
                  <th scope="col" class="opt">{m.chamber.pct}</th>
                  <th scope="col">{m.chamber.perSeat}</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#each rows as p (p.id)}
                {@const r = range(p.id)}
                {@const was = actualSeats.get(p.id) ?? 0}
                <tr class:me={app.option === 'party' && p.id === app.partyId} onpointerenter={() => (hover = p.seats > 0 ? p.id : null)} onpointerleave={() => (hover = null)}>
                  <td><span class="pn" title={party(p.id).name}><span class="dot" style:background={party(p.id).color}></span>{party(p.id).short}</span></td>
                  <td>
                    <strong class="st">{p.seats}</strong>
                    {#if r && r[0] !== r[2]}<small>{fmt(m.chamber.range, { lo: r[0], hi: r[2] })}</small>{/if}
                  </td>
                  {#if sys !== 'actual'}
                    <td class="diff">
                      {#if p.seats > was}▲ +{p.seats - was}{:else if p.seats < was}▼ −{was - p.seats}{:else}<small>{m.whatif.same}</small>{/if}
                    </td>
                  {/if}
                  {#if congress}
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
    </div>
    {#if congress}
      <p class="note">{m.chamber.perSeatLead} {sys !== 'actual' ? m.whatif.lead : ''}</p>
    {:else}
      <p class="note">{m.chamber.senateNote}</p>
      {#if app.projected}<p class="note">{m.result.senateModel}</p>{/if}
    {/if}
    <p class="note">{projected ? (live ? app.projectedNote : fmt(m.result.projectedOn, { date: date(frame.date) })) : m.result.realNote}</p>
  </div>
</section>

<style>
  .controls {
    display: grid;
    gap: 1rem 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    align-items: start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px dashed var(--line);
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
  }
  label,
  legend {
    display: block;
    font-weight: 800;
    margin: 0 0 0.35rem;
    padding: 0;
  }
  .two {
    grid-template-columns: 1fr 1fr;
  }
  .two .choice {
    min-height: 56px;
    padding: 0.5rem 0.7rem;
  }
  .controls .note {
    margin: 0.3rem 0 0;
  }
  input[type='range'] {
    width: 100%;
    height: 44px;
    accent-color: var(--primary);
  }
  /* Each label sits under its slider position (the thumb travels inside a 1rem inset). */
  .ends {
    position: relative;
    height: 1.2em;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--ink-2);
    margin: -0.3rem 0 0.5rem;
  }
  .ends span {
    position: absolute;
    left: calc(0.5rem + var(--at) * (100% - 1rem));
    transform: translateX(calc(var(--at) * -100%));
    white-space: nowrap;
  }
  .ends span:nth-child(2) {
    transform: translateX(-50%);
  }
  .time .btn {
    margin: 0 0.4rem 0.3rem 0;
  }
  .when {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
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
  figcaption {
    font-size: 0.95rem;
    color: var(--ink-2);
    margin-top: 0.6rem;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }
  .seat {
    transition: opacity 0.2s;
  }
  :global(.seat.enter) {
    animation: drop 0.7s cubic-bezier(0.3, 1.4, 0.5, 1) backwards;
  }
  .ghost {
    animation: fall 0.8s ease-in forwards;
    pointer-events: none;
  }
  @keyframes drop {
    from {
      transform: translateY(-70px);
      opacity: 0;
    }
  }
  @keyframes fall {
    to {
      transform: translateY(160px);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.seat.enter),
    .ghost {
      animation: none;
    }
    .ghost {
      display: none;
    }
  }
  .half line {
    stroke: var(--ink);
    stroke-width: 4;
    stroke-dasharray: 9 6;
    stroke-linecap: round;
  }
  .half rect {
    fill: var(--ink);
  }
  .half text {
    fill: #fff;
    font-size: 23px;
    font-weight: 800;
  }
  .race {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 0.6rem;
  }
  .team {
    display: grid;
    border: 3px solid var(--line);
    border-radius: var(--radius-s);
    padding: 0.5rem 0.6rem;
    line-height: 1.25;
    text-align: left;
  }
  .team.right {
    text-align: right;
  }
  .team.win {
    border-color: var(--good);
    background: var(--mint);
  }
  .tn {
    font-weight: 800;
    font-size: 0.9rem;
    color: var(--ink-2);
  }
  .team strong {
    font-family: var(--font-title);
    font-size: 2.2rem;
    font-weight: 600;
    line-height: 1;
  }
  .ts {
    font-size: 0.88rem;
    font-weight: 700;
  }
  .team.win .ts {
    color: var(--good);
  }
  .strip {
    position: relative;
    display: flex;
    gap: 1px;
    height: 22px;
    margin-top: 0.7rem;
    border-radius: 11px;
  }
  .strip span {
    min-width: 1px;
    transition: flex 0.5s;
  }
  .strip span:first-child {
    border-radius: 11px 0 0 11px;
  }
  .strip span:nth-last-child(2) {
    border-radius: 0 11px 11px 0;
  }
  .strip span.mid {
    opacity: 0.55;
  }
  .strip i {
    position: absolute;
    left: 50%;
    top: -6px;
    bottom: -6px;
    width: 4px;
    margin-left: -2px;
    border-radius: 2px;
    background: var(--ink);
    box-shadow: 0 0 0 2px #fff;
  }
  .alone {
    font-size: 1.1rem;
    margin: 0.6rem 0 0;
  }
  .mover {
    margin-bottom: 1rem;
  }
  .group {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 0.5rem;
    align-items: center;
    padding: 0.35rem 0;
    border-top: 1px solid var(--line);
  }
  .gl {
    font-weight: 800;
    font-size: 0.9rem;
  }
  .parties {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    min-height: 44px;
    align-items: center;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.3rem 0.7rem;
    border: 2px solid var(--line);
    border-radius: 999px;
    background: var(--card);
    color: inherit;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--primary);
  }
  .chip b {
    font-family: var(--font-title);
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
  .diff {
    font-weight: 800;
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
