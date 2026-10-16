import random
import time

import pandas as pd
import shapely
import jupedsim as jps

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

# Same layout and measurements as scenarios.py; only the start positions change per seed.
CASES = {"normal": [(1.5, 2.5), (7.5, 8.5)], "closed": [(1.5, 2.5)]}
SEEDS = range(10)
PEOPLE = 40


def start_positions(seed):
    # Random points in the same area as the 8 x 5 grid of scenarios.py, at least 0.5 m apart.
    rng = random.Random(seed)
    pts = []
    while len(pts) < PEOPLE:
        p = (rng.uniform(1, 7.3), rng.uniform(2, 8))
        if all((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 >= 0.25 for q in pts):
            pts.append(p)
    return pts


def run(doors, positions):
    parts = [shapely.box(0, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for y0, y1 in doors:
        parts.append(shapely.box(9.5, y0, 10.9, y1))
    geometry = shapely.unary_union(parts)
    exit_polygon = shapely.box(19, 4.5, 20, 5.5)

    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry)
    exit_id = sim.add_exit_stage(exit_polygon)
    journey_id = sim.add_journey(jps.JourneyDescription([exit_id]))
    for pos in positions:
        sim.add_agent(
            jps.CollisionFreeSpeedModelAgentParameters(
                journey_id=journey_id, stage_id=exit_id, position=pos, radius=0.2
            )
        )

    exit_time = {}
    prev = set()
    peak = 0
    while sim.agent_count() > 0 and sim.iteration_count() < 40000:
        if sim.iteration_count() % 25 == 0:
            t = round(sim.elapsed_time(), 2)
            agents = list(sim.agents())
            ids = {a.id for a in agents}
            for gone in prev - ids:
                exit_time[gone] = t
            prev = ids
            peak = max(peak, sum(1 for a in agents if 7.5 <= a.position[0] <= 10))
        sim.iterate()
    for gone in prev:
        exit_time[gone] = round(sim.elapsed_time(), 2)

    times = list(exit_time.values())
    return {
        "people_left": sim.agent_count(),
        "last_person_out_s": max(times),
        "average_time_s": sum(times) / len(times),
        "peak_crowd_before_wall": peak,
    }


start = time.time()
rows = []
for s in SEEDS:
    pos = start_positions(s)
    for case, doors in CASES.items():
        rows.append({"seed": s, "scenario": case, **run(doors, pos)})
    print("seed done:", s, "| seconds:", round(time.time() - start))

res = pd.DataFrame(rows)
res.to_csv(DATA / "scenario_seeds.csv", index=False)

cols = ["last_person_out_s", "average_time_s", "peak_crowd_before_wall", "people_left"]
print(res.groupby("scenario")[cols].agg(["mean", "min", "max"]).round(1).T)
wide = res.pivot(index="seed", columns="scenario", values="last_person_out_s")
change = (wide["closed"] / wide["normal"] - 1) * 100
print("last person out, closed vs normal: mean +%.0f%% | range +%.0f%% to +%.0f%%"
      % (change.mean(), change.min(), change.max()))
