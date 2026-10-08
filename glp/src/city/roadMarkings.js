import * as THREE from "three";

const yellowVertices = [];
const whiteVertices = [];

export function createRoadMarkings(road, points, roadWidth, parent) {
    if (!points || points.length < 2) return;

    const type = classifyRoadMarkings(road);

    if (type === "TWO_WAY_DOUBLE_YELLOW") {
        addSolidLine(points, -0.12, 0.08, yellowVertices);
        addSolidLine(points, 0.12, 0.08, yellowVertices);
    } else if (type === "TWO_WAY_SINGLE_YELLOW") {
        addSolidLine(points, 0, 0.08, yellowVertices);
    } else if (type === "MULTI_LANE_TWO_WAY") {
        addSolidLine(points, 0, 0.08, yellowVertices);
    }
}

export function finishRoadMarkings(parent) {
    console.log("Yellow vertices:", yellowVertices.length);
    if (yellowVertices.length) {
        const geometry = createGeometry(yellowVertices);
        const material = new THREE.MeshBasicMaterial({ color: 0xffd21f, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "YellowRoadMarkings";
        mesh.position.y = 0.18;
        parent.add(mesh);
    }

    yellowVertices.length = 0;
    whiteVertices.length = 0;
}

export function classifyRoadMarkings(road) {
    const lanes = Number.isFinite(Number(road.lanes)) ? Number(road.lanes) : null;
    const oneway = road.oneway === true || road.oneway === -1;

    const majorRoad = road.type === "motorway" || road.type === "trunk" || road.type === "primary" || road.type === "secondary" || road.type === "tertiary";

    if (oneway) return lanes !== null && lanes >= 2 ? "ONE_WAY_MULTI_LANE" : "ONE_WAY";

    if (lanes === null) return majorRoad ? "TWO_WAY_DOUBLE_YELLOW" : "NO_CENTERLINE";

    if (lanes === 2) return majorRoad ? "TWO_WAY_DOUBLE_YELLOW" : "TWO_WAY_SINGLE_YELLOW";

    if (lanes >= 3) return "MULTI_LANE_TWO_WAY";

    return "NO_CENTERLINE";
}

function addSolidLine(points, offset, width, vertices) {
    const halfWidth = width * 0.5;

    for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i][0];
        const z1 = points[i][1];
        const x2 = points[i + 1][0];
        const z2 = points[i + 1][1];

        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);

        if (length < 0.001) continue;

        const nx = -dz / length;
        const nz = dx / length;

        const ox = nx * offset;
        const oz = nz * offset;

        const ax = x1 + ox + nx * halfWidth;
        const az = z1 + oz + nz * halfWidth;
        const bx = x1 + ox - nx * halfWidth;
        const bz = z1 + oz - nz * halfWidth;
        const cx = x2 + ox + nx * halfWidth;
        const cz = z2 + oz + nz * halfWidth;
        const dx2 = x2 + ox - nx * halfWidth;
        const dz2 = z2 + oz - nz * halfWidth;

        vertices.push(ax, 0, az, bx, 0, bz, cx, 0, cz, bx, 0, bz, dx2, 0, dz2, cx, 0, cz);
    }
}

function createGeometry(vertices) {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
}