export interface Seat {
  x: number;
  y: number;
}
export interface Hemicycle {
  seats: Seat[];
  r: number;
  w: number;
  h: number;
}

/** Seats of a semicircular chamber, ordered left to right (so parties form wedges). */
export function hemicycle(total: number, w = 600): Hemicycle {
  const rows = total > 300 ? 10 : total > 150 ? 8 : total > 60 ? 6 : 4;
  const outer = w / 2 - 12;
  const inner = outer * 0.4;
  const gap = (outer - inner) / (rows - 1);
  const radii = Array.from({ length: rows }, (_, i) => inner + i * gap);
  const sum = radii.reduce((a, b) => a + b, 0);
  const exact = radii.map((r) => (total * r) / sum);
  const n = exact.map(Math.floor);
  let left = total - n.reduce((a, b) => a + b, 0);
  const byRest = exact.map((e, i) => [e - n[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k++, left--) n[byRest[k % rows][1]]++;

  const cx = w / 2;
  const cy = outer + 12;
  const all: { a: number; r: number; x: number; y: number }[] = [];
  radii.forEach((r, i) => {
    for (let k = 0; k < n[i]; k++) {
      const a = n[i] === 1 ? Math.PI / 2 : Math.PI - (k * Math.PI) / (n[i] - 1);
      all.push({ a, r, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
    }
  });
  all.sort((p, q) => q.a - p.a || q.r - p.r);
  const arc = (Math.PI * inner) / Math.max(1, n[0] - 1);
  return { seats: all.map(({ x, y }) => ({ x, y })), r: Math.min(gap, arc) * 0.42, w, h: cy + 14 };
}
