import { allocate } from './allocate';
import type { Constituency, PartyTally } from './types';

export type SystemId = 'actual' | 'nacional' | 'sainte-lague' | 'hare' | 'sin-barrera';
export const SYSTEMS: SystemId[] = ['actual', 'sainte-lague', 'hare', 'sin-barrera', 'nacional'];

/** The same votes counted with other rules. */
export function recount(cons: Constituency[], system: SystemId): PartyTally[] {
  const acc = new Map<string, PartyTally>();
  const add = (id: string, votes: number, seats: number) => {
    const t = acc.get(id) ?? { id, votes: 0, seats: 0 };
    t.votes += votes;
    t.seats += seats;
    acc.set(id, t);
  };
  if (system === 'nacional') {
    let blank = 0;
    let seats = 0;
    for (const c of cons) {
      blank += c.blank;
      seats += c.seats;
      for (const p of c.parties) add(p.id, p.votes, 0);
    }
    const list = [...acc.values()];
    const s = allocate(list.map((p) => p.votes), seats, { blank, threshold: 0 });
    list.forEach((p, i) => (p.seats = s[i]));
  } else {
    for (const c of cons) {
      const s = allocate(c.parties.map((p) => p.votes), c.seats, {
        blank: c.blank,
        method: system === 'sainte-lague' ? 'sainte-lague' : system === 'hare' ? 'hare' : 'dhondt',
        threshold: system === 'sin-barrera' ? 0 : 0.03
      });
      c.parties.forEach((p, i) => add(p.id, p.votes, s[i]));
    }
  }
  return [...acc.values()].sort((a, b) => b.seats - a.seats || b.votes - a.votes);
}
