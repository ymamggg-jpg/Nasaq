# Data format between `sim/` and `web/`

Agreed 15 Oct 2026. `sim/` writes these files to `data/`; `web/` only reads them.

## `data/forecast_panel.csv` (forecast warning panel)

One row per door every 5 s of a recorded run. Made by `sim/make_forecast_panel.py`.
The runs are the same ones the dashboard replays (test seed 1000, gradual arrivals).

| column | type | meaning |
|---|---|---|
| `scenario` | text | `shortest`, `ai_forecast` (normal arrivals) and `surge_shortest`, `surge_ai_forecast` (gate surge: arrival rate x2 between 20 s and 40 s). Replays: `data/viewer_gradual_<policy>.html` and `data/viewer_surge_<policy>.html` |
| `t_s` | float | simulation time in seconds |
| `door` | text | `A` = middle door (red in replay), `B` = top door (blue) |
| `actual_now` | int | people near the door at `t_s` |
| `forecast_10s` | float | model forecast of people near the door at `t_s + 10` |
| `actual_10s` | int | real count at `t_s + 10` (empty in the last 10 s of a run) |

Example:

```
scenario,t_s,door,actual_now,forecast_10s,actual_10s
normal,12.0,A,6,9.4,10
normal,12.0,B,3,4.1,4
```

The values in the example are made up and only show the format.
