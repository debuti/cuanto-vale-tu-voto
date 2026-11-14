import { lists2026, real, pollParties, type RawProvince } from './data';
import { allocate } from './allocate';
import type { Constituency, PartyTally } from './types';

/**
 * Which 2023 lists each 2026 list inherits its provincial map from.
 * Frente Amplio, Front Valencià, Podemos and Adelante Andalucía all come from the 2023
 * Sumar vote; SALF did not stand in 2023, so it borrows the map of Vox (documented limit).
 */
export const BASE: Record<string, string[]> = {
  pp: ['pp', 'upn'],
  fa: ['sumar', 'nc'],
  fv: ['sumar'],
  podemos: ['sumar'],
  aa: ['sumar', 'aa'],
  salf: ['vox']
};
/** Lists that no poll publishes keep their 2023 share, growing at most this much. */
const OTHERS_MAX_GROWTH = 1.15;
const baseIds = (id: string) => BASE[id] ?? [id];

export interface ProjectionInput {
  /** National % of valid votes per polled party. */
  shares: Record<string, number>;
  /** Percentage points added to the 2023 turnout of every province. */
  turnoutDelta?: number;
}

function baseVotes(p: RawProvince, id: string): number {
  let v = 0;
  for (const [pid, votes] of p.parties) if (baseIds(id).includes(pid)) v += votes;
  return v;
}

/**
 * Polls -> provinces by proportional swing: each list keeps its 2023 map and grows or
 * shrinks everywhere by the same factor, then each province is rescaled to 100%.
 * Repeated a few times so the national totals match the polls.
 */
export function project(input: ProjectionInput): Constituency[] {
  const base = real('e2023');
  const codes = Object.keys(lists2026);
  const polled = new Set(pollParties);
  const validBase: Record<string, number> = {};
  let natValid = 0;
  for (const c of codes) {
    validBase[c] = base[c].parties.reduce((a, r) => a + r[1], 0) + base[c].blank;
    natValid += validBase[c];
  }

  // Estimated valid votes in 2026 per province.
  const valid: Record<string, number> = {};
  let natValid26 = 0;
  for (const c of codes) {
    const b = base[c];
    const cast = validBase[c] + b.invalid;
    const turnout = Math.min(0.98, Math.max(0.2, cast / b.census + (input.turnoutDelta ?? 0) / 100));
    valid[c] = lists2026[c].census * turnout * (validBase[c] / cast);
    natValid26 += valid[c];
  }

  // Starting share of each list in each province (its 2023 base share).
  const share: Record<string, Record<string, number>> = {};
  const noData: Record<string, Set<string>> = {};
  for (const c of codes) {
    share[c] = {};
    noData[c] = new Set();
    for (const id of lists2026[c].lists) {
      const s = baseVotes(base[c], id) / validBase[c];
      share[c][id] = s;
      if (s === 0 && !polled.has(id)) noData[c].add(id);
    }
  }
  // Polled lists with no base anywhere they stand get a flat start.
  for (const id of polled) {
    const where = codes.filter((c) => id in share[c]);
    if (where.length && where.every((c) => share[c][id] === 0)) for (const c of where) share[c][id] = 0.01;
  }

  const target: Record<string, number> = {};
  let polledSum = 0;
  for (const id of polled) {
    target[id] = Math.max(0, input.shares[id] ?? 0) / 100;
    polledSum += target[id];
  }
  const blankNat = codes.reduce((a, c) => a + base[c].blank, 0) / natValid;
  const othersTarget = Math.max(0.005, 1 - polledSum - blankNat);

  for (let iter = 0; iter < 4; iter++) {
    const nat: Record<string, number> = {};
    let natOthers = 0;
    for (const c of codes)
      for (const id in share[c]) {
        const v = share[c][id] * valid[c];
        if (polled.has(id)) nat[id] = (nat[id] ?? 0) + v;
        else natOthers += v;
      }
    const otherRatio = natOthers > 0 ? Math.min(OTHERS_MAX_GROWTH, Math.max(0.2, (othersTarget * natValid26) / natOthers)) : 1;
    for (const c of codes) {
      let sum = base[c].blank / validBase[c];
      for (const id in share[c]) {
        const r = polled.has(id) ? (nat[id] > 0 ? (target[id] * natValid26) / nat[id] : 0) : otherRatio;
        share[c][id] *= r;
        sum += share[c][id];
      }
      for (const id in share[c]) share[c][id] /= sum;
    }
  }

  return codes.map((c) => {
    const blankShare = 1 - Object.values(share[c]).reduce((a, b) => a + b, 0);
    const blank = Math.round(blankShare * valid[c]);
    const tallies: PartyTally[] = Object.entries(share[c])
      .map(([id, s]) => ({ id, votes: Math.round(s * valid[c]), seats: 0, ...(noData[c].has(id) ? { noData: true } : {}) }))
      .sort((a, b) => b.votes - a.votes);
    const seats = allocate(tallies.map((t) => t.votes), lists2026[c].seats, { blank });
    tallies.forEach((t, i) => (t.seats = seats[i]));
    const partyVotes = tallies.reduce((a, t) => a + t.votes, 0);
    const b = base[c];
    const invalidRate = b.invalid / (validBase[c] + b.invalid);
    return {
      id: c,
      prov: c,
      name: '',
      seats: lists2026[c].seats,
      census: lists2026[c].census,
      blank,
      invalid: Math.round(((partyVotes + blank) * invalidRate) / (1 - invalidRate)),
      valid: partyVotes + blank,
      parties: tallies
    };
  });
}
