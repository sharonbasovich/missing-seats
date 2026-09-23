import { courseGirlsShare, isReported, MIN_N, totalOf } from "./metrics";
import type { CourseKey, SchoolRecord } from "./types";

export interface PeerResult {
  peers: SchoolRecord[];
  poolSize: number;
  medianShare: number | null;
  topQuartile: number | null;
  targetShare: number | null;
}

/** Same-state schools with total enrollment within ±25% of the target and
 *  >= MIN_N reported students in the course, ranked by girls' share. */
export function findPeers(
  schools: SchoolRecord[],
  target: SchoolRecord,
  course: CourseKey,
  tolerance = 0.25,
  top = 5,
): PeerResult {
  const targetEnr = totalOf(target.e);
  const targetShare = courseGirlsShare(target[course]);
  const pool: { r: SchoolRecord; share: number }[] = [];
  if (targetEnr > 0) {
    for (const r of schools) {
      if (r.k === target.k) continue;
      const e = totalOf(r.e);
      if (e <= 0 || Math.abs(e - targetEnr) / targetEnr > tolerance) continue;
      const m = r[course][0];
      const f = r[course][1];
      if (!isReported(m) || !isReported(f) || m + f < MIN_N) continue;
      const share = f / (m + f);
      pool.push({ r, share });
    }
  }
  pool.sort((a, b) => b.share - a.share);
  const shares = pool.map((p) => p.share).sort((a, b) => a - b);
  return {
    peers: pool.slice(0, top).map((p) => p.r),
    poolSize: pool.length,
    medianShare: shares.length ? shares[Math.floor(shares.length / 2)] : null,
    topQuartile: shares.length
      ? shares[Math.floor(shares.length * 0.75)]
      : null,
    targetShare,
  };
}

export interface RankedRow {
  r: SchoolRecord;
  share: number;
}

/** All schools in a state with >= MIN_N reported students in the course,
 *  ranked by girls' share (desc). Used by the state page table. */
export function rankState(
  schools: SchoolRecord[],
  course: CourseKey,
): RankedRow[] {
  const rows: RankedRow[] = [];
  for (const r of schools) {
    const share = courseGirlsShare(r[course]);
    if (share !== null && !isLowNCourse(r, course)) rows.push({ r, share });
  }
  rows.sort(
    (a, b) => b.share - a.share || totalOf(b.r.e) - totalOf(a.r.e),
  );
  return rows;
}

function isLowNCourse(r: SchoolRecord, course: CourseKey): boolean {
  const m = r[course][0];
  const f = r[course][1];
  if (!isReported(m) || !isReported(f)) return true;
  return m + f < MIN_N;
}
