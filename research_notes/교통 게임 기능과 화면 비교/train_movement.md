# Train movement and operations models in transit/rail games

Context for the report writer: 레일맵 currently moves trains at a constant 60 km/h along routes, out-and-back, with a fixed 30 s dwell, no signals, no collisions, and several trains per route evenly spaced. Trains are drawn as a short capsule line that bends along the route. Project rules forbid timetables and train driving before the demo. Each section flags findings that would conflict with this ("CONFLICT") or fit it ("FITS").

Research note: about 23 search and fetch calls. Most sources are official wikis, developer devlogs, patch notes and Wikipedia; player-sentiment items come from Steam forums. The NIMBY Rails official wiki didn't come up in searches, and a Steam timetabling guide returned HTTP 429, so its content below is from the search snippet only.

## 1. Physics: constant speed vs acceleration/braking, curve limits, max speeds

### Takeaway
Deep sims (OpenTTD, Transport Fever, NIMBY Rails, Subway Builder) all use acceleration, a per-vehicle top speed and per-track or curve speed limits. Arcade/puzzle games (Mini Metro, Train Valley) hide physics, and a constant cruise speed is the norm there. Real difference between vehicle types (metro accelerates fast, commuter rail is faster at the top end) is a common way to make the physics matter to the player.

### Cited Findings
- OpenTTD "realistic acceleration" is described as a simple physics model: acceleration depends on train weight, engine power and slope gradient. The wiki says it is "not perfect" but more realistic than original TTD. The setting was renamed "Train acceleration model" in 0.7.0. — [OpenTTD wiki: Realistic acceleration (archive)](https://wiki.openttd.org/en/Archive/Manual/Settings/Realistic%20acceleration)
- OpenTTD curve limits: 90-degree curves are limited to 61 km/h, and two successive 45-degree curves in the same direction to 88 km/h. Softer curves are limited based on the number of direction changes along the train's length. Stations and depots also impose speed limits. A heavy train with a weak engine may never reach its max speed. — [OpenTTD wiki: Realistic acceleration (archive)](https://wiki.openttd.org/en/Archive/Manual/Settings/Realistic%20acceleration)
- OpenTTD has no gradual braking for signals. A faster train that catches a slower one must stop completely behind it and then re-accelerate. The wiki contrasts this with real distant signals (double/single yellow), which let drivers slow down gradually. — [OpenTTD Manual: Signals](https://wiki.openttd.org/en/Manual/Signals)
- Transport Fever (community analysis, not official): tractive force ≈ min(power / speed, tractive effort), so tractive effort matters only at low speed (below about 5–10 km/h) and power-to-weight matters more. A 2016 thread describes a hyperbolic acceleration curve that is highest from a standstill. — [Steam: Transport Fever discussion](https://steamcommunity.com/app/446800/discussions/0/215439774872043182); [Steam: Transport Fever discussion 2](https://steamcommunity.com/app/446800/discussions/0/154641879448918185)
- NIMBY Rails devblog: "Dynamic traction for trains, with more realistic acceleration." The leg-time calculator "sims a train using the same formulas and code as the actual train AI." — [NIMBY Rails devblog 2021-02](https://carloscarrasco.com/page/54/)
- NIMBY Rails devblog says that if the track is bent into a small-radius curve, speed is severely decreased. The original track system fits the largest circle into each corner of a polyline, and a 2023 replacement aims for G2-continuous curves. — [NIMBY Rails devblog search results: 2021-04 / 2023-04 / 2023-06](https://carloscarrasco.com/page/28/) (the curve-speed quote comes from a search snippet attributed to an earlier devblog page and wasn't verified by a fetch)
- NIMBY Rails (player observation): players can set slower track limits, especially around stations and on curves. The game is "fairly forgiving on curves" and doesn't slow down on inclines. — [Steam: NIMBY Rails discussion](https://steamcommunity.com/app/1134710/discussions/0/604146154959017276)
- NIMBY Rails added a "path rider" layer, separate from train AI, that handles speed and position along a path. It replaced thousands of lines of train-AI code. — [NIMBY Rails devblog 2023-07](https://carloscarrasco.com/page/25/)
- Subway Builder has 4 vehicle types: heavy metro (NYC R211, up to 15 cars), light metro (Montreal REM, up to 4 cars), light rail (Seattle S700) and commuter rail (LIRR M9). Metro types "accelerate quickly but have lower top speeds", and commuter rail accelerates slowly with a higher top speed. — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Mini Metro: players don't control speed. Trains run "as quickly as they can", and an early upgrade raised train speed and boarding. — [Gigazine 2014](https://gigazine.net/gsc_news/en/20140306-mini-metro); [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))

### Inferences
- FITS: constant speed is a legitimate design choice. Mini Metro, the most successful minimal transit game, has no player-visible physics.
- Cheapest upgrade path that keeps 레일맵's rules intact: a simple trapezoid speed profile (constant acceleration to cruise, constant braking into stations) plus a curve-speed cap computed from the route polyline's turning angle. OpenTTD's angle-based rule (sharp turn → low cap) is easy to copy with Turf bearings. Neither needs signals, timetables or driving, so neither conflicts.
- With acceleration added, a fixed "60 km/h" no longer equals the average speed. Demand (gravity model using travel time) should then use the simulated leg time, as NIMBY's leg-time calculator does.
- If per-vehicle types are added later, Subway Builder's metro-vs-commuter trade-off is a compact way to make acceleration matter.

### Gaps
- No official NIMBY Rails wiki page on the acceleration/braking formula was found.
- No official Transport Fever 2 documentation on curve-radius speed limits was found. Community claims only.
- Mini Metro's exact base speed and how speed scales with upgrades weren't found from official sources.
- Railway Empire 1/2 and Cities: Skylines physics (acceleration, curve limits) weren't covered by sources found.

## 2. Stopping: dwell time, passenger-dependent boarding, skip-stop/express

### Takeaway
Sims either use a fixed minimum stop time that can stretch or shrink to hold schedule (NIMBY) or load-based waits (Railway Empire platform loading, OpenTTD full-load orders, not verified here). Skip-stop and express service exist in NIMBY and Transport Fever through per-stop orders and waypoints. No source found gives a passenger-count-based boarding formula for any of these games.

### Cited Findings
- NIMBY Rails (community guide): lines run at a user-defined cruising speed and make designated stops with defined stop times. Late trains have their stop time reduced to a 10-second minimum and run above cruising speed, up to train and track max, to catch up. Early trains get longer stops. — [Steam Guide: Timetabling Guide by adlet](https://steamcommunity.com/sharedfiles/filedetails/?id=3336772079) (fetch got HTTP 429, so this is from the search snippet only; the guide is about 2 years old)
- NIMBY Rails: skipping a station saves the stop min-wait and leg time. Transfers cost min-wait plus leg time, and the new pathfinder accounts for the interval between trains. — [NIMBY Rails devblog 2021-02](https://carloscarrasco.com/page/54/)
- Railway Empire 2: a train shows "waiting for deployment" when another train is scheduled onto the same platform, because loading needs that track to stay clear. The fixes are more platforms with crossovers or manual track assignment in the line editor. — [GamePressure guide](https://www.gamepressure.com/newsroom/railway-empire-2-how-to-fix-waiting-for-deployment-alert/zd57a0)
- Railway Empire 2 Update 1.0.3 stopped trains from halting at stations on their route when no action was possible. In effect, this skips needless stops. — [Kalypso: RE2 Update 1.0.3](https://www.kalypsomedia.com/post/railway-empire-2-update-1-0-3-1)
- Transport Fever 2: players use waypoints to route express trains around slower ones via passing tracks. One player warns that "dynamic pathing isn't a thing in TF2", so a passing track shared by both directions may not work. — [Steam: TF2 discussion](https://steamcommunity.com/app/1066780/discussions/0/4323991324853006644)
- Real-world context: managing dwell times is a key factor in line capacity on the London Underground. — [LURS: London Underground Signalling (2021)](https://lurs.org.uk/02_Dec_2021_LONDON_UNDERGROUND_SIGNALLING.pdf)

### Inferences
- FITS: 레일맵's fixed 30 s dwell matches the "fixed minimum stop" baseline of NIMBY and similar games.
- A passenger-dependent dwell (for example base 20 s + k × boarding passengers, capped) adds realism and naturally creates bunching, as Mini Metro shows in section 4. It doesn't conflict with any project rule, but it would break the "evenly spaced" invariant unless a holding rule is added.
- CONFLICT: NIMBY's catch-up mechanism (shorten or lengthen stops to hold a schedule) is a timetable feature. A non-timetable equivalent is headway-based holding: wait at the terminal until the gap to the previous train is ≥ line interval. TF2's "AutoUnbunch" (section 4) is exactly this and doesn't need a timetable.
- Skip-stop/express needs per-stop flags on a route. It is feasible without signals only if express trains don't overtake on the same track, so it is out of scope for a no-collision, single-path model unless trains can pass through each other.

### Gaps
- No source found on Mini Metro's boarding time per passenger or station dwell figures.
- No source found on Cities: Skylines 1/2 boarding or dwell rules.
- OpenTTD "full load" and timetable/autoseparation orders weren't fetched in this pass.

## 3. Safety & capacity: signals, blocks, path signals, single track, collisions, deadlocks, headway

### Takeaway
The spectrum runs from no signals at all (Cities: Skylines vanilla, Mini Metro) to block signals (Railway Empire, TF2, legacy OpenTTD) to path or reservation signals (OpenTTD default since v12, NIMBY Rails). Capacity in signalled games is set by block count and length. In unsignalled games it is set by a vehicle-count slider or cap. Collisions as a fail state are mostly limited to puzzle games (Train Valley), and even that series dropped them in its sequel.

### Cited Findings
- OpenTTD block signals stop a train if the next block is occupied, even when paths don't conflict. A block is every tile reachable up to the next signal. — [OpenTTD Manual: Signals](https://wiki.openttd.org/en/Manual/Signals)
- OpenTTD pre-signals: an entry signal allows entry "if, and only if, there is at least one green exit". Exit and combo signals feed it. "Lost trains ignore (block) exit signals", which can deadlock junctions. — [OpenTTD Manual: Signals](https://wiki.openttd.org/en/Manual/Signals)
- OpenTTD path signals reserve a route "through a block until the next signal, before entering the block". Non-conflicting trains can share a block. Safe waiting positions are signal fronts, depots and track ends, so signals go before junctions. One-way path signals can't be passed from behind. — [OpenTTD Manual: Signals](https://wiki.openttd.org/en/Manual/Signals); [OpenTTD wiki: YAPP archive](https://wiki.openttd.org/es/Archive/Manual/YAPP)
- Since OpenTTD 12 the signal UI shows only path signals by default. Block signals remain for save compatibility, and the team recommends path signals. — [OpenTTD news: Why we recommend Path Signals](https://www.openttd.org/news/page/7/)
- NIMBY Rails path signals check only the segments on the waiting train's path. Track reservations were added to catch conflicts not yet on the path. In v1.3 path signals and reservations became "long", tracing past station stops until another signal or a loop. Simple block signals scan back up to 10 km and don't affect pathfinding. — [NIMBY devblog 2021-06](https://carloscarrasco.com/page/50/); [NIMBY devblog 2021-10](https://carloscarrasco.com/page/46/); [NIMBY devblog 2021-05](https://carloscarrasco.com/page/51/)
- NIMBY Rails player report: terminus platform signals caused a blockage while a train waited in the platform. — [Steam: NIMBY discussion](https://steamcommunity.com/app/1134710/discussions/0/3056240878555848248)
- Transport Fever 2: players space trains with signal blocks. One suggestion: with 20 trains you need no more than about 40 blocks per line. More signals than trains only help when several lines share a double track. — [Steam: TF2 discussion](https://steamcommunity.com/app/1066780/discussions/0/4323991324853006644)
- Railway Empire: stop signals halt trains in their direction, and directional signals block the opposite direction (original game guide). RE2 patches fixed trains ignoring manual directional/stop signals, a waiting train blocking other tracks, and trains not passing others in switching zones. — [Steam: Railway Empire discussion](https://steamcommunity.com/app/503940/discussions/0/1742231069944422003); [Kalypso: RE2 Update 1.2](https://www.kalypsomedia.com/post/railway-empire-2-update-1-2-1); [Kalypso: RE2 Update 1.0.3](https://www.kalypsomedia.com/post/railway-empire-2-update-1-0-3-1)
- Railway Empire players report gridlock at signal-controlled stations and warehouses, sometimes fixed only by deleting trains. — [Steam: Railway Empire discussion](https://steamcommunity.com/app/503940/discussions/0/1693788384146680317)
- Cities: Skylines 1 vanilla: a player says "the lack of signals in this game causes a problem at junctions", so junctions must be built like highway interchanges. TM:PE allows train signals, and mods such as TrainABS and SingleTrainTrackAI add block signalling and single-track logic. — [Steam: CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/1633040337754695450); [Steam: SingleTrainTrackAI comments](https://steamcommunity.com/sharedfiles/filedetails/comments/949504539)
- Cities: Skylines II: a player thread reports trains deadlocking on blocking tracks, and a reply suggests the game needs a timeout and respawn algorithm. Line panels have a vehicle-count slider, and the game tends to over-assign vehicles. — [Steam: CS2 deadlock discussion](https://steamcommunity.com/app/949230/discussions/0/6733519464643432856); [Steam: CS2 slider discussion](https://steamcommunity.com/app/949230/discussions/0/3937895062994170655)
- Subway Builder (Steam listing): too many trains on a line or an overcrowded station "may cause delays or disruptions". No signalling detail is documented. — [Steam: Subway Builder](https://store.steampowered.com/app/4039140/Subway_Builder)
- Mini Metro: a trailing train "will slow and stop for timing pauses if it catches up to the train in front". Trains approaching head-on don't decelerate for each other, which implies trains pass through each other with no collision. — [Steam: Mini Metro discussion](https://steamcommunity.com/app/287980/discussions/0/530645446309743308)
- Train Valley: collisions are the core risk. Crashes cost money for cleanup and rebuild. In the sequel, Train Valley World, colliding trains no longer crash: one goes temporarily invisible. — [KeenGamer review](https://www.keengamer.com/articles/reviews/train-valley-review/); [GeekyHobbies: Train Valley World review](https://www.geekyhobbies.com/train-valley-world-indie-video-game-review/)
- Real-world context: the signalling system primarily governs operating headway on a subway line. — [Steve Munro / Toronto study PDF](https://stevemunro.ca/wp-content/uploads/2008/11/chapter3dot1.pdf)

### Inferences
- FITS: "no signals, no collisions, trains overlap harmlessly" is the Mini Metro and Train Valley World model. It is a valid shipped design, and Train Valley's own sequel moved toward it.
- The lightest add-on that keeps the no-signal rule is Mini Metro's soft following: if a train gets within X m of the one ahead in the same direction, it slows or waits. This is a one-dimensional distance check along the route and costs little at 30 trains.
- CONFLICT (scope, not rule): full block or path signals, single-track passing loops and through-running between lines would each need a track graph with occupancy. That is a large structural change. The OpenTTD pre-signal → path-signal history shows how deadlocks come from partial solutions.
- A headway cap without signals: max trains per line = round-trip time ÷ minimum headway (for example 90–120 s). This is a config number, similar to CS2's vehicle slider, and doesn't require signals.

### Gaps
- No source found on Mini Metro's exact following distance or whether trains on different lines sharing a segment interact.
- Cities: Skylines 1 vanilla train-separation logic (how trains avoid each other without signals) isn't documented in sources found.
- Rail Route signal mechanics weren't fetched in detail (see section 4).

## 4. Scheduling: timetables vs frequency, bunching control, depots/terminals, loops vs out-and-back, through-running

### Takeaway
Most games default to "run as often as vehicles allow" and add anti-bunching (CS1 unbunching, the TF2 AutoUnbunch mod). Timetables are an optional layer: OpenTTD orders, NIMBY v1.5, the TF2 mod, and Rail Route's dedicated Timetable Mode. Players and transport bloggers see bunching as both realistic and a source of frustration.

### Cited Findings
- NIMBY Rails ≤ v1.4: trains "make no effort to match any fixed timing" (developer reply). v1.5 introduced timetables: trains depart on timetable times, there is an "arrive no later than" option, lines fit exact periods (default weekly, auto duration), and auto-run lines can be converted into train groups. The developer said the AI change took about two days of a two-month effort. — [Steam: NIMBY discussion (dev reply)](https://steamcommunity.com/app/1134710/discussions/0/604146154959017276); [NIMBY devblog 2024-07](https://carloscarrasco.com/page/13/)
- NIMBY Rails player report: a 40-minute interval drifted to about 40 min 10 s after a few hours and about 1 minute after a day. — [Steam: NIMBY discussion](https://steamcommunity.com/app/1134710/discussions/0/3414306689209687738)
- Transport Fever 2 has no vanilla timetables. The TPF2-Timetables mod adds per-stop modes: None, Arrival/Departure, Unbunch (minimum gap from the last departure) and AutoUnbunch (space departures by the line's frequency). — [GitHub: TPF2-Timetables](https://github.com/Gregory365/TPF2-Timetables)
- Cities: Skylines 1: unbunching makes vehicles hold at stops so they don't reach the next stop early. It is set per line (vehicle interval + aggressiveness, 0 = off). Improved Public Transport lets players disable it per stop, and Vehicle Unbuncher extends it to ferry, blimp and monorail. — [Steam: CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/1748980761805161788); [Steam: IPT changelog](https://steamcommunity.com/sharedfiles/filedetails/changelog/424106600?p=3)
- Cities: Skylines II: a "no vehicles" line can be caused by track not connected to the depot, the depot fleet being too small, or vehicles in maintenance (more depots or a bigger budget helps). — [Steam: CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/3937895062994170655)
- Mini Metro: each line starts with one train, so extending a line lowers frequency. Locomotives add frequency and carriages add capacity. Bunching "occurs, and is endogenous". The game ends when a station is over capacity for about 10 s unserved. Players run engines in opposite directions on loops to avoid catch-ups. — [Daniel Bowen blog](https://danielbowen.com/?p=22733); [Transportist review](https://transportist.org/2014/11/05/mini-metro-review/); [GiantBomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro); [Steam: Mini Metro discussion](https://steamcommunity.com/app/287980/discussions/0/530645446309743308)
- Mini Metro community: a typical 4–6 trains per line (cites r/MiniMetro). Carriages have a separate per-line cap from trains. — [hamy.xyz guide](https://hamy.xyz/blog/2024-03_mini-metro-best-upgrades)
- Subway Builder: players name routes, pick colour and stations, and set frequency. Commuters are discouraged by delayed or cancelled services. — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Rail Route is a dispatcher game. Switches and signals start manual, and automated routing unlocks later. Contracts fill the schedule. The Switch version has Endless, Timetable (puzzle levels with a preset schedule and layout), Rush Hour and Story modes. — [GamingOnLinux](https://www.gamingonlinux.com/articles/18109/); [Nintendo eShop listing](https://www.nintendo.com/us/store/products/rail-route-switch/)
- Train Valley: players time departures with switches, and trains depart on their own if the player waits too long. — [KeenGamer review](https://www.keengamer.com/articles/reviews/train-valley-review/)

### Inferences
- FITS: "frequency-based, evenly spaced, no timetable" is the default in CS1/CS2, Mini Metro, Subway Builder (set frequency) and NIMBY ≤ 1.4.
- 레일맵's evenly spaced trains currently stay even only because speed and dwell are constant. If acceleration or passenger-dependent dwell is added, a CS1- or AutoUnbunch-style hold at terminals (depart no sooner than interval after the previous departure) keeps them even without a timetable. This is the recommended non-conflicting choice.
- CONFLICT: NIMBY v1.5-style timetables, OpenTTD timetable orders and Rail Route's Timetable Mode all conflict with the "no timetables before demo" rule.
- Out-and-back vs loops: Mini Metro supports loops, and players use loops with opposing directions to avoid bunching. 레일맵's out-and-back means terminal turnaround is the natural place to hold for spacing.
- Depots (CS2 fleet and depots) add a supply constraint. Not needed for the demo, but a simple "trains per line" config cap gives the same capacity lever.

### Gaps
- No source found describing OpenTTD's timetable autofill or autoseparation in this pass.
- No source found on through-running between lines in any listed game, apart from NIMBY's flexible orders (implied, not verified).
- Railway Empire's schedule model (frequency vs departures) wasn't covered by the sources found.

## 5. Visuals: how trains are drawn, smooth movement, scale

### Takeaway
Little primary documentation was found on rendering. What exists shows NIMBY Rails treats trains as multi-car compositions following a path with a separate "path rider" position layer, and Subway Builder models car counts (up to 15). Mini Metro draws a single small rectangle per train plus carriages (from general knowledge, not sourced here).

### Cited Findings
- NIMBY Rails: the modding schema allows custom compositions, no longer fixed to a head + middle cars + tail structure, with up to 4096 train textures. — [NIMBY devblog 2021-02](https://carloscarrasco.com/page/54/)
- NIMBY Rails: the path rider layer handles speed and position along a path, separate from train AI. Track rendering became a bottleneck for some users, so it was rewritten to cache output, and a single-layer vertex store cut track VRAM by 75%. — [NIMBY devblog 2023-07](https://carloscarrasco.com/page/25/); [NIMBY devblog 2023-04](https://carloscarrasco.com/page/28/)
- Subway Builder: heavy metro up to 15 cars, light metro up to 4. — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- OpenTTD: a softer curve's speed limit is based on direction changes along the train's length. Trains are multi-vehicle consists whose length matters to physics. — [OpenTTD wiki: Realistic acceleration (archive)](https://wiki.openttd.org/en/Archive/Manual/Settings/Realistic%20acceleration)
- Mini Metro: carriages attach to a locomotive to add capacity. — [GiantBomb wiki](https://giantbomb.com/wiki/Games/Mini_Metro)

### Inferences
- FITS: 레일맵's "capsule line that bends along the route" equals the NIMBY/OpenTTD idea of a consist sampled along the path (head position minus car offsets). Drawing it as a `turf.lineSliceAlong(route, s − length, s)` per train, all in one GeoJSON source per frame, matches the project's performance rule.
- Showing length by car count (Mini Metro carriages, Subway Builder cars) is a cheap visual signal of capacity upgrades and doesn't conflict with any rule.
- Performance: NIMBY's experience suggests track rendering, not train rendering, becomes the bottleneck at scale. For 30 trains, `lineSliceAlong` per frame is fine. If it is slow, precompute cumulative distances per route.

### Gaps
- No official numbers were found on how many trains NIMBY, OpenTTD, TF2 or CS handle before slowdown.
- No developer source was found on Mini Metro's train rendering or smoothing.
- No source was found on Transport Fever 2 or Cities: Skylines bogie/curve articulation rendering.

## 6. What players find fun vs tedious

### Takeaway
Signal puzzles are the identity of OpenTTD, NIMBY Rails and Rail Route, but signal-related deadlocks and station blocking are the most common complaint category across OpenTTD, Railway Empire and CS2. Bunching is accepted as "realistic" but called a "headache". Crashes as punishment were softened in Train Valley's sequel.

### Cited Findings
- OpenTTD moved its default to path signals because block and pre-signals cause unnecessary waits and junction deadlocks. — [OpenTTD news](https://www.openttd.org/news/page/7/); [OpenTTD Manual: Signals](https://wiki.openttd.org/en/Manual/Signals)
- Railway Empire players: gridlock at signal-controlled stations, sometimes fixed only by deleting trains. Trains defaulting to platform 1 cause waits. — [Steam: RE discussion](https://steamcommunity.com/app/503940/discussions/0/1693788384146680317); [Steam: RE discussion 2](https://steamcommunity.com/app/503940/discussions/0/1727575977558516302)
- Mini Metro: "sooner or later one train will catch up to another, which causes headaches." — [Steam: Mini Metro discussion](https://steamcommunity.com/app/287980/discussions/0/530645446309743308)
- Cities: Skylines 1: the lack of signals forces junction workarounds, and freight jams loop back on themselves. — [Steam: CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/1633040337754695450)
- CS2: a player asks for a deadlock timeout and respawn. — [Steam: CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/6733519464643432856)
- Train Valley: easy to pick up and tricky to master, with a difficulty spike around levels 3–4. Players lean on pause to plan switches. The sequel removed crash consequences. — [KeenGamer review](https://www.keengamer.com/articles/reviews/train-valley-review/); [GeekyHobbies review](https://www.geekyhobbies.com/train-valley-world-indie-video-game-review/)
- Mini Metro's appeal per transit commentators: overcrowding and frequency trade-offs mirror real planning. — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)

### Inferences
- For a small browser demo, avoid any mechanic that can produce a permanent deadlock (block signals, single track with opposing trains), or ship it with an automatic timeout or resolve.
- The most "fun per line of code" options that keep 레일맵's rules: a frequency or trains-per-line slider, simple acceleration and curve caps, a passenger-dependent dwell with terminal hold for even spacing, and capsule length by car count.

### Gaps
- No systematic player-sentiment survey was found. All sentiment items are anecdotal forum posts.
- Reddit threads (r/NIMBYrails, r/openttd, r/MiniMetro) weren't surfaced by searches.
