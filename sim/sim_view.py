import json
import shapely
import jupedsim as jps

from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

PAGE = """<!doctype html>
<html><body style="font-family:sans-serif">
<canvas id="c" width="800" height="400" style="border:1px solid #999"></canvas>
<div id="info" style="margin-top:8px"></div>
<script>
const D = __DATA__;
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

left = shapely.box(0, 0, 10, 10)
door = shapely.box(9.5, 4.5, 10.9, 5.5)
right = shapely.box(10.4, 0, 20, 10)
geometry = shapely.unary_union([left, door, right])
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
while sim.agent_count() > 0 and sim.iteration_count() < 30000:
    if sim.iteration_count() % 25 == 0:
        frames.append({
            "t": round(sim.elapsed_time(), 2),
            "a": [[a.id, round(a.position[0], 2), round(a.position[1], 2)] for a in sim.agents()],
        })
    sim.iterate()

data = {"poly": list(geometry.exterior.coords), "frames": frames}
with open(DATA / "viewer.html", "w", encoding="utf-8") as f:
    f.write(PAGE.replace("__DATA__", json.dumps(data)))

print("frames:", len(frames))
print("agents left:", sim.agent_count())
print("seconds simulated:", round(sim.elapsed_time(), 1))