# Transit fan tools and communities: what fans enjoy creating and sharing

Research date: 2026-11-01. About 19 tool calls. Many tool pages (MetroDreamin' home, Reddit) render their content with JavaScript, so details came mainly from tool blogs, READMEs, sample map pages and search snippets. Each claim is labeled by how strong its source is.

## 1. MetroDreamin' (metrodreamin.com): features, praise, sharing and discovery

### Takeaway
MetroDreamin' is a free, open-source site for drawing networks on a real map. Its pull is a mix of things. Each map gets live "stat" numbers (ridership, cost, stations, lines, length). The front page has social discovery feeds (Top Scores Today, Recently Starred, Recently Updated, Nearby). Maps can be forked or branched. There are many transit modes, each colour-coded. Public figures for user counts are not available.

### Cited Findings
- Tagline: "Build the Public Transit System of Your Dreams." Front-page sections: **Nearby [your area]** (geolocated, shown to us as "Nearby Yongsan-dong"), **Top Scores Today**, **Recently Starred** and **Recently Updated**. Funded by donations through Ko-fi ("Support us on Ko-fi if you love making maps"). It also has a Discord, a Reddit, a Code of Conduct and links to its source code. — [MetroDreamin' home](https://metrodreamin.com/)
- Open source (AGPL-3.0) at github.com/the-nemz/metro-dreamin. Built with Next.js/React, Firebase (database, auth, storage) and Mapbox GL. The repo has 1,052 commits, 96 GitHub stars and 23 forks. The contact is isaac@metrodreamin.com. — [GitHub the-nemz/metro-dreamin](https://github.com/the-nemz/metro-dreamin)
- A map page shows summary stats. Example: a public "New York City Transit Fantasy" map (last updated May 2025) lists **Ridership 2.10B, Cost $159B, Stations 726, Lines 43**. So ridership and cost estimates are part of how a map shows itself off. — [WebSearch snippet of a MetroDreamin' map page](https://metrodreamin.com/view/bllDU0g2S1VrR2Y5cjBUUjE2bVdCYWNCYURoMnwxMDY=) (stats came from the search snippet; I did not fetch the page)
- A user-made tutorial map, "How to create your first map on MetroDreamin' (Recommended for new people)", by "DanielHernandez the MapCreator", teaches these features by example:
  - straight lines and loop (circle) lines
  - interchanges
  - curves and alignments ("railways mode")
  - **branching**: fork a line, remove stations, add the branch
  - **walking connections**: an out-of-station interchange under the same fare
  - **shared track**: "Make waypoint for … only", so a station is a pass-through for one line
  - **colour-coded modes**: gondola, bus, tram, ferry, BRT, light rail, metro, regional rail, high-speed rail, airliner
  
  The page shows stats (Stations 52, Lines 24, Modes 11, Length 140 km, Public). Users *teach each other inside the medium itself*: the tutorial is a map. — [MetroDreamin' tutorial map](https://metrodreamin.com/view/QUhreVo2TGhUQ1ROaTh5ekthcHB6YjJqMW5RMnwxOQ%3D%3D)
- An unofficial local-first clone ("daaaarcy/metrodreamin") lists what it copies from MetroDreamin': **Branch** a line from a mid-line station, a **whole-map score**, **ridership and construction-cost estimates** using "documented heuristics", and **11 modes, each with its own speed** for ride-time estimates. It does **not** copy stars/likes, which "needs a backend". It keeps all data in localStorage, and an optional local sync server enables share links. Search snippets of other map pages mention a **"Branch History"** section ("Branched from default map"). — [GitHub daaaarcy/metrodreamin](https://github.com/daaaarcy/metrodreamin); [WebSearch results for MetroDreamin' map pages](https://metrodreamin.com/view/VksyS0QxdzFwclpsS2tEYW5GSnFDUmVNSkRoMnwyNw%3D%3D)
- Fans also share MetroDreamin' maps on Reddit. Example: an r/TransitDiagrams post of an unofficial Bermuda Railway map with a MetroDreamin' edit link. — [r/TransitDiagrams/new mirror](https://lr.sudovanilla.org/r/TransitDiagrams/new) (search snippet)

### Inferences
- The "Top Scores Today / Recently Starred / Nearby" layout suggests MetroDreamin' discovery runs on three things: (a) a computed score that turns building into a light game, (b) social stars, and (c) local relevance ("maps of my city").
- **Headline stat cards** (ridership, cost, stations, lines, km, modes) are what a fan screenshots or brags about. Railmap already computes ridership, cost and km, so a shareable "network card" with those numbers fits it naturally.
- Railmap already has **walking connections** and **shared track or pass-through** in some form: the intercity link, and shared track split by train counts. MetroDreamin' fans treat these as advanced, show-off features worth teaching.
- A "branch history" or "remixed from" note could work with no server. A shared link could carry a "based on: [name]" field.

### Gaps
- I found no public user or map counts for MetroDreamin', and no news coverage or launch posts (Product Hunt/HN). Search for the creator ("Isaac", the-nemz) turned up no interview.
- I could not verify how the score is calculated, or whether the site has comments, following or embedding. The home page loads its content dynamically.

## 2. Other tools: Metro Map Maker, others; which features fans love

### Takeaway
Metro Map Maker (MMM, metromapmaker.com, by Shannon Turner) is the best-documented example. Its users praise **simplicity, a grid, no account and share-as-link**. Its development is driven by **line and station *style* variety**: hollow London Overground lines, stripes "inspired by Athens, Cologne and Seoul", and London-style ticks and transfer circles. Exporting to SVG for Inkscape or Illustrator matters to serious users.

### Cited Findings
- **MMM v7.1 survey** (March 25, 2025; 70 respondents):
  - 41% have used MMM for a year or more. 26% have made or remixed 10 or more maps. More than half visit at least weekly.
  - Most popular activity: making maps. Second: **searching for a map of your own city**.
  - Most popular map type: **fantasy maps of real places**. Real systems and imaginary places tie for second.
  - "Almost everyone starts from a blank canvas rather than remixing."
  - What users love: simplicity, grid-based freedom, no account, link sharing. Quotes: "I really like how simple it is to use!"; "Not needing an account and being able to share maps as links is great!" Users also praised support for German characters in station names.
  - Most requested features: lines crossing over or under each other (the top complaint), resizable labels so names don't overlap, a floating toolbar, select-and-move an area, accounts to browse "YOUR maps", and transfer signs.
  - "Move station" was the most popular new feature. The author wrote she "wish[ed] I added it years ago."
  
  — [MMM survey reportback](https://blog.metromapmaker.com/metro-map-maker-survey-reportback/)
- **MMM v7/7.1 features** (v7 Nov 2024, v7.1 Jan 2025, v7.2 Dec 2025):
  - **8 new line styles**: Hollow (like London Overground), dashed uneven, dotted square, hollow square-cap, wide stripes, square stripes, **stripes "inspired by maps from Athens, Cologne, and Seoul"**, and colour outline.
  - **London station style**: ticks on one side of the line, rectangle end caps, and black-and-white transfer circles joined by a **"bone" shape instead of a "pill"**.
  - Shortcuts: Y cycles station style, X toggles transfer status, O cycles label orientation.
  - **Eyedropper** (P) copies a line's colour, width and style.
  - Move station (M), "Look" mode (K), and Likes/Dislikes ratings on maps.
  
  — [MMM blog: Coming soon v7.1](https://blog.metromapmaker.com/coming-soon-metro-map-maker-version-7-1/); dates from [MMM help](https://metromapmaker.com/help/)
- **MMM sharing and discovery**:
  - Every saved map gets a short URL (/map/wxtIWRy8).
  - Exports are print-quality SVGs, "editable in Inkscape or Illustrator".
  - The browser autosaves locally.
  - Discovery pages: Gallery, **"My Favorite Maps"** (curated by the author), **"Maps by City"**, **"All Maps by Date" calendar** and **"Random Map"**.
  
  — [MMM help/FAQ](https://metromapmaker.com/help/)
- **Curation as content**: the author records a weekly "My Favorite Maps" video. Since v6 all maps are browsable, so overlooked ones can be found and remixed. She can't keep up with "so many maps" made each week. — [MMM blog, Dec 6, 2024](https://blog.metromapmaker.com/my-favorite-maps-week-of-november-18-2024/)
- The design principle is that MMM "should always be easy to use without a login". It is open source, with feature requests on GitHub issues. — [WebSearch summary of MMM blog/help](https://blog.metromapmaker.com/first-post/)
- MMM has existed since at least 2017, when DCist covered fans' "Metro pipe dreams" made with it. — [DCist, Sept 7, 2017](https://dcist.com/story/17/09/07/metro-map-maker-helps-you-build-you)
- **Auto-octilinear layout** is an active research and tool area:
  - **LOOM** generates octilinear and geo-octilinear schematic maps from GTFS or OSM data, and has a QGIS plugin.
  - Bast, Brosi & Storandt's octilinear grid-graph method produces "nearly optimal metro maps in a fraction of a second".
  - A 2016 interactive editor snaps each user-drawn edge to horizontal, vertical or 45 degrees.
  
  — [Large Scale Generation of Transit Maps from OSM (Freiburg)](https://ad-publications.cs.uni-freiburg.de/Large-Scale_Generation_of_Transit_Maps_from_OpenStreetMap_Data.pdf); [Metro Maps on Octilinear Grid Graphs (EuroVis/CGF)](https://diglib.eg.org/handle/10.1111/cgf13986); [Interactive Metro Map Editing (NYCU)](https://people.cs.nycu.edu.tw/~yushuen/data/MetroMapEditing15.pdf)

### Inferences
- Railmap already has the "no login + share as link" mix that MMM users praise most. Its next gains are likely in **diagram styling**, which is where MMM spends its development: line styles (hollow, striped), station styles (London ticks vs. dots), transfer symbols (pill vs. bone), and label orientation and size.
- Users' top pain points are lines crossing or overlapping and labels colliding. Railmap's diagram view already tries to solve these: it spaces parallel lines 2px apart and avoids label collisions on the map. These are worth polishing and showing off in the PNG export.
- "Search for a map of my own city" is the second-most-common activity. Railmap's real-city presets and per-city save slots match this habit, so a "my city" framing on the start screen fits.
- A **local gallery** (several named networks per city, each with a thumbnail) would meet the "accounts to browse YOUR maps" request without a server.

### Gaps
- I did not verify these by fetching: **Brickmap, Transit Fan Maps, Mini Metro fan maps, OpenRailwayMap, Transitland** and Inkscape-based diagram kits. Searches for Brickmap and Transit Fan Maps returned nothing relevant. OpenRailwayMap and Transitland are data and visualization services rather than fan creation tools. I found nothing about how they engage fans.
- I found no usage numbers for MMM beyond the 70-person survey.

## 3. Communities: r/TransitDiagrams, r/imaginarysubwaymaps, Transit Maps blog, news coverage

### Takeaway
Fantasy maps of one's own city are the core genre. Cameron Booth's Transit Maps blog popularised **detailed critique plus a star rating**. Popular formats get mainstream press: a fantasy map of a real city posted on Reddit, or "X as a subway map" mashups. Critics such as RMTransit (2022) say fantasy maps ignore demand. That critique is a hook Railmap can answer, because its maps have a ridership model.

### Cited Findings
- r/TransitDiagrams has about 42k members and grew about 9k (+26.8%) in a year. "Fantasy" is a top-10 topic. Recent posts include a fantasy expansion of Pittsburgh's "T", a fictional DFW Metroplex rapid transit map and an Inglewood Transit Connector map. — [GummySearch r/TransitDiagrams](https://gummysearch.com/r/TransitDiagrams/) (third-party aggregator, so the figures are approximate)
- The Leventhal Map Center describes r/imaginarysubwaymaps as the place where users share fictional rail networks for their own cities and towns, and r/TransitDiagrams as the place where they discuss the pros and cons of networks worldwide. — [Leventhal "Transportation Dreams" (search snippet)](https://leventhalmap.org/projects/cartography-challenge/transportation-dreams) (the fetch failed on a certificate error)
- The **Transit Maps** books by Cameron Booth (yearly compilations, 2013–2023) are built from submitted maps. Every submission gets a "detailed, analytical review and a star rating". The 2023 edition includes "imaginative fantasy projects". — [Timetable World: Booth Transit Maps 2019](https://timetableworld.com/product/booth-transit-maps-2019-2019/); [2023](https://timetableworld.com/product/booth-transit-maps-2023-2023/)
- Fantasy-map posts reach mainstream news:
  - Fox 5 DC ran "Fantasy DC Metro map posted on Reddit creates new lines, connects popular destinations".
  - Scientific American ran "No mass transit in your city? Have a fake subway map instead".
  - Grist ran "what it would look like if L.A.'s freeways magically turned into subways".
  - The LA Review of Books ran "The Painful Consequences of Liking Fake Subway Maps".
  
  — [Fox5 DC](https://fox5dc.com/news/fantasy-dc-metro-map-posted-on-reddit-creates-new-lines-connects-popular-destinations); [Scientific American](https://www.scientificamerican.com/blog/plugged-in/no-mass-transit-in-your-city-have-a-fake-subway-map-instead); [Grist](https://grist.org/living/heres-what-it-would-look-like-if-l-a-s-freeways-magically-turned-into-subways/); [LARB](https://lareviewofbooks.org/article/painful-consequences-liking-fake-subway-maps/) (titles from search results; I did not fetch the articles, and dates vary, with some before 2018)
- "Subway-map-ification" of other networks is a long-running viral format, for example Cameron Booth's US Interstates as a subway map and his Amtrak subway map. — [Bloomberg CityLab 2012](https://www.bloomberg.com/news/articles/2012-01-19/translating-the-american-highway-system-into-a-subway-map); [Cool Hunting](https://coolhunting.com/design/u-s-interstates-as-a-subway-map/); [Map Room](https://www.maproomblog.com/page/143/) (older than 2018, shown for context)
- The critique view: Jonathan Crowe (The Map Room, Apr 18, 2022) summarises Reece Martin's (RMTransit) video. Fantasy maps imagine greatly expanded networks, often "to the point of implausibility". Lines ignore demand and real corridors, and the wishful thinking may distract from real advocacy. Crowe notes the worry assumes people take the maps seriously. — [Map Room, 2022](https://www.maproomblog.com/2022/04/thoughts-about-transit-fantasy-maps/)
- A transit-analytics note found by search says fans value fantasy maps because they can "spark dialogues about what's lacking in real-world transit systems". — [WebSearch summary, related to Next Metro Substack](https://nextmetro.substack.com/p/world-why-im-not-into-transit-fantasy) (the page returned 404, so treat this as weak)

### Inferences
- Fantasy posts are popular because they are **local** (my city), **plausible but ambitious**, and **explained** (why this line, what it connects). Critiques focus on demand and realism. Railmap's gravity-model ridership, crowding colours and cost numbers let a player *prove* a fantasy network is plausible, which answers the RMTransit critique. This could be a strong angle for share cards: "this network carries N per day and is M% crowded."
- A "star rating plus review" format (Booth) suggests an **auto "network report card"**. This would be a local, playful, non-economic self-review: coverage, transfers, longest line, busiest station, most crowded link. It could ship with the PNG export.

### Gaps
- Reddit pages could not be read directly. I have no verified top-post examples, upvote counts or analysis of critique comments. I have no verified evidence for the specific popularity of "phase 1/2/3" posts or "rate my network" threads (see section 4).
- I found no verified current transit map design contests from 2018–2026. The Leventhal "Cartography Challenge" exists, but its details were not readable.

## 4. Popular formats: phases, comparison with the real network, style imitation

### Takeaway
Style imitation is clearly a strong, long-running format. MMM's development follows it (London Overground hollow lines, London ticks, Seoul/Athens/Cologne stripes), and press covers it (NYC restyled as the London Tube). Comparing against the real network is supported only indirectly: users search for maps of their own city, and fantasy maps are usually *expansions* of real networks. I could not confirm phase-based expansion posts with sources.

### Cited Findings
- Restyling one city's map in another city's style is a covered format: "Map Mashup: The NYC Subway System Gets Re-Stylized as The London Tube". — [6sqft](https://www.6sqft.com/map-mashup-the-nyc-subway-system-gets-re-stylized-as-the-london-tube/)
- Vignelli's 1972 NYC diagram was inspired by Beck's London map. It uses horizontal, vertical and 45-degree lines with even station spacing. Many riders found it hard to read because it ignored geography, and Vignelli called it a "diagram" because "maps are for geography". This geography-vs-diagram debate is a classic topic. — [Wikipedia: NYC Subway map](https://en.wikipedia.org/wiki/New_York_City_Subway_map); [Geography vs geometry Substack](https://newsletter473.substack.com/p/-geography-vs-geometry)
- MMM added style presets named after real cities: London Overground hollow lines, London tick stations, and stripes "inspired by maps from Athens, Cologne, and Seoul". — [MMM v7.1 blog](https://blog.metromapmaker.com/coming-soon-metro-map-maker-version-7-1/)
- A fantasy map is typically "a greatly expanded" version of a real city's network. — [Map Room 2022](https://www.maproomblog.com/2022/04/thoughts-about-transit-fantasy-maps/)
- Animated "geography vs. diagram" morphing GIFs (real geography turning into the schematic) went viral. — [Arch2O: animated subway maps](https://www.arch2o.com/animated-subway-maps-transforms-actual-geography-reveal-astonishing-gaps-check-gifs) (title only, not fetched)

### Inferences
- **Diagram style presets** would be a high-value, no-server feature for Railmap's diagram view: "Seoul 2023", "Beck London", "Vignelli 1972", "Tokyo Metro". Style presets would change station symbols (dots vs. ticks), transfer symbols (capsule/pill vs. bone vs. ring), line styles (hollow for express, stripes) and the background.
- A **"before/after" or "real vs. mine" comparison** is natural because Railmap has real-network presets. A player could start from the real Seoul network and extend it, then export side-by-side diagrams or show "+N stations, +M km, +X% riders vs. real".
- **Phase snapshots** (phase 1/2/3) could be built from the existing monthly records and undo history. This is a guess about what fans want; I found no source for it. Examples: let the player bookmark "Phase 1" and later export a sequence image, or animate growth by date.
- **Geography-to-diagram morph animation** (map view easing into the octilinear diagram) matches the viral GIF format, and Railmap has both views already.

### Gaps
- I found no sourced evidence on how popular "Phase 1/2/3" posts or "rate my fantasy network" threads are. Reddit was not accessible. Treat these as plausible but unverified.
- I found no sources on Tokyo-style or Seoul-style diagram imitation communities (Korean or Japanese fan sites such as Namuwiki or Japanese 架空鉄道 communities were not searched).

## 5. What could work in a single-player, serverless web game

### Takeaway
The fan-tool features users praise most can all be done without a server: link sharing with no login, image or vector export, local autosave and galleries, style presets, and computed stats or scores. The parts that need a server are stars, likes, comments and public galleries. Curated, author-picked showcases and Reddit or Discord posting can stand in for those.

### Cited Findings
- No account plus link sharing is the most-praised MMM trait ("Not needing an account and being able to share maps as links is great!"). — [MMM survey](https://blog.metromapmaker.com/metro-map-maker-survey-reportback/)
- SVG export for further editing in Inkscape or Illustrator, and local browser autosave. — [MMM help](https://metromapmaker.com/help/)
- A local-first MetroDreamin' clone keeps branch, score, ridership and cost, and 11 modes in localStorage. It drops stars/likes as "needs a backend". — [daaaarcy/metrodreamin](https://github.com/daaaarcy/metrodreamin)
- Users want to browse "YOUR maps" easily, which is a personal gallery. — [MMM survey](https://blog.metromapmaker.com/metro-map-maker-survey-reportback/)
- Author curation ("My Favorite Maps" videos) drives discovery and community. — [MMM blog](https://blog.metromapmaker.com/my-favorite-maps-week-of-november-18-2024/)

### Inferences (concrete borrowable features for Railmap, roughly by fit)
1. **Diagram style presets** (Seoul / Beck London / Vignelli NYC / Tokyo / Paris): station tick vs. dot, transfer pill vs. bone vs. ring, hollow or striped line styles for express routes. Source idea: MMM v7.1.
2. **Network stat card in the PNG export and share preview**: city, date, lines, stations, km, daily riders, cost. Source idea: MetroDreamin' map stats.
3. **Local "My networks" gallery**: several named networks per city, each with an auto thumbnail; duplicate a network to try a "what if" variant; record "based on" lineage. Source idea: the MMM accounts request and MetroDreamin' branch history.
4. **Start from the real network and compare**: show the differences from the real preset (+stations, +km, +riders). Source idea: "fantasy = expansion of the real" and "search my city".
5. **Diagram polish fans complain about most**: label size and orientation control, cleaner line crossings and parallel bundling, a **legend/key and title cartouche** in the export. Source idea: MMM's top requests.
6. **Self "report card"**, a light playful score (coverage, transfers, busiest station, most crowded link) instead of economic pressure. Source idea: Booth's star ratings and MetroDreamin' "Top Scores".
7. **Map-to-diagram morph animation and growth timelapse**. Source idea: viral morph GIFs and phase posts (unverified).
8. **SVG export** alongside PNG for people who keep editing in Inkscape. Source idea: MMM.

### Gaps
- No data on whether players of a *game* (as opposed to a drawing tool) share as much as tool users do.
- Stars, likes, comments and public galleries are not possible without a server. Discord or Reddit hand-off is the usual workaround, but I found no source that measures its effect.
