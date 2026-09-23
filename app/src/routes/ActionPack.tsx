import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSchool, getState } from "../lib/data";
import {
  courseGirlsShare,
  enrollmentGirlsShare,
  fmtInt,
  fmtPct,
  isReported,
  missingSeats,
  parityIndex,
  totalOf,
} from "../lib/metrics";
import { findPeers } from "../lib/peers";
import { COURSES, type SchoolRecord } from "../lib/types";

const COURSE_LABEL: Record<string, string> = {
  cs: "Computer Science",
  apcs: "AP Computer Science",
  calc: "Calculus",
  phys: "Physics",
  dsci: "Data Science",
};

const STEPS = [
  {
    title: "1. Counselor advising on CS pathways",
    body: "Ask the counseling team to review which students are advised into CS. Programs like NCWIT's Advising for Future-Ready Students (formerly Counselors for Computing) train counselors to recommend computing to all students.",
    link: "https://ncwit.org/program/counselors-for-computing/",
    linkText: "ncwit.org/program/counselors-for-computing",
  },
  {
    title: "2. Recruit-by-invitation into foundational CS",
    body: "Peer-reviewed work presented at SIGCSE associates invitation-based recruitment and inclusive introductory courses (e.g., AP CS Principles) with more representative CS classrooms.",
    link: "https://doi.org/10.1145/2839509.2850567",
    linkText: "doi.org/10.1145/2839509.2850567",
  },
  {
    title: "3. Start or grow a girls-in-STEM club",
    body: "A visible community changes who walks into the CS classroom. G.I.R.L.S. chapters and Code.org's diversity toolkit offer ready-made starting points.",
    link: "https://code.org/diversity",
    linkText: "code.org/diversity",
  },
];

function buildEmail(school: SchoolRecord): string {
  const enrShare = enrollmentGirlsShare(school.e);
  const csShare = courseGirlsShare(school.cs);
  const missing = missingSeats(school.cs, school.e);
  const lines = [
    `Subject: Girls' participation in computer science at ${school.n}`,
    "",
    `Hello,`,
    "",
    `I looked at our school's numbers in the US Department of Education's 2023-24 Civil Rights Data Collection (the same file every public district reports).`,
    "",
    `At ${school.n}:`,
    `  - Girls are ${fmtPct(enrShare)} of total enrollment`,
    csShare !== null
      ? `  - But only ${fmtPct(csShare)} of computer-science students (${school.cs[1]} girls of ${totalOf(school.cs)})`
      : `  - Computer-science enrollment by gender was not reported`,
    missing !== null && missing > 0
      ? `  - At enrollment parity that is about ${missing} additional girls' seats in CS`
      : "",
    "",
    `Similar-size schools in ${school.s} reach far higher girls' shares in CS, so this gap is closable. Could we talk about advising practices, invitation-based recruitment into CS courses, and support for a girls-in-STEM club?`,
    "",
    `Data and method: Missing Seats, built on the 2023-24 CRDC public-use file (https://ocrdata.ed.gov/data). "Missing seats" is a descriptive parity calculation, not a federal statistic.`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export default function ActionPack() {
  const { key } = useParams<{ key: string }>();
  const [school, setSchool] = useState<SchoolRecord | null>(null);
  const [stateSchools, setStateSchools] = useState<SchoolRecord[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSchool(key ?? "");
      if (!s) return;
      setSchool(s);
      setStateSchools(await getState(s.s));
    })();
  }, [key]);

  const peers = useMemo(
    () => (school ? findPeers(stateSchools, school, "cs") : null),
    [stateSchools, school],
  );

  if (!school)
    return <p className="py-16 text-center text-ink-2">Loading Action Pack…</p>;

  const enrShare = enrollmentGirlsShare(school.e);
  const email = buildEmail(school);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="print-page mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3">
        <Link
          to={`/school/${school.k}`}
          className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-accent"
        >
          ← Back to school
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-2"
        >
          Print / Save as PDF
        </button>
        <button
          type="button"
          onClick={copyEmail}
          className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-ink hover:border-accent"
        >
          {copied ? "Copied!" : "Copy email"}
        </button>
      </div>

      <article className="rounded-xl border border-line bg-card p-8 print:border-0 print:p-0">
        <header className="border-b-2 border-ink pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Action Pack — Missing Seats
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">{school.n}</h1>
          <p className="text-sm text-ink-2">
            {school.d} · {school.s} · {fmtInt(totalOf(school.e))} students ·
            girls {fmtPct(enrShare)} of enrollment
          </p>
        </header>

        <section className="mt-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            The numbers (CRDC 2023–24)
          </h2>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-ink-2">
                <th className="py-1 pr-3">Course</th>
                <th className="py-1 pr-3 text-right">Girls / total</th>
                <th className="py-1 pr-3 text-right">Girls' share</th>
                <th className="py-1 pr-3 text-right">Representation ratio</th>
                <th className="py-1 text-right">Missing seats</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.filter(({ key }) => key !== "apall").map(({ key }) => {
                const c = school[key];
                if (!isReported(c[0]) || !isReported(c[1])) return null;
                const share = courseGirlsShare(c);
                const pi = parityIndex(share, enrShare);
                const miss = missingSeats(c, school.e);
                return (
                  <tr key={key} className="border-b border-line/50">
                    <td className="py-1 pr-3 font-medium">
                      {COURSE_LABEL[key]}
                    </td>
                    <td className="py-1 pr-3 text-right">
                      {c[1]} / {totalOf(c)}
                    </td>
                    <td className="py-1 pr-3 text-right">{fmtPct(share)}</td>
                    <td className="py-1 pr-3 text-right">
                      {pi === null ? "—" : pi.toFixed(2)}
                    </td>
                    <td className="py-1 text-right font-semibold">
                      {miss === null ? "—" : fmtInt(miss)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-ink-2">
            Representation ratio = girls' course share ÷ girls' share of school
            enrollment; 1.00 means a match. This SDG 4.5-inspired measure is
            not official indicator 4.5.1. Missing seats = course size ×
            girls' enrollment share − girls enrolled (floored at 0); our
            descriptive calculation, not a federal statistic.
          </p>
        </section>

        {peers && peers.peers.length > 0 && (
          <section className="mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Peer proof — the gap is closable
            </h2>
            <p className="mt-1 text-sm">
              {peers.poolSize} similar-size {school.s} high schools: median
              girls' CS share {fmtPct(peers.medianShare)}, top quartile{" "}
              {fmtPct(peers.topQuartile)}. This school:{" "}
              {fmtPct(peers.targetShare)}.
            </p>
            <ul className="mt-1 list-inside list-disc text-sm">
              {peers.peers.slice(0, 3).map((p) => (
                <li key={p.k}>
                  {p.n} ({p.d}) — {fmtPct(courseGirlsShare(p.cs))} girls in CS
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Three next steps with published evidence
          </h2>
          <ul className="mt-1 space-y-1.5 text-sm">
            {STEPS.map((s) => (
              <li key={s.title}>
                <strong>{s.title}.</strong> {s.body}{" "}
                <span className="text-ink-2">({s.linkText})</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Ready-to-send email
          </h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-paper p-4 font-sans text-xs leading-relaxed text-ink">
            {email}
          </pre>
        </section>

        <footer className="mt-4 border-t border-line pt-3 text-xs text-ink-2">
          <p>
            Source: US Dept. of Education OCR, Civil Rights Data Collection
            2023–24 public-use file (ocrdata.ed.gov/data). Counts may differ by
            ±1 (federal privacy perturbation). "Not reported" = federal reserve
            code, not zero. Each share uses female ÷ (female + male); nonbinary
            counts are excluded from the ratio because they are small and
            heavily perturbed. Gaps have many causes — this pack shows where a
            gap exists and that peers closed it, not why. Missing Seats is an
            independent open-source project, not affiliated with US ED.
          </p>
        </footer>
      </article>
    </div>
  );
}
