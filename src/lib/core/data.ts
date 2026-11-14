import congressJson from '#lib/data/congress.json';
import senateJson from '#lib/data/senate.json';
import partiesJson from '#lib/data/parties.json';
import provincesJson from '#lib/data/provinces.json';
import pollsJson from '#lib/data/polls.json';
import metaJson from '#lib/data/meta.json';
import type { ElectionId, PartyInfo } from './types';

type Row = [string, number, number];
export interface RawProvince {
  seats: number;
  census: number;
  blank: number;
  invalid: number;
  parties: Row[];
}
export interface RawProvince2026 {
  seats: number;
  census: number;
  lists: string[];
}
export interface RawSenate {
  id: string;
  name: string;
  prov: string;
  seats: number;
  census: number;
  blank: number;
  parties: Row[];
}
export interface RawSenate2026 {
  id: string;
  name: string;
  prov: string;
  seats: number;
  census: number;
  base: string;
}
export interface Poll {
  firm: string;
  media: string | null;
  start: string;
  end: string;
  sample: number | null;
  url: string | null;
  shares: Record<string, number>;
}

const congress = congressJson as unknown as Record<
  ElectionId,
  { date: string; provinces: Record<string, RawProvince | RawProvince2026> }
>;
export const real = (e: Exclude<ElectionId, 'e2026'>) =>
  congress[e].provinces as Record<string, RawProvince>;
export const lists2026 = congress.e2026.provinces as Record<string, RawProvince2026>;
export const senate2023 = senateJson.s2023 as unknown as RawSenate[];
export const senate2026 = senateJson.s2026 as RawSenate2026[];
export const parties = partiesJson as Record<string, PartyInfo>;
export const provinces = provincesJson as Record<string, { name: string; region: string }>;
export const polls = pollsJson.polls as Poll[];
export const pollParties = pollsJson.columns as string[];
export const meta = metaJson as { updated: string; pollCount: number; lastPoll: string };

export const PROVINCE_CODES = Object.keys(provinces).sort((a, b) =>
  provinces[a].name.localeCompare(provinces[b].name, 'es')
);

export function party(id: string): PartyInfo {
  return parties[id] ?? { short: id, name: id, color: '#8A8FA3' };
}

export const ELECTIONS: { id: ElectionId; date: string; projected: boolean }[] = [
  { id: 'e2026', date: '2026-11-29', projected: true },
  { id: 'e2023', date: '2023-07-23', projected: false },
  { id: 'e2019n', date: '2019-11-10', projected: false },
  { id: 'e2019a', date: '2019-04-28', projected: false }
];
