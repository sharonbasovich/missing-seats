import { describe, expect, it } from "vitest";
import {
  clip,
  courseGirlsShare,
  enrollmentGirlsShare,
  fmtCount,
  girlsShare,
  isLowN,
  isReported,
  MIN_N,
  missingSeats,
  notReportedReason,
  parityIndex,
  totalOf,
} from "./metrics";
import type { CountTriple } from "./types";

// AT1/AT2 fixture: Heritage H S, Frisco ISD TX (CRDC 2023-24)
const HERITAGE_CS: CountTriple = [514, 237, -10];
const HERITAGE_ENR: CountTriple = [1066, 1042, -10];

describe("girlsShare / courseGirlsShare / enrollmentGirlsShare", () => {
  it("computes female / (female + male)", () => {
    expect(girlsShare(237, 514)).toBeCloseTo(0.3156, 4);
    expect(enrollmentGirlsShare(HERITAGE_ENR)).toBeCloseTo(1042 / 2108, 5);
  });
  it("returns null when either count is a reserve code", () => {
    expect(girlsShare(-10, 514)).toBeNull();
    expect(girlsShare(237, null)).toBeNull();
    expect(courseGirlsShare([-9, -9, -10])).toBeNull();
  });
  it("returns null when total is zero", () => {
    expect(girlsShare(0, 0)).toBeNull();
  });
});

describe("parityIndex (AT1)", () => {
  it("Heritage CS: 0.639 ± 0.001", () => {
    const pi = parityIndex(
      courseGirlsShare(HERITAGE_CS),
      enrollmentGirlsShare(HERITAGE_ENR),
    );
    expect(pi).toBeCloseTo(0.639, 2);
    expect(Math.abs((pi ?? 0) - 0.639)).toBeLessThan(0.002);
  });
  it("is 1.0 at exact parity", () => {
    expect(parityIndex(0.5, 0.5)).toBe(1);
  });
  it("returns null when inputs are not computable", () => {
    expect(parityIndex(null, 0.5)).toBeNull();
    expect(parityIndex(0.5, null)).toBeNull();
    expect(parityIndex(0.5, 0)).toBeNull();
  });
});

describe("missingSeats (AT2)", () => {
  it("Heritage CS: 134", () => {
    expect(missingSeats(HERITAGE_CS, HERITAGE_ENR)).toBe(134);
  });
  it("is 0 when girls are at or above parity (AT5)", () => {
    // 60% girls in course vs 50% of enrollment
    expect(missingSeats([40, 60, 0], [50, 50, 0])).toBe(0);
  });
  it("returns null on any reserve-code input (AT3)", () => {
    expect(missingSeats([-10, 30, 0], [50, 50, 0])).toBeNull();
    expect(missingSeats([70, 30, 0], [-9, 50, 0])).toBeNull();
    expect(missingSeats([70, 30, 0], [50, null, 0])).toBeNull();
  });
  it("returns null when enrollment or course total is zero", () => {
    expect(missingSeats([0, 0, 0], [50, 50, 0])).toBeNull();
    expect(missingSeats([10, 5, 0], [0, 0, 0])).toBeNull();
  });
});

describe("reserve codes (AT3)", () => {
  it("isReported is false for negatives and null", () => {
    expect(isReported(-10)).toBe(false);
    expect(isReported(-3)).toBe(false);
    expect(isReported(null)).toBe(false);
    expect(isReported(undefined)).toBe(false);
    expect(isReported(0)).toBe(true);
  });
  it("notReportedReason names the code", () => {
    expect(notReportedReason(-10)).toContain("suppressed");
    expect(notReportedReason(-9)).toContain("not applicable");
    expect(notReportedReason(null)).toBe("not reported");
  });
  it("fmtCount never shows a reserve code as a number or zero", () => {
    expect(fmtCount(-10)).toBe("Not reported");
    expect(fmtCount(-5)).toBe("Not reported");
    expect(fmtCount(0)).toBe("0");
  });
  it("clip contributes 0 to sums", () => {
    expect(clip(-10)).toBe(0);
    expect(clip(null)).toBe(0);
    expect(clip(7)).toBe(7);
    expect(totalOf([-10, 5, 3])).toBe(8);
  });
});

describe("isLowN (AT4)", () => {
  it("flags course totals under MIN_N", () => {
    expect(isLowN([10, 9, 0])).toBe(true);
    expect(isLowN([10, 10, 0])).toBe(false); // exactly MIN_N is OK
    expect(MIN_N).toBe(20);
  });
  it("does not flag unreported courses (they are 'not reported', not low-N)", () => {
    expect(isLowN([-10, 5, 0])).toBe(false);
  });
});
