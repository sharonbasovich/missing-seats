import type { CountTriple } from "./types";

/** CRDC reserve codes (2023–24 User's Manual §5.4). Negative means
 *  "not reportable" — never display as a count and never as zero. */
export const RESERVE_CODES: Record<number, string> = {
  "-3": "processing error",
  "-5": "action plan",
  "-6": "value overwritten by data owner",
  "-7": "indeterminable",
  "-9": "not applicable / skipped",
  "-10": "suppressed to protect privacy",
  "-11": "suppressed for data quality",
  "-13": "missing due to skip logic",
};

/** Schools with fewer than this many students in a course get a low-N
 *  flag and are excluded from percentiles and peer pools. */
export const MIN_N = 20;

/** A count is reportable only when it is present and non-negative. */
export function isReported(v: number | null | undefined): v is number {
  return typeof v === "number" && v >= 0;
}

/** Reason shown in the UI when a value is not reportable. */
export function notReportedReason(v: number | null | undefined): string {
  if (v === null || v === undefined) return "not reported";
  return RESERVE_CODES[v] ?? `reserve code ${v}`;
}

/** Reserve codes contribute 0 to sums/aggregates. */
export function clip(v: number | null | undefined): number {
  return isReported(v) ? v : 0;
}

/** Girls' share of a male+female pair. null if not reportable or total 0. */
export function girlsShare(f: number | null, m: number | null): number | null {
  if (!isReported(f) || !isReported(m)) return null;
  const t = f + m;
  return t > 0 ? f / t : null;
}

/** Girls' share of total enrollment (female / (female + male)). */
export function enrollmentGirlsShare(e: CountTriple): number | null {
  return girlsShare(e[1], e[0]);
}

/** Girls' share of a course (female / (female + male)). */
export function courseGirlsShare(c: CountTriple): number | null {
  return girlsShare(c[1], c[0]);
}

/** Our SDG 4.5-inspired representation ratio, not official indicator 4.5.1:
 *  (girls' share of the course) / (girls' share of enrollment).
 *  1.0 = parity; 0.64 means girls hold 64% of the seats they would at parity. */
export function parityIndex(
  courseShare: number | null,
  enrShare: number | null,
): number | null {
  if (courseShare === null || enrShare === null || enrShare <= 0) return null;
  return courseShare / enrShare;
}

/** "Missing seats" — our descriptive parity calculation, not a federal
 *  statistic: seats girls would hold if the course matched the school's
 *  gender mix, minus the girls actually enrolled. Floored at 0.
 *  Returns null when any needed count is not reportable. */
export function missingSeats(
  course: CountTriple,
  enrollment: CountTriple,
): number | null {
  const [m, f] = [course[0], course[1]];
  const [em, ef] = [enrollment[0], enrollment[1]];
  if (!isReported(m) || !isReported(f) || !isReported(em) || !isReported(ef)) {
    return null;
  }
  const etotal = em + ef;
  const ctotal = m + f;
  if (etotal <= 0 || ctotal <= 0) return null;
  const expected = ctotal * (ef / etotal);
  return Math.max(0, Math.round(expected - f));
}

export function isLowN(c: CountTriple): boolean {
  const m = c[0];
  const f = c[1];
  if (!isReported(m) || !isReported(f)) return false;
  return m + f < MIN_N;
}

/** Total students in a count triple, clipping reserve codes. */
export function totalOf(c: CountTriple): number {
  return clip(c[0]) + clip(c[1]) + clip(c[2]);
}

export function fmtInt(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return Math.round(v).toLocaleString("en-US");
}

export function fmtPct(share: number | null | undefined, digits = 1): string {
  if (share === null || share === undefined) return "—";
  return `${(share * 100).toFixed(digits)}%`;
}

export function fmtIndex(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(2);
}

/** Display text for a count, honoring reserve codes. */
export function fmtCount(v: number | null | undefined): string {
  if (isReported(v)) return v.toLocaleString("en-US");
  return "Not reported";
}
