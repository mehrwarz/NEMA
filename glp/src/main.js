import * as THREE from "three";

import { City } from "./city/City.js";
import { createCamera } from "./rendering/camera.js";

import { createControls } from "./ui/controls.js";


// --------------------------------------------------
// Renderer
// --------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(window.innerWidth, window.innerHeight
);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);


// --------------------------------------------------
// Scene
// --------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9dbbd3);


// --------------------------------------------------
// Camera
// --------------------------------------------------

const camera = createCamera();


// // --------------------------------------------------
// // Controls
// // --------------------------------------------------

const controls = createControls( camera, renderer );


// --------------------------------------------------
// Lighting
// --------------------------------------------------

const sun = new THREE.DirectionalLight( 0xffffff, 3);
sun.position.set(1000, 2000, 1000);
sun.castShadow = true;
scene.add(sun);


const ambient = new THREE.HemisphereLight( 0xbfd8ff, 0x405040, 2);

scene.add(ambient);


// --------------------------------------------------
// Ground plate
// --------------------------------------------------

const groundGeometry = new THREE.PlaneGeometry( 20000, 20000 );
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x68745d });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;

scene.add(ground);


// --------------------------------------------------
// City
// --------------------------------------------------

const city = new City();

await city.load( scene, "/data/alexandria-three.json");


// --------------------------------------------------
// Finish loading
// --------------------------------------------------

document.getElementById("loading").remove();


// --------------------------------------------------
// Resize
// --------------------------------------------------

window.addEventListener( "resize", () => {
        camera.aspect = window.innerWidth /window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
);


// --------------------------------------------------
// North Pointer
// --------------------------------------------------

const northArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 5, 0),
    200,
    0xff0000,
    40,
    25
);

scene.add(northArrow);


// --------------------------------------------------
// Animation
// --------------------------------------------------

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render( scene, camera);
}

animate();