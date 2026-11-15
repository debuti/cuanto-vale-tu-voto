import type { PartyTally } from './types';

/**
 * Where each list usually sits in the chamber, left to right, as drawn in the press and in
 * Wikipedia's diagrams. It is only the starting point: the reader can move any list.
 */
export const LEFT = ['bildu', 'cup', 'podemos', 'up', 'fa', 'sumar', 'aa', 'maspais', 'compromis', 'fv', 'bng', 'erc', 'psoe', 'sdp'];
export const MIDDLE = ['gbai', 'sy', 'te', 'prc', 'cca', 'pnv', 'junts', 'cs'];
export const RIGHT = ['pp', 'upn', 'nasuma', 'vox', 'salf'];
const SPECTRUM = [...LEFT, ...MIDDLE, ...RIGHT];

export type Side = 'left' | 'right' | 'none';
export const defaultSide = (id: string): Side => (LEFT.includes(id) ? 'left' : RIGHT.includes(id) ? 'right' : 'none');

const pos = (id: string) => {
  const i = SPECTRUM.indexOf(id);
  return i < 0 ? LEFT.length + MIDDLE.length / 2 : i;
};

/** By size: the usual order of a results table. */
export const bySize = (t: PartyTally[]) => [...t].sort((a, b) => b.seats - a.seats || b.votes - a.votes);

/**
 * Two sides facing each other: the left group fills the chamber from the left edge, the
 * right group from the right edge (its biggest list at the edge), the rest in the middle.
 */
export function bySides(t: PartyTally[], side: (id: string) => Side): PartyTally[] {
  const of = (s: Side) => t.filter((p) => side(p.id) === s);
  const big = (a: PartyTally, b: PartyTally) => b.seats - a.seats || b.votes - a.votes;
  return [...of('left').sort(big), ...of('none').sort((a, b) => pos(a.id) - pos(b.id)), ...of('right').sort(big).reverse()];
}

export const seatsOf = (t: PartyTally[], side: (id: string) => Side, s: Side) =>
  t.reduce((a, p) => a + (side(p.id) === s ? p.seats : 0), 0);
