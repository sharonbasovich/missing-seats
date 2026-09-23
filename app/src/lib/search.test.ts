import { describe, expect, it } from "vitest";
import { normalize, search } from "./search";
import type { IndexEntry } from "./types";

function entry(k: string, n: string, d: string, s: string, e = 1000): IndexEntry {
  return { k, n, d, s, e };
}

const INDEX: IndexEntry[] = [
  entry("1", "HERITAGE H S", "FRISCO ISD", "TX", 2100),
  entry("2", "COLLEYVILLE HERITAGE H S", "GRAPEVINE-COLLEYVILLE ISD", "TX", 1900),
  entry("3", "HERITAGE HIGH SCHOOL", "LITTLETON PUBLIC SCHOOLS", "CO", 1600),
  entry("4", "BRIDGEWATER-RARITAN REGIONAL HIGH SCHOOL", "BRIDGEWATER-RARITAN REGIONAL SCHOOL DISTRICT", "NJ", 2700),
  entry("5", "EAST SIDE HIGH SCHOOL", "NEWARK PUBLIC", "NJ", 200),
];

describe("normalize", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalize("Bridgewater-Raritan  H.S.")).toBe(
      "bridgewater raritan h s",
    );
  });
});

describe("search", () => {
  it("finds schools by name prefix", () => {
    const r = search(INDEX, "heritage");
    expect(r.map((e) => e.k)).toContain("1");
    expect(r.map((e) => e.k)).toContain("3");
  });
  it("combines name and district tokens (name+district mixed query)", () => {
    const r = search(INDEX, "heritage frisco");
    expect(r[0].k).toBe("1");
  });
  it("matches district names alone", () => {
    const r = search(INDEX, "bridgewater raritan");
    expect(r.map((e) => e.k)).toContain("4");
  });
  it("handles punctuation in the query", () => {
    const r = search(INDEX, "east side");
    expect(r.map((e) => e.k)).toContain("5");
  });
  it("returns [] for empty or unmatched queries", () => {
    expect(search(INDEX, "")).toEqual([]);
    expect(search(INDEX, "zzzzzz")).toEqual([]);
  });
  it("limits results and is deterministic", () => {
    const big = Array.from({ length: 50 }, (_, i) =>
      entry(`x${i}`, `HERITAGE SCHOOL ${i}`, "X ISD", "TX", i),
    );
    const r = search(big, "heritage");
    expect(r.length).toBeLessThanOrEqual(8);
    expect(r.map((e) => e.k)).toEqual(
      search(big, "heritage").map((e) => e.k),
    );
  });
});
