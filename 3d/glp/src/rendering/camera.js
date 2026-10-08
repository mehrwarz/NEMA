import * as THREE from "three";


export function createCamera() {

    const camera =  new THREE.PerspectiveCamera(55, window.innerWidth /window.innerHeight, 1, 100000);

    camera.position.set(0 , 1500, 0);
    camera.lookAt(-4500,0,5000);

    return camera;
}