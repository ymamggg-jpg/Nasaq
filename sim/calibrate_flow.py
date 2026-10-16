"""Stage 5: does JuPedSim give the flow measured in a real bottleneck experiment?

Real data: Seyfried, Rupprecht, Passon, Steffen, Klingsch, Boltes (2007), "New insights into pedestrian flow
through bottlenecks", arXiv:physics/0702004, Table 2. Bottleneck 2.8 m long; people start in holding areas at
3.3 persons/m2, about 3 m in front of it; flow = N / (time between first and last person crossing a line
0.4 m inside the bottleneck). Width 1.0 m: 1.90 (N=60), 2.08 (N=40), 2.19 (N=20) persons/s.
Lab experiment with students and staff walking normally, not expo visitors.
Usage: python sim/calibrate_flow.py
"""
import json
import math
import random

import pandas as pd
import shapely
import jupedsim as jps

from ai_routing import DATA

REAL = {60: 1.90, 40: 2.08, 20: 2.19}  # persons/s for b = 1.0 m (Table 2)
B, L_BCK, RHO = 1.0, 2.8, 3.3
HOLD_W = 4.0       # ASSUMPTION: width of the holding area (the paper gives density and distance, not this width)
SEEDS = range(5)   # start positions are jittered per seed


def run(n, seed):
    # corridor in front (x < 0), bottleneck 0 <= x <= 2.8, room behind
    front = shapely.box(-12, -4, 0, 4)
    neck = shapely.box(0, -B / 2, L_BCK, B / 2)
    back = shapely.box(L_BCK, -4, L_BCK + 6, 4)
    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=shapely.unary_union([front, neck, back]))
    exit_id = sim.add_exit_stage(shapely.box(L_BCK + 5, -4, L_BCK + 6, 4))
    jid = sim.add_journey(jps.JourneyDescription([exit_id]))
    # holding area: n people at RHO, centre 3 m in front of the entrance
    depth = n / RHO / HOLD_W
    cx = -3.0
    rng = random.Random(seed)
    cols = max(1, round(math.sqrt(n * HOLD_W / depth)))
    rows = math.ceil(n / cols)
    dx, dy = depth / rows, HOLD_W / cols
    pts = [(cx - depth / 2 + dx * (i + 0.5) + rng.uniform(-0.05, 0.05),
            -HOLD_W / 2 + dy * (j + 0.5) + rng.uniform(-0.05, 0.05)) for i in range(rows) for j in range(cols)][:n]
    for p in pts:
        sim.add_agent(jps.CollisionFreeSpeedModelAgentParameters(journey_id=jid, stage_id=exit_id, position=p, radius=0.2))
    line_x = 0.4
    crossed, last_x = {}, {a.id: a.position[0] for a in sim.agents()}
    while sim.agent_count() > 0 and sim.iteration_count() < 20000:
        sim.iterate()
        now = sim.elapsed_time()
        for a in sim.agents():
            if a.id not in crossed and last_x[a.id] < line_x <= a.position[0]:
                crossed[a.id] = now
            last_x[a.id] = a.position[0]
    t = sorted(crossed.values())
    return {"n": n, "seed": seed, "crossed": len(t), "flow": n / (t[-1] - t[0]) if len(t) > 1 else None,
            "min_spacing": round(min(math.dist(p, q) for i, p in enumerate(pts) for q in pts[i + 1:]), 2)}


def main():
    rows = [run(n, s) for n in REAL for s in SEEDS]
    df = pd.DataFrame(rows)
    df.to_csv(DATA / "calibration_flow.csv", index=False)
    out = []
    for n, real in REAL.items():
        f = df[df["n"] == n]["flow"]
        out.append({"n": n, "real": real, "sim": round(float(f.mean()), 2), "sim_min": round(float(f.min()), 2),
                    "sim_max": round(float(f.max()), 2), "diff_pct": round(100 * (float(f.mean()) / real - 1), 1)})
        print(f"N={n}: real {real:.2f} | JuPedSim {f.mean():.2f} ({f.min():.2f}-{f.max():.2f}) persons/s | diff {out[-1]['diff_pct']:+.1f}%")
    print("start spacing min (m):", df["min_spacing"].min(), "| everyone crossed:", bool((df["crossed"] == df["n"]).all()))
    with open(DATA / "web" / "calibration.json", "w", encoding="utf-8") as fh:
        json.dump({"rows": out, "seeds": len(SEEDS), "width": B, "length": L_BCK, "rho": RHO,
                   "source": "Seyfried et al. 2007, arXiv:physics/0702004, Table 2"}, fh, separators=(",", ":"))


if __name__ == "__main__":
    main()
