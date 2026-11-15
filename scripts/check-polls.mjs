// Guards the automatic poll refresh: node scripts/check-polls.mjs <old polls.json> <new polls.json>
// Exits 1 when the new table looks broken or tampered with (the source is a public wiki).
import fs from 'node:fs';

const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')).polls);
const avg = (polls, id) => {
  const v = polls.slice(0, 10).map((p) => p.shares[id]).filter((x) => x != null);
  return v.reduce((x, y) => x + y, 0) / v.length;
};
const problems = [];
if (b.length < a.length - 3) problems.push(`polls dropped from ${a.length} to ${b.length}`);
if (b[0].end < a[0].end) problems.push(`latest poll went back from ${a[0].end} to ${b[0].end}`);
if (b[0].end > new Date().toISOString().slice(0, 10)) problems.push(`latest poll is in the future: ${b[0].end}`);
for (const id of ['pp', 'psoe', 'vox']) {
  const d = Math.abs(avg(a, id) - avg(b, id));
  if (!(d < 3)) problems.push(`${id} moved ${d.toFixed(1)} points at once`);
}
if (problems.length) {
  console.error('polls rejected: ' + problems.join('; '));
  process.exit(1);
}
console.log(`polls ok: ${a.length} -> ${b.length}, latest ${b[0].end}`);
