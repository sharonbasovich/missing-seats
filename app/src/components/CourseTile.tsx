import {
  courseGirlsShare,
  enrollmentGirlsShare,
  fmtCount,
  fmtIndex,
  fmtInt,
  fmtPct,
  isLowN,
  isReported,
  missingSeats,
  notReportedReason,
  parityIndex,
  totalOf,
} from "../lib/metrics";
import type { CourseKey, SchoolRecord } from "../lib/types";

const LABELS: Record<CourseKey, string> = {
  cs: "Computer Science",
  apcs: "AP Computer Science",
  calc: "Calculus",
  phys: "Physics",
  dsci: "Data Science",
  apall: "All AP courses",
};

export default function CourseTile({
  school,
  course,
}: {
  school: SchoolRecord;
  course: CourseKey;
}) {
  const c = school[course];
  const [m, f, x] = c;
  const share = courseGirlsShare(c);
  const enrShare = enrollmentGirlsShare(school.e);
  const parity = parityIndex(share, enrShare);
  const missing = missingSeats(c, school.e);
  const lowN = isLowN(c);
  const pctile = school.p[course];
  const total = totalOf(c);
  const reported = isReported(m) && isReported(f);

  if (!reported) {
    return (
      <section
        aria-label={`${LABELS[course]} — not reported`}
        className="rounded-xl border border-line bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-ink-2">{LABELS[course]}</h3>
        <p className="mt-3 text-2xl font-bold text-ink-2">Not reported</p>
        <p className="mt-1 text-xs text-ink-2">
          {notReportedReason(m ?? f)} — the district left this blank or the
          federal file suppressed it. It does not mean zero.
        </p>
      </section>
    );
  }

  const enrPct = enrShare !== null ? enrShare * 100 : null;
  const coursePct = share !== null ? share * 100 : null;

  return (
    <section
      aria-label={LABELS[course]}
      className="rounded-xl border border-line bg-card p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-2">{LABELS[course]}</h3>
        {pctile !== null && pctile !== undefined && !lowN && (
          <span
            className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"
            title={`Girls' share is higher than ${pctile}% of ${school.s} high schools with at least 20 students in this course`}
          >
            better than {pctile}% of {school.s} schools
          </span>
        )}
        {lowN && (
          <span
            className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold"
            title="Fewer than 20 students — small groups are noisy, and federal counts may be off by ±1"
          >
            small group
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight">
        {fmtPct(share)}
        <span className="ml-2 text-sm font-medium text-ink-2">girls</span>
      </p>
      <p className="mt-1 text-sm text-ink-2">
        {fmtCount(f)} girls of {fmtInt(total)} students
        {isReported(x) && x > 0 && (
          <span title="CRDC nonbinary / third-gender count">
            {" "}
            (+{x} nonbinary)
          </span>
        )}
      </p>

      {/* share bar vs enrollment parity marker */}
      <div
        className="relative mt-4 h-3 w-full overflow-visible rounded-full bg-line"
        role="img"
        aria-label={`Girls are ${fmtPct(share)} of ${LABELS[course]} enrollment; parity with school enrollment would be ${fmtPct(enrShare)}`}
      >
        {coursePct !== null && (
          <div
            className="h-3 rounded-full bg-accent"
            style={{ width: `${Math.min(100, coursePct)}%` }}
          />
        )}
        {enrPct !== null && (
          <div
            className="absolute -top-1 h-5 w-1 rounded bg-gold"
            style={{ left: `calc(${enrPct}% - 2px)` }}
            title={`Parity marker: girls are ${fmtPct(enrShare)} of school enrollment`}
          />
        )}
      </div>
      <p className="mt-2 text-xs text-ink-2">
        <span className="font-semibold text-gold">Gold mark</span> = girls'
        share of school enrollment ({fmtPct(enrShare)}) — the parity target.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-2">
            Parity index
          </dt>
          <dd className="font-bold">
            {fmtIndex(parity)}
            {parity !== null && parity >= 1 && (
              <span className="ml-1 text-xs font-semibold text-good">
                at parity
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-2">
            Missing seats
          </dt>
          <dd className="font-bold text-accent">
            {missing === null ? "—" : fmtInt(missing)}
            {missing === 0 && (
              <span className="ml-1 text-xs font-semibold text-good">
                none — at or above parity
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
