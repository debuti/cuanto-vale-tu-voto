# ¿Cuánto vale tu voto?

Calculadora neutral del valor del voto en las elecciones generales de España. Web estática
(SvelteKit + adapter-static) servida por un Worker de static assets de Cloudflare en
<https://apps.nubuza.com/cuanto-vale-tu-voto/>. Sin servidor, sin cuentas, sin datos de usuarios.

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
| `npm run deploy` | check + tests + build + `wrangler deploy` |

## Actualizar encuestas

`npm run data && npm test && npm run deploy`. Desde el 24 de noviembre de 2026 no se
actualizan (veda de encuestas, LOREG art. 69.7).

## Publicar una versión

Tests en verde → `docs/TODO.md` al día → subir `version` en `package.json` → commit →
tag `vX.Y.Z` → push de rama y tag → `npm run deploy` → comprobar la versión en «Acerca de».

## Configuración

- `monetization.config.json`: cliente y bloques de AdSense, token de Cloudflare Web Analytics.
  Con un campo vacío, esa función queda apagada (y la CSP no abre sus orígenes).
- `BASE_PATH=/` para compilar en la raíz de un dominio propio.

Copyright (c) 2026 nubuza, all rights reserved.
