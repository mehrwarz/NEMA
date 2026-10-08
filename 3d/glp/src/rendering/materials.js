import * as THREE from "three";


export function createMaterials() {

    return {

        ground:
            new THREE.MeshStandardMaterial({
                color: 0x66745c,
                roughness: 1
            }),


        road:
            new THREE.MeshStandardMaterial({
                color: 0x303030,
                roughness: 0.95
            }),


        building:
            new THREE.MeshStandardMaterial({
                color: 0xb8b0a4,
                roughness: 0.9
            }),


        park:
            new THREE.MeshStandardMaterial({
                color: 0x5f8a55,
                roughness: 1
            }),


        water:
            new THREE.MeshStandardMaterial({
                color: 0x4d8fb8,
                roughness: 0.25,
                metalness: 0.05
            }),


        railway:
            new THREE.LineBasicMaterial({
                color: 0x252525
            })
    };
}