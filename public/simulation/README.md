# Traffic Intersection Simulation — Modular Refactor

## Run
Serve this directory from a local HTTP server because Three.js uses ES modules. For example:

```bash
cd traffic_simulation
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Architecture
- `config/simulationConfig.js` — central dimensions, physics and performance limits.
- `src/scene/scene.js` — renderer, camera, road pavement, lane markings, crosswalks and correct arrow geometry.
- `src/road/laneManager.js` — authoritative lane definitions, movement permissions and turn curves.
- `src/traffic/vehicle.js` — vehicle physics, following, lane changes and animated turns.
- `src/traffic/vehicleManager.js` — spawning/removal and simulation lifecycle.
- `src/signals/signalController.js` — signal registry and external signal-state API.
- `src/environment/environment.js` — buildings and street lights.
- `src/ui/controls.js` — signal JSON and demo controls.
- `src/main.js` — application bootstrap and render loop.
- `legacy-main.js` — original uploaded file retained for comparison.

## Traffic rules implemented
- Main street: three lanes per approach: one dedicated left-turn lane and two dedicated through lanes.
- Side street: one dedicated through lane and one shared left/through lane. Shared-lane vehicles randomly select their movement at creation.
- Lane changing is only allowed between lanes that preserve the vehicle's assigned movement. Dedicated left-turn vehicles cannot drift into through lanes.
- Faster vehicles attempt a lane change when a slower vehicle is close ahead, subject to a forward safety gap and a cooldown.
- Following distance is enforced using vehicle length plus a configurable gap, including at red lights.
- Turns use cubic Bézier paths with continuous tangent orientation so the vehicle rotates smoothly through the intersection.
- Sidewalks are split around the intersection; no sidewalk slab occupies the crossing pavement.

## Performance changes
- Fixed 60 Hz simulation step with a render-frame delta cap.
- Pixel ratio capped at 1.5.
- Shadow map reduced from the original 2048 to 1536.
- Maximum traffic count bounded.
- Vehicle collision/following checks are lane-local instead of comparing unrelated lanes.
- Shared vehicle geometry/materials reduce object creation overhead.
