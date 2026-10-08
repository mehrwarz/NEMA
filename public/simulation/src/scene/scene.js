import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { CONFIG } from "../../config/simulationConfig.js";


export function createMaterials() {
    return {
        asphalt: new THREE.MeshStandardMaterial({ color: 0x292c2e, roughness: .95 }), grass: new THREE.MeshStandardMaterial({ color: 0x567247, roughness: 1 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0x777c7b, roughness: .9 }), white: new THREE.MeshStandardMaterial({ color: 0xf2f2ed, roughness: .8 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xf3c400, roughness: .75 }), steel: new THREE.MeshStandardMaterial({ color: 0x4e5355, metalness: .8, roughness: .3 }), black: new THREE.MeshStandardMaterial({ color: 0x111314, roughness: .6 })
    }
}

const box = (scene, mat, w, h, d, x, y, z, receive = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = receive;
    m.castShadow = false;
    scene.add(m);
    return m
};

function dashNS(scene, m, x) {
    for (let z = -175; z <= 175; z += 9) {
        if (Math.abs(z) > 22) box(scene, m.white, .11, .025, 4.3, x, .09, z)
    }
}
function dashEW(scene, m, z) {
    for (let x = -175; x <= 175; x += 9) {
        if (Math.abs(x) > 22) box(scene, m.white, 4.3, .025, .11, x, .09, z)
    }
}
function arrow(scene, m, x, z, rotation, turn = false) {
    // Flat polygon instead of a cone: produces a true pavement arrow silhouette.

    const s = new THREE.Shape();
    s.moveTo(0, 2.5);
    s.lineTo(.48, 1.35);
    s.lineTo(.18, 1.35);
    s.lineTo(.18, -.55);
    s.lineTo(.78, -.55);
    s.lineTo(0, -2.0);
    s.lineTo(-.78, -.55);
    s.lineTo(-.18, -.55);
    s.lineTo(-.18, 1.35);
    s.lineTo(-.48, 1.35);
    s.closePath();

    if (turn) {
        const turnShape = new THREE.Shape();
        turnShape.moveTo(0, 2.45);
        turnShape.lineTo(.46, 1.35);
        turnShape.lineTo(.16, 1.35);
        turnShape.lineTo(.16, .05);
        turnShape.quadraticCurveTo(.16, -.55, .78, -1.0);
        turnShape.lineTo(.25, -1.15);
        turnShape.quadraticCurveTo(-.42, -.7, -.42, .05);
        turnShape.lineTo(-.42, 1.35);
        turnShape.lineTo(-.46, 1.35);
        turnShape.closePath();

        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(turnShape), m.white);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = rotation;
        mesh.position.set(x, .12, z);
        scene.add(mesh);
        return
    }

    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(s), m.white);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotation;
    mesh.position.set(x, .12, z);
    scene.add(mesh)
}

function roads(scene, m) {
    const R = CONFIG.road;
    box(scene, m.asphalt, R.mainWidth, .05, R.length, 0, .025, 0);
    box(scene, m.asphalt, R.length, .05, R.sideWidth, 0, .025, 0);

    // Sidewalks are segmented around the intersection, so concrete never covers the crossing pavement.

    const sw = R.sidewalkWidth, h = R.intersectionHalf;
    box(scene, m.concrete, sw, .35, (R.length - h * 2), -(R.mainWidth / 2 + sw / 2), .18, 0);
    box(scene, m.concrete, sw, .35, (R.length - h * 2), (R.mainWidth / 2 + sw / 2), .18, 0);

    box(scene, m.concrete, (R.length - h * 2), .35, sw, 0, .18, -(R.sideWidth / 2 + sw / 2));
    box(scene, m.concrete, (R.length - h * 2), .35, sw, 0, .18, (R.sideWidth / 2 + sw / 2));

    box(scene, m.yellow, .55, .04, R.length, 0, .075, 0);

    [-10, -5, 5, 10].forEach(x => dashNS(scene, m, x));
    [-5, 5].forEach(z => dashEW(scene, m, z));

    box(scene, m.white, R.mainWidth, .035, .45, 0, .10, -18);
    box(scene, m.white, R.mainWidth, .035, .45, 0, .10, 18);
    box(scene, m.white, .45, .035, R.sideWidth, -18, .10, 0);
    box(scene, m.white, .45, .035, R.sideWidth, 18, .10, 0);

    for (let i = 0; i < 12; i++) {
        const x = -13.7 + i * 2.5;
        box(scene, m.white, 1.15, .035, 4, x, .105, -20);
        box(scene, m.white, 1.15, .035, 4, x, .105, 20)
    }

    for (let i = 0; i < 8; i++) {
        const z = -8.75 + i * 2.5;
        box(scene, m.white, 4, .035, 1.15, -20, .105, z);
        box(scene, m.white, 4, .035, 1.15, 20, .105, z)
    }
    // Main road: dedicated left + two through arrows on every approach.
    arrow(scene, m, 2.5, -38, 0, true);
    arrow(scene, m, 7.5, -38, 0);
    arrow(scene, m, 12.5, -38, 0);
    arrow(scene, m, -2.5, 38, Math.PI, true);
    arrow(scene, m, -7.5, 38, Math.PI);
    arrow(scene, m, -12.5, 38, Math.PI);

    // Side road: outer through + inner shared left/through.
    arrow(scene, m, -38, -2.5, -Math.PI / 2, true);
    arrow(scene, m, -38, -7.5, -Math.PI / 2);
    arrow(scene, m, 38, 2.5, Math.PI / 2, true);
    arrow(scene, m, 38, 7.5, Math.PI / 2)
}

export function createScene(container) {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x91adbd);
    scene.fog = new THREE.Fog(0x91adbd, 160, 420);

    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 1000);
    camera.position.set(82, 72, 88);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.performance.pixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .06;
    controls.target.set(0, 0, 0);
    controls.minDistance = 20;
    controls.maxDistance = 300;

    scene.add(new THREE.HemisphereLight(0xe5f4ff, 0x4c5547, 2.2));

    const sun = new THREE.DirectionalLight(0xffffff, 3.2);
    sun.position.set(70, 130, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.width = CONFIG.performance.shadowMapSize;
    sun.shadow.mapSize.height = CONFIG.performance.shadowMapSize;
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = 180;
    sun.shadow.camera.bottom = -180;
    scene.add(sun);


    const mats = createMaterials();

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mats.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    roads(scene, mats);
    return { scene, camera, renderer, controls, mats }
}
