# Station & platform geometry: what OSM / OpenFreeMap tiles give us, and how to draw curved platforms in MapLibre

Scope: (A) which OSM features describe stations/platforms, which of them survive into the OpenMapTiles schema served by OpenFreeMap, and how well Seoul is mapped; (B) practical MapLibre GL JS + Turf.js techniques to draw a platform that follows the player's own curved track. Research date: 2026-10-26. Project context: 레일맵 uses maplibre-gl 6.16.0 and @turf/turf 7.4.0 (read from `C:\projects\railmap\node_modules\*/package.json`).

Method note: besides docs, I fetched the live OpenFreeMap TileJSON and decoded real z11–z14 vector tiles around five Seoul stations (서울역, 강남, 잠실, 신도림, 홍대입구) with `@mapbox/vector-tile` from the project's node_modules, and queried Geofabrik's South-Korea taginfo API. Overpass API was at capacity (HTTP 502/504 on three endpoints), so no Seoul-only polygon counts.

## Q1. Which OSM features describe stations and platforms?

### Takeaway
OSM has three overlapping schemes: legacy `railway=station|halt|platform|subway_entrance`, PTv2 `public_transport=station|platform|stop_position` grouped by `stop_area` relations, and building footprints `building=train_station`. Platforms are preferably mapped as closed areas (`railway=platform` + `area=yes`), usually double-tagged with `public_transport=platform`.

### Cited Findings
- `railway=platform`: an area drawn around the platform perimeter is "the preferred, more detailed method"; a single way along the platform centre is also acceptable. `area=yes` is required when mapped as an area; optional tags include `ref`, `name`, `width` (for linear ways), `wheelchair`; mode flags like `subway=yes`; `public_transport=platform` is listed as a combinable tag — [OSM wiki Tag:railway=platform](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dplatform)
- The railway=platform wiki page says nothing specific about `level`, `layer`, `covered` or underground subway platforms — [OSM wiki Tag:railway=platform](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dplatform)
- PTv2: `public_transport=platform` is where passengers wait and can be a node, way or area; `public_transport=stop_position` is a node on the vehicle's way; a `type=public_transport` + `public_transport=stop_area` relation groups stop positions (role `stop`) and platforms (role `platform`) — [OSM wiki Key:public_transport](https://wiki.openstreetmap.org/wiki/Key:public_transport)
- In South Korea, `public_transport=station` is commonly combined with `railway=station` (1,335 of 2,463 objects), `subway=yes` (700), `train=yes` (651), and `building` (398) — [Geofabrik taginfo South Korea, public_transport=station combinations](https://taginfo.geofabrik.de/asia:south-korea/tags/public_transport=station#combinations)

### Inferences
- A game that wants "real" platform shapes would need the platform areas (railway=platform/public_transport=platform polygons), not the station point; the station point/area only gives a label anchor.

### Gaps
- Did not verify the exact PTv2 wiki text on `public_transport=station` (the fetched Key:public_transport page only covered platform/stop_position/stop_area).

## Q2. What station/platform geometry is in the OpenMapTiles schema served by OpenFreeMap (layers, zooms, attributes)?

### Takeaway
OpenFreeMap serves OpenMapTiles schema v3.16.0, max zoom 14. Stations arrive only as **points** in the `poi` layer (class `railway`, subclass `station`/`subway`/`halt`), subway entrances as attribute-poor points (class `entrance`), and platforms as `transportation` features `class=path, subclass=platform` (lines and polygons) — but only those tagged `public_transport=platform`, and **underground platform polygons (layer < 0) are dropped**. There is no station footprint attribute: station buildings are indistinguishable in the `building` layer. The `positron` style does not draw POIs at all and only draws platforms as thin path lines.

### Cited Findings
**OpenFreeMap itself**
- OpenFreeMap generates tiles by running a planet extract through Planetiler with the OpenMapTiles schema; planet is regenerated weekly — [OpenFreeMap GitHub README](https://github.com/hyperknot/openfreemap)
- Live TileJSON: `"version": "3.16.0"`, `minzoom 0`, `maxzoom 14`, tiles at `.../planet/20261018_080001_pt/{z}/{x}/{y}.pbf`; layer zoom ranges: `building` 13–14, `poi` 11–14, `transportation` 4–14, `transportation_name` 6–14, `aerodrome_label` 8–14 — [OpenFreeMap TileJSON](https://tiles.openfreemap.org/planet)
- TileJSON fields: `poi` = agg_stop, class, indoor, layer, level, rank, subclass (+ name:*); `building` = colour, hide_3d, render_height, render_min_height (no type/class); `transportation` includes brunnel, class, subclass, layer, level, indoor, service — [OpenFreeMap TileJSON](https://tiles.openfreemap.org/planet)
- Latest OpenMapTiles release is v3.16 (published 2025-12-18) — [GitHub API, openmaptiles releases/latest](https://api.github.com/repos/openmaptiles/openmaptiles/releases/latest)

**transportation layer (rails & platforms)**
- Rail classes: `railway_class()` maps rail, narrow_gauge, preserved, funicular → `rail`; subway, light_rail, monorail, tram → `transit` — [openmaptiles transportation/class.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/class.sql)
- Imported railway values: rail, narrow_gauge, preserved, funicular, subway, light_rail, monorail, tram; columns kept include layer, level, indoor, service, usage — [openmaptiles transportation/mapping.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/mapping.yaml)
- Platform mapping: `class: path` includes `public_transport: platform`; `subclass` includes `platform` (value of `public_transport`). `public_transport=platform` is imported both into `highway_linestring` and `highway_polygon`; **`railway=platform` and `highway=platform` are not in the mapping** — [transportation.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/transportation.yaml); [mapping.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/mapping.yaml)
- `level` and `indoor` in transportation are "experimental and filled only for steps and footways" — [transportation.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/transportation.yaml)
- Railway zoom filters in the reference SQL: z8–9 only `rail` with `usage=main`; z10 adds narrow_gauge; z11–13 add light_rail; subway/tram/monorail and `service=*` tracks only at z14 — [openmaptiles transportation.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/transportation.sql)
- Area polygons from `osm_highway_polygon` appear at z13+ only `WHERE ... (is_area AND COALESCE(layer, 0) >= 0)` — i.e. polygons with negative `layer` are excluded — [transportation.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/transportation.sql)

**poi layer (stations & entrances)**
- Railway POI source values: halt, station, subway_entrance, train_station_entrance, tram_stop; class `railway` = (`station` with mapping_key railway) or subclass halt/tram_stop/subway; class `entrance` = subway_entrance/train_station_entrance — [poi/mapping.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/mapping.yaml); [poi/poi.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/poi.yaml)
- `railway=station` + `station=subway` is rewritten to subclass `subway` — [poi/update_poi_point.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/update_poi_point.sql)
- POI zooms (reference SQL): z12–13 only railway stations, halts, ferry terminals; everything at z14; station polygons are included in the poi layer (as POIs) from z12 — [poi/poi.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/poi.sql)
- `agg_stop` is experimental, "indicates main platform of public transport stops", grouped by `uic_ref` which "is not used worldwide" — [poi.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/poi.yaml)
- `railway` POIs have class rank 40 (only hospital ranks higher, 20) — [poi/class.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/class.sql)

**building layer**
- "All OSM Buildings… All building tags are imported"; only `location:underground` buildings excluded; output fields are only render_height, render_min_height, colour, hide_3d — [building/building.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/building/building.yaml)

**Direct inspection of OpenFreeMap tiles (Seoul, build 20261018)**
- z14 tile around 서울역 ([14/13970/6345](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13970/6345.pbf)): poi points `subway` 서울역 ×3, `station` 서울 / 서울역, plus 시청 with `level=-3, layer=-2`; 89 `subway_entrance` points whose only properties were `class`, `subclass`, `rank` (no name/ref); transportation: 8 platform polygons (layer unset or 1), 1 platform LineString `brunnel=tunnel layer=-2`, 1 surface platform line; subway lines as `transit/subway` tunnels at layer −2/−3.
- z14 강남 ([14/13973/6348](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13973/6348.pbf)): 11 station points (논현, 신논현, 강남, 역삼, 선릉…), 65 entrances, **only one platform feature (a surface line), zero platform polygons**, subway tunnels at layer −1/−2.
- z14 잠실 ([14/13976/6347](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13976/6347.pbf)): 2 platform polygons, 1 platform line; subway tunnels and an elevated `monorail` bridge.
- z14 신도림 ([14/13966/6348](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13966/6348.pbf)): 13 platform polygons (layer unset/1/2 — the above-ground Line 1/Line 2 platforms).
- z14 홍대입구 ([14/13968/6345](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13968/6345.pbf)): 2 platform polygons, 1 platform line.
- `transportation_name` had **no** rail/transit/platform names in any of the five tiles (same tiles as above).
- Zoom behaviour observed: z11 Seoul tile has no `poi` layer; z12 tiles do contain subway station points (366 railway POI hits across the sample tiles); z13 tiles contain platform polygons but **no `transit/subway` lines** (only `rail`); `transit/subway` lines appear at z14; buildings start at z13 — [z11](https://tiles.openfreemap.org/planet/20261018_080001_pt/11/1746/793.pbf), [z12](https://tiles.openfreemap.org/planet/20261018_080001_pt/12/3492/1586.pbf), [z13](https://tiles.openfreemap.org/planet/20261018_080001_pt/13/6985/3172.pbf)

**positron style**
- OpenFreeMap positron has **no layer using source-layer `poi`**; platforms (class `path`) are only drawn by the generic `highway_path` line layer; `railway` (class rail, no service) from minzoom 13, `railway_transit` (class transit, excluding tunnels) from minzoom 16; `building` from minzoom 12 — [OpenFreeMap positron style JSON](https://tiles.openfreemap.org/styles/positron)

### Inferences
- Subway stations show at z12–13 in the actual Planetiler-built tiles even though a literal reading of the reference SQL (station filter checked after the `subway` rewrite) suggests z14 only — Planetiler's port evidently differs slightly; trust the tiles, not the SQL, for OpenFreeMap.
- Because underground platform *polygons* are filtered out (layer < 0) and only `public_transport=platform` is imported, most Seoul subway platforms (which are underground) will be absent or appear only as tunnel lines. Real platform shapes from tiles are therefore not a reliable source for a "station footprint" in 레일맵; the game should draw its own platforms (Part B), and at most use tile POIs as name/position hints.
- Exit numbers of 출입구 (OSM `ref`) are not delivered in OpenFreeMap tiles; numbered exits would require a separate data source (e.g. a pre-extracted GeoJSON from OSM, with ODbL attribution).
- Building footprints of station buildings can't be told apart from other buildings in tiles (no `building` type field).
- Max zoom 14 means everything at z15+ is overzoomed z14 geometry (simplification fixed at z14 detail).

### Gaps
- Did not check whether Planetiler-openmaptiles has its own deviations documented (e.g. exact poi zoom rules) — behaviour above is from observed tiles only.
- Did not verify whether the `landuse` layer exposes `landuse=railway` areas (station yards) in Seoul tiles.

## Q3. How well are Seoul/Korean stations, platforms and entrances mapped in OSM?

### Takeaway
Korea's station points and subway entrances are well mapped (4,500 entrances, 99 % with exit-number `ref`), but platform geometry is partial (~1,300 railway=platform objects nationwide, 80 % areas; `level` essentially unused, `layer` on 13 %). Subway lines in Seoul carry `layer` −1…−6 in tunnels.

### Cited Findings (Geofabrik taginfo South Korea, data until 2026-10-25)
- `railway=platform`: 1,320 objects (3 nodes, 1,303 ways, 14 relations) — [taginfo railway=platform](https://taginfo.geofabrik.de/asia:south-korea/tags/railway=platform)
- Of railway=platform: 96.1 % also `public_transport=platform`; 80.8 % `area=yes`; 68.9 % `ref` (platform numbers 1/2/3/4…); 47.3 % `subway=yes`; 33 % `train=yes`; 31 % operator 한국철도공사; `layer` 13.2 %; a combinations query for `level` returned no rows — [taginfo railway=platform combinations](https://taginfo.geofabrik.de/asia:south-korea/tags/railway=platform#combinations)
- `public_transport=platform`: 104,832 objects, 103,021 of them nodes (mostly bus stops) and 1,763 ways — [taginfo public_transport=platform](https://taginfo.geofabrik.de/asia:south-korea/tags/public_transport=platform)
- `railway=station`: 1,341 (1,316 nodes, 24 ways); `station=subway`: 713 (676 nodes); `public_transport=station`: 2,463 (1,930 nodes, 525 ways); `building=train_station`: 697 (682 ways); `railway=subway` ways: 2,243 — [taginfo railway=station](https://taginfo.geofabrik.de/asia:south-korea/tags/railway=station), [station=subway](https://taginfo.geofabrik.de/asia:south-korea/tags/station=subway), [public_transport=station](https://taginfo.geofabrik.de/asia:south-korea/tags/public_transport=station), [building=train_station](https://taginfo.geofabrik.de/asia:south-korea/tags/building=train_station)
- `railway=subway_entrance`: 4,500 nodes; 99.2 % have `ref` (exit numbers: ref=1 ×955, 2 ×876, 3 ×685…); 90 % `description`, 82 % `description:en`; 19 % `wheelchair` — [taginfo railway=subway_entrance combinations](https://taginfo.geofabrik.de/asia:south-korea/tags/railway=subway_entrance#combinations)
- Station names: `public_transport=station` objects have name:ko on 1,760 and name:en on 1,796; operators include 서울교통공사 (263) and 한국철도공사 (593) — [taginfo public_transport=station combinations](https://taginfo.geofabrik.de/asia:south-korea/tags/public_transport=station#combinations)
- In tiles, Seoul subway tunnels carry layer −1…−6 and some station POIs carry level/layer (e.g. 시청 level −3 / layer −2) — [OpenFreeMap tile 14/13970/6345](https://tiles.openfreemap.org/planet/20261018_080001_pt/14/13970/6345.pbf)

### Inferences
- With ~620 subway-flagged platforms nationwide vs. hundreds of Seoul-area subway stations each having ≥2 platform faces, many subway platforms are likely unmapped or mapped only as lines; above-ground Korail platforms (신도림, 서울역) are better covered than deep subway ones (강남 had none in the tile).
- For 레일맵, OSM station points (poi, z12+) and entrance points (z14) are usable as decorative hints, but player-drawn platforms are the only consistent source of platform shapes.

### Gaps
- No Seoul-only (KR-11) counts: Overpass endpoints overpass-api.de, overpass.kumi.systems and maps.mail.ru all returned 502/504 during research.
- Couldn't measure what fraction of Seoul stations have any platform mapped.

## Q4. How to draw a platform that follows the player's curved track (MapLibre + Turf)?

### Takeaway
Slice the track with `turf.lineSliceAlong` around the station (e.g. ±80 m for a 160 m platform), then either (a) draw the slice as a thick line whose width is converted from metres to pixels with an exponential-base-2 zoom expression (cheapest, recommended), (b) build a polygon by offsetting the slice to both sides and joining them, or (c) `turf.buffer` it (heaviest, rounded ends). All of these only need recomputing when a track/station changes, never per frame.

### Cited Findings
- `lineSliceAlong(line, startDist, stopDist, {units})` returns the part of a line between two distances along it — [Turf lineSliceAlong](https://turfjs.org/docs/api/lineSliceAlong)
- `lineOffset(line, distance, {units})` "Takes a line and returns a line at offset by the specified distance"; distance may be negative (other side); default units kilometers — [Turf lineOffset](https://turfjs.org/docs/api/lineOffset)
- Turf 7.4 lineOffset implementation: converts the distance to degrees (`lengthToDegrees`) and offsets each segment in raw lon/lat space, joining consecutive offset segments at their intersection point (no miter limit) — [@turf/line-offset source (local copy `node_modules/@turf/line-offset/dist/esm/index.js`)](https://github.com/Turfjs/turf/blob/master/packages/turf-line-offset/index.ts)
- `buffer(geojson, radius, {units, steps})`, steps default 8; negative radius may produce invalid geometry — [Turf buffer](https://turfjs.org/docs/api/buffer). Turf 7.4's buffer depends on `@turf/jsts` and `d3-geo` (from installed package.json) — [@turf/buffer package](https://github.com/Turfjs/turf/tree/master/packages/turf-buffer)
- MapLibre `line-width`, `line-gap-width`, `line-offset` are all in **pixels**, range [0, ∞) with no stated maximum; they support zoom `interpolate` and data-driven expressions; `line-offset` positive = right of line direction; `line-join` default `miter` (`line-miter-limit` default 2 converts sharp miters to bevels), `round` joins available; `line-cap` default `butt` — [MapLibre style spec, layers](https://maplibre.org/maplibre-style-spec/layers/)
- No MapLibre line/fill property uses metres (metres only appear in fill-extrusion height/base) — [MapLibre style spec, layers](https://maplibre.org/maplibre-style-spec/layers/)
- Metre-width technique endorsed by a Mapbox maintainer: `["interpolate", ["exponential", 2], ["zoom"], 0, ["*", ["get","line_width"], ["^",2,-16]], 24, ["*", ["get","line_width"], ["^",2,8]]]` — width doubles each zoom; a later comment notes accuracy depends on latitude and proposes multiplying by cos(latitude) — [mapbox-gl-js issue #5861](https://github.com/mapbox/mapbox-gl-js/issues/5861)
- Metres per pixel S = C·cos(lat)/2^(z+8) with C = 40,075,016.686 m for 256-px tiles; MapLibre/Mapbox GL use 512-px tiles, so their zoom is one less (S = C·cos(lat)/2^(z+9)) — [OSM wiki Zoom levels](https://wiki.openstreetmap.org/wiki/Zoom_levels)
- Another project's approach: width/offset in metres = metres / `map.metersPerPixel` measured at viewport centre (approximation away from centre) — [OpenStreetBrowser blog v4.7](https://blog.openstreetbrowser.org/node/77)

### Inferences (worked numbers for 레일맵, computed from the OSM-wiki formula)
- Seoul (lat 37.55°, cos = 0.7928): MapLibre m/px ≈ 15.15 (z12), 3.79 (z14), 0.95 (z16), 0.24 (z18), 0.059 (z20). A 40 m-wide platform is ≈ 2.6 px @z12, 10.6 px @z14, 42 px @z16, 169 px @z18, 676 px @z20.
- Expression for a fixed metre width W (Seoul latitude baked in): `['interpolate', ['exponential', 2], ['zoom'], 10, W * 0.016501, 22, W * 67.59]` (factor = 2^(z+9)/(C·cos 37.55°): 0.0165 px/m at z10, 67.59 px/m at z22). With a per-feature width use `['*', ['get','width_m'], factor]` in each stop. Error from using one latitude across Seoul (37.4°–37.7°) is ≈0.4 % (cos 0.7944 vs 0.7912). Put the latitude/constant in `config.js`.
- Option (a) thick line: one `line` layer (plus a slightly wider casing layer underneath for the #1F3A55 outline, as the track already does) on a GeoJSON source of platform slices; `line-cap: butt` gives square platform ends, `line-join: round` avoids miter spikes on curves. Cheapest: no polygon math, the GPU tessellates.
- Option (b) offset polygon: `lineOffset(slice, +w/2)` + reversed `lineOffset(slice, −w/2)` + close ring → `fill` layer. Caveat from the source code: because Turf offsets in degrees, an east–west offset at 37.5° N is shrunk by cos(lat) (≈21 % too narrow for a north–south track) — either scale the distance or project to metres first (e.g. `turf.toMercator` → offset → `toWgs84`, still needs cos-lat correction) or write a small local-metre offset. Unclamped intersection joins can spike on sharp bends.
- Option (c) buffer: `turf.buffer(slice, w/2, {units:'meters'})` gives correct widths and rounded ends (needs `steps`), but runs JSTS per station; fine when computed once per station edit (~50 calls), not acceptable inside the animation frame. Rounded ends look unlike a platform unless trimmed.
- Existing project approach (160 m × 40 m rotated rectangle polygons at z ≥ 14) cannot bend; replacing the rectangle with option (a) keeps one GeoJSON source and one layer pair, so draw-call count does not grow.

### Gaps
- Did not benchmark Turf buffer vs lineOffset times in this project.
- No authoritative statement found on a practical upper limit for very large pixel line widths in MapLibre (spec says none).

## Q5. Several parallel platforms (transfer / multi-track stations) and pitfalls

### Takeaway
Use one platform feature per platform face with a per-feature offset in metres (data-driven `line-offset` with the same exponential-2 zoom scaling), or pre-offset geometries in Turf. Main pitfalls: pixel units, offset distortion on tight curves, latitude dependence, butt caps at slice ends, and recomputing geometry per frame.

### Cited Findings
- `line-offset` supports data-driven and zoom-interpolated values; positive offsets to the right of the line direction, negative to the left — [MapLibre style spec, layers](https://maplibre.org/maplibre-style-spec/layers/)
- MapLibre GL JS v6.12.0 fixed "`line-offset` distorting the line width around joins" (#8570) — [maplibre-gl-js v6.12.0 release notes](https://newreleases.io/project/github/maplibre/maplibre-gl-js/release/v6.12.0). 레일맵 has 6.16.0 installed (local package.json), so the fix is included.
- A MapLibre issue (#4160, May 2024) reports vector-tile lines with `line-offset` getting clipped — [maplibre-gl-js issues](https://fr.github.com/maplibre/maplibre-gl-js/issues) (seen via search summary only; not opened)
- `line-sort-key` orders features within a layer (higher key drawn on top) — [MapLibre style spec, layers](https://maplibre.org/maplibre-style-spec/layers/)
- Interpolate stops may contain data expressions with `["get", ...]` while `["zoom"]` is the interpolate input (pattern from) — [mapbox-gl-js issue #5861](https://github.com/mapbox/mapbox-gl-js/issues/5861)

### Inferences
- Parallel platforms: store `offset_m` per platform feature (e.g. side platforms at ±(track gap/2 + platform width/2), island platform at 0 between two tracks offset ±gap/2) and use `'line-offset': ['interpolate',['exponential',2],['zoom'],10,['*',['get','offset_m'],0.016501],22,['*',['get','offset_m'],67.59]]` with the same constant as `line-width`. Offset direction depends on the slice's coordinate order — keep slices oriented consistently with the track.
- On curves, an offset line on the inside of a bend is shorter and can self-intersect/loop if the offset exceeds the curve radius; for 레일맵's track minimum radii (hundreds of metres) and offsets of ~10–30 m this should be fine, but very sharp player-drawn corners will show artifacts — enforce a minimum curve radius or fall back to round joins.
- Pixel-offset lines (line-offset) are recomputed by the GPU every frame at no JS cost, whereas Turf-offset geometry must be regenerated only when tracks change — both scale fine to 50 stations × 2–4 platforms (≤200 features).
- Performance rules for ~50 stations / ~30 trains: keep platforms in one static GeoJSON source updated with `setData` only on edits; keep trains in their own source updated per frame (already a project rule); avoid Turf buffer/lineOffset inside `requestAnimationFrame`; avoid separate layers per station.
- Zoom handoff: at z < 14 the project uses rotated icons; with metre-based widths a 40 m platform is only ~2.6 px at z12, so a min-pixel clamp (e.g. stop value never below 3 px) or the existing icon swap is needed for legibility.
- Labels: tile POIs (`poi` class railway) are not drawn by positron, so they will not clash with the game's own 말풍선 labels unless the style is changed to show them.

### Gaps
- Did not open MapLibre issue #4160 directly; its relevance to GeoJSON sources (vs vector tiles) is unverified.
- No direct test of line-offset rendering on very tight curves in MapLibre 6.16.
