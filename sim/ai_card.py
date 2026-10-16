"""Numbers for the page card "What does the AI base its forecast on?" (from the real files only).

Gate model: the same features and data as the live warning (data/door_training.csv, 40 simulated runs);
accuracy measured on runs 32-39, which the check model never trained on.
Daily model: read from data/web/osaka.json (made by sim/osaka_forecast.py).
Usage: python sim/ai_card.py
"""
import json

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

from ai_routing import DATA, FEATURES

df = pd.read_csv(DATA / "door_training.csv")
hold = df["run"] >= 32
m = GradientBoostingRegressor(random_state=0).fit(df[~hold][FEATURES], df[~hold]["target"])
gate = {
    "runs": int(df["run"].nunique()), "rows": len(df), "test_runs": int(df[hold]["run"].nunique()),
    "test_rows": int(hold.sum()), "features": FEATURES,
    "mae_model": round(mean_absolute_error(df[hold]["target"], m.predict(df[hold][FEATURES])), 2),
    "mae_same": round(mean_absolute_error(df[hold]["target"], df[hold]["zone_now"]), 2),
    "mean_target": round(float(df[hold]["target"].mean()), 1),
}
osaka = json.load(open(DATA / "web" / "osaka.json", encoding="utf-8"))
daily = {"train_days": osaka["train"]["days"], "test_days": len(osaka["test"]), "scores": osaka["scores"]}
print("gate:", gate)
print("daily:", daily)
with open(DATA / "web" / "ai_card.json", "w", encoding="utf-8") as f:
    json.dump({"gate": gate, "daily": daily}, f, separators=(",", ":"))
