import * as THREE from "three";


export function createWater(
    data,
    parent
) {

    const group =
        new THREE.Group();

    group.name =
        "Water";


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x4d8fb8,
            roughness: 0.25,
            metalness: 0.05
        });


    let count = 0;


    for (const water of data.water) {

        if (
            !Array.isArray(
                water.geometry
            )
        ) {
            continue;
        }


        const polygons =
            normalizePolygons(
                water.geometry
            );


        for (const rings of polygons) {

            if (!rings.length) {
                continue;
            }


            const shape =
                createShape(
                    rings[0]
                );


            if (!shape) {
                continue;
            }


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
                0.03;


            mesh.name =
                `water-${water.id}`;


            group.add(mesh);

            count++;
        }
    }


    parent.add(group);


    console.log(
        `Created ${count} water meshes`
    );


    return group;
}


function normalizePolygons(
    geometry
) {

    if (!Array.isArray(geometry)) {
        return [];
    }


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

    if (!points || points.length < 3) {
        return null;
    }


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