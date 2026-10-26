# 노선도와 철도 게임은 역·승강장·환승역을 어떻게 그리는가

Note on method: I could not view map images in this session. Everything below comes from text descriptions on pages (news articles, Wikipedia, changelogs, devblogs, forums). I describe symbol shapes only where a text source states them. Research ran on 2026-10-26.

## 1. Station symbols: dots, ticks, pills, rectangles, and how shape/size marks station type

### Takeaway
Schematic maps use two basic marks. A small **tick** (a short stub sticking out of the line, in the line's colour) marks an ordinary station. A **circle or dot** marks an interchange, or every station in the "dot" tradition (Vignelli/NYC). Station type (interchange, express, accessible, connection to other modes) is shown with a different symbol shape or an extra icon, not with size. Subway Builder is the most relevant game reference because it runs on real city maps. It draws stations as true-scale platforms with constant width and square ends, and separately draws map "marker dots" with labels.

### Cited Findings
- London, 1933: Harry Beck marked ordinary stations with **short ticks** and interchanges with **diamonds**. He later replaced the diamonds with circles. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- London, from 1933: Beck put **one circle per line** at an interchange, each in that line's colour. An experimental 1938 map used one circle per station. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- London, 1960: Harold Hutchison introduced **black** interchange symbols. Circles meant Underground-only interchanges and squares meant British Rail interchanges. A single black symbol could carry several lines. From 1964, Paul Garbutt kept the black circles and replaced the squares with a **circle containing a dot**. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- London today: step-free stations get a blue circle with a white wheelchair. National Rail connections get the double-arrow logo beside the name, and the main-line station name goes in a box when it differs. There are aeroplane and boat icons, and walking distances to nearby out-of-station interchanges. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- New York, 1972 (Vignelli): "every stop is designated with a black dot", described as the negative of the coloured circular signs on the platform. Lines bend only at 45° or 90°, and every line has its own colour. — [historyofinformation.com](https://www.historyofinformation.com/detail.php?id=5618)
- New York, new MTA map unveiled April 2, 2025 (first full redesign since 1979): it aims to make express stops, transfer hubs and ADA-accessible stations easier to find. It uses black dots, a white background, bold colours, horizontal text and a diagrammatic style influenced by Vignelli. — [abc7ny](https://abc7ny.com/post/nyc-subway-map-mta-unveils-first-new-diagram-45-years/16119274/), [NY1](https://ny1.com/nyc/all-boroughs/transit/2025/04/02/mta-unveils-first--major--subway-map-redesign-in-nearly-50-years) (the MTA press release returned 403 to my fetch.)
- Wikipedia's general description: stations are marked with "symbols that break the line's continuity, along with their names". Train and aeroplane icons mark connections to other modes. — [Wikipedia: Transit map](https://en.wikipedia.org/wiki/Transit_map)
- Tokyo Metro: each station number is a line letter plus a number, inside a circle in the line's colour, shown next to the station name. — [Tokyo Metro subway map page](https://www.tokyometro.jp/en/subwaymap/)
- Seoul, old map: regular stations and transfer stations used the same "태극 문양" (taegeuk-pattern) mark. The redesign named this as a problem ("일반역과 동일한 형태의 태극 문양으로 혼용되는 환승역"). — [서울신문 go.seoul.co.kr 2023-12-26](https://m.go.seoul.co.kr/news/2023/12/26/20231226009002), [ditoday](https://ditoday.com/?p=88470)
- Transit-map designer Cameron Booth advises building ticks as reusable symbols, one per line colour. A tick's registration point (its anchor) goes where it attaches to the line; an interchange symbol's anchor goes at its centre. His example converts circular markers into "square markers with rounded edges", i.e. swapping marker shape is routine. — [transitmap.net/symbols](https://transitmap.net/symbols)
- Subway Builder (real-city subway game), v1.4.5 (2026-07-05): "constant-width platforms with squared ends and trains sized to the platform edge". Platform width is configurable. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder v1.6.0 (2026-08-06): platform borders were made narrower. v1.3.0: shorter stations for shorter trains, with cost shown while drawing. v1.4.0: a platform layout system with quad-track express support, and crossovers placed automatically. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Mini Metro: stations are abstract shapes (square, circle, triangle, later plus, arrow, etc.). The shape encodes passenger destination type, not station importance. The game is inspired by Harry Beck's style. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))

### Inferences
- There are two levels of drawing. (a) A "physical" level, used by Subway Builder, NIMBY Rails and Transport Fever 2: a platform drawn at real length and width along the track. (b) A "diagram" level, used by every agency map: a small tick or dot plus a label. A real-map game like 레일맵 is closest to Subway Builder, which shows a physical platform at high zoom and a marker dot with a label as a separate, toggleable layer.
- Size is rarely what signals station type. Agencies use a different shape (tick vs circle), fill (black vs white) or an attached icon.

### Gaps
- Exact pixel and proportion rules (tick length or circle diameter relative to line width) for London, Seoul or INAT were not found in text.
- I did not find how the 2025 MTA map draws express stops versus local stops (white vs black dots). The press release was blocked (403).
- Railway Empire 2, Metro Dreamin' and Metro Map Maker were not researched within the tool budget.

## 2. Interchange symbols: rings, linked circles/connectors, pills, how many lines share one symbol

### Takeaway
Agencies use three families. (1) **One symbol per line**, joined by a connector: Beck's coloured circles, and Seoul 2023's "연결 고리" (linked form) with line colours in sequence. (2) **One shared symbol** that many lines pass through: Hutchison/Garbutt's black ring, which grows into a capsule or pill shape when lines run in parallel. (3) **Separate stations plus a walking note**: London's out-of-station interchanges with distances. Seoul's 2023 redesign chose a "traffic-light" transfer mark: line colours lined up side by side and linked, as on a traffic signal. The redesign claims transfer route-finding became up to 69% faster.

### Cited Findings
- Seoul redesign (shown in September 2023, final design 2023-12-26): transfer stations use "신호등 방식의 환승역 표기" (traffic-light-style marking). Connecting lines appear as a sequence of line colours joined in a "연결 고리 형태" (linked form). The map is octolinear (8 directions) with Line 2 drawn as a circle at the centre. — [서울신문](https://m.go.seoul.co.kr/news/2023/12/26/20231226009002), [서울시 내 손안에 서울](https://mediahub.seoul.go.kr/archives/2009879)
- Seoul reported results: station-finding time reduced by up to about 55%, and route-finding through a transfer station reduced by up to about 69%. — [mediahub.seoul.go.kr](https://mediahub.seoul.go.kr/archives/2009879)
- Seoul promised a "서울 지하철 노선도 디자인 가이드라인" covering lines, colours, station marks and station names for the full and English maps, to be published on the city website in January 2024. — [mediahub.seoul.go.kr](https://mediahub.seoul.go.kr/archives/2009879), [ditoday](https://ditoday.com/?p=88470)
- Seoul also standardised the per-line 단일노선도 (single-line strip maps) in three formats: horizontal, vertical and square. — [news.seoul.go.kr 단일노선도 tag](https://news.seoul.go.kr/culture/archives/tag/%eb%8b%a8%ec%9d%bc%eb%85%b8%ec%84%a0%eb%8f%84); 2025 standardisation reported by [YTN](https://www.ytn.co.kr/_ln/0103_202504171108250868)
- London Hutchison (1960) and Garbutt (1964+): black interchange circles that "allowed multiple lines through them", unlike Beck's one-circle-per-line approach. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- Beck's 1961–64 Victoria line sketches reduced the number of interchange circles at King's Cross to two, which allowed a tighter diagram. In other words, the number of circles is traded against compactness. — [The Map House](https://www.themaphouse.com/exhibitions/57/works/255788-harry-beck-four-victoria-line-sketches-1961-1964/)
- London out-of-station interchanges: nearby stations are now sometimes shown with the walking distance (e.g. Tower Hill – Fenchurch Street). A Bank–Monument pedestrian route was once prominently marked. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- Ilya Birman's *Designing Transit Maps* (2024) "Transfers" chapter frames the design decisions:
  - one circle or several, and whether to use circles at all;
  - how to connect and paint them, and how to make gradients look good;
  - interchanges in bundles of parallel lines and at intersections;
  - how the mark should depend on passage length and on passing through turnstiles;
  - steering riders toward the more convenient transfer;
  - platforms with mismatched names.
  — [bureau.ru announcement](https://bureau.ru/news/2024/book-metro-transfers-en) (the chapter's answers are not public on that page)
- A Merseyrail map critique puts "consistency in the use of interchange circles" first among its fixes. It says interchange circles mark every place a passenger can or must change. — [projectmapping.co.uk](https://projectmapping.co.uk/Reviews/merseyrail_maps.html)
- Subway Builder v1.7.0 (2026-08-30):
  - "Station groups can show multiple marker dots with a single label";
  - "Improved station interchange icons";
  - station markers no longer overlap;
  - labels are a separate, toggleable layer;
  - fixed labels being covered by dots.

  v1.5.0: group marker dots can be repositioned. v1.1.0: a station group editor lets the player choose which stations count as one interchange. v1.0.0: the route station list shows transfers to other routes in the same group. v0.11.2: a "nearby stations" note shows whether people will walk between them. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder v1.5.0: people walk up to 45 minutes to or from a station and consider up to 4 transfers. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Cities: Skylines 2 (Oct 2023 Steam thread): a player couldn't find how to make a metro transfer, and a reply said workshop creators would have to make such stations. In CS1, multi-platform and transfer stations were mostly workshop assets (e.g. "2 Platforms Parallel", "3 Platforms Parallel", "Metro Interchange Station") and needed mods such as Advanced Stop Selection or Move It. — [Steam CS2 discussion](https://steamcommunity.com/app/949230/discussions/0/6367585250003718827), [Steam CS1 workshop comments](https://steamcommunity.com/sharedfiles/filedetails/comments/1185164524)
- Mini Metro's "Interchange" upgrade lets more passengers wait without overcrowding and makes transfers faster. Its visual form was not described in my sources. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- Paris: one travel source says interchanges are marked as "correspondances" with orange/white signage. A claim about "white circle or diamond" map symbols came only from low-quality scraped pages, so I discard it. — [parisperfect.com](https://www.parisperfect.com/getting-around-paris/metro.php)

### Inferences
- In the "traffic-light" pattern (Seoul 2023), the transfer symbol is a row of line-coloured pieces joined together. 레일맵's label bubble could use this as a row of line-colour dots inside a linked capsule, which matches what the current bubble already does with colour dots.
- In the "station group" pattern (Subway Builder), each line keeps its own physical platform and its own marker dot, and the group gets one shared label. This is the closest match to the owner's wish for "per-line platforms at transfers": platforms per line, a connector or grouping between them, and one label.
- A single shared symbol (black ring or pill) works on a diagram but hides real platform geometry. On a real-scale map, per-line platforms joined by a connector line are more honest.

### Gaps
- The exact geometry of Seoul's 2023 transfer mark (circle vs capsule, orientation, ring colour) was not described in any text source, and the design guideline PDF was not found online. Someone should verify it visually.
- Seoul Metro's own current map (as opposed to the city's redesign) and its symbol rules were not found.
- Jug Cerovic's INAT site (inat.fr) failed with a certificate error, so INAT symbol rules are unverified.
- Tokyo Metro's transfer symbol on the official map was not described in text sources.
- Mini Metro / Mini Motorways interchange visuals were not documented in text.

## 3. Geographic vs schematic, and curved platforms (maps and games)

### Takeaway
Schematic maps straighten everything to octolinear or curvilinear lines, so their "platforms" are abstract marks. Real-geometry games increasingly allow **curved platforms**. NIMBY Rails has had them since v1.4 via a "keep straight" flag. Subway Builder added curved stations in v1.2.0 (2026-03) and allowed tighter curves in v1.3.0. Transport Fever 2's base modular stations are straight, and curved platforms come from mods. Users find curved stations hard to set up: platform length changes as the curve is drawn.

### Cited Findings
- Early route maps were geographically accurate. Schematic diagrams appeared in the 1890s, and George Dow's 1929 diagram influenced Beck's 1933 map. Many agencies also publish geographic or hybrid maps. Madrid's 2007 map removed diagonals entirely, drew complaints, and was reverted in 2013. — [Wikipedia: Transit map](https://en.wikipedia.org/wiki/Transit_map)
- Seoul 2023 adds geographic cues (airports, rivers, sea) to the octolinear diagram. — [mediahub.seoul.go.kr](https://mediahub.seoul.go.kr/archives/2009879)
- Max Roberts (University of Essex), IJHCS 2016, three experiments:
  - a curvilinear Paris map supported faster journey planning, but user preference was unrelated to speed;
  - London users showed an octolinear bias in ratings;
  - the authors say the "octolinearity-as-gold-standard conjecture continues to be refuted".

  — [Essex repository 17237](https://repository.essex.ac.uk/17237/)
- Roberts et al., IDJ 2016: Berlin octolinear vs concentric-circle maps compared for usability. A 2025 follow-up again found poor user ratings for concentric maps. Main theme: objective performance and subjective preference diverge. — [Essex repository 26174](https://repository.essex.ac.uk/26174/), [timetableworld listing](https://timetableworld.com/?p=29626)
- NIMBY Rails v1.4: added curved platforms through a per-track "keep straight" flag. The flag is on by default for platform and depot tracks, and disabling it lets the platform "be curved like any other pair of track segments". — [carloscarrasco.com devblog 2022-01](https://carloscarrasco.com/page/43/)
- NIMBY Rails players report that connecting track to a platform "starts to stretch the station", and a reply blames how curved tracks are drawn. The workaround is to start with a shorter platform and extend each side while watching the length. For C- or S-shaped platforms, start shorter. — [Steam NIMBY Rails discussion](https://steamcommunity.com/app/1134710/discussions/0/3824163953451917770)
- Subway Builder:
  - v1.2.0 (2026-03-05): "Stations can be curved";
  - v1.3.0: stations can be more curved;
  - v1.4.10: fixed stations being unable to curve;
  - v1.6.0: fixed routes not following curved stations;
  - v1.7.0: fixed light-metro stations drawn too short when heavily curved.

  — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Transport Fever 2: a community guide says the base game supports only straight platforms. The "Freestyle Station" mod lays platforms along curved track and links them to tracks with markers. Another mod author notes that base-game modular station functionality "does not support curved stations". A forum user explains that curved modules are hard because the radius differs at every position. Base modules are 40 m long and are extended in "configure station". — [modelrailwayforum](https://modelrailwayforum.com/viewtopic.php?p=45138), [Steam TF2 discussions](https://steamcommunity.com/app/1066780/discussions/0/2966147052001985106)
- OpenTTD: I found no authoritative text confirming that platforms are straight only. The official wiki station page covers layouts (terminus, ro-ro, bag stations), not tile rules. A community guide shows "curved Ro-Ro" layouts, where the curves are in the approach track, not the platform. — [OpenTTD wiki Railway station](https://wiki.openttd.org/en/Manual/Railway%20station), [gamepretty guide](https://gamepretty.com/openttd-simple-train-station-configurations/)

### Inferences
- For 레일맵, a curved platform can be made from the track itself. Slice the track LineString over the platform length around the station point (e.g. Turf `lineSliceAlong`), then draw that slice as a thick line layer with a navy casing, a light-blue fill and a dashed centre line. This is a line layer, not a rotated rectangle, so it bends with the track. NIMBY Rails and Subway Builder both treat the platform as a track segment, which supports this approach.
- Subway Builder's bug list (too short when curved, routes not following curved stations) warns that platform length should be measured along the curve, not as a straight chord.
- Max Roberts' work suggests not over-straightening to octolinear on principle, and that curves are fine. That fits a real-map game where geometry is geographic.

### Gaps
- Whether Transport Fever 2 got native curved platforms in a 2024–2026 update was not confirmed. Sources are community posts from 2019–2024.
- Cities: Skylines 2 metro station geometry (straight-only prefabs vs curved) was not confirmed.
- Railway Empire 2 platform shapes were not researched.

## 4. Parallel lines through a station: offsets, shared/island platforms, cross-platform transfers

### Takeaway
On maps, parallel lines through one station are drawn as offset parallel strokes, with one elongated interchange symbol (pill) or a row of linked symbols spanning them. In games, Subway Builder is the clearest model: an explicit platform-layout system (island and quad-track express layouts), parallel or interlined routes drawn side by side, and a station group joining separate stations.

### Cited Findings
- Subway Builder v1.7.0: "Parallel and interlined routes now display side by side", with a line-thickness setting. Parallel track connections can link any valid pair of tracks. Another express station layout was added. v0.9.0 had an experimental option to show interlined routes side by side. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Subway Builder v1.4.0 platform layout system with quad-track express support. v1.4.10 fixed double-track island-platform speed limits. v1.6.0: parallel tracks connect to the centre two tracks of quad-track stations, and trains may turn at any station track at a terminus. v1.7.0: trains don't wait for an occupied platform if another is free. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Birman's transfers chapter explicitly treats "interchanges in bundles" (parallel lines) as a separate design case from intersections. — [bureau.ru](https://bureau.ru/news/2024/book-metro-transfers-en)
- CS1 overground station mod note: the two inner tracks serve passengers and the outer tracks carry through trains, a common four-track layout. — [Steam CS1 workshop comments](https://steamcommunity.com/sharedfiles/filedetails/comments/725099730)

### Inferences
- For a 3·4호선-style shared platform (cross-platform transfer), 레일맵 could draw one wider platform between two offset line tracks and show both line colours on it. For a 교대역-style transfer between separate platforms, draw two per-line platforms, each following its own track, joined by a thin navy connector (walking link), and use one label. The connector maps to Seoul's "연결 고리" and London's walking-distance notes.
- MapLibre `line-offset` can draw parallel lines on one shared track geometry. That avoids drawing separate geometries per line.

### Gaps
- No source text described how the Seoul 2023 map or Seoul Metro's map draws same-platform transfers (e.g. 3·4호선 at 충무로 or 교대-type) differently from walking transfers.
- Tokyo maps' handling of through-running and parallel lines was not found in text.

## 5. Label conventions and readability

### Takeaway
Agencies keep labels horizontal and place them next to the mark. Extra information goes in small attached badges: line-letter-number circles (Tokyo), boxes for different main-line names, rail and aeroplane icons and walking distances (London), and line colours in sequence (Seoul). Recent redesigns (NYC 2025, Seoul 2023) justify their changes with readability: horizontal text, high contrast, colour-blind-safe colour plus pattern, and transfers that stand out from ordinary stops.

### Cited Findings
- Tokyo Metro: line-coloured circle containing a line letter and station number, beside the station name. — [Tokyo Metro](https://www.tokyometro.jp/en/subwaymap/)
- JR East planned a 3-letter code for major transfer stations (e.g. "SJK" for Shinjuku) on top of line codes. This is a pre-2020 plan and its current use is unverified. — [japanstation.com](https://www.japanstation.com/jr-east-to-introduce-new-alphanumeric-id-system-for-stations-in-tokyo/)
- Seoul 2023: the lack of station numbers ("역번호 표기 부재") was listed as a problem of the old map. Colours were tuned in lightness and saturation and given patterns for colour-vision deficiency. — [mediahub.seoul.go.kr](https://mediahub.seoul.go.kr/archives/2009879)
- NYC 2025: horizontal text, black dots, white background and bold colours, for low-vision and cognitive accessibility. — [abc7ny](https://abc7ny.com/post/nyc-subway-map-mta-unveils-first-new-diagram-45-years/16119274/)
- London: when a National Rail station has a different name, it appears in a box. Walking distances are shown for out-of-station interchanges. — [Wikipedia: Tube map](https://en.wikipedia.org/wiki/Tube_map)
- Subway Builder v1.7.0:
  - labels are a separate toggleable layer;
  - one label per station group even with several dots;
  - markers no longer overlap, and labels are no longer hidden under dots.

  v0.8.0: station names come from cross streets. v1.0.0: renaming a group can rename all its stations. — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- Roberts: user preference and actual performance diverge, so "what designers like" is not proof of readability. — [Essex repository 17237](https://repository.essex.ac.uk/17237/)

### Inferences
- 레일맵's current bubble (name + '환승'/'종착' tag + line-colour dots + daily riders) already follows the "colour sequence" idea. Two improvements follow from the evidence. First, make transfer stations visibly different from ordinary stations in the map symbol itself, not only in the bubble text; the visual difference is the exact problem Seoul fixed. Second, avoid label and marker overlap, which Subway Builder fixed in v1.7.
- A per-line coloured number badge (Tokyo style) could replace or complement the colour dots later. That is a suggestion only.

### Gaps
- Cameron Booth's specific opinions on station and interchange readability (beyond symbol-building technique) were not retrieved.
- Player discussions (Reddit/Steam) specifically about station readability in Mini Metro, NIMBY Rails or Subway Builder were not found within the budget.
- Metro Dreamin' and Metro Map Maker conventions were not researched.
