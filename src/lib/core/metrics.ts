import { allocate } from './allocate';
import { marks, senateSplit } from './senate';
import type { Chamber, Constituency, Scenario } from './types';

/** How many times the average vote a vote here weighs (electors per seat, inverted). */
export function weight(c: Constituency, s: Scenario): number {
  return s.totalCensus / s.totalSeats / (c.census / c.seats);
}
export const electorsPerSeat = (c: Constituency) => c.census / c.seats;

export interface WeightRange {
  min: number;
  max: number;
}
export function weightRange(s: Scenario): WeightRange {
  const w = s.constituencies.map((c) => weight(c, s));
  return { min: Math.min(...w), max: Math.max(...w) };
}

/** % of the valid vote a list needs here to win its first seat when the rest stay put. */
export function effectiveThreshold(seats: number): number {
  return Math.max(3, 100 / (seats + 1));
}

function seatsFor(c: Constituency, idx: number, votes: number, chamber: Chamber): number {
  const v = c.parties.map((p) => p.votes);
  v[idx] = votes;
  if (chamber === 'senado') {
    const order = v.map((x, i) => [x, i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const pos = order.findIndex((o) => o[1] === idx);
    return senateSplit(c.seats)[pos] ?? 0;
  }
  return allocate(v, c.seats, { blank: c.blank })[idx];
}

export interface PartyMetrics {
  found: boolean;
  votes: number;
  share: number;
  seats: number;
  /** Extra votes needed for one more seat, others unchanged. null = cannot win more. */
  toGain: number | null;
  /** Votes it can lose before losing a seat. null = holds no seat. */
  toLose: number | null;
  /** Votes that elected nobody: all of them without a seat, the surplus otherwise. */
  wasted: number;
  votesPerSeat: number | null;
  noData: boolean;
}

export function partyMetrics(c: Constituency, id: string, chamber: Chamber): PartyMetrics {
  let idx = c.parties.findIndex((p) => p.id === id);
  let cons = c;
  if (idx < 0) {
    cons = { ...c, parties: [...c.parties, { id, votes: 0, seats: 0 }] };
    idx = cons.parties.length - 1;
  }
  const p = cons.parties[idx];
  const seats = seatsFor(cons, idx, p.votes, chamber);
  const maxSeats = chamber === 'senado' ? marks(c.seats) : c.seats;

  let toGain: number | null = null;
  if (seats < maxSeats) {
    let lo = 0;
    let hi = Math.max(1000, c.valid * 4);
    if (seatsFor(cons, idx, p.votes + hi, chamber) > seats) {
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (seatsFor(cons, idx, p.votes + mid, chamber) > seats) hi = mid;
        else lo = mid;
      }
      toGain = hi;
    }
  }
  let toLose: number | null = null;
  if (seats > 0) {
    let lo = 0;
    let hi = p.votes;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (seatsFor(cons, idx, p.votes - mid, chamber) < seats) hi = mid;
      else lo = mid;
    }
    toLose = hi;
  }
  return {
    found: c.parties.some((x) => x.id === id),
    votes: p.votes,
    share: c.valid > 0 ? p.votes / c.valid : 0,
    seats,
    toGain,
    toLose,
    wasted: seats === 0 ? p.votes : Math.max(0, (toLose ?? 1) - 1),
    votesPerSeat: seats > 0 ? p.votes / seats : null,
    noData: !!p.noData
  };
}

export interface ReturnIndex {
  /** 0–100. */
  total: number;
  /** Each part 0–1, with its weight in the total. */
  parts: { key: 'weight' | 'close' | 'useful'; value: number; weight: number }[];
  level: 'high' | 'mid' | 'low';
}

/**
 * One friendly number: where you vote (30%), how close a seat is (40%) and whether the
 * list wins seats here at all (30%). `seatChance` (from the simulations) refines the last
 * part when available.
 */
export function returnIndex(
  c: Constituency,
  s: Scenario,
  m: PartyMetrics,
  seatChance?: number
): ReturnIndex {
  const r = weightRange(s);
  const w = weight(c, s);
  const wPart = r.max > r.min ? (Math.log(w) - Math.log(r.min)) / (Math.log(r.max) - Math.log(r.min)) : 0.5;
  const near = Math.min(m.toGain ?? Infinity, m.toLose ?? Infinity);
  // Distance to the nearest seat change, measured against half the price of a seat here.
  const half = c.valid / (c.seats + 1) / 2;
  const close = Number.isFinite(near) && half > 0 ? Math.max(0, 1 - near / half) : 0;
  const useful = seatChance ?? (m.seats > 0 ? 1 : 0);
  const parts: ReturnIndex['parts'] = [
    { key: 'weight', value: Math.min(1, Math.max(0, wPart)), weight: 0.3 },
    { key: 'close', value: close, weight: 0.4 },
    { key: 'useful', value: useful, weight: 0.3 }
  ];
  const total = Math.round(100 * parts.reduce((a, p) => a + p.value * p.weight, 0));
  return { total, parts, level: total >= 60 ? 'high' : total >= 30 ? 'mid' : 'low' };
}

export interface BlankEffect {
  blank: number;
  share: number;
  /** Votes a list needs to reach 3% with and without the blank ballots. */
  barWith: number;
  barWithout: number;
  /** Would any seat change hands if nobody had voted blank? */
  changesSeats: boolean;
}
export function blankEffect(c: Constituency): BlankEffect {
  const v = c.parties.map((p) => p.votes);
  const a = allocate(v, c.seats, { blank: c.blank });
  const b = allocate(v, c.seats, { blank: 0 });
  return {
    blank: c.blank,
    share: c.valid > 0 ? c.blank / c.valid : 0,
    barWith: Math.ceil(0.03 * c.valid),
    barWithout: Math.ceil(0.03 * (c.valid - c.blank)),
    changesSeats: a.some((x, i) => x !== b[i])
  };
}
