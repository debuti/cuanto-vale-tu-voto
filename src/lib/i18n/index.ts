import { es } from './es';

export const m = es;
export const LOCALE = 'es-ES';

const nf = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0, useGrouping: 'always' });
const plural = new Intl.PluralRules(LOCALE);

/** Fills `{placeholders}`. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
/** 1.234.567 */
export const num = (n: number) => nf.format(Math.round(n));
/** Rounded so nobody reads false precision into an estimate: 12.300 */
export function approx(n: number): string {
  const a = Math.abs(n);
  const step = a >= 100_000 ? 1000 : a >= 10_000 ? 100 : a >= 1000 ? 10 : 1;
  return nf.format(Math.round(n / step) * step);
}
export const dec = (n: number, digits = 1) =>
  new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
export const pct = (ratio: number, digits = 1) => dec(100 * ratio, digits);
export function count(forms: { one: string; other: string }, n: number): string {
  return fmt(plural.select(n) === 'one' ? forms.one : forms.other, { n: num(n) });
}
export function date(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso + 'T00:00:00Z')
  );
}
/** «16 nov», for tight spots like a dropdown. */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));
}
/** Escapes HTML and turns **bold** into <strong>. Only for our own strings. */
export function rich(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
