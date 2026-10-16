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


def run(doors, title, out_file=None):
    parts = [shapely.box(0, 0, 10, 10), shapely.box(10.4, 0, 20, 10)]
    for y0, y1 in doors:
        parts.append(shapely.box(9.5, y0, 10.9, y1))
    geometry = shapely.unary_union(parts)
    exit_polygon = shapely.box(19, 4.5, 20, 5.5)

    sim = jps.Simulation(model=jps.CollisionFreeSpeedModel(), geometry=geometry)
    exit_id = sim.add_exit_stage(exit_polygon)
    journey_id = sim.add_journey(jps.JourneyDescription([exit_id]))
    for i in range(8):
        for j in range(5):
            sim.add_agent(
                jps.CollisionFreeSpeedModelAgentParameters(
                    journey_id=journey_id,
                    stage_id=exit_id,
                    position=(1 + i * 0.9, 2 + j * 1.5),
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

    data = {"title": title, "poly": list(geometry.exterior.coords), "frames": frames}
    if out_file is not None:
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(PAGE.replace("__DATA__", json.dumps(data)))

    times = list(exit_time.values())
    peak = max(sum(1 for a in f["a"] if 7.5 <= a[1] <= 10) for f in frames)
    return {
        "data": data,
        "scenario": title,
        "people_left": sim.agent_count(),
        "last_person_out_s": round(max(times), 1),
        "average_time_s": round(sum(times) / len(times), 1),
        "peak_crowd_before_wall": peak,
    }


if __name__ == "__main__":
    normal = run([(1.5, 2.5), (7.5, 8.5)], "Normal: both doors open", DATA / "viewer_normal.html")
    closed = run([(1.5, 2.5)], "Disruption: one door closed", DATA / "viewer_closed.html")
    for r in (normal, closed):
        print({k: v for k, v in r.items() if k != "data"})