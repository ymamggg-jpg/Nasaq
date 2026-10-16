"""Stage 4: an area becomes unavailable during an evacuation (settings fixed before running).

We only simulate that the area becomes unavailable; we do not simulate fire or smoke spread,
and this is not an evacuation safety certificate.
Usage: python sim/fire.py check   (one run with closure, wall check)
       python sim/fire.py         (10 seeds x 2 cases, web files)
"""
import json
import math
import random
import sys

import pandas as pd
import shapely
import jupedsim as jps

from ai_routing import DATA, density_levels

GATES = {0: (4.5, 5.5), 1: (8.5, 9.5)}  # 0 main, 1 side
EXIT = (19, 4.5, 20, 5.5)
FIRE = (10.4, 3.0, 13.0, 7.0)  # ASSUMPTION: area behind the main gate that becomes unavailable
FIRE_T = 30.0                  # seconds after the start of the evacuation
PEOPLE = 120                   # ASSUMPTION: people in the entry room when the evacuation starts
CAP_S = 300
SEEDS = range(10)
REPLAY_SEED = 0


def geometry(closed):
    parts = [shapely.box(0, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for g, (y0, y1) in GATES.items():
        if not (closed and g == 0):
            parts.append(shapely.box(9.5, y0, 10.9, y1))
    geo = shapely.unary_union(parts)
    return geo.difference(shapely.box(*FIRE)) if closed else geo


def path_len(x, y, g):
    yc = sum(GATES[g]) / 2
    return math.dist((x, y), (10.2, yc)) + math.dist((10.2, yc), (19.5, 5.0))


def starts(seed):
    rng = random.Random(seed)
    pts = []
    while len(pts) < PEOPLE:
        p = (rng.uniform(1, 8.5), rng.uniform(1, 9))
        if all(math.dist(p, q) >= 0.5 for q in pts):
            pts.append(p)
    return pts


def run(seed, closure, record=False):
    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry(False))
    exit_id = sim.add_exit_stage(shapely.box(*EXIT))
    journeys = {}
    for g in GATES:
        # main-gate waypoint sits just behind the fire area (same line to the exit) so it stays valid after closing
        wp = sim.add_waypoint_stage((13.6 if g == 0 else 11.2, sum(GATES[g]) / 2), 0.6)
        jd = jps.JourneyDescription([wp, exit_id])
        jd.set_transition_for_stage(wp, jps.Transition.create_fixed_transition(exit_id))
        journeys[g] = (sim.add_journey(jd), wp)
    door_of = {}
    for x, y in starts(seed):
        g = min(GATES, key=lambda k: path_len(x, y, k))
        jid, wp = journeys[g]
        aid = sim.add_agent(jps.CollisionFreeSpeedModelAgentParameters(
            journey_id=jid, stage_id=wp, position=(x, y), radius=0.2))
        door_of[aid] = g

    dt = sim.delta_time()
    blocked = shapely.union(shapely.box(*FIRE), shapely.box(9.5, *GATES[0][:1], 10.9, GATES[0][1]))
    rerouted, t_closed, breach = False, None, 0
    prev, exit_t = set(door_of), {}
    peak_gate, peak_dens, frames = 0, 0.0, []
    while sim.agent_count() > 0 and sim.iteration_count() < round(CAP_S / dt):
        now = sim.elapsed_time()
        if closure and not rerouted and now >= FIRE_T:
            rerouted = True
            jid, wp = journeys[1]
            for a in list(sim.agents()):
                if a.position[0] < 9.5 and door_of[a.id] == 0:
                    sim.switch_agent_journey(agent_id=a.id, journey_id=jid, stage_id=wp)
                    door_of[a.id] = 1
        if rerouted and t_closed is None and not any(blocked.contains(shapely.Point(a.position)) for a in sim.agents()):
            sim.switch_geometry(geometry(True))
            t_closed = round(now, 2)
        it = sim.iteration_count()
        if it % 25 == 0:
            agents = list(sim.agents())
            ids = {a.id for a in agents}
            for gone in prev - ids:
                exit_t[gone] = now
            prev = ids
            if t_closed is not None:
                breach += sum(1 for a in agents if blocked.contains(shapely.Point(a.position)))
            if it % 100 == 0 and agents:
                near = sum(1 for a in agents if a.position[0] < 10 and min(
                    math.dist(a.position, (10.0, sum(GATES[g]) / 2)) for g in GATES) <= 3)
                peak_gate = max(peak_gate, near)
                lv = density_levels([a.position for a in agents])
                peak_dens = max(peak_dens, max(d for d, _ in lv))
                if record:
                    frames.append({"t": round(now, 1), "a": [
                        [round(a.position[0], 2), round(a.position[1], 2), door_of[a.id], a.id, lv[i][1]]
                        for i, a in enumerate(agents)]})
        sim.iterate()
    if sim.agent_count() == 0:
        for gone in prev:
            exit_t.setdefault(gone, sim.elapsed_time())
    res = {"seed": seed, "case": "closure" if closure else "no_closure", "people": PEOPLE,
           "last_out_s": round(max(exit_t.values()), 2) if exit_t else None,
           "avg_time_s": round(sum(exit_t.values()) / len(exit_t), 2) if exit_t else None,
           "peak_near_gates": peak_gate, "peak_density": round(peak_dens, 2),
           "not_out": sim.agent_count(), "t_closed": t_closed, "breach": breach}
    if record:
        g0, g1 = geometry(False), geometry(True)
        res["replay"] = {
            "poly": list(g0.exterior.coords), "holes": [list(h.coords) for h in g0.interiors],
            "poly_after": list(g1.exterior.coords) if closure else None,
            "holes_after": [list(h.coords) for h in g1.interiors] if closure else None,
            "t_response": t_closed if closure else None, "fire": list(FIRE) if closure else None, "fire_t": FIRE_T,
            "doors": [{"name": "A", "y0": 4.5, "y1": 5.5, "open": True}, {"name": "B", "y0": 8.5, "y1": 9.5, "open": True}],
            "zones": {}, "exit": list(EXIT), "frames": frames, "panel": [],
        }
    return res


def rng(s):
    return {"mean": round(float(s.mean()), 1), "min": round(float(s.min()), 1), "max": round(float(s.max()), 1)}


def main():
    rows = []
    for s in SEEDS:
        for closure in (False, True):
            r = run(s, closure, record=s == REPLAY_SEED)
            rep = r.pop("replay", None)
            if rep:
                with open(DATA / "web" / f"fire_{r['case']}.json", "w", encoding="utf-8") as f:
                    json.dump(rep, f, separators=(",", ":"))
            rows.append(r)
        print("seed", s, "done", flush=True)
    res = pd.DataFrame(rows)
    res.to_csv(DATA / "fire_results.csv", index=False)
    print("people inside the closed area after closing (must be 0):", int(res["breach"].sum()))
    m = ["last_out_s", "avg_time_s", "peak_near_gates", "peak_density", "not_out"]
    print(res.groupby("case")[m + ["t_closed"]].agg(["mean", "min", "max"]).round(1).T.to_string())
    a = res[res["case"] == "no_closure"].set_index("seed")
    b = res[res["case"] == "closure"].set_index("seed")
    out = {"seeds": len(SEEDS), "people": PEOPLE, "fire_t": FIRE_T, "fire": list(FIRE), "cap_s": CAP_S,
           "replay_seed": REPLAY_SEED, "t_closed": rng(b["t_closed"]),
           "cases": {c: {k: rng(res[res["case"] == c][k]) for k in m} for c in ("no_closure", "closure")},
           "change": {k: rng(b[k] - a[k]) for k in m},
           "last_out_pct": rng(100 * (b["last_out_s"] / a["last_out_s"] - 1)),
           "replay_run": {c: res[(res["case"] == c) & (res["seed"] == REPLAY_SEED)][m].iloc[0].to_dict()
                          for c in ("no_closure", "closure")}}
    with open(DATA / "web" / "fire.json", "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    print("saved data/fire_results.csv and data/web/fire.json")


def check():
    r = run(REPLAY_SEED, True, record=True)
    rep = r.pop("replay")
    print(r)
    before = [a for f in rep["frames"] if f["t"] < FIRE_T for a in f["a"] if a[2] == 1]
    print("frames:", len(rep["frames"]), "| people heading to side gate before 30 s:", len({a[3] for a in before}))


if __name__ == "__main__":
    check() if len(sys.argv) > 1 and sys.argv[1] == "check" else main()
