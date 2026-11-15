import { polls } from './data';
import { averagePolls } from './polls';
import { project } from './projection';
import { realCongress } from './scenario';
import type { Constituency, ElectionId } from './types';

export interface Frame {
  /** Real result of an election, or the poll average up to `date`. */
  election: ElectionId;
  date: string;
  real: boolean;
}

const REAL: Frame[] = [
  { election: 'e2019a', date: '2019-04-28', real: true },
  { election: 'e2019n', date: '2019-11-10', real: true },
  { election: 'e2023', date: '2023-07-23', real: true }
];
const DAY = 86_400_000;

/** Moments of the Congress you can travel to: three real results, then the polls every few days. */
export function frames(minGapDays = 3): Frame[] {
  const dates = [...new Set(polls.map((p) => p.end))].sort();
  const out: string[] = [];
  // Walk back from the latest poll so the last frame is always today's picture.
  for (let i = dates.length - 1; i >= 0; i--) {
    const prev = out[0];
    if (!prev || (Date.parse(prev) - Date.parse(dates[i])) / DAY >= minGapDays) out.unshift(dates[i]);
  }
  // The first days have too few polls to average.
  const usable = out.filter((d) => polls.filter((p) => p.end <= d).length >= 3);
  return [...REAL, ...usable.map((date) => ({ election: 'e2026' as const, date, real: false }))];
}

const cache = new Map<string, Constituency[]>();
export function frameConstituencies(f: Frame): Constituency[] {
  const key = `${f.election}:${f.date}`;
  let c = cache.get(key);
  if (!c) {
    c = f.real
      ? realCongress(f.election as Exclude<ElectionId, 'e2026'>)
      : project({ shares: averagePolls(polls.filter((p) => p.end <= f.date)).shares });
    cache.set(key, c);
  }
  return c;
}
