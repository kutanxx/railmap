# Subway entrances, exits, platforms and underground passages: the OSM ecosystem and Western cities

Research date: 2026-10-26. All style source code was read from the current `master` branch of each repository on that date, by downloading the files and searching them. Line numbers refer to that snapshot.

## Q1. OSM data model: how entrances, stations, platforms and passages are tagged

### Takeaway
An entrance is a single **node** tagged `railway=subway_entrance`. The tag can carry `ref` (the exit number), `name` (the exit's own name, not the station's), `wheelchair` and `bicycle`. The entrance is tied to its station through a `public_transport=stop_area` relation. Passages and platforms are tagged separately with `indoor=*`/`level=*`/`highway=*` and `railway=platform`/`public_transport=platform`. No single renderer uses all of these tags together.

### Cited Findings
- `railway=subway_entrance` is "the entrance point of a subway". It is used **on nodes only**, not on ways or areas. The node goes on the way leading into the station (a building entrance or the top of the stairs). Status: approved. — [OSM wiki Tag:railway=subway_entrance](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dsubway_entrance)
- On that page, `name=*` is the **exit's** name, not the station's (the station is linked through the stop_area relation). `ref=*` is optional: "Some subway networks use numbers or codes to identify exits, e.g. "2" or "B1"". Also listed: `wheelchair=yes/no`, `bicycle=yes/no` (default no), and the combination `entrance=*`. — [OSM wiki](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dsubway_entrance)
- Linking to the station: add the entrance node to the `public_transport=stop_area` relation, with an empty role or `entrance`. If it serves several stop_areas, add it to each one. For an entry-only or exit-only entrance, put `oneway=yes` on the way that passes through it. — [OSM wiki](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dsubway_entrance)
- The wiki page has no rules for numbering exits in each country. It does not mention a `level` tag either. — [OSM wiki](https://wiki.openstreetmap.org/wiki/Tag:railway%3Dsubway_entrance)
- Simple Indoor Tagging (SIT) basics:
  - It was first written in 2014 and revised after the 2022 and 2026 indoor workshops. The page was last edited 2026-07-27.
  - Tags: `indoor=room|area|corridor|wall|level`. `level=*` is mandatory ("MANDATORY - The level the indoor element is located on"). The building's level range uses `min_level`, `max_level` and `non_existent_levels`. Signposted floor numbers go in `level:ref`.
  - Stairs and lifts are areas spanning several levels (`level=0;1` or `0-1`). Each floor gets a door node (`door=no` if there is no physical door). Steps are `highway=steps` + `level`, escalators add `conveying=yes`, and lifts are `highway=elevator`.
  - SIT itself does not cover `railway=platform` or subway entrances.
  — [OSM wiki Simple Indoor Tagging](https://wiki.openstreetmap.org/wiki/Simple_Indoor_Tagging)
- Paris case (talk-fr list, Feb 2020):
  - In Île-de-France, "1070 noeuds ont un attribut name, seulement 57 ont un attribut destination" and "266 noeuds sans tag ref".
  - Christian Quest said `ref` does not need to be unique ("ref n'a pas vocation a être unique"). He suggested using `ref` + `destination` + the stop_area name instead of putting the street name in `name`.
  - The private site sortiesdumetro.fr does not have an open licence.
  — [OSM talk-fr 2020-02](https://lists.openstreetmap.org/pipermail/talk-fr/2020-February/096906.html)
- IDFM (Île-de-France Mobilités) publishes an open dataset, "Référentiel des arrêts : Accès" (station accesses). It defines them as the "points de passage obligé" for entering or leaving a stop zone. A separate "Relations accès" dataset links each access to its stop zones. In GTFS they appear in stops.txt with the prefix `IDFM:StopPlaceEntrance:`. The data.gouv page shows a last update of 2026-08-05. I did not confirm the column names, so it is unverified whether the exit number is a separate field. — [data.gouv.fr Référentiel des arrêts : Accès](https://www.data.gouv.fr/datasets/referentiel-des-arrets-acces/community-resources)

### Inferences
- In OSM the global convention is **"number in `ref`, exit name/street in `name` or `destination`"**. Countries with numbered exits (Korea, Japan, Hong Kong, Paris) fill `ref`. Countries that name exits after streets (Berlin, London) only fill `name`. This matches the city conventions in Q3.
- In OSM, passages are mostly drawn as `highway=footway` + `tunnel=yes` + `layer=-1` ways (or `indoor=yes`/`level=-1`). This combination determines whether a passage appears in each renderer (Q2).

### Gaps
- I did not reach live taginfo counts (the wiki page's figures are template placeholders, "$1%"). I could not measure how many entrances carry `ref` or `name`.
- I did not confirm the column names of the IDFM access dataset (whether a sortie number field exists).

## Q2. How OSM-based renderers draw entrances, platforms and passages (zoom levels and colours)

### Takeaway
- **Entrance icons** appear from z15 (OsmAnd), z16 (Organic Maps, OpenRailwayMap) or z18 (OSM Carto).
- **Exit numbers (`ref`)** are shown only by OSM Carto (z19+), OsmAnd (z16+, ref only) and OpenRailwayMap ("name (ref)").
- Organic Maps shows only `name`. OpenMapTiles vector tiles (OpenFreeMap) **drop `ref`**.
- No major renderer **draws underground passages in a dedicated way** beyond "tunnel footway = dashed line".

### Cited Findings

**OSM Carto (openstreetmap.org default) — re-verified**
- In `style/stations.mss`: `[railway = 'subway_entrance'][zoom >= 18]`, `marker-file: symbols/amenity/entrance.svg`, `marker-fill: @transportation-icon`. At `[zoom >= 19]` it adds `text-name: [ref]`, size 10, `text-fill: @transportation-text`, `text-dy: 10`. **Only ref is drawn, not name.** — [openstreetmap-carto style/stations.mss](https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/stations.mss)
- Colours: `@transportation-icon: #0092da` and `@transportation-text: #0066ff`. — [style/amenity-points.mss L5-6](https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/amenity-points.mss)
- Data query: the `stations` layer selects `railway = 'subway_entrance' AND way_area IS NULL` (nodes only) with sort priority 3 (after stations), layer minzoom 12. — [project.mml](https://github.com/gravitystorm/openstreetmap-carto/blob/master/project.mml)
- Station: `railway=station` is drawn with `symbols/square.svg` in `@station-color: #7981b0`. Subway stations are 6px from z14, labelled from z15, and 9px with an 11pt label from z16. — [style/stations.mss](https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/stations.mss)
- Platforms: `@platform-fill: #bbbbbb`.
  - `railway_platform`/`highway_platform` areas get `polygon-fill: @platform-fill` from `[zoom >= 16]`, with a `grey` 2px outline.
  - Linear platforms are a grey 6px line with a #bbbbbb 4px line inside.
  - Platforms tagged `location=underground` are excluded from the query (`railway NOT IN ('platform') OR location NOT IN ('underground')`), so **underground platforms are not drawn**.
  — [style/roads.mss L20, L2286-2296, L3370-3420](https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/roads.mss); [project.mml](https://github.com/gravitystorm/openstreetmap-carto/blob/master/project.mml)
- Passages: tunnel footways/paths (`#tunnels`) get `line-color: @tunnel-casing` (= `grey`) and `line-dasharray: 4,2` as a dashed casing from z14 (z15 if access=no). The fill is the normal footway colour `@footway-fill: salmon`. — [style/roads.mss L57, L700-725](https://github.com/gravitystorm/openstreetmap-carto/blob/master/style/roads.mss)
- The string `corridor` does not appear anywhere in `roads.mss` or `project.mml` → OSM Carto **does not render** `highway=corridor` (indoor corridors). (Confirmed by a grep of the files; deliberately included here as a verified fact.) — [openstreetmap-carto repo](https://github.com/gravitystorm/openstreetmap-carto)

**OpenMapTiles schema (the basis of OpenFreeMap and MapTiler tiles)**
- POI import: `mapping.yaml` lists `subway_entrance` and `train_station_entrance` under the `railway` key. The DB columns include `ref`, `level`, `indoor` and `layer`. — [openmaptiles layers/poi/mapping.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/mapping.yaml)
- POI tile fields: `name, name_en, name_de, class, subclass, rank, agg_stop, level, layer, indoor`. **There is no `ref` field.** Class `entrance` = subclass `['subway_entrance','train_station_entrance']`. — [layers/poi/poi.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/poi.yaml)
  → So `ref` is stored in the database but **never written into the tiles**. This confirms the earlier report: there are no exit numbers in OpenFreeMap tiles.
- POI zoom: in `poi.sql`, z12–13 includes only some features and z14+ includes everything (`zoom_level >= 14 THEN TRUE`). `rank` is a per-grid order (`ORDER BY CASE WHEN name = '' THEN 2000 ELSE poi_class_rank(...)`). `class.sql` gives explicit ranks such as railway 40 and bus 50, but `entrance` is not listed. — [layers/poi/poi.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/poi.sql), [class.sql](https://github.com/openmaptiles/openmaptiles/blob/master/layers/poi/class.sql)
- transportation layer:
  - Class `path` includes `highway: pedestrian, path, footway, cycleway, steps, bridleway, corridor` and `public_transport: platform` (subclass = `platform`).
  - Fields include `brunnel` (bridge/tunnel/ford), `layer`, `level` and `indoor`. `level`/`indoor` are documented as "Experimental feature! Filled only for steps and footways".
  — [layers/transportation/transportation.yaml](https://github.com/openmaptiles/openmaptiles/blob/master/layers/transportation/transportation.yaml)

**OpenFreeMap styles (fetched live)**
- **positron**:
  - There are **no layers** with `source-layer: poi` → subway entrances are **not drawn at all**.
  - `highway_path` draws every `class=path` (no brunnel filter, so tunnel footways and platform lines too) in `rgb(234,234,234)` at 0.9 opacity, 1px at z13 → 10px at z20.
  - Tunnel subways (`class=transit, brunnel=tunnel`) are hidden. Surface transit is #dddddd 3px + #fafafa dashed 2px, from z16.
  — [tiles.openfreemap.org/styles/positron](https://tiles.openfreemap.org/styles/positron)
- **liberty / bright**:
  - `poi_r1` (rank 1–6) starts at z15, `poi_r7` (rank 7–19) at z16, `poi_r20` (rank ≥20) at z17. The icon is `icon-image = class`, so an entrance uses the `entrance` icon. The label is name:latin/nonlatin, text #666.
  - The OpenFreeMap sprite (`ofm_f384/ofm`) contains `entrance`, `entrance_11`, `railway_metro` and other icons.
  - `poi_transit` (class airport/bus/rail) uses text colour `#2e5a80`.
  — [styles/liberty](https://tiles.openfreemap.org/styles/liberty), [styles/bright](https://tiles.openfreemap.org/styles/bright), [sprite ofm.json](https://tiles.openfreemap.org/sprites/ofm_f384/ofm.json)
- **liberty passages**: `tunnel_path_pedestrian` (brunnel=tunnel, class path/pedestrian) is drawn in `hsl(0,0%,100%)` with `line-dasharray [1, 0.75]`, width 0.5 at z14 → 10 at z20. Surface paths use `[1, 0.7]`. **The two look almost the same.** Tunnel subway lines are #bbb plus hatching `[0.2, 8]`. — [styles/liberty](https://tiles.openfreemap.org/styles/liberty)

**OpenRailwayMap (vector version, hiddewie/OpenRailwayMap-vector)**
- Entrance layer `standard_station_entrances`: `minzoom: 16`, `icon-image: 'sdf:general/subway-entrance'`, and `icon-color` = `colors.styles.standard.subway` = **`#0300c3`**. Text is `{label}`, size 11, offset [0, 1.5], `icon-overlap: always`. — [proxy/js/styles.mjs L86, L4410-4450](https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/proxy/js/styles.mjs)
- `label` = `CASE WHEN name AND ref THEN CONCAT(name, ' (', ref, ')') ELSE COALESCE(name, ref)`. In other words, it shows **"exit name (exit number)"**. The import covers both `subway_entrance` and `train_station_entrance` (type subway/train). — [import/sql/tile_views.sql L585-606](https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/import/sql/tile_views.sql), [import/openrailwaymap.lua L1221-1360](https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/import/openrailwaymap.lua)
- Platforms: `railway_platforms_polygon` fill from `minzoom: 15`, colour `colors.styles.standard.platform` = **`#aaa`**. Outlines, line platforms and platform edges are separate layers. Platform labels are drawn too. — [styles.mjs L134, L2249-2340, L4317-](https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/proxy/js/styles.mjs)

**Organic Maps**
- Default: `node|z16-[railway=subway_entrance]` uses `subway-entrance-m.svg`. From z17 the label is `text: name` (13px, @label_dark, light halo), plus `int_name` at 11px. **No `ref` display rule.** — [data/styles/default/include/Subways.mapcss L69-75](https://github.com/organicmaps/organicmaps/blob/master/data/styles/default/include/Subways.mapcss)
- Per-city logo icons, all from z16:
  - london → `subway_entrance-london-s/m.svg`
  - newyork → `subway-newyork-s.svg`
  - paris → `subway-paris-s.svg`
  - berlin/hamburg → `subway-ubahn-s.svg`
  - Also madrid, barcelona, vienna, washington, chicago, boston, and others.
  
  Many cities switch to the larger `-m` icon at z18. In other words, Organic Maps draws entrances with **the city's own metro logo**. — [Subways.mapcss L87-803](https://github.com/organicmaps/organicmaps/blob/master/data/styles/default/include/Subways.mapcss)
- Platforms: area `[public_transport=platform]`/`[railway=platform]` from z16, `fill-color: @platform` = **`#E0D5C0`** (beige). Line platforms are `#2F6499`, 2px at z16 → 4.2px at z19+. — [include/Basemap.mapcss L475-478, L731-741](https://github.com/organicmaps/organicmaps/blob/master/data/styles/default/include/Basemap.mapcss), [light/colors.mapcss L69](https://github.com/organicmaps/organicmaps/blob/master/data/styles/default/light/colors.mapcss)

**OsmAnd (default.render.xml)**
- Icon: `minzoom="15" railway=subway_entrance icon="subway_entrance"`, iconVisibleSize 23. Special cases: `u-bahn=yes` → `subway_germany`, `s-bahn=yes` → `s_bahn`, and `subway_region` → a per-region icon. Otherwise the icon sits on a `blue_square_shield` (a blue square background). — [OsmAnd-resources rendering_styles/default.render.xml L7332-7340](https://github.com/osmandapp/OsmAnd-resources/blob/master/rendering_styles/default.render.xml)
- Text: from `minzoom="16"`, `nameTag="" nameTag2="ref"` → **shows only ref, not name**, 12px bold (13px from z17), `$subwayEntranceTextColor` = **`#834bcf`** (night `#bbe4ff`), white halo. — [default.render.xml L2695-2696, L5584-5587](https://github.com/osmandapp/OsmAnd-resources/blob/master/rendering_styles/default.render.xml)

**Mapbox Streets v8**
- Entrances are carried in the `transit_stop_label` layer as `stop_type: entrance` ("Specific entry points to a station"), with `maki: entrance`. `network` holds values such as `new-york-subway`, `london-underground` and `de-u-bahn`. The layer minzoom is 11, but the zoom at which entrances appear is not documented. There is no entrance-specific ref field.
- In the road layer, `class=path` with `type=corridor` ("An indoors passageway") and `structure=tunnel` exist. Platforms are folded into class `pedestrian`.
- — [Mapbox Streets v8 reference](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/)

### Inferences
- Summary table (from the sources above):

  | Renderer | Entrance icon | Entrance text | Platform | Passage |
  |---|---|---|---|---|
  | OSM Carto | z18, #0092da | ref z19 (#0066ff) | z16 #bbbbbb, underground excluded | tunnel footway = dashed grey casing, corridor not drawn |
  | OsmAnd | z15, blue square | ref only z16 (#834bcf) | separate rules | — |
  | Organic Maps | z16, city logo | name z17 | z16 #E0D5C0 | — |
  | OpenRailwayMap | z16, #0300c3 | "name (ref)" | z15 #aaa | not drawn |
  | OpenFreeMap liberty/bright | rank-dependent z15–17, `entrance` icon | name (no ref) | path class line | white dashed line (almost the same as surface) |
  | OpenFreeMap positron | none | none | grey path line | same grey as surface |

- In OpenMapTiles, an unnamed entrance gets order 2000 in the rank sort and so lands in the `poi_r20` (z17+) bucket. Even a named one has no explicit class rank, so it is likely to land in the z16–17 bucket. (I did not read the default value of `poi_class_rank`, so this is an inference.)
- For our game (a positron basis): the base map has no entrance points at all. If exit numbers are needed, we must draw them ourselves from the game state or from separate OSM data (Overpass). Tiles cannot supply them.

### Gaps
- I did not read the Mapbox Streets / Mapbox Standard zoom levels for drawing entrances, or their colours (the style source is not public).
- I did not check MapTiler's own styles (Streets v2 and others) for entrance rendering.
- In OsmAnd I did not trace the platform colour or the separate tunnel footway rule.
- OpenRailwayMap-vector `standard_station_entrances` is visible only when the `stations` global state is `'station'` (an option), so it may be off by default. I did not check that UI default.

## Q3. Western city exit conventions (number vs name vs unnamed) and passage maps

### Takeaway
- **Paris** numbers every exit (with a street address).
- **Berlin** names exits by street (a 2018 trial of letters A–J at one station).
- **London** signs "Way out" + street, with numbers at some large stations such as Bank.
- **New York** has no numbers or names, only entrance location (corner) and the globe colour (green = open, red = exit-only/restricted).
- **Washington WMATA** uses lettered exits.
- Official maps that **draw passages under the ground** are rare: they are limited to TfL's axonometric 3D station diagrams (released via FOI) and the PATH/RÉSO underground walkway network maps of Toronto and Montreal.

### Cited Findings

**Paris (RATP)**
- The RATP traveller guide (as quoted in search results):
  - Each exit has a number and an address. When space is short, only the number is shown, and you find your exit number on the neighbourhood map (plan du quartier).
  - Signs guiding you to the exits are **always on a blue background**. Routes to major tourist sites use illustrated signs on a brown background.
  - Each platform should have a plan du quartier; if not, there is one in the corridor or at the exit.
  
  (Direct fetch returned 403; the content comes from the search summary.) — [RATP guide voyageur metro-rer](https://www.ratp.fr/visite-paris/francais/guide-voyageur/metro-rer)
- RATP hosts plans de secteur/quartier on its site (PDF downloads). — [ratp.fr/plans-secteur](https://www.ratp.fr/plans-secteur/m)
- Châtelet has 19 exits (secondary tourist guide). Most stations have a plan du quartier on the platform and in the hall. The Bonjour RATP app tells you which exit to use. — [francetravelplanner perfect metro trip](https://francetravelplanner.com/go/paris/trans/ratp/metro/perfect_metro_trip.html)
- I found no official RATP rule for **how** exit numbers are assigned (what counts as exit 1, the order). — (no search result; see Gaps)

**Berlin (BVG)**
- Before 2018, exits were labelled "**only with street names**" + the word "Ausgang".
- On 2018-11-24, Berliner Zeitung reported a trial at U-Bahnhof Stadtmitte (U2/U6): the 10 exits got **letters A–J**, matched to the surrounding-area map (Umgebungsplan). The new signs dropped the word "Ausgang" in favour of an open square + arrow pictogram (the former East German U-Bahn symbol). No decision on extending it to other stations would come until the results were analysed. Tourist testers could not find the overview map.
- — [Berliner Zeitung 2018-11-24](https://www.berliner-zeitung.de/article/bvg-testet-neue-wegweiser-fahrgaeste-suchen-ausgang-vergeblich-47636)
- A blog source (year not stated, so treat as low reliability):
  - "Berlin exit signs are named after streets" (e.g. "Ausgang Dircksenstraße"). Letters are sometimes stencilled next to the sign for staff and lift routing; "The street name is the stable label".
  - BVG station overviews show departures and lifts but "do not publish an exit map".
  — [walkofberlin.com berlin-station-exits](https://www.walkofberlin.com/post/berlin-station-exits)

**London (TfL)**
- TfL signage follows standard S1006 "Signage in the TfL Environment". Its guidance document G006 is dated October 2022. I did not get the text. — [GlobalSpec G006 listing](https://standards.globalspec.com/std/14571697/g006)
- A forum source: ordinary exits are signed "**Way out**", and emergency-exit signs are reserved for designated safety exits (citing the 1989 Fire Precautions (Sub-surface Railway Stations) Regulations). This is a forum post, not an official source. — [railforums.co.uk](https://www.railforums.co.uk/posts/3656327/)
- The "Way Out" wording has been in use since at least 1907 (a Tufnell Park sign in the London Transport Museum collection). — [LT Museum 1993-124](https://www.ltmuseum.co.uk/collections/collections-online/signs/item/1993-124)
- A TfL tech forum thread (via search summary): at Aldgate East, older platform signs read "Way out" + destination, and newer signs show street names and **exit numbers**. — [TfL techforum](https://techforum.tfl.gov.uk/t/station-signage-giving-directions-particularly-exits-signs/2653) (direct fetch 403)
- Bank station has numbered exits. A fan map notes that a single exit number sometimes splits into two staircases, and that "Exit 7 has no roundel" (not official). — [geofftech Bank exit map PDF](https://geofftech.co.uk/members/BankExitMap.pdf)
- Elizabeth line (Liverpool Street): signs above lifts and on platform walls show the exit and connecting services. The Urbanist (2023-06-05) highlights London's practice of giving every lift a number or letter, with placards showing how the lifts connect. — [The Urbanist 2023-06-05](https://www.theurbanist.org/2023/06/05/three-london-station-wayfinding-strategies-sound-transit-should-adopt/)
- **Underground passage drawings**: following an FOI request, TfL released **3D axonometric diagrams** of Tube stations. These show platforms, passages, escalators and exits in 3D, but not to scale (stairs and escalators are drawn steeper than they are). A 2024 FOI request for the Charing Cross diagram suggests the set is still growing. — [Archpaper 2015-08](https://www.archpaper.com/2015/08/open-data-from-transport-for-london-spurs-3d-axonometric-plans-of-the-tube-so-passengers-can-mentally-map-their-next-trip/?amp=1), [disassociated.com](https://disassociated.com/3d-maps-of-all-london-underground-tube-stations/), [WhatDoTheyKnow FOI](https://www.whatdotheyknow.com/request/axonometric_of_bakerloo_line_ex)
- The third-party app Station Master offers 3D station maps with step counts; Tube Exits offers car positions and exit data (paid, community-maintained). — [stationmasterapp.com](https://www.stationmasterapp.com/features.html), [Tube Exits App Store](https://apps.apple.com/gb/app/tube-exits-by-station-master/id886992678)

**New York (MTA)**
- Globe colours: **green** (full or half) = open entrance; **red** = exit-only, closed, or a privately owned easement entrance (an MTA spokesperson). Full and half globes mean the same thing. Half globes were introduced in the mid-1990s for brightness. Historically yellow meant a part-time booth (now discontinued). — [Untapped Cities 2018-04-12](https://untappedcities.com/2018/04/12/cities-101-the-actual-purpose-of-nyc-subway-globes/), [Second Ave Sagas 2012-09-20](https://secondavenuesagas.com/2012/09/20/in-red-and-green-messages-from-the-subway-globes/)
- The official open data "MTA Subway Entrances and Exits: 2024" (data.ny.gov i9wp-a4ja, first published 2024-09-25, modified 2025-12-05):
  - 15 columns, including `stop_name`, `complex_id`, `station_id`, `gtfs_stop_id`, `daytime_routes`, `entrance_type`, `entry_allowed`, `exit_allowed`, and latitude/longitude.
  - **No column for an exit number, exit name or corner.**
  - entrance_type counts over 2,120 rows: Stair 1,629; Easement-Street 164; Station House 112; Elevator 102; Easement-Passage 57; Escalator 18; and others.
  — [data.ny.gov columns.json](https://data.ny.gov/api/views/i9wp-a4ja/columns.json), [catalog.data.gov](https://catalog.data.gov/dataset/mta-subway-entrances-and-exits-2024)
- An older MTA-based layer (NYU archive) had attributes including "nearest street or corner" and entry/exit-only, i.e. **entrances were identified by corner**. — [NYU archive record](https://archive.nyu.edu/handle/2451/34760?mode=full)
- In 2019, Manhattan Community Board 4 asked MTA and DOT for cardinal-direction (N/S/E/W) signs near exits. In 2015 a student put up unofficial signs naming the street at the exit stairs, and MTA treated them as vandalism. — [CB4 letter](https://cbmanhattan.cityofnewyork.us/cb4/wp-content/uploads/sites/10/2020/02/21-TRANS-Letter-to-DOT-and-MTA-re-Wayfinding-Signs.pdf), [DNAinfo 2015-05-07](https://www.dnainfo.com/new-york/20150507/upper-east-side/design-student-aims-improve-subway-stations-by-installing-new-exit-signs/slideshow/613223)

**Other notable cases**
- Washington WMATA: its wayfinding programme uses a **lettered exit** system (for heading to intersections and points of interest). San Francisco Muni Metro added overhead signs that identify exits and where they lead. — [GGWash](https://ggwash.org/view/102779/ways-to-improve-wmata-wayfinding), [SFMTA blog](https://www.sfmta.com/index%2ephp/blog/muni-metro-debuts-new-international-wayfinding-standards)
- Munich MVG deliberately leaves station names off U-Bahn entrances, because the station name does not match the street names on site (search summary; I did not read the source). — [risi.muenchen.de](https://risi.muenchen.de/risi/dokument/v/5956438)
- Toronto PATH: an underground walkway network of 30+ km. The City of Toronto publishes the official PATH map, which connects 6 subway stations and Union Station. — [City of Toronto PATH](https://www.toronto.ca/explore-enjoy/visitor-services/path-torontos-downtown-pedestrian-walkway/)
- Montreal RÉSO: an OSM community project maps it with `level=-2` and similar tags. I found no official map. — [OSM community thread](https://community.openstreetmap.org/t/mapping-the-reso-underground-city/140431)

**Citymapper**
- Citymapper tells riders where to board (front/middle/back) and recommends the best exit in New York and London ("Train Car Exits" in 2019; data partly crowdsourced and imperfect). — [Citymapper NYC tips](https://citymapper.com/news/777/10-citymapper-tools-to-help-you-master-new-york), [Geoawesome](https://geoawesome.com/citymapper-app-will-tell-you-where-to-sit-on-the-tube)

### Inferences
- How the West labels exits, as a spectrum:
  1. **Number + street**: Paris, Bank and other large London stations
  2. **Letter**: WMATA, the 2018 Berlin trial
  3. **Street name only**: most of Berlin and London
  4. **Unnamed**: NYC, identified by location and globe colour
  
  None has the Korea/Japan style of drawing **number badges on the map** as standard practice. Paris shows numbers on the neighbourhood map (plan du quartier), which is the closest equivalent.
- On official street maps, entrances are usually drawn as **small logo icons** (the London roundel, the Paris "M", the Berlin "U"). Organic Maps' per-city logo icons copy this convention.
- Passages connecting entrances to platforms are not drawn on 2D street maps in either official Western maps or OSM-based renderers. They appear only in **separate station diagrams** (TfL axonometric) or in underground network maps (PATH). For a game, drawing passages as thin dashed lines (OSM Carto tunnel style) is the closest precedent.

### Gaps
- I did not find an official RATP rule for **assigning** sortie numbers (the starting point and order).
- I did not find the text of TfL S1006/G006, or whether LU numbers exits as a rule or only at some stations.
- I did not confirm whether the BVG Stadtmitte letter trial (2018) was extended network-wide after 2019.
- I did not reach the MTA's official exit-signage standard (Graphics Standards Manual / the current wayfinding programme), or whether its new signs show the street corner.
- I found no source on whether Citymapper shows "Sortie n" in Paris.
