import { partyMetrics, returnIndex, weight } from './metrics';
import type { Constituency, Scenario } from './types';

export interface ValueRow {
  cons: Constituency;
  party: string;
  /** 0–100, the same "return" index shown for your own vote. */
  index: number;
  /** Votes that separate this list from winning or losing a seat here. */
  margin: number;
  weight: number;
  seats: number;
}

/**
 * Every place-and-list pair ranked by how much one vote matters there: where the vote
 * weighs more and a seat is closer. Lists under 1% of the local vote are left out.
 */
export function valueRanking(s: Scenario): ValueRow[] {
  const rows: ValueRow[] = [];
  for (const c of s.constituencies) {
    const w = weight(c, s);
    for (const p of c.parties) {
      if (p.noData || p.votes < 0.01 * c.valid) continue;
      const pm = partyMetrics(c, p.id, s.chamber);
      const margin = Math.min(pm.toGain ?? Infinity, pm.toLose ?? Infinity);
      if (!Number.isFinite(margin)) continue;
      rows.push({ cons: c, party: p.id, index: returnIndex(c, s, pm).total, margin, weight: w, seats: pm.seats });
    }
  }
  return rows.sort((a, b) => b.index - a.index || a.margin - b.margin);
}
