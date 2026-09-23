import { describe, expect, it } from "vitest";
import { findPeers, rankState } from "./peers";
import type { CountTriple, SchoolRecord } from "./types";

function rec(
  k: string,
  enr: number,
  csM: number | null,
  csF: number | null,
): SchoolRecord {
  const half = Math.floor(enr / 2);
  const e: CountTriple = [enr - half, half, -10];
  const cs: CountTriple = [csM ?? -9, csF ?? -9, -10];
  return {
    k,
    n: `School ${k}`,
    d: "Test ISD",
    s: "TX",
    e,
    cs,
    apcs: [-9, -9, -10],
    calc: [-9, -9, -10],
    phys: [-9, -9, -10],
    dsci: [-9, -9, -10],
    apall: [-9, -9, -10],
    csclasses: 5,
    p: {},
  };
}

const TARGET = rec("t", 1000, 100, 40); // 28.6% girls

describe("findPeers", () => {
  const pool = [
    TARGET,
    rec("a", 1100, 60, 60), // 50% — in range, top peer
    rec("b", 900, 80, 20), // 20% — in range
    rec("c", 1300, 50, 50), // enrollment out of ±25% (1300 > 1250)
    rec("d", 1000, 10, 5), // course n < 20 — excluded
    rec("e", 1000, -10, null), // suppressed — excluded
    rec("f", 800, 30, 30), // 50% — in range (boundary)
  ];
  const res = findPeers(pool, TARGET, "cs");

  it("keeps only same-size schools with ≥20 reported course students (AT6)", () => {
    const keys = res.peers.map((p) => p.k);
    expect(keys).toContain("a");
    expect(keys).toContain("b");
    expect(keys).toContain("f");
    expect(keys).not.toContain("c"); // too big
    expect(keys).not.toContain("d"); // low N
    expect(keys).not.toContain("e"); // suppressed
    expect(keys).not.toContain("t"); // never includes itself
    expect(res.poolSize).toBe(3);
  });
  it("ranks by girls' share descending", () => {
    expect(res.peers.map((p) => p.k)).toEqual(["a", "f", "b"]);
  });
  it("reports pool median / top quartile / target share", () => {
    expect(res.medianShare).toBeCloseTo(0.5, 5);
    expect(res.targetShare).toBeCloseTo(40 / 140, 5);
  });
  it("returns an empty pool when target has no enrollment", () => {
    const ghost = rec("g", 0, 10, 10);
    const r = findPeers([ghost, ...pool], ghost, "cs");
    expect(r.poolSize).toBe(0);
    expect(r.peers).toEqual([]);
  });
});

describe("rankState (AT6 pool)", () => {
  it("excludes low-N and unreported courses, sorts desc", () => {
    const rows = rankState(
      [rec("a", 1000, 60, 60), rec("b", 1000, 80, 20), rec("c", 1000, 10, 5)],
      "cs",
    );
    expect(rows.map((x) => x.r.k)).toEqual(["a", "b"]);
    expect(rows[0].share).toBeCloseTo(0.5, 5);
  });
});
