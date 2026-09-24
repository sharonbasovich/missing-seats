import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountUp from "../components/CountUp";
import SearchBox from "../components/SearchBox";
import { getNational } from "../lib/data";
import { fmtPct } from "../lib/metrics";
import { COURSES, type National } from "../lib/types";

export default function Home() {
  const [nat, setNat] = useState<National | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getNational()
      .then(setNat)
      .catch(() => setErr("Could not load national data."));
  }, []);

  const cs = nat?.courses.cs;

  return (
    <div>
      <section className="pt-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          SDG 4.5 · 5.b — every US public high school
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Girls are{" "}
          {nat ? fmtPct(nat.enrollment.girls_share, 0) : "49%"} of US high
          schoolers — but{" "}
          {cs?.girls_share ? fmtPct(cs.girls_share, 0) : "35%"} of computer
          science students.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-2">
          Find the missing seats at your school — from the official 2023–24
          Civil Rights Data Collection, covering{" "}
          {nat ? nat.schools.toLocaleString("en-US") : "…"} public high schools.
        </p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBox autoFocus />
        </div>
        {err && <p className="mt-3 text-sm text-warn">{err}</p>}
      </section>

      {nat && cs && (
        <section
          aria-label="National numbers"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-3xl font-extrabold text-accent">
              <CountUp value={cs.missing} />
            </p>
            <p className="mt-1 text-sm text-ink-2">
              girls' seats missing from CS classrooms at enrollment parity
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-3xl font-extrabold text-accent">
              <CountUp value={cs.zero_girls} />
            </p>
            <p className="mt-1 text-sm text-ink-2">
              high schools report CS students — and zero girls
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-3xl font-extrabold text-accent">
              {cs.n20 > 0 ? Math.round((100 * cs.at_parity) / cs.n20) : 0}%
            </p>
            <p className="mt-1 text-sm text-ink-2">
              of schools with ≥20 CS students reach ≥45% girls
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5 text-center">
            <p className="text-3xl font-extrabold text-accent">
              <CountUp value={nat.schools - nat.offering_cs} />
            </p>
            <p className="mt-1 text-sm text-ink-2">
              high schools report zero computer-science classes — the missing
              seats start with no seats at all
            </p>
          </div>
        </section>
      )}

      {nat && (
        <section className="mt-12" aria-label="Girls' share by course, national">
          <h2 className="text-xl font-bold">The national picture</h2>
          <p className="mt-1 text-sm text-ink-2">
            Girls' share of each course vs. their{" "}
            {fmtPct(nat.enrollment.girls_share)} share of high-school
            enrollment (<span className="font-semibold text-gold">gold</span>).
          </p>
          <div className="mt-4 space-y-3">
            {COURSES.map(({ key, label }) => {
              const agg = nat.courses[key];
              const share = agg.girls_share;
              if (share === null || share === undefined) return null;
              const enrShare = nat.enrollment.girls_share ?? 0;
              return (
                <div key={key} className="grid grid-cols-[11rem_1fr_4rem] items-center gap-3">
                  <span className="text-sm font-medium">{label}</span>
                  <div
                    className="relative h-4 rounded-full bg-line"
                    role="img"
                    aria-label={`${label}: girls ${fmtPct(share)} of enrollment vs ${fmtPct(enrShare)} of high-school enrollment`}
                  >
                    <div
                      className="h-4 rounded-full bg-accent"
                      style={{ width: `${share * 100}%` }}
                    />
                    <div
                      className="absolute -top-0.5 h-5 w-1 rounded bg-gold"
                      style={{ left: `calc(${enrShare * 100}% - 2px)` }}
                    />
                  </div>
                  <span className="text-right text-sm font-semibold">
                    {fmtPct(share)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink-2">
            Computed by us from the CRDC 2023–24 public-use file.{" "}
            <Link to="/about" className="text-accent underline">
              How we calculate
            </Link>{" "}
            ·{" "}
            <Link to="/states" className="text-accent underline">
              Browse states
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
