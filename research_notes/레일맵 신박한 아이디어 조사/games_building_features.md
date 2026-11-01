# What makes *building* fun in transit, city and creative-toy games (ideas for 레일맵)

Scope: building and creative enjoyment, not economy. Searched 2026-11-01. Each finding names the game, how the feature works, why players like it (where a source says so), and a note on bringing it to 레일맵 (2D, MapLibre, no server). "Already in 레일맵" means the game already has the feature, per CLAUDE.md.

Source quality: there are few primary developer sources. The best ones are the Subway Builder changelog, Disasterpeace's blog and interview on Mini Metro's music, the NIMBY Rails developer retrospective (2020) and the 80.lv Tiny Glade interview. Most player sentiment comes from press reviews, with a few Steam threads. I did not read Reddit directly.

## Q1. Mini Metro and Mini Motorways: which mechanics feel satisfying to build, and what do players praise?

### Takeaway
The best-documented "joy of building" in Mini Metro is its music: every line is a musical voice, every station adds a note, and the music follows game speed and pause. The other big creative feature is Creative mode. Mini Metro has had it since 2018; Mini Motorways added one in August 2025 that lets players edit the map itself (move, recolor and delete destinations and houses) and keep playing in Creative mode after Game Over. Daily and weekly challenges add a shared "same map today" ritual.

### Cited Findings
- **Each line is an instrument (Mini Metro).** Each line is a "Line Loop", a sequence of pulses at one pitch. Every station on the line adds a pulse, and the station's *shape* sets that pulse's timbre. Lines differ mainly by rhythm — [Disasterpeace blog](https://disasterpeace.com/blog/tag.trailer)
- Volume, timbre and panning of each pulse come from live game data (a serialist approach) — [Disasterpeace blog (talk)](https://disasterpeace.com/blog/tag.talk.p3)
- **Editing a line changes the music.** Each edit swaps the line's oldest note for the next one in a list and moves its rhythm on to the next option. Harmony also shifts by in-game week — [Designing Sound interview, 2016](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- Speeding up the game speeds up the music. Pausing makes it at its most ambient — [Disasterpeace blog](https://disasterpeace.com/blog/tag.analysis); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- Disasterpeace says the audio system "ended up shaping game design" too — [Disasterpeace blog](https://disasterpeace.com/blog/tag.trailer)
- The idea spread outside the game: an LA Metro sonification site cites Mini Metro's system as its inspiration — [Boing Boing](https://boingboing.net/?p=1115912)
- Credit conflict: the Dinosaur Polo Club press kit lists audio under Poppy de Raad, while other sources credit Disasterpeace as composer and sound designer — [press kit](https://dinopoloclub.com/press/index.php)
- **Mini Metro Creative mode (2018 changelog):** "take any existing maps and build your dream metro" — [GOG changelog](https://gog.com/forum/mini_metro/changelog/page2)
- **Daily Challenge (Mini Metro).** A 2021 patch added a warning that only your first Daily Challenge score counts, which makes it a one-shot shared puzzle. The press kit also lists weekly challenges — [GOG changelog](https://gog.com/forum/mini_metro/changelog/page2); [press kit](https://dinopoloclub.com/press/index.php)
- The Steam page pitches Mini Metro as so satisfying that you want to start again the moment a game ends. English Steam reviews are "Overwhelmingly Positive" — [Steam](https://store.steampowered.com/app/287980/Mini_Metro/)
- **Mini Motorways Creative Mode (free update, 26 Aug 2025):** place and edit destinations (rotate, flip, delete, recolor) and houses (recolor, delete), across all 23 maps including real cities like New York and Mumbai — [GoNintendo](https://gonintendo.com/contents/49487-mini-motorways-to-introduce-creative-mode-august-26th-2025); [CGMagazine/cogconnected](https://cogconnected.com/2025/08/mini-motorways-has-finally-launched-its-creative-mode-update/); [PCGamesN, "finally adds the feature we've been wanting"](https://www.pcgamesn.com/mini-motorways/creative-mode)
- A later Mini Motorways update ("Lokum Lanes") added "Continue in Creative Mode" after Game Over, plus Daily, Weekly and City Challenges — [Perfectly Nintendo](https://www.perfectly-nintendo.com/?p=559130). (The search summary also gave an "October 2025" date for Creative Mode, which conflicts with the 26 Aug 2025 launch. Trust the August date from the launch articles.)
- Unconfirmed: a store aggregator says Mini Motorways lets you "export GIFs of their city layouts" to share — [gg.deals](https://gg.deals/gb/game/mini-motorways/) (not confirmed by a primary source)

### Inferences
- **"Each route is a voice" (small, high value).** 레일맵 already has pentatonic generative music. The Mini Metro step it lacks is a 1:1 mapping: each route = one looping voice, each station = one pulse, station type (transfer, terminal, high-speed link) = timbre. Adding or removing a station changes that route's loop right away, so building is something you *hear*. Pure Web Audio, no files, fits the current setup.
- **"Continue in sandbox" after bankruptcy (small).** Like Mini Motorways' "Continue in Creative Mode": on the bankruptcy dialog, offer [샌드박스로 계속 만들기] (copy the network into that map's sandbox slot). Save code already handles sandbox slots.
- **Map-edit Creative mode (medium).** Mini Motorways lets players move and recolor destinations. In 레일맵 the equivalent would be letting sandbox players paint "people hotspots" or move high-speed/airport hubs. This touches the demand data, so it is not tiny.
- **Daily challenge without a server (small to medium).** Pick map + seed + constraint from the date (`hash(YYYY-MM-DD)`), e.g. "Busan, 3 routes only, connect both KTX stations". Results stay local; share them through the existing link-sharing. A world leaderboard would need a server, so leave it out.

### Gaps
- I found no review or devlog quoting why Mini Metro's *line-drawing gesture* itself (drag-to-extend, rubber-band preview, line-end handles) feels good. Only the store-page level "satisfying" claim.
- Couldn't confirm Mini Motorways' GIF export from a primary source.
- No Reddit threads were read directly.

## Q2. Subway Builder, NIMBY Rails, Transport Fever 2, Cities: Skylines 2, Rail Route, Station to Station: which building tools, visualizations, editors or toy-like features stand out?

### Takeaway
The richest list comes from Subway Builder's public changelog (Oct 2025 to Sep 2026). Several features are 2D-friendly and directly portable: a timelapse GIF of the network growing, schematic map generation, GeoJSON export, a community color-theme store, a route-load / station-pair map view, length and curve radius shown while drawing, blueprints you can save and load, and side-by-side drawing of shared routes. NIMBY Rails' appeal is "free building on a real-world map". Rail Route's is going from manual work to automation. Station to Station's is a voxel diorama look plus single-use helper cards.

### Cited Findings
**Subway Builder (Colin Miller; public beta 9 Oct 2025, v1.0 10 Feb 2026, Steam 17 Jul 2026)** — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Real US (and later UK and other) cities: 55 playable cities plus one sandbox map as of Oct 2026. Players name and color routes. Sandbox mode has no budget limit — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Track type × elevation combinations (heavy/light metro, light rail, commuter rail; elevated, at-grade, tunnels at several depths) — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Feature timeline from the [official changelog](https://www.subwaybuilder.com/changelog):
  - v0.7.3 (2025-10-20): undo/redo for track building; custom route colors.
  - v0.8.0 (2025-11-04): **custom map color themes**.
  - v0.9.0 (2025-11-21): **route-map thumbnails in save files**; experimental side-by-side display of routes sharing track.
  - v0.10.0 (2025-12-04): custom text color for route bullets; PgUp/PgDn changes elevation.
  - v1.0.0 (2026-02-10): **timelapse generator that exports a GIF of your network growing**; track-speed layer with hover details.
  - v1.2.0 (2026-03-05): Shift forces straight track; **curved stations**.
  - v1.3.0 (2026-04-08): **"Route Loads" map tool showing station-pair popularity**; **GeoJSON export** of stations and routes.
  - v1.4.0 (2026-05-29): **schematic map generation**; platform layouts (quad-track express); cost indicator while drawing; tunnel-boring-machine mechanic.
  - v1.4.5 (2026-07-05): **community theme store** (browse, vote, apply, publish color themes); configurable platform width.
  - v1.6.0 / v1.7.0 (2026-08): parallel and shared routes drawn side by side with adjustable thickness; **movable nodes on blueprint tracks**; **track length and curve radius shown while drawing**; **save and load blueprints**; rename every station in a group at once; drag to reorder stations; **fare-zone drawing**.
  - v1.7.2 (2026-09-29): right-click context menus; a traffic-light icon flags conflicts in blueprint tracks.
- Data views: where residents and workers live and work and how they commute. One review notes car-centric areas show red and transit areas turn blue — [punishedbacklog review](https://punishedbacklog.com/subway-builder-review/); [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Reception: VaporLens' sample of user reviews lists "fun, addictive" and easy to learn as positives; a steep learning curve, poor tutorial, bugs and always-online map tiles as negatives; Steam roughly "Mixed" at that sample — [VaporLens](https://vaporlens.app/app/4039140/subway_builder) (third-party estimate). Fast Company: few transit games are realistic enough to match real planning — via [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)

**NIMBY Rails (Carlos Carrasco; early access Jan 2021)**
- RPS ("NIMBY Rails has made me a train person", 20 Jul 2021) praised **free building on a real-world map** and simple, easy-to-learn play. It criticized the controls and text, and said the game "feeds the ultimate YIMBY fantasy" — via [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)
- Railfans.ca calls it a completely open sandbox and a great tool for trying out rail expansions — [Railfans.ca](https://www.railfans.ca/news/game-review-nimby-rails). Steam English reviews are "Very Positive" — via the same search, [Steam](https://store.steampowered.com/app/1134710/NIMBY_Rails/)
- Developer retrospective (16 Mar 2020): tracks are real circle arcs joined at tangents to straights (they replaced Bézier curves). Track must respect the map (can't cross streets at odd angles, surface track can't cross rivers). Branches and merges exist. Track types are viaduct, ground, tram and tunnel. Tight curves cap speed. **Platforms that touch fuse into one station**, and a tunnel station placed under a surface station makes a transfer. **Line diagrams stack several lines on shared track like real transit maps**. Track and trains are drawn to real scale when zoomed in. Lines have no limits on station count or order — [NIMBY Rails retrospective](https://carloscarrasco.com/nimby-rails-retrospective/)
- The track editor lets you turn off the automatic aids and control each track, signal and building by hand — [DeVuego press kit](https://www.devuego.es/en/presskit/nimby-rails). The developers note that parallel-track drawing clashed with point mode — [Steam discussion](https://steamcommunity.com/app/1134710/discussions/0/3800524254163291827/)

**Rail Route (Bitrich; early access 2021–22)**
- More a "train signalling sim" than a train sim. The fun comes from moving from manual control of single tracks to automating nearly everything. Routing sensors that switch signals by train destination were "a revelation" — [KeenGamer](https://www.keengamer.com/articles/reviews/pc-reviews/rail-route-review-satisfy-your-rail-dispatcher-dreams/); [Boiling Steam](https://boilingsteam.com/rail-route-review/)
- Building is a creative outlet ("fill every possible space"). Players who just like drawing lines can switch on infinite money or unlock everything — [Boiling Steam](https://boilingsteam.com/rail-route-review/)

**Station to Station (Galaxy Grove, Oct 2023)**
- Voxel diorama look: "reminds me of thickly-coated landscape paintings… miniature train diorama style". Stations have up to 4 connection points. **Single-use cards** (next rails half price, cheaper bridges) that players save for tricky terrain. Criticisms: limited depth, gets repetitive — [God is a Geek](https://godisageek.com/reviews/station-to-station-review/); [Pixel Bandits](https://www.pixelbandits.org/2023/10/station-to-station-review/); [VaporLens](https://vaporlens.app/app/2272400/station_to_station)

**Transport Fever 2 / Cities: Skylines 2**
- TF2 got changeable line colors in a March 2020 update, and the most-installed mods add more line color palettes and camera views (cockpit / follow cameras) — [Steam changelog](https://steamcommunity.com/sharedfiles/filedetails/changelog/2022021187?l=tchinese); [GameWatcher mods list](https://www.gamewatcher.com/news/the-best-transport-fever-2-mods)
- CS2: per-line info panels and a table of lines in the Transport Info View. Player sentiment is mixed ("I like the bus line tool" vs "Public transport is a joke…") — [TechRaptor](https://Techraptor.net/gaming/news/cities-skylines-2-developers-discuss-details-about-public-and-cargo-transportation); [Steam thread](https://steamcommunity.com/app/949230/discussions/0/3877095833480137582)

### Inferences (translation to 레일맵, rough size)
- **Network timelapse (small to medium, very shareable).** Store a log of build events with dates (or rebuild one from undo history), then replay the network's growth month by month on the map or in the diagram view. Export as a sequence of PNGs, or as WebM via `canvas.captureStream` + `MediaRecorder` (no server, no library). GIF needs an encoder library. This is Subway Builder's v1.0 headline creative feature.
- **Save thumbnails (small).** Draw a small diagram on the start-screen "이어서 하기" card instead of only the map picture (Subway Builder v0.9). The diagram renderer already exists.
- **Length / curve radius while drawing (small).** The draw bar shows length and cost. Adding a "tightest curve radius / speed limit" readout makes curve-making feel crafted (Subway Builder v1.7).
- **Station-pair "route load" view (medium).** Click a station to see lines fanning out to its top destinations, thickness = riders. tripFinder already holds the pair data. This is the transit-nerd "why" view.
- **Color themes / custom palettes (small).** There is a control-room mode already. A player-defined theme (land, water, track colors), shared inside the share link, would echo Subway Builder's theme store without a server (theme JSON in the URL).
- **GeoJSON export (small).** Stations and routes are already GeoJSON coordinates. A download lets nerds open their network in geojson.io or uMap.
- **Blueprint / stamp (medium).** Save a station-plus-track shape and stamp it elsewhere (Subway Builder v1.7).
- **"Toy cards" (small, optional).** Station to Station's single-use helper cards. For a sandbox-loving owner, probably low value.
- **Real-scale zoom detail.** NIMBY's real-scale track at high zoom matches 레일맵's platform bands at zoom 15+, so 레일맵 is already strong here.

### Gaps
- No Reddit sentiment gathered for r/NIMBYRails or r/SubwayBuilder on which tools players love most.
- No primary data on how often Subway Builder's timelapse or schematic features are used or shared.
- The Transport Fever 2 "follow-train camera is beloved" claim is inferred from mod popularity; no direct review quote was found.

## Q3. Cozy builders (Townscaper, Dorfromantik, Islanders, Tiny Glade): what toy features make building itself rewarding?

### Takeaway
Four things come up again and again: (1) instant, tactile audio-visual feedback on every placement (pops, splashes, jiggles, a "Perfect!" stamp); (2) procedural auto-decoration that makes *anything* the player does look good; (3) no fail state, no goals, a "toy" framing; (4) a placement preview that tells you the result before you commit (Islanders' score preview, Dorfromantik's glowing matching edges). Critics name shallow depth and repetition as the trade-off.

### Cited Findings
- **Townscaper (Oskar Stålberg, 2020):** he calls it a "toy", not a game: the only goal is enjoying the town rise as you click — [Bloomberg CityLab, 2020](https://www.bloomberg.com/news/articles/2020-07-24/the-video-game-where-you-build-an-empty-town); [Nintendo Life, 2021](https://www.nintendolife.com/news/2021/03/townscaper_is_an_idyllic_toy-like_game_thatll_melt_all_your_worries_away)
- Townscaper feedback: a splash when you build in water and "ear pleasing pops" for buildings. Left click builds, right click removes, and an algorithm shapes the result — [Nintendo Life](https://www.nintendolife.com/news/2021/03/townscaper_is_an_idyllic_toy-like_game_thatll_melt_all_your_worries_away); [intothespine, 2020](https://intothespine.com/2020/09/21/creativity-and-relaxation-townscaper/)
- "No matter how hard I tried to … break the way my cities looked, everything still managed to look impressive" — [But Why Tho, 2021](https://butwhytho.net/2021/09/05/review-townscaper-is-a-minimalists-dream-pc/)
- Pushback: a Steam thread says Townscaper "isn't really a game" (no scores, goals, unlocks), so it is a shallow sandbox — [Steam discussion](https://steamcommunity.com/app/2198150/discussions/0/4517757187692847409)
- **Tiny Glade (Pounce Light, 2024):** began as a procedural wall generator. The developers were surprised people wanted a game where you draw walls, but "something enchanting about procedural walls that rearrange themselves". UX was their hardest, most iterated problem — [80.lv interview](https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games/)
- Tiny Glade: no management, combat or goals. Procedural systems handle what is hard to place by hand (terrain, flowers, water). Simple rules, e.g. a path is needed before stairs appear — [Prima Games](https://primagames.com/news/tiny-glade-lets-you-kick-back-and-doodle-cozy-villages-with-no-rules); [Deep Root Depths Substack](https://deeprootdepths.substack.com/p/tiny-glades). Reviewers call it "tinkering" more than building, with "endless detail" filled in — [Aftermath](https://aftermath.site/tiny-glade-is-a-lovely-stress-free-builder.md). Players recreate famous real places in it — [80.lv](https://80.lv/articles/players-recreate-famous-locations-in-tiny-glade)
- **Dorfromantik (Toukana, 1.0 2022):** a perfectly placed tile gives "a little jiggle, accompanied by a pleasant sound effect as the word 'Perfect' triumphantly appears". The drop sound is "the world's most satisfying 'pop'". 1.0 made matching edges glow more clearly — [Film Stories](https://filmstories.co.uk/?p=83460); [TheXboxHub](https://www.thexboxhub.com/dorfromantik-review/); [Gagadget](https://gagadget.com/en/123169-dorfromantik-review-a-blissful-minimalist-chill-out-game/). One critic asked for a high-contrast option for the glowing edges — [Gagadget](https://gagadget.com/en/123169-dorfromantik-review-a-blissful-minimalist-chill-out-game/)
- **Islanders (Grizzly Games, 2019; New Shores, Jul 2025):** placement scoring by what's in range (house +1 per nearby house/park, etc.), shown as you hover. The coin-collect sound and filling bar gave one reviewer "a dopamine hit every time". All usual pressures (resources, time, enemies) are removed — [Islanders reviews via OpenCritic](https://opencritic.com/game/7545/islanders/reviews); [Pixel Poppers](https://pixelpoppers.com/review/islanders/); [Cubed3, New Shores 9/10](https://www.cubed3.com/games/reviews/nintendo-switch/islanders-new-shores). Downsides: repetitive over long runs, placement frustration — [VaporLens](https://vaporlens.app/app/1046030/islanders)

### Inferences (for 레일맵)
- **"Perfect" moments for building (small).** A tiny celebratory pop plus a map callout when the player makes something "nice": the first transfer station, a line whose curve is smooth everywhere, a loop line, linking a KTX or airport hub. The map callout system and sounds already exist; this is mostly triggers plus new sounds. Keep it subtle (calm game).
- **Placement preview (small to medium).** Islanders and Dorfromantik show the *result* before you click. 레일맵's [역 놓기] tooltip already shows population and the KTX link. Extend it with "this station would make a transfer with 2호선" or "+N riders/day estimate" (the estimate needs a quick local demand approximation; the worker makes this harder).
- **Auto-decoration (medium to large).** Tiny Glade's walls "rearrange themselves". The 2D version: stations sprout plazas, bus stops or trees as ridership grows; tracks get auto-placed signal dots or catenary ticks at high zoom; elevated vs underground shading. Only worth it if it stays flat and in the beige palette.
- **Splash / pop by terrain (small).** Townscaper's water splash: play a different build sound when a track becomes a bridge over water, or a tunnel on Sollae (the trackProfile flags already exist).
- **Toy framing on the start screen (small).** The owner doesn't care about economy. A clearer "그냥 만들기 (샌드박스)" first-class entry, plus continue-in-sandbox, matches the Townscaper/Tiny Glade "toy" pitch.
- **Photo mode (small, partly exists).** The H key already hides the UI. The missing piece is a one-click [사진 찍기] that saves the map canvas as PNG (MapLibre `preserveDrawingBuffer` or `map.getCanvas().toDataURL()` after render), with an attribution strip. This is the map-view counterpart to the diagram PNG export.

### Gaps
- Didn't find Oskar Stålberg's own talk transcript quoting design reasons; relied on press summaries.
- No source quantifies how much sound contributes to retention in these games.

## Q4. Which features are small and doable in a 2D web game, and which are big?

### Takeaway
Most high-value ideas are small because 레일맵 already has the building blocks (Web Audio music engine, diagram renderer, share links, callouts, undo history). Timelapse, per-route musical voices, photo mode, save-card diagram thumbnails, GeoJSON export, a curve-radius readout and continue-in-sandbox are all client-only. Auto-decoration, map editing (moving hubs or painting population) and blueprint stamps are medium to large.

### Cited Findings (feature → source game)
- Network growth timelapse GIF — [Subway Builder changelog v1.0](https://www.subwaybuilder.com/changelog)
- Schematic map generation — [Subway Builder changelog v1.4.0](https://www.subwaybuilder.com/changelog) (레일맵 already has this as 노선도)
- Theme store / custom map color themes — [Subway Builder changelog v0.8.0, v1.4.5](https://www.subwaybuilder.com/changelog)
- Route-load station-pair view — [Subway Builder changelog v1.3.0](https://www.subwaybuilder.com/changelog)
- Line stacking on shared track — [NIMBY Rails retrospective](https://carloscarrasco.com/nimby-rails-retrospective/); [Subway Builder v1.7.0](https://www.subwaybuilder.com/changelog) (레일맵 already does this in the diagram)
- Each line = musical voice — [Disasterpeace](https://disasterpeace.com/blog/tag.trailer)
- Continue in Creative after Game Over; editable map elements — [Perfectly Nintendo](https://www.perfectly-nintendo.com/?p=559130); [GoNintendo](https://gonintendo.com/contents/49487-mini-motorways-to-introduce-creative-mode-august-26th-2025)
- Daily/weekly challenges — [GOG Mini Metro changelog](https://gog.com/forum/mini_metro/changelog/page2)
- Placement-perfect feedback — [Film Stories, Dorfromantik](https://filmstories.co.uk/?p=83460)
- Procedural self-arranging decoration — [80.lv Tiny Glade](https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games/)

### Inferences (size table, judged against 레일맵's codebase)
| Idea | From | Size | Notes for 레일맵 |
|---|---|---|---|
| Each route = musical voice, station = note, timbre by station type | Mini Metro | Small–medium | Extend `ui/music.js`; tempo follows game speed; pause = ambient pad |
| [샌드박스로 계속 만들기] on bankruptcy | Mini Motorways | Small | Reuse share→sandbox slot import in `save.js` |
| Photo mode PNG of the map (with attribution) | cozy builders / H key | Small | `map.getCanvas()` after render; keep OSM credit |
| Diagram thumbnail on save cards | Subway Builder v0.9 | Small | Reuse `diagramLayout.js` |
| Curve radius / speed limit readout while drawing | Subway Builder v1.7 | Small | `running.js` already computes curve slowdowns |
| GeoJSON export | Subway Builder v1.3 | Small | Data is already GeoJSON |
| "Perfect" pop moments (first transfer, loop, hub link) | Dorfromantik / Islanders | Small | callouts + sounds; keep calm |
| Bridge "splash" / tunnel "rumble" build sound | Townscaper | Small | trackProfile flags |
| Daily seeded challenge (date-hash, local only) | Mini Metro | Small–medium | No leaderboard (needs a server) |
| Custom color themes, shared in the link | Subway Builder | Small–medium | Fits base.css token system; must respect flat rule |
| Network growth timelapse (map or diagram), WebM/PNG | Subway Builder v1.0 | Medium | Needs a dated build log in save; WebM via MediaRecorder; GIF needs a library |
| Station-pair route-load fan view | Subway Builder v1.3 | Medium | tripFinder pairs exist; drawing is new |
| Placement preview of riders/transfer before clicking | Islanders | Medium | Demand runs in a worker; needs a cheap estimator |
| Blueprint / stamp save-and-place | Subway Builder v1.7 | Medium | Coordinates are relative to an anchor |
| Map edit in sandbox (move hubs, paint hotspots) | Mini Motorways Creative | Medium–large | Touches demand and catchment |
| Auto-decoration that grows with ridership | Tiny Glade / Townscaper | Large | Art work; must stay flat beige |

### Gaps
- Effort sizes are my judgment from CLAUDE.md's description of the codebase, not measured.
- No source compares which of these features players actually use most.
