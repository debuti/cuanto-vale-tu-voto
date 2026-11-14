import { polls, pollParties, type Poll } from './data';

export interface PollAverage {
  /** National % of valid votes for each polled party. */
  shares: Record<string, number>;
  used: Poll[];
}

const DAY = 86_400_000;
const days = (a: string, b: string) => (Date.parse(a) - Date.parse(b)) / DAY;

/** The most recent poll of each pollster published in the last `window` days. */
export function latestByFirm(all: Poll[] = polls, window = 21): Poll[] {
  if (!all.length) return [];
  const last = all.reduce((m, p) => (p.end > m ? p.end : m), all[0].end);
  const seen = new Map<string, Poll>();
  for (const p of [...all].sort((a, b) => b.end.localeCompare(a.end))) {
    if (days(last, p.end) > window) continue;
    if (!seen.has(p.firm)) seen.set(p.firm, p);
  }
  return [...seen.values()];
}

/**
 * Average of the latest poll of each pollster, weighted by recency (half-life 7 days) and
 * sample size (square root). A party missing from a poll is averaged over the polls that
 * do publish it.
 */
export function averagePolls(all: Poll[] = polls): PollAverage {
  const used = latestByFirm(all);
  const last = used.reduce((m, p) => (p.end > m ? p.end : m), used[0]?.end ?? '');
  const shares: Record<string, number> = {};
  for (const id of pollParties) {
    let sum = 0;
    let w = 0;
    for (const p of used) {
      const v = p.shares[id];
      if (v == null) continue;
      const weight = Math.pow(0.5, days(last, p.end) / 7) * Math.sqrt((p.sample ?? 1000) / 1000);
      sum += v * weight;
      w += weight;
    }
    if (w > 0) shares[id] = sum / w;
  }
  return { shares, used };
}

/** Shares for one pollster (its latest poll); gaps are filled from the average. */
export function pollsterShares(firm: string, all: Poll[] = polls): PollAverage {
  const avg = averagePolls(all);
  const poll = [...all].sort((a, b) => b.end.localeCompare(a.end)).find((p) => p.firm === firm);
  if (!poll) return avg;
  return { shares: { ...avg.shares, ...poll.shares }, used: [poll] };
}

export const pollsters = (all: Poll[] = polls) => latestByFirm(all).map((p) => p.firm).sort();
