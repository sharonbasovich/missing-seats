export default function About() {
  return (
    <div className="prose-sm max-w-3xl pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Data &amp; method
      </h1>

      <h2 className="mt-8 text-xl font-bold">The data</h2>
      <p className="mt-2 text-ink-2">
        Every number comes from the{" "}
        <a
          href="https://ocrdata.ed.gov/data"
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          2023–24 Civil Rights Data Collection (CRDC)
        </a>
        , the US Department of Education Office for Civil Rights' census of
        ~97,000 public schools, self-reported by districts. We keep the 25,867
        schools reporting grade 12 and read five course files: Computer
        Science, Advanced Placement (CS subset), Calculus, Physics, and Data
        Science. The CRDC is a US government work — public domain (17 U.S.C.
        §105).
      </p>

      <h2 className="mt-8 text-xl font-bold">How we calculate</h2>
      <ul className="mt-2 list-inside list-disc space-y-2 text-ink-2">
        <li>
          <strong>Girls' share</strong> = female / (female + male) in the course
          or in total enrollment.
        </li>
        <li>
          <strong>Parity index</strong> = girls' course share ÷ girls'
          enrollment share. 1.00 is exact parity. This is the method of UN SDG
          indicator 4.5.1 ("parity indices (female/male …) for all education
          indicators").
        </li>
        <li>
          <strong>Missing seats</strong> = course enrollment × girls' share of
          school enrollment − girls actually enrolled, floored at zero. It
          answers: "if this course matched the school's gender mix, how many
          more girls would be in it?" It is our descriptive calculation — not a
          federal statistic and not a legal finding.
        </li>
        <li>
          <strong>State percentile</strong> ranks the school's girls' share
          against same-state schools reporting ≥20 students in that course.
        </li>
        <li>
          <strong>Peers</strong> are same-state schools with total enrollment
          within ±25% and ≥20 reported students in the course.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">Data honesty</h2>
      <ul className="mt-2 list-inside list-disc space-y-2 text-ink-2">
        <li>
          <strong>Privacy perturbation:</strong> OCR randomly shifts student
          counts by ±1, so small numbers are approximate.
        </li>
        <li>
          <strong>Reserve codes:</strong> negative values in the federal file
          (-3 processing error, -9 not applicable, -10 suppressed, -11
          suppressed for data quality, -13 missing skip logic, and similar) are
          shown as "Not reported" — never as zero.
        </li>
        <li>
          <strong>Gender categories:</strong> the CRDC reports male, female,
          and a nonbinary (X) category. The parity ratio compares female and
          male counts only — the federal binary does not capture all genders,
          and X counts are small and heavily perturbed, so we display them
          separately where reported.
        </li>
        <li>
          <strong>Correlation, not cause:</strong> gaps have many causes
          (scheduling, prerequisites, culture). This tool shows where gaps
          exist and that peers closed them — it does not diagnose why.
        </li>
        <li>
          <strong>Coverage:</strong> US public schools only; private schools
          are not in the CRDC. The method generalizes to any dataset with
          sex-disaggregated course enrollment.
        </li>
        <li>
          <strong>Privacy:</strong> no accounts, no cookies, no personal data
          collected.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">SDG alignment</h2>
      <ul className="mt-2 list-inside list-disc space-y-2 text-ink-2">
        <li>
          <a
            href="https://sdgs.un.org/goals/goal4"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            <strong>SDG 4.5</strong>
          </a>{" "}
          — eliminate gender disparities in education; indicator 4.5.1 is a
          parity index, which is exactly our core metric.
        </li>
        <li>
          <a
            href="https://sdgs.un.org/goals/goal5"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            <strong>SDG 5.b</strong>
          </a>{" "}
          — enhance the use of enabling technology to promote women's
          empowerment: we turn a 1.1 GB federal file into a 5-second lookup.
        </li>
        <li>
          <strong>SDG 4.4 / 5.5</strong> — relevant skills for employment;
          women's participation.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">Sources</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-ink-2">
        <li>
          CRDC 2023–24 public-use data:{" "}
          <a
            href="https://ocrdata.ed.gov/data"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            ocrdata.ed.gov/data
          </a>
        </li>
        <li>
          CRDC 2023–24 User's Manual (reserve codes §5.4, perturbation §5.3):{" "}
          <a
            href="https://ocrdata.ed.gov/assets/downloads/2023-24%20User's%20Manual.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            user's manual PDF
          </a>
        </li>
        <li>
          UN SDG 4 and indicator 4.5.1 metadata:{" "}
          <a
            href="https://unstats.un.org/sdgs/metadata/files/Metadata-04-05-01.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            unstats.un.org
          </a>
        </li>
        <li>
          Intervention evidence:{" "}
          <a
            href="https://ncwit.org/program/counselors-for-computing/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            NCWIT counselor-advising program
          </a>
          ,{" "}
          <a
            href="https://doi.org/10.1145/2839509.2850567"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            SIGCSE research
          </a>
          ,{" "}
          <a
            href="https://code.org/diversity"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            Code.org diversity toolkit
          </a>
        </li>
      </ul>

      <p className="mt-8 text-xs text-ink-2">
        Missing Seats is an independent open-source project. Not affiliated
        with the US Department of Education.
      </p>
    </div>
  );
}
