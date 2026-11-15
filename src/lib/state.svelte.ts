import { browser } from '$app/env';
import { ELECTIONS, lists2026, provinces, real } from '#lib/core/data';
import { averagePolls, pollsterShares } from '#lib/core/polls';
import { buildScenario, hasSenate } from '#lib/core/scenario';
import type { SimResult } from '#lib/core/montecarlo';
import type { Chamber, Constituency, ElectionId, Scenario } from '#lib/core/types';

export type VoteOption = 'party' | 'blank' | 'null' | 'abstain';
const OPTIONS: VoteOption[] = ['party', 'blank', 'null', 'abstain'];

interface Prefs {
  election: ElectionId;
  chamber: Chamber;
  prov: string;
  cons: string;
  option: VoteOption;
  party: string;
  pollster: string;
  turnout: number;
  nudges: Record<string, number>;
}
const DEFAULTS: Prefs = {
  election: 'e2026',
  chamber: 'congreso',
  prov: '28',
  cons: '',
  option: 'party',
  party: '',
  pollster: 'avg',
  turnout: 0,
  nudges: {}
};

class AppState {
  election = $state<ElectionId>(DEFAULTS.election);
  chamber = $state<Chamber>(DEFAULTS.chamber);
  prov = $state(DEFAULTS.prov);
  /** Senate island, when the province has several constituencies. */
  cons = $state('');
  option = $state<VoteOption>('party');
  party = $state('');
  pollster = $state('avg');
  turnout = $state(0);
  nudges = $state<Record<string, number>>({});
  sim = $state<SimResult | null>(null);
  /** Nothing is stored, so every visit starts with the tour (one tap to skip). */
  tourOpen = $state(true);
  aboutOpen = $state(false);
  /** True once the shared link (if any) has been read (browser only). */
  ready = $state(false);

  projected = $derived(this.election === 'e2026');
  /** The Senate of 2019 is not in the data yet: fall back to the Congress. */
  effectiveChamber = $derived<Chamber>(this.chamber === 'senado' && !hasSenate(this.election) ? 'congreso' : this.chamber);

  pollBase = $derived(this.pollster === 'avg' ? averagePolls() : pollsterShares(this.pollster));
  shares = $derived.by(() => {
    const out: Record<string, number> = { ...this.pollBase.shares };
    for (const [id, d] of Object.entries(this.nudges)) if (id in out) out[id] = Math.max(0, out[id] + d);
    return out;
  });
  scenario = $derived<Scenario>(
    buildScenario(this.election, this.effectiveChamber, { shares: this.shares, turnoutDelta: this.turnout })
  );
  /** Constituencies of the chosen province (several islands for the Senate). */
  local = $derived<Constituency[]>(this.scenario.constituencies.filter((c) => c.prov === this.prov));
  constituency = $derived<Constituency>(
    this.local.find((c) => c.id === this.cons) ?? this.local[0] ?? this.scenario.constituencies[0]
  );
  /** PSOE and Frente Amplio stand together for the Senate in 2026. */
  partyId = $derived.by(() => {
    if (this.effectiveChamber === 'senado' && this.election === 'e2026' && (this.party === 'psoe' || this.party === 'fa'))
      return 'sdp';
    return this.party;
  });
  /** Candidacies you can pick here, biggest first. */
  choices = $derived.by(() => {
    return [...this.constituency.parties].sort((a, b) => b.votes - a.votes).map((p) => p.id);
  });
  modified = $derived(this.pollster !== 'avg' || this.turnout !== 0 || Object.values(this.nudges).some((v) => v !== 0));

  resetLab() {
    this.pollster = 'avg';
    this.turnout = 0;
    this.nudges = {};
  }

  snapshot(): Prefs {
    return {
      election: this.election,
      chamber: this.chamber,
      prov: this.prov,
      cons: this.cons,
      option: this.option,
      party: this.party,
      pollster: this.pollster,
      turnout: this.turnout,
      nudges: { ...this.nudges }
    };
  }
  apply(p: Partial<Prefs>) {
    if (p.election && ELECTIONS.some((e) => e.id === p.election)) this.election = p.election;
    if (p.chamber === 'congreso' || p.chamber === 'senado') this.chamber = p.chamber;
    if (p.prov && p.prov in provinces) this.prov = p.prov;
    if (typeof p.cons === 'string') this.cons = p.cons;
    if (p.option && OPTIONS.includes(p.option)) this.option = p.option;
    if (typeof p.party === 'string' && /^[a-z0-9-]{0,40}$/.test(p.party)) this.party = p.party;
    if (typeof p.pollster === 'string' && p.pollster.length < 60) this.pollster = p.pollster;
    if (typeof p.turnout === 'number' && Math.abs(p.turnout) <= 15) this.turnout = p.turnout;
    if (p.nudges && typeof p.nudges === 'object') {
      const n: Record<string, number> = {};
      for (const [k, v] of Object.entries(p.nudges)) if (typeof v === 'number' && Math.abs(v) <= 10) n[k] = v;
      this.nudges = n;
    }
  }

  /** A link can carry the place and the option (`?e=2023&p=44&v=pp`); it is read, never written. */
  fromQuery(q: URLSearchParams): boolean {
    if (!q.has('p') && !q.has('e')) return false;
    const v = q.get('v') ?? '';
    const isOption = (OPTIONS as string[]).includes(v) && v !== 'party';
    this.apply({
      election: ('e' + (q.get('e') ?? '2026')) as ElectionId,
      chamber: q.get('c') === 's' ? 'senado' : 'congreso',
      prov: q.get('p') ?? undefined,
      cons: q.get('i') ?? '',
      option: isOption ? (v as VoteOption) : 'party',
      party: isOption || v === 'x' ? '' : v
    });
    return true;
  }

  /** Back to the starting point. */
  reset() {
    this.apply(DEFAULTS);
    this.party = '';
    this.cons = '';
    this.resetLab();
  }
  /** Nothing is saved anywhere: a reload starts again. Only a link carries choices. */
  load() {
    if (!browser) return;
    this.fromQuery(new URLSearchParams(location.search));
    this.ready = true;
  }
  closeTour() {
    this.tourOpen = false;
  }
}

export const app = new AppState();

/** Lists standing in a province for an election, for labels that must not depend on the scenario. */
export function standing(election: ElectionId, prov: string): string[] {
  return election === 'e2026' ? lists2026[prov].lists : real(election)[prov].parties.map((p) => p[0]);
}
