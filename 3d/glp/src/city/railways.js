import * as THREE from "three";


export function createRailways(
    data,
    parent
) {

    const group =
        new THREE.Group();

    group.name =
        "Railways";


    const material =
        new THREE.LineBasicMaterial({
            color: 0x252525
        });


    let count = 0;


    for (
        const railway of data.railways
    ) {

        if (
            !Array.isArray(
                railway.geometry
            )
        ) {
            continue;
        }


        if (
            railway.geometry.length < 2
        ) {
            continue;
        }


        const points =
            railway.geometry.map(
                point =>
                    new THREE.Vector3(
                        point[0],
                        0.10,
                        point[1]
                    )
            );


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const line =
            new THREE.Line(
                geometry,
                material
            );


        line.name =
            `railway-${railway.id}`;


        group.add(line);

        count++;
    }


    parent.add(group);


    console.log(
        `Created ${count} railway lines`
    );


    return group;
}