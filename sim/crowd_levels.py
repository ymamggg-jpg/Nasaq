import time

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

from ai_routing import DATA, FEATURES, POLICIES, run

# Visitor levels for the test zone: arrivals per second for 60 s.
# ASSUMPTION: chosen to span a calm, a busy and a peak case of this small test zone; not Expo numbers.
LEVELS = {"low": 1.0, "medium": 2.0, "peak": 3.0}
SEEDS = range(1000, 1008)  # same 8 test seeds as routing_results.csv, never used in training


def main():
    start = time.time()
    df = pd.read_csv(DATA / "door_training.csv")
    model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])
    rows = []
    for level, rate in LEVELS.items():
        for s in SEEDS:
            for pol in POLICIES:
                r = run(s, pol, model=model if pol == "ai_forecast" else None, rate=rate)
                rows.append({"level": level, "rate": rate, "seed": s, "policy": pol, "people": r["people"],
                             "avg_time_s": r["avg_time_s"], "last_out_s": r["last_out_s"],
                             "peak_crowd": r["peak_crowd"], "peak_density": r["peak_density"],
                             "unfinished": r["unfinished"]})
        print("level done:", level, "| seconds:", round(time.time() - start))
    res = pd.DataFrame(rows)
    res.to_csv(DATA / "crowd_levels.csv", index=False)
    cols = ["people", "avg_time_s", "last_out_s", "peak_density", "unfinished"]
    for level in LEVELS:
        g = res[res["level"] == level].groupby("policy")[cols].agg(["mean", "min", "max"]).round(1)
        print("\n==", level, LEVELS[level], "per s ==")
        print(g.loc[POLICIES].to_string())


if __name__ == "__main__":
    main()
