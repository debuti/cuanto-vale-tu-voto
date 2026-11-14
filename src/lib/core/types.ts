export type ElectionId = 'e2026' | 'e2023' | 'e2019n' | 'e2019a';
export type Chamber = 'congreso' | 'senado';

export interface PartyTally {
  id: string;
  votes: number;
  seats: number;
  /** 2026 only: no poll and no previous result to estimate from. */
  noData?: boolean;
}

/** One constituency (a province, or an island for the Senate). */
export interface Constituency {
  id: string;
  /** Province code it belongs to (same as id except for islands). */
  prov: string;
  name: string;
  seats: number;
  census: number;
  blank: number;
  invalid: number;
  /** Valid votes: every party plus blank ballots. */
  valid: number;
  parties: PartyTally[];
}

export interface Scenario {
  election: ElectionId;
  chamber: Chamber;
  projected: boolean;
  constituencies: Constituency[];
  totalSeats: number;
  totalCensus: number;
  /** Seats per party in the whole chamber, sorted by seats then votes. */
  national: PartyTally[];
}

export interface PartyInfo {
  short: string;
  name: string;
  color: string;
}

export type Method = 'dhondt' | 'sainte-lague' | 'hare';
