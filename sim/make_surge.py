import time

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

from ai_routing import DATA, FEATURES, POLICIES, SURGE, run, save_viewer

# Gate surge: same layout and test seeds as ai_routing.py, arrival rate x2 between 20 s and 40 s.
# The model is NOT retrained: it only saw normal arrival rates (1-3 people/s).
df = pd.read_csv(DATA / "door_training.csv")
model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])
SEEDS = range(1000, 1008)

start = time.time()
results, rows = [], []
for case in ("normal", "surge"):
    for s in SEEDS:
        for pol in POLICIES:
            rec = case == "surge" and s == 1000 and pol in ("shortest", "ai_forecast")
            r = run(s, pol, model=model if pol == "ai_forecast" else None,
                    record=rec, surge=case == "surge")
            if rec:
                save_viewer(r, "surge: " + pol, DATA / ("viewer_surge_" + pol + ".html"))
            results.append({"case": case, "seed": s, "policy": pol, "people": r["people"],
                            "avg_time_s": r["avg_time_s"], "last_out_s": r["last_out_s"],
                            "peak_crowd": r["peak_crowd"], "unfinished": r["unfinished"]})
            rows += [dict(x, case=case) for x in r["rows"]]
        print(case, "seed done:", s, "| seconds:", round(time.time() - start))

res = pd.DataFrame(results)
res.to_csv(DATA / "surge_results.csv", index=False)
print("surge = arrival rate x%d between %d s and %d s" % (SURGE[2], SURGE[0], SURGE[1]))
print(res.groupby(["case", "policy"])[["people", "avg_time_s", "last_out_s", "peak_crowd", "unfinished"]]
      .mean().round(1))

# Forecast error per door, 10 s ahead, over all test runs of each case.
fc = pd.DataFrame(rows)
fc["pred"] = model.predict(fc[FEATURES]).clip(min=0)
for case, g in fc.groupby("case"):
    print(case, "| rows:", len(g), "| mean target:", round(g["target"].mean(), 1),
          "| MAE same_as_now:", round(mean_absolute_error(g["target"], g["zone_now"]), 2),
          "| MAE model:", round(mean_absolute_error(g["target"], g["pred"]), 2))
