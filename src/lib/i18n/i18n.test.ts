import { describe, expect, it } from 'vitest';
import { approx, count, fmt, num, rich, m } from './index';

describe('i18n', () => {
  it('formats numbers the Spanish way, also four digits', () => {
    expect(num(1240)).toBe('1.240');
    expect(approx(123456)).toBe('123.000');
    expect(approx(1234)).toBe('1.230');
  });
  it('fills placeholders, plurals and bold', () => {
    expect(fmt('a {x} b', { x: 3 })).toBe('a 3 b');
    expect(count(m.units.seat, 1)).toBe('1 escaño');
    expect(count(m.units.seat, 2)).toBe('2 escaños');
    expect(rich('<b> **hola**')).toBe('&lt;b&gt; <strong>hola</strong>');
  });
  it('now/past pairs use the same placeholders', () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    const walk = (o: unknown) => {
      if (!o || typeof o !== 'object') return;
      const r = o as Record<string, unknown>;
      if (typeof r.now === 'string' && typeof r.past === 'string') expect(ph(r.now)).toBe(ph(r.past));
      Object.values(r).forEach(walk);
    };
    walk(m);
  });
});
