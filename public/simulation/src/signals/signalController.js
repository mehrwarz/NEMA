import * as THREE from "three";

const COLORS = {
  red: 0xff1616,
  yellow: 0xffc400,
  green: 0x20ed62,
  off: 0x16191a,
};
export function createSignals(scene, m) {
  const registry = new Map();
  function add(id, sections, pos, rot, label) {
    const g = new THREE.Group();
    g.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(1.25, sections * 0.92 + 0.5, 0.72),
        m.black,
      ),
    );
    const types =
      sections === 4
        ? ["red", "yellow", "green", "green"]
        : ["red", "yellow", "green"];
    const lenses = [];
    types.forEach((type, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.off,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 18), mat);
      mesh.position.set(0, (types.length - 1) * 0.46 - i * 0.92, 0.41);
      g.add(mesh);
      lenses.push({ type, mesh });
    });
    g.position.copy(pos);
    g.rotation.y = rot;
    scene.add(g);
    registry.set(id, { id, group: g, lenses, label });
  }
  // IDs are deliberately explicit and match the UI/API arrays.
  add(2, 3, new THREE.Vector3(10, 12.3, -18), Math.PI, "North Through");
  add(3, 3, new THREE.Vector3(5, 12.3, -18), Math.PI, "North Through 2");
  add(4, 4, new THREE.Vector3(-10, 12.3, -18), Math.PI, "North Left");
  add(5, 3, new THREE.Vector3(-10, 12.3, 18), 0, "South Through");
  add(6, 3, new THREE.Vector3(-5, 12.3, 18), 0, "South Through 2");
  add(11, 4, new THREE.Vector3(10, 12.3, 18), 0, "South Left");
  add(7, 3, new THREE.Vector3(18, 12.3, -7), Math.PI / 2, "East Through");
  add(8, 3, new THREE.Vector3(18, 12.3, -2), Math.PI / 2, "East Shared");
  add(13, 4, new THREE.Vector3(18, 12.3, 7), Math.PI / 2, "East Left");
  add(9, 3, new THREE.Vector3(-18, 12.3, 7), -Math.PI / 2, "West Through");
  add(10, 3, new THREE.Vector3(-18, 12.3, 2), -Math.PI / 2, "West Shared");
  add(15, 4, new THREE.Vector3(-18, 12.3, -7), -Math.PI / 2, "West Left");
  const groups = {
    north: [2, 3, 4],
    south: [5, 6, 11],
    east: [7, 8, 13],
    west: [9, 10, 15],
  };
  function clear(s) {
    s.lenses.forEach((l) => {
      l.mesh.material.color.setHex(COLORS.off);
      l.mesh.material.emissive.setHex(0);
      l.mesh.material.emissiveIntensity = 0;
      l.mesh.userData.fly = false;
    });
  }
  function light(s, state) {
    clear(s);
    const type = state === "fly" ? "yellow" : state,
      l = s.lenses.find((x) => x.type === type);
    if (!l) return;
    l.mesh.material.color.setHex(COLORS[type]);
    l.mesh.material.emissive.setHex(COLORS[type]);
    l.mesh.material.emissiveIntensity = state === "fly" ? 5 : 4;
    l.mesh.userData.fly = state === "fly";
  }
  function apply(data) {
    registry.forEach(clear);
    for (const k of ["red", "yellow", "green", "fly"])
      for (const id of data?.phases?.[k] || [])
        if (registry.has(id)) light(registry.get(id), k);
    document.getElementById("status").textContent =
      `G=${JSON.stringify(data?.phases?.green || [])} Y=${JSON.stringify(data?.phases?.yellow || [])} R=${JSON.stringify(data?.phases?.red || [])} F=${JSON.stringify(data?.phases?.fly || [])}`;
  }
  function isGreen(d) {
    return (groups[d] || []).some((id) =>
      registry
        .get(id)
        ?.lenses.some(
          (l) => l.type === "green" && l.mesh.material.emissiveIntensity > 0,
        ),
    );
  }
  apply({
    phases: {
      green: [2, 3, 5, 6, 7, 9],
      yellow: [],
      red: [4, 11, 8, 10, 13, 15],
      fly: [],
    },
  });
  return { registry, apply, isGreen };
}
