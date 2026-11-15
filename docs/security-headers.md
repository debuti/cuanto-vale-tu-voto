# Cabeceras de seguridad

- **CSP**: la genera SvelteKit en modo `hash` como `<meta http-equiv>` en cada página (`vite.config.ts`). `default-src 'self'`, scripts solo propios o con hash, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`. Los orígenes de Google (anuncios) y de Cloudflare Insights solo se abren si hay IDs en `monetization.config.json`.
- **`frame-ancestors`** no puede ir en un `<meta>`: va en `static/_headers` (`'self' https://adsense.google.com https://www.google.com`, para la vista previa de AdSense). Sustituye a `X-Frame-Options`.
- `static/_headers`: HSTS de un año con `includeSubDomains`, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` con todo apagado, `COOP: same-origin-allow-popups` y caché `immutable` para `_app/immutable/*`.

## Excepciones

- `style-src 'unsafe-inline'`: Svelte aplica estilos en línea (`style:`) para colores de partido y anchos de barras.
- `worker-src 'self' blob:`: las simulaciones corren en un Web Worker propio.
- Estas cabeceras se comprueban en `e2e/app.spec.ts` (contra wrangler) y en `e2e/smoke.spec.ts` (contra producción).
- La app no usa `localStorage`, `sessionStorage`, cookies propias ni IndexedDB (comprobado en `e2e/app.spec.ts`).
