export function setupControls(signals) {
    let demo = false, timer = 0, index = 0; const states = [
        { phases: { 
            green: [2, 6,], 
            yellow: [], 
            red: [1, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 16], 
            fly: [13, 15] } 
        },
        { phases: { 
            green: [4, 8], 
            yellow: [], 
            red: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 15], 
            fly: [14, 16] }
        },
        { phases: { 
            green: [3, 7], 
            yellow: [], 
            red: [1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16], 
            fly: [] }
        },
        { phases: { 
            green: [1, 5], 
            yellow: [], 
            red: [2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 
            fly: [] 
        } }
    ];
    document.getElementById("apply").onclick = () => { try { demo = false; signals.apply(JSON.parse(document.getElementById("signalInput").value)) } catch (e) { document.getElementById("status").textContent = "JSON error: " + e.message } };
    document.getElementById("demo").onclick = () => { demo = !demo; document.getElementById("demo").textContent = demo ? "Stop Demo" : "Signal Demo"; timer = 0; index = 0; if (demo) signals.apply(states[0]) }; return { update(dt) { if (!demo) return; timer += dt; if (timer >= 5) { timer = 0; index = (index + 1) % states.length; signals.apply(states[index]) } } }
}


