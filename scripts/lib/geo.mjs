// Turns the provinces GeoJSON into small SVG paths (no map tiles needed).
// The Canary Islands are moved next to the peninsula, as on every Spanish map.

const W = 1000;
const K = Math.cos((40 * Math.PI) / 180);
const CANARY = { dLon: 5.6, dLat: 6.6 };

function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return a / 2;
}
function centroid(ring) {
  let x = 0, y = 0, a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    x += (ring[j][0] + ring[i][0]) * f;
    y += (ring[j][1] + ring[i][1]) * f;
    a += f;
  }
  return [x / (3 * a), y / (3 * a)];
}
/** Douglas–Peucker. */
function simplify(ring, tol) {
  // A closed ring starts and ends on the same point: simplify it as two open halves.
  let far = 0, best = -1;
  for (let i = 1; i < ring.length - 1; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > best) { best = d; far = i; }
  }
  if (ring.length < 6 || far === 0) return ring;
  const a = simplifyLine(ring.slice(0, far + 1), tol);
  const b = simplifyLine(ring.slice(far), tol);
  return a.concat(b.slice(1));
}
function simplifyLine(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-12;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

export function buildMap(geojson) {
  const raw = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of geojson.features) {
    const code = f.properties.cod_prov;
    const canary = code === '35' || code === '38';
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    const rings = polys.map((p) =>
      p[0].map(([lon, lat]) => [(lon + (canary ? CANARY.dLon : 0)) * K, -(lat + (canary ? CANARY.dLat : 0))])
    );
    rings.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
    const kept = rings.filter((r, i) => i === 0 || Math.abs(area(r)) > 0.0012);
    raw[code] = kept;
    for (const r of kept) for (const [x, y] of r) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const pad = 0.15;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const s = W / (maxX - minX);
  const H = Math.round((maxY - minY) * s);
  const tx = ([x, y]) => [(x - minX) * s, (y - minY) * s];
  const provinces = {};
  for (const [code, rings] of Object.entries(raw)) {
    const tiny = code === '51' || code === '52';
    const scaled = rings.map((r) => r.map(tx));
    const d = scaled
      .map((r) => simplify(r, tiny ? 0.1 : 0.9))
      .filter((r) => r.length >= 4)
      .map((r) => 'M' + r.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z')
      .join('');
    const [cx, cy] = centroid(scaled[0]);
    provinces[code] = { d, cx: Math.round(cx), cy: Math.round(cy), ...(tiny ? { tiny: true } : {}) };
  }
  // Frame around the moved Canary Islands.
  const box = (codes) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of codes) for (const r of raw[c]) for (const p of r) {
      const [x, y] = tx(p);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return [Math.round(x0 - 8), Math.round(y0 - 8), Math.round(x1 - x0 + 16), Math.round(y1 - y0 + 16)];
  };
  return { w: W, h: H, inset: box(['35', '38']), provinces };
}
