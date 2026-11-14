# TODO

## Pendiente (dueño)

- [ ] **AdSense**: crear 2 bloques display responsive (AdSense → Anuncios → Por bloque de anuncios) y poner sus IDs en `monetization.config.json` → `adsense.slots.main` y `.footer`. Sin ellos no se muestran anuncios.
- [ ] **Cloudflare Web Analytics**: crear el sitio y poner el token en `monetization.config.json` → `cloudflareAnalyticsToken`.
- [ ] **robots.txt**: añadir `Sitemap: https://apps.nubuza.com/cuanto-vale-tu-voto/sitemap.xml` en `apps-root/public/robots.txt` del repo nubuza y desplegarlo.
- [ ] **Search Console → Sitemaps → añadir** `https://apps.nubuza.com/cuanto-vale-tu-voto/sitemap.xml` (y en Bing Webmaster Tools).
- [ ] Tarjeta de la app en nubuza.com y alta en `ops/apps.json` del repo nubuza.
- [ ] Difusión en redes antes de la veda de encuestas (24 nov 2026).

## Pendiente (Claude)

- [ ] Tests e2e con Playwright (móvil y escritorio), axe (WCAG 2.2 AA) y smoke contra producción: el contenedor de build no tiene navegador.
- [ ] Actualizar encuestas (`npm run data`) hasta el 23 nov 2026; después quedan congeladas.
- [ ] Senado de 2019 (10N y 28A): ahora avisa y enseña el Congreso.
- [ ] Encuestas por provincia o comunidad para afinar la previsión.
- [ ] Tras el 29N: cargar el resultado real de 2026.

## Excepciones acordadas a las normas nubuza

- Sin sync con Google Drive (no hay datos que sincronizar). PLAN.md, decisión 5.
- Solo en español, sin `/en/`. PLAN.md, decisión 6.
- Mapa en SVG propio en vez de MapLibre. PLAN.md, 1b (pendiente de confirmar con el dueño).

## Hecho

- 2026-11-14 — v1.0.0: datos (2019–2026, encuestas, mapa), motor de cálculo, interfaz completa (pasos, resultado, mapa, ranking, hemiciclo, laboratorio de encuestas, otros sistemas, Senado), tour de Urni, páginas de contenido, SEO, cabeceras de seguridad y despliegue en Cloudflare.
