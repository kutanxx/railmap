# On-screen UI layout (HUD) of transit and railway building games

Scope note: research date 2026-10-27. Strongest primary sources: the Subway Builder official changelog (versions 0.5 to 1.7.2, through 2026-09-29), the NIMBY Rails wiki and devblog, the OpenTTD wiki manual, Dinosaur Polo Club posts and postmortems, and Rail Route itch.io devlogs. Mini Metro's exact current HUD layout has no official written description online. The best text sources are a 2014 beta-era Steam guide and a fan re-implementation PR, so treat those details as "probably still true, not confirmed". Transport Fever 2, Railway Empire 2 and Workers & Resources were only lightly covered: I found patch notes and forum or review fragments, with no layout descriptions.

## 1. Toolbar / build tools (placement, count, icons vs text, shortcuts)

### Takeaway
The minimal games (Mini Metro) have no "tool" toolbar at all. Drawing is direct manipulation, and the bottom bar holds the resources you drag out. The deep sims use either a long icon menu bar at the top (OpenTTD: 28 buttons in 7 groups) or a mode-based construction panel with keyboard shortcuts per category, plus a command search (Subway Builder: Cmd+K, right-click context menus). The trend in the 2025–2026 games is toward fewer always-visible buttons and more context menus, search and hotkeys.

### Cited Findings
- **Mini Metro (beta5 guide, 2014):** numbered screen elements are a clock, a Back button (restart / menu / quit, also Escape), a Pause/Play button (also Spacebar; tracks can still be edited while paused), a locomotives-remaining count, a carriages-remaining count, a row of line ("track") circles, and a tunnels/bridges-remaining count. A large circle means the line is placed, a small circle means it is available, and grey means unlocked later. You select a line's circle and click an x to delete the line. — [Steam guide "The Mini-Metro Extensive Guide (beta5)"](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)
- **Mini Metro:** resources are used by dragging. One locomotive is used automatically when a line is created, or you drag from the locomotive button onto a line. You drag a carriage from its button onto a line (+6 seats). — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)
- **Mini Metro (fan re-implementation that copies the original layout):** top-right group of a coin with line credits, a delivered-passenger count with a walking-figure icon, the weekday (MON…SUN) and a dark week-clock dial. The bottom bar has grey locomotive and carriage icons with counts, to the left of the line buttons. *Not official; it describes a clone's reading of the original.* — [GitHub PR mini-metro-rl #2](https://github.com/brian-muen/mini-metro-rl/pull/2)
- **Mini Metro editing is direct:** you drag station to station to make a line, drag the "T" end of a line to extend it, and drag a track segment off a station to remove that stop. There are no edit-mode buttons. — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)
- **OpenTTD:** the screen is a top menu bar, the world view, and a bottom status bar. The menu bar runs left to right through 7 groups and **28 buttons**: Game controls (Pause, Fast Forward, Options, Save/Load), Map info (Minimap, Town directory, Subsidies, Station list), Company (Finances, Company info, Graphs, League, Industries), Vehicles (Train, Road, Ship, Aircraft), Zoom (in, out), Construction (Rail, Road, Tram, Docks, Airports, Landscaping), and Other (Jukebox, News, Other). A "Switch toolbar" button appears only at very low resolutions. Right-clicking a button shows a tooltip, a click runs the default action, and click-and-hold opens a submenu. — [OpenTTD wiki: Game interface](https://wiki.openttd.org/en/Manual/Game%20interface)
- **Subway Builder modding API names its UI regions:** `bottom-bar` ("next to clock, money"), `top-bar` (described as the "right side toolbar"), `escape-menu`, `main-menu`, and `settings-menu`. Mod panels are added with `addToolbarButton` / `addToolbarPanel`, and floating panels "dock to the side of the screen". — [Subway Builder docs: UI Customization](https://subwaybuilder.com/docs/v1.0.0/api-reference/ui)
- **Subway Builder shortcuts and tools (changelog):**
  - 0.7.3 (2025-10-20): "Keyboard shortcuts for action categories" and "Undo/Redo for track construction".
  - 0.9.0: "More keyboard shortcuts that can be customized".
  - 0.10.0: Q/E rotate the map; Page Up/Down change track elevation in build mode.
  - 1.4.5: track-builder selectors became "dropdowns as well as cycle buttons", plus a toggle to turn off right-click-to-delete.
  - 1.7.0: the G key cycles track lane counts in the construction panel.
  - 1.7.2 (2026-09-29): "Cmd+K to search through various menus" and right-click context menus for routes, stations and station groups.
  - 0.5.0: right-click cancels track drawing.
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder "advanced mode":** some construction options are gated behind an advanced mode, for example switching track direction (1.7.0) and the auto-crossover toggle (1.4.5). In 1.4.17, "Crossovers don't need Advanced Mode anymore." — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder drawing feedback:** while drawing, it shows track length and curve radius (1.7.0), a station cost indicator (1.4.0), hover indicators for deleting tracks (1.4.0), a traffic-light icon for grade conflicts on blueprint tracks (1.7.2), and marks on unconnected tracks and unbuilt crossovers (1.6.0). — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **NIMBY Rails:** "fixed panels that sit slightly inset from the screen edges"; the developer "accepted the modal nature of the editors". A February 2020 cleanup unified how tools work, how listings are presented, and how the main interface blocks are arranged. — [NIMBY Rails development retrospective](https://carloscarrasco.com/nimby-rails-retrospective/)
- **Rail Route editors:** a side panel was added to all editors. Clicking an object in the main view shows its properties there. Ctrl+Z / Ctrl+Y undo and redo; Space switches infrastructure and scenery mode. — [Rail Route devlog: UI update part 3 (editors)](https://itch.io/devlog/231011/user-interface-update-part3-editors.amp)
- **Workers & Resources:** has a user-mappable "shortcut bar". Players have asked to pin building info windows to it. — [Steam discussion](https://steamcommunity.com/app/784150/discussions/0/4352247707590451997) (search snippet; not independently verified)
- **Railway Empire 2, QoL Update 1.3:** added F11 to hide the UI and new keyboard shortcuts that open panels such as the rail line list and city list. — [SteamDB patch notes 14262574](https://steamdb.info/patchnotes/14262574) (page returned 403 to me; claim comes from the search-result summary)

### Inferences
- For 레일맵's four tools (select, station, track, route), a small icon+text bar is between the Mini Metro extreme (no tools) and OpenTTD (28). Subway Builder's direction (hotkey per category, right-click context menu on objects, Cmd+K search) is how a deep game keeps the always-visible bar short.
- Live numbers shown during the drag itself (cost, length, curve radius, conflict icons) are a strong pattern. Subway Builder kept adding them across 2025–2026.

### Gaps
- No official, current written description of Mini Metro's HUD. The placement (clock and score top right, lines and resources bottom) comes from a 2014 guide and a clone. Best verified by looking at the game or official screenshots directly.
- I could not access Game UI Database (403). Its screenshots would answer Transport Fever 2, Railway Empire 2 and W&R toolbar questions.
- Subway Builder: I found no text on the exact number or order of toolbar buttons.

## 2. Money / date / time-speed display

### Takeaway
Clock, money and speed are grouped together in a single strip. OpenTTD and Subway Builder put it at the bottom; Mini Metro puts the clock and score top right. Clicking the clock is the common way to pause or change speed. New games increasingly start paused.

### Cited Findings
- **OpenTTD status bar** (bottom, 3 sections): date on the left (about one day per 2.22 s), then company name, pop-up news and status such as paused/autosave/saving in the middle, and money on the right. — [OpenTTD wiki: Game interface](https://wiki.openttd.org/en/Manual/Game%20interface)
- **Subway Builder:** the bottom bar holds the clock and money ("next to clock, money"). — [Subway Builder UI docs](https://subwaybuilder.com/docs/v1.0.0/api-reference/ui)
- **Subway Builder time controls:**
  - 1.7.0: "You can now right click the clock to slow down time."
  - 1.4.17: "New games start paused so you can look around before the clock runs."
  - 1.5.0: "Made game start paused by default".
  - 0.6.1: settings for 24-hour time and imperial units.
  - 1.0.0: play-time counter.
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder finance:** "Bloomberg-Terminal-inspired styling for the financial dashboard" (1.3.0); per-route financial panels (1.6.0); a "last 48 hours" financial stats option (0.10.0). — [changelog](https://www.subwaybuilder.com/changelog). A reviewer says revenue can be viewed by day, two weeks or all time, with operating profit and charts, and is "easy to read". — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- **Mini Metro clock:** white 6am–6pm and dark 6pm–6am; one day is 20 seconds (beta5). — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555). Pause by clicking the clock or pressing Space (alpha9). — [Dinosaur Polo Club alpha9 notes](https://dinopoloclub.com/2014/04/21/mini-metro-alpha9/). The clock "ticks away game time in hours and days"; clicking it pauses. — [Podfeet review](https://www.podfeet.com/blog/2016/11/mini-metro/) (via search summary)
- **Mini Metro "money":** there is none. The weekly reward (a locomotive every Sunday plus a choice of two upgrades) replaces economy. — [Giant Bomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro); [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)

### Inferences
- 레일맵 already has a date badge top left and money at the top. Precedent supports grouping date, speed and money into one strip, and making the date/clock itself the speed control (click to pause, right-click to slow, as in Subway Builder).
- I found no source describing animated income/expense signals (floating "+₩" numbers and the like) in these games. That design is open, and nothing here points to one convention.

### Gaps
- How Transport Fever 2 and Railway Empire 2 show money changes (floating numbers above vehicles, for example) was not found in text sources.

## 3. Line (route) list and line detail panel

### Takeaway
The deep games converge on a routes list plus a detail panel, with tabs for stops, schedule/timing, stats/finance and reliability. Mini Metro reduces a line to one colored circle in the bottom bar. Subway Builder's 2026 changes show what players asked for: a separate list panel, duplicate, per-route finance, a ridership-per-station chart, load filtered by time and direction, and a capacity warning.

### Cited Findings
- **NIMBY Rails line overview:** a list of all lines with sort and display options at the top, plus:
  - a map icon that limits the list to lines visible on the map;
  - grouping (All / Tags / Untagged) and filters (Closed, Technical, Open, With warnings);
  - a compact display option;
  - **6 buttons at the bottom:** new line, new depot line, clone, intervention to trains, delete, and follow-selection pan/zoom toggle.
  - Selecting a line opens its settings window to the right of the overview.
  - [NIMBY Rails wiki: Line](https://wiki.nimbyrails.com/Line)
- **NIMBY Rails line window:** 4 tabs (Stops, Timetable, State, Accounting [WIP]).
  - Stops tab: name; **line code** (shown on the train icon and platform overview instead of the full name); base ticket price and price per km; color (used on the map and in the overview); Display on Map; service level; default timings (reference train, cruise speed, acceleration, stop time, line duration, padding); auto-run settings (first departure, interval auto/manual); and the stop list.
  - Timetable tab: one day of trains; hover reveals orders; arrows switch days; zoom buttons.
  - [NIMBY Rails wiki: Line](https://wiki.nimbyrails.com/Line)
- **NIMBY Rails line editor** (Aug 2019): no limits on station count or ordering; accounts for direction of travel. Lines sharing track are drawn stacked side by side "similar to real transit maps". — [NIMBY retrospective](https://carloscarrasco.com/nimby-rails-retrospective/)
- **Subway Builder route UI timeline:**
  - 0.7.3: custom route colors; follow a train along its route.
  - 1.0.0: the route's station list shows transfers to routes in the same station group.
  - 1.4.0: route groups easier to organize.
  - 1.4.5: leaving route editing asks about unsaved changes.
  - 1.5.0: route speeds panel; ridership-per-station chart in the route stats panel.
  - 1.6.0: new routes list panel; duplicate route button; per-route financial panels.
  - 1.7.0: restyled route details panel; "remastered" route creation form; route bullets with custom text colors; route load panel filtered by time of day and direction; change train type just after creating a route.
  - 1.7.2: route reliability tab (on-time performance); "Better route capacity warning UI".
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder customization:** players pick from 15 track colors, name lines, and customize logo shapes. Light and dark modes exist; the reviewer prefers dark because line colors pop. — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- **Subway Builder train purchase:** a "buy trains" panel with +/- buttons; Shift held with +/- buys faster. — [changelog 0.10.0](https://www.subwaybuilder.com/changelog)
- **Mini Metro:** each line is a circle in the bottom row (large = in use, small = available, grey = locked). Train count is changed by dragging locomotive and carriage icons onto the line. Stops are added and removed by dragging line ends and segments on the map. — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)
- **Transport Fever 2 line manager:** players complain it is "all or nothing" with no display filtering ([Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/2639605659780588872)). It has an eye icon to show only lines in view ([Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3105766884450758904)). Line and vehicle managers could not be moved or resized, and a new line/station/vehicle window replaces the one docked on the right unless pinned ([Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3963662301883409496)). A July 2023 update improved line highlighting in the line manager, added opening a line from it, and added a delete confirmation (search summary of TF2 patch notes; source thread not opened). *All forum-sourced; versions differ.*
- **Railway Empire 2:** a hotkey opens the rail line list (Update 1.3). — [SteamDB 14262574](https://steamdb.info/patchnotes/14262574) (via search summary)

### Inferences
- A "short code" (NIMBY line code, Subway Builder route bullet) shown on trains and in station panels saves space compared with full names. 레일맵 could give each route a number or letter bullet in its color.
- Common to NIMBY and Subway Builder: a list panel with color swatch, name, stats and filters, and a detail panel opened beside or over it. "Duplicate route" and "follow the selected thing on the map" recur in both.

### Gaps
- No source lists the exact columns in the NIMBY or Subway Builder route list (ridership, profit, train count?).
- Transport Fever 2 official manual content was not found.

## 4. Station info panel

### Takeaway
Mini Metro has no station panel: crowding is drawn on the station itself. Deep games open a docked side panel or window on click. NIMBY puts platform occupancy and timetable views inside the station window. Subway Builder added ridership-by-hour charts per station and station group, and right-click menus.

### Cited Findings
- **NIMBY Rails station window:** the timetable widget (boxes on a time axis) sits inside the station info window and scales horizontally with it (Jul 2022). — [NIMBY devblog 2022-07](https://carloscarrasco.com/nimby-rails-july-2022/). The platform tab highlights line stops that overlap another stop on the same platform, with a tooltip listing the conflicts (Oct 2022). — [NIMBY devblog 2022-10](https://carloscarrasco.com/nimby-rails-october-2022/)
- **Subway Builder:**
  - "Station/station group/route ridership by hour charts" (0.10.0).
  - The station details panel no longer breaks when another nav panel opens (1.6.0 fix), which implies panels stack or navigate.
  - Departure boards (1.7.0 fix for cut-off names).
  - Right-click context menus on stations and station groups (1.7.2).
  - Stations auto-named from cross streets (0.8.0).
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder pinning:** demand stats can be pinned to the side (0.7.3); Escape no longer closes pinned demand stats (1.4.10); pinned panels no longer leave the source panel split off (1.5.0). — [changelog](https://www.subwaybuilder.com/changelog)
- **Transport Fever 2:** station, line and vehicle windows appear at the right edge and replace each other unless moved or pinned. — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3963662301883409496)
- **Rail Route:** properties of the clicked object show in a fixed side panel (editors). — [Rail Route devlog](https://itch.io/devlog/231011/user-interface-update-part3-editors.amp)
- **Mini Metro:** the station shows waiting passengers as shapes ([Giant Bomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro)), and an overcrowding timer fills on the station. Alpha 12 changed it to "begin empty and fill up" instead of draining. — [Softpedia changelog (Alpha 12)](https://games.softpedia.com/progChangelog/Mini-Metro-Changelog-142507.html)

### Inferences
- The pattern of a single docked panel that replaces itself, with an optional "pin" to keep one open, appears in TF2 and Subway Builder. It suits 레일맵's existing top-right panel, plus a pin to compare two stations.

### Gaps
- No source lists the full field set of a Subway Builder station panel.

## 5. Notifications / alerts

### Takeaway
Two families. In-world markers sit on the problem object (Mini Metro station timer; Subway Builder track error marks, traffic-light icons, capacity warning; Rail Route train labels colored by required action). Text messages are a ticker or log with per-type verbosity (OpenTTD Off/Summary/Full, red dot). Subway Builder also has toasts plus a dedicated warnings panel docked flush to the screen edge.

### Cited Findings
- **OpenTTD:**
  - News pops up from the status bar; clicking the bar reopens the last message.
  - Per message type: Off (not shown, red dot indicator), Summary (scrolls in the status bar), Full (news window pops up).
  - The News button shows the last report and history, and can delete all.
  - [OpenTTD wiki: Game interface](https://wiki.openttd.org/en/Manual/Game%20interface); [archived Message settings](https://wiki.openttd.org/en/Archive/Manual/Settings/Message%20settings)
- **Subway Builder:**
  - A warnings panel "sits flush against the edge of the screen again" (1.5.0).
  - Toasts exist (1.7.0 fix: zoom buttons and toasts no longer overlap the bottom bar on small screens).
  - "Route errors say what's actually wrong" (1.4.17).
  - "Better route capacity warning UI" (1.7.2).
  - Elevation-gap errors show the intersection point (1.6.0).
  - Achievement notifications stopped re-firing each session (1.4.5).
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Rail Route:** train labels show the destination, and "their colors reflect the action required"; the contracts icon got a badge; an overview panel highlights important trains. — [Rail Route devlog "DEMO: the last alpha update"](https://bitrich.itch.io/railroute/devlog/233263/demo-the-last-alpha-update)
- **Mini Motorways:** "a timer will appear over that building when cars take too long". — [LadiesGamers review](https://ladiesgamers.com/mini-motorways-review/) (via search summary)
- **Mini Metro:** an overcrowded station starts a timer on the station (7+ passengers; about 45 s in beta5; it drains slowly). — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555)
- **Workers & Resources:** criticized for "very little feedback telling you why something is not working". — [Steam discussion](https://steamcommunity.com/app/784150/discussions/0/4352247707590451997) (search snippet)

### Inferences
- Marking the problem on the map, with the message saying what is wrong, matches 레일맵's "speech bubbles on the map instead of corner popups" rule. The OpenTTD per-type verbosity setting and the Subway Builder warnings list are ways to avoid clutter: a small count badge plus a list on demand.

### Gaps
- No source describes how Subway Builder groups or limits repeated toasts.

## 6. Zoom-level dependent information

### Takeaway
Labels and context layers fade by zoom. NIMBY fades relief and land-use rasters as you zoom in and switches tracks and trains to true scale past a zoom threshold. Subway Builder keeps major roads at far zoom, makes station labels a separate layer, avoids marker collisions, and plays station ambience only when zoomed in.

### Cited Findings
- **NIMBY Rails:** relief and land-use raster layers show at low and medium zoom and fade out as you zoom in; tracks and trains scale to real-world size past a zoom level; lines sharing track are stacked. — [NIMBY retrospective](https://carloscarrasco.com/nimby-rails-retrospective/)
- **Subway Builder:**
  - Major roads and highways stay visible when zoomed out (1.6.0).
  - Roads don't fade when zoomed out if the construction panel is open (0.9.0).
  - Station labels are a separately toggleable layer from station dots (1.7.0).
  - Station markers avoid colliding (1.7.0).
  - Minimum zoom is set automatically from city bounds (1.7.0).
  - Map labels for cities, suburbs and neighborhoods (1.1.0); road labels (0.8.0).
  - Bridges drawn at 50% opacity so tracks show underneath (1.4.10).
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder audio by zoom:** station ambience gets louder at busier stations when zoomed in. — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- **OpenTTD:** 6 zoom levels (1x, two in, three out); zoom buttons are disabled at the limits. — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Game%20interface)
- **Mini Motorways:** a later update added "a suite of new zoom options to help you better plan your cities". — [Dinosaur Polo Club update post](https://dinopoloclub.com/?p=2113)

### Inferences
- Tying road visibility to the active tool (show roads while building even when zoomed out) is a cheap trick that fits 레일맵's track tool.

### Gaps
- No exact zoom thresholds are published for any game.

## 7. Statistics, graphs, schematic views and overlays

### Takeaway
Subway Builder is the richest current reference. It has separate map "views" (route loads, route utilization/load factor, track speed, demand bubbles colored car vs transit, commercial density tint), per-hour ridership charts, a finance dashboard, and auto-generated schematic maps from the escape menu. OpenTTD keeps graphs and league tables behind toolbar buttons.

### Cited Findings
- **Subway Builder overlays and views:**
  - "Route Loads" map tool for station/route-pair popularity (1.3.0).
  - "Route utilization" map view showing load factor (1.7.0).
  - Hovering a route section in the load view shows commuter counts (1.7.0).
  - Track speed layer: hover shows elevation and speed limit (1.0.0).
  - Subtle neighborhood tint for commercial or college worker density (1.5.0).
  - Toggle to fade demand dots (1.6.0).
  - Shift-drag to select multiple demand points (0.9.0 / 1.4.0).
  - Map-layer visibility saved in save files (1.2.0).
  - Annotations tool to sketch the network before building (1.3.0).
  - "Auto-generate schematic maps" from the escape menu (1.4.0).
  - Save thumbnails show the route map (0.9.0).
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder demand bubbles:** red for car-centric areas, blue as people switch to transit. A reviewer complained that Demand Stats disappear once building starts, forcing toggling. — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- **OpenTTD:** Graphs and Company League are toolbar buttons (performance and economy graphs). — [OpenTTD wiki](https://wiki.openttd.org/en/Manual/Game%20interface)
- **NIMBY Rails:** timetable charts inside station and line windows. — [NIMBY wiki: Line](https://wiki.nimbyrails.com/Line); [devblog 2022-07](https://carloscarrasco.com/nimby-rails-july-2022/)
- **Transport Fever 2:** has a Line Statistics window (players use it to isolate a line on the map). — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/2639605659780588872)

### Inferences
- 레일맵's [혼잡도 보기] (congestion view) is the same kind of "map view mode" as Subway Builder's route utilization. Adding further modes (ridership, profit) as one exclusive "view" selector is consistent with that precedent. The reviewer's complaint suggests that info overlays should stay readable while building.

### Gaps
- No source for exact chart types in the Subway Builder finance dashboard.

## 8. Onboarding / tutorial and progressive disclosure

### Takeaway
Subway Builder reworked its tutorial in 2026 to teach demand and explain "why". New games start paused, advanced construction options sit behind an Advanced Mode, and some features (crossovers) were moved out of it once deemed basic. Mini Metro discloses progressively through the game itself: one line at start, more lines and resources unlocked weekly as upgrade choices. Rail Route highlights UI items during the tutorial.

### Cited Findings
- **Subway Builder 1.4.17 (2026-07-20):**
  - "The tutorial teaches demand now."
  - "Tutorial steps tell you why, not just which button to press."
  - Finishing the tutorial drops you at city select with one confirmation.
  - Measure tool on by default.
  - New games start paused.
  - Crossovers no longer need Advanced Mode.
  - Interface size slider.
  - Version number opens release notes, plus a "What's new" button.
  - 1.5.0: the tutorial step chime is tuned to a pentatonic scale "so it's easier on the ears".
  - [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- **Subway Builder before that rework:** a reviewer found the tutorial "only moderately helpful". — [Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- **Mini Metro:** lines are unlocked through weekly upgrades (in beta5, until all seven are unlocked); unavailable lines appear grey in the bottom bar. — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=313791555). From week three you pick from two upgrade pools (alpha10). — [Dinosaur Polo Club alpha10](https://dinopoloclub.com/2014/04/30/mini-metro-alpha10/). Artist Jamie Churchman storyboarded the tutorial. — [Mini Metro postmortem](https://www.gamedeveloper.com/audio/postmortem-dinosaur-polo-club-s-i-mini-metro-i-)
- **Mini Motorways:** a button on the weekly upgrade screen lets you view the city while choosing, so you don't leave the decision. — [Dinosaur Polo Club update post](https://dinopoloclub.com/?p=2113)
- **Rail Route:** a new tutorial UI panel, with UI items highlighted during the tutorial. — [Rail Route devlog](https://bitrich.itch.io/railroute/devlog/233263/demo-the-last-alpha-update)
- **Workers & Resources** is a counter-example: reviews cite the "flood of UI information" behind its steep learning curve and ask for in-game tooltips. — search summaries of [Destructoid](https://destructoid.com/?p=541669) and [Steam discussion](https://steamcommunity.com/app/784150/discussions/0/4352247707590451997) (not opened)

### Inferences
- "Start paused", "explain why", and "highlight the actual UI element" are three cheap, well-attested tutorial rules. 레일맵's existing tutorial and its pentatonic sound scale already line up with Subway Builder's.

### Gaps
- No detailed developer write-up of Mini Metro's tutorial design.

## 9. Developer statements about UI goals

### Takeaway
Mini Metro's minimal UI came from constraints (two programmers, no artist) and transit-map graphic design (London and New York). It was later redesigned by artist Jamie Churchman, and a GDC 2017 talk frames it as "building a design language through elimination". NIMBY's developer prioritizes sharp vector UI at any DPI and fitting 1366×768. Subway Builder's changelog shows a steady trend toward context menus, search, pinning and clearer error text.

### Cited Findings
- **Mini Metro:**
  - "From its very inception, the key design pillar for Mini Metro has been minimalism," extended "to every part of the player experience". — [Dinosaur Polo Club: Mobile and pricing](https://dinopoloclub.com/2015/01/15/mobile-and-pricing/) (via search summary)
  - The interface took "heavy inspiration from graphic design of the London and New York subways"; Helvetica was kept; a small art job grew into a redesign of every visual element; Churchman redesigned the interface for desktop and mobile. — [Mini Metro postmortem](https://www.gamedeveloper.com/audio/postmortem-dinosaur-polo-club-s-i-mini-metro-i-)
  - Mobile needed "bigger buttons and less whitespace". — [Dinosaur Polo Club: Mobile and pricing](https://dinopoloclub.com/2015/01/15/mobile-and-pricing/) (via search summary)
  - Peter Curry: neither founder had artistic ability, so "any game they made should have a clean, abstract interface without extensive production art". — Vice interview, via search summary ([Vice](https://vice.com/en/article/we-asked-a-transit-planner-how-to-up-our-mini-metro-game); exact article not opened)
  - GDC 2017 talk "Mini Metro: When Less…" by Jamie Churchman covers the successes and failures of the visual design, how UI decisions shape the player experience, and building a design language through elimination. — [GDC Vault listing](https://gdcvault.com/play/1024250/-Mini-Metro-When-Less) (vault was in maintenance; description from search summary)
- **Mini Metro and Mini Motorways:** both were designed with a color-blind mode from the start. Mini Metro combines colors and shapes on a neutral background. — [Game Developer: Mini Motorways and minimalism](https://www.gamedeveloper.com/audio/-i-mini-motorways-i-and-the-delicate-art-of-marrying-complexity-and-minimalism)
- **Mini Motorways:** mechanics should be "transparent to the player" yet not heavy-handed. Inspiration was novelty tourist maps "with bright colours and a scale that highlights the important roads". — [Game Developer](https://www.gamedeveloper.com/audio/-i-mini-motorways-i-and-the-delicate-art-of-marrying-complexity-and-minimalism)
- **NIMBY Rails (Carlos Carrasco):**
  - Nearly all UI elements are SVG, scaled by the OS factor.
  - The skin visually separates clickable elements from informational text.
  - The developer criticizes PC games with tiny or blurry UI.
  - Polish existing interaction patterns rather than invent new ones.
  - [retrospective](https://carloscarrasco.com/nimby-rails-retrospective/)
  - The train editor was made compact so the game UI fits at 1x on 1366×768. — [NIMBY devblog 2020-09](https://carloscarrasco.com/nimby-rails-september-2020/) (via search summary)
- **Rail Route:** the UI was redone "not only graphically but also practically", which delayed Early Access. It added ALT+S to hide the UI and ALT+B to hide the bottom part. — [Rail Route devlog](https://bitrich.itch.io/railroute/devlog/233263/demo-the-last-alpha-update)

### Inferences
- The Mini Metro lesson that applies to 레일맵 is the elimination process (remove until each element earns its place), not the look itself.
- **Imitation risk:**
  - Copying Mini Metro's exact bottom-bar row of line circles, with Helvetica and MTA-style styling, would read as a clone of a recognizable trade dress.
  - Subway Builder's route "bullets" resemble NYC subway bullets.
  - Using generic number or letter badges in 레일맵's own palette and fonts avoids both.
  - Both games' layouts (clock and money in one strip, side-docked panels) are generic conventions shared with OpenTTD and others, so they are low risk.

### Gaps
- The GDC 2017 talk content itself (slides or video) could not be accessed.
- I found no developer statements on UI for Transport Fever 2, Railway Empire 2 or Workers & Resources.
