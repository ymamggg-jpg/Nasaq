import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

from ai_routing import DATA, FEATURES, run

# Same model as ai_routing.py: same training file, same settings.
df = pd.read_csv(DATA / "door_training.csv")
model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])

# Same recorded runs as the dashboard replays (test seed 1000, never used in training).
SEED = 1000
DOOR_NAME = {0: "A", 1: "B"}  # A = middle door (red), B = top door (blue)
SCENARIOS = [(prefix + pol, pol, prefix == "surge_")
             for prefix in ("", "surge_") for pol in ("shortest", "ai_forecast")]

rows = []
for name, pol, surge in SCENARIOS:
    r = run(SEED, pol, model=model if pol == "ai_forecast" else None, surge=surge)
    for d, h in r["hist"].items():
        pred = model.predict(pd.DataFrame(h)[FEATURES])
        for k, snap in enumerate(h):
            rows.append({
                "scenario": name,
                "t_s": 5.0 * k,  # one snapshot every 5 s, starting at t = 0
                "door": DOOR_NAME[d],
                "actual_now": snap["zone_now"],
                "forecast_10s": round(max(0.0, pred[k]), 1),
                "actual_10s": h[k + 2]["zone_now"] if k + 2 < len(h) else None,
            })

out = pd.DataFrame(rows).sort_values(["scenario", "t_s", "door"])
out["actual_10s"] = out["actual_10s"].astype("Int64")
out.to_csv(DATA / "forecast_panel.csv", index=False)

ok = out.dropna(subset=["actual_10s"])
for name, g in ok.groupby("scenario"):
    print(name, "| rows:", len(g),
          "| MAE same_as_now:", round(mean_absolute_error(g["actual_10s"], g["actual_now"]), 2),
          "| MAE model:", round(mean_absolute_error(g["actual_10s"], g["forecast_10s"]), 2))
