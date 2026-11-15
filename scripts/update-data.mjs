// Builds the static data the app ships with, from public sources.
//   node scripts/update-data.mjs           -> parse the cached downloads
//   node scripts/update-data.mjs --fetch   -> download everything again first
//   node scripts/update-data.mjs --polls   -> download only the poll table again
// Sources: Wikipedia constituency articles (which cite the Ministerio del Interior),
// Wikipedia's poll table (private pollsters only, CIS excluded) and open province shapes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';
import {
  PROVINCES,
  ISLANDS,
  KEY_TO_ID,
  KEY_OVERRIDES,
  PARTY_NAMES,
  COLOR_OVERRIDES,
  MONTHS
} from './lib/tables.mjs';
import { buildMap } from './lib/geo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, '.cache');
const OUT = path.join(ROOT, 'src/lib/data');
const UA = 'Mozilla/5.0 (compatible; data-fetch)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- download ----------
async function raw(title) {
  const url = `https://en.wikipedia.org/w/index.php?action=raw&title=${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${title}`);
  await sleep(400);
  return res.text();
}
async function fetchPolls() {
  fs.mkdirSync(path.join(CACHE, 'wiki'), { recursive: true });
  fs.writeFileSync(
    path.join(CACHE, 'wiki/polls.wiki'),
    await raw('Opinion polling for the 2026 Spanish general election')
  );
}
async function fetchAll() {
  for (const d of ['wiki/cong', 'wiki/sen']) fs.mkdirSync(path.join(CACHE, d), { recursive: true });
  await fetchPolls();
  for (const name of Object.keys(PROVINCES)) {
    const t = name.replace(/_/g, ' ');
    fs.writeFileSync(
      path.join(CACHE, `wiki/cong/${name}.wiki`),
      await raw(`${t} (Congress of Deputies constituency)`)
    );
    if (!['Balearic_Islands', 'Las_Palmas', 'Santa_Cruz_de_Tenerife'].includes(name))
      fs.writeFileSync(path.join(CACHE, `wiki/sen/${name}.wiki`), await raw(`${t} (Senate constituency)`));
  }
  for (const name of Object.keys(ISLANDS))
    fs.writeFileSync(
      path.join(CACHE, `wiki/sen/${name}.wiki`),
      await raw(`${name.replace(/_/g, ' ')} (Senate constituency)`)
    );
  const geo = await fetch(
    'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-provinces.geojson'
  );
  fs.writeFileSync(path.join(CACHE, 'prov.geojson'), await geo.text());
  fs.rmSync(path.join(CACHE, 'colors.json'), { force: true });
}

// ---------- wikitext parsing ----------
function section(text, name) {
  const out = [];
  let on = false;
  for (const l of text.split('\n')) {
    if (/^===[^=]/.test(l)) {
      on = l.replace(/=/g, '').trim() === name;
      continue;
    }
    if (/^==[^=]/.test(l)) on = false;
    if (on) out.push(l);
  }
  return out.join('\n');
}
const num = (s) => {
  const m = (s ?? '').replace(/'''/g, '').match(/[\d,]+/);
  return m ? Number(m[0].replace(/,/g, '')) : null;
};
const TOTALS = {
  'Blank ballots': 'blank',
  'Valid votes': 'valid',
  'Invalid votes': 'invalid',
  'Votes cast / turnout': 'cast',
  'Registered voters': 'census'
};
function tableRows(sec) {
  const start = sec.indexOf('{|');
  if (start < 0) return null;
  return sec.slice(start, sec.indexOf('\n|}', start)).split(/\n\|-[^\n]*/);
}
function readTotals(rows) {
  const totals = {};
  for (const r of rows) {
    const t = r.match(/colspan="[23]"\|\s*(Blank ballots|Valid votes|Invalid votes|Votes cast \/ turnout|Registered voters)/);
    if (!t) continue;
    const lines = r.split('\n').map((l) => l.trim()).filter(Boolean);
    totals[TOTALS[t[1]]] = num(lines.slice(1).join(' ').replace(/^\|/, '').split('||')[0]);
  }
  return totals;
}
function cleanLabel(line) {
  const label = line
    .replace(/^\|[^|[]*\|\s*/, '')
    .replace(/<sup>.*?<\/sup>/g, '')
    .replace(/\{\{efn.*$/, '')
    .replace(/<ref.*$/, '');
  return label.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').trim();
}
/** "Parties and alliances" table: votes and seats per party. */
function parsePartyTable(sec) {
  const rows = tableRows(sec);
  if (!rows) return null;
  const parties = [];
  for (const r of rows) {
    const color = r.match(/background:\{\{party color\|([^}]+)\}\}/);
    const lines = r.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!color || lines.length < 3) continue;
    const plain = cleanLabel(lines[1]);
    const ab = plain.match(/\(([^()]*)\)\s*$/);
    parties.push({
      key: color[1].trim(),
      abbr: ab ? ab[1] : plain,
      votes: num(lines[2].replace(/^\|/, '').split('||')[0]),
      seats: num((lines[3] ?? '').replace(/^\|/, '').split('||')[0]) ?? 0
    });
  }
  return { parties, totals: readTotals(rows) };
}
/** Senate table listing candidates one by one (elected ones carry a tick). */
function parseCandidateTable(sec) {
  const rows = tableRows(sec);
  if (!rows) return null;
  const byKey = new Map();
  for (const r of rows) {
    const color = r.match(/background:\{\{party color\|([^}]+)\}\}/);
    const lines = r.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!color || lines.length < 4) continue;
    const key = color[1].trim();
    const p = byKey.get(key) ?? { key, abbr: cleanLabel(lines[2]), votes: 0, seats: 0 };
    p.votes += num(lines[3]) ?? 0;
    if (lines[0].includes('{{tick')) p.seats++;
    byKey.set(key, p);
  }
  return { parties: [...byKey.values()], totals: readTotals(rows) };
}

// ---------- parties ----------
const partyMeta = new Map(); // id -> { keys:Set, abbrs: Map(abbr->count) }
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28);
function partyId(key, abbr, election) {
  const id = KEY_OVERRIDES[election]?.[key] ?? KEY_TO_ID[key] ?? 'x-' + slug(key);
  const m = partyMeta.get(id) ?? { keys: new Set(), abbrs: new Map() };
  m.keys.add(key);
  m.abbrs.set(abbr, (m.abbrs.get(abbr) ?? 0) + 1);
  partyMeta.set(id, m);
  return id;
}
/** Merge rows that map to the same id (e.g. PSOE + PSC never share a province, but be safe). */
function mergeParties(list, election) {
  const out = new Map();
  for (const p of list) {
    const id = partyId(p.key, p.abbr, election);
    const cur = out.get(id) ?? [id, 0, 0];
    cur[1] += p.votes ?? 0;
    cur[2] += p.seats ?? 0;
    out.set(id, cur);
  }
  return [...out.values()].sort((a, b) => b[1] - a[1]);
}

// ---------- Congress ----------
const ELECTIONS = [
  ['e2023', '2023', '2023-07-23'],
  ['e2019n', 'November 2019', '2019-11-10'],
  ['e2019a', 'April 2019', '2019-04-28']
];
function buildCongress() {
  const dir = path.join(CACHE, 'wiki/cong');
  const out = { e2026: { date: '2026-11-29', provinces: {} } };
  const warnings = [];
  for (const [id, , date] of ELECTIONS) out[id] = { date, provinces: {} };
  for (const [file, [code]] of Object.entries(PROVINCES)) {
    const txt = fs.readFileSync(path.join(dir, `${file}.wiki`), 'utf8');
    for (const [id, title] of ELECTIONS) {
      const t = parsePartyTable(section(txt, title));
      if (!t) throw new Error(`no table ${file} ${title}`);
      const parties = mergeParties(t.parties, id);
      const sum = parties.reduce((a, p) => a + p[1], 0);
      const { blank, invalid, census, valid } = t.totals;
      if (sum + blank !== valid) warnings.push(`${file} ${id}: parties+blank=${sum + blank}, valid=${valid}`);
      out[id].provinces[code] = {
        seats: parties.reduce((a, p) => a + p[2], 0),
        census,
        blank,
        invalid,
        parties
      };
    }
    const t = parsePartyTable(section(txt, '2026'));
    if (!t?.totals.census) throw new Error(`no 2026 census ${file}`);
    const lists = [...new Set(t.parties.map((p) => partyId(p.key, p.abbr, 'e2026')))];
    const seats23 = out.e2023.provinces[code].seats;
    // RD 806/2026: Madrid gains a seat, Cádiz loses one.
    const seats = seats23 + (code === '28' ? 1 : code === '11' ? -1 : 0);
    out.e2026.provinces[code] = { seats, census: t.totals.census, lists };
  }
  for (const [id, e] of Object.entries(out)) {
    const total = Object.values(e.provinces).reduce((a, p) => a + p.seats, 0);
    if (total !== 350) throw new Error(`${id}: ${total} seats`);
  }
  return { out, warnings };
}

// ---------- Senate ----------
function buildSenate(congress) {
  const dir = path.join(CACHE, 'wiki/sen');
  const cons = [];
  const add = (file, id, name, prov, seats) => {
    const sec = section(fs.readFileSync(path.join(dir, `${file}.wiki`), 'utf8'), '2023');
    const t = sec.includes('Parties and alliances') ? parsePartyTable(sec) : parseCandidateTable(sec);
    if (!t) throw new Error(`no senate table ${file}`);
    const parties = mergeParties(t.parties, 's2023').filter((p) => p[1] > 0);
    const won = parties.reduce((a, p) => a + p[2], 0);
    if (won !== seats) throw new Error(`senate ${file}: ${won} winners, expected ${seats}`);
    cons.push({ id, name, prov, seats, census: t.totals.census, blank: t.totals.blank ?? 0, parties });
  };
  for (const [file, [code, name]] of Object.entries(PROVINCES)) {
    if (['07', '35', '38'].includes(code)) continue;
    add(file, code, name, code, code === '51' || code === '52' ? 2 : 4);
  }
  for (const [file, [id, name, prov, seats]] of Object.entries(ISLANDS)) add(file, id, name, prov, seats);
  cons.sort((a, b) => a.id.localeCompare(b.id));
  const total = cons.reduce((a, c) => a + c.seats, 0);
  if (total !== 208) throw new Error(`senate seats ${total}`);
  // 2026: same constituencies, but Ibiza and Formentera elect one senator each.
  // Census scaled with the province's Congress census; Formentera share is an estimate.
  const FORMENTERA_SHARE = 0.075;
  const cons26 = [];
  for (const c of cons) {
    const k = congress.e2026.provinces[c.prov].census / congress.e2023.provinces[c.prov].census;
    const census = Math.round(c.census * k);
    if (c.id === '07-ibf') {
      cons26.push({ id: '07-ibi', name: 'Ibiza', prov: '07', seats: 1, census: Math.round(census * (1 - FORMENTERA_SHARE)), base: c.id });
      cons26.push({ id: '07-for', name: 'Formentera', prov: '07', seats: 1, census: Math.round(census * FORMENTERA_SHARE), base: c.id });
    } else cons26.push({ id: c.id, name: c.name, prov: c.prov, seats: c.seats, census, base: c.id });
  }
  return { s2023: cons, s2026: cons26 };
}

// ---------- polls ----------
const PARTY_POLLS = /^(PP|PSOE|Vox|Sumar|Podemos|Frente Amplio|FA|ERC|Junts|SALF)$/i;
function buildPolls() {
  const txt = fs.readFileSync(path.join(CACHE, 'wiki/polls.wiki'), 'utf8');
  const start = txt.indexOf('=====2026 (with Broad Front)=====');
  const table = txt.slice(start, txt.indexOf('\n|}', start));
  const cols = [...table.matchAll(/^! style="color:inherit;background:\{\{party color\|([^}]+)\}\};"\|/gm)].map(
    (m) => KEY_TO_ID[m[1].trim()]
  );
  if (cols.length < 10 || cols.some((c) => !c)) throw new Error('poll columns: ' + cols);
  const polls = [];
  for (const row of table.split(/\n\|-[^\n]*/).slice(2)) {
    const cells = row.split('\n').filter((l) => l.startsWith('|'));
    if (cells.length < 4 + cols.length) continue;
    const head = cells[0].replace(/^\|\s*/, '');
    const firmFull = head.replace(/<ref.*$/s, '').replace(/\{\{.*$/s, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').trim();
    const [firm, ...media] = firmFull.split('/');
    if (!firm || /^CIS\b/i.test(firm.trim())) continue; // CIS excluded on purpose
    if (PARTY_POLLS.test(firm.trim())) continue; // parties' own internal polls are not independent
    const url = head.match(/url=([^ |}]+)/)?.[1] ?? null;
    const dates = [...cells[1].matchAll(/(\d{1,2})(?:\s*([A-Z][a-z]{2}))?/g)];
    const months = [...cells[1].matchAll(/([A-Z][a-z]{2})/g)].map((m) => MONTHS[m[1]]).filter(Boolean);
    if (!dates.length || !months.length) continue;
    const endDay = Number(dates[dates.length - 1][1]);
    const endMonth = months[months.length - 1];
    const startDay = Number(dates[0][1]);
    const startMonth = months[0];
    const iso = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const sample = num(cells[2]);
    const shares = {};
    const merged = [];
    let ci = 0;
    for (const cell of cells.slice(4)) {
      if (ci >= cols.length) break;
      const span = Number(cell.match(/colspan="(\d)"/)?.[1] ?? 1);
      const val = cell
        .replace(/^\|/, '')
        .replace(/\{\{Party shading[^}]*\}\}\s*\|/, '')
        .replace(/^[^|]*\|(?!\|)/, (m) => (/style=|colspan=/.test(m) ? '' : m))
        .split('<br')[0]
        .replace(/'''/g, '')
        .trim();
      const n = /^\d+(\.\d+)?$/.test(val) ? Number(val) : null;
      if (span === 1 && n !== null) shares[cols[ci]] = n;
      else if (n !== null) merged.push([cols.slice(ci, ci + span), n]);
      ci += span;
    }
    if (shares.pp == null || shares.psoe == null) continue;
    polls.push({
      firm: firm.trim(),
      media: media.join('/').trim() || null,
      start: iso(startMonth, startDay),
      end: iso(endMonth, endDay),
      sample,
      url,
      shares,
      merged
    });
  }
  // Lists polled together (one merged cell) are split with the average ratio of the polls
  // that publish them separately.
  for (const p of polls) {
    for (const [ids, total] of p.merged) {
      const avg = ids.map((id) => {
        const vals = polls.filter((q) => ids.every((i) => q.shares[i] != null)).map((q) => q.shares[id]);
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      });
      const sum = avg.reduce((a, b) => a + b, 0);
      if (sum > 0) ids.forEach((id, i) => (p.shares[id] = Math.round((total * avg[i] * 10) / sum) / 10));
    }
    delete p.merged;
  }
  polls.sort((a, b) => b.end.localeCompare(a.end));
  return { columns: cols, polls };
}

// ---------- colours ----------
async function colours(keys) {
  const file = path.join(CACHE, 'colors.json');
  const cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const missing = keys.filter((k) => !(k in cache));
  for (let i = 0; i < missing.length; i += 40) {
    const chunk = missing.slice(i, i + 40);
    const body = new URLSearchParams({
      action: 'expandtemplates',
      format: 'json',
      prop: 'wikitext',
      text: chunk.map((k) => `{{party color|${k}}}`).join('\n')
    });
    const res = await fetch('https://en.wikipedia.org/w/api.php', { method: 'POST', body, headers: { 'User-Agent': UA } });
    const lines = (await res.json()).expandtemplates.wikitext.split('\n');
    chunk.forEach((k, j) => (cache[k] = lines[j]?.replace(/&#35;/g, '#').trim() ?? ''));
    await sleep(400);
  }
  fs.writeFileSync(file, JSON.stringify(cache, null, 1));
  return cache;
}

// ---------- validation ----------
const PartyRow = v.tuple([v.string(), v.pipe(v.number(), v.integer(), v.minValue(0)), v.number()]);
const RealProvince = v.object({
  seats: v.pipe(v.number(), v.minValue(1)),
  census: v.pipe(v.number(), v.minValue(1000)),
  blank: v.number(),
  invalid: v.number(),
  parties: v.pipe(v.array(PartyRow), v.minLength(3))
});
const Poll = v.object({
  firm: v.pipe(v.string(), v.minLength(2)),
  media: v.nullable(v.string()),
  start: v.pipe(v.string(), v.isoDate()),
  end: v.pipe(v.string(), v.isoDate()),
  sample: v.nullable(v.number()),
  url: v.nullable(v.string()),
  shares: v.record(v.string(), v.pipe(v.number(), v.minValue(0), v.maxValue(60)))
});

// ---------- main ----------
if (process.argv.includes('--fetch')) await fetchAll();
else if (process.argv.includes('--polls')) await fetchPolls();
const { out: congress, warnings } = buildCongress();
for (const id of ['e2023', 'e2019n', 'e2019a'])
  for (const p of Object.values(congress[id].provinces)) v.parse(RealProvince, p);
const senate = buildSenate(congress);
const polls = buildPolls();
for (const p of polls.polls) v.parse(Poll, p);
if (polls.polls.length < 10) throw new Error('too few polls');

const allKeys = [...new Set([...partyMeta.values()].flatMap((m) => [...m.keys]))];
const col = await colours(allKeys);
const parties = {};
for (const [id, m] of partyMeta) {
  const abbr = [...m.abbrs.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [short, name] = PARTY_NAMES[id] ?? [abbr, abbr];
  const c = COLOR_OVERRIDES[id] ?? [...m.keys].map((k) => col[k]).find((x) => /^#[0-9a-f]{3,6}$/i.test(x ?? '')) ?? '#8a8fa3';
  parties[id] = { short, name, color: c.toUpperCase() };
}
parties.sdp = { short: PARTY_NAMES.sdp[0], name: PARTY_NAMES.sdp[1], color: COLOR_OVERRIDES.sdp };

const provinces = Object.fromEntries(Object.values(PROVINCES).map(([code, name, region]) => [code, { name, region }]));
const map = buildMap(JSON.parse(fs.readFileSync(path.join(CACHE, 'prov.geojson'), 'utf8')));

fs.mkdirSync(OUT, { recursive: true });
const write = (f, d) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(d));
write('parties.json', parties);
write('provinces.json', provinces);
write('congress.json', congress);
write('senate.json', senate);
write('polls.json', polls);
write('map.json', map);
write('meta.json', {
  updated: new Date().toISOString().slice(0, 10),
  pollCount: polls.polls.length,
  lastPoll: polls.polls[0].end,
  warnings
});
console.log(
  `ok: ${Object.keys(parties).length} parties, ${polls.polls.length} polls (last ${polls.polls[0].end}), ` +
    `${senate.s2023.length} senate constituencies, map ${JSON.stringify(map).length} bytes, ${warnings.length} warnings`
);
for (const w of warnings) console.log('  warn:', w);
