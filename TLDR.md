# ¿Cuánto vale tu voto?

Web (solo en español) que enseña cuánto pesa tu voto en las generales según tu provincia y tu opción: cualquier candidatura, voto en blanco, nulo o no votar. Elecciones 29N 2026 (previsión con encuestas privadas, sin CIS) y resultados reales de 2023 y 2019. Congreso y Senado. Todo se calcula en el navegador.

URL: https://apps.nubuza.com/cuanto-vale-tu-voto/

- `src/lib/core/` — las cuentas: D'Hondt, peso del voto, previsión, Senado, simulaciones, otros sistemas.
- `src/lib/data/` — resultados, censo, encuestas y mapa (JSON). Se regeneran con `npm run data`.
- `src/lib/components/` — pantallas: pasos, resultado, mapa, ranking, hemiciclo, encuestas, «¿y si…?», tour de Urni.
- `src/lib/i18n/es.ts` — todos los textos.
- `src/lib/content/` + `src/routes/` — páginas de metodología, FAQ, privacidad y términos; sitemap.
- `scripts/` — descarga de datos, imágenes de marca y empaquetado.
- `docs/TODO.md` — pendientes.
