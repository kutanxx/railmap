# Economy and Demand Systems of Transit-Focused Games: Mini Metro / Mini Motorways, NIMBY Rails, Subway Builder

Research date: 2026-10-26. Version notes are given inline. Subway Builder numbers come mainly from the official modding API docs (live as of Oct 2026, roughly v1.7.x). NIMBY Rails demand numbers reflect the 1.12+ demand model (introduced 2024). Mini Metro / Mini Motorways mechanics have been stable for years.

Source-quality note: the official Subway Builder wiki (wiki.subwaybuilder.com) returned HTTP 502 on every fetch attempt. Its content is cited only via search-engine summaries, and the official docs at subwaybuilder.com/docs were used instead where possible. The NIMBY Rails wiki is community-run and sparse on economy pages ("Accounting" and "Satisfaction" pages don't exist yet). Grokipedia (AI-generated) is cited once and flagged as low-confidence.

## 1. How is passenger demand created?

### Takeaway
The three games span a spectrum. Mini Metro and Mini Motorways use abstract random spawning: shape-coded passengers at stations, or pins at colored destinations, with no money at all. NIMBY Rails uses real worldwide population-density rasters, with passengers spawned at map points and destinations weighted by player-editable time-of-week and distance curves. Subway Builder uses real census home/workplace records (US LODES and international equivalents). It pairs homes with jobs through a distance-based gravity model and then runs agent-style pathfinding plus mode choice against driving for every commuter group ("pop" of 200 people).

### Cited Findings
**Mini Metro / Mini Motorways**
- Mini Metro: passengers appear periodically as small shapes next to stations, and each shape is the station type they must be delivered to. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Metro has no hand-built levels. Dinosaur Polo Club deliberately chose "no hand-built levels", pushing it toward procedurally generated levels. Ridership grows over time, forcing continual expansion. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Metro has no in-game money. Resources are granted as weekly upgrades rather than bought. — [Human Transit (Jarrett Walker)](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html); [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Motorways: houses contain cars and must be connected by road to same-colour destination buildings. New houses and buildings appear randomly. Buildings display "pins" (trip requests) that matching cars collect, and "The score is the number of pins that have been collected." — [Wikipedia: Mini Motorways](https://en.wikipedia.org/wiki/Mini_Motorways)

**NIMBY Rails**
- Since Aug 2021 the population layer has used real worldwide population density data at 250 m resolution, combined with 30 m built-up data. Earlier (Oct 2020) density was approximated from street intersections. — [Devblog 2021-08](https://carloscarrasco.com/nimby-rails-august-2021/); [Devblog 2020-10](https://carloscarrasco.com/nimby-rails-october-2020/)
- Early Access era (Dec 2020): about 90% of new passengers chose destinations from a distribution over reachable cities sorted by population, and 10% were random. — [Devblog 2020-12](https://carloscarrasco.com/nimby-rails-december-2020/) (via search summary)
- Older model: passengers were assigned immediately to one of three distance categories (local, regional, long distance) and spawned at stations at the station's "spawn rate". — [NIMBY Rails Wiki: Pax](https://wiki.nimbyrails.com/Pax). The old text-file curve had classes of <10 km, 10–100 km and >100 km — [Steam thread](https://steamcommunity.com/app/1134710/discussions/0/4417550166393249492/)
- 1.12 model (2024): "Pax spawn on map positions based on population density, and pick their destinations in the same way". They must pick one of the stations in range for origin and destination, and that choice is currently random. Time weighting is 168 values, one per hour of the week, with separate origin and destination curves. The distance curve is "an exponential ramp-down, with 100% at 0 distance" with a long tail. Players can define extra curves and POIs that add population at a point, as "an additional level of CDF on top of the population density CDF." — [Devblog 2024-03](https://carloscarrasco.com/nimby-rails-march-2024/)
- The Feb 2024 design goal was "maximalist", unbiased demand purely from population density, ignoring stations, frequency and catchment. — [Devblog 2024-02](https://carloscarrasco.com/nimby-rails-february-2024/) (via search summary)
- Player-derived rule of thumb (not official): weekday daily pax ≈ population with station access × global demand % × 0.25. Example: 10M × 7% × 0.25 = 175,000/day. Players suggest 30–60% global demand for intercity networks and 400–500% for in-city networks. — [Steam thread](https://steamcommunity.com/app/1134710/discussions/0/4417550166393249492/)
- Players report about 44–47% average weekday and about 18% weekend averages on the default 24-hour curve, and set global demand to 400–600% for realistic metro ridership. — [Steam: 1.12 demand observations](https://steamcommunity.com/app/1134710/discussions/0/4335356121958516692/)
- A basic double-track station holds 200 passengers at a time, and the maximum is 10,000 per station. Since v1.3, population is "relatively realistic", and some Seoul station areas have >100,000 people. — [NamuWiki: NIMBY Rails/Gameplay](https://en.namu.wiki/w/NIMBY%20Rails/%EA%B2%8C%EC%9E%84%20%ED%94%8C%EB%A0%88%EC%9D%B4)

**Subway Builder**
- Millions of commuters are generated from census home locations. A distance-based gravity model assigns each a workplace, and departure times follow a realistic distribution. College students (federal data) and airport travellers (FAA data) are modelled separately with different income distributions and timings. Data covers US, UK, Irish, French, Swiss, New Zealand and Japanese cities. — [Steam store page](https://store.steampowered.com/app/4039140/Subway_Builder)
- v1.5.0 (2026-07-28) changed home–work pairing to use LODES commuting-distance data. v1.1.0 updated US workplace/population data from 2022 to 2023. v1.4.17 added cross-border demand (Tijuana, Windsor). — [Official changelog](https://www.subwaybuilder.com/changelog)
- The data model has demand points with `residents` and `jobs` (display counts only) and "pops", the commuter groups with `size` (default 200), `residenceId` and `jobId`. "Commuters exist only as pops." Driving time, when not supplied, is estimated from straight-line distance ×1.3 circuity at about 40 km/h. — [Official API: Demand](https://www.subwaybuilder.com/docs/api-reference/demand)
- v1.0.0 raised pop size to 200 to reduce pathfinding lag. — [Changelog](https://www.subwaybuilder.com/changelog)
- Rider demand is based on US Census commute data and rises at rush hour. The developer planned a growth feature that increases density near stations over time. — [The Baltimore Banner](https://www.thebanner.com/community/transportation/subway-builder-baltimore-transit-system-VPYKWAWVZZGZ7BSAQ6H6J6ZFVQ)
- v1.4.0 moved the morning rush from 6–8 AM to 7–9 AM and added a modding API for commute distributions. — [Changelog](https://www.subwaybuilder.com/changelog)

### Inferences
- For a gravity-model game like 레일맵, Subway Builder's design (real home/job points → gravity pairing → per-group mode choice) is the closest analogue, but it is computationally heavy. The developer had to batch commuters into groups of 200 for performance.
- NIMBY Rails shows the opposite design path. It started with simple per-station spawn rates and three distance buckets, then moved to density-raster-based spawning with editable curves. Players found the newer system more realistic but harder to tune.
- A station-level gravity model (demand ∝ popA × popB ÷ time^0.8) is roughly what NIMBY's pre-1.12 design approximated: population-weighted destinations plus distance categories.

### Gaps
- No official documentation of Mini Metro's spawn-rate curve or the probability of each passenger shape. No GDC talk transcript was found.
- The exact Subway Builder gravity-model exponent or distance-decay function is not published in the docs that were reachable. The wiki was down.

## 2. How do travel time, wait time and transfers affect demand and route choice?

### Takeaway
Mini Metro has no route choice economics. Passengers simply board any train that can get them to their shape. NIMBY Rails passengers pick the "best trip" and compare actual time and price against "neutral" expected values. If either is too bad, they demand refunds. Subway Builder has the most explicit model: each commuter group compares transit with driving using perceived-time multipliers (walk ×1.39, wait ×1.37) and money converted at an income-based value of time. Delays and cancellations feed back into future choices.

### Cited Findings
- **Subway Builder:** each commuter chooses a commute method based on travel time, cost and their value of time, which varies with income. They weigh wait times, transfers, income distribution and delays. If a train is delayed or cancelled, future commuters account for it. — [Steam store page](https://store.steampowered.com/app/4039140/Subway_Builder)
- **Subway Builder constants (official API docs):** — [API: Game Constants](https://www.subwaybuilder.com/docs/api-reference/constants)
  - Perceived-time weights: `WALK_MULTIPLIER` 1.39, `WAIT_MULTIPLIER` 1.37, `AIRPORT_WALK_MULTIPLIER` 1.87, `DEPARTURE_SHIFT_MULTIPLIER` 0.4, `CONGESTED_DRIVING_MULTIPLIER` 1.33, `PARKING_SEARCH_MULTIPLIER` 1.6
  - Driving alternative: `DRIVING_COST_PER_KM` $0.65, `PARKING_COST` $5/day (×5 at airports), `PARKING_TIME` 180 s, `MIN_SENSIBLE_DRIVING_DISTANCE` 1000 m
  - Walking: 1 m/s straight-line, or 1.5 m/s on the actual path. `MAX_WALK_TO_FROM_STATION` 2700 s (45 min), `MAX_DRIVE_TO_FROM_STATION` 420 s, `MAX_TRANSFERS` 4, `MAX_TRANSFER_WALKING_TIME` 600 s
  - Income: mean $60,000/yr, SD $25,000, min $15,000, max $200,000. Airport travellers have ×1.5 income and college ×0.6. `HOURS_WORKED_PER_YEAR` 1860, so hourly value of time is derived from income ÷ 1860.
  - Driving-time congestion multipliers by area demand level: 0.8 / 0.9 / 1.0 / 1.25 / 1.5
- v1.5.0 rewrote pathfinding, raised max transfers from 3 to 4, and raised walking tolerance from 30 to 45 minutes. — [Changelog](https://www.subwaybuilder.com/changelog)
- Wikipedia notes a claimed (flagged as original research) problem where Subway Builder commuters avoid transfers. — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- **NIMBY Rails:** a passenger's current best option is its "dominating trip", the best trip from its current location to its destination. Pax are grouped by shared destination for pathfinding and boarding. — [NIMBY Wiki: Pax](https://wiki.nimbyrails.com/Pax)
- NIMBY: hovering over an unhappy passenger shows "neutral" values for expected fare and time. Exceeding a tolerance threshold triggers refund requests, and slow or poorly connected services also cause refunds. — [Steam: refunds thread (Feb 2021)](https://steamcommunity.com/app/1134710/discussions/0/3111395113753435481/)
- NIMBY: passengers respond to time, so a faster parallel route captures most long-distance demand. — [NamuWiki](https://en.namu.wiki/w/NIMBY%20Rails/%EA%B2%8C%EC%9E%84%20%ED%94%8C%EB%A0%88%EC%9D%B4)
- NIMBY 1.12: station satisfaction was disabled as "confusing and not well justified", while pax satisfaction stays visible. — [Devblog 2024-03](https://carloscarrasco.com/nimby-rails-march-2024/)
- **Mini Metro:** extending a line lowers its frequency, which raises crowding risk. Walker: "Under any fixed budget, frequency and extent are inversely related." The game optimises for capacity rather than customer utility. — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)

### Inferences
- Subway Builder's perceived-time weights (walking and waiting count about 1.4× in-vehicle time) are a ready-made, citable template for 레일맵's "소요 시간" term in the gravity model. 레일맵 could use: effective time = in-vehicle + 1.37 × average wait (half the headway) + 1.39 × walk + a transfer penalty.
- Wait time = f(headway) is the mechanism by which "more trains → more demand" works in Subway Builder. That gives players a non-crowding reason to add trains.

### Gaps
- Subway Builder's explicit transfer penalty is not in the constants page (only limits are listed). The exact mode-choice function (logit vs. deterministic min-cost) is not documented in reachable pages.
- NIMBY Rails' exact "neutral" fare/time formula and refund threshold are undocumented. Players speculate from in-game tooltips.

## 3. How is revenue computed?

### Takeaway
Mini Metro and Mini Motorways have no revenue, only score (passengers delivered or pins collected). NIMBY Rails uses a player-set two-part tariff per line: base fare at boarding plus price per km at alighting. Fares that are too high generate refunds rather than lower demand. Subway Builder defaults to a $3 flat fare with player-adjustable flat, distance-based and route-based fares (added in v1.6–1.7), and fare level feeds directly into each commuter's money-vs-time mode choice.

### Cited Findings
- Mini Motorways score = number of pins collected. — [Wikipedia: Mini Motorways](https://en.wikipedia.org/wiki/Mini_Motorways). Mini Metro has no money. — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- **NIMBY Rails:** each line has a "Base ticket price: price that will be payed once by every pax boarding the train" and a "Price per km: price that will be payed by pax for every km they're on the train, will be added to the base ticket price." — [NIMBY Wiki: Line](https://wiki.nimbyrails.com/Line)
- NIMBY worked example: base 1.00 + 0.20/km gives 2.20 for 6 km and 3.00 for 10 km. Base is charged at boarding and per-km on arrival. Transfers pay the base fare on each line. Refunds appear in accounting as "Refund: too high fare". Players treat refunds as missed rather than lost income. — [Steam refunds thread](https://steamcommunity.com/app/1134710/discussions/0/3111395113753435481/)
- NIMBY player fare tables (anecdotal): tram 1 + 0.4/km, local metro 1.5 + 0.6/km, long-distance 2.5 + 0.8/km. Another player reports 140 km tram line ran at max price without refunds. — [Search summary of Steam threads](https://steamcommunity.com/app/1134710/discussions/0/4904953131468905117/), [Ticket Prices thread](https://steamcommunity.com/app/1134710/discussions/0/3108015514317928748/) (low confidence on which thread each figure came from)
- NIMBY: overflow at a transfer station triggers "Compensation: Full Station" refunds. The route accounting tab shows where each route gains or loses money. Profits scale with population, and dense Dhaka is cited as more profitable than Seoul or Tokyo. — [NamuWiki](https://en.namu.wiki/w/NIMBY%20Rails/%EA%B2%8C%EC%9E%84%20%ED%94%8C%EB%A0%88%EC%9D%B4)
- **Subway Builder:** `DEFAULT_TICKET_COST` = 3 (dollars), `FARE_MULTIPLIER` = 365. — [API: Constants](https://www.subwaybuilder.com/docs/api-reference/constants). The meaning of FARE_MULTIPLIER isn't documented. It may annualise or scale fares, so this is unverified.
- v1.6.0 (2026-08-06) added "complex fare systems" that charge differently by distance and/or routes taken. v1.7.0 raised the flat fare cap from $10 to $100 and shows route distances when setting distance fares. v1.7.2 fixed a "local station discount". — [Changelog](https://www.subwaybuilder.com/changelog)
- Reviewer: you can set ticket prices, but high prices backfire, because "the population did NOT like it". The financial dashboard shows revenue by day, two weeks or all time with operating profit. "Public transit is a money maker!" — [The Punished Backlog review](https://punishedbacklog.com/subway-builder-review/)
- Goal is a profitable system, compared with real US systems like Maryland MTA's ~10% farebox recovery. NYC is easiest to profit in due to density, and smaller cities are harder. — [The Baltimore Banner](https://www.thebanner.com/community/transportation/subway-builder-baltimore-transit-system-VPYKWAWVZZGZ7BSAQ6H6J6ZFVQ)

### Inferences
- Fare elasticity is implemented differently. In NIMBY, price is a post-hoc satisfaction check (refunds). In Subway Builder, price is an ex-ante mode-choice input, so riders switch to cars. The Subway Builder approach integrates more naturally with a gravity model.
- Both real-map games make transit profitable by design. Unrealistically, this is needed for a build-earn-expand loop.

### Gaps
- No official document explains how Subway Builder's fare enters the mode-choice utility, or what FARE_MULTIPLIER = 365 does.
- NIMBY Rails max fare cap and the neutral-price formula are undocumented.

## 4. How are construction costs computed?

### Takeaway
Mini Metro and Mini Motorways have no construction cost. Tracks and roads are free to redraw, and scarce tokens (lines, tunnels and bridges, road tiles) replace money. NIMBY Rails charges by track speed class and elevation (underground > elevated > at grade), plus train purchase per car. Bridges are auto-generated and players call them expensive. Subway Builder has the most detailed model: a base cost × elevation multiplier (at grade 0.35 → deep bore 4.5) × configuration multiplier, with water multipliers, building-overpass premiums, grade-crossing multipliers, a $40M minimum TBM segment, and station base costs of about $75M (heavy metro) and $50M (light metro). It is deliberately priced at overseas ("Mediterranean") per-mile costs.

### Cited Findings
**Mini Metro / Mini Motorways**
- Mini Metro: rivers must be crossed with a limited supply of tunnels or bridges, granted in weekly upgrades along with lines, locomotives, carriages and interchanges. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Mini Metro lets players tear down and rebuild lines for free, which Walker/commenters criticise as unrealistic. — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- Mini Motorways: after each in-game week (about 2.5 min at normal speed) the player picks one of two upgrades. Both always grant extra road tiles, and one grants a special tool (bridge, tunnel, traffic light, roundabout, motorway). One bridge or tunnel covers a crossing regardless of length. — [Wikipedia: Mini Motorways](https://en.wikipedia.org/wiki/Mini_Motorways)

**NIMBY Rails**
- Track cost order by speed class: high-speed (350 km/h) > medium (160 km/h) > tram (60 km/h). By elevation: underground (−∞ to −1) > elevated (+1 to +∞) > at grade. — [NamuWiki](https://en.namu.wiki/w/NIMBY%20Rails/%EA%B2%8C%EC%9E%84%20%ED%94%8C%EB%A0%88%EC%9D%B4)
- Train prices per car (wiki, v1.5.41): CityTram $1.7M, Tanager intercity $1.5M, HVitesseD (TGV Duplex) $3.4M, Menisem Roleva E (Velaro) $9.0M, Koala people-mover $0.9M, Menisem VRMC commuter $0.17M. — [NIMBY Wiki: List of trains](https://wiki.nimbyrails.com/List_of_trains)
- Players complain a simple auto-bridge over a small road costs about $1M. Some switch to viaducts because they are cheaper in practice. — [Steam: bridges thread](https://steamcommunity.com/app/1134710/discussions/0/3108015514306921240/) (via search summary)
- The developer prototyped track that forcibly demolishes conflicting buildings but dropped it because OSM building outlines are incomplete. — [NIMBY Rails retrospective](https://carloscarrasco.com/nimby-rails-retrospective/) (via search summary)
- A mod track (not base game) lists ground cost $150,000/km and viaduct $600,000/km. — [Steam Workshop mod pack](https://steamcommunity.com/sharedfiles/filedetails/?id=3307428683) (via search summary)
- Low-confidence (AI-generated encyclopedia): track ≈ $1–2M/km for high-speed lines, "often critiqued as understated". — [Grokipedia](https://grokipedia.com/page/nimby_rails)

**Subway Builder**
- Costs use per-mile construction costs from outside the US ("Mediterranean pricing"). Miller: "It's the only way the game would be playable." US costs are about 2× (up to 5× in NYC). The Banner's 2002 Baltimore plan costs about $20B in-game vs. about $40B at US prices. Right-of-way and political costs are excluded. — [The Baltimore Banner](https://www.thebanner.com/community/transportation/subway-builder-baltimore-transit-system-VPYKWAWVZZGZ7BSAQ6H6J6ZFVQ); [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- Wiki: "elevation is the biggest factor" in cost, with multipliers 0.3×–4.5× of baseline cut-and-cover. Final cost = base × elevation multiplier × configuration multiplier. Station bases are $75M heavy metro and $50M light metro. Building along existing rights-of-way avoids demolition. — [SubwayBuilder Wiki: Construction](https://wiki.subwaybuilder.com/index.php/Construction) (via search summaries only. The page returned 502 when fetched.)
- Official constants (current): — [API: Constants](https://www.subwaybuilder.com/docs/api-reference/constants)
  - Elevation multipliers (with water multiplier): deep bore 4.5 (water 1.44), standard tunnel 2 (1.5), cut-and-cover 1 (3), trenched 0.5 (not allowed on water), at grade 0.35 (n/a), ramp 0.5 (n/a), elevated 0.8 (2.5). Depth thresholds: deep bore < −100 m, standard tunnel −24 m, cut-and-cover −10 m, trenched −4 m, at grade −1 m, elevated ≥ 5 m.
  - Configuration: single-track tunnel/station ×0.75, quad ×1.5. Station length cost factor 0.25. `TBM_MIN_SEGMENT_COST` $40,000,000.
  - Building overpass: cost premium ×3, piers $200,000 per metre of height, standard span 35 m.
  - Street running ×3.5, exclusive right-of-way ×1.5, yard track ×0.5.
  - Grade-crossing multipliers by road class (minor 1, medium 1.25, major 1.5, highway 2) and lanes (1 lane 0.75, 2 lanes 1, 4 lanes 1.5).
  - `STARTING_MONEY` $3,000,000,000 and `STARTING_TRAIN_CARS` 30.
- A reviewer found clearing Grand Central to build down Park Ave cost "$2.3B to clear a path". — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Changelog cost tweaks: v1.4.0 made shorter, lower-capacity stations cheaper, removed scissors-crossover costs, and added portal/ramp costs. v1.0.0, v1.5.0 and v1.7.0 adjusted light and heavy metro track and station costs. — [Changelog](https://www.subwaybuilder.com/changelog)
- Train types: heavy metro (NYC R211, up to 15 cars, higher build and upkeep), light metro (Montreal REM, up to 4 cars, cheaper), light rail (Siemens S700), commuter rail (LIRR M9). — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)
- The official API exposes a per-train `carCost` field. The example override is `carCost: 2_000_000`, a sample rather than a default. — [API: Trains](https://www.subwaybuilder.com/docs/api-reference/trains)
- A UK-trains mod (not base game) lists heavy metro cars at $1.5M and light metro at $1.2M. — [GitHub: subwaybuilder-uk-generic-trains](https://github.com/Zeepheru/subwaybuilder-uk-generic-trains) (via search summary)

### Inferences
- Subway Builder's formula (cost = length × base/km × elevation mult × config mult, plus station base × size factors) maps almost directly onto 레일맵's planned "선로 길이(km) × km당 비용 + 새 역 개수 × 역 비용", with an optional elevation/tunnel multiplier table later.
- Real-map games all soften real costs: Subway Builder uses European prices, and NIMBY is reportedly understated. Playability beats realism.

### Gaps
- Subway Builder's base track cost per km is not published in the constants page, and the wiki was unreachable.
- NIMBY Rails exact per-km track costs per class and elevation, station costs, and whether land or density affects cost were not found in official sources.

## 5. What are the ongoing costs, and what creates tension and failure states?

### Takeaway
The Mini games fail on a single overcrowding or overflow timer. That is the whole tension engine: demand grows faster than tokens. NIMBY Rails has per-train maintenance per day plus running cost per passenger-km, refunds, loans and possible bankruptcy, but players report expenses are tiny relative to fares. Subway Builder charges infrastructure maintenance every 300 game-seconds and train operating costs every 900. It has realistic track throughput (TPH) caps and bonds unlocked by revenue. No explicit game-over or bankruptcy state was found.

### Cited Findings
**Mini Metro / Mini Motorways**
- Mini Metro: a station holds about six waiting passengers under standard rules. The game ends when a station stays overcrowded for "an extended period of time". Endless mode removes overcrowding, and Extreme mode locks placed lines. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Interchanges, tunnels, bridges, new lines and carriages raise station capacity and loading speed. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Each line starts with one vehicle. Upgrades add a line or more speed and capacity. Walker notes the game gives no crowding relief options and calls failure "losing". — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- Mini Motorways: square buildings hold 7 pins and circular buildings hold 10. Over capacity a warning timer starts, and "Once a building's timer is full, the game is over". Cars arriving slow the timer, and it drains once back within capacity. — [Wikipedia: Mini Motorways](https://en.wikipedia.org/wiki/Mini_Motorways). A Steam forum post gives 6/10 instead (conflicting figure). — [Steam discussion](https://steamcommunity.com/app/1127500/discussions/0/3191359376161705321) (via search summary)

**NIMBY Rails**
- Koala train: price $900,000, maintenance $10/day, running cost $0.05 per km per passenger, 65 pax per car (1–3 cars). — [NIMBY Wiki: Koala](https://wiki.nimbyrails.com/Koala)
- A mod schema states 0.05 per km per pax is the default running cost of all base-game trains. — [GitHub: wopian/nimby-rails README](https://github.com/wopian/nimby-rails/blob/master/README.md) (via search summary)
- A player reported over $50,000 in fares vs. under $1,000 maintenance and operating costs after 8 days on a two-stop line. Another said the game doesn't charge for stations, signals, depots, tracks, switches or staff. — [Steam: "The Expenses don't make sense"](https://steamcommunity.com/app/1134710/discussions/0/3111404628276151160/) (via search summary)
- Overnight idling saves money, and depots aren't needed for 24-hour operation. Transfer-station overflow produces "Compensation: Full Station" refunds and deficits. — [NamuWiki](https://en.namu.wiki/w/NIMBY%20Rails/%EA%B2%8C%EC%9E%84%20%ED%94%8C%EB%A0%88%EC%9D%B4)
- Low-confidence: loans allow "up to three concurrent borrowings with interest penalties" and bankruptcy is possible. — [Grokipedia](https://grokipedia.com/page/nimby_rails)

**Subway Builder**
- `INFRASTRUCTURE_COST_CHARGE_INTERVAL` 300 game-seconds and `OPERATIONAL_COST_CHARGE_INTERVAL` 900 game-seconds. Extra track/station maintenance multiplier 0.25. Capacity warning thresholds at 50 and 100 empty spots. — [API: Constants](https://www.subwaybuilder.com/docs/api-reference/constants)
- Operating cost depends on how often trains stop (varies by time of day) and on the number of cars in service. — [The Baltimore Banner](https://www.thebanner.com/community/transportation/subway-builder-baltimore-transit-system-VPYKWAWVZZGZ7BSAQ6H6J6ZFVQ)
- Mod (not base) values: train operating $220/hr (heavy) and $140/hr (light), plus $14/hr per car. — [GitHub mod](https://github.com/Zeepheru/subwaybuilder-uk-generic-trains) (via search summary)
- Bonds (official): Small $100M principal at 6%/day, unlocked at $10M previous-day revenue. Medium $500M at 4%/day, unlocked at $100M. Large $1B at 2%/day, unlocked at $200M. Interest is charged hourly at 1/24 of the daily rate. Principal repaid per game hour is 0.001, 0.0008 and 0.0006. — [API: Constants](https://www.subwaybuilder.com/docs/api-reference/constants)
- Changelog: bonds and loans added in v0.8.0 "to help early-game". Unlock was based on revenue rather than profit from v0.9.0. Rates were lowered in v0.10.0, and partial payoff came in v1.3.0. v1.2.0 made train operating costs more realistic and lower. v1.3.0 added ongoing track and station maintenance and lowered train operating cost to compensate. v1.4.5 significantly cut grade-crossing maintenance. — [Changelog](https://www.subwaybuilder.com/changelog)
- Throughput tension: v1.4.0 added realistic track capacity limits. v1.5.0 capped heavy and light metro at 42 TPH. v1.7.0 made TPH limits vary by time of day. — [Changelog](https://www.subwaybuilder.com/changelog). "Too many trains on a line or an overcrowded station may cause delays or disruptions." — [Steam store](https://store.steampowered.com/app/4039140/Subway_Builder)
- Game modes: normal ($3B) vs. sandbox (unlimited). Daily challenges were limited to "transit share" mode in v1.5.0, and cities have difficulty ratings. — [Changelog](https://www.subwaybuilder.com/changelog); [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)

### Inferences
- Mini games: tension = demand growth vs. scarce tokens, with a visible countdown. This is a cheap and very readable failure state.
- Real-map sims lean on money as the constraint but tend to be too easy once profitable (NIMBY players report trivial expenses, and Subway Builder reviewers say transit is "a money maker"). Subway Builder added maintenance costs, TPH caps and revenue-gated bonds to restore tension.
- Reasons to add trains: Mini Metro adds them for capacity, to clear station queues before the timer. NIMBY adds them for capacity (full-station refunds) and frequency. Subway Builder adds them for wait time (the 1.37 wait multiplier lowers transit's perceived time) and capacity, limited by TPH caps and per-car operating cost.

### Gaps
- No source confirms whether Subway Builder has a bankruptcy or game-over state when money goes negative.
- Mini Metro's exact overcrowding timer duration is not officially documented. One unverified source says about 10 s at capacity.
- NIMBY Rails' official loan and bankruptcy rules were not found outside the AI-generated Grokipedia.

## 6. What do players and reviewers say makes the economy fun or frustrating?

### Takeaway
Mini Metro is praised as "simple but absorbing", with an accurate core lesson (frequency vs. extent), but criticised by planners for optimising capacity rather than rider utility and for free rebuilds. NIMBY Rails players like the realism of 1.12 demand but find it needs trial-and-error tuning (global demand 400–600%), and say the economy is too lenient. Subway Builder players love watching census demand bubbles turn from red (car) to blue (transit), but reviews are mixed (61% Steam) because of pathfinding bugs and "hyperrealistic" marketing outrunning execution.

### Cited Findings
- Mini Metro: Walker calls it "simple but absorbing". Its "final message is surprisingly accurate" (pressure to expand outward vs. investing in core capacity), but many assumptions are "absurd". It optimises capacity, not customer utility, and allows free teardown and rebuild. — [Human Transit](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- NIMBY 1.12: a player wrote "I really like the new 1.12 demand". Another said "Personally, I would have settled for a simpler demand scheme". Results depended on trial and error, and long-distance flows were imbalanced (full inbound, empty outbound). — [Steam: 1.12 demand observations](https://steamcommunity.com/app/1134710/discussions/0/4335356121958516692/)
- NIMBY 1.12 ridership dropped sharply for some players (e.g. 100k → about 20k on a Monday). The developer said it was not possible to establish a direct formula to keep 1.11 demand values. — [Steam thread](https://steamcommunity.com/app/1134710/discussions/0/4352242595078331742) (via search summary)
- NIMBY frustration: invalid auto-bridges, unclear crossing rules, and mistakes only visible after spending money. Some players ignore costs entirely ("give themselves money"). — [Steam: "kinda giving up" thread (Aug 2022)](https://steamcommunity.com/app/1134710/discussions/0/3458220365213094979/)
- NIMBY: expenses seem far too low relative to fare income. — [Steam: "The Expenses don't make sense"](https://steamcommunity.com/app/1134710/discussions/0/3111404628276151160/) (via search summary)
- Subway Builder fun: demand bubbles shift colour from red (car-centric) to blue (transit), which is "absolutely thrilling". Watching revenue grow is fun, and cars are the "final boss". Frustrations: Demand Stats "vanish as soon as you start building", plus save-overwrite risk. Score 8.5/10. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- Subway Builder criticism: "route-finding bugs, lost saves, performance issues". It "sells itself for what it isn't yet", and the Steam price (40 €) is too high. Score 6/10. — [Insert Coins review](https://insertcoins.press/en/articles/subway-builder-test)
- Steam reviews: all-time Mixed (61% of 450), recent Mostly Positive (70% of 44), as of the Oct 2026 store page. — [Steam store](https://store.steampowered.com/app/4039140/Subway_Builder)
- Journalists praised its "addictive" quality. Fast Company noted few games make simulations "realistic enough to replicate real transit-planning challenges". — [Wikipedia](https://en.wikipedia.org/wiki/Subway_Builder)

### Inferences
- The most praised feedback loop across the real-map games is visible demand response (bubbles changing colour, ridership charts), more than the money itself. 레일맵's speech-bubble alerts and the panel could show "this station pair now has X riders/day" to deliver that feeling.
- A recurring complaint is an economy that's too easy once profitable (NIMBY) or too opaque to tune (NIMBY 1.12). Exposing coefficients in config.js, as 레일맵 plans, mirrors NIMBY's editable demand curves and Subway Builder's modding constants.

### Gaps
- No GDC talk or developer postmortem on Mini Metro's economy and pacing design was retrieved.
- Reddit sentiment was not retrieved directly. Sentiment here comes from Steam forums and reviews.
