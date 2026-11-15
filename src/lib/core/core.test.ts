import { describe, expect, it } from 'vitest';
import { allocate, apportion } from './allocate';
import { real, lists2026, polls, senate2023 } from './data';
import { averagePolls, latestByFirm, pollsterShares } from './polls';
import { project } from './projection';
import { buildScenario, nationalTally, realCongress } from './scenario';
import { blankEffect, partyMetrics, returnIndex, weight, effectiveThreshold } from './metrics';
import { simulate, seatOdds } from './montecarlo';
import { recount } from './whatif';
import { senateSplit } from './senate';

describe('allocate', () => {
  it("D'Hondt textbook example (LOREG art. 163)", () => {
    expect(allocate([168000, 104000, 72000, 64000, 40000, 32000], 8)).toEqual([4, 2, 1, 1, 0, 0]);
  });
  it('applies the 3% bar over valid votes including blank', () => {
    expect(allocate([1000, 60], 20, { blank: 0 })).toEqual([19, 1]);
    expect(allocate([1000, 60], 20, { blank: 1000 })).toEqual([20, 0]);
  });
  it('other methods share every seat', () => {
    for (const method of ['sainte-lague', 'hare'] as const)
      expect(allocate([500, 300, 200, 40], 10, { method }).reduce((a, b) => a + b)).toBe(10);
  });
  it('apportion gives 350 seats with the legal minimums', () => {
    const pop = Object.fromEntries(Object.entries(lists2026).map(([c, p]) => [c, p.census]));
    const s = apportion(pop);
    expect(Object.values(s).reduce((a, b) => a + b)).toBe(350);
    expect(s['51']).toBe(1);
    expect(Math.min(...Object.values(s))).toBe(1);
  });
});

describe('real elections', () => {
  for (const e of ['e2023', 'e2019n', 'e2019a'] as const)
    it(`our D'Hondt reproduces every official seat of ${e}`, () => {
      const wrong: string[] = [];
      for (const [code, p] of Object.entries(real(e))) {
        const seats = allocate(p.parties.map((r) => r[1]), p.seats, { blank: p.blank });
        p.parties.forEach((r, i) => seats[i] !== r[2] && wrong.push(`${code} ${r[0]} ${seats[i]}≠${r[2]}`));
      }
      expect(wrong).toEqual([]);
      expect(nationalTally(realCongress(e)).reduce((a, p) => a + p.seats, 0)).toBe(350);
    });
  it('2023 national totals', () => {
    const nat = Object.fromEntries(nationalTally(realCongress('e2023')).map((p) => [p.id, p.seats]));
    expect(nat).toMatchObject({ pp: 137, psoe: 121, vox: 33, sumar: 31, erc: 7, junts: 7, bildu: 6, pnv: 5 });
  });
  it('senate 2023 has 208 elected senators', () => {
    expect(senate2023.reduce((a, c) => a + c.parties.reduce((x, p) => x + p[2], 0), 0)).toBe(208);
  });
});

describe('polls', () => {
  it('never includes the CIS or party polls', () => {
    expect(polls.some((p) => /^(CIS|PSOE|PP|Vox)$/i.test(p.firm))).toBe(false);
  });
  it('averages one poll per pollster', () => {
    const used = latestByFirm();
    expect(new Set(used.map((p) => p.firm)).size).toBe(used.length);
    const avg = averagePolls();
    expect(avg.shares.pp).toBeGreaterThan(15);
    const total = Object.values(avg.shares).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(85);
    expect(total).toBeLessThan(100);
    expect(pollsterShares(used[0].firm).used).toHaveLength(1);
  });
});

describe('projection 2026', () => {
  const avg = averagePolls();
  const cons = project({ shares: avg.shares });
  it('fills 350 seats and matches the polls nationally', () => {
    expect(cons.reduce((a, c) => a + c.seats, 0)).toBe(350);
    expect(cons.reduce((a, c) => a + c.parties.reduce((x, p) => x + p.seats, 0), 0)).toBe(350);
    const valid = cons.reduce((a, c) => a + c.valid, 0);
    const nat = nationalTally(cons);
    for (const id of ['pp', 'psoe', 'vox', 'fa']) {
      const got = (100 * nat.find((p) => p.id === id)!.votes) / valid;
      // What the polls leave unassigned is spread among all lists, so each lands a touch above its poll.
      expect(Math.abs(got - avg.shares[id])).toBeLessThan(0.5);
    }
  });
  it('only lists standing in a province get votes there', () => {
    for (const c of cons) for (const p of c.parties) expect(lists2026[c.id].lists).toContain(p.id);
  });
  it('lists no poll publishes do not balloon', () => {
    const base = real('e2023');
    for (const [code, id] of [['42', 'sy'], ['44', 'te']] as const) {
      const b = base[code];
      const was = (b.parties.find((r) => r[0] === id)?.[1] ?? 0) / (b.parties.reduce((a, r) => a + r[1], 0) + b.blank);
      const c = cons.find((x) => x.id === code)!;
      const now = (c.parties.find((x) => x.id === id)?.votes ?? 0) / c.valid;
      expect(was).toBeGreaterThan(0.1);
      expect(now / was).toBeLessThan(1.3);
    }
  });
  it('more turnout means more votes', () => {
    const more = project({ shares: avg.shares, turnoutDelta: 5 });
    expect(more.reduce((a, c) => a + c.valid, 0)).toBeGreaterThan(cons.reduce((a, c) => a + c.valid, 0));
  });
});

describe('metrics', () => {
  const s = buildScenario('e2023', 'congreso', { shares: {} });
  const soria = s.constituencies.find((c) => c.id === '42')!;
  const madrid = s.constituencies.find((c) => c.id === '28')!;
  it('a vote in Soria weighs more than one in Madrid', () => {
    expect(weight(soria, s)).toBeGreaterThan(2);
    expect(weight(madrid, s)).toBeLessThan(1);
    expect(effectiveThreshold(2)).toBeCloseTo(33.33, 1);
    expect(effectiveThreshold(37)).toBe(3);
  });
  it('margins are exact: one vote less does not flip the seat', () => {
    for (const c of [soria, madrid])
      for (const p of c.parties.slice(0, 5)) {
        const m = partyMetrics(c, p.id, 'congreso');
        expect(m.seats).toBe(p.seats);
        const votes = c.parties.map((x) => x.votes);
        const i = c.parties.indexOf(p);
        if (m.toGain != null) {
          votes[i] = p.votes + m.toGain;
          expect(allocate(votes, c.seats, { blank: c.blank })[i]).toBe(p.seats + 1);
          votes[i] = p.votes + m.toGain - 1;
          expect(allocate(votes, c.seats, { blank: c.blank })[i]).toBe(p.seats);
        }
        if (m.toLose != null) {
          votes[i] = p.votes - m.toLose;
          expect(allocate(votes, c.seats, { blank: c.blank })[i]).toBe(p.seats - 1);
        }
      }
  });
  it('a list without seats wastes all its votes; index stays in 0–100', () => {
    const m = partyMetrics(soria, 'vox', 'congreso');
    expect(m.seats).toBe(0);
    expect(m.wasted).toBe(m.votes);
    const idx = returnIndex(soria, s, m);
    expect(idx.total).toBeGreaterThanOrEqual(0);
    expect(idx.total).toBeLessThanOrEqual(100);
    expect(partyMetrics(soria, 'does-not-exist', 'congreso').found).toBe(false);
  });
  it('blank ballots raise the 3% bar', () => {
    const b = blankEffect(madrid);
    expect(b.barWith).toBeGreaterThan(b.barWithout);
  });
});

describe('simulation, senate and what-if', () => {
  const s = buildScenario('e2026', 'congreso', { shares: averagePolls().shares });
  it('is reproducible and sums to one', () => {
    const a = simulate({ constituencies: s.constituencies, sims: 200, seed: 1 });
    const b = simulate({ constituencies: s.constituencies, sims: 200, seed: 1 });
    expect(a.national).toEqual(b.national);
    const dist = a.seats['28'].pp;
    expect(dist.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 6);
    const odds = seatOdds(dist, s.constituencies.find((c) => c.id === '28')!.parties.find((p) => p.id === 'pp')!.seats)!;
    expect(odds.any).toBeGreaterThan(0.99);
    const [lo, mid, hi] = a.national.pp;
    expect(lo).toBeLessThanOrEqual(mid);
    expect(mid).toBeLessThanOrEqual(hi);
  });
  it('senate: 209 seats in 2026, 208 in 2023', () => {
    expect(buildScenario('e2026', 'senado', { shares: averagePolls().shares }).totalSeats).toBe(209);
    const s23 = buildScenario('e2023', 'senado', { shares: {} });
    expect(s23.national.reduce((a, p) => a + p.seats, 0)).toBe(208);
    expect(senateSplit(4)).toEqual([3, 1]);
    expect(senateSplit(2)).toEqual([2]);
  });
  it('every system shares 350 seats', () => {
    for (const sys of ['actual', 'nacional', 'sainte-lague', 'hare', 'sin-barrera'] as const)
      expect(recount(s.constituencies, sys).reduce((a, p) => a + p.seats, 0)).toBe(350);
    expect(recount(s.constituencies, 'actual')).toEqual(s.national);
  });
});
