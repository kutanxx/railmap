# Web-game first screens: getting a link visitor playing within seconds

Research date: 2026-10-28. Scope: first screen, loading, quick start, returning players, mobile handling. Sources checked: Poki developer docs + Poki blog (2026), CrazyGames developer docs, itch.io HTML5 docs, Poki talk/paper by Kasper Mol, web.dev Slow Roads case study, Google 2016 mobile speed study, press on Wordle storage. About 16 tool calls; several sub-questions (Neal.fun, Townscaper web, Little Alchemy, Krunker, MetroDreamin first screen) could not be verified in the budget and are listed under Gaps.

## 1. What do web-game portals require or recommend for the first screen and loading?

### Takeaway
The big portals converge on: put new players into play immediately (CrazyGames allows at most 1 click), skip splash/title/level-select screens for first-timers, keep the initial download small (CrazyGames hard cap 50 MB, 20 MB for mobile homepage; Poki says under 5 MB is "amazing", under 10 MB "good"), load the rest in the background, and if there is a loading screen, show a progress bar plus game art so the game does not look frozen. Loading over ~10 s loses players.

### Cited Findings
- CrazyGames (gameplay requirements): "Games should land new users in gameplay immediately." If that isn't feasible, "a maximum of 1 click is allowed." — [CrazyGames gameplay requirements](https://docs.crazygames.com/requirements/gameplay/)
- CrazyGames: "The game must load quickly and play seamlessly without errors or crashes"; English localization required; fall back to English if the SDK locale is unset; text must be legible at devicePixelRatio 1 and at sizes such as 800x450 (mobile) and 1080x607 (tablet). — [CrazyGames gameplay requirements](https://docs.crazygames.com/requirements/gameplay/)
- CrazyGames technical limits: total size max 250 MB and 1500 files; "initial download size ≤ 50MB"; ≤ 20 MB to be eligible for the mobile homepage. With the SDK, initial download is measured from loading start until the first "gameplay start" event, which should fire "when the user enters in a playable state" (so main menus count toward it). For externally hosted/loaded files QA checks "time it takes to reach gameplay (≤ 20 seconds)". — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical/)
- CrazyGames technical: "Game should be playable in landscape mode on desktop"; supported orientations are declared at submission and the site itself asks users to rotate, so the game need not implement its own orientation lock; mobile games should disable text selection on `body` via CSS; must support mouse, keyboard and touch if mobile is supported. — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical/)
- CrazyGames quality guidelines (not mandatory, "strongly recommended"): reach gameplay quickly, teach inside gameplay with a simple onboarding phase, focus on core functionality rather than explaining every feature. — [CrazyGames quality guidelines](https://docs.crazygames.com/requirements/quality/) (via search snippet; page not fetched in full)
- Poki quality requirements: players tend to leave "if loading takes more than 10 seconds"; minimise UI screens and menus, ideally put players directly into gameplay; remove splash screens (studio logo on the loading screen is fine); cutscenes/intros must be skippable; `gameplayStart()` must fire on the player's first input, not on load. — [Poki requirements & quality](https://developers.poki.com/guide/requirements-quality)
- Poki "easy access" guide: progressive loading — download only the essentials first (menu, tutorial, first stage) and fetch the rest in the background — is "one of the most important techniques for success on the web"; "Drop-off during loading is brutally underestimated"; show a loading bar and a visually engaging screen (logo/game art) to prevent drop-off from players who "mistake the game for frozen"; for first-time players skip splash screens, title screens and level selects; teach with visuals/animation rather than walls of text; introduce buttons gradually. — [Poki easy access guide](https://developers.poki.com/guide/easy-access)
- Poki (Kasper Mol, JS GameDev Summit, 8 Apr 2022): size targets "if you can manage to get under five [MB], you're doing an amazing job", under 10 MB "a good job"; "You don't need 3 loading screens"; make splash skippable; make the play button easy to find; drop first-time users straight into gameplay or a tutorial; use the wait to show key art, controls and download size; stream music instead of blocking load; test on throttled connections. — [GitNation: Conversion to Play, the Art of Loading](https://gitnation.com/contents/conversion-to-play-the-art-of-loading)
- Poki blog (16 May 2026): players haven't downloaded or paid anything, so the first few seconds of gameplay largely decide whether they stay; in Drive Mad the game "immediately starts up" with action in the centre of the screen; UI should be big, readable and work with keyboard, mouse or touch; forced ads make players leave. — [Poki blog: How to Build a Great Browser Game](https://poki.com/blog/what-makes-high-quality-browser-game)
- itch.io HTML5: "By default your project will require a click to start" (Click to Play); disabling it auto-starts on page load but audio may be muted by browsers; Click to Play keeps the game from slowing the page on first load; limits: ≤ 1,000 files, ≤ 500 MB extracted, ≤ 200 MB per file. — [itch.io HTML5 docs](https://itch.io/docs/creators/html5)

### Inferences
- A single "play" click is the accepted maximum on portals; a click is also practically needed for Web Audio (browsers block autoplay sound), which matches itch.io's default Click-to-Play. For 레일맵 (which generates sound with Web Audio), one big start click doubles as the audio-unlock gesture.
- The portal definition of "initial download" ends at the first playable state, i.e. a start screen that must load before play counts against the budget. A map game should load the start screen shell first and stream map tiles after.

### Gaps
- Newgrounds-specific first-screen guidance was not researched (budget).
- No portal doc found that specifically addresses map/tile-streaming (MapLibre-style) games.

## 2. How do link-shared browser games handle the first screen and returning players?

### Takeaway
Successful link-shared games make the first screen either the game itself or a single-click gate, require no account, and recognise returning players through browser-local storage (Wordle's stats/streaks lived only in localStorage). Slow Roads uses one splash click that also defers heavy work. Account-gated games (current GeoGuessr) are the counter-example.

### Cited Findings
- Slow Roads (web.dev case study by the developer Anslo, page updated 2023-04-11): a splash screen greets new visitors and delays scene setup until the user clicks a button — this also filters out visitors who leave quickly; initial environment generation takes "just 3.2 seconds on average"; over 60% of users load within the first three seconds and over 97% under 10 seconds; geometry is generated on the client instead of downloaded; converting images to WebP "halved the Slow Roads bundle size". — [web.dev: Slow Roads case study](https://web.dev/case-studies/slow-roads)
- Slow Roads requires no login or installation to play. — [Prima Games](https://primagames.com/news/slow-roads-chill-driving-game-browser); [Jalopnik](https://www.jalopnik.com/slow-roads-best-browser-driving-game-1850304751/)
- Wordle: launched (Oct 2021) as a small static site whose stats/streaks were stored only in the browser's localStorage, no accounts; clearing site data resets stats for non-account players. — [Seth Larson: Move or recover your Wordle statistics](https://sethmlarson.dev/wordle-stats)
- When Wordle moved to the NYT domain in 2022, some players lost streaks/stats because localStorage is per-domain (illustrates the fragility of local-only saves when the URL changes). — [Tom's Guide](https://www.tomsguide.com/uk/news/wordle-disaster-some-players-lose-their-streaks-in-transfer-to-nyt); [PC Gamer](https://www.pcgamer.com/uk/wordle-streak-glitch-fixed-after-move-to-new-york-times-website); [Pocket-lint](https://www.pocket-lint.com/apps/news/160008-the-new-york-times-now-runs-wordle-it-lives-at-a-new-url-with-wrongs-stats)
- Wordle: one puzzle per day, same for all users — a fixed, shareable "today" entry point. — [Fox 9](https://www.fox9.com/news/wordle-moves-to-new-york-times-website-after-sale-some-users-streaks-interrupted)
- GeoGuessr: free play is limited and largely tied to an account; competing guessers (WorldGuessr, OpenGuessr) market guest/no-account quick play as an advantage (claims from secondary and competitor sources; sources disagree on OpenGuessr). — [Wikipedia: GeoGuessr](https://en.wikipedia.org/wiki/GeoGuessr); [WorldGuessr comparison (competitor)](https://www.worldguessr.com/compare-to-geoguessr); [Geometas: GeoGuessr vs OpenGuessr](https://geometas.com/learn/geoguessr_vs_openguessr)
- Metro Map Maker (a related transit-map web tool) states it "should always be easy to use without a login". MetroDreamin' can apparently be browsed without registering (anecdotal Reddit comment, Aug 2024). — [Metro Map Maker help](https://metromapmaker.com/help/); [Reddit r/TransitDiagrams thread](https://lr.sudovanilla.org/r/TransitDiagrams/comments/1ejgczc/thoughts_on_metro_dreamin)
- Poki: implement progress saving where appropriate, or tell players when progress won't be saved. — [Poki requirements & quality](https://developers.poki.com/guide/requirements-quality)
- Poki blog 2026: be welcoming to first-timers while offering depth for returning players (Retro Bowl example). — [Poki blog](https://poki.com/blog/what-makes-high-quality-browser-game)

### Inferences
- Pattern for 레일맵: first-time visitor → one obvious "바로 시작" button that starts a sensible default map (e.g. 서울) without making them choose among 11 maps first; returning visitor (localStorage save exists) → "이어서 하기" as the primary button. 레일맵 already has per-map saves and a "이어서 하기" section; the gap is likely the default/quick start for newcomers.
- Because 레일맵's demo lives at kutanxx.github.io/railmap, saves are bound to that origin; moving to a new domain would wipe players' saves just like Wordle's move — worth knowing before any domain change (export/import already exists as a fallback).

### Gaps
- Could not verify current first screens of Neal.fun games, Townscaper web/demo, Little Alchemy 2, Krunker, Mini Metro (no official web demo found), or MetroDreamin' (JS-rendered pages; not fetched within budget). No click-count data for those.

## 3. How do they treat phone visitors when the game is desktop-oriented?

### Takeaway
Platforms lean toward "warn but still allow": itch.io shows a warning that the game may not work (but lets people start it) when the Mobile Friendly flag is off, and forces fullscreen launch on mobile; CrazyGames handles rotation prompts at the site level. Hard blocks exist among indie devs but no research shows they are better.

### Cited Findings
- itch.io: if the Mobile Friendly flag is off, "a warning will be displayed to the viewer that the game may not work", but they can still start it; on mobile the page "will use Click to launch in fullscreen mode regardless of how you've configured your embed". — [itch.io HTML5 docs](https://itch.io/docs/creators/html5)
- CrazyGames: the site enforces declared orientations by asking users to rotate; games in the CrazyGames app open fullscreen and must respect device safe areas. — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical/)
- Poki: a large share of gameplays are on mobile; consider mobile from day one; portrait-playable games see more players enter gameplay on average; on mobile cover the full screen. — [Poki easy access guide](https://developers.poki.com/guide/easy-access); [Poki requirements & quality](https://developers.poki.com/guide/requirements-quality)
- Slow Roads targets everything from "top-end desktops" to "decade-old mobile devices"; instead of blocking, it highlights the settings menu when FPS stays low and warns users to enable hardware acceleration when performance is poor; only 52% of players exceed 55 FPS. — [web.dev: Slow Roads](https://web.dev/case-studies/slow-roads)
- Indie practice is mixed (anecdotal itch.io threads): some warn-and-allow, some hard-block ("too heavy to run on a mobile web browser"), one desktop MMORPG used an in-fiction lore warning instead of a plain "switch to desktop" message. No usability studies found. — [itch.io post](https://itch.io/post/10456893); [itch.io post](https://itch.io/post/7823972); [Contra: desktop-first MMORPG UX](https://contra.com/community/mmzI9wnN-innovative-solutions-for-desktop-first-mmorpg-ux)

### Inferences
- For links opened inside KakaoTalk/Discord on phones, a short, honest note ("컴퓨터에서 가장 잘 돌아가요") plus a still-working start button fits the itch.io pattern better than a block. Offering a "copy link to open on PC" action is a reasonable extension (not sourced).

### Gaps
- No data on bounce with vs. without a mobile warning. KakaoTalk in-app browser specifics (WebGL support, fullscreen) not researched.

## 4. Loading indicators and perceived performance for heavy/WebGL games

### Takeaway
Show something real immediately (art, logo, controls, menu), show visible progress so the game does not look frozen, load only what is needed for the first playable moment, and defer the rest; deferring heavy setup until after the first click (Slow Roads) both speeds up first paint and avoids wasting work on bouncers.

### Cited Findings
- Poki: show a loading bar and engaging art; players otherwise "mistake the game for frozen"; load menu/tutorial/first stage first, the rest in background. — [Poki easy access guide](https://developers.poki.com/guide/easy-access)
- Poki talk: use the loading time to show key art, screenshots, controls and download size; stream music instead of blocking; some engines force their own loading bars — check how much control you have. — [GitNation talk](https://gitnation.com/contents/conversion-to-play-the-art-of-loading)
- Kasper Mol (Poki) W3C workshop paper "Size Matters": recommends post-loading (load assets right before needed) and testing with Chrome "Slow 3G" throttling. — [W3C Games Workshop paper](https://www.w3.org/2018/12/games-workshop/papers/size-matters.html)
- Slow Roads defers scene setup until after the splash click; client-side generation instead of downloads; WebP halved bundle size. — [web.dev: Slow Roads](https://web.dev/case-studies/slow-roads)
- Poki: optional `loadingStart/Stop`-style events (CrazyGames: "Load start/stop" SDK events) exist to measure in-game load times and failure rates — i.e. portals treat load measurement as standard. — [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical/)

### Inferences
- For 레일맵 (MapLibre + OpenFreeMap tiles): the start screen and SVG thumbnails are light and can appear instantly; the heavy part (map style, tiles, worker) can start loading in the background while the visitor reads the start screen, and the game screen can show the map progressively rather than waiting for "all loaded". A spinner/progress line on the map while tiles arrive addresses the "looks frozen" problem.

### Gaps
- No web.dev article on skeleton screens specifically was fetched; no map-game-specific perceived-performance study found.

## 5. Data on bounce/drop-off at the first screen

### Takeaway
Loading is where many web players are lost: Poki's data shows a 10 MB game keeps only ~80% of US players through loading (under 60% in slow-connection countries), and a 40 MB, 29.5 s load kept only 50%; cutting to 6 MB / 3.7 s raised it to 72%. Generic web data: 53% of mobile visits are abandoned beyond 3 s (2016).

### Cited Findings
- Poki "conversion to play" = share of players who finish loading among those who started loading; excludes onboarding/pre-loader drop-off. — [W3C paper "Size Matters" (Kasper Mol, Poki)](https://www.w3.org/2018/12/games-workshop/papers/size-matters.html)
- Same paper (174 Poki games, desktop only, ~2018): at 10 MB initial download, conversion ≈ 0.8 in the US, ≈ 0.7 in Brazil, below 0.6 in Egypt ("you will lose almost half your players" from loading alone); below ~10 MB "every MB really counts". — [W3C paper](https://www.w3.org/2018/12/games-workshop/papers/size-matters.html)
- Stickman Hook: 40 MB WebGL port, median load 29.5 s, 50% conversion to play; Madbox's HTML5 rebuild 6 MB, median load 3.7 s, conversion 72% (+22% plays). — [Poki blog, 16 May 2026](https://poki.com/blog/what-makes-high-quality-browser-game)
- Poki talk (2022) gives different numbers for Stickman Hook: 35% in Unity → 81% after native Pixi.js rebuild; also says some games saw "only 20% of interested people would end up playing". (Conflicts with the blog's 50% → 72%; may be different time periods/measurements; transcript quality uncertain.) — [GitNation talk](https://gitnation.com/contents/conversion-to-play-the-art-of-loading); contrasted with [Poki blog](https://poki.com/blog/what-makes-high-quality-browser-game)
- Poki's testing benchmarks reportedly include 65%+ conversion to play and 5+ minutes average playtime (secondhand via Defold/GameDev.net summary). — [Defold: Poki SDK best practices](https://defold.com/extension-poki-sdk/best-practices); [GameDev.net](https://gamedev.net/news/3701-best-practices-when-building-for-the-web/)
- Google "The Need for Mobile Speed" (2016, 10,000+ mobile domains): 53% of mobile site visits are abandoned if pages take longer than 3 seconds; average mobile load 19 s on 3G; sites loading in 5 s vs 19 s had 35% lower bounce and 70% longer sessions. — [Marketing Dive](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/); [MediaPost](https://www.mediapost.com/publications/article/284398/many-visitors-abandon-mobile-sites-if-load-time-to.html)
- Slow Roads: >60% load within 3 s, >97% within 10 s (shows the target distribution a polished link-shared WebGL game achieves). — [web.dev: Slow Roads](https://web.dev/case-studies/slow-roads)

### Inferences
- A reasonable target for 레일맵: start screen visible in ~1–3 s on a phone connection, first playable map in under ~10 s (Poki's leave threshold), with each extra screen/click before play treated as a measurable loss.
- 레일맵 could measure its own "conversion to play" cheaply only with analytics, which it does not have; without that, Chrome DevTools "Slow 3G"/"Fast 4G" throttling tests are the practical substitute (Poki's advice).

### Gaps
- A widely circulated "1 s → 10%, 10 s → 80% drop-off" table was found only on an unsourced page and was excluded.
- No public CrazyGames drop-off curve found. Google 53% figure is from 2016 and is generic web, not games.
