# Ghost Crowd Rehearsal (Nasaq)

Expo 2030 Riyadh challenge 3.1 (Tuwaiq Academy): help the site operations team see congestion early.

A web page for an operations officer: watch a recorded crowd at a gate, get an early warning from a forecast model, then compare solutions (extra gate, stewards, batched entry) before and after. It also has an area-closure evacuation, and a check of the simulator against a real bottleneck experiment.

**Honest scope:** the gate zone is a synthetic test layout (two rooms, two gates, one exit), not the Expo site. The gate warning model is trained on our own simulations. With default settings the simulator passes about half the flow measured in a real lab bottleneck, so absolute numbers do not carry over to reality.

## Folders

| folder | content |
|---|---|
| `sim/` | simulation and ML scripts (JuPedSim, scikit-learn) |
| `data/` | every CSV the scripts write; `data/web/` holds the JSON the page reads; `data/raw/` (not in Git) holds downloaded pages |
| `web/` | Django project (`config`) and app (`dashboard`) |
| `docs/` | data format between `sim/` and `web/` |

## Setup (Windows, PowerShell)

Needs Python 3.14 and Git.

```powershell
git clone https://github.com/ymamggg-jpg/Nasaq.git
cd Nasaq  
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

Already cloned? After `git pull`, run the `pip install -r requirements.txt` line again (`holidays` was added).

### If the install fails

- **`OSError ... No such file or directory ... PySide6 ...` / "Long Path support"**: JuPedSim installs PySide6, which has very long file paths. Clone into a short folder (for example `C:\Users\<you>\Desktop\ghost-crowd`), delete `.venv` and install again.
- **`DLL load failed ... An Application Control policy has blocked this file`**: Windows Smart App Control blocked a library file. We saw this only in a copy inside the Temp folder; the same versions work in the normal project folder. Keep the project on the Desktop or in Documents, not in Temp.

## Run the web demo

All results are precomputed in `data/web/`, so the demo runs no simulation.

```powershell
.venv\Scripts\python web\manage.py runserver
```

Open http://127.0.0.1:8000/ (console) and http://127.0.0.1:8000/how-it-works/. English and Arabic.

URL options (handy for the backup video):

| option | values |
|---|---|
| `scenario` | `normal` (crowd at the gate), `fire` (area closure during evacuation), `closed` (one door closed) |
| `level` | `low`, `medium`, `peak` (for `normal`) |
| `try` | `extra_gate`, `stewards_0.3`, `stewards_0.6`, `stewards_0.9`, `batch` (opens the before/after comparison) |
| `fire` | `closure`, `no_closure` |
| `doors` | `one`, `two` (for `closed`) |
| `t` | jump to this second and pause |
| `lang` | `en`, `ar` |

Example: `/?lang=ar&level=peak&try=extra_gate&t=100`

The fonts load from Google Fonts; without internet the page falls back to system fonts and still works.

## Rerun the experiments (optional)

Each script writes to `data/` and can be run from any folder. Settings for stages 2–4 were written down before running.

| command | output | time |
|---|---|---|
| `.venv\Scripts\python sim\solutions.py` | `solutions_results.csv`, `web/solutions.json`, `web/sol_*.json` (alert and solutions, 144 runs) | ~25 min |
| `.venv\Scripts\python sim\fire.py` | `fire_results.csv`, `web/fire*.json` (area closure, 10 seeds) | ~2 min |
| `.venv\Scripts\python sim\osaka_collect.py` | `expo2025_osaka_daily.csv` (needs the saved pages in `data/raw/osaka_pages/`) | seconds |
| `.venv\Scripts\python sim\osaka_forecast.py` | `osaka_forecast_test.csv`, `web/osaka.json` | seconds |
| `.venv\Scripts\python sim\calibrate_flow.py` | `calibration_flow.csv`, `web/calibration.json` | ~1 min |
| `.venv\Scripts\python sim\ai_card.py` | `web/ai_card.json` (needs `door_training.csv`, `web/osaka.json`) | seconds |
| `.venv\Scripts\python sim\crowd_levels.py` | `crowd_levels.csv` (routing at three visitor levels) | ~5 min |
| `.venv\Scripts\python sim\export_web.py` | `web/summary.json`, `web/level_*`, `web/surge_*`, `web/evac_*` | ~2 min |
| `.venv\Scripts\python sim\scenarios_seeds.py` | `scenario_seeds.csv` (closed door, 10 seeds) | ~10 s |
| `.venv\Scripts\python sim\ai_routing.py` | `routing_results.csv`, `door_training.csv` | a few min |
| `.venv\Scripts\python sim\ai_routing_far.py` | `routing_results_far.csv` (pre-registered test, not passed) | ~4 min |
| `.venv\Scripts\python sim\flow_sensitivity.py` | `flow_sensitivity.csv` | ~2 min |

## Main results

Synthetic layout unless stated; mean over runs, ranges in the page.

- **Early warning:** forecast of people at each gate 10 s ahead, error 1.8 people versus 3.45 for "same as now" (8 unseen simulated runs).
- **Solutions after the alert** (same seeds and arrivals before/after, response 60 s after the alert): at medium level an extra gate cut people not out from 30.1 to 0; at peak, stewards with 60% compliance cut it from 155 to 17. Batched entry did not help.
- **Area closure during evacuation:** the last person got out 8.9% sooner with the closure, because it pushed people to the underused side gate.
- **Closing one of two doors:** last person out +56% (48% to 62% over 10 seeds).
- **Not used on the site:** a next-day visitor forecast on real Expo 2025 Osaka data (184 days) lost to a 7-day mean (5.4% vs 1.7% error), and Osaka is not Riyadh, so we removed it from the page. Scripts and data stay in the repo (osaka_collect.py, osaka_forecast.py).
- **Simulator check:** about half the flow of the Seyfried et al. 2007 bottleneck experiment.
- Routing on the forecast did **not** beat routing on the current count (pre-registered test not passed).

## Limits

Synthetic layout; gate model trained on simulations; simulator flow about half the real lab value; response time, compliance, density limits and visitor levels are assumptions (listed on the page); we simulate an unavailable area only, not fire or smoke, and this is not an evacuation safety certificate.

## Credits and sources

- [JuPedSim](https://www.jupedsim.org/) 1.4.2 (LGPLv3, Forschungszentrum Jülich), scikit-learn, pandas, Django, holidays.
- Expo 2025 Osaka daily visitors: official weekly pages "Number of Visitors and Admission Ticket Sales Status", https://www.expo2025.or.jp/en/news/
- Seyfried, Rupprecht, Passon, Steffen, Klingsch, Boltes (2007), "New insights into pedestrian flow through bottlenecks", arXiv:physics/0702004.
- Liao, Tordeux, Seyfried, Chraibi et al. (2016), "Measuring the steady state of pedestrian flow in bottleneck experiments", Physica A 461:248–261.
