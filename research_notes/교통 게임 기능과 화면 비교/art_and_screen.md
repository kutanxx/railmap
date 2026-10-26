# Art style, map rendering and screen layout of transit / city-building games (for 레일맵)

Scope note: researched 2026-10-26 with web search and fetch. Primary sources were often unreachable: Twinfinite and GGWash returned 403, the Indieorama interview returned 404, and the GDC Vault talk is members-only. Many details below come from secondary reviews and player forums, and that is flagged where it applies. Concrete descriptions of NIMBY Rails, Metro Dreamin', Cities: Skylines II info views, OpenTTD rendering and the named explainer YouTube channels were mostly **not** found. See each Gaps section.

## 1. Map look: palette, base-map detail, flat vs 3D, day/night, label density, how player-built things stand out

### Takeaway
The minimalist games (Mini Metro, Mini Motorways, Subway Builder) push geography into low-contrast background tones and give saturated color only to the player's network. Each offers alternate color modes (night/dark, colorblind). The 3D sims (Cities: Skylines, Transport Fever 2, Railway Empire 2) render a full world and depend on toggleable "info views"/overlays that recolor the scene to make data readable. This matches 레일맵's "beige background, only player-built things have color" rule.

### Cited Findings
- Mini Metro's art and interface were designed to resemble modern transit maps, with "straight lines and bold colours". — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Metro's official press kit describes the map as built "in the classic abstract subway style of Harry Beck". — [Dinosaur Polo Club press kit](https://dinopoloclub.com/press/index.php)
- Mini Metro's geography and waterways are drawn "low-contrast" so they recede behind gameplay elements. — [Mechanics of Magic: Visual design of Mini Metro](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- The team had little art experience, so keeping production art minimal was a necessary constraint that pushed them toward abstract visuals. Jamie Churchman led the visual design. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Churchman's GDC 2017 talk "'Mini Metro': When Less Is More" covered "designing beauty through a process of elimination" and building "a robust design language". The abstract argues that developers often wrongly think their game "needs to be the most distracting thing". Talk content itself was not accessible. — [GDC Vault](https://gdcvault.com/play/1024250/-Mini-Metro-When-Less); [Game Developer announcement](https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev)
- Mini Metro offers "several colour modes", including colourblind and night modes. The Mini Motorways crossover maps added in the 10-year Miniversary update each have "a unique colour palette". — [Dinosaur Polo Club press kit](https://dinopoloclub.com/press/index.php)
- In Mini Metro the backgrounds are white, yellow or black. In the dark mode, stations become black shapes with a "thin white outline". — [Can I Play That: Mini Metro visually impaired review](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- Mini Metro's clock changes color to show day or night. — [Mechanics of Magic](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- Mini Motorways: each level is modeled on a real city. A reviewer contrasted the "yellows of Los Angeles" with the "light blue and pink hues of Tokyo". Players can select different colour palettes per map, including colourblind and night modes. These come from search-result summaries of reviews and the store page; I could not confirm which outlet wrote the LA/Tokyo line. — [The Sixth Axis review](https://www.thesixthaxis.com/2022/07/04/mini-motorways-review-switch-apple-arcade/); [Vaporlens summary](https://vaporlens.app/app/1127500/mini_motorways.md)
- Mini Motorways' look evolved through iterations. An earlier Mexico City build had roads with a dashed centre line and a different take on parking lots, and mountain rendering was reworked. An isometric concept was drawn for the overpass feature. — [Dinosaur Polo Club: Behind the scenes, concepting Mini Motorways](https://dinopoloclub.com/2023/07/23/behind-the-scenes-concepting-mini-motorways/)
- Subway Builder: a reviewer says its minimalist art style "knocks out of the park". It has light and dark modes, and the reviewer prefers dark because the rail colors stand out more. Buildings are simple, mostly square 3D blocks that help with orientation. — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- Subway Builder uses real-world data for cities including New York, Chicago, London, Paris, Tokyo and Dublin. A broadband connection is required "to maintain the real data used by the game". It released on Steam on 17 Jul 2026, published by Borough Studio. — [Steam: Subway Builder](https://store.steampowered.com/app/4039140/Subway_Builder)
- NIMBY Rails is played on a "fully detailed real world map with 1cm resolution", and tracks must respect real roads. Its Steam tags include 2D, Stylized and Minimalist. It has been in Early Access since 26 Jan 2021, and reviews are Very Positive (88% of about 1,275). — [Steam: NIMBY Rails](https://store.steampowered.com/app/1134710/NIMBY_Rails/)
- NIMBY Rails takes its streets and buildings from OpenStreetMap and stores them in its own vector format (.nrmap). A third-party "Turnout" mod adds an OpenRailwayMap-style vector-tile overlay split by vertical level. — [OSM wiki: NIMBY Rails](https://wiki.openstreetmap.org/wiki/NIMBY_Rails); [smods listing](https://catalogue.smods.ru/?p=456548)
- Railway Empire 2 offers "bigger, more detailed and lively maps", covering the whole US and continental Europe, plus regional maps. A reviewer noted it "doesn't have the greatest of visuals". — [God is a Geek: Railway Empire 2 review](https://godisageek.com/reviews/railway-empire-2-review/)

### Inferences
- The Mini Metro and Subway Builder approach of muting geography and saving saturated color for the player's network directly supports 레일맵's rule that only player-built things get color. Mini Metro shows this works even with zero base-map detail beyond water.
- Every minimalist product researched offers at least one alternate scheme: night/dark and colorblind. 레일맵 could later add a dark-navy variant of the beige palette (the Subway Builder reviewer says dark makes lines pop). That would be a "next feature" suggestion, not current scope.
- Mini Motorways gives each city its own palette. That is not needed for a single-city demo, but palette tokens in config would make per-region palettes cheap later.

### Gaps
- No primary-source description of NIMBY Rails' base-map colors, label density or zoom-level styling. The Steam page and OSM wiki give only data facts.
- No source on Metro Dreamin' visuals. The searches returned Metro Map Maker, a different tool.
- No primary description of the infrastructure-explainer YouTube map styles (RMTransit/Reece Martin, City Beautiful, Not Just Bikes, Real Engineering). Searches found only generic map-animation tooling claims from freelancer listings: After Effects + GeoLayers 3, Google Earth Studio ([Fiverr listing](https://fiverr.com/ahsanmap/create-cinematic-map-animations)). Those are not attributable to any channel.
- No exact hex values for Mini Metro or Mini Motorways palettes were found.

## 2. Lines and stations: thickness, colors, shared track, station symbols, interchanges, terminals, choosing line colors

### Takeaway
Mini Metro uses shape as the station language (circle, triangle, square, star…) and hue as the line language. It has a fixed palette that players cannot change. Subway Builder gives a fixed palette of 15 colors plus custom names and logo shapes. Player-made map tools (Metro Map Maker) treat line *style* (dashed, striped, hollow) as a second channel beside color. No source was found on how any game draws parallel lines sharing one track.

### Cited Findings
- Mini Metro stations use "consistent and easy-to-identify contrast-colored shapes". Passengers reuse the same shapes, smaller and without outline, to show their destination type. — [Mechanics of Magic](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- Mini Metro lines are separated by contrasting hue. — [Mechanics of Magic](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- Mini Metro line colors are "high-contrast in the way a rainbow is high-contrast" and cannot be changed by the player. A line passing through a station is marked by a "fine white line", which is "really hard to see without zoom". When a station is selected, a radiating ring in the line's color appears, and the reviewer calls it "plenty big". — [Can I Play That](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- The Mini Metro interchange is a weekly upgrade that lets more commuters wait without overcrowding and speeds up transfers. — [Giant Bomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro)
- Subway Builder lets players pick from 15 track colors and customize line names and logo shapes. Single, dual and quad track use different train styles, and stations and hubs can be renamed. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- NIMBY Rails builds stations with "automatic double track and automatic entrance/exit signaling" or lets players design them in detail. Passengers transfer at transfer stations. — [Steam: NIMBY Rails](https://store.steampowered.com/app/1134710/NIMBY_Rails/)
- Metro Map Maker (web schematic tool) shipped only solid lines for years. Version 7 added mixable line styles and widths. Version 7.1 added "Square Stripes", "Hollow Open" (London Overground) and an uneven dashed style (Paris Metro), plus an eyedropper that copies a line's color, width and style. — [Metro Map Maker blog 7.1](https://blog.metromapmaker.com/coming-soon-metro-map-maker-version-7-1/); [Stripes preview](https://blog.metromapmaker.com/sneak-preview-stripes-line-style/); [Hollow Open preview](https://blog.metromapmaker.com/sneak-preview-hollow-open-line-style-london-overground/)
- Transport Fever 2: one player said the vanilla line colours are "so friendly to colourblind players by default". Another wanted more shades, which suggests the default set is small. These are forum opinions. — [Steam workshop comments](https://steamcommunity.com/sharedfiles/filedetails/comments/1961044714)

### Inferences
- 레일맵's track design has a dark body (#3E4651), beige casing and a line-color center stripe. Because the line color lives only in a thin stripe, hue differences must be strong. A fixed, curated palette like Subway Builder's 15 colors is safer than free color picking. Mini Metro's fixed palette was criticized only for lack of customization, not for clashes.
- Mini Metro's "fine white line through station" was hard to see. That suggests 레일맵's dashed platform center line and stripe should stay visible at low zoom, or be hidden below a zoom threshold rather than shrunk into hairlines.
- Line *style* (dashed, hollow) as a second channel is precedent for colorblind support. 레일맵 already reserves dashed orange (#C9772F) for under-construction track, so any extra line styles must not collide with that meaning.

### Gaps
- No source found on how NIMBY Rails, Subway Builder or Transport Fever 2 render several lines sharing one track (offset bundles vs. single stripe). This is a design decision 레일맵 must make without precedent from this research.
- No source on terminal-station markers in any of the games.

## 3. Trains: shape, size relative to map, line colors on trains, crowding indicators

### Takeaway
Mini Metro trains are simple rectangles in the line color, scaled far larger than real life so they read on a schematic. Passengers are drawn as tiny shapes inside them, and this is criticized as hard to see. Crowding is shown at stations rather than on trains: waiting passenger shapes pile up next to the station, and a countdown ring warns before game over.

### Cited Findings
- Mini Metro trains are rectangular and carry smaller passenger shapes. Boarded passengers appear "lighter than the train color" and are hard to see. Waiting passengers appear as "miniature black shapes next to the station". — [Can I Play That](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- In Mini Metro, a crowded station's symbol pulses and a countdown circle begins. The game ends if a station stays at capacity for about ten seconds without service. The ten-second figure is from the Giant Bomb wiki. — [Giant Bomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro)
- Subway Builder: when zoomed into stations, commuter ambience grows louder at busier stops. Trains trigger a xylophone sound, which is fun at first but overwhelming with many trains. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Subway Builder says "an overcrowded station may cause delays or disruptions". — [Steam: Subway Builder](https://store.steampowered.com/app/4039140/Subway_Builder)

### Inferences
- 레일맵's trains are navy capsules with a yellow border and a line-color stripe. Like Mini Metro's trains, they should be drawn at a fixed screen-pixel size rather than true scale, or they vanish at city zoom. In MapLibre, a symbol/circle layer sized in pixels does this naturally.
- Crowding is most readable at the station (pile-up plus ring), not on the train. For 레일맵, a crowding indicator could be a small fill bar or ring on the station bubble. That would be a later feature.
- Subway Builder's audio-scaled-by-crowding is a cheap, non-visual crowding cue, but reviewers say it must be throttled.

### Gaps
- No source on train shapes or crowding indicators in NIMBY Rails, Transport Fever 2, OpenTTD or Railway Empire 2.

## 4. Information display: HUD (money, date, speed), panels vs tooltips vs overlays, heatmaps, graphs, notifications, onboarding

### Takeaway
Minimalist games keep the HUD on the screen edges, grouped and small. Mini Metro puts the clock, week and score top-right, line tokens on one side and resources on the other. Data-heavy sims use toggleable "info views" that recolor the whole map (Cities: Skylines), plus line-manager windows with graphs (Transport Fever 2). Subway Builder's map bubbles for demand were the most praised single feature. The most common criticism across sims is clutter, and overlays that hide while you build.

### Cited Findings
- Mini Metro pushes peripheral information to the sides, grouped and away from the play area. Available lines appear on one side as "smaller, gray dots" until unlocked. Resources are grouped on the other side with icons, because color and shape are already used for lines and stations. Clock, calendar and score sit top-right. — [Mechanics of Magic](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- Mini Metro menus use "bold, chunky lettering" that could be bigger. Upgrade-icon text is "so small", and city descriptions are about 4pt. Zoom works while the clock is paused. — [Can I Play That](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- Subway Builder's "Demand Stats" draw residential and worker populations as bubbles on the map. Car-centric bubbles are red and bubbles turn blue as people switch to transit. The reviewer found watching Manhattan go "from a sea of red into a rainbow" very satisfying. Criticism: Demand Stats disappear when building starts, forcing players to toggle back and forth. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Subway Builder's Financial Dashboard shows revenue by day, two weeks or all time, plus operational profit and charts, and was described as easy to read. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Aggregated Subway Builder Steam reviews say the UI is cluttered, does not scale for high resolutions and has no keyboard shortcuts. On Steam Deck, "no UI scaling makes text unreadable". This is an aggregator summary. Steam all-time rating is Mixed (61% of 450), recent rating Mostly Positive (70%). — [Vaporlens: Subway Builder](https://vaporlens.app/app/4039140/subway_builder); [Steam](https://store.steampowered.com/app/4039140/Subway_Builder)
- Cities: Skylines (1) has 36+ info views that recolor the map:
  - traffic shows "in red the roads and intersections that are most heavily used"
  - happiness is a red-to-green gradient on buildings
  - education coverage colors roads green, or grey where uncovered
  - electricity shows connected buildings blue with a light-blue catchment
  - the transportation view highlights transport types and utilization (passengers per week)
  
  — [Cities: Skylines wiki, Info views](https://skylines.paradoxwikis.com/Info_views)
- In Cities: Skylines Mass Transit, selecting a line lists its stops and how many passengers wait at each. A Traffic Routes info view visualizes the trips of a clicked citizen, vehicle, building or road segment. — [Paradox dev diary, Mass Transit #1](https://admin-forum.paradoxplaza.com/forum/developer-diary/cities-skylines-mass-transit-dev-diary-1-more-than-just-new-public-transport-types.1005446)
- Cities: Skylines II developers showed "info view panels" for working on each line and finding its data at a glance. I only saw this via a search snippet because the source returned 403. — [TechRaptor](https://Techraptor.net/gaming/news/cities-skylines-2-developers-discuss-details-about-public-and-cargo-transportation); [Paradox CS2 transport features page](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation)
- Transport Fever 2:
  - The destinations layer prints passenger counts on streets. Blue means people will walk or drive, and green means an existing passenger line already serves that direction.
  - Players complained that a white overlay appears too often and "blocks everything" when viewing cargo demand.
  - The line manager shows each line's profit or loss, with a time graph for yearly figures.
  
  These are forum posts. — [Steam TF2 discussion (destinations, white overlay)](https://steamcommunity.com/app/1066780/discussions/0/1737761716219384975); [Steam TF2 discussion (line manager)](https://steamcommunity.com/app/1066780/discussions/0/3413181407709712527); [Steam TF2 discussion (layers)](https://steamcommunity.com/app/1066780/discussions/0/601889972151217526)
- The Transport Fever 2 Console Edition review says "the UI is fantastic, and menus clear to reach and use". — [God is a Geek: TF2 Console Edition](https://godisageek.com/?p=274455)
- OpenTTD shows a station's catchment while placing it if "Coverage area highlight" is on, or afterward with a "Coverage" button in the station window. The default catchment radius is 4 tiles, or varies by station type when realistic catchment is enabled. A transparency toolbar makes station signs, trees, buildings and more see-through or invisible, and X toggles them all. — [OpenTTD wiki: Catchment area](https://wiki.openttd.org/en/Manual/Catchment%20area); [OpenTTD wiki: Transparency options](https://wiki.openttd.org/en/Manual/Transparency%20options); [r/openttd thread](https://lr.psf.lt/r/openttd/comments/1k27qnk/how_do_i_hide_buildings_and_show_the_coverage_of)
- Railway Empire 2 has an extensive tutorial and a "Tips and Tricks" menu, and some elements are "more streamlined and easier to grasp". Update 1.3 added F11 to hide the UI. — [God is a Geek RE2 review](https://godisageek.com/reviews/railway-empire-2-review/); [SteamDB patch notes 1.3](https://steamdb.info/patchnotes/14262574)
- The original Railway Empire was called "absurdly obtuse" in its interface, with a minimap "too small to be helpful". This criticism is of RE1, not RE2. — [GameWatcher: Railway Empire review](https://www.gamewatcher.com/reviews/railway-empire-review/12958)
- Subway Builder's tutorial was "only moderately helpful". — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)

### Inferences
- 레일맵's layout follows the Mini Metro principle of keeping the HUD peripheral and grouped: a top-left navy date badge, toolbar, and right-side panel. Mini Metro uses icons for resources because color and shape are already "spent" on the network. Likewise, 레일맵's HUD and panels should stay navy/beige and not borrow line colors.
- Subway Builder's on-map demand bubbles were the most praised info feature, and hiding them during building was the top complaint. If 레일맵 adds a demand overlay, it should stay visible (or optionally visible) while placing stations and track.
- Cities: Skylines and Transport Fever 2 use whole-map recolor overlays, and TF2 users complain the white wash "blocks everything". A 레일맵 overlay should follow the flat, no-translucency rule: solid-colored dots or bubbles on top of the beige map, not a semi-transparent wash.
- None of the researched games was documented as using on-map callouts for notifications. 레일맵's speech-bubble alerts are closer to the explainer-video convention and Mini Metro's station-anchored pulse/ring warnings (the warning is drawn at the location of the problem) than to toast popups.
- Catchment display precedent: OpenTTD shows it while placing, or on demand from the station window. That suggests showing a station's walking radius only during station placement, keeping the normal view clean.

### Gaps
- No source describing the screen position of money, date and speed controls in Cities: Skylines II, Transport Fever 2, NIMBY Rails or Subway Builder.
- No source on notification style (toast vs. on-map) in any of these games except Mini Metro's station pulse/countdown.
- No source on Cities: Skylines II's transport info-view color legend.

## 5. Readability at different zoom levels; accessibility (color-blind palettes)

### Takeaway
Small icons and text are the most common accessibility complaint: Mini Metro's passenger shapes, and Subway Builder's lack of UI scaling. Colorblind modes exist in Mini Metro and Mini Motorways, but no source documents their exact palettes. Red/green passenger colors were still reported as hard to tell apart. For categorical line colors, the standard colorblind-safe set is Okabe-Ito (8 colors), and about 8 is a practical maximum.

### Cited Findings
- A colorblind player said they could not "really tell the difference between the red and green passengers" (in a Mini Metro-like context, per search summary). Shapes were clear, but color matching was guesswork. — [itch.io comment](https://itch.io/post/3771968)
- Mini Metro has no option to enlarge station or passenger icons. Clutter increases as stations are added, and passenger dots are hard to read. Zoom while paused is the main workaround. — [Can I Play That](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- Mini Metro's colorblind mode "adjusts the colors to be readable for those with certain kinds of colorblindness". The specific changes are undocumented. — [Mechanics of Magic](https://mechanicsofmagic.com/2023/04/22/visual-design-of-games-mini-metro/)
- Subway Builder: "no UI scaling makes text unreadable" on Steam Deck, and there is no high-resolution scaling. — [Vaporlens](https://vaporlens.app/app/4039140/subway_builder)
- Okabe-Ito palette: #E69F00 orange, #56B4E9 sky blue, #009E73 bluish green, #F0E442 yellow, #0072B2 blue, #D55E00 vermillion, #CC79A7 reddish purple, #000000 black. It was designed to stay distinguishable across the main types of color-vision deficiency, and is also called the Wong palette. — [Okabe-Ito hex reference](https://dev.conceptviz.app/fr/blog/okabe-ito-palette-hex-codes-complete-reference); [The Node: data visualization with flying colors](https://thenode.biologists.com/data-visualization-with-flying-colors/research/)
- Beyond about eight colors, readily distinguishable categorical colors are "close to impossible" to find. — [The Node](https://thenode.biologists.com/data-visualization-with-flying-colors/research/)

### Inferences
- Mini Metro relies on two redundant channels, shape and color, and its shapes stay legible even where colors fail. 레일맵's lines are identified only by stripe color, so it should add a second channel: a line number or letter badge on the station bubble or panel, in the navy and yellow badge style.
- Several Okabe-Ito colors clash with 레일맵's reserved meanings. #E69F00 and #D55E00 are close to the construction orange #C9772F. #F0E442 is close to the yellow accent #F2C230. #0072B2 is close to the station blue and navy. A 레일맵 line palette should be tested against those reserved colors, not adopted blindly.
- Pixel-sized (zoom-independent) trains and station symbols, plus a minimum zoom for labels, address the "too small" complaints. CLAUDE.md's 50-station target makes label collision handling (MapLibre symbol collision) relevant.

### Gaps
- No documented hex values for any game's colorblind mode.
- No source on zoom-level label rules (label density by zoom) in any of the researched games.

## 6. What players and reviewers praise or criticize about visuals and UI clarity

### Takeaway
Praise goes to restraint (Mini Metro's elegance, Subway Builder's minimalism), on-map data that changes visibly as the network grows (Subway Builder's red-to-rainbow bubbles), and clear finance dashboards. Criticism goes to tiny icons and text, clutter as networks grow, overlays that disappear or wash out the map, no UI scaling, and fixed line colors.

### Cited Findings
- Mini Metro was nominated for "Excellence in Visual Art" at IGF 2016, and won the audio award instead. Critics praised its geometric simplicity, calling it "aesthetically pleasing" (Technology Tell), and its elegance (Kill Screen). — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Metro criticisms: small icons and text, clutter as stations grow, unchangeable line colors. — [Can I Play That](https://caniplaythat.com/2019/12/28/visually-impaired-game-review-mini-metro/)
- Mini Motorways reviewers describe it as minimalist, with colored cars adding liveliness compared with Mini Metro. — [Game Informer review](https://gameinformer.com/review/mini-motorways/contemplative-commute); [KeenGamer review](https://www.keengamer.com/articles/reviews/pc-reviews/mini-motorways-review-control-the-open-road-pc/)
- Subway Builder:
  - Praise: minimalist style, dark mode making rails pop, demand bubbles, readable finance dashboard.
  - Criticism: hard layered track crossings, overwhelming train sounds, demand stats hidden during building, save-menu overwrite risk.
  
  — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Subway Builder aggregated criticism: cluttered UI, no UI scaling, no keyboard shortcuts, always-online requirement, performance on low-VRAM hardware. — [Vaporlens](https://vaporlens.app/app/4039140/subway_builder)
- Transport Fever 2: the white overlay complaint above, and praise for the console UI. — [Steam TF2 discussion](https://steamcommunity.com/app/1066780/discussions/0/1737761716219384975); [God is a Geek](https://godisageek.com/?p=274455)
- Railway Empire 2: a Steam user said the UI "has lost most of its 1800 USA charm". A reviewer noted it "doesn't have the greatest of visuals" but is more streamlined than RE1. — [Steam RE2 discussion](https://steamcommunity.com/app/1644320/discussions/1/3843304884852855699); [God is a Geek RE2](https://godisageek.com/reviews/railway-empire-2-review/)

### Inferences
- The strongest praise in this sample is for "data you can see change on the map", which suits 레일맵's on-map callouts and station bubbles. The strongest criticism is for "too small" and "too cluttered". 레일맵's beige-only background and the rule against labeling everything align with the praised side. The 50-station and 30-train target should be checked visually for clutter.
- Theming (period charm in Railway Empire) is noticed when lost. A consistent explainer-video identity (navy badges, yellow dots, beige ground) is part of 레일맵's appeal and should be kept consistent across panels, not just the map.

### Gaps
- No review content found specifically on NIMBY Rails' visual clarity, Metro Dreamin' or OpenTTD readability.
- No Reddit threads were retrieved. Search results did not surface them.
