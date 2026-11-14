import { resolve } from '$app/paths';

/** Base path without the trailing slash ('' at the root of a domain). */
export const base = (resolve as (path: string) => string)('/').replace(/\/$/, '');

export const ORIGIN = 'https://apps.nubuza.com';
export const SITE = ORIGIN + base;
export const PAGES = ['', 'methodology/', 'faq/', 'privacy/', 'terms/'] as const;
export const href = (path = '') => `${base}/${path}`;
export const VERSION = `v${__APP_VERSION__} · ${__APP_COMMIT__} · ${__APP_DATE__}`;
export const CONTACT = 'me@nubuza.com';
