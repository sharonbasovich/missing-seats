"""Build Missing Seats data shards from the 2023-24 CRDC public-use files.

Reads the extracted SCH/*.csv files (latin-1), filters to schools reporting
grade 12, and emits compact JSON shards the static frontend consumes:

  out/index.json          search index: every grade-12 school
  out/states/<ST>.json    full school records for one state
  out/national.json       national + per-state aggregates for landing/state pages

Negative values in the source are CRDC reserve codes (-3 processing error,
-5 action plan, -6 force certified, -7 indeterminable, -9 not applicable,
-10 suppressed, -11 suppressed for data quality, -13 missing skip logic).
They are preserved verbatim in the output; the frontend maps them to
"Not reported" and they are clipped to 0 only inside aggregate sums.
"""

import json
import math
import sys
from pathlib import Path

import pandas as pd

RAW = Path(__file__).resolve().parent.parent / "data_raw" / "extracted" / "SCH"
OUT = Path(__file__).resolve().parent.parent / "app" / "public" / "data"

USECOLS = {
    "Enrollment.csv": [
        "LEA_STATE", "LEA_NAME", "SCH_NAME", "COMBOKEY",
        "TOT_ENR_M", "TOT_ENR_F", "TOT_ENR_X",
    ],
    "School Characteristics.csv": ["COMBOKEY", "SCH_GRADE_G12"],
    "Computer Science.csv": [
        "COMBOKEY", "SCH_COMPCLASSES_CSCI",
        "TOT_COMPENR_CSCI_M", "TOT_COMPENR_CSCI_F", "TOT_COMPENR_CSCI_X",
    ],
    "Advanced Placement.csv": [
        "COMBOKEY", "SCH_APCOMPENR_IND",
        "TOT_APCOMPENR_M", "TOT_APCOMPENR_F", "TOT_APCOMPENR_X",
        "TOT_APENR_M", "TOT_APENR_F", "TOT_APENR_X",
    ],
    "Calculus.csv": [
        "COMBOKEY", "TOT_MATHENR_CALC_M", "TOT_MATHENR_CALC_F", "TOT_MATHENR_CALC_X",
    ],
    "Physics.csv": [
        "COMBOKEY", "TOT_SCIENR_PHYS_M", "TOT_SCIENR_PHYS_F", "TOT_SCIENR_PHYS_X",
    ],
    "Data Science.csv": [
        "COMBOKEY", "TOT_DATAENR_DSCI_M", "TOT_DATAENR_DSCI_F", "TOT_DATAENR_DSCI_X",
    ],
}

# course key -> (male, female, nonbinary) columns
COURSES = {
    "cs": ("TOT_COMPENR_CSCI_M", "TOT_COMPENR_CSCI_F", "TOT_COMPENR_CSCI_X"),
    "apcs": ("TOT_APCOMPENR_M", "TOT_APCOMPENR_F", "TOT_APCOMPENR_X"),
    "calc": ("TOT_MATHENR_CALC_M", "TOT_MATHENR_CALC_F", "TOT_MATHENR_CALC_X"),
    "phys": ("TOT_SCIENR_PHYS_M", "TOT_SCIENR_PHYS_F", "TOT_SCIENR_PHYS_X"),
    "dsci": ("TOT_DATAENR_DSCI_M", "TOT_DATAENR_DSCI_F", "TOT_DATAENR_DSCI_X"),
    "apall": ("TOT_APENR_M", "TOT_APENR_F", "TOT_APENR_X"),
}

MIN_N = 20  # low-N threshold for percentiles / peer pool


def clip(v):
    """Reserve codes (<0) contribute 0 to sums; never reportable on their own."""
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return 0
    return max(0, int(v))


def read(name):
    return pd.read_csv(
        RAW / name, usecols=USECOLS[name], encoding="latin-1", dtype={"COMBOKEY": str}
    )


def girls_share(f, m):
    f, m = clip(f), clip(m)
    return f / (f + m) if f + m > 0 else None


def parity_gap(course_m, course_f, enr_m, enr_f):
    """Our descriptive calculation: seats girls would hold at enrollment parity.

    max(0, round(course_total * girls_share_of_enrollment - girls_in_course))
    None when any input is not reportable (negative reserve code).
    """
    if min(course_m, course_f, enr_m, enr_f) < 0:
        return None
    etotal = enr_m + enr_f
    if etotal <= 0:
        return None
    expected = (course_m + course_f) * (enr_f / etotal)
    return max(0, round(expected - course_f))


def state_percentile(shares, share):
    """share percentile among same-state schools with course total >= MIN_N."""
    if share is None or not shares:
        return None
    below = sum(1 for s in shares if s < share)
    return round(100 * below / len(shares))


def main():
    enr = read("Enrollment.csv")
    chars = read("School Characteristics.csv")
    cs = read("Computer Science.csv")
    ap = read("Advanced Placement.csv")
    calc = read("Calculus.csv")
    phys = read("Physics.csv")
    dsci = read("Data Science.csv")

    df = enr.merge(chars, on="COMBOKEY", how="left")
    for other in (cs, ap, calc, phys, dsci):
        df = df.merge(other, on="COMBOKEY", how="left")

    hs = df[df["SCH_GRADE_G12"] == "Yes"].copy()
    print(f"grade-12 schools: {len(hs)}")

    numcols = [c for cols in COURSES.values() for c in cols]
    numcols += ["TOT_ENR_M", "TOT_ENR_F", "TOT_ENR_X",
                "SCH_COMPCLASSES_CSCI", "SCH_APCOMPENR_IND"]
    for c in set(numcols):
        hs[c] = pd.to_numeric(hs[c], errors="coerce")

    # first pass: girls' share per course per school for percentile pools
    shares = {ck: {} for ck in COURSES}
    for ck, (mc, fc, _xc) in COURSES.items():
        pool = {}
        for st, grp in hs.groupby("LEA_STATE"):
            vals = []
            for _, r in grp.iterrows():
                m, f = r[mc], r[fc]
                if pd.notna(m) and pd.notna(f) and m >= 0 and f >= 0 and m + f >= MIN_N:
                    s = f / (m + f)
                    vals.append(s)
                    pool[r["COMBOKEY"]] = s
            shares[ck][st] = sorted(vals)
        # stash school->share for percentile lookup
        shares[ck]["_pool"] = pool

    index = []
    states = {}
    national = {"schools": len(hs), "courses": {}}
    for ck in COURSES:
        national["courses"][ck] = {
            "m": 0, "f": 0, "x": 0, "girls_share": None, "missing": 0,
            "zero_girls": 0, "zero_boys": 0, "n20": 0, "at_parity": 0,
            "median": None, "q3": None,
        }
    national["enrollment"] = {"m": 0, "f": 0, "x": 0, "girls_share": None}
    national["offering_cs"] = 0
    state_aggs = {}

    for _, r in hs.iterrows():
        st = r["LEA_STATE"]
        rec = {
            "k": r["COMBOKEY"],
            "n": str(r["SCH_NAME"]).strip(),
            "d": str(r["LEA_NAME"]).strip(),
            "s": st,
            "e": [None if pd.isna(r["TOT_ENR_M"]) else int(r["TOT_ENR_M"]),
                  None if pd.isna(r["TOT_ENR_F"]) else int(r["TOT_ENR_F"]),
                  None if pd.isna(r["TOT_ENR_X"]) else int(r["TOT_ENR_X"])],
        }
        for ck, (mc, fc, xc) in COURSES.items():
            m = None if pd.isna(r[mc]) else int(r[mc])
            f = None if pd.isna(r[fc]) else int(r[fc])
            x = None if pd.isna(r[xc]) else int(r[xc])
            rec[ck] = [m, f, x]
            share = shares[ck]["_pool"].get(r["COMBOKEY"])
            rec.setdefault("p", {})[ck] = state_percentile(
                shares[ck].get(st, []), share
            )
            agg = national["courses"][ck]
            cm, cf, cx = clip(m), clip(f), clip(x)
            agg["m"] += cm
            agg["f"] += cf
            agg["x"] += cx
            if m is not None and f is not None and m >= 0 and f >= 0:
                if m + f > 0:
                    if cf == 0:
                        agg["zero_girls"] += 1
                    if cm == 0:
                        agg["zero_boys"] += 1
                if m + f >= MIN_N:
                    agg["n20"] += 1
                    if cf / (m + f) >= 0.45:
                        agg["at_parity"] += 1
            gap = parity_gap(
                m if m is not None else -1, f if f is not None else -1,
                r["TOT_ENR_M"] if pd.notna(r["TOT_ENR_M"]) else -1,
                r["TOT_ENR_F"] if pd.notna(r["TOT_ENR_F"]) else -1,
            )
            if gap:
                agg["missing"] += gap

        rec["csclasses"] = (
            None if pd.isna(r["SCH_COMPCLASSES_CSCI"]) else int(r["SCH_COMPCLASSES_CSCI"])
        )
        if clip(rec["csclasses"]) > 0:
            national["offering_cs"] += 1

        e_m = r["TOT_ENR_M"] if pd.notna(r["TOT_ENR_M"]) else -1
        e_f = r["TOT_ENR_F"] if pd.notna(r["TOT_ENR_F"]) else -1
        e_x = r["TOT_ENR_X"] if pd.notna(r["TOT_ENR_X"]) else -1
        national["enrollment"]["m"] += clip(e_m)
        national["enrollment"]["f"] += clip(e_f)
        national["enrollment"]["x"] += clip(e_x)

        index.append({
            "k": rec["k"], "n": rec["n"], "d": rec["d"], "s": st,
            "e": clip(e_m) + clip(e_f) + clip(e_x),
        })
        states.setdefault(st, []).append(rec)

        sa = state_aggs.setdefault(st, {"schools": 0, "enr_m": 0, "enr_f": 0,
                                        **{f"{ck}_m": 0 for ck in COURSES},
                                        **{f"{ck}_f": 0 for ck in COURSES}})
        sa["schools"] += 1
        sa["enr_m"] += clip(e_m)
        sa["enr_f"] += clip(e_f)
        for ck, (mc, fc, _x) in COURSES.items():
            sa[f"{ck}_m"] += clip(rec[ck][0])
            sa[f"{ck}_f"] += clip(rec[ck][1])

    for ck, agg in national["courses"].items():
        tot = agg["m"] + agg["f"]
        agg["girls_share"] = agg["f"] / tot if tot else None
        allshares = sorted(s for st in shares[ck] if st != "_pool" for s in shares[ck][st])
        if allshares:
            agg["median"] = allshares[len(allshares) // 2]
            agg["q3"] = allshares[int(len(allshares) * 0.75)]
    en = national["enrollment"]
    et = en["m"] + en["f"]
    en["girls_share"] = en["f"] / et if et else None
    national["states"] = state_aggs

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "states").mkdir(exist_ok=True)
    (OUT / "index.json").write_text(json.dumps(index, separators=(",", ":")))
    for st, recs in states.items():
        (OUT / "states" / f"{st}.json").write_text(
            json.dumps(recs, separators=(",", ":")))
    (OUT / "national.json").write_text(
        json.dumps(national, separators=(",", ":")))

    total = sum(len(v) for v in states.values())
    print(f"schools written: {total} across {len(states)} states/territories")
    en_f = national["enrollment"]["f"]
    en_t = national["enrollment"]["m"] + en_f
    print(f"girls' share of HS enrollment: {en_f/en_t:.4f} of {en_t}")
    csagg = national["courses"]["cs"]
    print(f"girls' share of CS enrollment: {csagg['girls_share']:.4f} "
          f"of {csagg['m']+csagg['f']}; missing={csagg['missing']}; "
          f"zero_girls={csagg['zero_girls']}; n20={csagg['n20']}; "
          f"at_parity={csagg['at_parity']}")
    idx_bytes = (OUT / "index.json").stat().st_size
    print(f"index.json: {idx_bytes/1e6:.2f} MB; states total: "
          f"{sum(f.stat().st_size for f in (OUT/'states').glob('*.json'))/1e6:.1f} MB")


if __name__ == "__main__":
    sys.exit(main())
