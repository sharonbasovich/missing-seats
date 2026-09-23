import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNational } from "../lib/data";
import { fmtPct } from "../lib/metrics";
import type { National } from "../lib/types";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  PR: "Puerto Rico", GU: "Guam", VI: "US Virgin Islands", AS: "American Samoa",
  MP: "Northern Mariana Islands",
};

export default function StatesIndex() {
  const [nat, setNat] = useState<National | null>(null);
  useEffect(() => {
    getNational().then(setNat).catch(() => {});
  }, []);

  const rows = useMemo(() => {
    if (!nat) return [];
    return Object.entries(nat.states)
      .map(([code, s]) => {
        const csF = s["cs_f"] ?? 0;
        const csM = s["cs_m"] ?? 0;
        const share = csM + csF > 0 ? csF / (csM + csF) : null;
        const enrShare =
          s.enr_m + s.enr_f > 0 ? s.enr_f / (s.enr_m + s.enr_f) : null;
        return { code, schools: s.schools, share, enrShare };
      })
      .sort((a, b) => (a.share ?? -1) - (b.share ?? -1));
  }, [nat]);

  return (
    <div className="pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Girls' share of computer science, by state
      </h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Ranked lowest to highest — where the gender gap in CS classrooms is
        widest. Pick a state to rank its schools and download an outreach CSV.
      </p>
      {!nat && <p className="mt-8 text-ink-2">Loading…</p>}
      {nat && (
        <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => (
            <li key={r.code}>
              <Link
                to={`/state/${r.code}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-3 hover:border-accent"
              >
                <span className="text-sm">
                  <span className="mr-2 w-6 text-ink-2">{i + 1}.</span>
                  <span className="font-semibold">
                    {STATE_NAMES[r.code] ?? r.code}
                  </span>
                  <span className="ml-1 text-xs text-ink-2">
                    {r.schools.toLocaleString("en-US")} schools
                  </span>
                </span>
                <span className="text-sm font-bold text-accent">
                  {fmtPct(r.share)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-xs text-ink-2">
        Girls' share = female / (female + male) CS enrollment across the state's
        grade-12 public schools, our calculation from CRDC 2023–24.
      </p>
    </div>
  );
}
