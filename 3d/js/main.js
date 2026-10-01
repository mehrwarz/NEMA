
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ============================================================
   SCENE
   ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91adbd);
scene.fog = new THREE.Fog(0x91adbd, 160, 420);

/* ============================================================
   CAMERA
   ============================================================ */
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(82, 72, 88);

/* ============================================================
   RENDERER
   ============================================================ */
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

/* ============================================================
   ORBIT CONTROLS
   ============================================================ */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0, 0);
controls.minDistance = 20;
controls.maxDistance = 300;

/* ============================================================
   LIGHTING
   ============================================================ */
scene.add(new THREE.HemisphereLight(0xe5f4ff, 0x4c5547, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(70, 130, 60);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;
scene.add(sun);

/* ============================================================
   MATERIALS
   ============================================================ */
const asphalt = new THREE.MeshStandardMaterial({ color: 0x292c2e, roughness: 0.95});
const grass = new THREE.MeshStandardMaterial({ color: 0x567247, roughness: 1});
const concrete = new THREE.MeshStandardMaterial({ color: 0x777c7b, roughness: 0.9});
const white = new THREE.MeshStandardMaterial({ color: 0xf2f2ed, roughness: 0.8});
const yellow = new THREE.MeshStandardMaterial({ color: 0xf3c400, roughness: 0.75});
const steel = new THREE.MeshStandardMaterial({ color: 0x4e5355, metalness: 0.8, roughness: 0.3});
const black = new THREE.MeshStandardMaterial({ color: 0x111314, roughness: 0.6});

/* ============================================================
   GROUND
   ============================================================ */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), grass);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ============================================================
   ROAD DIMENSIONS
   ============================================================ */
/*
            NORTH
              ↑
              |
   3 lanes    |   
              | 
              |
WEST ---------+--------- EAST
              |   .
              |  /|\
              |   |  
              | 3 lanes
              |
              ↓
            SOUTH
    Main road width = 30
    Side road width = 20
*/

const MAIN_WIDTH = 30;
const SIDE_WIDTH = 20;
const ROAD_LENGTH = 360;

/* ============================================================
   ROADS
   ============================================================ */
function road(width, depth) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), asphalt);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.025;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

/* North/South */
road(MAIN_WIDTH, ROAD_LENGTH);

/* East/West */
const eastWestRoad = road(ROAD_LENGTH, SIDE_WIDTH);

/* ============================================================
   SIDEWALKS
   ============================================================ */
function box(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

const SW = 5;
box(SW, .35, ROAD_LENGTH, concrete, -(MAIN_WIDTH / 2 + SW / 2), .18, 0);
box(SW, .35, ROAD_LENGTH, concrete, MAIN_WIDTH / 2 + SW / 2, .18, 0);
box(ROAD_LENGTH, .35, SW, concrete, 0, .18, -(SIDE_WIDTH / 2 + SW / 2));
box(ROAD_LENGTH, .35, SW, concrete, 0, .18, SIDE_WIDTH / 2 + SW / 2);

/* ============================================================
   CENTER DIVIDER
   ============================================================ */
box(0.55, .04, ROAD_LENGTH, yellow, 0, .075, 0);

/* ============================================================
   DASHED LANE MARKINGS
   ============================================================ */
function line(x, z, width, depth) {
    box(width, .025, depth, white, x, .09, z);
}

/* Main road lane lines */
const NS_LANES = [-10, -5, 5, 10];
for (const x of NS_LANES) {
    for (let z = -175;
        z <= 175;
        z += 9) {
        if (Math.abs(z) > 19) {
            line(x, z, .11, 4.3);
        }
    }
}

/* Side street */
const EW_LANES = [-6.5, 6.5];
for (const z of EW_LANES) {
    for (let x = -175;
        x <= 175;
        x += 9) {
        if (Math.abs(x) > 19) {
            line(x, z, 4.3, .11);
        }
    }
}

/* ============================================================
   STOP LINES
   ============================================================ */
box(MAIN_WIDTH, .035, .45, white, 0, .10, -18);
box(MAIN_WIDTH, .035, .45, white, 0, .10, 18);
box(.45, .035, SIDE_WIDTH, white, -18, .10, 0);
box(.45, .035, SIDE_WIDTH, white, 18, .10, 0);

/* ============================================================
   CROSSWALKS
   ============================================================ */
function crosswalkNorthSouth(z) {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const x = -MAIN_WIDTH / 2 + 1.3 + i * 2.5;
        box(1.15, .035, 4.0, white, x, .105, z);
    }
}

function crosswalkEastWest(x) {
    const count = 8;
    for (let i = 0; i < count; i++) {
        const z = -SIDE_WIDTH / 2 + 1.25 + i * 2.5;
        box(4.0, .035, 1.15, white, x, .105, z);
    }
}

crosswalkNorthSouth(-20);
crosswalkNorthSouth(20);
crosswalkEastWest(-20);
crosswalkEastWest(20);

/* ============================================================
   PAVEMENT ARROWS
   ============================================================ */
function pavementArrow(x, z, rotation) {
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(.45, .04, 3.1), white);

    shaft.position.z = .55;

    const head = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.0, 3), white);

    head.rotation.x = Math.PI / 2;
    head.position.z = -1.15;

    group.add(shaft, head);
    group.position.set(x, .12, z);
    group.rotation.y = rotation;
    scene.add(group);
}

/* Through arrows */
pavementArrow(5, -38, 0);
pavementArrow(10, -38, 0);
pavementArrow(-5, 38, Math.PI);
pavementArrow(-10, 38, Math.PI);

/* Turn arrows */
pavementArrow(5, -27, -Math.PI / 4);
pavementArrow(-5, 27, Math.PI / 4);

/* East-West */
pavementArrow(-40, 6.5, -Math.PI / 2);
pavementArrow(40, -6.5, Math.PI / 2);

/* ============================================================
   NORTH COMPASS
   ============================================================ */
function createNorthIndicator() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, .4, 32), black);

    base.position.y = .25;
    group.add(base);

    // Create a container group for the needle
    const needleGroup = new THREE.Group();

    // 1. North Half (Red Triangle)
    const redGeo = new THREE.BufferGeometry();
    const redVertices = new Float32Array([
         0.0,  2.5,  0.0, // North tip
        -1.4,  0.0,  0.0, // Left base
         1.4,  0.0,  0.0  // Right base
    ]);
    redGeo.setAttribute('position', new THREE.BufferAttribute(redVertices, 3));
    redGeo.computeVertexNormals();

    const redArrow = new THREE.Mesh(redGeo, new THREE.MeshStandardMaterial({
        color: 0xd71920, 
        roughness: .45,
        side: THREE.DoubleSide
    }));

    // 2. South Half (Blue Triangle)
    const blueGeo = new THREE.BufferGeometry();
    const blueVertices = new Float32Array([
         0.0, -2.5,  0.0, // South tip
         1.4,  0.0,  0.0, // Right base
        -1.4,  0.0,  0.0  // Left base
    ]);
    blueGeo.setAttribute('position', new THREE.BufferAttribute(blueVertices, 3));
    blueGeo.computeVertexNormals();

    const blueArrow = new THREE.Mesh(blueGeo, new THREE.MeshStandardMaterial({
        color: 0x1d70b8, 
        roughness: .45,
        side: THREE.DoubleSide
    }));

    // Assemble the needle
    needleGroup.add(redArrow);
    needleGroup.add(blueArrow);
    needleGroup.rotation.x = Math.PI / 2;
    needleGroup.position.set(0, .65, -0.5);
    group.add(needleGroup);

    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture, 
            transparent: true
        }
    ));

    sprite.scale.set(4, 2, 1);
    sprite.position.set(0, 3, -5);
    group.add(sprite);
    group.position.set(30, 0, -30);
    scene.add(group);
}

createNorthIndicator();

/* ============================================================
   TRAFFIC POLES
   ============================================================ */
function cylinderBetween(start, end, radius, material) {
    const direction = new THREE.Vector3()
        .subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start
        .clone()
        .add(end)
        .multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
}

function trafficPole(x, z, armA, armB) {
    const height = 15;
    /* Vertical support */
    cylinderBetween(new THREE.Vector3(x, .5, z), new THREE.Vector3(x, height, z), .38, steel);

    /* Base */
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, .65, 24), concrete);
    base.position.set(x, .325, z);
    base.castShadow = true;
    scene.add(base);

    /* Two right-angle mast arms */
    for (const arm of [armA, armB]) {
        const end = new THREE.Vector3(x + arm.x, height, z + arm.z);
        cylinderBetween(new THREE.Vector3(x, height, z), end, .25, steel);
        /*
            Signal hanger
        */
        cylinderBetween(end, new THREE.Vector3(end.x, height - 2, end.z), .12, steel);
    }
}

/*
    EXACTLY the requested corners:
    Northeast = (+,+)
    Southwest = (-,-)
*/
trafficPole(22, -22, { x: -21, z: 0 }, { x: 0, z: 21 });
trafficPole(-22, 22, { x: 21, z: 0 }, { x: 0, z: -21 });

/* ============================================================
   SIGNAL HEAD SYSTEM
   ============================================================ */
const signalRegistry = new Map();

const COLORS = {
    red: 0xff1616, yellow: 0xffc400, green: 0x20ed62, fly: 0xffb000, off: 0x16191a
};

/*
    Creates one illuminated lens.
*/
function createLens(color) {
    const material = new THREE.MeshStandardMaterial({
        color: COLORS.off, emissive: 0x000000, emissiveIntensity: 0, roughness: .22, metalness: .05
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(.39, 24, 24), material);
    return mesh;
}

/*
    Signal configurations.
    3 section:
        RED
        YELLOW
        GREEN
    4 section:
        RED
        YELLOW
        GREEN
        ARROW / auxiliary GREEN
    5 section:
        RED
        YELLOW
        GREEN
        YELLOW/arrow
        RED/arrow
*/
function createSignal({
    id, sections, position, rotation = 0, label
}) {
    const group = new THREE.Group();

    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.25, sections * .92 + .5, .72), black);
    housing.castShadow = true;
    group.add(housing);

    let lensTypes;
    if (sections === 3) {
        lensTypes = [
            "red", "yellow", "green"
        ];
    } else if (sections === 4) {
        lensTypes = [
            "red", "yellow", "green", "green"
        ];
    } else {
        lensTypes = [
            "red", "yellow", "green", "yellow", "red"
        ];
    }

    const lenses = [];

    lensTypes.forEach((type, i) => {
        const lens = createLens(COLORS[type]);
        lens.position.set(0, ((sections - 1) * .46)
            - i * .92, .41);
        group.add(lens);
        lenses.push({
            type, mesh: lens
        });
    });

    group.position.copy(position);
    group.rotation.y = rotation;
    scene.add(group);

    const signal = {
        id, sections, label, group, lenses
    };

    signalRegistry.set(id, signal);

    return signal;
}

/* ============================================================
   SIGNAL INSTALLATIONS
   ============================================================ */
/*
    Main-street signals.
    3-section through signals.
    4-section left-turn signals.
*/

/* North approach */
createSignal({
    id: 2, sections: 3, position: new THREE.Vector3(10, 12.3, -18), rotation: Math.PI, label: "North Through 1"
});
createSignal({
    id: 3, sections: 3, position: new THREE.Vector3(5, 12.3, -18), rotation: Math.PI, label: "North Through 2"
});
createSignal({
    id: 4, sections: 4, position: new THREE.Vector3(-10, 12.3, -18), rotation: Math.PI, label: "North Left Turn"
});

/* South approach */
createSignal({
    id: 5, sections: 3, position: new THREE.Vector3(-10, 12.3, 18), rotation: 0, label: "South Through 1"
});
createSignal({
    id: 6, sections: 3, position: new THREE.Vector3(-5, 12.3, 18), rotation: 0, label: "South Through 2"
});

/* East approach */
createSignal({
    id: 7, sections: 3, position: new THREE.Vector3(18, 12.3, -6.5), rotation: Math.PI / 2, label: "East Through 1"
});
createSignal({
    id: 8, sections: 3, position: new THREE.Vector3(18, 12.3, 6.5), rotation: Math.PI / 2, label: "East Through 2"
});
createSignal({
    id: 13, sections: 5, position: new THREE.Vector3(18, 12.3, 0), rotation: Math.PI / 2, label: "East Left Turn"
});

/* West approach */
createSignal({
    id: 9, sections: 3, position: new THREE.Vector3(-18, 12.3, 6.5), rotation: -Math.PI / 2, label: "West Through 1"
});
createSignal({
    id: 10, sections: 3, position: new THREE.Vector3(-18, 12.3, -6.5), rotation: -Math.PI / 2, label: "West Through 2"
});
createSignal({
    id: 15, sections: 5, position: new THREE.Vector3(-18, 12.3, 0), rotation: -Math.PI / 2, label: "West Left Turn"
});

/* ============================================================
   SIGNAL CONTROL
   ============================================================ */
function clearSignal(signal) {
    for (const lens of signal.lenses) {
        lens.mesh.material.color
            .setHex(COLORS.off);
        lens.mesh.material.emissive
            .setHex(0x000000);
        lens.mesh.material
            .emissiveIntensity = 0;
    }
}

function illuminate(signal, requestedState) {
    clearSignal(signal);
    /*
        "fly" is represented by yellow
        with stronger emission. The animation
        below makes it flash.
    */
    const state = requestedState === "fly"
        ? "yellow"
        : requestedState;

    const lens = signal.lenses.find(item =>
        item.type === state);

    if (!lens) {
        return;
    }

    lens.mesh.material.color
        .setHex(COLORS[state]);
    lens.mesh.material.emissive
        .setHex(COLORS[state]);
    lens.mesh.material
        .emissiveIntensity = requestedState === "fly"
            ? 5
            : 4;
}

/*
    Main API.
    This is the function that can receive
    your external signal-control object.
*/
function applySignalState(data) {
    if (!data ||
        !data.phases) {
        console.error("Invalid traffic signal state.", data);
        return false;
    }

    /*
        Everything starts OFF.
    */
    signalRegistry.forEach(clearSignal);

    /*
        Priority order:
        red
        yellow
        green
        fly
        An ID should normally occur in only
        one phase array.
    */
    for (const id of data.phases.red || []) {
        const signal = signalRegistry.get(id);
        if (signal) {
            illuminate(signal, "red");
        }
    }

    for (const id of data.phases.yellow || []) {
        const signal = signalRegistry.get(id);
        if (signal) {
            illuminate(signal, "yellow");
        }
    }

    for (const id of data.phases.green || []) {
        const signal = signalRegistry.get(id);
        if (signal) {
            illuminate(signal, "green");
        }
    }

    for (const id of data.phases.fly || []) {
        const signal = signalRegistry.get(id);
        if (signal) {
            illuminate(signal, "fly");
        }
    }

    updateStatus(data);
    return true;
}

/* ============================================================
   EXTERNAL API
   ============================================================ */
window.applyTrafficSignalState = applySignalState;
window.trafficSignals = signalRegistry;

/* ============================================================
   INITIAL STATE
   ============================================================ */
const initialSignalState = {
    phases: {
        green: [2, 6], yellow: [], red: [3, 4, 7, 8], fly: [13, 15]
    }
};
applySignalState(initialSignalState);

/* ============================================================
   UI
   ============================================================ */
function updateStatus(data) {
    document.getElementById("status").textContent = "G=" +
        JSON.stringify(data.phases.green || []) +
        "  Y=" +
        JSON.stringify(data.phases.yellow || []) +
        "  R=" +
        JSON.stringify(data.phases.red || []) +
        "  F=" +
        JSON.stringify(data.phases.fly || []);
}

document.getElementById("apply").addEventListener("click", () => {
    try {
        const data = JSON.parse(document.getElementById("signalInput").value);
        demoRunning = false;
        applySignalState(data);
    } catch (error) {
        document.getElementById("status").textContent = "JSON error: " +
            error.message;
    }
});

/* ============================================================
   VEHICLES
   ============================================================ */
const vehicles = [];
const vehicleColors = [
    0xc62828, 
    0x1565c0, 
    0xf9a825, 
    0xeceff1, 
    0x212121, 
    0x6a1b9a, 
    0x00897b, 
    0xef6c00
];

function createVehicle(direction, lane, initialPosition) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, .85, 4.3), 
        new THREE.MeshStandardMaterial({
        color: vehicleColors[ Math.floor(Math.random() * vehicleColors.length) ], 
        roughness: .55, 
        metalness: .15
    }));
    body.position.y = .65;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, .65, 2), 
        new THREE.MeshStandardMaterial({
        color: 0x263238, 
        roughness: .2, 
        metalness: .1
    }));

    cabin.position.set(0, 1.18, -.15);
    cabin.castShadow = true;
    group.add(cabin);

    /*
        Wheels
    */
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x101010, roughness: .8
    });

    for (const x of [-.95, .95]) {
        for (const z of [-1.45, 1.45]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .25, 16), wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, .35, z);
            group.add(wheel);
        }
    }

    scene.add(group);

    const vehicle = {
        group, 
        direction, 
        lane, 
        position: initialPosition, 
        speed: 12 + Math.random() * 7
    };

    vehicles.push(vehicle);
    return vehicle;
}

/*
    Right-hand traffic:
    Northbound: +X side of road
    Southbound: -X side
    Eastbound: +Z side
    Westbound: -Z side
*/
function updateVehiclePosition(vehicle) {
    const p = vehicle.position;

    switch(vehicle.direction ){
        case "north":
            vehicle.group.position.set(vehicle.lane, 0, p);
            vehicle.group.rotation.y = 0;
            break;
        case "south":
            vehicle.group.position.set(vehicle.lane, 0, p);
            vehicle.group.rotation.y = Math.PI;
            break;
        case "east":
            vehicle.group.position.set(p, 0, vehicle.lane);
            vehicle.group.rotation.y = Math.PI / 2;
            break;
        default:
            vehicle.group.position.set(p, 0, vehicle.lane);
            vehicle.group.rotation.y = -Math.PI / 2;
    }
}

/* ============================================================
   VEHICLE SIGNAL + FOLLOWING DISTANCE LOGIC
   ============================================================ */

const VEHICLE_LENGTH = 4.3;
const VEHICLE_HALF_LENGTH = VEHICLE_LENGTH / 2;

// Clear distance between the front of one vehicle
// and the rear of the vehicle in front.
const VEHICLE_GAP = 1.5;


/*
    Direction of travel:

    north = increasing position
    south = decreasing position
    east  = increasing position
    west  = decreasing position
*/
function travelSign(direction) {
    return (direction === "north" ||
            direction === "east") ? 1 : -1;
}


/*
    Stop-bar position for each approach.
*/
function stopBarPosition(direction) {
    if (direction === "north") return -22;
    if (direction === "south") return 22;
    if (direction === "east") return -22;
    // west
    return 22;
}


/*
    Determine whether the approach currently has a green signal.
*/
function approachIsGreen(direction) {

    const id =
        direction === "north" ? 2 :
        direction === "south" ? 6 :
        direction === "east"  ? 4 :
        8;

    const signal = signalRegistry.get(id);

    if (!signal) {
        return true;
    }

    return signal.lenses.some(lens =>
        lens.type === "green" &&
        lens.mesh.material.emissiveIntensity > 0
    );
}


/*
    Find the nearest vehicle ahead in the SAME lane
    and traveling in the SAME direction.
*/
function getVehicleAhead(vehicle) {

    const sign = travelSign(vehicle.direction);

    const currentProgress =
        sign * vehicle.position;

    let nearest = null;
    let nearestProgress = Infinity;

    for (const other of vehicles) {

        if (other === vehicle) {
            continue;
        }

        // Must be travelling in the same direction.
        if (other.direction !== vehicle.direction) {
            continue;
        }

        // Must be in the same lane.
        if (Math.abs(other.lane - vehicle.lane) > 0.01) {
            continue;
        }

        const otherProgress =
            sign * other.position;

        /*
            Only consider vehicles that are ahead.
        */
        if (otherProgress > currentProgress &&
            otherProgress < nearestProgress) {

            nearest = other;
            nearestProgress = otherProgress;
        }
    }

    return nearest;
}


/*
    Calculate the maximum position this vehicle is allowed
    to reach.

    The vehicle must obey BOTH:

    1. Red/yellow signal stop position.
    2. Safe following distance behind another vehicle.
*/
function getVehicleProgressLimit(vehicle) {

    const sign = travelSign(vehicle.direction);

    const currentProgress =
        sign * vehicle.position;

    let limit = Infinity;


    /*
        --------------------------------------------------------
        RED / YELLOW LIGHT
        --------------------------------------------------------

        Keep the FRONT of the vehicle behind the stop bar,
        with an additional safety gap.
    */
    if (!approachIsGreen(vehicle.direction)) {

        const stopProgress =
            sign * stopBarPosition(vehicle.direction);

        /*
            Only apply the stop-bar restriction if the vehicle
            has not already passed the stop bar.
        */
        if (currentProgress < stopProgress) {

            const stopTarget =
                stopProgress
                - VEHICLE_HALF_LENGTH
                - VEHICLE_GAP;

            limit = Math.min(
                limit,
                stopTarget
            );
        }
    }


    /*
        --------------------------------------------------------
        VEHICLE FOLLOWING DISTANCE
        --------------------------------------------------------

        Keep this vehicle's FRONT behind the REAR of the
        vehicle ahead by VEHICLE_GAP.
        */
    const ahead = getVehicleAhead(vehicle);

    if (ahead) {

        const aheadProgress =
            sign * ahead.position;

        const followingTarget =
            aheadProgress
            - VEHICLE_LENGTH
            - VEHICLE_GAP;

        limit = Math.min(
            limit,
            followingTarget
        );
    }

    return limit;
}

function shouldStop(vehicle) {
    const p = vehicle.position;

    if (vehicle.direction === "north") {
        return (p > -35 && p < -19 && !approachIsGreen("north"));
    }

    if (vehicle.direction === "south") {
        return (p < 35 && p > 19 && !approachIsGreen("south"));
    }

    if (vehicle.direction === "east") {
        return (p > -35 && p < -19 && !approachIsGreen("east"));
    }

    return (p < 35 && p > 19 && !approachIsGreen("west"));
}

/* ============================================================
   INITIAL TRAFFIC
   ============================================================ */
for (let i = 0;    i < 16;    i++) {
    const directions = ["north", "south", "east", "west"];
    const direction = directions[ i % directions.length ];

    let lane;
    if (direction === "north") { lane = -5;
    } else if (direction === "south") {
        lane = 5;
    } else if (direction === "east") {
        lane = 6.5;
    } else {
        lane = -6.5;
    }

    const position = -150 + (i % 8) * 40;
    const vehicle = createVehicle(direction, lane, position);

    updateVehiclePosition(vehicle);
}

/* ============================================================
   CONTINUOUS VEHICLE SPAWNING
   ============================================================ */
let spawnTimer = 0;
function spawnTraffic(delta) {
    spawnTimer += delta;
    if (spawnTimer < 2.5) {
        return;
    }
    spawnTimer = 0;

    const configurations = [
        ["north", -12.5, -180],
        ["south", 7.5, 180],
        ["east", 7, -180],
        ["west", -1.5, 180]
    ];

    const c = configurations[
        Math.floor(Math.random() * configurations.length)
    ];

    const vehicle = createVehicle(c[0], c[1], c[2]);
    updateVehiclePosition(vehicle);
}

/* ============================================================
   VEHICLE UPDATE
   ============================================================ */
function updateVehicles(delta) {

    for (const vehicle of vehicles) {

        const sign =
            travelSign(vehicle.direction);

        const movement =
            vehicle.speed * delta;

        const currentProgress =
            sign * vehicle.position;

        /*
            Find the maximum safe position.

            This can be limited by:
            - the red/yellow stop bar
            - the vehicle ahead
        */
        const progressLimit =
            getVehicleProgressLimit(vehicle);

        let nextProgress =
            currentProgress + movement;


        /*
            Do not allow the vehicle to move through
            the safe stopping position.
        */
        if (progressLimit !== Infinity) {

            nextProgress =
                Math.min(
                    nextProgress,
                    progressLimit
                );
        }


        /*
            Convert the progress coordinate back
            to the vehicle's actual position.
        */
        vehicle.position =
            sign * nextProgress;


        updateVehiclePosition(vehicle);


        /*
            Recycle vehicles when they leave the scene.
        */
        if (vehicle.position > 190) {

            vehicle.position = -185;

        } else if (vehicle.position < -190) {

            vehicle.position = 185;
        }
    }
}

/* ============================================================
   FLY / FLASHING YELLOW
   ============================================================ */
let flashTimer = 0;
let flashVisible = true;
function updateFlashingSignals(delta) {
    flashTimer += delta;
    if (flashTimer < .45) {
        return;
    }
    flashTimer = 0;
    flashVisible = !flashVisible;

    signalRegistry.forEach(signal => {
        /*
            A signal is in fly mode if one
            of its yellow lenses has the
            yellow emissive material active.
        */
        const isFly = signal.lenses.some(lens =>
            lens.type ===
            "yellow" &&
            lens.mesh.material
                .emissiveIntensity === 5);

        if (!isFly) {
            return;
        }

        const yellowLens = signal.lenses.find(lens =>
            lens.type ===
            "yellow");

        if (!yellowLens) {
            return;
        }

        yellowLens.mesh.material
            .emissiveIntensity = flashVisible
                ? 5
                : 0;
        yellowLens.mesh.material
            .emissive
            .setHex(flashVisible
                ? COLORS.yellow
                : 0x000000);
        yellowLens.mesh.material
            .color
            .setHex(flashVisible
                ? COLORS.yellow
                : COLORS.off);
    });
}

/* ============================================================
   DEMO SIGNAL SEQUENCE
   ============================================================ */
let demoRunning = false;
let demoTimer = 0;
let demoIndex = 0;

const demoStates = [
    {
        phases: { 
            green: [2,6], yellow: [], red: [3,4, 7, 8, 9, 10], fly: [13, 15]
        }
    }, {
        phases: {
            green: [4,8], yellow: [], red: [1,2,3,5,6,7], fly: [14, 16]
        }
    }, {
        phases: {
            green: [1, 5], yellow: [], red: [2, 3, 4, 6,7,8], fly: []
        }
    }, {
        phases: {
            green: [3,7], yellow: [], red: [1,2,4,5,6,8], fly: []
        }
    }
];

function updateDemo(delta) {
    if (!demoRunning) {
        return;
    }

    demoTimer += delta;

    if (demoTimer > 5) {
        demoTimer = 0;
        demoIndex = (demoIndex + 1) % demoStates.length;

        applySignalState(demoStates[
            demoIndex
        ]);
    }
}

document.getElementById("demo").addEventListener("click", () => {
    demoRunning = !demoRunning;
    document.getElementById("demo").textContent = demoRunning ? "Stop Demo" : "Signal Demo";

    if (demoRunning) {
        demoIndex = 0;
        demoTimer = 0;
        applySignalState(demoStates[0]);
    }
});

/* ============================================================
   ENVIRONMENT BUILDINGS
   ============================================================ */
function building(x, z, width, depth, height, color) {
    const material = new THREE.MeshStandardMaterial({
        color, roughness: .9
    });

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

building(-65, -65, 35, 30, 18, 0x667178);
building(65, -65, 30, 35, 25, 0x727d82);
building(-65, 65, 40, 30, 22, 0x697579);
building(65, 65, 35, 40, 16, 0x788287);

/* ============================================================
   STREET LIGHTS (Rotatable)
   ============================================================ */
function streetLight(x, z, a = 0) {
    // 1. Vertical pole remains fixed at (x, z)
    cylinderBetween(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 10, z), .16, steel);

    // 2. Calculate rotated arm endpoint using angle 'a' (in radians)
    const armLength = 2.5;
    const armX = x + armLength * Math.cos(a);
    const armZ = z + armLength * Math.sin(a);

    // Horizontal arm extending in the direction of angle 'a'
    cylinderBetween(new THREE.Vector3(x, 10, z), new THREE.Vector3(armX, 10, armZ), .1, steel);

    // 3. Lamp positioned at the end of the rotated arm
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.32, 16, 16), new THREE.MeshStandardMaterial({
        color: 0xffffd0, emissive: 0xffe9a0, emissiveIntensity: 2
    }));
    lamp.position.set(armX, 9.7, armZ);
    scene.add(lamp);
}

// Example calls with different angles (in radians):
streetLight(20, -32, Math.PI);    // South
streetLight(20, -50, Math.PI);    // South
streetLight(20, -80, Math.PI);    // South

streetLight(20, 32, Math.PI );       // South
streetLight(20, 60, Math.PI );       // South
streetLight(20, 90, Math.PI );       // South

streetLight(-20, -15, 0);         // North
streetLight(-20, -45, 0);         // North
streetLight(-20, -75, 0);         // North

streetLight(-20, 32, 0 );     // North
streetLight(-20, 60, 0 );     // North
streetLight(-20, 90, 0 );     // North



streetLight(-32, -15, Math.PI/2);         // West
streetLight(-50, -15, Math.PI/2);         // West
streetLight(-80, -15, Math.PI/2);         // West

streetLight(32, -15, Math.PI/2);         // West
streetLight(50, -15, Math.PI/2);         // West
streetLight(-80, -15, Math.PI/2);         // West

streetLight(-32, 15, -Math.PI/2 );     // East
streetLight(-50, 15, -Math.PI/2 );     // East
streetLight(-80, 15, -Math.PI/2 );     // East
streetLight(32, 15, -Math.PI/2 );     // East
streetLight(50, 15, -Math.PI/2 );     // East
streetLight(80, 15, -Math.PI/2 );     // East

/* ============================================================
   ANIMATION LOOP
   ============================================================ */
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    // Calculate delta time in seconds
    const currentTime = performance.now();
    const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    updateVehicles(delta);
    spawnTraffic(delta);
    updateDemo(delta);
    updateFlashingSignals(delta);

    controls.update();
    renderer.render(scene, camera);
}

// Start the loop
animate();
/*  ============================================================
    RESIZE
    ============================================================ */

window.addEventListener( "resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
    }
);
