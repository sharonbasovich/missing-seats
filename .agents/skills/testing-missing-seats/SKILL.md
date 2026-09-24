---
name: testing-missing-seats
description: How to run and E2E-test the Missing Seats Vite/React hash-router app locally, including preview-server gotchas, hash routes, and data-shard ground truth
---

# Testing the Missing Seats app

Static Vite + React app in `app/` (repo root: missing-seats). No backend, no auth — all data is static JSON in `app/dist/data/`.

## Run

- Build: `cd app && npm run build` (tsc -b && vite build → app/dist)
- Serve the build: `cd app && ./node_modules/.bin/vite preview --port 4173 --host 127.0.0.1`
- Check first with `ss -tlnp | grep 4173` — a preview server is often already running.
- Do NOT use `npm exec vite preview` — it mangles the --port/--host flags.
- Unit tests: `cd app && npm test` (vitest).

## Routes (HashRouter — note the `/#/` prefix)

`/#/` landing, `/#/school/<key>` school page, `/#/school/<key>/pack` action pack, `/#/states`, `/#/state/<CC>`, `/#/about`. Any other hash → "Page not found". Useful keys: `482001012192` = HERITAGE H S (Frisco ISD TX, rich data), `560126000041` = Big Piney HS WY (small-group + suppressed data).

## Gotchas

- HashRouter + plain anchors: `<a href="#x">` rewrites the route hash (e.g. `#main` → route `/main` → 404). Verify any in-page anchor/skip-link by actually activating it.
- Landing search input is auto-focused (`<SearchBox autoFocus/>`), so first Tab moves forward from it — use Shift+Tab to reach elements earlier in DOM order (e.g. the skip link).
- Data ground truth: `dist/data/national.json` (national stats), `dist/data/states/<CC>.json` (list of school records, key field `k`). Course arrays are `[male, female, nonbinary]`; negative values are federal reserve codes shown as "Not reported", never zero. `csclasses` = CS class count. `p` = percentile vs state.
- Chrome min window width (~500px) blocks resizing to a true 430px phone width — a ~530px window still exercises sub-640px (sm:) breakpoints.

## Devin Secrets Needed

None.
