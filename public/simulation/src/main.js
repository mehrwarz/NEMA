import { createScene } from "./scene/scene.js";
import { createSignals } from "./signals/signalController.js";
import { VehicleManager } from "./traffic/vehicleManager.js";
import { addEnvironment } from "./environment/environment.js";
import { setupControls } from "./ui/controls.js";
const { scene, camera, renderer, controls, mats } = createScene(
    document.getElementById("app"),
);
addEnvironment(scene, mats);
const signals = createSignals(scene, mats);
const traffic = new VehicleManager(scene, signals);
const ui = setupControls(signals);
window.applyTrafficSignalState = signals.apply;
window.trafficSignals = signals.registry;
addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
});
let last = performance.now(), acc = 0;
const fixed = 1 / 60;
function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    acc += dt;
    while (acc >= fixed) {
        traffic.update(fixed);
        acc -= fixed;
    }
    signals.updateSignals(performance.now());
    ui.update(dt);
    controls.update();
    if (camera.position.y < 0.2) {
        camera.position.y = 0.2;
    }
    renderer.render(scene, camera);
}
requestAnimationFrame(animate);
