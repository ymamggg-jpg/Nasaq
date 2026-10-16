import json
import time

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

import ai_routing
import scenarios
from ai_routing import DATA, DOORS, FEATURES, POLICIES, SURGE, density_levels, run
from crowd_levels import LEVELS

# Writes everything the web page reads into data/web/ (precomputed, no live simulation).
OUT = DATA / "web"
OUT.mkdir(exist_ok=True)
SEED = 1000  # test seed, never used in training; same as the earlier replays
EVERY = 2    # keep every 2nd recorded frame -> one frame per 0.5 s
WARN_WATCH = 1  # ASSUMPTION: forecast persons/m2 in a door zone from which the status is "watch"
WARN_ALERT = 2  # ASSUMPTION: forecast persons/m2 in a door zone from which the status is "crowding expected"

df = pd.read_csv(DATA / "door_training.csv")
model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])


def save(name, data):
    with open(OUT / (name + ".json"), "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))


def gradual(surge, pol, rate=None):
    r = run(SEED, pol, model=model if pol == "ai_forecast" else None, record=True, surge=surge, rate=rate)
    panel = []
    hist = r["hist"]
    for k in range(len(hist[0])):
        row = {"t": 5.0 * k}
        for d, name in ((0, "A"), (1, "B")):
            h = hist[d]
            x = pd.DataFrame([h[k]])[FEATURES]
            row[name] = {"now": h[k]["zone_now"],
                         "f10": round(max(0.0, float(model.predict(x)[0])), 1),
                         "a10": h[k + 2]["zone_now"] if k + 2 < len(h) else None}
        panel.append(row)
    return {
        "poly": list(r["geo"].exterior.coords),
        "holes": [list(x.coords) for x in r["geo"].interiors],
        "doors": [{"name": n, "y0": DOORS[d][0], "y1": DOORS[d][1], "open": True}
                  for d, n in ((0, "A"), (1, "B"))],
        "zones": {"A": [6.5, 2, 10, 7], "B": [6.5, 7, 10, 10]},
        "exit": [19, 4.5, 20, 5.5],
        "frames": r["frames"][::EVERY],
        "panel": panel,
        "run": {"people": r["people"], "avg_time_s": round(r["avg_time_s"], 1),
                "last_out_s": round(r["last_out_s"], 1), "unfinished": r["unfinished"]},
    }


def evacuation(doors):
    r = scenarios.run(doors, "")
    d = r["data"]
    open_doors = {y0 for y0, _ in doors}
    return {
        "poly": d["poly"],
        "holes": [],
        "doors": [{"name": n, "y0": y0, "y1": y1, "open": y0 in open_doors}
                  for n, (y0, y1) in (("A", (1.5, 2.5)), ("B", (7.5, 8.5)))],
        "zones": {},
        "exit": [19, 4.5, 20, 5.5],
        "frames": [{"t": f["t"], "a": [[a[1], a[2], -1, a[0], lv[1]]
                                      for a, lv in zip(f["a"], density_levels([(a[1], a[2]) for a in f["a"]]))]}
                   for f in d["frames"][::EVERY]],
        "panel": [],
        "run": {"people": 40, "avg_time_s": r["average_time_s"],
                "last_out_s": r["last_person_out_s"], "unfinished": r["people_left"]},
    }


start = time.time()
for level, rate in LEVELS.items():
    for pol in POLICIES:
        name = "level_" + level + "_" + pol
        save(name, gradual(False, pol, rate))
        print("saved", name, "| seconds:", round(time.time() - start))
for pol in POLICIES:
    save("surge_" + pol, gradual(True, pol))
    print("saved surge_" + pol, "| seconds:", round(time.time() - start))
save("evac_two_doors", evacuation([(1.5, 2.5), (7.5, 8.5)]))
save("evac_one_door", evacuation([(1.5, 2.5)]))
print("saved evacuation replays | seconds:", round(time.time() - start))


def rng(s):
    return {"mean": round(float(s.mean()), 1), "min": round(float(s.min()), 1), "max": round(float(s.max()), 1)}


def table(res):
    cols = [c for c in ("people", "avg_time_s", "last_out_s", "peak_crowd", "peak_density", "unfinished") if c in res]
    return [{"policy": p, **{c: rng(res[res["policy"] == p][c]) for c in cols}} for p in POLICIES]


levels = pd.read_csv(DATA / "crowd_levels.csv")
surge_res = pd.read_csv(DATA / "surge_results.csv")
evac = pd.read_csv(DATA / "scenario_seeds.csv")
ev = evac.groupby("scenario")[["last_person_out_s", "average_time_s", "peak_crowd_before_wall"]]
routing = pd.read_csv(DATA / "routing_results.csv")
summary = {
    "normal": {"seeds": int(routing["seed"].nunique()), "rows": table(routing)},  # how-it-works page
    "levels": {lv: {"rate": rate, "seeds": int(levels[levels["level"] == lv]["seed"].nunique()),
                    "rows": table(levels[levels["level"] == lv])} for lv, rate in LEVELS.items()},
    "surge": {"seeds": int(surge_res["seed"].nunique()), "rows": table(surge_res[surge_res["case"] == "surge"]),
              "surge": {"from_s": SURGE[0], "to_s": SURGE[1], "factor": SURGE[2]}},
    "assumptions": {
        "dens_r": ai_routing.DENS_R, "dens_yellow": ai_routing.DENS_YELLOW, "dens_red": ai_routing.DENS_RED,
        "levels": LEVELS, "arrive_s": 60, "warn_watch": WARN_WATCH, "warn_alert": WARN_ALERT,
        "flow": ai_routing.FLOW, "speed": ai_routing.SPEED, "radius": 0.2, "cap_s": 150,
    },
    "evac": {"seeds": int(evac["seed"].nunique()),
             "rows": [{"case": c, **{k: {"mean": round(v["mean"], 1), "min": round(v["min"], 1),
                                         "max": round(v["max"], 1)} for k, v in ev.get_group(c).agg(["mean", "min", "max"]).to_dict().items()}}
                      for c in ("normal", "closed")],
             "last_out_pct": rng(100 * (evac[evac["scenario"] == "closed"].set_index("seed")["last_person_out_s"]
                                        / evac[evac["scenario"] == "normal"].set_index("seed")["last_person_out_s"] - 1))},
}
save("summary", summary)
print(json.dumps(summary, indent=1)[:1500])
