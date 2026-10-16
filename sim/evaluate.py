import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import GroupKFold

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

df = pd.read_csv(DATA / "training_data.csv")
features = ["zone_now", "zone_prev1", "zone_prev2", "total", "doors"]
preds = {"same_as_now": [], "trend": [], "linear": [], "boosting": []}
actual = []

for tr, te in GroupKFold(n_splits=5).split(df, groups=df["run"]):
    train, test = df.iloc[tr], df.iloc[te]
    actual += list(test["target"])
    preds["same_as_now"] += list(test["zone_now"])
    trend = test["zone_now"] + 2 * (test["zone_now"] - test["zone_prev1"])
    preds["trend"] += list(trend.clip(lower=0))
    for name, model in [
        ("linear", LinearRegression()),
        ("boosting", GradientBoostingRegressor(random_state=0)),
    ]:
        model.fit(train[features], train["target"])
        preds[name] += list(model.predict(test[features]))

actual = np.array(actual)
mask = actual > 0
print("rows:", len(actual), "| rows with target > 0:", int(mask.sum()))
print("average target:", round(actual.mean(), 2))
for name, p in preds.items():
    p = np.array(p)
    print(
        name,
        "| MAE all:", round(mean_absolute_error(actual, p), 2),
        "| MAE target>0:", round(mean_absolute_error(actual[mask], p[mask]), 2),
    )