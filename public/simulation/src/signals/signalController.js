import * as THREE from "three";
const COLORS = {
    red: 0x990000,
    yellow: 0x887000,
    green: 0x008000,
    off: 0x323232,
}

const FLASH_INTERVAL = 500;

export function createSignals(scene, m) {

    // ------------------------------------------------------------
    // Physical signal registry // 
    // signal.id = physical signal head 
    // signal.phase = movement phase controlling that head 
    // ------------------------------------------------------------ 
    const registry = new Map();
    // phase -> physical signal heads 
    const phaseSignals = new Map();
    // Only currently flashing lenses are stored here. 
    const flashingLenses = new Set();
    const statusElement = document.getElementById("status");

    // ------------------------------------------------------------
    // Create one lens
    // ------------------------------------------------------------ 
    function createLens(group, type, x, y) {
        const material = new THREE.MeshStandardMaterial({ color: COLORS.off, emissive: 0x000000, emissiveIntensity: 0, });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 18), material,);
        mesh.position.set(x, y, 0.41);
        mesh.userData.type = type;
        mesh.userData.state = "off";
        mesh.userData.flashOn = false;
        group.add(mesh);
        return {
            type, mesh,
        }
    }
    // ------------------------------------------------------------
    // Register signal to a movement phase 
    // ------------------------------------------------------------ 
    function registerPhaseSignal(phase, signal) {
        if (!phaseSignals.has(phase)) {
            phaseSignals.set(phase, []);
        } phaseSignals.get(phase).push(signal);
    }
    // ------------------------------------------------------------
    // Create one signal head
    // id = physical signal identifier // 
    // phase = movement phase controlling this signal 
    // ------------------------------------------------------------ 

    function add(id, phase, sections, position, rotation, label) {
        const group = new THREE.Group();
        const width = sections === 5 ? 2.55 : 1.25;
        const height = sections === 5 ? 3.25 : sections * 0.92 + 0.5;
        const housing = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.72), m.black,);
        group.add(housing);
        const lenses = [];

        // --------------------------------------------------------//
        // 3 / 4 section head
        // -------------------------------------------------------- 
        if (sections === 3 || sections === 4) {
            const types = sections === 4 ? ["red", "yellow", "green", "fly"] : ["red", "yellow", "green"];
            types.forEach((type, index) => {
                lenses.push(createLens(group, type, 0, (types.length - 1) * 0.46 - index * 0.92,),);
            });
        }
        // --------------------------------------------------------//
        // 5 section head // 
        // RED // 
        // Y-ARROW YELLOW // G-ARROW GREEN 
        // -------------------------------------------------------- 

        else if (sections === 5) {
            const top = 0.95;
            const middle = 0.05;
            const bottom = -0.87;
            const column = 0.58;
            lenses.push(createLens(group, "red", 0, top),);
            // Left column = arrows lenses.push( createLens( group, "yellowArrow", -column, middle, ), );
            lenses.push(createLens(group, "greenArrow", -column, bottom,),);
            // Right column = through lenses.push( createLens( group, "yellow", column, middle, ), );
            lenses.push(createLens(group, "green", column, bottom,),);
        } group.position.copy(position);
        group.rotation.y = rotation;
        scene.add(group);
        const signal = {
            id, phase, sections, group, lenses, label,
        }
        registry.set(id, signal);
        registerPhaseSignal(phase, signal);
        return signal;
    }
    // ============================================================ 
    //  SIGNAL CONFIGURATION // 
    // Each physical signal points to ONE movement phase. // 
    // Multiple signal heads can use the same phase. 
    // ============================================================ 
    add("north-through-1", 2, 3, new THREE.Vector3(10, 12.3, -18), Math.PI, "North Through 1");
    add("north-through-2", 2, 3, new THREE.Vector3(5, 12.3, -18), Math.PI, "North Through 2");
    add("north-left", 1, 4, new THREE.Vector3(-10, 12.3, -18), Math.PI, "North Left");
    add("south-through-1", 6, 3, new THREE.Vector3(-10, 12.3, 18), 0, "South Through 1");
    add("south-through-2", 6, 3, new THREE.Vector3(-5, 12.3, 18), 0, "South Through 2");
    add("south-left", 1, 4, new THREE.Vector3(10, 12.3, 18), 0, "South Left");
    add("east-through", 4, 3, new THREE.Vector3(18, 12.3, -7), Math.PI / 2, "East Through");
    add("east-shared", 14, 5, new THREE.Vector3(18, 12.3, -2), Math.PI / 2, "East Shared",);
    add("west-through", 8, 3, new THREE.Vector3(-18, 12.3, 7), -Math.PI / 2, "West Through");
    add("west-shared", 16, 5, new THREE.Vector3(-18, 12.3, 2), -Math.PI / 2, "West Shared");
    // ============================================================ // 
    // LENS HELPERS // 
    // ============================================================
    function getLens(signal, type) {
        return signal?.lenses.find((lens) => lens.type === type,);
    }
    // ------------------------------------------------------------//
    // Set one lens state
    // ------------------------------------------------------------ 
    function setLensState(lens, state) {
        if (!lens) {
            return;
        } const mesh = lens.mesh;
        // Remove from flashing collection first. 
        flashingLenses.delete(lens);
        mesh.userData.state = state;

        // --------------------------------------------------------//
        // OFF
        // -------------------------------------------------------- 
        if (state === "off") {
            mesh.material.color.setHex(COLORS.off);
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
            mesh.userData.flashOn = false;
            return;
        }
        // --------------------------------------------------------//
        // FLASHING YELLOW
        // -------------------------------------------------------- 
        if (state === "fly") {
            flashingLenses.add(lens);
            mesh.material.color.setHex(COLORS.yellow);
            mesh.material.emissive.setHex(COLORS.yellow);
            mesh.material.emissiveIntensity = 5;
            mesh.userData.flashOn = true;
            return;
        }
        // --------------------------------------------------------//
        // STEADY RED / YELLOW / GREEN
        // -------------------------------------------------------- 
        const color = COLORS[state];
        if (color === undefined) {
            setLensState(lens, "off");
            return;
        } mesh.material.color.setHex(color);
        mesh.material.emissive.setHex(color);
        mesh.material.emissiveIntensity = 4;
        mesh.userData.flashOn = false;
    }
    // ------------------------------------------------------------//
    // Set indication on one physical signal
    // ------------------------------------------------------------ 
    function setIndication(signal, type, state) {
        const lens = getLens(signal, type);
        if (lens) {
            setLensState(lens, state);
        }
    }
    // ------------------------------------------------------------//
    // Turn entire physical signal OFF
    // ------------------------------------------------------------ 
    function clearSignal(signal) {
        if (!signal) {
            return;
        } for (const lens of signal.lenses) {
            setLensState(lens, "off");
        }
    }
    // ============================================================ // 
    // PHASE CONTROL // 
    // ============================================================ // 
    // Normal phase: // 
    // setPhase(2, "green") // 
    // This automatically changes every signal assigned to phase 2. // 
    // 4-section: // 
    // setPhase(1, "fly") // 
    // 5-section: // 
    // setPhase(14, {
    // through: "red", // arrow: "green" // }) // 
    // ============================================================ 
    function setPhase(phase, state) {
        const signals = phaseSignals.get(Number(phase));
        if (!signals) {
            return;
        }
        // --------------------------------------------------------//
        // Simple phase state // 
        // red // yellow // green // fly // off 
        // -------------------------------------------------------- 
        if (typeof state === "string") {
            for (const signal of signals) {
                applySimplePhaseState(signal, state);
            } return;
        }

        // --------------------------------------------------------//
        // Compound 5 - section state
        // -------------------------------------------------------- 
        if (state && typeof state === "object") {
            for (const signal of signals) {
                applyCompoundPhaseState(signal, state);
            }
        }
    }
    // ------------------------------------------------------------//
    // Simple phase state
    // ------------------------------------------------------------ 
    function applySimplePhaseState(signal, state) {
        // 4-section flashing arrow. 
        if (signal.sections === 4 && state === "fly") {
            setIndication(signal, "fly", "fly");
            return;
        }

        // Normal 3/4 section signal. 
        if (state === "red") {
            setIndication(signal, "red", "red");
            return;
        } if (state === "yellow") {
            setIndication(signal, "yellow", "yellow");
            return;
        } if (state === "green") {
            setIndication(signal, "green", "green");
            return;
        } if (state === "off") {
            clearSignal(signal);
        }
    }
    // ------------------------------------------------------------//
    // Compound 5 - section state
    // ------------------------------------------------------------ 
    function applyCompoundPhaseState(signal, state) {
        if (signal.sections !== 5) {
            applySimplePhaseState(signal, state.through || "off",);
            return;
        }

        // Through indication. 
        if (state.through) {
            setIndication(signal, "red", state.through === "red" ? "red" : "off",);
            setIndication(signal, "yellow", state.through === "yellow" ? "yellow" : "off",);
            setIndication(signal, "green", state.through === "green" ? "green" : "off",);
        }

        // Arrow indication. 
        if (state.arrow) {
            if (state.arrow === "green") {
                setIndication(signal, "greenArrow", "green",);
                setIndication(signal, "yellowArrow", "off",);
            } else if (state.arrow === "yellow") {
                setIndication(signal, "yellowArrow", "yellow",);
                setIndication(signal, "greenArrow", "off",);
            } else if (state.arrow === "fly") {
                setIndication(signal, "yellowArrow", "fly",);
                setIndication(signal, "greenArrow", "off",);
            } else if (state.arrow === "off") {
                setIndication(signal, "greenArrow", "off",);
                setIndication(signal, "yellowArrow", "off",);
            }
        }
    }

    // ============================================================ //
    //  APPLY PHASE CONTROLLER STATE //
    // ============================================================ // 
    // Preferred format: // 
    // phases: {
    // 1: "red", // 2: "green", // 4: "green", // 6: "red", // 8: "red", // 14: {
    // through: "red", // arrow: "green" // }, // 16: {
    // through: "red", // arrow: "fly" // } // } // 
    // ============================================================ 
    function apply(data) {
        const phases = data?.phases || {
        }
        for (const [phase, state] of Object.entries(phases)) {
            setPhase(Number(phase), state);
        } updateStatus(phases);
    } // ============================================================ //
    //  STATUS DISPLAY //
    //  ============================================================
    function updateStatus(phases) {
        if (!statusElement) {
            return;
        } const parts = [];
        for (const [phase, state] of Object.entries(phases)) {
            if (typeof state === "string") {
                parts.push(`${phase}=${state}`);
            } else {
                parts.push(`${phase}=` + `${state.through || "off"}/` + `${state.arrow || "off"}`,);
            }
        } statusElement.textContent = parts.join(" | ");
    } // ============================================================ //
    //  FLASHING ARROW UPDATE //
    //  ============================================================
    function updateSignals(now) {
        if (flashingLenses.size === 0) {
            return;
        } const flashOn = Math.floor(now / FLASH_INTERVAL) % 2 === 0;
        for (const lens of flashingLenses) {
            const mesh = lens.mesh;
            // The lens may have stopped flashing. 
            if (mesh.userData.state !== "fly") {
                flashingLenses.delete(lens);
                continue;
            } if (mesh.userData.flashOn === flashOn) {
                continue;
            } mesh.userData.flashOn = flashOn;
            if (flashOn) {
                mesh.material.color.setHex(COLORS.yellow);
                mesh.material.emissive.setHex(COLORS.yellow);
                mesh.material.emissiveIntensity = 5;
            } else {
                mesh.material.color.setHex(COLORS.off);
                mesh.material.emissive.setHex(0x000000);
                mesh.material.emissiveIntensity = 0;
            }
        }
    }

    // ============================================================ //
    //  IS GREEN // 
    // Check whether a movement phase currently has green. //
    //  ============================================================ 

    function isGreen(phase) {
        const signals = phaseSignals.get(Number(phase));
        if (!signals) {
            return false;
        } return signals.some((signal) => signal.lenses.some((lens) => lens.type === "green" && lens.mesh.userData.state === "green",),);
    }

    // ============================================================ //
    //  INITIAL PHASE STATE // 
    // ============================================================ 
    // 
    apply({
        phases: {
            1: "red", 2: "green", 4: "green", 6: "red", 8: "red", 14: {
                through: "red", arrow: "off",
            }, 16: {
                through: "red", arrow: "off",
            },
        },
    });
    // ============================================================ //
    //  PUBLIC API //
    //  ============================================================ 
    // 
    return {
        registry, phaseSignals, apply, setPhase, isGreen, updateSignals, clearSignal,
    }
}