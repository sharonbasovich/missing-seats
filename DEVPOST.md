# Devpost submission copy — Missing Seats

Paste-ready text for the Acodemic X G.I.R.L.S. Global SDG Hackathon submission
form. **Do not submit yet** — confirm every link and attach the real
screenshots/video first.

---

**Project name:** Missing Seats

**Tagline:** Find the girls missing from STEM classes at any US high school.

**Elevator pitch (short description):**
Type any US public high school and instantly see how many girls are missing
from its computer science, AP CS, calculus, and physics classrooms — from the
official federal 2023–24 Civil Rights Data Collection — then print a one-page
Action Pack a student or counselor can hand to a principal.

## Inspiration

Girls are 48.7% of US high-school students but only 35.5% of computer-science
students — roughly 144,000 girls' seats missing from CS classrooms in our
school-level estimate.
That number lives inside a 1.1 GB federal data file that almost nobody can
open. We wanted anyone — a student club, a counselor, a parent — to look up
*their* school in five seconds and walk away with evidence and a plan.

## What it does

- **Search** ~26,000 US public high schools (every school reporting grade 12)
  — instant typeahead, keyboard navigable.
- **Gap Card**: for CS, AP CS, Calculus, Physics, and Data Science — girls'
  share, a representation ratio (girls' course share ÷ girls' share of school
  enrollment), "missing seats" at parity, and a state percentile.
- **Peer proof**: the top same-state, same-size schools that actually closed
  the gap — proof the gap is closable, not "interest".
- **Action Pack**: a printable one-page brief with the numbers, the peers,
  three evidence-based next steps, and a ready-to-send email to a counselor or
  principal.
- **State pages** rank every school and export an outreach CSV for
  organizations like G.I.R.L.S.

## SDG alignment

- **SDG 4.5** (eliminate gender disparities in education): our school-level
  representation ratio is an SDG 4.5-inspired parity measure. It is our own
  calculation, not the official UN indicator 4.5.1.
- **SDG 5.b** (enabling technology for women's empowerment): we turn an
  inaccessible 1.1 GB federal dataset into a free, no-login public tool.
- **SDG 4.4 / 5.5**: course-taking gaps in the subjects that gate STEM skills
  and women's participation.

## Proof of value (our calculations from CRDC 2023–24)

- Girls: 48.7% of 17.1M high-school enrollment; 35.5% of 1.06M CS enrollment;
  32.1% of AP CS; 47.2% of calculus; 44.7% of physics.
- ~144,000 estimated girls' seats missing from CS at enrollment parity, summed
  across the included schools; this is our descriptive calculation.
- 1,083 high schools report CS students but zero girls.
- Only ~23% of schools with ≥20 CS students reach ≥45% girls in CS, according
  to our calculation from the CRDC file.

## How we built it

Python/pandas ETL reads the official CRDC CSVs, filters to grade-12 schools,
preserves federal reserve codes, and emits compact JSON shards (~300 KB first
load). The frontend is React + TypeScript + Vite + Tailwind with hand-rolled
prefix search, accessible components, and print CSS — a fully static site with
zero backend, zero API keys, zero cookies. Vitest covers the gap math, reserve
codes, low-N edge cases, peer selection, and search; a Python verification
script re-asserts every national total.

## Challenges

- Federal reserve codes (-9, -10, …) look like data but mean "suppressed / not
  applicable" — we show them as "Not reported", never as zero.
- OCR perturbs all counts by ±1 for privacy — we flag small groups (<20).
- The federal file's gender counts are male/female plus a small, heavily
  perturbed nonbinary category. Each share in our representation ratio uses
  female ÷ (female + male); we display nonbinary counts separately where
  reported.
- Fitting ~26k schools into a sub-second static lookup.

## Accomplishments

- Works for every US public high school with real federal data, no backend.
- 28 passing unit tests + an ETL assertion script; reserve codes verified
  end-to-end.
- Deep-linkable school and state pages; print-ready Action Pack.

## What we learned

The hardest part of civic data isn't the math — it's the file. The gap between
"the data exists" and "a counselor can act on it" is an engineering problem.

## What's next

District roll-ups, a Title IX athletics tile, yearly refresh when the 2025–26
CRDC lands, and the same parity method on other countries' sex-disaggregated
data.

## Built with

react, typescript, vite, tailwind-css, pandas, python, vitest, static-site —
hosted on GitHub Pages.

## Data & license statement

Source data: US Department of Education, Office for Civil Rights, 2023–24
Civil Rights Data Collection public-use file (https://ocrdata.ed.gov/data) — a
US government work in the public domain (17 U.S.C. §105). "Missing seats" and
the representation ratio are our descriptive calculations, not federal statistics or
legal findings. Federal reserve codes are shown as "Not reported", never as
zero. Counts may differ by ±1 due to privacy perturbation. Each share in the
representation ratio uses female ÷ (female + male); the federal file's small
nonbinary counts are shown separately and excluded. US public schools only. Not
affiliated with the US Department of Education. Code: MIT.

## Links

- Live demo: https://sharonbasovich.github.io/missing-seats/
- Source code: https://github.com/sharonbasovich/missing-seats
- Demo video: https://github.com/sharonbasovich/missing-seats/blob/main/demo-video-120s.mp4
  (2:00, silent/captioned walkthrough; upload to a Devpost-supported video host
  for the submission if required)
