# HUD visual language in calm map/transport/builder games, explainer graphics and transit wayfinding (for 레일맵 style choice A / B / C)

Scope reminder: visual language only (fill, border, radius, type, icons, active state, UI-vs-world separation), not layout.
Options under evaluation: (A) white boxes + thick navy borders (same as map bubbles); (B) navy-filled control bars, white text, yellow active item, map info stays white; (C) light beige "paper card" panels with thin warm borders.

Research caveat (read first): web sources that describe these games' HUDs *concretely* (hex colours, radii, borders) are rare. Developer statements are mostly about "minimalism" in general. Game UI Database (gameuidatabase.com) pages are screenshot galleries that could not be read as text by my tools. So many per-game visual details below are in **Gaps** as "needs screenshot check" rather than stated as fact. Contrast numbers in the last section are my own calculation with the WCAG formula and are reproducible.

## Q1. Do calm builder / transport games use dark filled HUD bars or light/outlined panels over the world, and why?

### Takeaway
The best-documented calm transit games (Mini Metro, Mini Motorways) lean on transit-graphic-design heritage: Helvetica, bold flat colour, simple geometry and as little UI chrome as possible — closer to "information drawn on the map" than to boxed panels. The one big 2026 data point (Cities: Skylines II "First Frost") moved *away* from translucent glass toward solid, calmer, rounder UI to fix confusion. Heavy, window-heavy UIs (Transport Fever 2, Subway Builder) are the ones players criticise most — the complaint is about size/density/modality, not about light vs dark per se.

### Cited Findings
**Mini Metro / Mini Motorways (Dinosaur Polo Club)**
- "From its very inception, the key design pillar for Mini Metro has been minimalism" and the team tried to "extend that minimalism from the core design to every part of the player experience." — [Dinosaur Polo Club blog, 2015](https://dinopoloclub.com/2015/01/15/mobile-and-pricing/)
- On mobile the UI was "slightly redesigned, with bigger buttons and less whitespace"; enlarging hitboxes got most of the way; button animations relied on a hover state that touch lacks. — [Dinosaur Polo Club blog, 2015](https://dinopoloclub.com/2015/01/15/mobile-and-pricing/)
- The early look took "heavy inspiration from graphic design of the London and New York subways"; artist Jamie Churchman "kept Helvetica as the typeface, but redesigned the user interface to be very much its own thing, while still echoing the classic MTA design." The team described its strength as "simple, consistent graphic design." — [Game Developer postmortem](https://www.gamedeveloper.com/audio/postmortem-dinosaur-polo-club-s-i-mini-metro-i-)
- Mini Motorways "uses Helvetica in conjunction with bold colors and simple geometry in its logo and interfaces" (designer listed as unknown; artwork All Rights Reserved). — [Fonts In Use](https://fontsinuse.com/uses/51247/mini-motorways-logo-and-interfaces)
- Reviewers describe Mini Metro's interface as like a stripped-down Google Maps and praise its minimalism. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game)) (via search summary; reviews linked there, e.g. [EGM](https://egmnow.com/mini-metro-review/))

**Cities: Skylines II — 2026 UI refresh (Iceflake Studios)**
- Colossal Order ended its involvement on 17 Nov 2025; development moved to Iceflake Studios. — [Wikipedia: Cities: Skylines II](https://en.wikipedia.org/wiki/Cities:_Skylines_II)
- Dev diary "City Corner #1" (29 Jan 2026): "the colors and the visual style have gone through a big makeover… Now there are more round shapes, and the demand bars have more focus"; icons changed "to be more expressive and easier to understand the context"; reason: "We know that the UI can sometimes be a bit confusing when it comes to communicating things." Described as work in progress. — [Paradox: upcoming visual updates](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/upcoming-visual-updates)
- Patch 1.54f1 "First Frost" (Feb 2026): new main HUD design with more focus on demand bars, new icons (info views, road services, roundabouts, pollution, happiness). — [Paradox patch notes](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/patch-notes-first-frost); [Neowin](https://www.neowin.net/news/cities-skylines-ii-gets-first-update-under-new-developer-iceflake/)
- The old ("legacy") UI can still be switched back on in options. — [Neowin](https://www.neowin.net/news/cities-skylines-ii-gets-first-update-under-new-developer-iceflake/)
- Reported (search-summary only, NOT confirmed in the official dev diary I fetched): Iceflake said it would remove the translucent "glass" effect in favour of a more readable solid colour gradient, larger icons and calmer colours; transparency and more colour options to return as options later. — [PC Gamer](https://www.pcgamer.com/games/city-builder/cities-skylines-2s-new-developer-breaks-cover-on-its-plans-for-the-sequels-future-revealing-a-patch-that-will-include-changes-players-have-been-requesting-for-a-long-time/); [PCGamesN](https://www.pcgamesn.com/cities-skylines-2/update-new-developer-changes); [Vortex Gaming summary](https://vortexgaming.io/en/postdetail/656874). Treat as plausible but second-hand; release date reported as Feb 15 vs Feb 18 by different outlets.

**Transport Fever 2 (window-heavy, light panels)**
- Players complained about a full-screen white overlay during some build actions ("makes it much harder to see what is going on"), and windows that "cover the most of the screen unnecessarily", asking for compact OpenTTD-like panels. — [Steam discussion 1](https://steamcommunity.com/app/1066780/discussions/0/1737761716219384975); [Steam discussion 2](https://steamcommunity.com/app/1066780/discussions/0/1743386499253021119)
- One player preferred TF1's menus with "clearly defined sections separated by borders and different shades" over TF2's "heap of text… with icons scattered throughout". — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3963662301883409496) (individual user opinion)
- Review: UI "less cluttered than before" but hard to get an overview of lines/routes. — [TheSixthAxis review](https://www.thesixthaxis.com/2020/01/13/transport-fever-2-review/)

**Subway Builder (real-map transit sim, 2025–26)**
- Graphics "kept in a simple, almost ascetic style": city map, building/line visuals, windows and charts; players find the interface "often confusing". — [Gamepressure](https://www.gamepressure.com/games/subway-builder/z86ff6)
- Review praises the minimalist real-map look. — [Punished Backlog](https://punishedbacklog.com/subway-builder-review/)
- HN commenter: "UI seems not very well thought-out, lots of modality for no good reason." — [Hacker News](https://news.ycombinator.com/item?id=45530744) (single user opinion; early-access)

**Dorfromantik (Toukana)**
- Prototype devlog (Nov 2020) announced a "sleeker" UI with quests "integrated into the game world instead of appearing as to-do lists" and a more readable tile-stack panel. — [DevlogROMANTIK #2](https://toukana.itch.io/dorfromantik-prototype/devlog/198346/devlogromantik-2-biomes-boats-and-more-big-news-soon)
- Old buttons for highlighting element groups were removed. — [DevlogROMANTIK #3](https://toukana.itch.io/dorfromantik-prototype/devlog/199581/devlogromantik-3-how-things-have-evolved)
- Art described as "handpainted boardgame feel". — [Toukana presskit](https://www.toukana.com/dorfromantik/presskit)

**Islanders (Grizzly Games)**
- Reviewers mostly highlighted the minimalist design (low-poly, relaxing sound, simple mechanics); UI credited to Paul Schnepf. — [Wikipedia: Islanders](https://en.wikipedia.org/wiki/Islanders_(video_game))

**NIMBY Rails / Rail Route**
- Developer describes NIMBY Rails as a "mouse heavy UI" with much UI/UX still to implement (devblog). — [NIMBY Rails devblog 2021-05](https://carloscarrasco.com/page/51/); [devblog 2022-01](https://carloscarrasco.com/page/43/)
- No source found describing their panel colours (see Gaps).

### Inferences
- Among calm transit games, the documented ideal is "transit graphic design on the map" (Helvetica-like sans, flat bold colour, little chrome). That fits 레일맵's existing labelling language (navy + yellow dots + white bubbles) better than heavy windowed panels of any colour.
- The clearest 2026 signal (CS2) is: solid > translucent, calmer colours, rounder shapes, bigger icons. 레일맵 already bans translucency, so A, B and C are all compatible with that direction; the CS2 change doesn't decide light vs dark.
- The negative examples (TF2, Subway Builder) are criticised for *panel size, density, modality and full-screen overlays*, not for being light or dark. Whatever 레일맵 picks, keeping panels compact matters more than fill colour.

### Gaps
- No primary source gives exact HUD colours/radii for Mini Metro, Mini Motorways, Islanders, Townscaper, Dorfromantik, NIMBY Rails, Rail Route, Kingdoms and Castles, Before We Leave, or TF2. My recollection (unverified, needs screenshot check on gameuidatabase.com or Steam store screenshots): Mini Metro draws its clock/score/resource icons directly on the pale background with no boxes, and uses white overlay cards for the weekly upgrade choice; Islanders uses white rounded building cards at the bottom; Townscaper has almost no UI beyond a colour strip; Dorfromantik uses a light rounded card for the tile stack; NIMBY Rails uses dark-grey utility panels (immediate-mode-GUI look) over an OSM map; CS2 (pre-2026) used dark blue translucent panels; Kingdoms and Castles / Before We Leave use warm, light, "paper/wood" panels. Treat all of this as hypothesis only.
- No devlog found explaining *why* any of these chose light vs dark HUDs.
- Townscaper, Kingdoms and Castles, Before We Leave, Rail Route: no usable source found at all within the tool budget.

## Q2. How is "interactive control" made visually distinct from "information on the map"?

### Takeaway
Documented patterns: (1) move information *into the world* (Dorfromantik quests, Mini Metro's on-map lines/stations) and keep a separate, small set of controls; (2) transit/wayfinding systems use one restricted, consistent colour code where accent colour is spent only on the most important item; (3) accessibility guides say text/controls over a busy scene need a plain solid backing or strong outline. There is no single industry rule like "controls are dark, info is light"; the split is done by *consistency of form*, not a specific colour.

### Cited Findings
- Dorfromantik moved quests from to-do lists into the game world; the tile stack stayed as a separate panel. — [DevlogROMANTIK #2](https://toukana.itch.io/dorfromantik-prototype/devlog/198346/devlogromantik-2-biomes-boats-and-more-big-news-soon)
- Seoul 2013 subway sign guideline: unify colour, typeface, terms, pictograms, foreign-language notation; "여러 가지 색상을 사용하지 않고 최소한의 정보에만 강조색을 사용" (use an accent colour only for the minimum, most important information); station entrance pole signs unified as **dark grey background with white text** so stations are easy to find. — [서울신문 2013-05-04](https://m.go.seoul.co.kr/news/2013/05/04/20130504008006); also [서울시 교통 뉴스](https://news.seoul.go.kr/traffic/archives/10258)
- Same report summarises London (TfL) as unified to red, blue and white. — [서울신문 2013-05-04](https://m.go.seoul.co.kr/news/2013/05/04/20130504008006)
- Seoul Metro is getting its first full wayfinding/typography update in ~40 years, a unified Latin–Hangul typeface focused on legibility and a "welcoming, humanist tone." — [PRINT Magazine](https://www.printmag.com/type-tuesday/latin-hangul-visual-harmony-seoul-metro-type-system/)
- Research on Seoul signage found "loaded signage fatigue" from too many signs. — [SeoulTech study](https://pure.seoultech.ac.kr/en/publications/%EC%9C%A0%EB%8B%88%EB%B2%84%EC%84%A4-%EB%94%94%EC%9E%90%EC%9D%B8%EA%B0%9C%EB%85%90%EC%9D%84-%EA%B3%A0%EB%A0%A4%ED%95%9C-wayfinding-%EA%B0%9C%EC%84%A0-%EC%97%B0%EA%B5%AC/)
- Seoul wayfinding most actively uses the connecting line's colour for guidance markers. — [서울시 문화 뉴스 / koreascience search summary](https://koreascience.kr/article/JAKO200623421068122.do)
- Japanese stations mark exits with consistently yellow signage (yellow exit names / circled exit numbers). — [JRPass blog](https://www.jrpass.com/blog/how-to-read-japanese-train-station-signs-like-a-local) (travel-guide source, not an operator manual)
- TfL digital design language: Beck Blue #0019A8 ("Corporate/TfL Blue") used for reassurance/good service; Johnston black primarily for type; "use plenty of white. It's our default canvas"; Johnston100 in sentence case, never all caps. — [TfL blog: design language basics](https://blog.tfl.gov.uk/2022/03/02/design-language-basics/); [TfL blog: basics for displays](https://blog.tfl.gov.uk/2024/08/01/design-language-basics-for-displays) (via search summary; page now behind Cloudflare login, could not fetch directly)
- Underground station name signs: roundel with blue bar; historical direction signs black Johnston on white; enamel signs blue Johnston on white. — [Wikipedia: Signage systems](https://en.wikipedia.org/wiki/Signage_systems); [London Transport Museum item](https://www.ltmuseum.co.uk/collections/collections-online/signs/item/1998-93081)
- Game accessibility guidance: "place your text and UI elements on a plain high contrast background"; if not possible, use prominent outlines (and shadows) to separate from the background. — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/provide-high-contrast-between-text-ui-and-background/)
- Xbox XAG 102 examples: Forza Horizon 4 map markers have "solid yellow fill underneath a black outline and black text" for visibility on the map; For Honor icons sit on a solid background with a black-then-white double outline so they read on both light and dark scenes. — [Xbox Accessibility Guideline 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)

### Inferences
- Wayfinding systems separate "where you can go / act" from "context" mainly by **consistent fill + restricted accent**: one dark/strong fill for signs you act on (Seoul entrance poles: dark grey + white), one accent colour reserved for the most important thing (Japan: yellow = exit). That maps directly onto option B: navy fill = "this is a control", yellow = "the active/most important one", white bubbles = "information on the map".
- Option A (white + navy border, identical to map bubbles) gives *no* visual cue that a box is a control rather than a map label — it relies purely on position. That is the opposite of the "different form for different role" principle above.
- Option C (beige paper card) reads as "part of the map/paper", so it blends; it would need its control-ness carried by buttons inside it.
- Forza's "yellow fill + dark outline + dark text" map markers are close to 레일맵's yellow dot + navy accents and support using yellow as the "look here / active" signal.

### Gaps
- Could not obtain the actual Seoul Metro (서울교통공사) sign-design manual or a Tokyo Metro sign manual specifying exact colours; the common belief that Korean/Japanese exit signs are "yellow with black text" is supported only by a travel guide for Japan, and I found no source for Seoul's exit-sign colour. Do not cite "Seoul Metro uses navy + yellow" — no source supports that combination.
- No game devlog found that explicitly argues "controls should look different from map labels."

## Q3. Selected/active state conventions (fill invert, accent colour, underline, outline)

### Takeaway
Little game-specific documentation exists. The accessibility guidance requires visible, high-contrast state; wayfinding practice reserves one accent colour for the single most important item. For a flat, no-shadow style, the robust options are fill invert (navy↔white) or an accent fill (yellow), which carry contrast without shadows; thin outlines alone are weakest.

### Cited Findings
- Accent colour should be reserved for minimal, most important information (Seoul 2013 guideline). — [서울신문 2013-05-04](https://m.go.seoul.co.kr/news/2013/05/04/20130504008006)
- XAG 102: standard UI text/elements ≥ 4.5:1; large text/elements ≥ 3:1; inactive-element text ≥ 3:1; high-contrast mode ≥ 7:1; measure against the lowest-contrast part of a non-solid background; offer solid backgrounds behind text; "Add borders around text or elements"; avoid relying on colour alone. — [Xbox Accessibility Guideline 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- XAG 102 example of active/unlocked distinction: Gears Tactics slider thumb is bright white on dark blue; Minecraft slider tabs light grey with black outline on dark grey. — [Xbox Accessibility Guideline 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- Mini Metro relied on hover animations for buttons (problem on touch). — [Dinosaur Polo Club blog](https://dinopoloclub.com/2015/01/15/mobile-and-pricing/)
- WCAG non-text contrast (1.4.11): UI component boundaries and states need ≥ 3:1 against adjacent colours. — [W3C Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)

### Inferences
- Under B, "active = yellow fill (#F2C230) with navy text" gives 6.98:1 text contrast and a strong, colour-plus-shape change; it also re-uses 레일맵's existing "yellow dot = important" meaning. Should be paired with a non-colour cue (e.g. underline bar or icon change) to satisfy "don't rely on colour alone".
- Under A, active state would be fill invert (navy fill, white text) — clear, but then A's active buttons look like B anyway.
- Under C, a thin warm border change would likely fail the 3:1 state-contrast rule (see numbers below); C would need a navy or yellow fill for the active item.
- Hover-only cues are fragile (touch); 레일맵 runs in a browser and may be used on tablets.

### Gaps
- No source found documenting the specific active-state treatment in Mini Metro, Mini Motorways, Islanders, NIMBY Rails, Rail Route or CS2 (needs screenshot comparison).

## Q4. Evidence on readability of light vs dark HUDs over busy maps (+ palette contrast check, + A/B/C summary)

### Takeaway
No study or devlog directly compares light vs dark HUDs over maps. What the guidance actually says is: solid opaque backing, ≥ 4.5:1 text contrast, ≥ 3:1 for component edges and states, and keep panels compact. Measured on 레일맵's palette, all three options give excellent text contrast inside the panel, but the **panel-to-map edge** differs a lot: A and B separate clearly; C (beige on beige) is nearly invisible without a darker border.

### Cited Findings
- Contrast thresholds and "solid background behind text" recommendation. — [XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102); [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/provide-high-contrast-between-text-ui-and-background/)
- Non-text (component boundary) contrast ≥ 3:1. — [W3C SC 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- CS2's 2026 refresh reportedly dropped translucent glass for solid fills to improve readability (second-hand). — [PC Gamer](https://www.pcgamer.com/games/city-builder/cities-skylines-2s-new-developer-breaks-cover-on-its-plans-for-the-sequels-future-revealing-a-patch-that-will-include-changes-players-have-been-requesting-for-a-long-time/)
- TF2 players disliked a full-screen white overlay that hid the world while building. — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/1737761716219384975)

**Contrast ratios computed for 레일맵's palette (WCAG relative-luminance formula, my calculation):**

| Pair | Ratio | Meaning |
| --- | --- | --- |
| Navy #1F3A55 text on white #FFFFFF | 11.70:1 | A, B-info, bubbles: excellent |
| Navy text on land #EFE7D6 | 9.51:1 | text directly on map: excellent |
| Navy text on paper beige #F6F1E6 (example C fill) | 10.39:1 | C text: excellent |
| Yellow #F2C230 on navy #1F3A55 | 6.98:1 | B active item: passes 4.5:1 |
| White text on navy | 11.70:1 | B bar text: excellent |
| White panel vs land #EFE7D6 (edge) | 1.23:1 | white box needs its navy border to separate (A has it) |
| Paper beige #F6F1E6 panel vs land (edge) | 1.09:1 | C panel almost invisible on map |
| Warm border #CFC0A3 vs land | 1.46:1 | C thin warm border fails 3:1 edge rule |
| Navy bar vs land | 9.51:1 | B bar separates strongly |
| Navy vs operating track #3E4651 | 1.23:1 | navy bars and dark track lines are near-identical in lightness; where a track runs under/next to a navy bar, they could visually merge (bars at screen edges limit this) |
| Small place-name grey #9A8F7B on land | 2.59:1 | existing map label below 4.5:1 (FYI) |

### Inferences — pattern summary for A / B / C
- **A (white + thick navy border):** Resembles the wayfinding "white canvas + one strong brand colour" (TfL: white default canvas, blue accent) and Forza-style outlined markers. Very readable (11.7:1) and edge-separated by the navy border. Weakness: identical to map bubbles, so controls and map information share one look; no documented game in this set uses thick-outlined boxes as its main HUD (could not verify any). Thick borders on many boxes also add visual weight, contrary to Mini Metro's "less chrome" ideal.
- **B (navy bars + white text + yellow active; map info stays white):** Closest to documented wayfinding practice of "one dark consistent fill for action signs + one reserved accent" (Seoul entrance poles dark grey + white text; Japan yellow = exit; Seoul 2013 "accent only for the minimum"). Gives the strongest control-vs-information split and the strongest edge contrast. Risks: dark bars are the visually heaviest; navy is close in lightness to the dark track colour #3E4651; keep bars compact (TF2/Subway Builder criticism was about size/modality). CS2's long-running dark panel UI was not praised, but criticism was about confusion/translucency, not darkness.
- **C (beige paper cards, thin warm border):** Resembles cozy-builder "parchment/boardgame" panels (Dorfromantik "handpainted boardgame feel" — but no source confirms paper-style UI panels). Calmest and most "of the map", but measured edge contrast is 1.09–1.46:1, failing the 3:1 component-edge guideline; panels would visually dissolve into the beige map and its building blocks (#E9E0CC, #E2D6BF). Would need a darker border (e.g. navy) — which turns it into a variant of A.
- Overall evidence (thin) favours **B for controls + white bubbles for map info**, with A as a lower-change fallback; C is weakest on legibility for 레일맵's specific beige-on-beige palette.

### Imitation / IP risk notes
- Mini Motorways artwork is "All Rights Reserved" — [Fonts In Use](https://fontsinuse.com/uses/51247/mini-motorways-logo-and-interfaces). Do not copy icons, layouts or exact palettes from Mini Metro/Motorways.
- TfL roundel, Johnston typeface and Beck Blue are TfL brand assets; Seoul Metro's new typeface is a commissioned proprietary font ([PRINT](https://www.printmag.com/type-tuesday/latin-hangul-visual-harmony-seoul-metro-type-system/)). Borrow the *principles* (restricted palette, one accent, consistent form), not logos, typefaces or sign layouts. Navy + yellow as colours are generic and not a risk by themselves.
- No source found on trademark issues around "navy + yellow" transit styling.

### Gaps
- No user study, review or devlog directly comparing light vs dark HUDs on busy map backgrounds.
- Explainer-video graphics (RealLifeLore, Wendover Productions, Johnny Harris, Map Men): no source describing their label/box style was found. Only workflow tools are documented (Johnny Harris discusses his process in "How I Make My Maps"; GEOlayers/MapTiler plug-in widely used for such map animations) — [ProVideo Coalition roundup](https://www.provideocoalition.com/aep-roundup-june2021/amp/); [aescripts GEOlayers](https://aescripts.com/learn/tag/GEOlayers/). Any claim that these channels use "white boxes with dark outlines" or "paper texture" is unverified.
- Tokyo Metro official sign-colour specification not found (only a 1975 map note that Tokyo Metro's predecessor numbered stations — [transitmap.net](https://transitmap.net/tokyo-subway-1975)).
- Game UI Database screenshots could not be machine-read; a quick manual look at gameuidatabase.com for Mini Metro, Mini Motorways, Islanders, Dorfromantik, CS2 (post-1.54) and NIMBY Rails would confirm or refute the unverified recollections listed under Q1 Gaps.
