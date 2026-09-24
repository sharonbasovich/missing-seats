import { Link } from "react-router-dom";
import { courseGirlsShare, fmtPct, isReported, totalOf } from "../lib/metrics";
import type { PeerResult } from "../lib/peers";
import type { CourseKey, SchoolRecord } from "../lib/types";

const COURSE_LABEL: Record<CourseKey, string> = {
  cs: "computer science",
  apcs: "AP computer science",
  calc: "calculus",
  phys: "physics",
  dsci: "data science",
  apall: "AP courses",
};

export default function PeerTable({
  school,
  peer,
  course,
}: {
  school: SchoolRecord;
  peer: PeerResult;
  course: CourseKey;
}) {
  if (peer.poolSize === 0) {
    return (
      <p className="text-sm text-ink-2">
        No similar-size schools in {school.s} report at least 20 students in{" "}
        {COURSE_LABEL[course]}, so we cannot show peer comparisons.
      </p>
    );
  }
  const rows = peer.peers.map((r) => ({
    r,
    share: courseGirlsShare(r[course]) ?? 0,
  }));
  return (
    <div>
      <p className="text-sm text-ink-2">
        Among {peer.poolSize} similar-size {school.s} high schools reporting ≥20{" "}
        {COURSE_LABEL[course]} students (enrollment within ±25% of this
        school's): median girls' share{" "}
        <strong>{fmtPct(peer.medianShare)}</strong>, top quartile{" "}
        <strong>{fmtPct(peer.topQuartile)}</strong>.
        {peer.targetShare !== null && (
          <>
            {" "}
            This school: <strong>{fmtPct(peer.targetShare)}</strong>.
          </>
        )}{" "}
        The gap is closable — these peers did it:
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Similar-size {school.s} schools with the highest girls' share in{" "}
            {COURSE_LABEL[course]}
          </caption>
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-2">
              <th scope="col" className="py-2 pr-4 font-semibold">
                School
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                District
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">
                Students
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold">
                Girls in course
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Girls' share
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, share }) => {
              const c = r[course];
              const girls = isReported(c[1]) ? c[1] : 0;
              const tot = isReported(c[0]) && isReported(c[1])
                ? c[0] + c[1]
                : 0;
              return (
                <tr key={r.k} className="border-b border-line/60">
                  <td className="py-2 pr-4">
                    <Link
                      to={`/school/${r.k}`}
                      className="font-medium text-accent underline"
                    >
                      {r.n}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-ink-2">{r.d}</td>
                  <td className="py-2 pr-4 text-right">
                    {totalOf(r.e).toLocaleString("en-US")}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {girls} / {tot}
                  </td>
                  <td className="py-2 text-right font-semibold text-good">
                    {fmtPct(share)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-2">
        Peer pool: same state, total enrollment within ±25% of{" "}
        {totalOf(school.e).toLocaleString("en-US")}, at least 20 students in the
        course, girls' share reported.
      </p>
    </div>
  );
}
