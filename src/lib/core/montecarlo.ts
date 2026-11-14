import { allocate } from './allocate';
import type { Constituency } from './types';

export interface SimInput {
  constituencies: Pick<Constituency, 'id' | 'seats' | 'blank' | 'parties'>[];
  sims?: number;
  seed?: number;
}
export interface SimResult {
  sims: number;
  /** constituency id -> party id -> how often it won 0, 1, 2… seats (share of runs). */
  seats: Record<string, Record<string, number[]>>;
  /** party id -> [5th percentile, median, 95th percentile] of its national seats. */
  national: Record<string, [number, number, number]>;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Typical national poll error (in points) for a party at `pct` %. */
export const pollError = (pct: number) => 0.33 * Math.sqrt(Math.max(pct, 0.05));
/** Extra noise of each list in each province (the swing is never uniform). */
export const LOCAL_NOISE = 0.07;

/**
 * Repeats the election many times, each time moving every party as much as polls usually
 * miss (nationally) plus some local noise, and counts the seats.
 */
export function simulate(input: SimInput): SimResult {
  const sims = input.sims ?? 2000;
  const rnd = mulberry32(input.seed ?? 20261129);
  const gauss = () => {
    const u = Math.max(rnd(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };
  const ids = [...new Set(input.constituencies.flatMap((c) => c.parties.map((p) => p.id)))];
  const index = new Map(ids.map((id, i) => [id, i]));
  let total = 0;
  const natVotes = new Float64Array(ids.length);
  for (const c of input.constituencies) {
    total += c.blank;
    for (const p of c.parties) {
      natVotes[index.get(p.id)!] += p.votes;
      total += p.votes;
    }
  }
  const pct = Array.from(natVotes, (v) => (100 * v) / total);
  const hist: number[][][] = input.constituencies.map((c) => c.parties.map(() => new Array(c.seats + 1).fill(0)));
  const natRuns = ids.map(() => new Uint16Array(sims));
  const factor = new Float64Array(ids.length);

  for (let s = 0; s < sims; s++) {
    for (let i = 0; i < ids.length; i++)
      factor[i] = pct[i] > 0 ? Math.max(0.05, (pct[i] + gauss() * pollError(pct[i])) / pct[i]) : 1;
    for (let ci = 0; ci < input.constituencies.length; ci++) {
      const c = input.constituencies[ci];
      const votes = c.parties.map((p) => p.votes * factor[index.get(p.id)!] * Math.exp(gauss() * LOCAL_NOISE));
      const seats = allocate(votes, c.seats, { blank: c.blank });
      for (let pi = 0; pi < seats.length; pi++) {
        hist[ci][pi][seats[pi]]++;
        natRuns[index.get(c.parties[pi].id)!][s] += seats[pi];
      }
    }
  }

  const seats: SimResult['seats'] = {};
  input.constituencies.forEach((c, ci) => {
    seats[c.id] = {};
    c.parties.forEach((p, pi) => (seats[c.id][p.id] = hist[ci][pi].map((n) => n / sims)));
  });
  const national: SimResult['national'] = {};
  ids.forEach((id, i) => {
    const sorted = Array.from(natRuns[i]).sort((a, b) => a - b);
    const q = (x: number) => sorted[Math.min(sims - 1, Math.floor(x * sims))];
    if (q(0.95) > 0) national[id] = [q(0.05), q(0.5), q(0.95)];
  });
  return { sims, seats, national };
}

/** Chance of at least one seat, and chance the seat count differs from the central one. */
export function seatOdds(dist: number[] | undefined, central: number) {
  if (!dist) return null;
  return {
    any: 1 - (dist[0] ?? 1),
    more: dist.slice(central + 1).reduce((a, b) => a + b, 0),
    fewer: dist.slice(0, central).reduce((a, b) => a + b, 0)
  };
}
