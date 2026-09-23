import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseTile from "../components/CourseTile";
import PeerTable from "../components/PeerTable";
import SearchBox from "../components/SearchBox";
import { getSchool, getState } from "../lib/data";
import {
  courseGirlsShare,
  fmtCount,
  fmtInt,
  fmtPct,
  isReported,
  missingSeats,
  totalOf,
} from "../lib/metrics";
import { findPeers } from "../lib/peers";
import { COURSES, type SchoolRecord } from "../lib/types";

export default function School() {
  const { key } = useParams<{ key: string }>();
  const [school, setSchool] = useState<SchoolRecord | null>(null);
  const [stateSchools, setStateSchools] = useState<SchoolRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    setStatus("loading");
    setSchool(null);
    (async () => {
      try {
        const s = await getSchool(key ?? "");
        if (!s) {
          setStatus("missing");
          return;
        }
        setSchool(s);
        setStateSchools(await getState(s.s));
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    })();
  }, [key]);

  const peers = useMemo(
    () => (school ? findPeers(stateSchools, school, "cs") : null),
    [stateSchools, school],
  );

  if (status === "loading")
    return <p className="py-16 text-center text-ink-2">Loading school…</p>;
  if (status === "missing")
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">School not found</p>
        <p className="mt-2 text-ink-2">
          That link doesn't match a grade-12 public school in the 2023–24 CRDC.
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <SearchBox />
        </div>
      </div>
    );
  if (status === "error" || !school)
    return (
      <p className="py-16 text-center text-warn">
        Something went wrong loading the data. Try refreshing.
      </p>
    );

  const [em, ef, ex] = school.e;
  const enrShare =
    isReported(em) && isReported(ef) && em + ef > 0
      ? ef / (em + ef)
      : null;
  const csShare = courseGirlsShare(school.cs);
  const csMissing = missingSeats(school.cs, school.e);
  const offersCs =
    isReported(school.csclasses) && school.csclasses > 0;

  return (
    <div className="pt-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <Link to="/" className="text-accent underline">
          Search
        </Link>{" "}
        /{" "}
        <Link to={`/state/${school.s}`} className="text-accent underline">
          {school.s}
        </Link>{" "}
        / {school.n}
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">{school.n}</h1>
        <p className="mt-1 text-ink-2">
          {school.d} · {school.s} · {fmtInt(totalOf(school.e))} students (
          {fmtCount(em)} boys, {fmtCount(ef)} girls
          {isReported(ex) && ex > 0 ? `, ${ex} nonbinary` : ""})
          {enrShare !== null && <> — girls {fmtPct(enrShare)}</>}
        </p>
      </header>

      {offersCs === false && isReported(school.csclasses) && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
          This school reported <strong>0 computer science classes</strong> in
          2023–24 — the missing seats start with no seats at all.
        </p>
      )}

      <section aria-label="Course gaps" className="mt-6 grid gap-4 sm:grid-cols-2">
        {COURSES.filter(({ key }) => {
          const c = school[key];
          // hide Data Science entirely when nothing is reported
          return key !== "dsci" || isReported(c[0]) || isReported(c[1]);
        }).map(({ key }) => (
          <CourseTile key={key} school={school} course={key} />
        ))}
      </section>

      <section
        aria-label="Peer proof"
        className="mt-8 rounded-xl border border-line bg-card p-6"
      >
        <h2 className="text-xl font-bold">
          Proof it's closable: similar {school.s} schools
        </h2>
        {peers && (
          <div className="mt-3">
            <PeerTable
              school={school}
              peer={peers}
              course="cs"
            />
          </div>
        )}
      </section>

      <section className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          to={`/school/${school.k}/pack`}
          className="rounded-xl bg-accent px-6 py-3 text-lg font-bold text-white shadow hover:bg-accent-2"
        >
          Build the Action Pack →
        </Link>
        <p className="text-sm text-ink-2">
          One page: this school's numbers, the peer proof, three evidence-based
          next steps, and a ready-to-send email for a counselor or principal.
        </p>
      </section>

      {csShare !== null && csMissing !== null && (
        <aside className="mt-8 rounded-xl bg-ink p-5 text-paper" aria-label="Summary">
          <p className="text-sm leading-relaxed">
            In one line: girls are {fmtPct(enrShare)} of {school.n} but{" "}
            {fmtPct(csShare)} of its computer-science students — about{" "}
            <strong>{fmtInt(csMissing)} missing seats</strong> at parity.
          </p>
        </aside>
      )}

      <p className="mt-8 text-xs text-ink-2">
        Source: US ED OCR, 2023–24 CRDC public-use file. Counts may differ by
        ±1 (federal privacy perturbation). Negative federal reserve codes
        (suppressed / not applicable) are shown as "Not reported", never as
        zero. Girls' share compares female vs. male counts; the CRDC's
        nonbinary counts are shown separately and excluded from the parity
        ratio. <Link to="/about" className="underline">Method &amp; caveats</Link>
      </p>
    </div>
  );
}
