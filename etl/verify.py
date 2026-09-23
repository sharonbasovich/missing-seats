"""Assert the emitted JSON matches independently-known CRDC totals (AT7).

Run after build_data.py:  python3 etl/verify.py
These figures were computed once directly from the raw CSVs; the test
guards against ETL regressions on rebuild.
"""

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "app" / "public" / "data"

nat = json.loads((OUT / "national.json").read_text())
index = json.loads((OUT / "index.json").read_text())
states = list((OUT / "states").glob("*.json"))
total_schools = sum(
    len(json.loads(p.read_text())) for p in states
)

assert nat["schools"] == 25867, nat["schools"]
assert total_schools == 25867, total_schools
assert len(index) == 25867, len(index)

enr = nat["enrollment"]
assert enr["m"] + enr["f"] == 17057752, enr
assert abs(enr["girls_share"] - 0.4872) < 0.001

cs = nat["courses"]["cs"]
assert cs["m"] + cs["f"] == 1057569, cs
assert abs(cs["girls_share"] - 0.3546) < 0.001
assert cs["zero_girls"] == 1083, cs
assert cs["n20"] == 9068, cs
assert abs(cs["missing"] - 144300) < 500, cs
assert abs(cs["at_parity"] / cs["n20"] - 0.234) < 0.01

apcs = nat["courses"]["apcs"]
assert apcs["m"] + apcs["f"] == 239156, apcs
assert abs(apcs["girls_share"] - 0.3214) < 0.001

calc = nat["courses"]["calc"]
assert calc["m"] + calc["f"] == 561059, calc
assert abs(calc["girls_share"] - 0.4716) < 0.001

phys = nat["courses"]["phys"]
assert phys["m"] + phys["f"] == 1603024, phys
assert abs(phys["girls_share"] - 0.4473) < 0.001

# spot-check Heritage H S, Frisco ISD TX (known record)
tx = json.loads((OUT / "states" / "TX.json").read_text())
heritage = [r for r in tx if r["n"] == "HERITAGE H S" and r["d"] == "FRISCO ISD"]
assert len(heritage) == 1
h = heritage[0]
assert h["e"][:2] == [1066, 1042]
assert h["cs"][:2] == [514, 237]
assert h["apcs"][:2] == [130, 78]
assert h["calc"][:2] == [122, 97]
assert h["phys"][:2] == [305, 209]
assert h["e"][2] == -10, "nonbinary count is a reserve code — must be preserved"
assert h["dsci"][0] == -9, "not-applicable reserve code must be preserved"

# reserve codes present in output, not silently zeroed
neg = sum(
    1 for r in tx for c in ("cs", "apcs", "calc", "phys", "dsci")
    for v in r[c] if isinstance(v, int) and v < 0
)
assert neg > 0

print("All ETL assertions passed: 25,867 schools, verified national totals,")
print("Heritage H S record matches, reserve codes preserved.")
