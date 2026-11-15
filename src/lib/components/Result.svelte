<script lang="ts">
  import { party } from '#lib/core/data';
  import { blankEffect, effectiveThreshold, electorsPerSeat, partyMetrics, returnIndex, weight, weightRange } from '#lib/core/metrics';
  import { seatOdds } from '#lib/core/montecarlo';
  import { marks, senateSplit } from '#lib/core/senate';
  import { blankVerdict, partyVerdict } from '#lib/core/verdict';
  import { approx, count, dec, fmt, m, num, pct, rich } from '#lib/i18n';
  import { app } from '#lib/state.svelte';
  import Urni from './Urni.svelte';

  const c = $derived(app.constituency);
  const s = $derived(app.scenario);
  const ch = $derived(app.effectiveChamber);
  const tense = $derived(app.projected ? 'now' : 'past');
  const n = (v: number) => (app.projected ? approx(v) : num(v));
  const wf = (w: number) => dec(w, w < 1 ? 2 : 1);

  // 1. Where you vote
  const w = $derived(weight(c, s));
  const range = $derived(weightRange(s));
  const sorted = $derived([...s.constituencies].sort((a, b) => weight(b, s) - weight(a, s)));
  const rank = $derived(sorted.findIndex((x) => x.id === c.id) + 1);
  const pos = (v: number) => (100 * (Math.log(v) - Math.log(range.min))) / (Math.log(range.max) - Math.log(range.min) || 1);
  const seatsLine = $derived(
    fmt(m.result.seatsLine[c.seats === 1 ? (`${ch}One` as const) : ch], { place: c.name, seats: c.seats, census: num(c.census) })
  );
  const power = $derived<'up' | 'down' | 'same'>(w >= 1.15 ? 'up' : w <= 0.87 ? 'down' : 'same');
  const POWER_ICON = { up: '⚡', down: '🐢', same: '⚖️' } as const;
  const weightLine = $derived(fmt(m.result.power[power].line, { w: wf(w), place: c.name }));

  // 2. What you do with it
  const info = $derived(party(app.partyId));
  const pm = $derived(partyMetrics(c, app.partyId, ch));
  const simOn = $derived(app.projected && ch === 'congreso');
  const odds = $derived(simOn && app.sim ? seatOdds(app.sim.seats[c.id]?.[app.partyId], pm.seats) : null);
  const national = $derived(simOn && app.sim ? app.sim.national[app.partyId] : undefined);
  const index = $derived(returnIndex(c, s, pm, odds?.any));
  const split = $derived(senateSplit(c.seats));
  const unit = $derived(ch === 'senado' ? m.units.senator : m.units.deputy);
  const be = $derived(blankEffect(c));
  const cast = $derived(c.valid + c.invalid);
  const abst = $derived(Math.max(0, c.census - cast));
  const ARC = Math.PI * 54;

  // 3. The story in one sentence
  const verdict = $derived.by<{ text: string; mood: 'wow' | 'happy' | 'think' } | null>(() => {
    const V = m.result.verdict;
    const place = c.name;
    if (app.option === 'null') return { text: fmt(V.null, { place }), mood: 'think' };
    if (app.option === 'abstain') return { text: fmt(V.abstain, { place, seats: count(unit, c.seats) }), mood: 'think' };
    if (app.option === 'blank') {
      if (ch === 'senado') return { text: V.blank.senate, mood: 'think' };
      const b = blankVerdict(c);
      const vars = { place, party: 'party' in b ? party(b.party).short : '', pct: 'share' in b ? pct(b.share) : '' };
      return { text: fmt(V.blank[b.kind][tense], vars), mood: b.kind === 'nothing' ? 'think' : 'wow' };
    }
    if (!app.party) return null;
    const v = partyVerdict(c, app.partyId, ch, pm);
    if (!v) return null;
    const vars = { party: info.short, place, seats: count(m.units.seat, pm.seats), n: v.margin === null ? '' : n(v.margin) };
    if (v.kind === 'holdTight')
      return { text: fmt(V.holdTight[tense], { ...vars, rival: v.rival ? fmt(V.rivalHold, { rival: party(v.rival).short }) : '' }), mood: 'wow' };
    if (v.kind === 'gainTight')
      return {
        text: fmt(V.gainTight[tense], {
          ...vars,
          which: v.first ? V.first : V.another,
          rival: v.rival ? fmt(V.rivalGain[tense], { rival: party(v.rival).short }) : ''
        }),
        mood: 'wow'
      };
    if (v.kind === 'safe') return { text: fmt(V.safe[tense], vars), mood: 'happy' };
    return { text: fmt((v.margin === null ? V.farNoGain : V.far)[tense], vars), mood: 'think' };
  });
</script>

<section class="section" aria-labelledby="result-title">
  <div class="head">
    <Urni size={72} mood={app.option === 'party' && app.party && index.level === 'high' ? 'wow' : 'happy'} />
    <div>
      <h2 id="result-title">{m.result.title}</h2>
      <span class="pill" class:real={!app.projected}>{app.projected ? m.elections.e2026.tag : m.elections[app.election].tag} · {m.elections[app.election].short} · {m.chambers[ch]}</span>
    </div>
  </div>

  {#if verdict}
    <div class="verdict" data-testid="verdict" role="status">
      <Urni size={64} mood={verdict.mood} />
      <div>
        <h3>{m.result.verdict.title}</h3>
        <p>{@html rich(verdict.text)}</p>
      </div>
    </div>
  {/if}

  <div class="grid">
    <article class="card">
      <h3>{fmt(m.result.placeTitle, { place: c.name })}</h3>
      <div class="power {power}" data-testid="power">
        <span class="ico" aria-hidden="true">{POWER_ICON[power]}</span>
        <span class="big">×{wf(w)}</span>
        <span class="unit">{m.result.power[power].badge}</span>
      </div>
      <div class="gauge" aria-hidden="true">
        <div class="track"></div>
        <div class="mean" style:left="{pos(1)}%"><span>×1</span></div>
        <div class="pin" style:left="{pos(w)}%"></div>
        <div class="ends">
          <span>{m.map.legendLess}<br />{sorted[sorted.length - 1].name} ×{wf(range.min)}</span>
          <span>{m.map.legendMore}<br />{sorted[0].name} ×{wf(range.max)}</span>
        </div>
      </div>
      <p class="say">{@html rich(weightLine)}</p>
      <p>{@html rich(seatsLine)}</p>
      <p>{@html rich(fmt(m.result.perSeat, { eps: approx(electorsPerSeat(c)), avg: approx(s.totalCensus / s.totalSeats) }))}</p>
      <p class="note">{fmt(m.result.weightRank, { rank, total: sorted.length })}</p>
      {#if ch === 'congreso'}
        <p>{@html rich(fmt(m.result.firstSeat, { pct: dec(effectiveThreshold(c.seats), 0) }))}</p>
      {/if}
    </article>

    <article class="card">
      {#if app.option === 'party'}
        {#if !app.party}
          <h3>{m.steps.which}</h3>
          <p class="say">{fmt(app.projected ? m.steps.whichHint : m.steps.whichHintPast, { place: c.name })}</p>
          <p><a class="btn" href="#prov">↑ {m.steps.which}</a></p>
        {:else}
          <h3><span class="dot" style:background={info.color}></span> {fmt(m.result.partyTitle, { party: info.short })}</h3>
          {#if !pm.found}
            <p class="say">{fmt(app.projected ? m.result.notStanding : m.result.notStandingPast, { party: info.short, place: c.name })}</p>
          {:else if pm.noData}
            <p class="say">{fmt(m.result.noData, { party: info.short, place: c.name })}</p>
          {:else}
            <p class="say">
              {@html rich(
                fmt((pm.seats > 0 ? m.result.wins : m.result.noSeat)[tense], {
                  party: info.short,
                  seats: count(m.units.seat, pm.seats),
                  votes: n(pm.votes),
                  pct: pct(pm.share)
                })
              )}
            </p>
            <div class="tiles">
              <div class="tile">
                <div class="k">{m.result.tiles.seats}</div>
                <div class="v">{pm.seats} <small>/ {c.seats}</small></div>
                <div class="s">{app.projected ? m.result.tiles.seatsNow : m.result.tiles.seatsPast}</div>
              </div>
              <div class="tile">
                <div class="k">{m.result.tiles.gain}</div>
                <div class="v">{pm.toGain === null ? '—' : n(pm.toGain)}</div>
                {#if pm.toGain === null}<div class="s">{m.result.tiles.none}</div>{/if}
              </div>
              <div class="tile">
                <div class="k">{pm.seats > 0 ? m.result.tiles.lose : m.result.tiles.wasted}</div>
                <div class="v">{n(pm.seats > 0 ? (pm.toLose ?? 0) : pm.wasted)}</div>
              </div>
            </div>
            <ul class="facts">
              {#if pm.toGain !== null}
                <li>{@html rich(fmt((pm.seats === 0 ? m.result.toGainFirst : m.result.toGain)[tense], { n: n(pm.toGain) }))}</li>
              {/if}
              {#if pm.toLose !== null}
                <li>{@html rich(fmt(m.result.toLose[tense], { n: n(pm.toLose) }))}</li>
              {/if}
              {#if pm.seats === 0}
                <li>{@html rich(m.result.wastedNone[tense])}</li>
              {:else if pm.wasted > 0}
                <li>{@html rich(fmt(m.result.wastedSome[tense], { n: n(pm.wasted) }))}</li>
              {/if}
              {#if pm.votesPerSeat}
                <li>{@html rich(fmt(m.result.perSeatParty[tense], { n: n(pm.votesPerSeat) }))}</li>
              {/if}
            </ul>

            <div class="index">
              <svg viewBox="0 0 140 84" width="170" role="img" aria-label="{m.result.index.title}: {index.total} {m.result.index.of}">
                <path d="M16 74a54 54 0 0 1 108 0" fill="none" stroke="#eadfce" stroke-width="14" stroke-linecap="round" />
                <path d="M16 74a54 54 0 0 1 108 0" fill="none" stroke="#5b3fd6" stroke-width="14" stroke-linecap="round" stroke-dasharray="{(ARC * index.total) / 100} {ARC}" />
                <text x="70" y="68" text-anchor="middle" font-size="34" font-weight="600" fill="#2a2440" font-family="Fredoka Variable, sans-serif">{index.total}</text>
                <text x="70" y="82" text-anchor="middle" font-size="10" font-weight="700" fill="#6a6382">{m.result.index.of}</text>
              </svg>
              <div>
                <h4>{m.result.index.title}: {m.result.index[index.level]}</h4>
                <p class="note">{m.result.index.explain}</p>
              </div>
            </div>
            <ul class="parts">
              {#each index.parts as p (p.key)}
                <li>
                  <span class="pk">{m.result.index.parts[p.key]}<small>{m.result.index.parts[`${p.key}Hint`]}</small></span>
                  <span class="bar" aria-hidden="true"><span style:width="{Math.round(p.value * 100)}%"></span></span>
                  <span class="pv">{Math.round(p.value * p.weight * 100)}<small> / {Math.round(p.weight * 100)}</small></span>
                </li>
              {/each}
            </ul>

            {#if simOn}
              <div class="odds">
                <h4>🎲 {m.result.odds.title}</h4>
                {#if odds}
                  <p>{@html rich(fmt(m.result.odds.any, { n: Math.round(odds.any * 100) }))}</p>
                  {#if odds.more >= 0.05}<p>{@html rich(fmt(m.result.odds.more, { n: Math.round(odds.more * 100) }))}</p>{/if}
                  {#if odds.fewer >= 0.05}<p>{@html rich(fmt(m.result.odds.fewer, { n: Math.round(odds.fewer * 100) }))}</p>{/if}
                  {#if odds.more < 0.05 && odds.fewer < 0.05}<p>{m.result.odds.stable}</p>{/if}
                  {#if national}<p class="note">{fmt(m.result.odds.range, { lo: national[0], mid: national[1], hi: national[2] })}</p>{/if}
                {:else}
                  <p class="note">{m.result.odds.loading}</p>
                {/if}
              </div>
            {/if}
          {/if}
          {#if ch === 'senado'}
            <p class="box">
              {@html rich(
                split[1]
                  ? fmt(m.result.senateRule, { marks: count(m.units.senator, marks(c.seats)), first: count(m.units.senator, split[0]), second: count(m.units.senator, split[1]) })
                  : fmt(m.result.senateRuleAll, { marks: count(m.units.senator, marks(c.seats)) })
              )}
            </p>
            {#if app.projected}<p class="note">{m.result.senateModel}</p>{/if}
          {/if}
          <p class="note">{app.projected ? m.result.projectedNote : m.result.realNote}</p>
        {/if}
      {:else if app.option === 'blank'}
        <h3>✉️ {m.result.blank.title}</h3>
        <p class="say">{@html rich(m.result.blank.what)}</p>
        <p>{@html rich(m.result.blank.counts)}</p>
        <div class="tiles">
          <div class="tile">
            <div class="k">{m.result.blank.tile}</div>
            <div class="v">{n(be.blank)}</div>
            <div class="s">{fmt(m.result.blank.tileShare, { pct: pct(be.share) })}</div>
          </div>
        </div>
        {#if ch === 'congreso'}
          <p>{@html rich(fmt(m.result.blank.bar, { place: c.name, with: n(be.barWith), without: n(be.barWithout) }))}</p>
          <p class="box">
            {@html rich(fmt(m.result.blank.changed[`${be.changesSeats ? 'yes' : 'no'}${app.projected ? 'Now' : 'Past'}`], { place: c.name }))}
          </p>
        {:else}
          <p class="box">{m.result.blank.senate}</p>
        {/if}
        <p class="note">{m.result.blank.notEb}</p>
      {:else if app.option === 'null'}
        <h3>✖️ {m.result.null.title}</h3>
        <p class="say">{@html rich(m.result.null.what)}</p>
        <p>{@html rich(m.result.null.counts)}</p>
        {#if c.invalid > 0}
          <div class="tiles">
            <div class="tile">
              <div class="k">{m.result.null.tile}</div>
              <div class="v">{n(c.invalid)}</div>
              <div class="s">{fmt(m.result.null.tileShare, { pct: pct(c.invalid / cast) })}</div>
            </div>
          </div>
        {/if}
        <p class="box">{@html rich(m.result.null.effect)}</p>
      {:else}
        <h3>🏠 {m.result.abstain.title}</h3>
        <p class="say">{@html rich(fmt(m.result.abstain.what, { place: c.name, seats: count(unit, c.seats) }))}</p>
        <div class="tiles">
          <div class="tile">
            <div class="k">{app.projected ? m.result.abstain.tile : m.result.abstain.tilePast}</div>
            <div class="v">{n(abst)}</div>
            <div class="s">{fmt(m.result.abstain.tileShare, { pct: pct(abst / c.census) })}</div>
          </div>
        </div>
        <p>{m.result.abstain.effect}</p>
        <p class="box">{@html rich(fmt(m.result.abstain.one[tense], { cast: n(cast), place: c.name }))}</p>
      {/if}
      {#if app.option !== 'party'}
        <p class="note">{app.projected ? m.result.projectedNote : m.result.realNote}</p>
      {/if}
    </article>
  </div>
</section>

<style>
  .head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }
  .head h2 {
    margin-bottom: 0.3rem;
  }
  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
    align-items: start;
  }
  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
  }
  h4 {
    font-family: var(--font-title);
    font-size: 1.15rem;
    margin: 0 0 0.2rem;
  }
  .say {
    font-size: 1.2rem;
    line-height: 1.45;
  }
  .verdict {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--sun);
    border: 3px solid #f2c94c;
    border-radius: var(--radius);
    padding: 1rem 1.2rem;
    margin-bottom: 1rem;
  }
  .verdict h3 {
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--ink-2);
    margin: 0 0 0.2rem;
  }
  .verdict p {
    font-size: clamp(1.2rem, 4vw, 1.45rem);
    line-height: 1.4;
    margin: 0;
  }
  .power {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.3rem 0.7rem;
    margin-top: 0.4rem;
    padding: 0.6rem 1.1rem 0.6rem 0.8rem;
    border-radius: 999px;
    border: 3px solid var(--ink);
    box-shadow: 0 5px 0 var(--ink);
    background: var(--primary-soft);
  }
  .power.up {
    background: linear-gradient(135deg, #fff3a8, #b9f3c8);
  }
  .power.down {
    background: linear-gradient(135deg, #ffe4d4, #ffd0c2);
  }
  .power .ico {
    font-size: clamp(2rem, 9vw, 2.8rem);
    line-height: 1;
  }
  .big {
    font-family: var(--font-title);
    font-weight: 600;
    font-size: clamp(3rem, 13vw, 4.4rem);
    line-height: 1;
    color: var(--ink);
  }
  .unit {
    font-weight: 800;
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .gauge {
    position: relative;
    margin: 2rem 0 1rem;
  }
  .track {
    height: 18px;
    border-radius: 9px;
    background: linear-gradient(90deg, #ded5ff, #9b84f0 55%, #3a1c9e);
  }
  .pin {
    position: absolute;
    top: -7px;
    width: 14px;
    height: 32px;
    margin-left: -7px;
    border-radius: 7px;
    background: var(--ink);
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: left 0.4s;
  }
  .mean {
    position: absolute;
    top: -4px;
    height: 26px;
    border-left: 2px dashed var(--ink);
  }
  .mean span {
    position: absolute;
    top: -1.35rem;
    left: -0.8rem;
    font-size: 0.8rem;
    font-weight: 800;
  }
  .ends {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.82rem;
    color: var(--ink-2);
    line-height: 1.3;
  }
  .ends span:last-child {
    text-align: right;
  }
  .v small {
    font-size: 1rem;
    color: var(--ink-2);
  }
  .facts {
    padding-left: 1.2rem;
    margin: 0 0 1rem;
  }
  .facts li {
    margin-bottom: 0.35rem;
  }
  .index {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    border-top: 2px dashed var(--line);
    padding-top: 1rem;
  }
  .index > div {
    flex: 1 1 200px;
  }
  .parts {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 1rem;
    display: grid;
    gap: 0.6rem;
  }
  .parts li {
    display: grid;
    grid-template-columns: 1fr 5rem 3.6rem;
    align-items: center;
    gap: 0.6rem;
  }
  .pk {
    font-weight: 800;
    line-height: 1.25;
  }
  .pk small {
    display: block;
    font-weight: 600;
    color: var(--muted);
    font-size: 0.82rem;
  }
  .bar {
    height: 12px;
    border-radius: 6px;
    background: var(--line);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: 6px;
    background: var(--primary);
  }
  .pv {
    text-align: right;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .pv small {
    color: var(--muted);
    font-weight: 600;
  }
  .odds,
  .box {
    background: var(--sky);
    border-radius: var(--radius-s);
    padding: 0.8rem 1rem;
  }
  .odds {
    margin-bottom: 0.8rem;
  }
  .odds p {
    margin-bottom: 0.3rem;
  }
</style>
