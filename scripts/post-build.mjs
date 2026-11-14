// Moves the build under its base path, so the Worker serves it at apps.nubuza.com/<slug>/.
import { cpSync, mkdirSync, renameSync, rmSync } from 'node:fs';

const slug = (process.env.BASE_PATH ?? '/cuanto-vale-tu-voto').replace(/^\/|\/$/g, '');
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('build', slug ? `dist/${slug}` : 'dist', { recursive: true });
// `_headers` is only read at the root of the assets directory.
if (slug) renameSync(`dist/${slug}/_headers`, 'dist/_headers');
console.log(`dist/${slug} ready`);
