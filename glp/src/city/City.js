import * as THREE from "three";

import { createRoads } from "./roads.js";
import { createBuildings } from "./buildings.js";
import { createParks } from "./parks.js";
import { createWater } from "./water.js";
import { createRailways } from "./railways.js";
import {
    createTrafficInfrastructure
} from "./trafficInfrastructure.js";


export class City {

    constructor() {

        this.data = null;

        this.group = new THREE.Group();

        this.group.name = "Alexandria";
    }


    async load(scene, url) {

        console.log(
            "Loading Alexandria:",
            url
        );

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Failed to load ${url}: ${response.status}`
            );
        }

        this.data =
            await response.json();


        console.log(
            "Alexandria data loaded",
            this.data.stats
        );


        scene.add(this.group);


        // -------------------------------
        // City layers
        // -------------------------------

        createParks(
            this.data,
            this.group
        );

        createWater(
            this.data,
            this.group
        );

        createRoads(
            this.data,
            this.group
        );

        createRailways(
            this.data,
            this.group
        );

        createBuildings(
            this.data,
            this.group
        );

        createTrafficInfrastructure(
            this.data,
            this.group
        );


        console.log(
            "Alexandria city created."
        );
    }
}