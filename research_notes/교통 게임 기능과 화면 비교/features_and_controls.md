# Building features and controls (UX) in transit/rail games and transit-map tools

Scope note: research done 2026-10-26. Coverage is uneven. Subway Builder (detailed official changelog), OpenTTD (official wiki), NIMBY Rails (Wikipedia, devblog, wiki) and Railway Empire 2 (patch notes) have primary sources. Mini Metro, Mini Motorways, Transport Fever 2 and Cities: Skylines 2 rely mostly on Steam forum posts and third-party guides, many of them old (2014–2023). MetroDreamin' has no official help page; the only "how-to" found is a community-made demo map hosted on the site. Rail Route and Station to Station have only press/review coverage. No usable source was found for Cities: Skylines 1 metro tool details beyond one dev diary line.

레일맵 baseline used for the "lacks" comparisons: select / place-station / track / route tools; click station → waypoints → station to draw track with cost tooltip and orange dashed preview; drag waypoint handles, double-click to delete waypoints; drag selected station to move (move fee); routes as ordered station lists with insert/remove; 6 line colors; train count +/-; undo/redo; autosave + JSON export/import; 500 m catchment circle preview; station/track/route stat panels; map callout notifications.

## 1. Drawing tracks/lines: click vs drag, curves, snapping, auto-routing, elevation, cost preview

### Takeaway
Two families exist: (a) abstract "drag from station to station" (Mini Metro, MetroDreamin', CS2's line tool that auto-lays track between two picked stations) and (b) engineering editors with explicit nodes, curves, elevation keys and live readouts (Subway Builder, NIMBY Rails, Transport Fever 2, OpenTTD). The richer games converge on: live length/radius/cost readout while drawing, a modifier key for straight lines, keys to change elevation mid-draw, and the ability to reshape a drawn-but-unbuilt ("blueprint") track. 레일맵 already has click-waypoints + cost tooltip + draggable handles; it lacks straight-line modifier, elevation/tunnel/bridge choice, curve-radius feedback, and a plan/blueprint stage.

### Cited Findings
**Mini Metro / abstract drawing**
- Lines are built by tapping/dragging from station to station; dragging from an isolated station to an existing station creates a new route — [SuperCheats controls](https://www.supercheats.com/mini-metro/walkthrough/controls); [Gigazine](https://www.gigazine.net/gsc_news/en/20140306-mini-metro)

**Cities: Skylines 2**
- Metro track can be placed manually with chosen elevation, or the subway line tool lets you "select two stations and it automatically connects them using tracks"; trains cannot take tight turns on hand-laid track — [GuideStrats CS metro guide](https://guidestrats.com/cities-skylines-metros/)

**Subway Builder (beta Oct 2025, v1.0 Feb 10 2026, Steam Jul 17 2026; developer Colin Miller)** — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Flow is "start with stations, then add tracks" — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- Hold Shift to force straight track (v1.2.0, 2026-03-05); curved stations and "modified Euler-curve" track drawing (v1.2.0 / v1.7.0, 2026-08-30) — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Track length and curve radius shown while drawing (v1.7.0) — [changelog](https://www.subwaybuilder.com/changelog)
- Nodes on blueprint (planned, not yet built) track can be moved to reshape it (v1.7.0) — [changelog](https://www.subwaybuilder.com/changelog)
- Page Up / Page Down change elevation in build mode (v0.10.0, 2025-12-04); elevation categories include elevated, at-grade, multiple tunnel depths, plus "trenched" and "ramp" (v1.4.0, 2026-05-29); tunnel boring machine, portal and ramp costs (v1.4.0) — [changelog](https://www.subwaybuilder.com/changelog); [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Developer frames construction choice as trade-offs: "tunnels, viaducts, cut-and-cover, all have trade offs" — [subwaybuilder.com](https://www.subwaybuilder.com/)
- Traffic-light icon flags grade conflicts in blueprint tracks (v1.7.2, 2026-09-29); G cycles lane (track) counts — [changelog](https://www.subwaybuilder.com/changelog)
- Right-click cancels track drawing — [changelog](https://www.subwaybuilder.com/changelog)
- Annotations tool for planning before building (v1.3.0, 2026-04-08); save/load blueprints (v1.7.0) — [changelog](https://www.subwaybuilder.com/changelog)

**NIMBY Rails (Carlos Carrasco; Early Access 26 Jan 2021; whole-world OpenStreetMap map)** — [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)
- Each track segment has one control point; node mode switchable between Point and Tangent; tracks can attach as branches or parallel tracks; parallel tracks set by offset (0–1000 m), flipped with F — [NIMBY Rails wiki: Track](https://wiki.nimbyrails.com/Track)
- Hovering over existing track snaps the new track to it and shows a branch icon — [NIMBY Rails wiki: Track](https://wiki.nimbyrails.com/Track)
- Developer chose no general snapping because tracks laid in blueprint mode can be moved freely afterward ("snapping is not an option"); signal tool does auto-snap to valid positions — [NIMBY Rails devblog](https://carloscarrasco.com/page/51/)
- Automatic aids can be disabled so the player controls every track, signal and building individually — [Steam store page](https://store.steampowered.com/app/1134710/NIMBY_Rails/?l=japanese)

**Transport Fever 2**
- Period/comma keys raise/lower the build cursor (Shift for small steps); tapping comma "burrows" underground for tunnels; M/N also raise/lower sections (player-reported) — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/2246679252941425676)
- Players complain the game only offers a bridge above a height much higher than realistic clearance — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/1740010344363279595)
- Slope/radius/height readouts while building come from a mod ("Track/Street Builder Info"), implying the base game lacks them — [Workshop mod changelog](https://steamcommunity.com/sharedfiles/filedetails/changelog/2298331429)

**OpenTTD (tile grid)**
- Build Railways (keys 1–4) click-drag for straight runs; Autorail (A or 5) builds in any direction based on where in the tile you point; Ctrl+Autorail removes track — [OpenTTD wiki: Railway construction](https://wiki.openttd.org/en/Manual/Railway%20construction)
- Holding Shift shows a cost estimate for any tool instead of building — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Railway%20construction)
- Bridges (B) and tunnels (T) are separate tools; tunnels often cheaper and with no speed limit — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Railway%20construction)

**Railway Empire 2**
- Reviewer: simplified track placement is a big improvement, signals automatic and parallel tracks "placed effortlessly", but raising/lowering track is still needed to avoid costly tunnels/bridges; planning-problem alerts don't always make the fix obvious — [Games Asylum review](https://www.gamesasylum.com/2023/05/25/railway-empire-2-review/)
- Update 1.3 added height keys while hovering a rail point and an "Align Railpoints to terrain" option — [Kalypso: Update 1.3](https://www.kalypsomedia.com/post/railway-empire-2-update-1-3)
- Update 1.0.3 fixed parallel tracks being unnecessarily built as bridges, and showed the waypoint cone on hovered track in advance (controller) — [Kalypso: 1.0.3](https://www.kalypsomedia.com/post/railway-empire-2-update-1-0-3-1)

**Station to Station**
- Puzzle of connecting nodes by rail; cliffs force costly bridges, so it is often cheaper to reroute; single-use cards lower rail/bridge costs or raise payouts — [GodIsAGeek review](https://godisageek.com/reviews/station-to-station-review/); [Checkpoint Gaming](https://checkpointgaming.net/features/2023/10/station-to-station-is-a-zen-and-vibrant-track-laying-puzzler-game)

**MetroDreamin' / other map tools**
- Community help map says curves/alignments are best drawn in "railways mode"; lines can be straight, loops, or two-branch forks — [MetroDreamin' demo map "Setting things up"](https://metrodreamin.com/view/QUhreVo2TGhUQ1ROaTh5ekthcHB6YjJqMW5RMnwxOQ%3D%3D)
- A large MetroDreamin' map uses waypoints (37,124 of them) so tracks are precisely aligned — [MetroDreamin' map](https://metrodreamin.com/edit/YndvWkhkQUE0WlE5ZEtGQ1hOeW9tSDFDb3pvMXww)
- advtrains.de "Public Transportation Map Creator" forces segments onto 45° axes (schematic style) — [advtrains help](https://advtrains.de/metro/help.html)

### Inferences
- The two most-repeated "make drawing easier" features are (1) a modifier key for straight/constrained lines and (2) a live readout (length, radius, cost) at the cursor. 레일맵 has the cost tooltip; length and a Shift-for-straight modifier are cheap additions.
- A "plan first, build later" layer (Subway Builder blueprints/annotations, NIMBY Rails blueprint mode) is the main safety-net pattern for track drawing; 레일맵 currently builds immediately on click.
- CS2's "pick two stations, auto-connect" is an accessibility shortcut 레일맵 lacks; with MapLibre/Turf it would be a straight line or road-following path, a design decision.
- Elevation/tunnel/bridge choice is out of 레일맵's current scope ("실제 지형 고도 데이터" is in the not-building list), but a simple per-segment "underground/at-grade/elevated" cost multiplier (like Subway Builder's categories) would not require terrain data.

### Gaps
- No official source on Mini Metro / Mini Motorways drag mechanics in current versions; sources are 2014–2021.
- No official TF2 manual page on the track tool or its built-in cost display was found.
- CS1 metro track tool specifics (elevation keys, auto-routing) not sourced.
- MetroDreamin' official drawing instructions (click vs drag, snapping) not found; the site has no help pages reachable by fetch.

## 2. Stations: placement rules, sizes/types, catchment display, renaming

### Takeaway
Engineering games treat stations as track features (NIMBY Rails "promotes" track to platform; Subway Builder stations have length/width that change cost; OpenTTD picks size and direction in a dialog). Abstract tools treat a station as a point that can be a stop for one line and a pass-through for another. 레일맵's station = free point + 500 m circle is closest to the abstract family; it lacks station size/length options, station grouping/transfer links, and "pass-through (non-stop)" per route.

### Cited Findings
- NIMBY Rails: platforms are plain track segments with a rectangular footprint; touching footprints group platforms into one station; the station tool was replaced by a "platform promotion" tool that detects valid track pairs under the cursor — [NIMBY Rails devblog](https://carloscarrasco.com/page/51/); [wiki: Track](https://wiki.nimbyrails.com/Track)
- NIMBY Rails: track and stations can be built with few restrictions, mainly roads and water — [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)
- Subway Builder: shorter stations that fit fewer trains cost less, with a cost indicator while drawing (v1.4.0); configurable platform width (v1.4.5); station groups and manual grouping (v1.1.0); context menus on stations and station groups (v1.7.2) — [changelog](https://www.subwaybuilder.com/changelog)
- OpenTTD: Build Station (9) opens a window to choose size and direction; Ctrl enables joining to an existing station — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Railway%20construction)
- MetroDreamin': a station can be made a waypoint "for [a line] only" so that line passes without stopping; walking connections are "out of station interchange" between two stations; lines can share track — [MetroDreamin' demo map](https://metrodreamin.com/view/QUhreVo2TGhUQ1ROaTh5ekthcHB6YjJqMW5RMnwxOQ%3D%3D)
- advtrains map creator: a station is added to a selected line node by typing a name into a "Station name" field — [advtrains help](https://advtrains.de/metro/help.html)

### Inferences
- Explicit transfer/interchange representation (station groups, walking links) is a recurring feature 레일맵 lacks; it matters for the gravity demand model if transfers affect travel time.
- Renaming in-UI is common across tools; 레일맵's ability to rename was not stated in the baseline — worth confirming.

### Gaps
- No source found describing catchment heatmap display for stations in Mini Metro, CS2 or TF2 specifically; OpenTTD catchment highlighting was not on the fetched page.
- No source on minimum spacing rules between stations in any game.

## 3. Lines/routes: creation, extension, insertion, branching, loops, colors, vehicles, line list UI

### Takeaway
Abstract games edit lines by direct manipulation on the map (drag a segment onto a station to insert; drag an end back to shorten), which is fast but poorly discoverable. Sim games use a panel: name, color, ordered stop list, frequency/vehicle type. Subway Builder's 2026 additions (drag-to-reorder stops, duplicate route, pause a route to edit it, change train type later, right-click track to add/remove all its stations) are the clearest current model. 레일맵 has ordered list + insert/remove + 6 colors + train +/-; it lacks on-map drag editing of lines, duplicate route, pause-route-while-editing, per-route vehicle type, branching/loop line types, and frequency as a setting.

### Cited Findings
- Mini Metro: shorten/remove a station by dragging a line piece back toward the station; going too far "will sometimes remove that station, too"; drag segments before/after a station to detach it — [Steam thread](https://steamcommunity.com/app/287980/discussions/0/35221031597445938); [Gigazine](https://www.gigazine.net/gsc_news/en/20140306-mini-metro)
- Mini Metro: delete whole line via the X on the line's colour circle — [Mini Metro Steam thread](https://steamcommunity.com/app/287980/discussions/0/35221031597445938)
- Subway Builder: routes created by naming, choosing colour, selecting stations, setting frequency — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Subway Builder: manual route ordering (v0.10.0), drag stations to reorder (v1.7.0), duplicate route button (v1.6.0, 2026-08-06), change route train type after creation (v1.7.0), pause routes to edit track/stations without deleting them (v1.7.0), right-click a station track to add/remove all its stations (v1.7.0), context menus on routes (v1.7.2) — [changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder: train types (heavy metro, light metro, light rail, commuter rail) with different acceleration/top speed and cost — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder) (community wiki lists only two types — conflict noted by the search summary; Wikipedia is newer)
- NIMBY Rails: "line services" are restricted clones that stay synced with their parent line, allowing different timings or skipped stops; schedule dropdown when buying trains (blank / run line / clone from a train) — [Steam patch notes thread](https://steamcommunity.com/app/1134710/discussions/0/3800524254163291827/)
- MetroDreamin': branches made by forking a line then removing unneeded stations; loops for circle lines; mode legend colours (bus, tram, metro, high-speed rail, airliner) — [MetroDreamin' demo map](https://metrodreamin.com/view/QUhreVo2TGhUQ1ROaTh5ekthcHB6YjJqMW5RMnwxOQ%3D%3D)
- Transport Fever (1): create a line by selecting a vehicle, pressing the line icon, picking stations, "add new line" — [Gamepressure guide](https://www.gamepressure.com/transportfever/creating-connections/z893ff)
- TF2 players: "Rate" matters more than frequency; a Line Manager mod auto-adds/removes vehicles by supply and demand — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/2981907749298204493); [Line Manager mod comments](https://steamcommunity.com/sharedfiles/filedetails/comments/2581894757)
- CS1 Mass Transit dev diary: selecting a line shows all its stops and vehicles in the line info panel — [Paradox forum dev diary](https://admin-forum.paradoxplaza.com/forum/developer-diary/cities-skylines-mass-transit-dev-diary-1-more-than-just-new-public-transport-types.1005446/page-2)
- CS2 players: can no longer place stops while making a bus line; workaround is placing stops first or routing via waypoints then adding stops — [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/3877095833480137582)

### Inferences
- Duplicate route and "auto vehicle count from demand" are low-cost, high-value additions for 레일맵 (fits the "열차는 자동 왕복" rule).
- "Route paused while editing" is a pattern to avoid trains running on half-edited routes; 레일맵 could instead require pause (멈춤) for route edits, or re-path trains on edit.

### Gaps
- Mini Metro official insert-station gesture (drag segment onto station) is widely known but no primary source was fetched.
- No source on max line count or colour palette size in any game other than 레일맵's own 6.

## 4. Editing and safety nets: undo/redo, bulldoze/refund, move/upgrade, copy/paste, pause-to-build

### Takeaway
Undo is not universal and players notice: Mini Motorways has none (players requested it since 2021), Mini Metro relies on gestures, Subway Builder added track undo/redo only in Oct 2025, NIMBY Rails rewrote undo in 1.15. Delete-preview (hover shows what will be removed) and pausing time while building are common safety nets. 레일맵 already has undo/redo, autosave, export/import — ahead of several games. It lacks a delete-preview highlight, blueprint save/load, and explicit refund rules.

### Cited Findings
- Subway Builder: undo/redo for track construction (v0.7.3, 2025-10-20); right-click delete in construction mode, can be turned off (v1.4.5/v1.6.0); hover indicators show what a delete will remove (v1.4.0); move nodes on blueprint track (v1.7.0) — [changelog](https://www.subwaybuilder.com/changelog)
- NIMBY Rails: undo had to be rewritten for v1.15 because its internal APIs were removed (devblog Nov 2024) — [NIMBY Rails devblog 2024-11](https://carloscarrasco.com/page/10/)
- NIMBY Rails: money can be disabled for unlimited building — [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)
- Mini Motorways: no undo for accidentally deleted motorways; Steam request Dec 2021; a commenter claims devs treat it as a gameplay challenge (unverified) — [Steam thread](https://steamcommunity.com/app/1127500/discussions/0/3191360100924201389)
- Mini Motorways: pause the game and rebuild the network; eraser-mode toggle on mobile — [PocketGamer tips](https://www.pocketgamer.com/mini-motorways/tips-for-beginners); [MobileSyrup review](https://mobilesyrup.com/2021/08/22/mini-motorways-game-review-traffic-fun/)
- Mini Metro: Rush Hour mode doesn't allow removing tracks (developer) — [Steam thread](https://steamcommunity.com/app/287980/discussions/0/35221031597445938)
- OpenTTD: Clear land (6) removes track; clicking a station with no trains removes it whole; Remove (R) for individual tiles/signals, Ctrl to also remove rail; Ctrl-drag signals to next junction — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Railway%20construction)
- Subway Builder: save and load blueprints (v1.7.0) — [changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder: sandbox mode with unlimited money vs normal mode with $3B start — [subwaybuilder.com](https://www.subwaybuilder.com/)

### Inferences
- A hover "this will be deleted" highlight is an easy win for 레일맵's delete flows (track delete cascades to routes).
- A sandbox/unlimited-money toggle (NIMBY Rails, Subway Builder) is helpful for testing balance in config.js without editing code.

### Gaps
- Refund percentages on demolition were not found for any game.
- No source found on copy/paste of track or stations in any of these games.

## 5. Information and feedback: stats, overlays, notifications, tutorials

### Takeaway
Current leaders show per-route finance, load (crowding) and speed panels plus map overlays (route loads, track speed, measure/travel-time tools). Weak info panels are a common complaint (CS2 bus panel; Railway Empire 2 alerts that don't explain the fix). 레일맵 has station/track/route stat panels and callouts; it lacks map overlays (demand heatmap, route load colouring), a measure/travel-time tool, and a tutorial.

### Cited Findings
- Subway Builder: Route Loads map tool (v1.3.0); route utilization view (v1.7.0); track speed layer showing elevation and speed limit on hover (v1.0.0); measure tool with distance + walking time and per-train-type travel-time preview (v1.4.17–v1.7.0, on by default since v1.4.17); route speeds panel (v1.5.0); per-route financial panels (v1.6.0); route reliability / on-time tab (v1.7.2) — [changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder: data tools show where residents/workers concentrate and how they commute — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Subway Builder: tutorial expanded to cover demand and explain why each step matters (v1.4.17); a reviewer called the tutorial "only moderately helpful" — [changelog](https://www.subwaybuilder.com/changelog); [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- MetroDreamin' maps display headline totals (ridership, cost, stations, lines, modes, length, interchanges) with a "Where do these numbers come from?" link — [MetroDreamin' map example](https://metrodreamin.com/view/MGd2MHNLVkdjU2VpeFo2QzBReHBSNHVoWmRpMXw2)
- MetroDreamin' home shows discovery feeds ("Top Scores Today", "Recently Starred", "Nearby") — [metrodreamin.com](https://metrodreamin.com/)
- CS2 players: must hover a stop to see waiting passengers; panel weaker than CS1 — [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/3877095833480137582)
- Railway Empire 2: alerts for planning problems where the fix isn't obvious — [Games Asylum](https://www.gamesasylum.com/2023/05/25/railway-empire-2-review/)
- Subway Builder Steam feedback (aggregated): easy to learn with short tutorial; complaints about always-online requirement and performance lag over time — [Vaporlens summary](https://vaporlens.app/app/4039140/subway_builder) (third-party aggregator)

### Inferences
- A "route load" colouring of the route line (thicker/red when crowded) is the overlay most aligned with 레일맵's single-GeoJSON-source rendering approach and its art rules.
- A headline totals badge (ridership, cost, km) like MetroDreamin' fits the 남색 배지 style.
- Explaining *why* in notifications (e.g., "자금 부족: 120억 필요, 80억 보유") addresses the RE2 complaint.

### Gaps
- No source on Mini Metro/Motorways onboarding beyond tutorial existence.
- No source describing demand heatmap overlays in TF2/CS2 specifically.

## 6. Keyboard shortcuts and quality-of-life features players praise or request

### Takeaway
Number-key tool switching (OpenTTD), modifier keys (Shift straight / Shift cost / Ctrl remove), elevation keys, WASD/rotate camera, customizable bindings and a command palette (Subway Builder Cmd+K) are the standard. 레일맵 baseline lists no keyboard shortcuts other than (implicitly) undo/redo.

### Cited Findings
- OpenTTD: 1–4 rails, A/5 autorail, 6 clear, 7 depot, 8 waypoint, 9 station, S signal, B bridge, T tunnel, R remove, C convert; Shift = cost estimate; Ctrl modifies remove/join/signal behaviour — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Railway%20construction)
- Subway Builder: Q/E rotate map, WASD pan, Page Up/Down elevation, G lane count (v0.10.0); customizable shortcuts (v0.9.0); Cmd+K menu search (v1.7.2); Shift straight track (v1.2.0) — [changelog](https://www.subwaybuilder.com/changelog)
- NIMBY Rails: F flips parallel track side — [wiki: Track](https://wiki.nimbyrails.com/Track)
- Transport Fever 2: comma/period elevation, Shift for fine steps (player report) — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/2246679252941425676)
- Railway Empire 2 players: miss pressing Enter to confirm Build (now mouse-click only); mouse-wheel fine-tune moved from Ctrl to Shift — [Steam discussion](https://steamcommunity.com/app/1644320/discussions/1/6363075944126023391)
- Mini Metro: a player proposed right-click to remove a segment; rejected because it "can't do it on mobile" — [Steam thread](https://steamcommunity.com/app/287980/discussions/0/35221031597445938)

### Inferences
- Minimal useful shortcut set for 레일맵: 1–4 tool switch, Esc/right-click cancel drawing, Enter confirm, Space pause, Shift straight segment, Delete remove selection, Ctrl+Z/Y.

### Gaps
- No systematic player survey of most-requested shortcuts was found.

## 7. Features players miss or find frustrating

### Takeaway
Recurring frustrations: hidden/undiscoverable edit gestures (Mini Metro), no undo (Mini Motorways), unclear error messages (Railway Empire 2), forced bridges/height thresholds (TF2, RE2), losing ability to place stops while drawing a line (CS2), and performance lag in large networks (Subway Builder).

### Cited Findings
- Mini Metro: track-editing tricks "confusing and not really discoverable"; the developer admitted they "aren't as intuitive as we thought"; dragging the wrong colour forced deleting the whole line; request for "a simple page of instructions" — [Steam thread](https://steamcommunity.com/app/287980/discussions/0/35221031597445938)
- Mini Motorways: no undo for deletions — [Steam thread](https://steamcommunity.com/app/1127500/discussions/0/3191360100924201389)
- TF2: bridge only offered above an unrealistically high height — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/1740010344363279595)
- RE2: parallel tracks sometimes built as unnecessary bridges (fixed in 1.0.3); alerts unclear — [Kalypso 1.0.3](https://www.kalypsomedia.com/post/railway-empire-2-update-1-0-3-1); [Games Asylum](https://www.gamesasylum.com/2023/05/25/railway-empire-2-review/)
- CS2: stop placement removed from line tool; info panel requires hover — [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/3877095833480137582)
- Subway Builder: always-online requirement and performance degradation over time (aggregated Steam reviews) — [Vaporlens](https://vaporlens.app/app/4039140/subway_builder)
- Station to Station: praised as accessible but lacks deep train management; short levels — [GodIsAGeek](https://godisageek.com/reviews/station-to-station-review/); [Indie Game Reviewer](https://indiegamereviewer.com/station-to-station-preview-trains-plotting-demo/)
- Rail Route: built-in map editor with Steam Workshop sharing; shunting and freight yards were "planned" at EA launch (2021) — [GamingOnLinux](https://gamingonlinux.com/2021/06/rail-network-management-sim-rail-route-is-now-out-in-early-access); [itch.io devlog](https://bitrich.itch.io/railroute/devlog/246773/rail-route-the-train-dispatcher-simulator-game-is-arriving-at-early-access-on-june-23)
- Web fantasy-map tool landscape is thin: LineMap Draw is Windows-only with 1200×1200 px canvas cap and JPG output (not recommended by Transit Maps); Pixa generates maps from text prompts (no hand drawing) — [Transit Maps review](https://transitmap.net/line-map-draw/); [Pixa](https://www.pixa.com/create/subway-map-generator)

### Inferences
- Summary of features 레일맵 lacks, ranked by (evidence strength × fit with current scope):
  1. Delete preview highlight + right-click/Esc to cancel drawing (Subway Builder).
  2. Keyboard shortcuts for tools and Shift-straight drawing (OpenTTD, Subway Builder).
  3. Live length readout next to cost while drawing (Subway Builder v1.7.0).
  4. Route load / crowding coloring overlay and per-route finance panel (Subway Builder).
  5. Duplicate route; drag-to-reorder stops; change line color/type after creation (Subway Builder).
  6. Station grouping / transfer links and per-route non-stop (MetroDreamin', Subway Builder).
  7. Plan/blueprint mode before paying (Subway Builder, NIMBY Rails) and a sandbox/no-money toggle.
  8. Auto-connect two stations (CS2) and track-type cost categories (underground/elevated) — larger design changes.
  9. In-game help page / short tutorial explaining gestures (Mini Metro complaint; Subway Builder tutorial update).
- Rail Route's editor + sharing parallels 레일맵's JSON export/import; a share-by-link feature would be the MetroDreamin'-style next step but needs a server (out of current scope).

### Gaps
- Could not verify current (2026) versions of Mini Metro / Mini Motorways controls; forum sources are 2014–2021.
- No Reddit sources were retrieved; player sentiment relies on Steam threads and aggregators.
- Other web fantasy-transit tools beyond MetroDreamin', advtrains map creator, LineMap Draw and Pixa were not found in this pass.
