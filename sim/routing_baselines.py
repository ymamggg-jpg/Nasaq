import json
import shapely
import jupedsim as jps

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

PAGE = """<!doctype html>
<html><body style="font-family:sans-serif">
<h3 id="t"></h3>
<canvas id="c" width="800" height="400" style="border:1px solid #999"></canvas>
<div id="info" style="margin-top:8px"></div>
<script>
const D = __DATA__;
document.getElementById("t").textContent = D.title;
const cv = document.getElementById("c"), ctx = cv.getContext("2d");
const S = 40, H = 400;
let k = 0;
function draw() {
  ctx.clearRect(0, 0, 800, H);
  ctx.beginPath();
  D.poly.forEach((p, i) => {
    const x = p[0] * S, y = H - p[1] * S;
    if (i) { ctx.lineTo(x, y); } else { ctx.moveTo(x, y); }
  });
  ctx.closePath();
  ctx.fillStyle = "#eef2f7"; ctx.fill();
  ctx.strokeStyle = "#333"; ctx.stroke();
  D.holes.forEach(h => {
    ctx.beginPath();
    h.forEach((p, i) => {
      const x = p[0] * S, y = H - p[1] * S;
      if (i) { ctx.lineTo(x, y); } else { ctx.moveTo(x, y); }
    });
    ctx.closePath();
    ctx.fillStyle = "#888"; ctx.fill();
  });
  ctx.fillStyle = "rgba(0,160,0,0.4)";
  ctx.fillRect(19 * S, H - 5.5 * S, S, S);
  const f = D.frames[k];
  ctx.fillStyle = "#d33";
  f.a.forEach(a => {
    ctx.beginPath();
    ctx.arc(a[1] * S, H - a[2] * S, 0.2 * S, 0, 6.283);
    ctx.fill();
  });
  document.getElementById("info").textContent =
    "time: " + f.t + " s | people inside: " + f.a.length;
  k = (k + 1) % D.frames.length;
}
setInterval(draw, 100);
</script></body></html>"""


def run(strategy, out_file):
    parts = [
        shapely.box(0, 0, 10, 10),
        shapely.box(10.4, 0, 20, 10),
        shapely.box(9.5, 4.5, 10.9, 5.5),
        shapely.box(9.5, 8.5, 10.9, 9.5),
    ]
    geometry = shapely.unary_union(parts)
    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry)
    exit_id = sim.add_exit_stage(shapely.box(19, 4.5, 20, 5.5))

    if strategy == "shortest":
        journey = jps.JourneyDescription([exit_id])
        start_stage = exit_id
    else:
        switch_id = sim.add_waypoint_stage((3.0, 3.0), 4.0)
        door_a = sim.add_waypoint_stage((10.2, 5.0), 1.0)
        door_b = sim.add_waypoint_stage((10.2, 9.0), 1.0)
        journey = jps.JourneyDescription([switch_id, door_a, door_b, exit_id])
        journey.set_transition_for_stage(
            switch_id, jps.Transition.create_least_targeted_transition([door_a, door_b])
        )
        journey.set_transition_for_stage(door_a, jps.Transition.create_fixed_transition(exit_id))
        journey.set_transition_for_stage(door_b, jps.Transition.create_fixed_transition(exit_id))
        start_stage = switch_id
    journey_id = sim.add_journey(journey)

    for i in range(10):
        for j in range(6):
            sim.add_agent(
                jps.CollisionFreeSpeedModelAgentParameters(
                    journey_id=journey_id,
                    stage_id=start_stage,
                    position=(1 + i * 0.6, 1 + j * 0.8),
                    radius=0.2,
                )
            )

    frames = []
    exit_time = {}
    prev = set()
    while sim.agent_count() > 0 and sim.iteration_count() < 40000:
        if sim.iteration_count() % 25 == 0:
            t = round(sim.elapsed_time(), 2)
            now = [[a.id, round(a.position[0], 2), round(a.position[1], 2)] for a in sim.agents()]
            ids = {a[0] for a in now}
            for gone in prev - ids:
                exit_time[gone] = t
            prev = ids
            frames.append({"t": t, "a": now})
        sim.iterate()
    for gone in prev:
        exit_time[gone] = round(sim.elapsed_time(), 2)

    holes = [list(r.coords) for r in geometry.interiors]
    data = {"title": strategy, "poly": list(geometry.exterior.coords), "holes": holes, "frames": frames}
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(PAGE.replace("__DATA__", json.dumps(data)))

    times = list(exit_time.values())
    peak = max(sum(1 for a in f["a"] if 7.5 <= a[1] <= 10) for f in frames)
    return {
        "strategy": strategy,
        "people_left": sim.agent_count(),
        "last_person_out_s": round(max(times), 1),
        "average_time_s": round(sum(times) / len(times), 1),
        "peak_crowd_before_wall": peak,
    }


print(run("shortest", DATA / "viewer_shortest.html"))
print(run("balanced", DATA / "viewer_balanced.html"))