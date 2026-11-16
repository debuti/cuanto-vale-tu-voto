import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const mon = JSON.parse(readFileSync('monetization.config.json', 'utf8'));
const base = process.env.BASE_PATH ?? '/cuanto-vale-tu-voto';
// No ads. The Cloudflare Analytics origin is opened only when its token is configured.
type Src = 'self';
const adOrigins = (mon.cloudflareAnalyticsToken ? ['https://static.cloudflareinsights.com'] : []) as string[] as Src[];
const any = [] as Src[];
const beacon = (mon.cloudflareAnalyticsToken ? ['https://cloudflareinsights.com'] : []) as string[] as Src[];
let commit = 'dev';
try {
  commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch {
  /* no commits yet */
}

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', strict: true }),
      paths: { base: (base === '/' ? '' : base) as `/${string}`, relative: false },
      csp: {
        mode: 'hash',
        directives: {
          'default-src': ['self'],
          'script-src': ['self', ...adOrigins],
          'style-src': ['self', 'unsafe-inline'],
          'img-src': ['self', 'data:', 'blob:', ...any],
          'font-src': ['self'],
          'connect-src': ['self', ...any, ...beacon],
          'frame-src': ['none'],
          'worker-src': ['self', 'blob:'],
          'object-src': ['none'],
          'base-uri': ['none'],
          'form-action': ['self']
        }
      }
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(process.env.APP_COMMIT ?? commit),
    __APP_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10))
  },
  // Component tests mount Svelte in jsdom: they need the browser build of Svelte.
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: { include: ['src/**/*.test.ts'] }
});
