# Economy systems of tycoon-style transport games: OpenTTD, Transport Fever 2, Railway Empire 1 and 2

Research date: 2026-10-26. OpenTTD figures come from the current `master` source on GitHub and the official wiki. Transport Fever 2 (TF2) and Railway Empire (RE1/RE2) do not publish their formulas. For those games the notes rely on the official wiki where it is readable, guides, and community testing, and they say which is which.

## How do towns generate passengers and choose destinations? How does service quality feed back into town growth?

### Takeaway
The three games work in different ways. OpenTTD makes passengers from random dice rolls per house, and those passengers go to the station that catches them, with no real destination unless cargodist is turned on. TF2 simulates individual residents who go to a reachable commercial or industrial destination, and a town grows from three things: reachable destinations, cargo supplied, and "quality" penalties. RE has every city send passengers to every other city, the amount grows with both cities' size, and city growth is driven mainly by meeting the city's goods demand.

### Cited Findings
**OpenTTD**
- Original algorithm: every 256 ticks each house rolls a random number X from 0 to 255. If X is greater than the house's population, nothing is generated. Otherwise it generates X/8 + 1 passengers (rounded down). Mail uses a separate roll. — [OpenTTD wiki, Game mechanics (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6)
- The source code comment calls this the "Original (quadratic) cargo generation algorithm." The alternative "Bitcount" mode uses a binomial distribution: it counts set bits in a random value masked to the house's passenger potential. During a recession the amount is halved, rounded up: `amount = (amount + 1) >> 1`. — [OpenTTD town_cmd.cpp](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/town_cmd.cpp)
- Distribution to stations: every 2.5-day cycle a station receives a share of the cargo produced around it equal to its rating. With several stations from one company, the cargo is split in proportion to their ratings. With several companies, it is first split by each company's best station rating. — [OpenTTD wiki (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6)
- Town growth interval: base values come from `_grow_count_values[2][6]`, indexed by the number of active stations (capped at 5). Normal values are `{320, 420, 300, 220, 160, 100}`. Values while "Fund new buildings" is active are `{120, 120, 120, 100, 80, 60}`. The growth-speed setting right-shifts the value, so each step halves it. Cities (`larger_town`) divide it by 2. The final interval is `m / (num_houses / 50 + 1)`, so it shortens by one step for every 50 houses. — [OpenTTD town_cmd.cpp](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/town_cmd.cpp)
- An "active station" is one that loaded or unloaded at least one item of any cargo within the last 50 days. Up to five such stations count. Sub-Arctic towns above the snow line need 1 t of food a month. Desert towns need 1 t of food and 1,000 L of water a month. Cities "grow 2x faster than other towns." — [OpenTTD wiki, Towns](https://wiki.openttd.org/en/Manual/Towns)
- Town (local authority) rating starts at +500. Each month it gains +12 for each station that moved cargo in the last 50 days and loses 15 for each that did not, plus 5 more while the rating is below 200. Placing a station needs a rating of at least −200. — [OpenTTD wiki (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6); [Towns](https://wiki.openttd.org/en/Manual/Towns)

**Transport Fever 2**
- The official wiki says towns grow "by means of new or larger buildings, if the utilization is high and the land value as well as accessibility is good." The Overview tab shows three factors as percentages added to the base population: Destinations, Supply and Quality. — [TF2 Wiki, Towns](https://wiki.transportfever2.com/doku.php?id=gamemanual%3Atowns)
- Supply: by default each town demands two cargo types, one for the commercial district and one for the industrial district. Meeting a demand adds up to +100% per district. Larger towns can demand up to three cargos per district. — [TF2 Wiki, Towns](https://wiki.transportfever2.com/doku.php?id=gamemanual%3Atowns)
- Quality penalties: overcrowded passenger stations (fix with more capacity, higher frequency or longer vehicles), traffic jams, and emissions in residential areas. — [TF2 Wiki, Towns](https://wiki.transportfever2.com/doku.php?id=gamemanual%3Atowns)
- A developer explained that reachability counts the commercial and industrial destinations residents can reach. It has three types: walking, by car, and on the player's lines. — [Steam workshop discussion](https://steamcommunity.com/workshop/filedetails/discussion/2454731512/3167694551641521846)
- Community reports (not official): when it is time for work or shopping, each resident picks "essentially any random suitable destination" it can reach. Residents prefer routes with fewer transfers. People use their car unless public transport is much faster. Faster, straighter roads raise reachability by car. — [Steam TF2 discussions (search summary)](https://steamcommunity.com/app/1066780/discussions/0/2639605437882690967)
- A guide reports that residents make only Home→Shop→Home or Home→Work→Home trips. Twice as many trips start or end in residential districts as in commercial or industrial ones. Residents will not use a line if the vehicles take too long to arrive. — [Brian's Guide to TF2](https://tooby.uk/CatRecovered/TF2/Guide.html)
- A Steam post says the cargo-supply bonus is capped at 200% (100% commercial + 100% industrial), while destinations have no cap, so destinations are usually the bigger limit on growth. — [Steam: Towns don't reach target population](https://steamcommunity.com/app/1066780/discussions/0/3117046824709855390/)

**Railway Empire (1/2)**
- Community description (RE1): "Passengers from every City want to go to every other City." Passengers only board trains to cities closer to their destination. A route must be shorter than "about twice the straight line" distance. — [Steam RE discussion](https://steamcommunity.com/app/503940/discussions/0/1627412171717392326)
- "Available passengers and mail from A to B will grow as A and B grow." In 20-year scenarios passengers wait at most 14 days to board, and tech upgrades can raise this limit. — [Steam RE discussion](https://steamcommunity.com/app/503940/discussions/0/1627412171717392326)
- City growth is "very much tied to city demands," and players advise keeping demand fulfilment "above 60%." — [Steam RE discussion](https://steamcommunity.com/app/503940/discussions/0/1627412171717392326)
- A city can take one more product for every 5,000 inhabitants. A product is no longer accepted once its demand is met. — [Gamepressure RE guide](https://www.gamepressure.com/railway-empire-guide/how-to-make-money/z5a983)
- A supplied small town "will quickly grow," but it then demands goods you are not shipping and stops growing. — [techfindings review](https://techfindings.net/archives/3208)

### Inferences
- In all three games growth is gated by two levers: being served (stations or reachability) and being supplied (goods). OpenTTD's lever is a step function (number of active stations, up to 5). TF2's is a continuous percentage sum. RE ties growth to delivering what the city demands.
- For Railmap's gravity model (population × population ÷ time^0.8), RE's "every city to every city, growing with both sizes" is the closest match. TF2's reachability is the best example of feeding service quality (travel time) back into growth.

### Gaps
- TF2's exact destination-choice function (time cutoff, cost weights for walking, waiting and transfers) is not published. The official wiki pages for economy and lines returned "Permission Denied."
- The OpenTTD tick conversion in `TownTicksToGameTicks`, and the rule for towns with zero stations (base value 320), were not checked in the source.
- No official RE1/RE2 formula for passenger generation was found. All RE details come from players.

## What is the exact revenue/payment formula (distance, transit time, cargo type)?

### Takeaway
OpenTTD's formula is exact and public: rate × amount × Manhattan distance × a time factor that starts at 255, falls in stages after the cargo's days1 and days2 thresholds, and never drops below 31. TF2 pays by straight-line distance (plus a height bonus) and the line's rated top speed, not the actual trip time, according to community testing. RE passenger income rises with distance and speed, while freight pays a flat amount no matter the distance.

### Cited Findings
**OpenTTD**
- `GetTransportedGoodsIncome` uses `MIN_TIME_FACTOR = 31` and `MAX_TIME_FACTOR = 255`, with `periods_over_periods1 = max(transit_periods − periods1, 0)` and the same for periods2. Delivery before days1 gets the maximum factor. Between days1 and days2 the factor falls with slope −1. After days2 it falls with slope −2, floored at 31. A newer branch then decays toward 1 using `2*MIN_TIME_FACTOR*FRAC²/(periods_over_max + 2*FRAC)`. Result: `BigMulS(dist * time_factor * num_pieces, cs->current_payment, 21)`. A NewGRF callback can override all of this. — [OpenTTD economy.cpp](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp)
- Distance is the Manhattan distance between the origin and destination stations, not the route length. One "day" in the formula is 2.5 game days. — [OpenTTD wiki, Cargo income](https://wiki.openttd.org/en/Manual/Game%20Mechanics/Cargo%20income)
- Base rate / days1 / days2: Passengers 3185 / 0 / 24; Mail 4550 / 20 / 90; Coal 5916 / 7 / 255; Goods 6144 / 5 / 28; Valuables 7509 / 1 / 32. — [OpenTTD wiki, Cargo income](https://wiki.openttd.org/en/Manual/Game%20Mechanics/Cargo%20income)
- Simple version: pay per 100 units per tile is passengers £39, coal £72, goods £75, mail £55. There is a 0.4% penalty per day after the early time, another 0.4% per day after the late time, and the penalty is capped at 88%. Rule of thumb: the best distance is 1–2× the speed, so about 300 tiles for a 200 km/h train. — [OpenTTD wiki (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6)

**Transport Fever 2 (community-derived, not official)**
- Ticket price depends on the straight-line distance between start and end and on the top speed of the slowest vehicle on the line. Income comes only from ticket sales. — [Brian's Guide to TF2](https://tooby.uk/CatRecovered/TF2/Guide.html)
- Distance is the straight line plus about 7× the height gained, a figure from TF1. The rated top speed sets the pay: a 186 mph train running at 10 mph is still paid as 186 mph. In TF1, freight paid the same rate for every cargo type and passengers paid about half. TF2 no longer shows ticket prices in the UI. — [Steam: Confused on Ticket Price calculation](https://steamcommunity.com/app/1066780/discussions/0/3855581634401564630/)
- One tester's controlled results did not fit the formula (a 2 km route paid less per km than a 1 km route). — [Steam TF2 discussions (search summary)](https://steamcommunity.com/app/1066780/discussions/0/3855581634401564630/)

**Railway Empire**
- Passengers and mail: "The further and faster you transport your passengers, the more you will earn." Freight: "the income does not depend on distance or speed." Goods pay more than raw materials, and goods used in the city where they were made pay nothing. — [Gamepressure RE guide](https://www.gamepressure.com/railway-empire-guide/how-to-make-money/z5a983)
- Express status (earned by fast round trips) gives about a 10% higher ticket price. Conductors and security guards raise income. — [Steam RE discussion](https://steamcommunity.com/app/503940/discussions/0/1627412171717392326); [Gamepressure](https://www.gamepressure.com/railway-empire-guide/how-to-make-money/z5a983)
- An RE2 player says the ticket price is a function of time, so freight cars that slow a passenger train cut its income. — [Steam RE2 discussion](https://steamcommunity.com/app/1644320/discussions/1/3843304884866619102)

### Inferences
- OpenTTD rewards both distance and speed, and the time-decay curve sets a sweet spot. TF2 pays for rated speed only, which makes money late in the game very easy (see the last section). For Railmap, distance × a time factor based on actual travel time, like OpenTTD, is easy to explain and hard to exploit.

### Gaps
- TF2's base tariffs and difficulty multipliers could not be confirmed. RE's exact fare formula is unpublished.

## How are track/station/tunnel/bridge costs computed, including terrain and demolition?

### Takeaway
OpenTTD charges per tile from a base price table (multiplied by a difficulty setting and inflation). Slopes need foundations, demolition is a separate clearing cost, and demolishing in towns lowers the town rating. No formulas were found for TF2 or RE. Guides only say that terrain, tunnels and bridges make track much more expensive.

### Cited Findings
- OpenTTD base prices in internal units, before multipliers: BuildRail 100, BuildFoundation 250, ClearGrass 20, ClearRough 40, ClearRocks 200, ClearHouse 1600, ClearWater 10000, Terraform 250, BuildBridge 275, BuildTunnel 450, BuildStationRail 200, BuildStationRailLength 180, BuildSignals 65, BuildDepotTrain 600. — [OpenTTD pricebase.h](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/table/pricebase.h)
- Town rating penalties for demolition: edge road −18 and inner road −50 (minimum −100), tunnel or bridge −250, building −40 to −300 depending on the building, cleared tree −35. Planting a tree gives +7 (up to 220). The rating needed depends on the difficulty: for example, removing a tunnel or bridge needs 144, 208 or 400. — [OpenTTD wiki (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6)
- TF2: upgrading town streets is expensive because buildings get demolished or moved. Tram track is cheap and removing it is free. — [Brian's Guide to TF2](https://tooby.uk/CatRecovered/TF2/Guide.html)
- RE: the largest station costs $200,000 and has 4 platforms. — [Gamepressure RE guide](https://www.gamepressure.com/railway-empire-guide/how-to-make-money/z5a983)
- RE2: one connection on hard terrain in South America (a station, supply towers and expensive track) cost more than $1M. Guides say avoiding many tunnels and bridges is the best way to save money. — [search summary of RE2 guides/Steam](https://www.gamepressure.com/S013-amp.asp?ID=22334)
- RE2 shows the cost of a line before you build it. — [God is a Geek review](https://godisageek.com/reviews/railway-empire-2-review/)

### Inferences
- In OpenTTD's ratios a house costs 16× a rail piece to clear, a foundation 2.5×, a bridge 2.75× per tile and a tunnel 4.5× per tile. This "house demolition is the most expensive" ordering is a good guide for Railmap's later urban-compensation costs.

### Gaps
- No base cost numbers were found for TF2 or RE construction. The wiki's construction cost pages were not accessible.

## What are vehicle purchase, running and infrastructure maintenance costs? Loans and inflation?

### Takeaway
OpenTTD has fixed running costs per vehicle, optional infrastructure maintenance whose cost per unit grows with the square root of network size, a fixed-rate loan, and optional inflation. In TF2, running costs are always charged and drop 40% while waiting at a terminal. Maintenance level settings raise them 25% or 50%. RE adds staff salaries and maintenance posts.

### Cited Findings
- OpenTTD rail maintenance: `price[InfrastructureRail] * maintenance_multiplier * num * (1 + IntSqrt(total_num)) >> 11`. Signals: `price * 15 * num * (1 + IntSqrt(num)) >> 8`. It is charged monthly to the "Property" expense line, and only when the `infrastructure_maintenance` setting is on. — [OpenTTD rail.h](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/rail.h); [economy.cpp](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp)
- Infrastructure maintenance is off by default, and "the more units you have, the more you pay per unit." — [OpenTTD wiki, Economy](https://wiki.openttd.org/en/Manual/Economy)
- Base prices: InfrastructureRail 10, InfrastructureStation 100, BuildVehicleTrain 400000, BuildVehicleWagon 2000. Running costs: steam 5600, diesel 5200, electric 4800. — [OpenTTD pricebase.h](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/table/pricebase.h)
- Loan: the yearly fee is `current_loan * interest_rate / 100`, charged monthly. Negative cash is also charged interest. There is a separate monthly "Other" charge of `StationValue >> 2`. — [OpenTTD economy.cpp](https://raw.githubusercontent.com/OpenTTD/OpenTTD/master/src/economy.cpp)
- Default maximum loan is £300,000, rising with inflation. The interest rate is set by difficulty and "does not change during the game." — [OpenTTD wiki, Economy](https://wiki.openttd.org/en/Manual/Economy)
- Inflation is off by default and runs from 1920 for 170 years. Cost inflation equals the interest rate, and payment inflation is about 1 percentage point lower. Relative revenue falls to about 61% by 1970, 37% by 2020 and 18% by 2090. Recessions happen 2–3 times a century, last 9–12 months, and halve production. — [OpenTTD wiki, Economy](https://wiki.openttd.org/en/Manual/Economy)
- TF2: running costs are the same whether a vehicle is moving or waiting, except a 40% reduction while waiting at a terminal. "High" maintenance costs +25%, and "Very High" costs +50% and restores condition. Infrastructure maintenance is "relatively small." The starting loan is $5M and can go up to $10M. — [Brian's Guide to TF2](https://tooby.uk/CatRecovered/TF2/Guide.html)
- TF2: locomotive top speed does not raise running costs, but power does. Faster wagons raise running costs. — [Steam: Ticket Price thread](https://steamcommunity.com/app/1066780/discussions/0/3855581634401564630/)
- RE: staff charge a one-time joining fee plus a monthly salary. — [Gamepressure RE guide](https://www.gamepressure.com/railway-empire-guide/how-to-make-money/z5a983)
- RE2: each locomotive has its own maintenance interval and consumption, and fuel use grows with distance. Maintenance posts reduce breakdowns but are expensive to maintain. Bonds are used as loans. — [search summary: Gamepressure RE2 maintenance](https://www.gamepressure.com/S013-amp.asp?ID=22334); [God is a Geek](https://godisageek.com/reviews/railway-empire-2-review/)

### Inferences
- OpenTTD's `num × (1+√total)` design is a deliberate brake on runaway expansion. A forum moderator says "bigger companies pay more" ([search summary, tt-forums](https://www.tt-forums.net/viewtopic.php?p=1254181)). It is a useful model for Railmap's per-km operating cost.

### Gaps
- TF2 and RE interest rates, plus TF2's vehicle price-to-running-cost ratio, were not found.

## How does adding vehicles increase income (station rating, waiting cargo, frequency) and when does it stop paying off?

### Takeaway
In OpenTTD, more frequent pickups raise the station rating, and the rating directly sets how much of the generated cargo you get. That is the core reason to add vehicles. Returns end when cargo stops piling up or the track gets congested. In TF2, frequency feeds waiting time and station crowding. In RE, adding trains only helps while trains fill up and passengers do not wait more than about 14 days.

### Cited Findings
- OpenTTD station rating (out of 255): days since last pickup is worth 130 points under 7.5 days, 95 at 7.5–15, 50 at 15–30, and 25 at 30–52.5 (ships count days ×4). The speed of the last vehicle gives (speed−85)/4 points (max 17%). Vehicle age gives 33, 20 or 10 points at 0, 1 or 2 years. Waiting cargo gives +40 under 100, +30 at 101–300, +10 at 301–600, 0 at 601–1000, −35 at 1001–1500 and −90 over 1500. A statue gives +26. The rating is recalculated every 2.5 days and moves at most 2 points per update. Below 50% the station loses cargo, and above 4096 units cargo disappears. — [OpenTTD wiki (zh)](https://wiki.openttd.org/zh/Manual/%E6%B8%B8%E6%88%8F%E6%9C%BA%E5%88%B6)
- TF2: overcrowded stations hurt town growth. Fixes are more capacity, higher frequency or longer vehicles. — [TF2 Wiki, Towns](https://wiki.transportfever2.com/doku.php?id=gamemanual%3Atowns)
- TF2: frequency only matters until the source's production or the destination's demand is used up. Industry output tops out at 400 a period (farms 200). — [Steam Ticket Price thread](https://steamcommunity.com/app/1066780/discussions/0/3855581634401564630/); [Brian's Guide](https://tooby.uk/CatRecovered/TF2/Guide.html)
- RE: you capture all the traffic if no city is ever left more than 14 days without a train. Extra trains help only if they fill up. Too many trains cause clogging. — [Steam RE discussion](https://steamcommunity.com/app/503940/discussions/0/1627412171717392326)
- RE: "If deadlocks appear, you probably have far too many trains." Platform efficiency matters more than line capacity. — [techfindings review](https://techfindings.net/archives/3208)

### Inferences
- The satisfying loop is: more frequency → higher rating or shorter waits → more passengers → more income, until a cap (congestion, waiting cargo, demand) is reached. For Railmap it would help to show players the frequency → demand response and the congestion limit, for example as a demand multiplier based on train interval.

### Gaps
- No numbers were found for TF2's waiting-time cutoff or frequency curve.

## What do players/reviewers say makes these economies satisfying or broken?

### Takeaway
The common complaint is that "after the middle of the game, money stops mattering." TF2 makes this especially strong because pay is based on rated speed. OpenTTD's built-in brakes (inflation, infrastructure maintenance) are off by default. RE gets credit for how its goods demand ties into city growth, but criticism for freight warehouses and congestion.

### Cited Findings
- TF2: one player says the game becomes progressively easier, because pay depends on rated speed while running costs depend on speed or power. Making money is "quite easy" once you know how, even on very hard. The challenge moves from finances to city growth and logistics. — [Steam TF2 discussions (search summary)](https://steamcommunity.com/app/1066780/discussions/0/4625853071149245248)
- TF2: one reviewer called it "very pretty, too easy." — [Dedoimedo review](https://www.dedoimedo.com/games/transport-fever-2.html)
- TF2 guide: by the mid-1920s "you should have plenty of money." — [Brian's Guide](https://tooby.uk/CatRecovered/TF2/Guide.html)
- OpenTTD: a JGRPP developer says income eventually reaches a tipping point where you "make way more money than you can ever spend." Infrastructure costs are expensive, especially for airports. — [Reddit r/openttd (mirror)](https://pol1.lr.ggtyler.dev/r/openttd/comments/1kop2y3/why_im_i_getting_in_debt_frequently)
- RE: the reviewer calls freight "the key to growth" and praises track building, but finds warehouse freight lopsided (wheat gets drained first) and takeovers tedious. — [techfindings review](https://techfindings.net/archives/3208)

### Inferences
- The main lesson for Railmap is to tie revenue to actual travel time, make upkeep grow faster than linearly with network size, and make the late-game goal something other than money (growth or reachability), so that "money is always plentiful late in the game" does not happen.

### Gaps
- Some Steam and Reddit content was reached only through search summaries, because of HTTP 429 errors. The large Steam guides (1293183195 and 1312597206) could not be read.
