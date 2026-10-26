# Cities: Skylines (CS1) and Cities: Skylines II (CS2): Public Transport Economics (Metro/Train Focus)

Research date: 2026-10-26. Source caveat: the Paradox forums (forum.paradoxplaza.com) blocked automated fetching ("Validating browser"), so threads there could only be seen as search snippets. Both community wikis say some of their figures are out of date: the CS1 wiki says "last verified for version 1.15", and the CS2 wiki is tagged "Potentially outdated, 1.0". Official dev diaries are mostly qualitative and give few numbers.

## 1. How are trips generated and how do agents decide to use transit?

### Takeaway
In both games every citizen is a simulated agent with a home and a workplace or school. Each also makes shopping and leisure trips. CS1 picks the travel mode with a simple rule: if a citizen owns a car, they drive it. If not, they walk or take transit when transit makes the trip faster. CS2 replaced this with a cost-based pathfinder that adds up four costs (time, comfort, money and behaviour). Each age group weights those costs differently. Ticket price and parking fees feed directly into this cost, so mode choice in CS2 responds to prices in a way CS1's did not.

### Cited Findings
**CS1 (2015)**
- Trips follow life stage. Children go to nearby schools, teens to high school, and young adults to university or work. Adults form families, and seniors retire but still visit shops and services. Each citizen has a home address and a workplace or school, and also visits shops, restaurants, clinics and hospitals. Average lifespan is about 6 in-game years. — [Game Developer, Tommy Thompson, "How Traffic Works in Cities: Skylines" (2020-08-27)](https://www.gamedeveloper.com/design/how-traffic-works-in-cities-skylines)
- Mode choice: "If a citizen owns a car, they will attempt to drive it." Citizens without a car check for a valid sidewalk path and also check whether public transit would make the trip faster. Citizens can combine modes, for example driving to a metro station and then riding the train. Pedestrians cannot walk on highways. — [Game Developer](https://www.gamedeveloper.com/design/how-traffic-works-in-cities-skylines)
- Route cost depends on road and lane type, bus and bike lanes, speed limits, lane count and congestion. Colossal Order has never published its search algorithm; the author guesses it is a modified A* or Dijkstra. A route is fixed once chosen. — [Game Developer](https://www.gamedeveloper.com/design/how-traffic-works-in-cities-skylines)
- CS1 caps the number of citizens who can be travelling at the same time. Gridlocked vehicles teleport back to where they started. — [Game Developer](https://www.gamedeveloper.com/design/how-traffic-works-in-cities-skylines)
- CS1 wiki: "Not all citizens will use public transportation, but more citizens will tend to use it the more efficient it is." Multi-modal trips mean a train station can sit in a low-density area if another mode brings residents to it. — [CS1 Wiki, Transportation/Metro page](https://skylines.paradoxwikis.com/Metro)
- In CS1, long queues at stops did not upset citizens. Players described long waits as purely cosmetic (CS1 Steam thread, about 2018). — snippet from [Steam CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/3288067088112155101)

**CS2 (2023 onward)**
- Official statement: "Pathfinding works in a different way in Cities: Skylines II than its predecessor. In Cities: Skylines pathfinding was proximity-based." — [Paradox forum, Dev Diary #2 Traffic AI (snippet)](https://forum.paradoxplaza.com/forum/threads/development-diary-2-traffic-ai.1591141/page-5)
- "The core of pathfinding calculations is the four aspects: Time, Comfort, Money, and Behavior." Time is usually the biggest factor. Comfort favours routes with fewer turns and a suitable parking spot or transit stop to get off at. Money covers fuel and parking fees, compared against other options including walking. Behaviour measures willingness to make "dangerous" moves such as U-turns. Citizens aim "for the lowest overall pathfinding cost." — [Paradox, CS2 Feature Highlight: Traffic AI](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai)
- Weights differ by age group. Teens put money first and will walk farther or use other transport to save it. Adults put time first. Seniors put comfort first. — [Paradox, Traffic AI](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai)
- Parking: the most comfortable option is to park at the destination building's own lot. If that isn't possible, the agent picks other parking or another way to travel. Fees can be set per lot, building or district. "Low or nonexistent fees encourage parking for all citizen groups while high parking fees favor wealthier citizens." — [Paradox, Traffic AI](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai)
- "Citizens weigh time, traveling comfort, and money as they choose their traveling options… money can sway them between public transportation and private vehicle usage." — [Paradox, CS2 Feature Highlight: Public & Cargo Transportation](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation)
- The CS2 wiki says waiting time at stops feeds into pathfinding. When a line runs near 100% usage, adding vehicles cuts waits. — [CS2 Wiki, Transportation](https://cs2.paradoxwikis.com/Transportation)
- The bicycle dev diary says the game "already compares walking, driving, or taking public transportation" when choosing a path. For bikes, a check was added on whether the household owns one and whether it is available. — snippet from [Paradox, Dev Diary: Building for Bicycles](https://www.paradoxinteractive.com/zh-CN/games/cities-skylines-ii/news/dev-diary-building-for-bicycles)
- Players report that CS2 citizens walk long distances, mix several transport types on one trip, and will even walk beside a highway with no pavement if it saves time (anecdotal). — snippet from [Paradox forum Dev Diary #2 thread](https://forum.paradoxplaza.com/forum/threads/development-diary-2-traffic-ai.1591141/page-5)

### Inferences
- Design contrast for Railmap: CS1 is mostly "car owners drive; everyone else takes the fastest walk or transit option". CS2 is a generalized-cost choice (time + comfort + money) with weights that vary between agent groups. Railmap's gravity model (demand ∝ pop×pop / time^0.8) is an aggregate version of the time term only. Adding a fare term to the generalized cost would copy CS2's main lever.
- CS1's "queues have no penalty" made waiting cosmetic. CS2 put waiting time into path cost, which gives vehicle count a real effect on ridership.

### Gaps
- No official numeric weights for walking cost, transfer penalty, wait-time cost or maximum walking distance in either game. One CS1 Steam claim ("citizens walk within ~12 blocks") is anecdotal and could not be verified.
- The CS1 car-ownership probability is not documented in any source found.
- No source found on how many transfers CS2 citizens will accept.

## 2. How is fare revenue computed and how does ticket price affect ridership?

### Takeaway
CS1 charges a fixed per-passenger fare that differs by transport type. The vanilla game gives no fare slider, so players change fares with mods such as Ticket Price Customizer. CS2 adds a ticket-price setting on each line, and the price enters citizens' path cost through the "money" term. In practice players report that even free fares raise ridership only modestly. No official default fare or elasticity numbers were found for CS2.

### Cited Findings
- CS1 default fares (unofficial, from one 2019 Steam comment): bus 1.00, metro 2.00, train 2.00, tram 8.00, taxi 10.00, sightseeing bus 30.00, ship 5.00, plane 10.00, cable car 1.20, ferry 1.00, blimp 1.15. The same comment points to a mod for changing fares. Another user in that thread says the game never shows default prices. — snippet from [Steam CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/2666626316171617090)
- CS1 Ticket Price Customizer mod: one commenter explains that "the total revenue is calculated on a weekly basis, and maintenance costs are fully deducted from the first day of the week". This is why the mod can look like it isn't working. Other users report income dropping to zero. — snippet from [Steam Workshop comments, Ticket Price Customizer](https://steamcommunity.com/sharedfiles/filedetails/comments/1393820309)
- CS2: "Ticket price affects citizens' pathfinding calculations." Line settings include "the ticket price, the number of vehicles running on the line," and operating hours (day, night or both). — [Paradox, Public & Cargo Transportation](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation); same text in [CS2 Wiki, Transportation](https://cs2.paradoxwikis.com/Transportation)
- CS2 default fare is unconfirmed. One CS2 player says "$8 seems to be the default". A CS1 forum post says the default is 8c with a 50c maximum. These may come from different versions or units. — snippets from [Steam CS2 "No one is taking the bus"](https://steamcommunity.com/app/949230/discussions/0/3877095833476361260/) and [Paradox forum "Public Transportation Revenues"](https://forum.paradoxplaza.com/forum/threads/public-transportation-revenues.1147438/) (forum page could not be fetched; snippet only)
- A Paradox forum thread is titled "Mass transit ticket prices have no effect on the amount of people using mass transit?" (CS2). The page could not be fetched, so its contents are unverified. — [Paradox forum](https://forum.paradoxplaza.com/forum/threads/mass-transit-ticket-prices-have-no-effect-on-the-amount-of-people-using-mass-transit.1606046/)
- CS2 Steam thread (4 Nov 2023): lines carried about "30 people from my 6000-10000 people". Setting fares to 0 "help a bit" but "not in a big way". Other players advised cheaper or free fares, paid parking (which pushes residents onto transit), and rail trunk lines fed by buses. — [Steam CS2 discussion "public transport"](https://steamcommunity.com/app/949230/discussions/0/3937895063004589723)
- Players on Steam suggest keeping CS2 fares at 10 or lower to raise ridership (anecdotal). — via search summary of [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/3877095833487760543)
- CS2 Economy 2.0 (patch 1.1.5f1, June 2024) removed government subsidies, raised city-service upkeep, moved service wages onto city funds, and switched garbage to a flat fee per building. None of the coverage mentions a separate transit fare change. — [GamesRadar](https://www.gamesradar.com/games/city-builder/cities-skylines-2-finally-unleashes-its-huge-economy-20-patch-with-reworked-rent-and-a-fix-for-death-waves-but-itll-also-kill-a-bunch-of-your-citizens/); [Destructoid](https://www.destructoid.com/cities-skylines-2s-massive-economy-2-0-overhaul-has-arrived/); [Paradox Dev Diary: Economy 2.0 Part 2](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/dev-diary-economy-part-two) ("City Service upkeep increased", Government Subsidies removed)

### Inferences
- In both games fare revenue appears to be per boarding passenger × the line's or type's fare, totalled weekly in CS1 and monthly in CS2. This is inferred from the weekly-revenue comment and the monthly CS2 panels. No official formula was found.
- In CS2 the fare is just one part of the money term, which is weighed against time and comfort. Adults weight time highest, so fare changes mostly move teens and price-sensitive trips. That would explain why players see free fares as a small effect.

### Gaps
- No official CS2 default fare, fare range or ridership elasticity found. The CS2 wiki does not list them.
- No source confirms whether CS1 vanilla has any fare control. The common understanding is that it does not, but no citable source was found.
- No source found on whether patches after June 2024 (2025–2026) changed transit fares or revenue. Searches found nothing transit-specific.

## 3. Construction and upkeep costs for metro/train lines and stations

### Takeaway
CS1 metro stations cost ₡10k–35k to build, with ₡160–560/week upkeep; train stations cost ₡20k–100k with ₡800–1,600/week upkeep. CS2 costs are roughly ten times higher and charged monthly: subway stations cost 50k–200k with 3,750–15,000/month upkeep, and depots/yards cost 120k–200k and set fleet size. Sources disagree on several CS2 upkeep numbers because Economy 2.0 (June 2024) changed upkeep.

### Cited Findings
**CS1 (₡, weekly upkeep)**
- Transport buildings table: Metro Station 10,000 / 160; Underground Metro Station 15,000 / 240; Elevated Metro Station 30,000 / 480; Elevated Metro Station With Shops 35,000 / 560; Historical Train Station 20,000 / 800; Train Station 45,000 / 960; Elevated Train Station 65,000 / 1,040; Multiplatform Train Station 60,000 / 960; Metro Plaza Station 100,000 / 1,600; Crossover Train Station Hub 100,000 / 1,600. Metro and train are unlocked at the Big Town and Small City milestones. — [CS1 Wiki (Metro/Transportation page)](https://skylines.paradoxwikis.com/Metro)
- Conflict: another section of the same wiki page lists the elevated metro station at ₡30,000 / ₡360 per week, not ₡480. — [CS1 Wiki](https://skylines.paradoxwikis.com/Metro)
- A guide lists the CS1 metro station at ₡10,000 and ₡160/week; underground ₡240; with road ₡340. — snippet from [GuideStrats metro guide](https://guidestrats.com/cities-skylines-metros/)
- Metro track is "slightly more expensive" than train track, and "the costs of the tracks themselves have also increased" in a later patch. The wiki gives no per-segment numbers. — [CS1 Wiki](https://skylines.paradoxwikis.com/Metro)
- A 2020 Steam comment says metro maintenance was raised a lot and underground track now costs about 5x more to run (anecdotal, possibly outdated). — snippet from [Steam CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/4307086417520093007)
- CS1 vehicle capacities: base metro 150; DLC/patch variants 120–660. Base passenger train 240, commuter 400, high-speed 300. Monorail 180. Default bus 30. — [CS1 Wiki](https://skylines.paradoxwikis.com/Metro)
- CS1 vehicle running cost: "Each bus costs ₡12 to run, regardless of the distance or number of stops it uses" (the wiki notes it "may have changed"). The bus system's maintenance "will be related to the number of buses in operation." Bus Depot ₡30,000. — [CS1 Wiki, Transportation](https://skylines.paradoxwikis.com/Public_transport)

**CS2 (monthly upkeep; wiki tagged as verified for v1.0)**
- Subway: Terminal Subway Yard 120,000 / 9,000 (5 vehicles); Subway Yard 200,000 / 18,000 (10 vehicles); Small Overground Station 50,000 / 3,750; Overground Station 100,000 / 7,500; Underground Station 200,000 / 15,000; Small Elevated 100,000 / 7,500; Elevated 150,000 / 11,250. Each station has 2 platforms and a comfort rating of 30–50. — [CS2 Wiki, Transportation](https://cs2.paradoxwikis.com/Transportation)
- Passenger train: Rail Yard 150,000 / 11,250 (10 vehicles); Railway Depot 120,000 / 9,000 (8 vehicles); Small Train Station 75,000 / 5,625; Medium 100,000 / 7,500; Train Station 125,000 / 13,875 (3 platforms); Terminus 125,000 / 13,875 (4 platforms); Central Train Station (DLC) 500,000 / 31,875 (7 platforms). — [CS2 Wiki, Transportation](https://cs2.paradoxwikis.com/Transportation)
- Bus for comparison: Bus Depot 150,000 / 23,250 (25 vehicles). — [CS2 Wiki](https://cs2.paradoxwikis.com/Transportation)
- Conflicting earlier figures (TheGamer, 5 Dec 2023, before Economy 2.0): Subway Yard 200,000 build / 48,000 per month, 10 vehicles; Extra Tracks upgrade 75,000 / 16,000 (+5 vehicles); underground station 50,000, overground 25,000, both 10,000 per month. Subway double track 2,500 per km to build and 250 per km per month upkeep; one-way track is half price. Unlocks cost development points: train 1, tram 2, subway 4. — [TheGamer subway guide](https://www.thegamer.com/cities-skylines-2-subway-lines-tracks-yard-build-guide/)
- Official framing without numbers: trains are "a high initial expense but due to their transport capacities, they more than make up for the initial cost over time". Subway: "The initial investment in the rapid transit infrastructure is high". Trams cost more up front than a bus fleet. Each depot supports a set number of vehicles, and upgrades raise it. Transit types other than bus and taxi are unlocked with Development Points. — [Paradox, Public & Cargo Transportation](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation)
- Economy 2.0 (June 2024) changed upkeep for most city service buildings. — [Destructoid](https://www.destructoid.com/cities-skylines-2s-massive-economy-2-0-overhaul-has-arrived/)

### Inferences
- Cost structure in both games: one-time station and track construction, then fixed weekly or monthly upkeep per station. In CS1 there is also per-vehicle running cost. In CS2, depots cap fleet size and carry a large fixed upkeep. Elevated stations cost more than underground stations in CS1 (₡30k vs ₡15k). In CS2 the order flips: underground is the most expensive (200k vs 150k elevated).
- Track upkeep per km (CS2, 250/km/month in the pre-2024 figures) is small next to station and depot upkeep. In CS2 the fixed nodes dominate operating cost.

### Gaps
- No current (post-2024 or 2026) CS2 per-km track costs for subway or train found, and no tunnel/elevated/ground multipliers. TheGamer's figure is from 2023.
- No per-vehicle upkeep figure found for CS2 trains or subways.
- No per-segment track cost numbers for CS1.

## 4. How does the game expose line performance and drive the player to add vehicles?

### Takeaway
CS1 shows line details (vehicles, passengers) and has two vehicle levers: the global budget slider for each transport type (vehicle count also depends on line length and number of stops) and a per-line Vehicle Count Modifier. CS2 replaced the budget link with a direct vehicle count per line, capped by depot capacity. It also shows a line usage percentage and monthly passengers per transport type. The game tells the player that near-100% usage means they should add vehicles to shorten waits.

### Cited Findings
- CS1: "A number of buses will spawn in relation to the number of stops on the route and the Budget set in the budget panel." Vehicle count "is primarily based on the line's length and can be modified to a limited extent by increasing or decreasing the bus system's budget." Each line also has a "Vehicle Count Modifier" slider. When day and night budgets differ, some vehicles go back to the depot at night. — [CS1 Wiki, Transportation](https://skylines.paradoxwikis.com/Public_transport)
- CS1: line details open by selecting a vehicle and clicking Line Details. — [CS1 Wiki](https://skylines.paradoxwikis.com/Public_transport)
- CS2: "If a line becomes extremely popular i.e. its usage percentage close to 100%, increasing the number of vehicles can alleviate the pressure and shorten passenger wait times at stops and stations." "Adjusting the vehicle numbers per line also makes sure that the depot's fleet is used optimally." Lines can be renamed, recoloured, turned on or off, and set to run day, night or both. — [Paradox, Public & Cargo Transportation](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation)
- The CS2 Transportation Info View shows "the overall number of passengers transported in a month per transport type". — [Paradox, Public & Cargo Transportation](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/public-cargo-transportation)
- The CS2 line panel shows line length, number of stops, current passengers and line usage %, and controls ticket price, vehicles, schedule and vehicle type. — snippet via [TheGamer bus routes guide](https://www.thegamer.com/cities-skylines-2-bus-routes-basic-transportation-set-up/)
- Example from one save: subway 47,761 and bus 31,701 citizens per month (single player save, not defaults). — snippet via [Steam CS2 "No one is taking the bus"](https://steamcommunity.com/app/949230/discussions/0/3877095833476361260/)

### Inferences
- Neither game appears to show profit per line. Players see passengers and usage per line, but revenue and upkeep only per transport type or city-wide. This fits the "transit is a service, not a business" framing. It is inferred because no source describes a per-line profit readout.
- The motivation loop for adding vehicles in CS2 is: usage % near 100 → longer waits → higher time cost in pathfinding → riders switch to cars. In CS1, waiting had no penalty, so vehicle count mattered mostly for throughput and visuals.

### Gaps
- No source confirms whether either game's line panel shows revenue or profit per line.
- No source gives the exact definition of CS2's "usage %" (load factor vs capacity per hour).

## 5. What do players and reviewers say about whether transit economics matter?

### Takeaway
Players widely say transit loses money in both games and treat it as a city service. Its payoff is less traffic, higher land value and more access for citizens, not fare profit. In CS2 a common complaint, especially early on, was low ridership that fare cuts barely fixed. Players fixed it with network design (feeder buses into rail) and car disincentives such as paid parking.

### Cited Findings
- CS1 players say trains "lose money" and cost more to run than metro, and that a city's train system cost far more than it earned. A reply noted the game automatically adjusts many income figures. — snippets from [Steam CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/4307086417520093007) and [Steam CS1 discussion](https://steamcommunity.com/app/255710/discussions/0/2666626316171617090)
- CS1 wiki: public transport "increases land value and, if built correctly, reduces traffic congestion". These are the benefits the game uses to justify transit. — [CS1 Wiki, Transportation](https://skylines.paradoxwikis.com/Public_transport)
- CS2 early complaints (Nov 2023): lines "NEVER efficient"; free fares helped only "a bit". Suggested fixes were paid parking, rail trunks with bus feeders, lines that are not too long, and stops at hospitals, schools, parks and commercial areas. — [Steam CS2 "public transport" thread](https://steamcommunity.com/app/949230/discussions/0/3937895063004589723)
- CS2 players reported trains and trams sitting at stations for a long time (Feb 2024), possibly because of a pedestrian boarding pathfinding bug (user diagnosis). — snippet from [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/4202489789151576150)
- Economy 2.0 removed subsidies and raised service upkeep, making the overall budget tighter, so transit upkeep matters more for the city's finances. — [GamesRadar](https://www.gamesradar.com/games/city-builder/cities-skylines-2-finally-unleashes-its-huge-economy-20-patch-with-reworked-rent-and-a-fix-for-death-waves-but-itll-also-kill-a-bunch-of-your-citizens/)
- Real-world parallel quoted in the search results: Honolulu Skyline's director said "Public mass transit is not profitable nearly anywhere". — [KITV](https://www.kitv.com/news/local/skyline-sees-low-rail-ridership-high-monthly-costs-during-first-year/article_fc9b5cc2-603d-11ef-85d0-2799879791f0.html)

### Inferences
- Both games make transit a loss-making service whose return comes indirectly, through traffic, land value and the tax base. For Railmap, where transit is the whole game and profit is the score, this is the model to avoid copying directly. A railway tycoon game needs fare revenue to be able to cover operating costs on good lines.
- CS2's lesson: if fares are only a small part of mode choice, the fare slider feels meaningless. A fare lever that matters needs a visible elasticity (ridership changes clearly when the price changes) and per-line profit feedback.

### Gaps
- No Reddit threads were found (searches returned none). No formal reviews (PC Gamer, RPS and similar) addressing transit economics specifically were found.
- No 2025–2026 player consensus found on whether later CS2 patches made transit profitable or fares more meaningful.
