import type { IndexEntry } from "./types";

const normCache = new WeakMap<IndexEntry, { name: string[]; dist: string[] }>();

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(e: IndexEntry): { name: string[]; dist: string[] } {
  let w = normCache.get(e);
  if (!w) {
    w = { name: normalize(e.n).split(" "), dist: normalize(e.d).split(" ") };
    normCache.set(e, w);
  }
  return w;
}

function tokenMatch(tokens: string[], hay: string[]): number {
  // every query token must prefix-match some word; returns match score
  let score = 0;
  for (const t of tokens) {
    let best = 0;
    for (const w of hay) {
      if (w === t) {
        best = Math.max(best, 2);
        break;
      }
      if (w.startsWith(t)) best = Math.max(best, 1);
    }
    if (best === 0) return -1;
    score += best;
  }
  return score;
}

const MAX_RESULTS = 8;

/** Ranked search over the school index. Every query token must prefix-match
 *  a word in the school name, the district name, or be the state code.
 *  Schools whose name matches all tokens outrank district-only matches;
 *  larger enrollment breaks ties. */
export function search(
  index: IndexEntry[],
  query: string,
  limit = MAX_RESULTS,
): IndexEntry[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { e: IndexEntry; s: number }[] = [];
  for (const e of index) {
    const w = words(e);
    let nameScore = tokenMatch(tokens, w.name);
    let score: number;
    if (nameScore >= 0) {
      score = 1000 + nameScore * 10;
    } else {
      // allow "school-name district" or "school state" combos:
      // every token must hit somewhere in name+dist+[state]
      const all = [...w.name, ...w.dist, e.s.toLowerCase()];
      const anyScore = tokenMatch(tokens, all);
      if (anyScore < 0) continue;
      const distScore = tokenMatch(tokens, [...w.dist, e.s.toLowerCase()]);
      score =
        distScore >= 0 && nameScore < 0
          ? 500 + anyScore * 10 // district-only match
          : 700 + anyScore * 10; // mixed name+district
    }
    scored.push({ e, s: score + Math.min(e.e, 4000) / 4000 });
  }
  scored.sort((a, b) => b.s - a.s || a.e.n.localeCompare(b.e.n));
  return scored.slice(0, limit).map((x) => x.e);
}
