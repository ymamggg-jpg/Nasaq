import json
import random
import time

import pandas as pd
import shapely
import jupedsim as jps
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

LEFT = -20.0      # left room now starts at x = -20 (30 m long)
SPAWN_X = -19.4
HORIZON = 5       # 5-second steps -> forecast 25 s ahead
MAX_IT = 20000    # 200 s cap
DOORS = {0: (4.5, 5.5), 1: (8.5, 9.5)}
EXIT = shapely.box(19, 4.5, 20, 5.5)
SPAWN_Y = [1.0 + 0.8 * k for k in range(11)]
FLOW = 1.3   # ASSUMPTION: people per second through a 1 m door (to be sourced)
SPEED = 1.2  # JuPedSim default desired speed, m/s
FEATURES = ["door", "zone_now", "zone_prev1", "zone_prev2", "heading", "arrivals_5s"]
POLICIES = ["shortest", "least_targeted", "current_count", "ai_forecast"]


def make_geometry():
    parts = [shapely.box(LEFT, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for y0, y1 in DOORS.values():
        parts.append(shapely.box(9.5, y0, 10.9, y1))
    return shapely.unary_union(parts)


def walk_time(y, d):
    yc = sum(DOORS[d]) / 2
    a = ((10.2 - SPAWN_X) ** 2 + (yc - y) ** 2) ** 0.5
    b = ((19.5 - 10.2) ** 2 + (5.0 - yc) ** 2) ** 0.5
    return (a + b) / SPEED


def run(seed, policy, model=None, record=False):
    arr_rng = random.Random(seed)
    pol_rng = random.Random(seed + 12345)
    rate = arr_rng.uniform(1.0, 3.0)
    p_a = pol_rng.uniform(0.3, 0.9)
    arrivals = []
    t = arr_rng.expovariate(rate)
    while t < 60:
        arrivals.append(t)
        t += arr_rng.expovariate(rate)

    geo = make_geometry()
    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geo)
    exit_id = sim.add_exit_stage(EXIT)
    journeys = {}
    for d, (y0, y1) in DOORS.items():
        wp = sim.add_waypoint_stage((11.2, (y0 + y1) / 2), 0.6)
        jd = jps.JourneyDescription([wp, exit_id])
        jd.set_transition_for_stage(wp, jps.Transition.create_fixed_transition(exit_id))
        journeys[d] = (sim.add_journey(jd), wp)

    step5 = round(5 / sim.delta_time())
    nxt, pending, peak = 0, 0, 0
    door_of, spawn_t, exit_t = {}, {}, {}
    prev_ids = set()
    hist = {0: [], 1: []}
    arrived5 = {0: 0, 1: 0}
    since = {0: 0, 1: 0}
    last_zone = {0: 0, 1: 0}
    last_heading = {0: 0, 1: 0}
    pred = {0: 0.0, 1: 0.0}
    frames = []

    def choose(y):
        if policy == "shortest":
            return 0
        if policy == "random":
            return 0 if pol_rng.random() < p_a else 1
        if policy == "least_targeted":
            return min((0, 1), key=lambda d: last_heading[d] + since[d])
        if policy == "current_count":
            return min((0, 1), key=lambda d: (last_zone[d] + since[d]) / FLOW + walk_time(y, d))
        return min((0, 1), key=lambda d: (pred[d] + since[d]) / FLOW + walk_time(y, d))

    while sim.iteration_count() < MAX_IT:
        now = sim.elapsed_time()
        while nxt < len(arrivals) and arrivals[nxt] <= now:
            pending += 1
            nxt += 1
        while pending > 0:
            free = [y for y in SPAWN_Y if len(list(sim.agents_in_range((SPAWN_X, y), 0.55))) == 0]
            if not free:
                break
            y = arr_rng.choice(free)
            d = choose(y)
            jid, wp = journeys[d]
            aid = sim.add_agent(
                jps.CollisionFreeSpeedModelAgentParameters(
                    journey_id=jid, stage_id=wp, position=(SPAWN_X, y), radius=0.2
                )
            )
            door_of[aid] = d
            spawn_t[aid] = now
            arrived5[d] += 1
            since[d] += 1
            pending -= 1

        it = sim.iteration_count()
        if it % 25 == 0:
            agents = list(sim.agents())
            ids = {a.id for a in agents}
            for gone in prev_ids - ids:
                exit_t[gone] = now
            prev_ids = ids
            if record:
                frames.append({"t": round(now, 2), "a": [
                    [round(a.position[0], 2), round(a.position[1], 2), door_of[a.id]] for a in agents]})
            if it % step5 == 0:
                zc = {0: 0, 1: 0}
                heading = {0: 0, 1: 0}
                for a in agents:
                    x, y = a.position
                    if 6.5 <= x <= 10:
                        if 2 <= y < 7:
                            zc[0] += 1
                        elif y >= 7:
                            zc[1] += 1
                    if x < 10:
                        heading[door_of[a.id]] += 1
                peak = max(peak, zc[0] + zc[1])
                for d in (0, 1):
                    h = hist[d]
                    h.append({
                        "door": d, "zone_now": zc[d], "heading": heading[d],
                        "arrivals_5s": arrived5[d],
                        "zone_prev1": h[-1]["zone_now"] if len(h) > 0 else 0,
                        "zone_prev2": h[-2]["zone_now"] if len(h) > 1 else 0,
                    })
                    arrived5[d] = 0
                    since[d] = 0
                last_zone, last_heading = zc, heading
                if model is not None:
                    X = pd.DataFrame([hist[0][-1], hist[1][-1]])[FEATURES]
                    p = model.predict(X)
                    pred = {0: max(0.0, p[0]), 1: max(0.0, p[1])}

        if nxt >= len(arrivals) and pending == 0 and sim.agent_count() == 0:
            break
        sim.iterate()

    rows = []
    for d in (0, 1):
        h = hist[d]
        for k in range(len(h) - HORIZON):
            r = dict(h[k])
            r["target"] = h[k + HORIZON]["zone_now"]
            r["run"] = seed
            rows.append(r)

    times = [exit_t[a] - spawn_t[a] for a in exit_t]
    return {
        "rows": rows, "frames": frames, "geo": geo,
        "people": len(spawn_t),
        "avg_time_s": sum(times) / len(times) if times else 0,
        "last_out_s": max(exit_t.values()) if exit_t else 0,
        "peak_crowd": peak,
        "unfinished": sim.agent_count() + pending,
    }


PAGE = """<!doctype html>
<html><body style="font-family:sans-serif">
<h3 id="t"></h3>
<canvas id="c" width="800" height="200" style="border:1px solid #999"></canvas>
<div id="info" style="margin-top:8px"></div>
<script>
const D = __DATA__;
document.getElementById("t").textContent = D.title;
const cv = document.getElementById("c"), ctx = cv.getContext("2d");
const S = 20, H = 200, X0 = 20;
let k = 0;
function path(pts) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const x = (p[0] + X0) * S, y = H - p[1] * S;
    if (i) { ctx.lineTo(x, y); } else { ctx.moveTo(x, y); }
  });
  ctx.closePath();
}
function draw() {
  ctx.clearRect(0, 0, 800, H);
  path(D.poly); ctx.fillStyle = "#eef2f7"; ctx.fill(); ctx.strokeStyle = "#333"; ctx.stroke();
  D.holes.forEach(h => { path(h); ctx.fillStyle = "#888"; ctx.fill(); });
  ctx.fillStyle = "rgba(0,160,0,0.4)"; ctx.fillRect((19 + X0) * S, H - 5.5 * S, S, S);
  const f = D.frames[k];
  f.a.forEach(a => {
    ctx.fillStyle = a[2] === 0 ? "#d33" : "#36c";
    ctx.beginPath(); ctx.arc((a[0] + X0) * S, H - a[1] * S, 0.2 * S, 0, 6.283); ctx.fill();
  });
  document.getElementById("info").textContent =
    "time: " + f.t + " s | people inside: " + f.a.length + " | red = middle door, blue = top door";
  k = (k + 1) % D.frames.length;
}
setInterval(draw, 100);
</script></body></html>"""


def save_viewer(r, title, path):
    data = {"title": title, "poly": list(r["geo"].exterior.coords),
            "holes": [list(x.coords) for x in r["geo"].interiors], "frames": r["frames"]}
    with open(path, "w", encoding="utf-8") as f:
        f.write(PAGE.replace("__DATA__", json.dumps(data)))


start = time.time()
train_rows = []
for s in range(40):
    train_rows += run(s, "random")["rows"]
    if (s + 1) % 10 == 0:
        print("training runs:", s + 1, "| seconds:", round(time.time() - start))
df = pd.DataFrame(train_rows)
df.to_csv(DATA / "door_training_far.csv", index=False)

hold = df["run"] >= 32
check = GradientBoostingRegressor(random_state=0).fit(df[~hold][FEATURES], df[~hold]["target"])
print("forecast check (25 s ahead) on unseen runs -> MAE same_as_now:",
      round(mean_absolute_error(df[hold]["target"], df[hold]["zone_now"]), 2),
      "| MAE model:", round(mean_absolute_error(df[hold]["target"], check.predict(df[hold][FEATURES])), 2))
model = GradientBoostingRegressor(random_state=0).fit(df[FEATURES], df["target"])

results = []
for s in range(1000, 1012):
    for pol in POLICIES:
        rec = s == 1000 and pol in ("current_count", "ai_forecast")
        r = run(s, pol, model=model if pol == "ai_forecast" else None, record=rec)
        if rec:
            save_viewer(r, pol + " (far decision point)", DATA / ("viewer_far_" + pol + ".html"))
        results.append({"seed": s, "policy": pol, "people": r["people"],
                        "avg_time_s": r["avg_time_s"], "last_out_s": r["last_out_s"],
                        "peak_crowd": r["peak_crowd"], "unfinished": r["unfinished"]})
    print("test seed done:", s, "| seconds:", round(time.time() - start))

res = pd.DataFrame(results)
res.to_csv(DATA / "routing_results_far.csv", index=False)
print(res.groupby("policy")[["avg_time_s", "last_out_s", "peak_crowd", "unfinished"]].mean().round(1).loc[POLICIES])
wide = res.pivot(index="seed", columns="policy", values="avg_time_s")
wins = int((wide["ai_forecast"] < wide["current_count"]).sum())
gain = (1 - wide["ai_forecast"].mean() / wide["current_count"].mean()) * 100
print("ai_forecast faster than current_count in", wins, "of", len(wide), "test runs")
print("average time reduction vs current_count:", round(gain, 1), "%")
print("PRE-STATED TEST PASSED" if wins >= 9 and gain >= 3 else "PRE-STATED TEST NOT PASSED")