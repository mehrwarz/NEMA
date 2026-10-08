import * as THREE from "three";

/*
 * ============================================================
 * Traffic Infrastructure
 * ============================================================
 *
 * Renders:
 *
 *   - Traffic signal poles
 *   - Signal heads
 *   - Signal lenses
 *   - Stop signs
 *
 * Coordinate convention used by the current city:
 *
 *   X = east/west
 *   Z = rendered city north/south
 *   Y = up
 *
 * Road coordinates currently require Z inversion,  * therefore signal coordinates use the same conversion.
 *
 * ============================================================
 */

/* ------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------ */

const CONFIG = {
    signal: {
        poleHeight: 5.0, poleRadius: 0.08, headWidth: 0.32, headHeight: 0.95, headDepth: 0.22, lensRadius: 0.085, lensSpacing: 0.27, groundHeight: 0.08
    }, stopSign: {
        poleHeight: 2.4, poleRadius: 0.045, signRadius: 0.35, groundHeight: 0.08
    }

};

/* ------------------------------------------------------------
 * Materials
 * ------------------------------------------------------------ */

const materials = {
    pole: new THREE.MeshStandardMaterial({
        color: 0x202020, roughness: 0.8, metalness: 0.35
    }), signalHousing: new THREE.MeshStandardMaterial({
        color: 0x111111, roughness: 0.75, metalness: 0.1
    }), redOff: new THREE.MeshStandardMaterial({
        color: 0x220000, roughness: 0.7
    }), yellowOff: new THREE.MeshStandardMaterial({
        color: 0x221900, roughness: 0.7
    }), greenOff: new THREE.MeshStandardMaterial({
        color: 0x002200, roughness: 0.7
    }), redOn: new THREE.MeshStandardMaterial({
        color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2
    }), yellowOn: new THREE.MeshStandardMaterial({
        color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2
    }), greenOn: new THREE.MeshStandardMaterial({
        color: 0x00ff33, emissive: 0x00ff33, emissiveIntensity: 2
    }), stopSign: new THREE.MeshStandardMaterial({
        color: 0xff0000, roughness: 0.6
    })
};

/* ============================================================
 * PUBLIC
 * ============================================================ */

export function createTrafficInfrastructure( data, parent) {
    const group = new THREE.Group();

    group.name = "TrafficInfrastructure";

    /*
     * Traffic signals
     */

    const signalsGroup = new THREE.Group();

    signalsGroup.name = "TrafficSignals";

    /*
     * Stop signs
     */

    const stopsGroup = new THREE.Group();

    stopsGroup.name = "StopSigns";

    let signalCount = 0;

    let stopCount = 0;

    /* --------------------------------------------------------
     * Traffic signals
     * -------------------------------------------------------- */

    if ( Array.isArray(data.trafficSignals)
    ) {
        for ( const signal of data.trafficSignals
        ) {
            if ( !Number.isFinite(signal.x) ||
                !Number.isFinite(signal.z)
            ) {
                continue;
            }

            const object = createTrafficSignal( signal
                );

            signalsGroup.add(object);

            signalCount++;
        }
    }

    /* --------------------------------------------------------
     * Stop signs
     * -------------------------------------------------------- */

    if ( Array.isArray(data.stopSigns)
    ) {
        for ( const stop of data.stopSigns
        ) {
            if ( !Number.isFinite(stop.x) ||
                !Number.isFinite(stop.z)
            ) {
                continue;
            }

            const object = createStopSign( stop
                );

            stopsGroup.add(object);

            stopCount++;
        }
    }

    group.add(signalsGroup);

    group.add(stopsGroup);

    parent.add(group);

    console.log( `Created ${signalCount} traffic signals`
    );

    console.log( `Created ${stopCount} stop signs`
    );

    return group;
}

/* ============================================================
 * TRAFFIC SIGNAL
 * ============================================================ */

function createTrafficSignal( signal) {
    const group = new THREE.Group();

    group.name = `traffic-signal-${signal.id}`;

    /*
     * IMPORTANT
     *
     * Your road renderer currently does:
     *
     *     cleanPoint = [x, -z]
     *
     * Therefore traffic infrastructure
     * must use the same transformation.
     */

    const x = signal.x;

    const z = -signal.z;

    group.position.set( x, 0, z
    );

    /*
     * --------------------------------------------------------
     * Pole
     * --------------------------------------------------------
     */

    const poleGeometry = new THREE.CylinderGeometry( CONFIG.signal.poleRadius, CONFIG.signal.poleRadius, CONFIG.signal.poleHeight, 10
        );

    const pole = new THREE.Mesh( poleGeometry, materials.pole
        );

    pole.position.y = CONFIG.signal.poleHeight / 2;

    group.add(pole);

    /*
     * --------------------------------------------------------
     * Signal head
     * --------------------------------------------------------
     *
     * For now we create a standard
     * vertical 3-section signal.
     *
     * Later we can add:
     *
     *   4-section arrow signal
     *   5-section protected/permissive signal
     * --------------------------------------------------------
     */

    const head = createSignalHead();

    head.position.y = CONFIG.signal.poleHeight;

    group.add(head);

    /*
     * Store OSM information directly
     * on the object.
     */

    group.userData = {
        osmId:
            signal.id, name:
            signal.name ?? null, x, z
    };

    return group;
}

/* ============================================================
 * SIGNAL HEAD
 * ============================================================ */

function createSignalHead() {
    const group = new THREE.Group();

    /*
     * Housing
     */

    const housingGeometry = new THREE.BoxGeometry(
            CONFIG.signal.headWidth, CONFIG.signal.headHeight, CONFIG.signal.headDepth
        );

    const housing = new THREE.Mesh( housingGeometry, materials.signalHousing
        );

    group.add(housing);

    /*
     * Lens positions.
     *
     * Three.js Y is vertical.
     */

    const positions = [

        {
            y: CONFIG.signal.lensSpacing, material: materials.redOff
        }, {
            y: 0, material: materials.yellowOff
        }, {
            y: -CONFIG.signal.lensSpacing, material: materials.greenOff
        }
    ];

    for ( const item of positions
    ) {
        const lensGeometry = new THREE.CylinderGeometry(
                CONFIG.signal.lensRadius, CONFIG.signal.lensRadius, 0.035, 16
            );

        const lens = new THREE.Mesh( lensGeometry, item.material
            );

        /*
         * Cylinder default axis is Y.
         *
         * Rotate so lens faces forward
         * along Z.
         */

        lens.rotation.x = Math.PI / 2;

        /*
         * Front face of signal.
         */

        lens.position.set(
            0, item.y, CONFIG.signal.headDepth / 2 +
            0.025
        );

        lens.userData = {
                state:
                    "off"
            };

        group.add(lens);
    }

    return group;
}

/* ============================================================
 * STOP SIGN
 * ============================================================ */

function createStopSign( stop) {
    const group = new THREE.Group();

    group.name = `stop-sign-${stop.id}`;

    const x = stop.x;

    const z = -stop.z;

    group.position.set( x, 0, z
    );

    /*
     * Pole
     */

    const poleGeometry = new THREE.CylinderGeometry(
            CONFIG.stopSign.poleRadius, CONFIG.stopSign.poleRadius, CONFIG.stopSign.poleHeight, 8
        );

    const pole = new THREE.Mesh( poleGeometry, materials.pole
        );

    pole.position.y = CONFIG.stopSign.poleHeight / 2;

    group.add(pole);

    /*
     * Sign
     */

    const signGeometry = new THREE.CylinderGeometry(
            CONFIG.stopSign.signRadius, CONFIG.stopSign.signRadius, 0.04, 8
        );

    const sign = new THREE.Mesh( signGeometry, materials.stopSign
        );

    /*
     * Make octagon vertical.
     */

    sign.rotation.x = Math.PI / 2;

    sign.position.y = CONFIG.stopSign.poleHeight;

    group.add(sign);

    group.userData = {
        osmId:
            stop.id, name:
            stop.name ?? null, x, z
    };

    return group;
}