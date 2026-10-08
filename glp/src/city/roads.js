import * as THREE from "three";
import { createRoadMarkings, finishRoadMarkings } from "./roadMarkings.js";

const ROAD_WIDTHS = { motorway: 18, motorway_link: 8, trunk: 15, trunk_link: 8, primary: 12, primary_link: 7, secondary: 10, secondary_link: 7, tertiary: 8, tertiary_link: 6, residential: 6, living_street: 5, unclassified: 5, service: 4 };
const MIN_SEGMENT_LENGTH = 0.001;

export function createRoads(data, parent) {
    const group = new THREE.Group();
    group.name = "Roads";
    if (!data || !Array.isArray(data.roads)) {
        console.warn("createRoads(): data.roads is missing");
        parent.add(group);
        return group;
    }

    let count = 0;

    for (const road of data.roads) {
        if (!Array.isArray(road.geometry) || road.geometry.length < 2) continue;

        const points = cleanRoadPoints(road.geometry);
        if (points.length < 2) continue;

        const width = ROAD_WIDTHS[road.type] ?? 5;
        const geometry = createRoadGeometry(points, width);
        if (!geometry) continue;

        const mesh = new THREE.Mesh(geometry, createRoadMaterial(road));
        mesh.name = `road-${road.id}`;
        mesh.position.y = 0.08;
        group.add(mesh);

        createRoadMarkings(road, points, width, group);
        count++;
    }

    finishRoadMarkings(group);
    parent.add(group);
    console.log(`Created ${count} road meshes`);
    return group;
}

function cleanRoadPoints(points) {
    const cleaned = [];
    let previous = null;

    for (const point of points) {
        if (!Array.isArray(point) || point.length < 2) continue;

        const x = Number(point[0]);
        const z = Number(point[1]);
        if (!Number.isFinite(x) || !Number.isFinite(z)) continue;

        const cleanPoint = [x, -z];

        if (previous && Math.hypot(cleanPoint[0] - previous[0], cleanPoint[1] - previous[1]) < MIN_SEGMENT_LENGTH) continue;

        cleaned.push(cleanPoint);
        previous = cleanPoint;
    }

    return cleaned;
}

function createRoadMaterial(road) {
    let color = 0x303030;

    switch (road.type) {
        case "motorway":
        case "trunk":
            color = 0x292929;
            break;
        case "primary":
        case "secondary":
            color = 0x303030;
            break;
        case "tertiary":
            color = 0x323232;
            break;
        case "residential":
        case "living_street":
            color = 0x353535;
            break;
        case "service":
            color = 0x3b3b3b;
            break;
        case "unclassified":
            color = 0x343434;
            break;
    }

    return new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
}

function createRoadGeometry(points, width) {
    if (points.length < 2) return null;

    const halfWidth = width * 0.5;
    const vertices = new Float32Array(points.length * 6);
    const indices = new Uint32Array((points.length - 1) * 6);

    for (let i = 0; i < points.length; i++) {
        const direction = getPointDirection(points, i);
        if (!direction) return null;

        const nx = -direction.z;
        const nz = direction.x;
        const x = points[i][0];
        const z = points[i][1];
        const v = i * 6;

        vertices[v] = x + nx * halfWidth;
        vertices[v + 1] = 0;
        vertices[v + 2] = z + nz * halfWidth;
        vertices[v + 3] = x - nx * halfWidth;
        vertices[v + 4] = 0;
        vertices[v + 5] = z - nz * halfWidth;
    }

    for (let i = 0; i < points.length - 1; i++) {
        const left = i * 2;
        const right = left + 1;
        const nextLeft = left + 2;
        const nextRight = right + 2;
        const j = i * 6;

        indices[j] = left;
        indices[j + 1] = nextLeft;
        indices[j + 2] = right;
        indices[j + 3] = right;
        indices[j + 4] = nextLeft;
        indices[j + 5] = nextRight;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
}

function getPointDirection(points, index) {
    let dx = 0;
    let dz = 0;

    if (index === 0) {
        dx = points[1][0] - points[0][0];
        dz = points[1][1] - points[0][1];
    } else if (index === points.length - 1) {
        dx = points[index][0] - points[index - 1][0];
        dz = points[index][1] - points[index - 1][1];
    } else {
        const previous = points[index - 1];
        const current = points[index];
        const next = points[index + 1];

        const dx1 = current[0] - previous[0];
        const dz1 = current[1] - previous[1];
        const dx2 = next[0] - current[0];
        const dz2 = next[1] - current[1];

        const length1 = Math.hypot(dx1, dz1);
        const length2 = Math.hypot(dx2, dz2);

        if (length1 > MIN_SEGMENT_LENGTH) {
            dx += dx1 / length1;
            dz += dz1 / length1;
        }

        if (length2 > MIN_SEGMENT_LENGTH) {
            dx += dx2 / length2;
            dz += dz2 / length2;
        }
    }

    const length = Math.hypot(dx, dz);
    if (length < MIN_SEGMENT_LENGTH) return null;

    return { x: dx / length, z: dz / length };
}