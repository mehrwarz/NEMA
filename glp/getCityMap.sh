#!/usr/bin/env bash

set -euo pipefail

CITY="Alexandria, Virginia"

OVERPASS_URL="https://overpass-api.de/api/interpreter"

RAW_OSM="alexandria_raw.json"
GEOJSON="alexandria.geojson"

QUERY_FILE="alexandria_overpass.txt"

echo
echo "=========================================="
echo " Alexandria, Virginia - OSM Downloader"
echo "=========================================="
echo

echo "Writing Overpass query..."

cat > "$QUERY_FILE" <<'EOF'
[out:json][timeout:300];

/*
 * City of Alexandria, Virginia
 *
 * OSM relation:
 * 206637
 *
 * Select the exact administrative area rather
 * than searching globally for "Alexandria".
 */

rel(206637);
map_to_area->.searchArea;

(
  /*
   * ============================
   * ROADS
   * ============================
   */

  way
    ["highway"~"motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|service"]
    (area.searchArea);

  /*
   * ============================
   * PEDESTRIAN NETWORK
   * ============================
   */

  way
    ["highway"~"footway|path|pedestrian|cycleway|steps"]
    (area.searchArea);

  /*
   * ============================
   * BUILDINGS
   * ============================
   */

  way
    ["building"]
    (area.searchArea);

  relation
    ["building"]
    (area.searchArea);

  /*
   * ============================
   * PARKING
   * ============================
   */

  way
    ["amenity"="parking"]
    (area.searchArea);

  /*
   * ============================
   * PARKS / GREEN AREAS
   * ============================
   */

  way
    ["leisure"~"park|garden|playground|recreation_ground|pitch"]
    (area.searchArea);

  relation
    ["leisure"~"park|garden|playground|recreation_ground|pitch"]
    (area.searchArea);

  /*
   * ============================
   * WATER
   * ============================
   */

  way
    ["natural"~"water|wetland"]
    (area.searchArea);

  relation
    ["natural"~"water|wetland"]
    (area.searchArea);

  /*
   * ============================
   * RAILWAYS
   * ============================
   */

  way
    ["railway"~"rail|light_rail|subway|tram"]
    (area.searchArea);

  /*
   * ============================
   * TRAFFIC SIGNALS
   * ============================
   */

  node
    ["highway"="traffic_signals"]
    (area.searchArea);

  /*
   * ============================
   * STOP SIGNS
   * ============================
   */

  node
    ["highway"="stop"]
    (area.searchArea);
);

out body;
>;
out skel qt;
EOF

echo "Downloading Alexandria OSM data..."
echo

curl \
    --fail \
    --show-error \
    --location \
    --retry 3 \
    --connect-timeout 20 \
    --max-time 600 \
    -H "User-Agent: AlexandriaThreeJSMap/1.0 (OpenStreetMap data downloader)" \
    -H "Referer: https://www.openstreetmap.org/" \
    --data-binary @"$QUERY_FILE" \
    "$OVERPASS_URL" \
    -o "$RAW_OSM"

echo
echo "Download completed."

if [[ ! -s "$RAW_OSM" ]]; then
    echo "ERROR: OSM file is empty."
    exit 1
fi

if ! head -c 100 "$RAW_OSM" | grep -q '"version"'; then
    echo "ERROR: Overpass did not return valid OSM JSON."
    echo
    head -n 20 "$RAW_OSM"
    exit 1
fi

echo "Converting OSM → GeoJSON..."

osmtogeojson "$RAW_OSM" > "$GEOJSON"

if [[ ! -s "$GEOJSON" ]]; then
    echo "ERROR: GeoJSON conversion failed."
    exit 1
fi

echo
echo "=========================================="
echo " SUCCESS"
echo "=========================================="
echo
echo "OSM:     $RAW_OSM"
echo "GeoJSON: $GEOJSON"
echo

rm -f "$QUERY_FILE"

echo "Done."