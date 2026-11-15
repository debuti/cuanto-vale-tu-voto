// Renders the brand assets (favicon, mascot, logos, social image) from SVG with resvg.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import wawoff2 from 'wawoff2';

const map = JSON.parse(readFileSync('src/lib/data/map.json', 'utf8'));
const congress = JSON.parse(readFileSync('src/lib/data/congress.json', 'utf8')).e2026.provinces;
// resvg reads TTF, the self-hosted fonts are WOFF2: unpack them into the cache first.
mkdirSync('.cache/fonts', { recursive: true });
const fontFiles = [];
for (const name of ['fredoka', 'nunito']) {
  const ttf = `.cache/fonts/${name}.ttf`;
  writeFileSync(ttf, await wawoff2.decompress(readFileSync(`node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`)));
  fontFiles.push(ttf);
}
const INK = '#2a2440';

const urni = (x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="60" cy="110" rx="34" ry="5" fill="${INK}" opacity=".1"/>
  <g transform="rotate(-4 60 40)"><rect x="40" y="6" width="40" height="34" rx="5" fill="#fff" stroke="${INK}" stroke-width="3"/>
  <path d="M42 10l18 14 18-14" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
  <rect x="14" y="34" width="92" height="72" rx="18" fill="#b9a8ff" stroke="${INK}" stroke-width="3"/>
  <rect x="14" y="34" width="92" height="22" rx="11" fill="#8f77f2" stroke="${INK}" stroke-width="3"/>
  <rect x="36" y="42" width="48" height="6" rx="3" fill="${INK}"/>
  <ellipse cx="34" cy="84" rx="7" ry="4.5" fill="#ff9dbb" opacity=".8"/><ellipse cx="86" cy="84" rx="7" ry="4.5" fill="#ff9dbb" opacity=".8"/>
  <circle cx="45" cy="74" r="5.5" fill="${INK}"/><circle cx="75" cy="74" r="5.5" fill="${INK}"/>
  <circle cx="47" cy="72" r="1.8" fill="#fff"/><circle cx="77" cy="72" r="1.8" fill="#fff"/>
  <path d="M52 85q8 9 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>`;

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

// Spain coloured by the weight of a vote (same ramp as the app).
function spain(x, y, scale) {
  const ws = Object.fromEntries(Object.entries(congress).map(([k, p]) => [k, Math.log(p.seats / p.census)]));
  const lo = Math.min(...Object.values(ws));
  const hi = Math.max(...Object.values(ws));
  const ramp = [[222, 213, 255], [155, 132, 240], [58, 28, 158]];
  const color = (t) => {
    const v = t * 2, i = Math.min(1, Math.floor(v)), f = v - i;
    return `rgb(${ramp[i].map((c, k) => Math.round(c + (ramp[i + 1][k] - c) * f)).join(',')})`;
  };
  const shapes = Object.entries(map.provinces).map(([k, s]) => {
    const fill = color((ws[k] - lo) / (hi - lo));
    return s.tiny ? `<circle cx="${s.cx}" cy="${s.cy}" r="11" fill="${fill}" stroke="#fff" stroke-width="1.5"/>` : `<path d="${s.d}" fill="${fill}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>`;
  });
  return `<g transform="translate(${x} ${y}) scale(${scale})">${shapes.join('')}</g>`;
}

const bg = (w, h) => `<rect width="${w}" height="${h}" fill="#fff8ee"/><circle cx="${w}" cy="0" r="${h * 0.55}" fill="#ffe0ec"/><circle cx="0" cy="${h}" r="${h * 0.45}" fill="#dcefff"/>`;
const title = (x, y, size, anchor = 'start') => `<text x="${x}" y="${y}" font-family="Fredoka" font-weight="600" font-size="${size}" fill="${INK}" stroke="${INK}" stroke-width="${size / 30}" stroke-linejoin="round" text-anchor="${anchor}">`;

const files = {
  'static/favicon.svg': svg(120, 120, urni()),
  'static/brand/urni.svg': svg(120, 120, urni())
};
const pngs = {
  'static/brand/urni.png': [svg(1024, 1024, urni(32, 32, 8)), 1024],
  'static/brand/logo-square.png': [svg(1024, 1024, `<rect width="1024" height="1024" rx="220" fill="#efeaff"/>${urni(122, 112, 6.5)}`), 1024],
  'static/brand/logo-horizontal.png': [
    svg(1600, 400, `${bg(1600, 400)}${urni(40, 30, 2.9)}${title(410, 240, 120)}¿Cuánto vale tu voto?</text>`),
    1600
  ],
  'static/og.png': [
    svg(
      1200,
      630,
      `${bg(1200, 630)}${spain(640, 100, 0.56)}${urni(60, 50, 1.5)}
      ${title(60, 330, 88)}¿Cuánto vale</text>${title(60, 425, 88)}tu voto?</text>
      <text x="62" y="490" font-family="Nunito" font-weight="700" font-size="30" fill="#4f4868">Depende de dónde votas y a quién votas.</text>
      <text x="62" y="532" font-family="Nunito" font-weight="700" font-size="30" fill="#4f4868">Elecciones generales · 29N 2026</text>
      <text x="62" y="590" font-family="Nunito" font-weight="800" font-size="26" fill="#5b3fd6">labs.nubuza.com/cuanto-vale-tu-voto</text>`
    ),
    1200
  ]
};

mkdirSync('static/brand', { recursive: true });
for (const [path, body] of Object.entries(files)) writeFileSync(path, body);
for (const [path, [body, width]] of Object.entries(pngs)) {
  const r = new Resvg(body, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Nunito' } });
  writeFileSync(path, r.render().asPng());
}
console.log('brand assets ready');
