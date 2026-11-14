import { provinces, real } from './data';
import { project, type ProjectionInput } from './projection';
import { senate2023Result, senate2026Projection } from './senate';
import type { Chamber, Constituency, ElectionId, PartyTally, Scenario } from './types';

export function realCongress(e: Exclude<ElectionId, 'e2026'>): Constituency[] {
  return Object.entries(real(e)).map(([code, p]) => {
    const parties = p.parties.map(([id, votes, seats]) => ({ id, votes, seats }));
    return {
      id: code,
      prov: code,
      name: provinces[code].name,
      seats: p.seats,
      census: p.census,
      blank: p.blank,
      invalid: p.invalid,
      valid: parties.reduce((a, t) => a + t.votes, 0) + p.blank,
      parties
    };
  });
}

export function nationalTally(cons: Constituency[]): PartyTally[] {
  const acc = new Map<string, PartyTally>();
  for (const c of cons)
    for (const p of c.parties) {
      const t = acc.get(p.id) ?? { id: p.id, votes: 0, seats: 0 };
      t.votes += p.votes;
      t.seats += p.seats;
      acc.set(p.id, t);
    }
  return [...acc.values()].sort((a, b) => b.seats - a.seats || b.votes - a.votes);
}

/** Senate data exists for 2023 (real) and 2026 (estimate). */
export const hasSenate = (e: ElectionId) => e === 'e2026' || e === 'e2023';

export function buildScenario(election: ElectionId, chamber: Chamber, input: ProjectionInput): Scenario {
  let cons: Constituency[];
  if (chamber === 'senado' && hasSenate(election))
    cons = election === 'e2026' ? senate2026Projection(input.shares, input.turnoutDelta) : senate2023Result();
  else if (election === 'e2026') cons = project(input).map((c) => ({ ...c, name: provinces[c.id].name }));
  else cons = realCongress(election);
  cons.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return {
    election,
    chamber,
    projected: election === 'e2026',
    constituencies: cons,
    totalSeats: cons.reduce((a, c) => a + c.seats, 0),
    totalCensus: cons.reduce((a, c) => a + c.census, 0),
    national: nationalTally(cons)
  };
}
