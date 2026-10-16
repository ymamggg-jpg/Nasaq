"""Stage 2: alert -> solutions -> try -> compare.

The alert comes from the forecast model; each solution is tested by simulation on the same seeds and
the same arrival sequence as "before". Settings were fixed before any result.
Usage: python sim/solutions.py check   (one run of the extra gate, wall check)
       python sim/solutions.py         (all levels x 8 seeds x 6 variants, then the web files)
"""
import json
import random
import sys
import time
from collections import deque
from multiprocessing import Pool

import pandas as pd
import shapely
import jupedsim as jps
from sklearn.ensemble import GradientBoostingRegressor

from ai_routing import DATA, DENS_RED, FEATURES, density_levels
from crowd_levels import LEVELS

GATES = {0: (4.5, 5.5), 1: (8.5, 9.5), 2: (1.5, 2.5)}  # 0 main, 1 side, 2 extra (closed at start)
EXIT = shapely.box(19, 4.5, 20, 5.5)
SPAWN_Y = [1.0 + 0.8 * k for k in range(11)]
ZONES = {0: (2, 7), 1: (7, 10)}           # counting zones in front of main / side gate, x 6.5-10
ZONE_AREA = {0: 3.5 * 5, 1: 3.5 * 3}
ARRIVE_S = 180         # stage 2 only: arrivals last 180 s (user decision 16 Oct)
CAP_S = 300            # runs stop here; anyone left counts as not out
WARN_ALERT = 2         # ASSUMPTION: forecast persons/m2 in a gate zone that raises the alert
RESPONSE_DELAY = 60    # ASSUMPTION: seconds from alert until a solution is in place
COMPLIANCE = (0.3, 0.6, 0.9)  # ASSUMPTION: share of people who follow the stewards
BATCH_S = 60           # batched entry lasts 60 s
BATCH_FACTOR = 0.5     # entry rate during batching = half the level rate
SEEDS = range(1000, 1008)
VARIANTS = ["before", "extra_gate"] + [f"stewards_{c}" for c in COMPLIANCE] + ["batch"]
REPLAY_SEED = 1000


def geometry(extra):
    parts = [shapely.box(0, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for g, (y0, y1) in GATES.items():
        if g != 2 or extra:
            parts.append(shapely.box(9.5, y0, 10.9, y1))
    return shapely.unary_union(parts)


def mid(g):
    return sum(GATES[g]) / 2


def run(seed, rate, variant, model, record=False):
    arr_rng = random.Random(seed)
    arr_rng.uniform(1.0, 3.0)  # same draw as ai_routing.run, so arrivals match the level runs' seeds
    comp_rng = random.Random(seed + 777)
    arrivals = []
    t = arr_rng.expovariate(rate)
    while t < ARRIVE_S:
        arrivals.append(t)
        t += arr_rng.expovariate(rate)

    geo = geometry(False)
    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geo)
    exit_id = sim.add_exit_stage(EXIT)
    journeys = {}
    for g in GATES:
        wp = sim.add_waypoint_stage((11.2, mid(g)), 0.6)
        jd = jps.JourneyDescription([wp, exit_id])
        jd.set_transition_for_stage(wp, jps.Transition.create_fixed_transition(exit_id))
        journeys[g] = (sim.add_journey(jd), wp)

    comp = float(variant.split("_")[1]) if variant.startswith("stewards") else 0.0
    dt = sim.delta_time()
    step5 = round(5 / dt)
    nxt = 0
    queue = deque()
    tokens = 0.0
    door_of, arr_of, spawn_t, exit_t = {}, {}, {}, {}
    prev_ids = set()
    hist = {0: [], 1: []}
    arrived5 = {0: 0, 1: 0}
    last_zone = {0: 0, 1: 0}
    t_alert = t_resp = None
    responded = False
    peak_zone, peak_dens, danger = 0, 0.0, 0.0
    frames, panel, wall_breach = [], [], 0

    def gate_for(y, now):
        if responded and variant == "extra_gate":
            return min((0, 2), key=lambda g: abs(mid(g) - y))
        if responded and comp > 0 and comp_rng.random() < comp:
            return min((0, 1), key=lambda g: last_zone[g])
        return 0

    def send(aid, g):
        if door_of[aid] != g:
            jid, wp = journeys[g]
            sim.switch_agent_journey(agent_id=aid, journey_id=jid, stage_id=wp)
            door_of[aid] = g

    while sim.iteration_count() < round(CAP_S / dt):
        now = sim.elapsed_time()
        while nxt < len(arrivals) and arrivals[nxt] <= now:
            queue.append(arrivals[nxt])
            nxt += 1

        if not responded and t_resp is not None and now >= t_resp:
            responded = True
            if variant == "extra_gate":
                sim.switch_geometry(geometry(True))
                for a in list(sim.agents()):
                    if a.position[0] < 9.5:
                        send(a.id, min((0, 2), key=lambda g: abs(mid(g) - a.position[1])))
            elif comp > 0:
                for a in list(sim.agents()):
                    if a.position[0] < 6.5 and comp_rng.random() < comp:
                        send(a.id, min((0, 1), key=lambda g: last_zone[g]))
        batching = variant == "batch" and responded and now < t_resp + BATCH_S
        if batching:
            tokens = min(tokens + rate * BATCH_FACTOR * dt, 1.0)

        while queue:
            if batching and tokens < 1.0:
                break
            free = [y for y in SPAWN_Y if len(list(sim.agents_in_range((0.6, y), 0.55))) == 0]
            if not free:
                break
            y = arr_rng.choice(free)
            g = gate_for(y, now)
            jid, wp = journeys[g]
            aid = sim.add_agent(jps.CollisionFreeSpeedModelAgentParameters(
                journey_id=jid, stage_id=wp, position=(0.6, y), radius=0.2))
            door_of[aid] = g
            arr_of[aid] = queue.popleft()
            spawn_t[aid] = now
            if g in arrived5:
                arrived5[g] += 1
            if batching:
                tokens -= 1.0

        it = sim.iteration_count()
        if it % 25 == 0:
            agents = list(sim.agents())
            ids = {a.id for a in agents}
            for gone in prev_ids - ids:
                exit_t[gone] = now
            prev_ids = ids
            extra_open = responded and variant == "extra_gate"
            for a in agents:  # nobody may stand inside the wall except in an open gate
                x, y = a.position
                if 10.0 < x < 10.4 and not any(y0 <= y <= y1 for g, (y0, y1) in GATES.items() if g != 2 or extra_open):
                    wall_breach += 1
            if record and it % 100 == 0:
                lv = density_levels([a.position for a in agents])
                frames.append({"t": round(now, 1), "a": [
                    [round(a.position[0], 2), round(a.position[1], 2), door_of[a.id], a.id, lv[i][1]]
                    for i, a in enumerate(agents)]})
            if it % step5 == 0:
                zc = {0: 0, 1: 0}
                heading = {0: 0, 1: 0}
                for a in agents:
                    x, y = a.position
                    if 6.5 <= x <= 10:
                        for g, (y0, y1) in ZONES.items():
                            if y0 <= y < y1 or (g == 1 and y >= 7):
                                zc[g] += 1
                                break
                    if x < 10 and door_of[a.id] in heading:
                        heading[door_of[a.id]] += 1
                peak_zone = max(peak_zone, zc[0] + zc[1])
                if agents:
                    d = max(v for v, _ in density_levels([a.position for a in agents]))
                    peak_dens = max(peak_dens, d)
                    if d > DENS_RED:
                        danger += 5
                for g in (0, 1):
                    h = hist[g]
                    h.append({"door": g, "zone_now": zc[g], "heading": heading[g], "arrivals_5s": arrived5[g],
                              "zone_prev1": h[-1]["zone_now"] if h else 0,
                              "zone_prev2": h[-2]["zone_now"] if len(h) > 1 else 0})
                    arrived5[g] = 0
                last_zone = zc
                p = model.predict(pd.DataFrame([hist[0][-1], hist[1][-1]])[FEATURES])
                f10 = {0: max(0.0, float(p[0])), 1: max(0.0, float(p[1]))}
                if t_alert is None and any(f10[g] / ZONE_AREA[g] >= WARN_ALERT for g in (0, 1)):
                    t_alert = round(now, 1)
                    t_resp = t_alert + RESPONSE_DELAY
                if record:
                    panel.append({"t": round(now, 1), "A": {"now": zc[0], "f10": round(f10[0], 1)},
                                  "B": {"now": zc[1], "f10": round(f10[1], 1)}})

        if nxt >= len(arrivals) and not queue and sim.agent_count() == 0:
            break
        sim.iterate()

    total = [exit_t[a] - arr_of[a] for a in exit_t]
    wait = [spawn_t[a] - arr_of[a] for a in spawn_t]
    res = {
        "seed": seed, "variant": variant, "people": len(arrivals),
        "t_alert": t_alert, "t_response": t_resp if t_resp is not None and t_resp < CAP_S else None,
        "avg_total_s": sum(total) / len(total) if total else 0,
        "avg_wait_outside_s": sum(wait) / len(wait) if wait else 0,
        "peak_zone": peak_zone, "peak_density": round(peak_dens, 2), "danger_s": danger,
        "not_out": sim.agent_count() + len(queue) + (len(arrivals) - nxt),
        "wall_breach": wall_breach,
    }
    if record:
        for k in range(len(panel)):
            for n in ("A", "B"):
                panel[k][n]["a10"] = panel[k + 2][n]["now"] if k + 2 < len(panel) else None
        res["replay"] = {
            "poly": list(geo.exterior.coords), "holes": [list(x.coords) for x in geo.interiors],
            "poly_after": list(geometry(True).exterior.coords) if variant == "extra_gate" else None,
            "holes_after": [list(x.coords) for x in geometry(True).interiors] if variant == "extra_gate" else None,
            "doors": [{"name": "A", "y0": 4.5, "y1": 5.5, "open": True}, {"name": "B", "y0": 8.5, "y1": 9.5, "open": True}]
                     + ([{"name": "C", "y0": 1.5, "y1": 2.5, "open": False}] if variant == "extra_gate" else []),
            "zones": {"A": [6.5, 2, 10, 7], "B": [6.5, 7, 10, 10]},
            "exit": [19, 4.5, 20, 5.5], "frames": frames, "panel": panel,
            "t_alert": t_alert, "t_response": res["t_response"],
        }
    return res


def load_model():
    df = pd.read_csv(DATA / "door_training.csv")
    return GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])


def task(args):
    level, seed, variant = args
    r = run(seed, LEVELS[level], variant, load_model(), record=seed == REPLAY_SEED)
    replay = r.pop("replay", None)
    if replay is not None:
        with open(DATA / "web" / f"sol_{level}_{variant}.json", "w", encoding="utf-8") as f:
            json.dump(replay, f, separators=(",", ":"))
    r["level"] = level
    return r


def check():
    r = run(REPLAY_SEED, LEVELS["peak"], "extra_gate", load_model(), record=True)
    rep = r.pop("replay")
    print({k: v for k, v in r.items()})
    opened = rep["t_response"]
    early = [a for fr in rep["frames"] if opened is None or fr["t"] < opened for a in fr["a"]
             if 9.5 <= a[0] <= 10.9 and a[1] < 3.0]
    late = [a for fr in rep["frames"] if opened is not None and fr["t"] >= opened for a in fr["a"]
            if 9.5 <= a[0] <= 10.9 and 1.5 <= a[1] <= 2.5]
    print("people in the extra gate before it opens:", len(early), "| after:", len(late))
    with open(DATA / "web" / "sol_check_extra_gate.json", "w", encoding="utf-8") as f:
        json.dump(rep, f, separators=(",", ":"))


def main():
    start = time.time()
    part = DATA / "solutions_partial.csv"  # each run is saved as soon as it ends, so a stop loses nothing
    done = set()
    if part.exists():
        p = pd.read_csv(part)
        done = set(zip(p["level"], p["seed"], p["variant"]))
    tasks = [(lv, s, v) for lv in LEVELS for s in SEEDS for v in VARIANTS if (lv, s, v) not in done]
    print("already done:", len(done), "| to run:", len(tasks), flush=True)
    with Pool(2) as pool:
        for i, r in enumerate(pool.imap_unordered(task, tasks)):
            pd.DataFrame([r]).to_csv(part, mode="a", header=not part.exists(), index=False)
            if (i + 1) % 12 == 0:
                print("runs:", i + 1, "of", len(tasks), "| seconds:", round(time.time() - start), flush=True)
    res = pd.read_csv(part).sort_values(["level", "seed", "variant"])
    res.to_csv(DATA / "solutions_results.csv", index=False)
    print("wall breaches (must be 0):", int(res["wall_breach"].sum()))
    cols = ["avg_total_s", "avg_wait_outside_s", "peak_zone", "peak_density", "danger_s", "not_out"]
    for lv in LEVELS:
        g = res[res["level"] == lv].groupby("variant")[cols].agg(["mean", "min", "max"]).round(1)
        print("\n==", lv, "==  alert at:", sorted(res[(res["level"] == lv) & (res["variant"] == "before")]["t_alert"].tolist()))
        print(g.loc[VARIANTS].to_string())
    export_summary()


METRICS = ["avg_total_s", "avg_wait_outside_s", "peak_zone", "peak_density", "danger_s", "not_out"]


def rng(s):
    s = s.dropna()
    if s.empty:
        return None
    return {"mean": round(float(s.mean()), 1), "min": round(float(s.min()), 1), "max": round(float(s.max()), 1)}


def export_summary():
    """data/web/solutions.json: per level, each variant's metrics and its paired change vs "before" (same seed)."""
    res = pd.read_csv(DATA / "solutions_results.csv")
    out = {"settings": {"arrive_s": ARRIVE_S, "cap_s": CAP_S, "warn_alert": WARN_ALERT, "response_delay": RESPONSE_DELAY,
                        "compliance": list(COMPLIANCE), "batch_s": BATCH_S, "batch_factor": BATCH_FACTOR,
                        "extra_gate": list(GATES[2]), "levels": LEVELS, "dens_red": DENS_RED},
           "seeds": len(SEEDS), "replay_seed": REPLAY_SEED, "levels": {}}
    for lv in LEVELS:
        d = res[res["level"] == lv]
        before = d[d["variant"] == "before"].set_index("seed")
        alerts = before["t_alert"].dropna()
        lvl = {"alerts": int(len(alerts)), "alert_s": rng(alerts), "variants": {}}
        for v in VARIANTS:
            x = d[d["variant"] == v].set_index("seed")
            lvl["variants"][v] = {
                "metrics": {m: rng(x[m]) for m in METRICS + ["people"]},
                "change": {m: rng(x[m] - before[m]) for m in METRICS} if v != "before" else None,
                "replay_run": {m: (round(float(x.loc[REPLAY_SEED, m]), 1) if pd.notna(x.loc[REPLAY_SEED, m]) else None)
                               for m in METRICS + ["people", "t_alert", "t_response"]},
            }
        out["levels"][lv] = lvl
    with open(DATA / "web" / "solutions.json", "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    print("saved data/web/solutions.json")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        check()
    elif len(sys.argv) > 1 and sys.argv[1] == "summary":
        export_summary()
    else:
        main()
