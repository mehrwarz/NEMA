import * as THREE from "three";

import { CONFIG } from "../../config/simulationConfig.js";

import { travelSign, stopBar, adjacentLanes, chooseMovement, compatible, turnCurve } from "../road/laneManager.js";

const bodyGeo = new THREE.BoxGeometry(2.15, .85, 4.3), 
cabinGeo = new THREE.BoxGeometry(1.65, .65, 2), 
wheelGeo = new THREE.CylinderGeometry(.34, .34, .25, 12);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: .8 }), 
cabinMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: .2 });
const colors = [
    0xc62828, 
    0x1565c0, 
    0xf9a825, 
    0xeceff1, 
    0x212121, 
    0x6a1b9a, 
    0x00897b, 
    0xef6c00
];

export function createVehicle(direction, lane, position) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: colors[(Math.random() * colors.length) | 0], roughness: .55, metalness: .15 }));
    body.position.y = .65;
    body.castShadow = true;
    g.add(body);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.18, -.15);
    cabin.castShadow = true;
    g.add(cabin);
    for (const x of [-.96, .96]) for (const z of [-1.45, 1.45]) {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, .15, z);
        g.add(w)
    }
    return { 
        group: g, 
        direction, 
        lane, 
        movement: chooseMovement(lane), 
        position, 
        speed: CONFIG.vehicle.minSpeed + Math.random() * 5, 
        targetSpeed: CONFIG.vehicle.minSpeed + Math.random() * (CONFIG.vehicle.maxSpeed - CONFIG.vehicle.minSpeed), 
        changing: false, 
        from: null, 
        to: null, 
        laneT: 0, 
        laneCooldown: 0, 
        turning: false, 
        curve: null, 
        curveT: 0, 
        removed: false 
    }
}
export function place(v, offset = v.lane.offset) {
    if (v.direction === "north") {
        v.group.position.set(offset, .45, v.position);
        v.group.rotation.y = 0
    } else if (v.direction === "south") {
        v.group.position.set(offset, .45, v.position);
        v.group.rotation.y = Math.PI
    } else if (v.direction === "east") {
        v.group.position.set(v.position, .45, offset);
        v.group.rotation.y = Math.PI / 2
    } else {
        v.group.position.set(v.position, .45, offset);
        v.group.rotation.y = -Math.PI / 2
    }
}

function ahead(v, vehicles) {
    const s = travelSign(v.direction), p = s * v.position;

    let best = null, d = Infinity;
    for (const o of vehicles) {
        if (o === v || o.removed || o.direction !== v.direction || o.turning) continue;
        const laneDiff = Math.abs(o.lane.offset - v.lane.offset);
        if (laneDiff > .55 && !v.changing) continue;
        const q = s * o.position - p;
        if (q > 0 && q < d) {
            d = q;
            best = o
        }
    }
return best
}

function clearTarget(v, target, vehicles) {
    const s = travelSign(v.direction), p = s * v.position;
    for (const o of vehicles) {
        if (o === v || o.removed || o.direction !== v.direction) continue;
        if (Math.abs(o.lane.offset - target.offset) > .55) continue;
        const q = Math.abs(s * o.position - p);
        if (q < CONFIG.vehicle.length + CONFIG.vehicle.desiredGap + 8) return false
    }
return true
}

function tryLaneChange(v, vehicles) {
    if (v.changing || v.turning || v.laneCooldown > 0 || Math.abs(v.position) > 120) return;
    const front = ahead(v, vehicles);
    if (!front) return;
    const gap = travelSign(v.direction) * (front.position - v.position);
    const closing = (v.speed - front.speed) > 1.2;
    if (gap > CONFIG.vehicle.laneChangeLookAhead || !closing) return;
    for (const target of adjacentLanes(v.direction, v.lane)) {
        if (!target || !compatible(v, target)) continue;
        if (clearTarget(v, target, vehicles)) {
            v.changing = true;
            v.from = v.lane;
            v.to = target;
            v.laneT = 0;
            v.laneCooldown = CONFIG.vehicle.laneChangeCooldown;
            return
        }
    }
}

function progressLimit(v, vehicles, green) {
    const s = travelSign(v.direction), p = s * v.position;
    let limit = Infinity;
    const sb = s * stopBar(v.direction);
    if (!green && p < sb) limit = Math.min(limit, sb - CONFIG.vehicle.length / 2 - CONFIG.vehicle.desiredGap);
    const f = ahead(v, vehicles);
    if (f) {
        const fp = s * f.position;
        limit = Math.min(limit, fp - CONFIG.vehicle.length - CONFIG.vehicle.desiredGap)
    }
return limit
}
export function updateVehicle(v, dt, vehicles, green) {
    if (v.laneCooldown > 0) v.laneCooldown -= dt;
    if (v.turning) {
        v.curveT = Math.min(1, v.curveT + dt * .42);
        const p = v.curve.curve.getPoint(v.curveT), t = v.curve.curve.getTangent(v.curveT);
        v.group.position.copy(p);
        v.group.rotation.y = Math.atan2(t.x, t.z);
        if (v.curveT >= 1) {
            const next = v.curve;
            v.turning = false;
            v.curve = null;
            v.direction = next.nextDirection;
            v.lane = { offset: next.nextLaneOffset, movement: "THROUGH" };
            v.position = v.direction === "north" || v.direction === "south" ? next.nextDirection === "north" ? 42 : -42 : next.nextDirection === "east" ? 42 : -42;
            place(v)
        }
return
    }
    tryLaneChange(v, vehicles);
    const s = travelSign(v.direction), p = s * v.position, lim = progressLimit(v, vehicles, green);
    const front = ahead(v, vehicles);
    if (front) {
        const gap = s * (front.position - v.position) - CONFIG.vehicle.length;
        if (gap < CONFIG.vehicle.desiredGap * 2.5) v.speed = Math.max(0, v.speed - CONFIG.vehicle.braking * dt);
        else v.speed = Math.min(v.targetSpeed, v.speed + CONFIG.vehicle.acceleration * dt)
    } else v.speed = Math.min(v.targetSpeed, v.speed + CONFIG.vehicle.acceleration * dt);
    const next = Math.min(p + v.speed * dt, lim);
    v.position = s * next;

    if (v.changing) {
        v.laneT = Math.min(1, v.laneT + dt / CONFIG.vehicle.laneChangeDuration);
        const k = v.laneT * v.laneT * (3 - 2 * v.laneT);
        place(v, THREE.MathUtils.lerp(v.from.offset, v.to.offset, k));
        if (v.laneT >= 1) {
            v.lane = v.to;
            v.from = v.to = null;
            v.changing = false
        }
    } else place(v);

    if (v.movement === "LEFT" && !v.changing && Math.abs(v.position) < CONFIG.road.intersectionHalf) {
        v.turning = true;
        v.curve = turnCurve(v.direction, v.lane.offset);
        v.curveT = 0
    }
}
