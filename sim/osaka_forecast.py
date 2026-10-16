"""Stage 3: forecast tomorrow's visitors from real Expo 2025 Osaka data (settings fixed in CLAUDE.md first).

Reads data/expo2025_osaka_daily.csv, writes data/osaka_forecast_test.csv and data/web/osaka.json.
Usage: python sim/osaka_forecast.py
"""
import datetime as dt
import json

import holidays
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

from ai_routing import DATA

CLOSE = dt.date(2025, 10, 13)
TEST_DAYS = 28
JP = holidays.Japan(years=2025)
LEVEL_PCT = (33, 67)  # ASSUMPTION: training-day percentiles that split low / medium / peak

df = pd.read_csv(DATA / "expo2025_osaka_daily.csv", parse_dates=["date"])
df["date"] = df["date"].dt.date
y = df["total_visitors"]
df["weekday"] = [d.weekday() for d in df["date"]]
df["holiday"] = [int(d in JP) for d in df["date"]]
df["days_left"] = [(CLOSE - d).days for d in df["date"]]
df["mean7"] = y.shift(1).rolling(7).mean()   # the 7 days before d
df["last_week"] = y.shift(7)                 # same weekday one week before
df = df.dropna(subset=["mean7"]).reset_index(drop=True)

test = df.tail(TEST_DAYS)
train = df.iloc[: len(df) - TEST_DAYS]
F = ["weekday", "holiday", "days_left", "mean7"]


def onehot(d):
    X = d[["holiday", "days_left", "mean7"]].copy()
    for k in range(1, 7):
        X[f"wd{k}"] = (d["weekday"] == k).astype(int)
    return X


gb = GradientBoostingRegressor(random_state=0).fit(train[F], train["total_visitors"])
lin = LinearRegression().fit(onehot(train), train["total_visitors"])
pred = {
    "same_day_last_week": test["last_week"].to_numpy(),
    "mean_last_7_days": test["mean7"].to_numpy(),
    "linear": lin.predict(onehot(test)),
    "gradient_boosting": gb.predict(test[F]),
}
actual = test["total_visitors"].to_numpy()
scores = {}
for k, p in pred.items():
    mae = float(np.mean(np.abs(p - actual)))
    pct = float(np.mean(np.abs(p - actual) / actual) * 100)
    scores[k] = {"mae": round(mae), "pct": round(pct, 1)}
    print(f"{k:20s} MAE {mae:8.0f} visitors | mean error {pct:5.1f} %")

cut = np.percentile(train["total_visitors"], LEVEL_PCT)
level = lambda v: "low" if v < cut[0] else "medium" if v < cut[1] else "peak"
print("level cut-offs from training days:", [round(c) for c in cut])
print("train:", train["date"].min(), "to", train["date"].max(), len(train), "days | test:",
      test["date"].min(), "to", test["date"].max(), len(test), "days")
print("mean visitors train:", round(train["total_visitors"].mean()), "| test:", round(actual.mean()))
hits = sum(level(p) == level(a) for p, a in zip(pred["gradient_boosting"], actual))
print("level from forecast = level from actual on", hits, "of", len(actual), "test days")

out = test[["date", "weekday", "holiday", "total_visitors"]].copy()
for k, p in pred.items():
    out[k] = np.round(p)
out.to_csv(DATA / "osaka_forecast_test.csv", index=False)
web = {
    "source": "https://www.expo2025.or.jp/en/news/ (weekly 'Number of Visitors and Admission Ticket Sales Status')",
    "days": len(df) + 7, "total": int(pd.read_csv(DATA / "expo2025_osaka_daily.csv")["total_visitors"].sum()),
    "series": [{"d": str(d), "v": int(v)} for d, v in zip(pd.read_csv(DATA / "expo2025_osaka_daily.csv")["date"],
                                                          pd.read_csv(DATA / "expo2025_osaka_daily.csv")["total_visitors"])],
    "train": {"from": str(train["date"].min()), "to": str(train["date"].max()), "days": len(train),
              "mean": round(float(train["total_visitors"].mean()))},
    "test": [{"d": str(d), "actual": int(a), "gb": round(float(p)), "m7": round(float(m)), "level_fc": level(p), "level_actual": level(a)}
             for d, a, p, m in zip(test["date"], actual, pred["gradient_boosting"], pred["mean_last_7_days"])],
    "test_mean": round(float(actual.mean())),
    "scores": scores, "cuts": [round(c) for c in cut], "level_hits": int(hits), "level_pct": list(LEVEL_PCT),
}
with open(DATA / "web" / "osaka.json", "w", encoding="utf-8") as f:
    json.dump(web, f, separators=(",", ":"))
print("saved data/web/osaka.json and data/osaka_forecast_test.csv")
