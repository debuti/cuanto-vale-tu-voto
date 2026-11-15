# ¿Cuánto vale tu voto?

Web (solo en español) que enseña cuánto pesa tu voto en las generales según tu provincia y tu opción: cualquier candidatura, voto en blanco, nulo o no votar. Elecciones 29N 2026 (previsión con encuestas de empresas privadas) y resultados reales de 2023 y 2019. Congreso y Senado. Todo se calcula en el navegador y no guarda nada: al recargar empieza de cero.

URL: https://apps.nubuza.com/cuanto-vale-tu-voto/

- `src/lib/core/` — las cuentas: D'Hondt, peso del voto, previsión, Senado, simulaciones, otros sistemas.
- `src/lib/data/` — resultados, censo, encuestas y mapa (JSON). Se regeneran con `npm run data`.
- `src/lib/components/` — pantallas: pasos, resultado con veredicto y potenciador/freno, escalafón del valor del voto, mapa, ranking, hemiciclo (izquierda/derecha, otros sistemas de reparto, viaje en el tiempo y «juega con las encuestas» debajo), diagramas, tour de Urni.
- `src/lib/i18n/es.ts` — todos los textos.
- `src/lib/content/` + `src/routes/` — páginas «Así funciona la democracia», metodología, FAQ, privacidad y términos; sitemap.
- `scripts/` — descarga de datos, imágenes de marca, empaquetado y `auto-update.sh` (encuestas al día y publicación automática hasta el 24 nov 2026).
- `e2e/` — pruebas en navegador real (Playwright, accesibilidad con axe, smoke contra producción).
- `docs/TODO.md` — pendientes.
