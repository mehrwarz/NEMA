import * as THREE from "three";


export function createParks(
    data,
    parent
) {

    const group =
        new THREE.Group();

    group.name =
        "Parks";


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x5f8a55,
            roughness: 1
        });


    let count = 0;


    for (const park of data.parks) {

        if (
            !Array.isArray(
                park.geometry
            )
        ) {
            continue;
        }


        const polygons =
            normalizePolygons(
                park.geometry
            );


        for (const rings of polygons) {

            if (!rings.length) {
                continue;
            }


            const outer =
                rings[0];


            if (outer.length < 3) {
                continue;
            }


            const shape =
                createShape(outer);


            if (!shape) {
                continue;
            }


            /*
             * Preserve holes.
             */
            for (
                let i = 1;
                i < rings.length;
                i++
            ) {

                const hole =
                    createPath(
                        rings[i]
                    );

                if (hole) {
                    shape.holes.push(hole);
                }
            }


            const geometry =
                new THREE.ShapeGeometry(
                    shape
                );


            geometry.rotateX(
                -Math.PI / 2
            );


            const mesh =
                new THREE.Mesh(
                    geometry,
                    material
                );


            mesh.position.y =
                0.02;


            mesh.name =
                `park-${park.id}`;


            group.add(mesh);

            count++;
        }
    }


    parent.add(group);


    console.log(
        `Created ${count} park meshes`
    );


    return group;
}


function normalizePolygons(
    geometry
) {

    if (!Array.isArray(geometry)) {
        return [];
    }


    /*
     * Polygon.
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
     * MultiPolygon.
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

    if (points.length < 3) {
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