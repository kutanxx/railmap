# How Google Maps and Apple Maps draw metro stations, footprints, passages, entrances and exits

Research date: 2026-10-26. Most primary sources found are from 2016-2023, so dates are flagged. Neither company publishes zoom-level rendering specs. Things marked "inference" or "gap" were not confirmed by a source in this session.

## Q1. When does each service switch from a point icon to a station shape, and with what colours and outlines?

### Takeaway
Neither Google nor Apple documents the zoom level where a station turns from an icon into an outline. What is documented: Apple collects station footprints (outlines) and draws them, and in Japan in 2016 it used a light-blue station structure with dark-blue platforms, shown only when zoomed in. Google began drawing station building and platform layouts in Japan, then in NYC (Penn Station) in 2017, but only when the transit layer is on.

### Cited Findings
**Apple Maps**
- WWDC 2016 "Public Transit in Apple Maps" (session 241): Apple collects "station footprints or the outlines of stations," and drawing the outline helps with "finding your way into and out of train stations." — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- Same talk on transit map style: "Roads and other driving-related elements have been dimmed out while transit lines and key terminus and transfer stations are emphasized." It also says "The information density and the lines that we show changes at each zoom." Lines follow their real paths, not schematic diagrams. — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- Line colours follow the agencies' own colours. Example given: in NYC, "A and C are blue, B and D are orange." No hex values or general colour scheme were given. — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- Japan (iOS 10 beta, August 2016): major Tokyo stations got enhanced footprints with the station structure drawn in **light blue**, and JR/Keio/Odakyu platform detail drawn in **dark blue**. Blue building outlines appear **only when zoomed in**, and only at enhanced or indoor-mapped stations. Osaka and Nagoya major stations were also enhanced, and smaller stations were not yet done. — [atadistance.net, 2016-08-25](https://atadistance.net/2016/08/25/apple-maps-enhances-japanese-station-as-transit-rollout-nears)
- Transit in Apple Maps launched September 2015 with iOS 9. By WWDC 2016 it covered 21 cities plus 300+ cities in China, using data from 250+ agencies plus Apple's own field surveys. — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)

**Google Maps**
- June 2017: Google Maps started showing "some subway station layouts" in NYC. Google said: "We're currently experimenting with different ways of showing underground transit stations in Japan and NYC." The article says the feature had "been in place in Japan for quite some time." — [Time Out New York, 2017-06-09](https://www.timeout.com/newyork/blog/google-is-starting-to-map-out-nycs-subway-platforms-060917)
- The 2017 layouts showed the building's physical structure and the train platforms, with no shops or ticket counters. They appeared with the **transit layer** on. Stations seen: Penn Station (NYC), Shinjuku and Tokyo stations, Yokohama, Osaka, Tanukikoji (Sapporo). Not all users or stations had them. No colours or zoom levels were reported. — [9to5Google, 2017-06-08](https://9to5google.com/2017/06/08/google-maps-subway-station-layouts-mobile-desktop/); [Ubergizmo, 2017-06](https://ubergizmo.com/2017/06/google-maps-subway-station-layouts); [GoogleWatchBlog, 2017-06](https://www.googlewatchblog.de/2017/06/indoor-maps-google-innenansichten/)
- Google Maps Platform styling (the public styling API) exposes only `transit`, `transit.line`, `transit.station`, `transit.station.airport`, `transit.station.bus` and `transit.station.rail`. There are no separate feature types for station entrances, platforms or footprints. — [Google Maps JS style reference](https://developers.google.com/maps/documentation/javascript/style-reference)
- In 2016, Atlas Obscura described Google Maps as heavily biased toward transit, although it doesn't show every station, while Apple highlighted landmarks. — [Atlas Obscura](https://assets.atlasobscura.com/articles/not-all-digital-maps-are-the-same)

### Inferences
- Both services seem to use a two-step approach: (1) a point icon or line symbol at city and neighbourhood zoom, then (2) a building outline or platform polygon only at street-level zoom, and only for stations they have surveyed. Both sources describe outlines as appearing "when zoomed in," not at every zoom. The exact switch zoom is unknown.
- From my general knowledge (not verified in this session): Google's low-zoom station icons often use the local agency's logo (for example the London Underground roundel, U-Bahn "U", Paris "M"), and a generic tram or train glyph elsewhere. Apple uses its own generic transit glyphs in line colours. This should be checked with screenshots before anyone relies on it.
- Apple's 2016 light-blue structure with dark-blue platforms is close to this project's own art rule (승강장 #A7BED4 with a #1F3A55 outline).

### Gaps
- No official zoom number exists for either service. Measuring it would need screenshots of the live apps.
- I found no current (2024-2026) description of Google's or Apple's station polygon colours.
- I found no confirmation of how widely Google's 2017 station layouts are shown now.

## Q2. Are underground passages, concourses and indoor station maps drawn?

### Takeaway
Yes for both, but only at selected large stations. Apple mapped underground passages and shopping arcades itself at major Japanese stations from 2016 (iOS 10). Google has had indoor station layouts in Japan since before 2017. In 2024 Tokyo's Toei Subway adopted Google's camera-based "Indoor Live View" guidance inside stations. I could not confirm Hong Kong indoor station maps for either service.

### Cited Findings
- Apple, iOS 10 (2016): major Japanese stations gained **indoor maps of underground passageways, shopping arcades and subway lines**, reportedly mapped by Apple itself. iOS 9 showed the new footprints but not the indoor maps. — [atadistance.net, 2016-08-25](https://atadistance.net/2016/08/25/apple-maps-enhances-japanese-station-as-transit-rollout-nears)
- Google 2012: Google Maps added indoor floor maps on desktop that included Tokyo Station. — [GIGAZINE, 2012-11-22](https://www.gigazine.net/gsc_news/en/20121122-google-map-indoor-tokyo-station)
- Google 2024: the Tokyo Metropolitan Government announced that Toei Subway would use Google Maps "Indoor Live View," starting at Tochomae Station on the Oedo Line. It uses Global Localization (AI matching of Street View imagery) for position and heading underground. It guides to escalators, elevators, stairs, toilets, platforms, ticket gates, ticket machines, ATMs and coin lockers. — [Tokyo Metropolitan Government, 2024-02-22](https://www.metro.tokyo.lg.jp/english/topics/2024/0222_01.html); [Toei news](https://www.kotsu.metro.tokyo.jp/eng/news/2024/20240123_11382.html)
- Google Sydney: accessible in-station directions at 70 complex train and metro stations show entrances, exits, signage and paths **inside** stations. — [Google Australia blog](https://blog.google/intl/en-au/products/explore-get-answers/new-accessible-maps-tools/)
- Hong Kong / Apple: one report said Apple's Hong Kong transit launch was complete except for indoor station mapping. The date is unclear and the status is unconfirmed. — [MacTrast (via search result)](https://www.mactrast.com/?p=153013)

### Inferences
- Underground passages are treated as indoor-map content shown only at very high zoom, inside the station outline. They are not part of the normal street map. Both companies focus this effort on huge multi-operator hubs such as Shinjuku and Tokyo Station.

### Gaps
- Current Apple support pages on indoor maps (airports and malls) do not cover stations in any source I found.
- I found nothing on Seoul, Hong Kong MTR, Singapore or Paris underground concourse rendering for either service.

## Q3. How are entrances and exits shown and labelled, by city?

### Takeaway
Apple says it shows each entrance's own number or code on the map, as printed on the agency's signs, and records its type (stairs, escalator, elevator). It had mapped 16,000+ entrances by 2016, and a later report says 50,000+ were surveyed. Google added entrance and exit locations, with the street side, to transit directions in 80+ cities in November 2023. Labels follow local practice: numbers in Tokyo, Seoul and Paris; letter+number codes like "A1" in Hong Kong and Singapore; letters in Hong Kong; codes like "E3" in San Francisco BART. Most London and NYC entrances have no number, and their signs name the street corner. These local conventions are general knowledge, not taken from Google or Apple sources.

### Cited Findings
**Apple**
- "From the outside, the entrance might not even have a name. But from the inside, there's often a number or code. We show that number or code on our map." Apple surveyed "every entrance not just for location but also type. Stairs, escalator, elevator." By WWDC16 it had mapped "more than 16,000 station entrances." It matches agency signage "not just in terms of the signage itself, but also what gets displayed where and in what order." — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- A later report says Apple worked with 400+ agencies and surveyed **50,000+ station entrances**. Its "Entrances and Exits" option shows accessibility (stairs, escalator, elevator). The report covers the iOS 9/10 era, and the exact date was not confirmed. — [Trusted Reviews](https://www.trustedreviews.com/news/apple-maps-is-a-brit-s-best-travel-buddy-with-new-update-2947795)
- Japan 2016: the iOS 10 rollout showed a bird's-eye view of Shinjuku with entrance and exit locations. A late-2016 review complained that tapping an exit point showed only tiny generic icons with nothing about the exit itself. — [AppleInsider, 2016-07](https://appleinsider.com/articles/16/07/02/apple-maps-to-gain-japan-transit-data-in-ios-10); [atadistance.net, 2016-11-13](https://atadistance.net/2016/11/13/im-at-shinjuku-station-but-which-shinjuku-station-are-you-talking-about-a-review-of-apple-maps-japan-transit/)

**Google**
- Google Keyword blog, 2023-11-15 (Amanda Leicht Moore, Director of Product): "In over 80 cities around the world," including Berlin, Boston, London, Madrid, New York City, Paris, Singapore, Sydney, Tokyo and Toronto, transit directions show "where the station entrances and exits are," "what side of the street they're on," and "a clear walking route to and from it." It was rolling out on Android and iOS. — [Google blog](https://blog.google/products/maps/google-maps-updates-november-2023/)
- An Android Authority review (December 2023) found the entrance and exit locations helpful. It criticised walking shown only as dots, no turn-by-turn walking, and no information on escalators, stairs or lifts. — [Android Authority](https://www.androidauthority.com/google-maps-transit-frustrating-experience-3395123/)

**Seoul / Korea**
- Google Maps in Korea lacks reliable walking and transit directions and has no turn-by-turn navigation. Reporters link this to Article 16 of the Spatial Information Act, which bans exporting survey map data without ministry approval. — [seoulstart.com guide](https://seoulstart.com/guides/naver-map-guide) (citing Korea Herald)
- On 2026-02-27, Korea's map-data export consultative body conditionally approved Google exporting 1:5,000 map data. Conditions include domestic-server processing through a Korean partner, blurring military sites, restricted coordinate display, only the minimum data needed for navigation, and no contour layers. The guide could not confirm that Google had shipped better Korean routing since then. — [seoulstart.com](https://seoulstart.com/guides/naver-map-guide) (citing korea.kr policy briefing, 2026-02-27); [Wikipedia: Map platforms in South Korea](https://en.wikipedia.org/wiki/Map_platforms_in_South_Korea)
- Local apps Naver Map and KakaoMap show Seoul subway exit numbers and transfer details. Naver can also suggest the best car to board for your exit. A Trip.com comparison lists exit numbers as a feature Google Maps lacks in Korea. — [Seoul tourism guide](https://www.seoultourism.org/?p=311); [Trip.com](https://sg.trip.com/guide/phone/naver-map.html)

### Inferences
- Common pattern for drawing an entrance: a small marker at the street-level stair or escalator point, labelled with the agency's exit code. It appears only at high zoom, near or connected to the station outline. Apple states this outright (code shown on the map). For Google it is implied by the 2023 directions feature, but Google's base-map exit labels are not documented.
- For a game, the simplest approach that matches both services is a numbered marker, because Seoul, Tokyo and Paris use numbers, and street-corner names are only needed for London- or NYC-style systems.

### Gaps
- No source confirmed how Google labels exits on the base map itself (outside directions) in Tokyo, Hong Kong or Singapore.
- I found no current source on Apple Maps in Seoul (whether transit or exits are shown).
- The iOS version in which Apple first showed entrance markers on the map is not pinned down. The evidence points to iOS 9 (2015) or iOS 10 (2016), not iOS 16. A search for an iOS 16 entrances feature found nothing.

## Q4. Do directions mention exits ("Take exit 5"), and in which cities? Official documentation?

### Takeaway
Apple has demonstrated exit-specific routing since 2016, with BART exit "E3" at Powell Street as the example. Google's directions show entrances and exits with the street side in 80+ cities (2023 onward). One 2026 guide says Google's naming of a specific numbered exit in Tokyo is inconsistent. In Korea, Google gives no reliable transit or walking directions.

### Cited Findings
- Apple's WWDC16 demo: directions recommend "a very specific exit with an exit code, E3, that's best for Moscone West" at Powell Street Station (San Francisco). The design goal: "at every moment customers should be able to match the instruction we're giving them to what they see in the real world." — [Apple WWDC16 session 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- Apple iOS 15 (2021): nearby stations appear at the top of the screen, favourite lines can be pinned, and Maps alerts riders when to get off (also on Apple Watch). AR walking directions after leaving a station launched in select cities. The "detailed city experience" with 3D started in London, Los Angeles, NYC and San Francisco. — [Apple Newsroom, 2021-09-27](https://www.apple.com/newsroom/2021/09/apple-maps-introduces-new-ways-to-explore-major-cities-in-3d/); [TechCrunch, 2021-06-07](https://techcrunch.com/2021/06/07/apple-maps-upgrade-brings-more-detailed-maps-transit-features-ar-view-and-more/)
- Google (2023-11-15): entrance and exit locations, street side and walking route in transit directions in 80+ cities, including Tokyo, Singapore, Paris, London and NYC. — [Google blog](https://blog.google/products/maps/google-maps-updates-november-2023/)
- Google Sydney: in-station step-by-step directions showing entrances, exits and signage at 70 complex stations, found through Directions, then the transit icon, then route options. — [Google Australia blog](https://blog.google/intl/en-au/products/explore-get-answers/new-accessible-maps-tools/)
- Tokyo: a traveller guide (2026) says Google may show a platform number, boarding position or station exit for one trip and less detail for another. An older blog said Google often doesn't name the exit at stations with 10+ exits. — [real-japan-guide.com (2026)](https://real-japan-guide.com/?p=291); [1keydata blog](https://www.1keydata.com/blog/?p=858)
- A 2021 SoraNews24 piece reported Google Maps routing users to a closed or forbidden exit at a major Tokyo subway station. This is evidence that Google does route via named exits in Tokyo. — [SoraNews24, 2021-06-06](https://soranews24.com/2021/06/06/google-maps-sent-us-to-a-forbidden-exit-from-one-of-tokyos-major-subway-stations/amp/)

### Inferences
- Both services treat "which exit" as part of the walking leg at either end of a transit trip. The exit is chosen as the one nearest the destination, and its agency code is shown when the data exists.

### Gaps
- No Google help-center page describing exit numbers in directions was found.
- No Apple support page listing which cities have entrance data was found.
- There is no 2024-2026 official update on either company's entrance coverage. Hong Kong-specific exit routing behaviour (MTR letter+number exits like "A1") was not confirmed for either service.
