import fs from "node:fs";

const file = "alexandria.geojson";

const geojson = JSON.parse(
    fs.readFileSync(file, "utf8")
);

let bad = [];

function inspect(coords, feature) {
    if (!Array.isArray(coords)) return;

    if (
        coords.length >= 2 &&
        typeof coords[0] === "number" &&
        typeof coords[1] === "number"
    ) {
        const lon = coords[0];
        const lat = coords[1];

        // Alexandria, VA approximate safety envelope.
        //
        // This is intentionally generous so we can identify
        // obviously unrelated geometry.
        if (
            lon < -78.5 ||
            lon > -76.5 ||
            lat < 37.5 ||
            lat > 39.5
        ) {
            bad.push({
                id: feature.id ?? null,
                osmId: feature.properties?.["@id"] ?? null,
                name: feature.properties?.name ?? null,
                highway: feature.properties?.highway ?? null,
                building: feature.properties?.building ?? null,
                natural: feature.properties?.natural ?? null,
                leisure: feature.properties?.leisure ?? null,
                lon,
                lat
            });
        }

        return;
    }

    for (const child of coords) {
        inspect(child, feature);
    }
}

for (const feature of geojson.features) {
    if (!feature.geometry) continue;

    inspect(
        feature.geometry.coordinates,
        feature
    );
}

console.log(`Out-of-range coordinate count: ${bad.length}`);

for (const item of bad.slice(0, 100)) {
    console.log(JSON.stringify(item));
}

