---
name: testing-missing-seats
description: How to run and E2E-test the Missing Seats static web app (vite preview, hash routing, data shards) on this machine.
---

# Testing the Missing Seats app

## Stack
- Static React + vite build under `/home/ubuntu/missing-seats/app` (source in `src/`, production build in `app/dist/`).
- Serve the build with `npm exec vite preview --port 4173 --host 127.0.0.1` from `app/` (already-running in prior sessions; check `ss -tlnp | grep 4173` before starting a second one).
- No backend, no login, no secrets needed. Pure client-side app reading JSON from `/data/`.

## Routing
- Hash routing (react-router HashRouter): `/#/`, `/#/school/<key>`, `/#/school/<key>/pack`, `/#/states`, `/#/state/<CC>`, `/#/about`.
- School keys are 12-digit NCES-style combokeys, e.g. `482001012192` (HERITAGE H S, Frisco TX), `340228000173` (Bridgewater-Raritan NJ), `560126000041` (Big Piney WY).

## Data shards (verify expected values here BEFORE checking the UI)
- `app/dist/data/index.json` — 25,867-entry search index: `{k, n, d, s, e}`.
- `app/dist/data/states/<CC>.json` — per-state school records: `e`/`cs`/`apcs`/`calc`/`phys`/`dsci`/`apall` are `[male, female, nonbinary]` triples; `p` = state percentiles; `csclasses` = # CS classes offered.
- `app/dist/data/national.json` — aggregate counters shown on landing.
- Negative values are federal reserve codes (-9 not applicable, -10 suppressed…) rendered as "Not reported", never zero. Course totals <20 get a "small group" badge and are excluded from peer pools/percentiles.
- `missing seats = round(courseTotal × girls' enrollment share − girls enrolled)`, floored at 0. `parity index = girls' course share ÷ girls' enrollment share`.

## Useful test schools
- HERITAGE H S, Frisco TX (`482001012192`) — large school, all courses reported.
- BIG PINEY HIGH SCHOOL, WY (`560126000041`) — edge cases: "small group" badges, Physics "Not reported", Data Science tile hidden, 5-school peer pool.
- Search tip: typeahead shows top 8 name-matches ranked by enrollment; multi-token queries like "heritage frisco" or "big piney" narrow well. Arrow keys + Enter work; Escape closes.

## Verification shortcuts
- CSV download from `/#/state/<CC>` lands in `~/Downloads/missing-seats-<CC>-cs-girls-share.csv`; compare rows to `states/<CC>.json` with grep.
- For exact-value checks, `python3 -c "import json; ..."` over the state shard is far faster than reading the federal raw files in `data_raw/`.

## Devin Secrets Needed
- None.
