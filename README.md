# ¿Cuánto vale tu voto?

Calculadora neutral del valor del voto en las elecciones generales de España. Web estática
(SvelteKit + adapter-static) servida por un Worker de static assets de Cloudflare en
<https://labs.nubuza.com/cuanto-vale-tu-voto/>. Sin servidor, sin cuentas, sin datos de usuarios y sin almacenamiento en el navegador.

Plan y decisiones: [PLAN.md](PLAN.md). Pendientes: [docs/TODO.md](docs/TODO.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run data` | Descarga resultados, censo, encuestas y mapa a `src/lib/data/` |
| `npm run brand` | Genera favicon, logos y `og.png` |
| `npm run check` | Tipos (svelte-check) |
| `npm test` | Tests (Vitest: cálculos, textos e interfaz en jsdom) |
| `npm run build` | Compila a `build/` y lo empaqueta en `dist/cuanto-vale-tu-voto/` |
| `npm run preview` | Sirve `dist/` con wrangler (con los `_headers` reales) |
| `npm run e2e` | Playwright (móvil y escritorio) + axe WCAG 2.2 AA contra `dist/` servido por wrangler |
| `npm run smoke` | Comprueba la web en producción (páginas, cabeceras y versión) |
| `npm run gate` | check + tests + build + e2e |
| `npm run deploy` | gate + `wrangler deploy` + smoke |

## Actualizar encuestas

Automático: `scripts/auto-update.sh --loop` (lanzado suelto con `setsid nohup`) baja la tabla
de encuestas una vez al día y, si hay nuevas, las valida (`scripts/check-polls.mjs`), pasa el
gate, sube la versión de parche, hace commit, tag y push, despliega y pasa el smoke. Si algo
falla no publica y lo apunta en `.cache/auto-update.log`. Se para solo tras el 24 de noviembre
de 2026 (veda de encuestas, LOREG art. 69.7).

A mano: `node scripts/update-data.mjs --polls && npm run deploy` (o `scripts/auto-update.sh`).

El e2e usa el Chromium de la imagen (`/ms-playwright`, Playwright 1.56.1 fijado a esa revisión).

## Publicar una versión

Tests en verde → `docs/TODO.md` al día → subir `version` en `package.json` → commit →
tag `vX.Y.Z` → push de rama y tag → `npm run deploy` → comprobar la versión en «Acerca de».

## Configuración

- `monetization.config.json`: cliente y bloques de AdSense, token de Cloudflare Web Analytics.
  Con un campo vacío, esa función queda apagada (y la CSP no abre sus orígenes).
- `BASE_PATH=/` para compilar en la raíz de un dominio propio.

Copyright (c) 2026 nubuza, all rights reserved.
