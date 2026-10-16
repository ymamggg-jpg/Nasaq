import time

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

import ai_routing
from ai_routing import DATA, FEATURES, run

# FLOW is only used by the current_count and ai_forecast routing rules
# (estimated wait at a door). It does not change how JuPedSim moves people.
# 1.9 = published specific flow through bottlenecks, about 1.9 persons/(m s)
# (Liao et al. 2016, Physica A 461:248-261, doi:10.1016/j.physa.2016.05.051).
FLOWS = [1.0, 1.3, 1.6, 1.9]
POLICIES = ["current_count", "ai_forecast"]
SEEDS = range(1000, 1008)  # same test seeds as ai_routing.py

# Training runs use the "random" policy, which ignores FLOW, so the model is the same for every FLOW.
df = pd.read_csv(DATA / "door_training.csv")
model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])

start = time.time()
rows = []
for flow in FLOWS:
    ai_routing.FLOW = flow
    for s in SEEDS:
        for pol in POLICIES:
            r = run(s, pol, model=model if pol == "ai_forecast" else None)
            rows.append({"flow": flow, "seed": s, "policy": pol, "people": r["people"],
                         "avg_time_s": r["avg_time_s"], "last_out_s": r["last_out_s"],
                         "peak_crowd": r["peak_crowd"], "unfinished": r["unfinished"]})
    print("flow done:", flow, "| seconds:", round(time.time() - start))

res = pd.DataFrame(rows)
res.to_csv(DATA / "flow_sensitivity.csv", index=False)

print(res.groupby(["flow", "policy"])[["avg_time_s", "last_out_s", "peak_crowd", "unfinished"]].mean().round(1))
for flow, g in res.groupby("flow"):
    wide = g.pivot(index="seed", columns="policy", values="avg_time_s")
    wins = int((wide["ai_forecast"] < wide["current_count"]).sum())
    gain = (1 - wide["ai_forecast"].mean() / wide["current_count"].mean()) * 100
    print("FLOW %.1f: ai_forecast faster in %d of %d seeds | %.1f%% faster on average" % (flow, wins, len(wide), gain))
