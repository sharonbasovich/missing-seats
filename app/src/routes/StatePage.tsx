import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNational, getState } from "../lib/data";
import { fmtPct, isReported, totalOf } from "../lib/metrics";
import { rankState } from "../lib/peers";
import type { National, SchoolRecord } from "../lib/types";

export default function StatePage() {
  const { code } = useParams<{ code: string }>();
  const st = (code ?? "").toUpperCase();
  const [schools, setSchools] = useState<SchoolRecord[] | null>(null);
  const [nat, setNat] = useState<National | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setSchools(null);
    setErr(false);
    getState(st)
      .then(setSchools)
      .catch(() => setErr(true));
    getNational()
      .then(setNat)
      .catch(() => {});
  }, [st]);

  const rows = useMemo(
    () => (schools ? rankState(schools, "cs") : []),
    [schools],
  );

  const agg = nat?.states[st];

  function downloadCsv() {
    if (!schools) return;
    const header =
      "combokey,school,district,state,enrollment,cs_male,cs_female,cs_girls_share\n";
    const body = rows
      .map(({ r, share }) =>
        [
          r.k,
          `"${r.n.replace(/"/g, '""')}"`,
          `"${r.d.replace(/"/g, '""')}"`,
          r.s,
          totalOf(r.e),
          r.cs[0],
          r.cs[1],
          share.toFixed(4),
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + body + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `missing-seats-${st}-cs-girls-share.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (err)
    return (
      <p className="py-16 text-center text-warn">
        No data for &ldquo;{st}&rdquo; —{" "}
        <Link to="/states" className="underline">
          pick a state
        </Link>
        .
      </p>
    );
  if (!schools)
    return <p className="py-16 text-center text-ink-2">Loading {st}…</p>;

  const median = rows.length
    ? [...rows.map((r) => r.share)].sort((a, b) => a - b)[
        Math.floor(rows.length / 2)
      ]
    : null;

  const enrShare =
    agg && agg.enr_m + agg.enr_f > 0
      ? agg.enr_f / (agg.enr_m + agg.enr_f)
      : null;
  const csShare =
    agg && agg.cs_m + agg.cs_f > 0 ? agg.cs_f / (agg.cs_m + agg.cs_f) : null;

  return (
    <div className="pt-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <Link to="/states" className="text-accent underline">
          States
        </Link>{" "}
        / {st}
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
        {st}: every high school, ranked
      </h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {schools.length.toLocaleString("en-US")} grade-12 public schools
        {agg && (
          <>
            ; statewide, girls are <strong>{fmtPct(enrShare)}</strong> of
            enrollment and <strong>{fmtPct(csShare)}</strong> of CS students
          </>
        )}
        . Below: schools with ≥20 CS students ranked by girls' share
        {median !== null && <> (median {fmtPct(median)})</>}.
      </p>
      <button
        type="button"
        onClick={downloadCsv}
        className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
      >
        Download CSV ({rows.length.toLocaleString("en-US")} rows)
      </button>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-2">
              <th scope="col" className="px-4 py-3 font-semibold">#</th>
              <th scope="col" className="px-4 py-3 font-semibold">School</th>
              <th scope="col" className="px-4 py-3 font-semibold">District</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Enrollment
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Girls in CS
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Girls' share
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map(({ r, share }, i) => {
              const cM = isReported(r.cs[0]) ? r.cs[0] : 0;
              const cF = isReported(r.cs[1]) ? r.cs[1] : 0;
              return (
                <tr key={r.k} className="border-b border-line/60">
                  <td className="px-4 py-2 text-ink-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/school/${r.k}`}
                      className="font-medium text-accent underline"
                    >
                      {r.n}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-2">{r.d}</td>
                  <td className="px-4 py-2 text-right">
                    {totalOf(r.e).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {cF} / {cM + cF}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {fmtPct(share)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length > 200 && (
          <p className="px-4 py-3 text-xs text-ink-2">
            Showing top 200 of {rows.length.toLocaleString("en-US")} — the CSV
            has all of them.
          </p>
        )}
      </div>
      <p className="mt-4 text-xs text-ink-2">
        Only schools reporting ≥20 CS students are ranked. Source: CRDC
        2023–24; counts may differ by ±1.
      </p>
    </div>
  );
}
