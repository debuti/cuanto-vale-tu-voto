// @vitest-environment jsdom
import { flushSync, mount, unmount, type Component } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { ELECTIONS, lists2026, party } from '#lib/core/data';
import { m } from '#lib/i18n';
import { app } from '#lib/state.svelte';
import ChamberView from './ChamberView.svelte';
import Lab from './Lab.svelte';
import Picker from './Picker.svelte';
import Ranking from './Ranking.svelte';
import Result from './Result.svelte';
import SpainMap from './SpainMap.svelte';
import ValueRank from './ValueRank.svelte';

let live: ReturnType<typeof mount>[] = [];
function show(...parts: Component[]) {
  document.body.innerHTML = '';
  live = parts.map((c) => mount(c, { target: document.body }));
  flushSync();
  return document.body;
}
const click = (el: Element | null | undefined) => {
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  flushSync();
};
const button = (text: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(text));

afterEach(() => {
  live.forEach((c) => unmount(c));
  app.reset();
});

describe('interface', () => {
  it('renders every election, chamber and option without errors', () => {
    const body = show(Picker, Result, SpainMap, Ranking, ChamberView, Lab, ValueRank);
    for (const e of ELECTIONS)
      for (const chamber of ['congreso', 'senado'] as const)
        for (const option of ['party', 'blank', 'null', 'abstain'] as const) {
          app.election = e.id;
          app.chamber = chamber;
          app.option = option;
          app.party = app.choices[0];
          flushSync();
          expect(body.textContent).toContain(m.result.title);
          expect(body.textContent).not.toMatch(/undefined|NaN|\{\w+\}/);
        }
  });

  it('offers the four ways to use a vote', () => {
    const body = show(Picker);
    for (const o of ['party', 'blank', 'null', 'abstain'] as const) expect(body.textContent).toContain(m.options[o].title);
  });

  it('lists every candidacy of the province', () => {
    show(Picker);
    app.prov = '28';
    flushSync();
    click(button(m.steps.showAll.split(' ')[0]));
    const chips = [...document.querySelectorAll('.chip')].map((c) => c.textContent?.trim());
    expect(chips).toHaveLength(lists2026['28'].lists.length);
    for (const id of lists2026['28'].lists) expect(chips).toContain(party(id).short);
  });

  it('explains blank, null and not voting', () => {
    const body = show(Picker, Result);
    click(button(m.options.blank.title));
    expect(app.option).toBe('blank');
    expect(body.textContent).toContain(m.result.blank.title);
    click(button(m.options.null.title));
    expect(body.textContent).toContain(m.result.null.title);
    click(button(m.options.abstain.title));
    expect(body.textContent).toContain(m.result.abstain.title);
  });

  it('picks a province from the map and from the ranking', () => {
    show(SpainMap, Ranking);
    const provs = document.querySelectorAll('.prov');
    expect(provs).toHaveLength(52);
    click(provs[0]);
    expect(app.prov).toBe('01');
    click(button('Teruel'));
    expect(app.prov).toBe('44');
  });

  it('draws one seat per deputy', () => {
    show(ChamberView);
    expect(document.querySelectorAll('circle')).toHaveLength(350);
  });

  it('moves the forecast with the poll controls and resets it', () => {
    show(Lab);
    const before = app.scenario.national.map((p) => p.seats).join();
    for (let i = 0; i < 8; i++) click(document.querySelector('.step:last-of-type'));
    expect(app.modified).toBe(true);
    expect(app.scenario.national.map((p) => p.seats).join()).not.toBe(before);
    click(button(m.lab.reset));
    expect(app.scenario.national.map((p) => p.seats).join()).toBe(before);
  });
});
