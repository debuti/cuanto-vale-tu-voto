import { describe, expect, it } from 'vitest';
import { polls } from './data';
import { averagePolls } from './polls';
import { buildScenario, nationalTally, realCongress } from './scenario';
import { blankVerdict, lastSeat, partyVerdict, TIGHT } from './verdict';
import { valueRanking } from './value';
import { frameConstituencies, frames } from './timeline';
import { bySides, defaultSide, seatsOf } from './blocs';

const c2023 = realCongress('e2023');

describe('verdict', () => {
  it('last seat and runner-up are different seated/eligible lists', () => {
    for (const c of c2023) {
      const ls = lastSeat(c)!;
      expect(c.parties.find((p) => p.id === ls.last)!.seats).toBeGreaterThan(0);
      if (c.seats === 1) expect(ls.runner).not.toBe(ls.last);
    }
  });
  it('every seated list gets a hold or safe story; margins respect the threshold', () => {
    for (const c of c2023)
      for (const p of c.parties) {
        const v = partyVerdict(c, p.id, 'congreso');
        if (!v) continue;
        if (v.kind === 'holdTight' || v.kind === 'gainTight') expect(v.margin).toBeLessThanOrEqual(TIGHT * c.valid);
        if (v.kind === 'holdTight' || v.kind === 'safe') expect(p.seats).toBeGreaterThan(0);
        if (v.kind === 'far') expect(p.seats).toBe(0);
      }
  });
  it('blank ballots: costsSeat names a list that would gain a seat without them', () => {
    const kinds = new Set(c2023.map((c) => blankVerdict(c).kind));
    expect([...kinds].every((k) => ['costsSeat', 'raisesBar', 'nothing'].includes(k))).toBe(true);
    const c = { ...c2023[0], seats: 20, blank: 1000, valid: 2060, parties: [
      { ...c2023[0].parties[0], id: 'a', votes: 1000, seats: 20 },
      { ...c2023[0].parties[0], id: 'b', votes: 60, seats: 0 }
    ] };
    expect(blankVerdict(c)).toEqual({ kind: 'costsSeat', party: 'b' });
  });
});

describe('value ranking', () => {
  it('is sorted by index and only lists real contenders', () => {
    const s = buildScenario('e2026', 'congreso', { shares: averagePolls(polls).shares });
    const rows = valueRanking(s);
    expect(rows.length).toBeGreaterThan(100);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].index).toBeGreaterThanOrEqual(rows[i].index);
    expect(rows.every((r) => Number.isFinite(r.margin) && r.margin >= 0)).toBe(true);
  });
});

describe('timeline', () => {
  it('starts with three real elections and ends on the latest poll', () => {
    const f = frames();
    expect(f.slice(0, 3).map((x) => x.election)).toEqual(['e2019a', 'e2019n', 'e2023']);
    const last = f[f.length - 1];
    expect(last.date).toBe([...polls.map((p) => p.end)].sort().pop());
    for (const x of f) expect(frameConstituencies(x).reduce((a, c) => a + c.seats, 0)).toBe(350);
  }, 30_000);
});

describe('sides', () => {
  it('left fills from the left, right from the right, and seats add up', () => {
    const t = nationalTally(c2023).filter((p) => p.seats > 0);
    const o = bySides(t, defaultSide);
    expect(defaultSide(o[0].id)).toBe('left');
    expect(o[o.length - 1].id).toBe('pp');
    const sum = (['left', 'none', 'right'] as const).reduce((a, s) => a + seatsOf(t, defaultSide, s), 0);
    expect(sum).toBe(350);
    const flip = bySides(t, (id) => (id === 'pp' ? 'left' : 'none'));
    expect(flip[0].id).toBe('pp');
  });
});
