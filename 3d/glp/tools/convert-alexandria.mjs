#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
/*
 * ============================================================
 * Alexandria OSM → Three.js Converter
 * ============================================================
 *
 * Input: *   alexandria.geojson
 *
 * Output: *   data/alexandria-three.json
 *
 * Coordinates: *   OSM longitude/latitude
 *          ↓
 *   local meters
 *          ↓
 *   Three.js X/Z
 *
 * Three.js: *
 *                  NORTH
 *                    +Z
 *                     ↑
 *
 *       WEST -X  ←────┼────→  +X EAST
 *
 *                     ↓
 *                    -Z
 *                  SOUTH
 *
 * ============================================================
 */
const INPUT_FILE = path.resolve("alexandria.geojson");
const OUTPUT_FILE = path.resolve("data/alexandria-three.json");
const EARTH_RADIUS = 6378137;
/*
 * ------------------------------------------------------------
 * Road types that participate in the traffic simulation.
 * ------------------------------------------------------------
 */
const DRIVEABLE_ROADS = new Set([
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
    "primary",
    "primary_link",
    "secondary",
    "secondary_link",
    "tertiary",
    "tertiary_link",
    "residential",
    "living_street",
    "unclassified",
    "service"
]);
/*
 * These are useful visually but are NOT part of the
 * vehicle road network.
 */
const PEDESTRIAN_ROADS = new Set([
    "footway",
    "path",
    "pedestrian",
    "cycleway",
    "steps"
]);
/*
 * ------------------------------------------------------------
 * Load GeoJSON
 * ------------------------------------------------------------
 */
console.log("Loading:", INPUT_FILE);
if (!fs.existsSync(INPUT_FILE)) {
    console.error(`ERROR: File not found: ${INPUT_FILE}`);
    process.exit(1);
}

const geojson = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf8")
);

if (geojson.type !== "FeatureCollection") {
    console.error("ERROR: Expected GeoJSON FeatureCollection.");
    process.exit(1);
}
console.log(
    `Features found: ${geojson.features.length.toLocaleString()}`
);
/*
 * ------------------------------------------------------------
 * Find geographic bounds
 * ------------------------------------------------------------
 */
let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;

function inspectCoordinates(coords) {
    if (!Array.isArray(coords)) {
        return;
    }
    if ( coords.length >= 2 && typeof coords[0] === "number" && typeof coords[1] === "number" ) {
        const lon = coords[0];
        const lat = coords[1];
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        return;
    }

    for (const child of coords) {
        inspectCoordinates(child);
    }
}

for (const feature of geojson.features) {
    if (!feature.geometry) {
        continue;
    }
    inspectCoordinates(feature.geometry.coordinates);
}
if (
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLon) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
) {
    console.error("ERROR: Could not determine geographic bounds.");
    process.exit(1);
}
console.log();
console.log("Geographic bounds:");
console.log(`  Longitude: ${minLon} → ${maxLon}`);
console.log(`  Latitude: ${minLat} → ${maxLat}`);
/*
 * ------------------------------------------------------------
 * Use center of downloaded data as local origin.
 * ------------------------------------------------------------
 */
const originLon = (minLon + maxLon) / 2;
const originLat = (minLat + maxLat) / 2;
console.log();
console.log("Local coordinate origin:");
console.log(`  Latitude: ${originLat}`);
console.log(`  Longitude: ${originLon}`);
/*
 * ------------------------------------------------------------
 * Geographic → local meters
 * ------------------------------------------------------------
 */
const originLatRad = originLat * Math.PI / 180;
const originLonRad = originLon * Math.PI / 180;
function geoToLocal(lon, lat) {
    const lonRad = lon * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const x = (lonRad - originLonRad) *
        EARTH_RADIUS * Math.cos(originLatRad);
    const z = (latRad - originLatRad) * EARTH_RADIUS;
    return [ Number(x.toFixed(3)), Number(z.toFixed(3)) ];
}

/*
 * ------------------------------------------------------------
 * Geometry helpers
 * ------------------------------------------------------------
 */

function convertLineString(coordinates) {
    return coordinates.map( ([lon, lat]) => geoToLocal(lon, lat)    );
}

function convertPolygon(coordinates) {
    return coordinates.map(
        ring => ring.map( ([lon, lat]) => geoToLocal(lon, lat) )
    );
}
function convertGeometry(geometry) {
    if (!geometry) {
        return null;
    }
    switch (geometry.type) {
        case "Point": return geoToLocal(
                geometry.coordinates[0],
                geometry.coordinates[1]
            );
        case "LineString": return convertLineString(
                geometry.coordinates
            );
        case "MultiLineString": return geometry.coordinates.map(
                convertLineString
            );
        case "Polygon": return convertPolygon(
                geometry.coordinates
            );
        case "MultiPolygon": return geometry.coordinates.map(
                convertPolygon
            );
        default: return null;
    }
}
/*
 * ------------------------------------------------------------
 * Property helpers
 * ------------------------------------------------------------
 */
function getName(properties) {
    if (!properties) {
        return null;
    }
    return (
        properties.name ||
        properties["name:en"] ||
        null
    );
}

function getOneway(value) {
    if (
        value === true ||
        value === "yes" ||
        value === "true" ||
        value === 1 ||
        value === "1"
    ) {
        return true;
    }
    if (value === "-1") {
        return -1;
    }
    return false;
}

function getNumber(value) {
    if (value === undefined || value === null) {
        return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

/*
 * ------------------------------------------------------------
 * Output structure
 * ------------------------------------------------------------
 */
const output = {
    version: 1,
    source: "OpenStreetMap",
    coordinateSystem: "local-meters",
    axis: {
        x: "east",
        y: "up",
        z: "south"
    },
    origin: {
        latitude: Number(originLat.toFixed(8)),
        longitude: Number(originLon.toFixed(8))
    },
    bounds: {
        minLongitude: minLon,
        maxLongitude: maxLon,
        minLatitude: minLat,
        maxLatitude: maxLat
    },
    roads: [],
    pedestrianWays: [],
    trafficSignals: [],
    stopSigns: [],
    buildings: [],
    water: [],
    parks: [],
    railways: [],
    parking: []
};
/*
 * ------------------------------------------------------------
 * Process features
 * ------------------------------------------------------------
 */
let processed = 0;
let skipped = 0;
for (const feature of geojson.features) {
    processed++;
    const geometry = feature.geometry;
    const properties = feature.properties || {};
    if (!geometry) {
        skipped++;
        continue;
    }
    const osmId =
        properties["@id"] ||
        feature.id ||
        null;
    const highway =
        properties.highway || null;
    /*
     * --------------------------------------------------------
     * TRAFFIC SIGNALS
     * --------------------------------------------------------
     */
    if (
        geometry.type === "Point" &&
        highway === "traffic_signals"
    ) {
        const [x, z] = convertGeometry(geometry);
        output.trafficSignals.push({
            id: osmId,
            x,
            z,
            name: getName(properties)
        });
        continue;
    }

    /*
     * --------------------------------------------------------
     * STOP SIGNS
     * --------------------------------------------------------
     */
    if (
        geometry.type === "Point" &&
        highway === "stop"
    ) {
        const [x, z] =
            convertGeometry(geometry);
        output.stopSigns.push({
            id: osmId,
            x,
            z,
            name: getName(properties)
        });
        continue;
    }
    /*
     * --------------------------------------------------------
     * DRIVEABLE ROADS
     * --------------------------------------------------------
     */
    if (
        DRIVEABLE_ROADS.has(highway)
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.roads.push({
            id: osmId,
            name: getName(properties),
            type: highway,
            lanes: getNumber(properties.lanes),
            maxspeed: getNumber(properties.maxspeed),
            oneway: getOneway(properties.oneway),
            bridge: getOneway(properties.bridge),
            tunnel: getOneway(properties.tunnel),
            surface: properties.surface || null,
            geometry: converted
        });
        continue;
    }

    /*
     * --------------------------------------------------------
     * PEDESTRIAN NETWORK
     * --------------------------------------------------------
     */

    if (
        PEDESTRIAN_ROADS.has(highway)
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.pedestrianWays.push({
            id: osmId,
            name: getName(properties),
            type: highway,
            geometry: converted
        });
        continue;
    }
    
    /*
     * --------------------------------------------------------
     * BUILDINGS
     * --------------------------------------------------------
     */
    if (
        properties.building
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.buildings.push({
            id: osmId,
            type: properties.building,
            name: getName(properties),
            levels: getNumber(
                    properties["building:levels"]
                ),
            height: getNumber(
                    properties.height
                ),
            geometry: converted
        });
        continue;
    }
    /*
     * --------------------------------------------------------
     * WATER
     * --------------------------------------------------------
     */
    if (
        properties.natural === "water"
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.water.push({
            id: osmId,
            name: getName(properties),
            geometry: converted
        });
        continue;
    }
    /*
     * --------------------------------------------------------
     * PARKS
     * --------------------------------------------------------
     */
    if (
        properties.leisure === "park" ||
        properties.leisure === "garden" ||
        properties.leisure === "playground" ||
        properties.leisure === "recreation_ground" ||
        properties.leisure === "pitch"
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.parks.push({
            id: osmId,
            name: getName(properties),
            type: properties.leisure,
            geometry: converted
        });
        continue;
    }
    /*
     * --------------------------------------------------------
     * RAILWAYS
     * --------------------------------------------------------
     */
    if (
        properties.railway
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.railways.push({
            id: osmId,
            type: properties.railway,
            name: getName(properties),
            geometry: converted
        });
        continue;
    }
    /*
     * --------------------------------------------------------
     * PARKING
     * --------------------------------------------------------
     */
    if (
        properties.amenity === "parking"
    ) {
        const converted =
            convertGeometry(geometry);
        if (!converted) {
            skipped++;
            continue;
        }
        output.parking.push({
            id: osmId,
            name: getName(properties),
            geometry: converted
        });
        continue;
    }
}
/*
 * ------------------------------------------------------------
 * Metadata
 * ------------------------------------------------------------
 */
output.stats = {
    sourceFeatures: geojson.features.length,
    roads: output.roads.length,
    pedestrianWays: output.pedestrianWays.length,
    trafficSignals: output.trafficSignals.length,
    stopSigns: output.stopSigns.length,
    buildings: output.buildings.length,
    water: output.water.length,
    parks: output.parks.length,
    railways: output.railways.length,
    parking: output.parking.length,
    skipped
};
/*
 * ------------------------------------------------------------
 * Write result
 * ------------------------------------------------------------
 */
fs.mkdirSync(
    path.dirname(OUTPUT_FILE),
    { recursive: true }
);
fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(output)
);
console.log();
console.log("==========================================");
console.log("Conversion complete");
console.log("==========================================");
console.log();
console.log("Output:", OUTPUT_FILE);
console.log();
console.log("Statistics:");
for (const [key, value] of Object.entries(output.stats)) {
    console.log(
        `  ${key.padEnd(20)} ${value.toLocaleString()}`
    );
}
console.log();
console.log("Origin:");
console.log(
    `  latitude  = ${output.origin.latitude}`
);
console.log(
    `  longitude = ${output.origin.longitude}`
);
console.log();
console.log("Done.");
