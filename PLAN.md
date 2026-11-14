# ¿Cuánto vale tu voto? — Plan

An interactive, client-side web app that answers one question for Spanish voters:
**how much is my vote worth?** It depends on *where* you vote (province) and *who* you vote
for (party, given current polls). The user moves controls and instantly sees the "return"
of their vote.

Default nubuza app: static SvelteKit on Cloudflare, no backend, no accounts, all maths in
the browser. Deviations from the nubuza playbook are listed in **Decisions to agree**.

---

## 1. Decisions

| # | Decision | Status |
|---|---|---|
| 1 | Web only (no Android) | ✅ |
| 2 | No login, no accounts, all client-side | ✅ |
| 3 | Polls from public private pollsters; **CIS excluded** | ✅ |
| 4 | v1 covers **Congreso and Senado** | ✅ |
| 5 | **No Google Drive sync**: agreed exception to nubuza req. 2–3 (nothing worth syncing; last-used controls in localStorage) | ✅ exception |
| 6 | **Spanish only** (it only applies to Spanish voters): agreed exception to nubuza req. 13 (EN+ES). No `/en/`, `<html lang="es">` | ✅ exception |
| 7 | URL: `apps.nubuza.com/cuanto-vale-tu-voto/` | ✅ |
| 8 | Mascot: **Urni**, a little ballot box | ✅ |
| 9 | **Election selector**: 29N 2026 (projection from polls), 23J 2023, 10N 2019, 28A 2019 (real results) | ✅ |
| 10 | **Very attractive visuals** are a core requirement, not polish | ✅ |
| 11 | Strictly neutral: no voting advice, same treatment for every party | ✅ |
| 12 | Freeze polls during the legal 5-day blackout (LOREG art. 69.7): from **24 Nov 2026** for 29N | ✅ |

Note: the official polls are the **CIS**'s; the **INE** is the statistics institute and we
*do* use its census/population data (neutral, used by law to allocate seats).

**Timing**: general election on **29 Nov 2026** (RD 806/2026), 15 days from 2026-11-14.
To be useful it should launch before the poll blackout (24 Nov), ideally by ~20 Nov.

## 1b. Decisions taken while building v1.0.0 (2026-11-14)

- **Map**: hand-made SVG (simplified IGN provinces in `src/lib/data/map.json`) instead of MapLibre + OpenFreeMap: a choropleth of 52 shapes needs no tiles, weighs 60 kB and works offline.
- **Senate of 2019**: not in the data yet. Choosing Senado for 10N/28A 2019 shows a notice and falls back to the Congress.
- **Senate 2026**: PSOE + Frente Amplio stand together ("Senado de Progreso", id `sdp`); the model keeps 75 % of their separate votes (`ALLIANCE_KEEP`).
- **Data** lives in `src/lib/data/*.json`, rebuilt by `npm run data` (`scripts/update-data.mjs`). Party-commissioned polls are excluded as well as the CIS.
- **Social image** is `og.png` (rendered with resvg, which has no JPEG output).
- **No e2e yet**: the build container has no browser, so Playwright/axe have not run. Component tests run in jsdom instead (`src/lib/components/ui.test.ts`).

---

## 2. What the app computes

### 2.1 Where you vote (no polls needed)
Congreso: 350 seats, 52 constituencies (50 provinces + Ceuta + Melilla). Each province gets
2 seats, Ceuta and Melilla 1, the remaining 248 split by population (LOREG art. 162).
- **Electors per seat** in each province.
- **Vote weight** = national average electors/seat ÷ province electors/seat
  (e.g. "your vote in Soria weighs ~3× a vote in Madrid").
- Effective threshold: % of the vote needed to win the first seat there
  (with 3 seats it's ~25%, with 37 it's the legal 3%).

### 2.2 Who you vote for (needs results + polls)
D'Hondt per province with the 3% threshold, run on projected provincial votes.
- **Votes per seat** for each party, nationally and in your province.
- **Wasted vote risk**: share of the party's votes in your province that elect nobody.
- **Distance to the next seat / to losing the last one**: how many votes your party needs
  in your province to win one more seat (or how many it can lose). This is the "marginal
  value" of your vote, the core metric.
- **Decisiveness probability** (Monte Carlo, ~5–10k simulations in a Web Worker using poll
  uncertainty): chance that the last seat in your province is close; the probability your
  party wins/loses a seat there; expected seats with a range.
- **Return index** ("rentabilidad", 0–100): a single friendly score combining weight,
  marginal value and wasted-vote risk, with a breakdown so it isn't a black box.

### 2.3 Senado
208 directly elected senators (209 from 2026: Ibiza and Formentera now elect one each):
4 per peninsular province, 3 for Gran Canaria, Mallorca and Tenerife, 2 for Ceuta and
Melilla, 1 for each smaller island. Limited vote (up to 3 of 4, 2 of 3, 1 of 2).
- **Electors per senator** and vote weight: here the gap is huge (Soria ~75k electors for
  4 senators vs Madrid ~5M for 4).
- Projected senators by party assuming party-line voting (4 seats: winner 3, runner-up 1;
  the fight for "first place" is what makes a vote count).
- Real elections: actual senators per party per constituency.

### 2.4 Election selector
- **29N 2026**: projection from polls + 2023 provincial results, with uncertainty.
- **23J 2023, 10N 2019, 28A 2019**: real votes and seats per province; our D'Hondt must
  reproduce the official seats exactly (test). Shows how much each vote really was worth.

### 2.5 What-if (educational, cheap to add)
Recompute the same parliament with other systems: single national constituency,
Sainte-Laguë, no threshold, Hare. Shows how much of the effect comes from the system.

---

## 3. Data

| Data | Source | Notes |
|---|---|---|
| Census / population per province, seats per province | INE (padrón) + RD 806/2026 (2026: Madrid 38, +1; Cádiz 8, −1) | Neutral, official |
| 2026 electorate | Total 38,728,356 (Moncloa); per province: 2023 census scaled until the official breakdown is out | |
| Past results per province (2023, Nov 2019, Apr 2019), Congreso and Senado | Ministerio del Interior (infoelectoral blocks bots behind Cloudflare), so taken from Wikipedia's per-constituency articles, which cite it; spot-checked against Interior | Baseline for projecting polls to provinces |
| Polls | Wikipedia "Encuestas de opinión para las elecciones generales de España de 2026" (2026 parties: PP+UPN, PSOE, Vox, Frente Amplio, Compromís, ERC, Junts, Bildu, PNV, BNG, CCa, Adelante Andalucía, Podemos, SALF); public polls from private pollsters (40dB, GAD3, Sigma Dos, NC Report, Sociométrica, DYM, Ipsos, Simple Lógica, Hamalgama, KeyData…), collected from the published tables (e.g. Wikipedia's "Opinion polling for the next Spanish general election") | **CIS excluded**. Each poll keeps its pollster, media, dates, sample size and link |
| Province shapes | Open data (IGN / Natural Earth), simplified to a small SVG | No map tiles needed |

**Poll → province projection**: average of recent polls (weighted by recency and sample
size; user can pick one pollster or the average), then **proportional swing** from the last
election per province. Provincial polls, when they exist, can override later.

**Pipeline**: a local Node script (`scripts/update-data.mjs`) fetches, validates (valibot)
and writes versioned static JSON into `static/data/`, plus a `meta.json` with the update
date and sources. Run by hand or on a local cron, then release (no Actions minutes). The app
never calls third-party APIs at runtime.

Data size target: < 150 KB gzipped total.

---

## 4. UX

Single main screen, mobile first, everything reacts live:

- **Controls**: election (29N / 23J / 10N / 28A), chamber (Congreso / Senado), province
  (dropdown + tap on map), party, poll source (average / a pollster), turnout slider,
  optional "nudge" sliders to move a party's national %.
- **Headline card**: "Your vote in **Teruel** for **Party X** is worth **2.7×** the
  average · You're **1,240 votes** from the next seat · Wasted-vote risk: **low**".
- **Map**: choropleth of vote weight (or of your party's marginal value per province).
- **Province ranking**: table/bars of electors per seat and votes per seat by party.
- **Projected parliament**: hemicycle with seat ranges.
- **What-if tab**: other electoral systems.
- **Methodology page**: formulas, sources, poll list with links, limits. Prerendered,
  good for SEO and AdSense.
- **Share**: URL keeps state in the query (`?p=44&party=xx`), plus a share-card image
  (no personal data, always shows the URL).
- Welcome wizard (nubuza req. 6) with the mascot: a little ballot box ("Urni" — name TBD).

Last-used controls saved in localStorage. No other user data.

**Visual direction** (core requirement): nubuza kawaii-but-clean (pastels, rounded cards,
Fredoka + Nunito, Urni). Big animated numbers (count-up), a "vote-meter" gauge for the
weight, map that recolours smoothly as controls change, animated hemicycle (seats fly
between parties when you move a slider), Senate drawn as 4 seats per province, playful
micro-animations (Urni reacts: happy when your vote weighs a lot, sad when it's wasted),
neutral party colours. Share cards designed as posters. Respects `prefers-reduced-motion`.

---

## 5. Tech

- SvelteKit static + Svelte 5 + TypeScript strict, adapter-static, prerender.
- Pure-TS core in `src/lib/core/` (seat allocation, D'Hondt & co., projection, Monte
  Carlo), heavily unit-tested against real 2019/2023 results (must reproduce them exactly).
- Monte Carlo in a **Web Worker** so sliders stay smooth.
- Charts as hand-made SVG (hemicycle, bars, map). No chart library.
- valibot for data schemas. Vitest + Playwright (mobile + desktop) + axe.
- Copy from other nubuza apps: `AdSlot`, `ByNubuza`, `WelcomeTour`, `hooks.server.ts`
  meta, i18n layer, `_headers` CSP, version/commit/date in Settings.
- Pages (Spanish only): `/`, `/methodology/`, `/faq/`, `/privacy/`, `/terms/`, `sitemap.xml`, line in `apps-root/public/robots.txt`.
- Cloudflare Web Analytics. AdSense with 1–2 fixed blocks, away from the controls; block
  the political ad category if it clashes with neutrality.

---

## 6. Costs

| Item | Cost |
|---|---|
| Cloudflare Workers static assets | €0 |
| Data (INE, Interior, public polls) | €0 |
| Domain (uses nubuza.com) | €0 extra |
| **Total** | **€0/year** (≈€10–15 if it gets its own domain) |

---

## 7. What I need from you

1. Green light to start building.
2. Later: AdSense block IDs, Search Console sitemap registration.

---

## 8. Roadmap

Target: M0–M4 live before **24 Nov 2026** (poll blackout); M5 and Senado history after.

1. **M0 – Core**: data scripts (INE, Interior 2023), seat allocation + D'Hondt, tests that
   reproduce 2023 exactly.
2. **M1 – "Where"**: vote weight per province, map, ranking. Already shareable and useful
   without polls.
3. **M2 – "Who"**: poll ingestion (no CIS), average, provincial projection, marginal value,
   wasted vote, return index.
4. **M3 – Uncertainty + Senado**: Monte Carlo in a worker, seat ranges, decisiveness
   probability; Senado weights and projected senators; election selector with 2019–2023.
5. **M4 – Launch**: wizard, methodology/FAQ/legal, i18n, share card, AdSense, SEO,
   sitemap, nubuza.com card, social post.
6. **M5 – What-if** systems.

## 9. Maybe later

Autonómicas and municipales, European elections
(single constituency → all votes equal: a nice contrast), historical view ("how much was
your vote worth in 2008?"), Android.

## 10. Risks

- **Political sensitivity**: any hint of bias kills credibility → strict neutrality,
  transparent method, all sources linked, parties in a fixed neutral order and colours.
- **Projection accuracy**: proportional swing is crude for small parties and regional
  ones → show ranges, not single numbers, and explain the limits.
- **Legal**: poll blackout in the 5 days before an election (freeze data, show a notice);
  pollsters' data are facts but we cite each one.
- **Data maintenance**: polls go stale → visible "data updated on" date and a simple
  update script.
- **AdSense**: political content is allowed but reviewed more strictly → real content
  pages before applying.
