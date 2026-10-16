import random
import time

import pandas as pd
import shapely
import jupedsim as jps
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import GroupShuffleSplit

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

RUNS = 150
DOOR_OPTIONS = [[(4.5, 5.5)], [(1.5, 2.5)], [(1.5, 2.5), (7.5, 8.5)]]
GRID = [(1 + i * 0.8, 1 + j * 0.8) for i in range(10) for j in range(11)]


def run_once(seed):
    rng = random.Random(seed)
    doors = rng.choice(DOOR_OPTIONS)
    n_agents = rng.randint(20, 60)
    parts = [shapely.box(0, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for y0, y1 in doors:
        parts.append(shapely.box(9.5, y0, 10.9, y1))
    geometry = shapely.unary_union(parts)

    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry)
    exit_id = sim.add_exit_stage(shapely.box(19, 4.5, 20, 5.5))
    journey_id = sim.add_journey(jps.JourneyDescription([exit_id]))
    for pos in rng.sample(GRID, n_agents):
        sim.add_agent(
            jps.CollisionFreeSpeedModelAgentParameters(
                journey_id=journey_id,
                stage_id=exit_id,
                position=pos,
                desired_speed=rng.uniform(0.9, 1.4),
                radius=0.2,
            )
        )

    step = round(5 / sim.delta_time())
    series = []
    while sim.agent_count() > 0 and sim.iteration_count() < 12000:
        if sim.iteration_count() % step == 0:
            xs = [a.position[0] for a in sim.agents()]
            series.append((sum(1 for x in xs if 6 <= x < 10), len(xs)))
        sim.iterate()

    rows = []
    for k in range(2, len(series) - 2):
        rows.append({
            "run": seed,
            "doors": len(doors),
            "zone_now": series[k][0],
            "zone_prev1": series[k - 1][0],
            "zone_prev2": series[k - 2][0],
            "total": series[k][1],
            "target": series[k + 2][0],
        })
    return rows


start = time.time()
all_rows = []
for seed in range(RUNS):
    all_rows += run_once(seed)
    if (seed + 1) % 10 == 0:
        print("runs done:", seed + 1, "| seconds:", round(time.time() - start))

df = pd.DataFrame(all_rows)
df.to_csv(DATA / "training_data.csv", index=False)
print("rows:", len(df), "| runs:", df["run"].nunique())

features = ["zone_now", "zone_prev1", "zone_prev2", "total", "doors"]
split = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=0)
train_idx, test_idx = next(split.split(df, groups=df["run"]))
train, test = df.iloc[train_idx], df.iloc[test_idx]

model = GradientBoostingRegressor(random_state=0)
model.fit(train[features], train["target"])
pred = model.predict(test[features])

print("test runs:", test["run"].nunique(), "| test rows:", len(test))
print("MAE baseline (same as now):", round(mean_absolute_error(test["target"], test["zone_now"]), 2))
print("MAE model:", round(mean_absolute_error(test["target"], pred), 2))