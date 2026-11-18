# TODO

## Pendiente (dueño)


- [ ] **Cloudflare Web Analytics**: el beacon manual necesita el token público del sitio (Cloudflare → Analytics & Logs → Web Analytics → `labs.nubuza.com` (dar de alta el sitio si no está) → «Manage site» → snippet JS, valor `token`). Ponerlo en `monetization.config.json` → `cloudflareAnalyticsToken` (o dárselo a Claude).
- [ ] Difusión en redes antes de la veda de encuestas (24 nov 2026).

## Pendiente (Claude)


- [ ] Vigilar `scripts/auto-update.sh --loop` (encuestas al día, una vez al día hasta el 24 nov 2026): mirar `.cache/auto-update.log` y relanzarlo si el contenedor se reinició.
- [ ] **Propuestas de cada partido** al elegirlo, por temas (corrupción, infraestructuras, impuestos y poder adquisitivo, vivienda, inmigración, economía, orden mundial): hace falta sacarlas de los programas oficiales de 2026, con enlace a la fuente y redacción neutra. Pendiente de que el dueño confirme el enfoque.
- [ ] Mover la detección del 3 % del diagrama D'Hondt a `core` si se reutiliza.
- [ ] Senado de 2019 (10N y 28A): ahora avisa y enseña el Congreso.
- [ ] Encuestas por provincia o comunidad para afinar la previsión.
- [ ] Tras el 29N: cargar el resultado real de 2026.

## Excepciones acordadas a las normas nubuza

- **Sin anuncios** (ni AdSense ni ningún otro): lo dijo el dueño el 16 nov 2026.

- **Experimento de labs.nubuza.com: no se indexa ni se lista** (noindex en cabecera y meta, sin sitemap, sin tarjeta ni enlaces desde nubuza.com ni redes). Lo confirmó el dueño al agente de nubuza el 16 nov 2026.

- Sin sync con Google Drive (no hay datos que sincronizar). PLAN.md, decisión 5.
- Solo en español, sin `/en/`. PLAN.md, decisión 6.
- Mapa en SVG propio en vez de MapLibre. PLAN.md, 1b (pendiente de confirmar con el dueño).
- **No guarda nada** (ni localStorage ni cookies propias): lo pidió el dueño el 15 nov 2026. Por eso el tour de inicio sale en cada visita a la calculadora, en vez de una sola vez (norma 6).
- Sin tarjeta en nubuza.com ni alta en `ops/apps.json` **de momento** (dueño, 15 nov 2026).

## Hecho

- 2026-11-18 — v1.2.6: el 2023 de la línea temporal cae bajo su posición; «encuestas de hoy» solo si lo son (si no, la fecha); fecha de cada encuesta en el desplegable; la tabla del hemiciclo muestra los partidos sin escaño con al menos el 0,3 % del voto.

- 2026-11-16 — v1.2.3: fuera AdSense (bloques, meta, CSP, textos de privacidad y términos).

- 2026-11-16 — DNS de labs.nubuza.com recreado por el dueño (`AAAA labs 100::`); la app vuelve a responder.

- 2026-11-16 — Borrado el Worker `labs-root`: la raíz de labs.nubuza.com la lleva `nubuza-labs-root` (repo nubuza).

- 2026-11-16 — v1.2.2: noindex (`X-Robots-Tag` + meta robots), sin sitemap; robots.txt de labs-root a `Disallow: /`.

- 2026-11-15 — v1.2.0: la app se muda a `labs.nubuza.com/cuanto-vale-tu-voto/`. `infra/labs-root/` (dominio labs.nubuza.com, robots.txt con el sitemap) e `infra/apps-redirect/` (301 desde la URL antigua de apps.nubuza.com).

- 2026-11-15 — v1.1.1: arreglo del modelo (las listas que no salen en las encuestas, como Soria ¡Ya! o Teruel Existe, crecían un 75 % en vez del 15 % máximo y ganaban un escaño que no tocaba: eran los puntos oscuros del hemiciclo); fuera «Compartir» y «Descargar imagen»; «Juega con las encuestas» pasa a estar dentro del hemiciclo, pegado a él.

- 2026-11-15 — v1.1.0: veredicto del voto («tu voto ha hecho que…»), peso como potenciador/freno, escalafón del valor del voto, hemiciclo con lados izquierda/derecha a elegir, línea de la mitad de la cámara, otros sistemas de reparto arriba y viaje animado en el tiempo; página «Así funciona la democracia» con diagramas (LOREG y Constitución); promesa de privacidad al elegir partido; sin almacenamiento; sin menciones al CIS; e2e con Playwright + axe + smoke; actualización automática de encuestas (51 encuestas).

- 2026-11-14 — v1.0.0: datos (2019–2026, encuestas, mapa), motor de cálculo, interfaz completa (pasos, resultado, mapa, ranking, hemiciclo, laboratorio de encuestas, otros sistemas, Senado), tour de Urni, páginas de contenido, SEO, cabeceras de seguridad y despliegue en Cloudflare.
