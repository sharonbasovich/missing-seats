# Missing Seats — E2E browser test plan

App: http://127.0.0.1:4173/ (vite preview of /home/ubuntu/repos/missing-seats/app/dist, hash routing)
Screenshots → /home/ubuntu/repos/missing-seats/screenshots/
Record screen throughout; maximize Chrome first (wmctrl).

Expected values were verified against /app/dist/data shards (TX.json, NJ.json, WY.json, national.json, index.json) before writing this plan — the UI must reproduce them.

## Test 1 — Landing page + typeahead
1. Navigate to http://127.0.0.1:4173/. Wait for counters.
   - PASS if: hero shows ~"49%" girls share of enrollment and ~"35%" of CS students; four stat cards show ≈144,297 missing CS seats, 1,083 zero-girl CS schools, 23% at parity (2125/9068=23.4%→23%), and 12,397 schools reporting zero CS classes; by-course bar chart renders 6 course rows (CS, AP CS, Calculus, Physics, Data Science, All AP) with gold parity mark.
2. Click search box, type "heritage". Screenshot 01-landing-search.png with dropdown open.
   - PASS if: typeahead dropdown opens with ≤8 results showing name+district+state badge.
3. Keyboard nav: press ArrowDown twice, then Enter on a highlighted result → navigates to a /#/school/ page. Then go back to home.
   - PASS if: ArrowDown visibly moves highlight; Enter navigates (proves keyboard path works).
4. Search "heritage frisco" (multi-token) → HERITAGE H S / FRISCO ISD / TX must appear; press Enter or click it.
   - PASS if: lands on /#/school/482001012192.

## Test 2 — HERITAGE H S gap card (values verified vs TX.json)
On /#/school/482001012192:
- Header: "HERITAGE H S", "FRISCO ISD · TX", 2,108 students, "1,066 boys, 1,042 girls", girls 49.4%.
- CS tile: 31.6% girls, "237 girls of 751 students", parity index 0.64, missing seats 134, "top 66% in TX" badge (p.cs=34 → 100-34=66). Screenshot 02-gap-card.png.
- AP CS tile: 37.5%, "78 girls of 208". Calculus: 44.3%, "97 girls of 219". Physics: 40.7%, "209 girls of 514". All AP: "594 girls of 1,169". Data Science tile hidden (all reserve codes).
- Peer proof section: "Proof it's closable: similar TX schools" with pool of TX schools within ±25% of 2,108 enrollment and ≥20 CS students; median/top-quartile text + up to 5 peer rows. Screenshot 03-peer-proof.png.
- Summary line: "girls are 49.4% of HERITAGE H S but 31.6% of its computer-science students — about 134 missing seats".
- FAIL on any number differing from shard values.

## Test 3 — Action Pack
Click "Build the Action Pack →" → /#/school/482001012192/pack.
- PASS if: header "HERITAGE H S · FRISCO ISD · TX"; numbers table lists CS row "237 / 751", 31.6%, parity 0.64, missing 134 (+ other reported courses, apall excluded); peer proof section; "Three next steps" list; ready-to-send email containing "Girls are 49.4%" and "237 girls of 751"; citation footer mentioning CRDC 2023–24. Screenshot 04-action-pack.png. (No actual printing.)

## Test 4 — BRIDGEWATER-RARITAN REGIONAL HIGH SCHOOL (NJ)
Search "bridgewater" or navigate to /#/school/340228000173.
- PASS if: header 2,741 students, "1,438 boys, 1,303 girls" (girls 47.5%); CS tile 31.5% "133 girls of 422" parity 0.66 missing ~68; AP CS 25.6% "41 girls of 160".

## Test 5 — Small school edge cases: BIG PINEY HIGH SCHOOL (WY)
Search "big piney" → /#/school/560126000041.
- PASS if: header 157 students "89 boys, 68 girls" girls 43.3%; CS tile shows "small group" badge, 25.0%, "3 girls of 12"; AP CS and Calculus tiles show "small group" with 0.0% ("0 girls of 2"); Physics tile = "Not reported" with reason text (not zero); Data Science hidden; peer proof either lists WY peers or shows the "No similar-size schools" empty-state message. Screenshot 06-small-school.png.

## Test 6 — State page + CSV
Navigate to /#/state/TX.
- PASS if: "TX: every high school, ranked" header; ranked table with # / School / District / Enrollment / Girls in CS / Girls' share columns; download button "Download CSV (N rows)".
- Click it → PASS if file missing-seats-TX-cs-girls-share.csv appears in ~/Downloads with header "combokey,school,district,state,enrollment,cs_male,cs_female,cs_girls_share". Screenshot 05-state-page.png.

## Test 7 — About/Data & method page
Navigate to /#/about → PASS if page renders method text (not NotFound).

## Test 8 — Mobile-width sanity
Resize Chrome to ~500px wide (wmctrl) or zoom; reload landing.
- PASS if: layout stacks vertically, no horizontal overflow of main content; then restore window.

## Failure criteria
Any displayed number differing from shard-verified values; any crash/blank/error state; missing required screenshot; CSV not produced.
