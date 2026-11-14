import type { Method } from './types';

export interface AllocateOptions {
  method?: Method;
  /** Share of valid votes (parties + blank) a list needs to enter the count. LOREG: 3%. */
  threshold?: number;
  blank?: number;
}

/**
 * Shares `seats` among lists. Returns seats in the same order as `votes`.
 * Ties go to the list with more votes (LOREG art. 163.1.d), then to the earlier one.
 */
export function allocate(votes: readonly number[], seats: number, opts: AllocateOptions = {}): number[] {
  const { method = 'dhondt', threshold = 0.03, blank = 0 } = opts;
  const n = votes.length;
  const out = new Array<number>(n).fill(0);
  let valid = blank;
  for (let i = 0; i < n; i++) valid += votes[i];
  const min = threshold * valid;
  const ok: number[] = [];
  for (let i = 0; i < n; i++) if (votes[i] > 0 && votes[i] >= min) ok.push(i);
  if (!ok.length || seats <= 0) return out;

  if (method === 'hare') {
    let total = 0;
    for (const i of ok) total += votes[i];
    const quota = total / seats;
    let left = seats;
    const rem: [number, number][] = [];
    for (const i of ok) {
      const s = Math.floor(votes[i] / quota);
      out[i] = s;
      left -= s;
      rem.push([votes[i] - s * quota, i]);
    }
    rem.sort((a, b) => b[0] - a[0] || votes[b[1]] - votes[a[1]]);
    for (let k = 0; k < left; k++) out[rem[k % rem.length][1]]++;
    return out;
  }

  const step = method === 'sainte-lague' ? 2 : 1;
  for (let s = 0; s < seats; s++) {
    let best = -1;
    let bestQ = -1;
    for (const i of ok) {
      const q = votes[i] / (out[i] * step + 1);
      if (q > bestQ || (q === bestQ && votes[i] > votes[best])) {
        bestQ = q;
        best = i;
      }
    }
    out[best]++;
  }
  return out;
}

/**
 * Seats per province for the Congress (LOREG art. 162): 2 per province, 1 for Ceuta and
 * Melilla, and the other 248 by population with largest remainders.
 */
export function apportion(population: Record<string, number>, total = 350): Record<string, number> {
  const fixed = (c: string) => (c === '51' || c === '52' ? 1 : 2);
  const codes = Object.keys(population);
  const rest = total - codes.reduce((a, c) => a + fixed(c), 0);
  const provs = codes.filter((c) => fixed(c) === 2);
  const pop = provs.reduce((a, c) => a + population[c], 0);
  const quota = pop / rest;
  const out: Record<string, number> = {};
  let left = rest;
  const rem: [number, string][] = [];
  for (const c of codes) out[c] = fixed(c);
  for (const c of provs) {
    const s = Math.floor(population[c] / quota);
    out[c] += s;
    left -= s;
    rem.push([population[c] / quota - s, c]);
  }
  rem.sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < left; k++) out[rem[k][1]]++;
  return out;
}
