/** [male, female, nonbinary/other] counts as reported by CRDC.
 *  Negative values are federal reserve codes (suppressed / not applicable /
 *  not reportable) — never treat them as zero in the UI. */
export type CountTriple = [number | null, number | null, number | null];

export type CourseKey = "cs" | "apcs" | "calc" | "phys" | "dsci" | "apall";

export const COURSES: { key: CourseKey; label: string; short: string }[] = [
  { key: "cs", label: "Computer Science", short: "CS" },
  { key: "apcs", label: "AP Computer Science", short: "AP CS" },
  { key: "calc", label: "Calculus", short: "Calc" },
  { key: "phys", label: "Physics", short: "Phys" },
  { key: "dsci", label: "Data Science", short: "Data Sci" },
  { key: "apall", label: "All AP courses", short: "All AP" },
];

export interface SchoolRecord {
  /** COMBOKEY — unique school id in the CRDC */
  k: string;
  /** school name */
  n: string;
  /** district (LEA) name */
  d: string;
  /** state postal code */
  s: string;
  /** total enrollment [M, F, X] */
  e: CountTriple;
  cs: CountTriple;
  apcs: CountTriple;
  calc: CountTriple;
  phys: CountTriple;
  dsci: CountTriple;
  apall: CountTriple;
  /** number of CS classes offered (null if not reported) */
  csclasses: number | null;
  /** state percentile (0–100) of girls' share per course, among schools
   *  in the same state with >= MIN_N students in that course; null if n/a */
  p: Partial<Record<CourseKey, number | null>>;
}

export interface IndexEntry {
  k: string;
  n: string;
  d: string;
  s: string;
  /** total enrollment (clipped) — used for search ranking */
  e: number;
}

export interface CourseAgg {
  m: number;
  f: number;
  x: number;
  girls_share: number | null;
  missing: number;
  zero_girls: number;
  zero_boys: number;
  n20: number;
  at_parity: number;
  median: number | null;
  q3: number | null;
}

export interface StateAgg {
  schools: number;
  enr_m: number;
  enr_f: number;
  [key: string]: number;
}

export interface National {
  schools: number;
  courses: Record<CourseKey, CourseAgg>;
  enrollment: { m: number; f: number; x: number; girls_share: number | null };
  offering_cs: number;
  states: Record<string, StateAgg>;
}
