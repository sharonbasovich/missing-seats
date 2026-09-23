# Missing Seats

**Find the girls missing from STEM classes at any US public high school.**

[Live demo](https://sharonbasovich.github.io/missing-seats/) · [Two-minute walkthrough](demo-video-120s.mp4)

Girls are 48.7% of US high-school enrollment but only 35.5% of computer-science
students — about **144,000 missing seats** in our school-level estimate. Missing Seats turns the
1.1 GB federal file behind that number into a 5-second lookup: type a school,
see its gender participation gaps in Computer Science, AP Computer Science,
Calculus, Physics, and Data Science, compare it with similar schools in its
state that closed the gap, and print a one-page **Action Pack** for a counselor
or principal.

- **No login, no backend, no API keys, no cookies.** Static site + build-time
  data pipeline.
- **Data:** US Department of Education, Office for Civil Rights,
  [2023–24 Civil Rights Data Collection (CRDC)](https://ocrdata.ed.gov/data)
  public-use file — 25,867 schools reporting grade 12.

Built for the **Acodemic X G.I.R.L.S. Global SDG Hackathon**.

## SDG mapping

| SDG | How Missing Seats maps to it |
|---|---|
| **4.5** — eliminate gender disparities in education | A school-level, SDG 4.5-inspired parity measure surfaces course-participation gaps; it is not the official UN indicator 4.5.1. |
| **5.b** — enabling technology for women's empowerment | Turns an official but unusable 1.1 GB federal dataset into a free public tool a student, parent, or counselor can use in seconds. |
| **4.4 / 5.5** — relevant skills; women's participation | Surfaces course-taking gaps in the subjects that gate STEM pathways, with a concrete ask a school can act on. |

## How it works

```
CRDC CSVs (latin-1)            static JSON shards            static SPA
  SCH/Enrollment.csv     ┐       index.json  (~2.5 MB)   ┐     React + TypeScript
  SCH/Computer Science   │       states/<ST>.json        │     Vite + Tailwind
  SCH/Advanced Placement ├─ etl/  national.json          ├─→   hash-routed, no server
  SCH/Calculus.csv       │   build_data.py               │     print-CSS Action Pack
  SCH/Physics.csv        │   (pandas)                    │
  SCH/Data Science.csv   ┘                               ┘
  SCH/School Characteristics
```

- **ETL** (`etl/build_data.py`): pandas; filters `SCH_GRADE_G12 == "Yes"`;
  joins the course files on `COMBOKEY`; preserves federal reserve codes
  verbatim; precomputes per-state percentile pools. `etl/verify.py` asserts the
  output against independently computed national totals.
- **Frontend** (`app/`): client-side prefix search over ~26k schools; per-state
  JSON shards loaded on demand; all math runs in `src/lib/metrics.ts`.
- **Print**: the Action Pack is plain HTML + `@media print` — "Save as PDF" is
  the browser's own.

### Definitions (see in-app *Data & method* page for the full version)

- **Girls' share** = female ÷ (female + male).
- **Representation ratio** = girls' course share ÷ girls' share of school
  enrollment. `1.00` means the course matches the school's gender mix. This is
  our SDG 4.5-inspired parity measure, not official indicator 4.5.1.
- **Missing seats** = course enrollment × girls' enrollment share − girls
  enrolled, floored at 0. *Our descriptive calculation — not a federal
  statistic or a legal finding.*
- **Peers** = same-state schools with enrollment within ±25% and ≥20 reported
  students in the course.
- **Reserve codes**: CRDC uses negative values (-3, -5, -6, -7, -9, -10, -11,
  -13) for suppressed/unreportable data. We display them as "Not reported" —
  never as zero — and exclude them from sums.
- **Perturbation**: OCR shifts all student counts by ±1 for privacy; small
  counts are approximate. Courses under 20 students get a "small group" flag.

### Gender categories — an honest note

The federal file reports male, female, and a nonbinary (X) category. X counts
are small, frequently suppressed, and the most heavily perturbed. Both shares
in our ratio use female ÷ (female + male) — **the federal binary does not
capture all genders** — and X counts are displayed separately wherever reported.

## Limitations

- 2023–24 school year; self-reported by districts to OCR.
- US public schools only — private schools are not in the CRDC.
- "Missing seats" shows *where* a gap exists and *that* peers closed it. It
  does not diagnose *why* — causes include scheduling, prerequisites, course
  offerings, and culture.
- We did not find a public tool that computes school-level girls' parity gaps
  from this dataset; that is a statement about our search, not a proof none
  exists.
- Not affiliated with the US Department of Education.

## Reproduce the data

```bash
# 1. download the official file (99.6 MB zip → ~1.2 GB extracted)
mkdir -p data_raw && cd data_raw
curl -LO https://ocrdata.ed.gov/assets/ocr/docs/2023-24-crdc-data.zip
unzip 2023-24-crdc-data.zip \
  "SCH/Enrollment.csv" "SCH/Computer Science.csv" "SCH/Advanced Placement.csv" \
  "SCH/Calculus.csv" "SCH/Physics.csv" "SCH/Data Science.csv" \
  "SCH/School Characteristics.csv" -d extracted
cd ..

# 2. build JSON shards + verify
pip install -r etl/requirements.txt
python3 etl/build_data.py   # writes app/public/data/*
python3 etl/verify.py       # asserts national totals & spot-checks a school
```

The generated `app/public/data/` is committed so the app runs without the raw
file; `make data` reruns the ETL.

## Run the app

```bash
cd app
npm install
npm run dev        # dev server
npm run build      # static build → app/dist (deployable anywhere)
npm test           # vitest: parsing, gap calculations, edge cases
```

## Deploy

`app/dist` is a fully static bundle. The public demo runs on GitHub Pages. Build
with `vite build --base=/missing-seats/` for this repository's Pages subpath;
the app uses hash routing and `import.meta.env.BASE_URL` for its data files.

## Licenses

- **Code:** MIT (see `LICENSE`).
- **Data:** US Government work — public domain under
  [17 U.S.C. §105](https://www.govinfo.gov/content/pkg/USCODE-2024-title17/html/USCODE-2024-title17-chap1-sec105.htm);
  cite "US Department of Education, Office for Civil Rights, Civil Rights Data
  Collection, 2023–24".
- **Linked evidence** (NCWIT, SIGCSE papers, Code.org): linked, not
  redistributed; all rights remain with their owners.

## Team

Built with [Devin](https://devin.ai) (AI pair-programmer) — AI tools are
explicitly allowed by the event rules.
