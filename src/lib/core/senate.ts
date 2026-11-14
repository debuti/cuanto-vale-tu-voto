import { senate2023, senate2026, pollParties, real } from './data';
import type { Constituency, PartyTally } from './types';

/** How many candidates a voter may mark (limited vote). */
export const marks = (seats: number) => (seats >= 4 ? 3 : seats >= 2 ? 2 : 1);

/**
 * Party-line model: the most voted list takes as many senators as a voter may mark and
 * the runner-up takes the rest. It is what happens almost everywhere.
 */
export function senateSplit(seats: number): number[] {
  const first = marks(seats);
  return seats > first ? [first, seats - first] : [first];
}

function toConstituency(
  c: { id: string; name: string; prov: string; seats: number; census: number },
  rows: { id: string; votes: number; seats?: number }[],
  blank: number,
  model: boolean
): Constituency {
  const k = marks(c.seats);
  // Votes are per candidate: dividing by the marks allowed gives voters, roughly.
  const parties: PartyTally[] = rows
    .map((r) => ({ id: r.id, votes: Math.round(r.votes / k), seats: r.seats ?? 0 }))
    .sort((a, b) => b.votes - a.votes);
  if (model) senateSplit(c.seats).forEach((s, i) => parties[i] && (parties[i].seats = s));
  const valid = parties.reduce((a, p) => a + p.votes, 0) + blank;
  return { id: c.id, prov: c.prov, name: c.name, seats: c.seats, census: c.census, blank, invalid: 0, valid, parties };
}

/** Share of the smaller partner's voters assumed to follow it into a joint Senate list. */
export const ALLIANCE_KEEP = 0.75;

/** Real 2023 result: who was actually elected. */
export function senate2023Result(): Constituency[] {
  return senate2023.map((c) =>
    toConstituency(c, c.parties.map(([id, votes, seats]) => ({ id, votes, seats })), c.blank, false)
  );
}

/**
 * 2026 estimate: the 2023 Senate vote of each island or province, moved by the same
 * national swing as the Congress polls. PSOE and Frente Amplio stand together as
 * "Senado de Progreso", so their votes are added.
 */
export function senate2026Projection(shares: Record<string, number>, turnoutDelta = 0): Constituency[] {
  const base = real('e2023');
  let natValid = 0;
  const nat: Record<string, number> = {};
  for (const p of Object.values(base)) {
    natValid += p.blank;
    for (const [id, v] of p.parties) {
      natValid += v;
      nat[id] = (nat[id] ?? 0) + v;
    }
  }
  const pct = (id: string) => (100 * (nat[id] ?? 0)) / natValid;
  const ratio = (target: number | undefined, basePct: number) =>
    target == null || basePct <= 0 ? 1 : target / basePct;
  const polled = pollParties.reduce((a, id) => a + (shares[id] ?? 0), 0);
  const map: Record<string, { to: string; r: number }> = {
    pp: { to: 'pp', r: ratio(shares.pp, pct('pp') + pct('upn')) },
    upn: { to: 'pp', r: ratio(shares.pp, pct('pp') + pct('upn')) },
    psoe: { to: 'sdp', r: ratio(shares.psoe, pct('psoe')) },
    sumar: { to: 'sdp', r: ALLIANCE_KEEP * ratio((shares.fa ?? 0) + (shares.fv ?? 0), pct('sumar')) },
    vox: { to: 'vox', r: ratio(shares.vox, pct('vox')) }
  };
  for (const id of ['erc', 'junts', 'bildu', 'pnv', 'bng', 'cca']) map[id] = { to: id, r: ratio(shares[id], pct(id)) };
  const others = Math.min(2, Math.max(0.3, (100 - polled) / Math.max(1, 100 - pollParties.reduce((a, id) => a + pct(id), 0) - pct('sumar') - pct('upn'))));
  const byId = new Map(senate2023.map((c) => [c.id, c]));
  return senate2026.map((c) => {
    const b = byId.get(c.base)!;
    const grow = (c.census / b.census) * (1 + turnoutDelta / 70);
    const acc = new Map<string, number>();
    for (const [id, v] of b.parties) {
      const m = map[id] ?? { to: id, r: others };
      acc.set(m.to, (acc.get(m.to) ?? 0) + v * m.r * grow);
    }
    const rows = [...acc].map(([id, votes]) => ({ id, votes }));
    return toConstituency(c, rows, Math.round(b.blank * grow), true);
  });
}
