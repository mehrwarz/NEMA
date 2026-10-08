import * as THREE from "three";

const DEFAULT_BUILDING_HEIGHT = 8;
const DEFAULT_LEVEL_HEIGHT = 3;

export function createBuildings(data, parent) {

    const group = new THREE.Group();
    group.name = "Buildings";

    const material = new THREE.MeshStandardMaterial({
        color: 0xb8b0a4,
        roughness: 0.9,
        metalness: 0
    });

    let count = 0;

    for (const building of data.buildings) {

        if (!Array.isArray(building.geometry)) {
            continue;
        }

        const polygons = normalizePolygons(
            building.geometry
        );

        for (const rings of polygons) {

            if (!rings.length) {
                continue;
            }

            const outerRing = rings[0];

            if (outerRing.length < 3) {
                continue;
            }

            const shape = createShape(
                outerRing
            );

            if (!shape) {
                continue;
            }

            /*
             * Any additional rings are holes.
             */
            for (let i = 1; i < rings.length; i++) {

                const hole =
                    createPath(rings[i]);

                if (hole) {
                    shape.holes.push(hole);
                }
            }

            const height =
                getBuildingHeight(building);

            const geometry =
                new THREE.ExtrudeGeometry(
                    shape,
                    {
                        depth: height,
                        bevelEnabled: false
                    }
                );

            /*
             * Shape coordinates:
             *
             * X = east
             * Y = south
             *
             * Three.js:
             *
             * X = east
             * Y = up
             * Z = south
             *
             * Therefore rotate the shape plane.
             */
            geometry.rotateX(-Math.PI / 2 );

            geometry.computeVertexNormals();

            const mesh =
                new THREE.Mesh(
                    geometry,
                    material
                );

            mesh.name =
                `building-${building.id}`;

            /*
             * Extrusion now extends upward
             * from the ground.
             */
            mesh.position.y = 0;

            group.add(mesh);

            count++;
        }
    }

    parent.add(group);

    console.log(
        `Created ${count} building meshes`
    );

    return group;
}


/*
 * Convert:
 *
 * [
 *   [outer ring],
 *   [hole ring],
 *   ...
 * ]
 *
 * into:
 *
 * [
 *   [
 *      [outer ring],
 *      [hole ring]
 *   ]
 * ]
 *
 * And handle MultiPolygon.
 */
function normalizePolygons(
    geometry
) {

    if (!Array.isArray(geometry)) {
        return [];
    }

    /*
     * Polygon:
     *
     * [
     *   [
     *      [x,z],
     *      ...
     *   ],
     *   [
     *      hole
     *   ]
     * ]
     */
    if (
        geometry.length > 0 &&
        Array.isArray(geometry[0]) &&
        Array.isArray(geometry[0][0]) &&
        typeof geometry[0][0][0] === "number"
    ) {

        return [
            geometry
        ];
    }

    /*
     * MultiPolygon:
     *
     * [
     *   [
     *      [outer],
     *      [hole]
     *   ],
     *   [
     *      [outer]
     *   ]
     * ]
     */
    if (
        geometry.length > 0 &&
        Array.isArray(geometry[0]) &&
        Array.isArray(geometry[0][0]) &&
        Array.isArray(geometry[0][0][0])
    ) {

        return geometry;
    }

    return [];
}


function createShape(points) {

    const shape =
        new THREE.Shape();

    if (!points.length) {
        return null;
    }

    shape.moveTo(
        points[0][0],
        points[0][1]
    );

    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        shape.lineTo(
            points[i][0],
            points[i][1]
        );
    }

    shape.closePath();

    return shape;
}


function createPath(points) {

    if (!points || points.length < 3) {
        return null;
    }

    const path =
        new THREE.Path();

    path.moveTo(
        points[0][0],
        points[0][1]
    );

    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        path.lineTo(
            points[i][0],
            points[i][1]
        );
    }

    path.closePath();

    return path;
}


function getBuildingHeight(
    building
) {

    const height =
        Number(building.height);

    if (
        Number.isFinite(height) &&
        height > 0
    ) {

        return height;
    }

    const levels =
        Number(building.levels);

    if (
        Number.isFinite(levels) &&
        levels > 0
    ) {

        return (
            levels *
            DEFAULT_LEVEL_HEIGHT
        );
    }

    return DEFAULT_BUILDING_HEIGHT;
}