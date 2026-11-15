import { allocate } from './allocate';
import { partyMetrics, type PartyMetrics } from './metrics';
import type { Chamber, Constituency } from './types';

/** A seat is "by a hair" when it hangs on fewer than this share of the valid votes. */
export const TIGHT = 0.02;

export interface LastSeat {
  /** List holding the cheapest (last) seat. */
  last: string;
  /** List that would take it: the best quotient left without a seat. */
  runner: string | null;
}

/** Who holds the last D'Hondt seat of a constituency and who is next in line. */
export function lastSeat(c: Constituency): LastSeat | null {
  const bar = 0.03 * c.valid;
  let last: string | null = null;
  let lastQ = Infinity;
  let runner: string | null = null;
  let runnerQ = 0;
  for (const p of c.parties) {
    if (p.votes < bar) continue;
    if (p.seats > 0 && p.votes / p.seats < lastQ) {
      lastQ = p.votes / p.seats;
      last = p.id;
    }
    if (p.seats < c.seats && p.votes / (p.seats + 1) > runnerQ) {
      runnerQ = p.votes / (p.seats + 1);
      runner = p.id;
    }
  }
  return last ? { last, runner } : null;
}

export type PartyVerdict =
  | { kind: 'holdTight'; margin: number; rival: string | null }
  | { kind: 'gainTight'; margin: number; rival: string | null; first: boolean }
  | { kind: 'safe'; margin: number }
  | { kind: 'far'; margin: number | null };

/** The one-line story of a vote for a list here. */
export function partyVerdict(c: Constituency, id: string, chamber: Chamber, pm: PartyMetrics = partyMetrics(c, id, chamber)): PartyVerdict | null {
  if (!pm.found || pm.noData) return null;
  const tight = TIGHT * c.valid;
  const ls = chamber === 'congreso' ? lastSeat(c) : null;
  const lose = pm.toLose ?? Infinity;
  const gain = pm.toGain ?? Infinity;
  if (pm.seats > 0 && lose <= tight && lose <= gain)
    return { kind: 'holdTight', margin: lose, rival: ls && ls.runner !== id ? ls.runner : null };
  if (gain <= tight) return { kind: 'gainTight', margin: gain, rival: ls && ls.last !== id ? ls.last : null, first: pm.seats === 0 };
  if (pm.seats > 0) return { kind: 'safe', margin: lose };
  return { kind: 'far', margin: pm.toGain };
}

export type BlankVerdict =
  | { kind: 'costsSeat'; party: string }
  | { kind: 'raisesBar'; party: string; share: number }
  | { kind: 'nothing' };

/** What blank ballots do here: they raise the 3% bar, and sometimes that costs a list a seat. */
export function blankVerdict(c: Constituency): BlankVerdict {
  const v = c.parties.map((p) => p.votes);
  const a = allocate(v, c.seats, { blank: c.blank });
  const b = allocate(v, c.seats, { blank: 0 });
  const hurt = c.parties.findIndex((_, i) => b[i] > a[i]);
  if (hurt >= 0) return { kind: 'costsSeat', party: c.parties[hurt].id };
  // The list just under the bar, if it is within half a point of it.
  let best: { party: string; share: number } | null = null;
  for (const p of c.parties) {
    const share = c.valid > 0 ? p.votes / c.valid : 0;
    if (share < 0.03 && share >= 0.025 && (!best || share > best.share)) best = { party: p.id, share };
  }
  return best ? { kind: 'raisesBar', ...best } : { kind: 'nothing' };
}
