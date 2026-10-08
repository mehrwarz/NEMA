import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createControls( camera, renderer) {
    const controls = new OrbitControls( camera, renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(-500, 0, -400 );
    controls.minDistance = 20;
    controls.maxDistance = 20000;

    /*
     * Prevent camera from going
     * below the horizontal plane.
     */
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    return controls;
}