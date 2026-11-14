import { meta } from '#lib/core/data';
import { PAGES, SITE } from '#lib/site';

export const prerender = true;

export function GET() {
  const urls = PAGES.map((p) => `  <url><loc>${SITE}/${p}</loc><lastmod>${meta.updated}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml' }
  });
}
