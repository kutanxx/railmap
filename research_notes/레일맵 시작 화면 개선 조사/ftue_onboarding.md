# FTUE and onboarding principles for the start screen and map selection (레일맵)

Context: today a new visitor sees a title, a "continue" row (if saves exist), three tabs (Korean cities / world cities / fictional map) and one card per map (thumbnail, name, one-line description, [sandbox] button). They must pick among 11 maps before playing.

Source quality legend: [DATA] = has measured data, [PRINCIPLE] = reasoned guideline from a reputable UX source, [OPINION] = practitioner or community opinion with no data.

## 1. Time-to-first-action / time-to-fun: what do benchmarks and studies say?

### Takeaway
Industry data agrees that most players are lost in the first session (median day-1 retention is only about 20-40%, depending on source and year). Practitioner guidance says to get players to real play as fast as possible and to treat title screen, loading and the first level as the first impression. No source I found measures the cost of a map-selection step specifically; the evidence is indirect.

### Cited Findings
- [DATA] GameAnalytics' 2018 benchmark report treated day-1 retention of 35% or more as performing well against the average — [GameAnalytics Mobile Benchmarks 2018 (PDF mirror)](https://tap-nation.io/assets/docs/Mobile_Benchmarks_Industry_Report_2018_GameAnalytics.pdf)
- [DATA, unverified host] A 2026 GameAnalytics benchmark document hosted by a third party reports median D1/D7/D30 of about 22% / 4% / 0.7%, and says the rule of thumb moved from 40/20/10 to 35/15/5. I could not open the page to confirm (404 on fetch), so treat these as unconfirmed — [Game Industry Library mirror of GameAnalytics 2026](https://gameindustrylibrary.com/documents/gameanalytics-mobile-retention-benchmarks-2026/read); other copies: [2025 GameAnalytics benchmarks PDF](https://investgame.net/wp-content/uploads/2025/02/2025-GameAnalytics-Mobile-Gaming-Benchmarks.pdf), [2026 mobile & PC benchmarks PDF](https://investgame.net/wp-content/uploads/2026/01/2026-01-27-2026-mobile-pc-benchmarks_compressed.pdf)
- [DATA, secondhand] "Less than 40% of players return to a free-to-play game after just one session" (Marc Robinson, GDC 2013, as cited by GameAnalytics) — [GameAnalytics: 16 reasons players leave your game](https://www.gameanalytics.com/blog/16-reasons-players-leaving-game)
- [PRINCIPLE] Players "don't want to wait before they can get a taste of what your title has to offer"; title screen, loading and first level form the first impression that "will stick with them". The article also says the game "should always offer some entertaining content early on" and cites short mobile sessions of 2-5 minutes — [GameAnalytics: 16 reasons](https://www.gameanalytics.com/blog/16-reasons-players-leaving-game)
- [PRINCIPLE] Roblox's official onboarding guide: players decide their interest "within minutes"; FTUE success is judged by day-1 retention and measured as a player funnel where every step loses players, so the goal is to limit drop-off between steps; A/B test individual onboarding steps; "get to the fun quickly"; end onboarding with a designed moment of joy; surface short/mid/long-term goals in visible places — [Roblox Creator Docs: Onboarding](https://create.roblox.com/docs/production/game-design/onboarding)
- [PRINCIPLE] Celia Hodent (ex-Epic, Fortnite UX) frames every game as a learning experience, so learning science applies to onboarding; friction at the start is tolerated by players who paid $60 but is "fatal" in free-to-play — [Elite Game Developers EGD 084: Celia Hodent](https://elitegamedevelopers.substack.com/p/egd-084-celia-hodent-game-ux); talk: "The Gamer's Brain, Part 2: UX of Onboarding and Player Engagement" (GDC 2016) — [Game Developer](https://gamedeveloper.com/design/video-inside-the-ux-of-onboarding-and-player-engagement). (The Game Developer page only summarizes topics; I could not read her specific rules from it.)
- [OPINION] Tutorial completion rate and drop-off per tutorial step are the metrics that locate the bottleneck — [PocketGamer.biz: First impressions count](https://www.pocketgamer.biz/first-impressions-count-creating-the-ultimate-first-time-user-experience)

### Inferences
- Every screen before the map appears is a funnel step that loses some players. For a free browser game (zero cost to leave, like free-to-play), Hodent's "friction is fatal" point applies strongly.
- 레일맵's funnel today: start screen → pick tab → pick map card → (map loads) → tutorial. The map-selection step is a decision step, not a fun step, so it should be as close to one click as possible for a new visitor.
- A cheap way to measure this without analytics servers: count (locally or in playtests) how long it takes a new person from opening the page to placing the first station.

### Gaps
- No source quantified drop-off at a level/map-selection screen specifically.
- Benchmarks are mobile-focused; I found no reliable FTUE benchmark for free browser games (itch.io/web).
- Day-1 numbers differ by year and source (35% "good" in 2018 vs. 22% median reported for 2026); the 2026 figure could not be verified.

## 2. Choice overload, Hick's law, recommended defaults, progressive disclosure of advanced modes

### Takeaway
"More options always hurts" is not supported in general; choice overload appears mainly when options are complex, the decision is hard, preferences are uncertain (novices) and people want to minimize effort. A first-time visitor picking among 11 unfamiliar maps fits those conditions well, so a recommended default and hiding advanced modes (sandbox) behind a second level are well-supported moves.

### Cited Findings
- [DATA] Iyengar & Lepper (2000) jam study: about 60% of shoppers stopped at a 24-jam display vs. about 40% at a 6-jam display, but about 3% vs. about 30% bought (roughly 10x conversion for the smaller set). Their lab studies (6 vs. 30 essay topics; 6 vs. 30 chocolates) showed more completion and higher satisfaction with the smaller set — [summary with replication context](https://www.atticusli.com/replication-crisis/choice-overload-jam-study/)
- [DATA] Scheibehenne, Greifeneder & Todd (2010) meta-analysis: 63 conditions from 50 experiments (N = 5,036); mean effect of larger choice sets essentially zero, but highly heterogeneous; prior preferences/expertise reduced overload — [paper PDF](https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.options.2010.pdf); [authors' reply 2011](https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.reply.2011.pdf)
- [DATA] Chernev, Böckenholt & Goodman (2015) meta-analysis, 99 observations (N = 7,202): once four moderators are accounted for (choice-set complexity, decision-task difficulty, preference uncertainty, decision goal of minimizing effort), the effect of assortment size on choice overload is significant — [Kellogg listing](https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual). A secondary summary says the effect was moderate (d ≈ 0.5-0.6) when moderators are high and disappears otherwise; I could not verify these effect sizes in the paper — [summary](https://www.atticusli.com/replication-crisis/choice-overload-jam-study/)
- [PRINCIPLE] Hick's (Hick-Hyman) law: the more choices, the longer the decision takes; NN/g says combining it with other techniques (grouping, ordering) keeps long menus usable — [NN/g video: Hick's Law](https://www.nngroup.com/videos/hicks-law-long-menus/). Caveat: Hick's law came from simple, equally likely stimuli; users scan structured lists non-linearly, so its direct applicability to UIs is debated — [IxDF: Hick-Hyman law](https://ixdf.org/literature/article/the-hick-hyman-law-an-argument-against-complexity-in-user-interface-design); [Laws of UX: Hick's Law](https://lawsofux.com/hicks-law/index.md)
- [PRINCIPLE] NN/g progressive disclosure: show only a few of the most important options first and move advanced or rarely used features to a secondary screen. Helps novices avoid mistakes; also helps experts by not making them scan rarely used features. Put everything users frequently need up front, keep the first display free of confusing features, make the path to secondary options obvious and labeled with clear expectations. "Designs that go beyond 2 disclosure levels typically have low usability" — [NN/g: Progressive Disclosure](https://nngroup.com/articles/progressive-disclosure/)
- [PRINCIPLE] NN/g: assume users will not change defaults and plan the design around that; people tend to stick to defaults (example: search users click the top result far more than relevance explains) — [NN/g video: The Danger of Defaults](https://www.nngroup.com/videos/the-danger-of-defaults/)
- [DATA/industry precedent] Mini Metro (the closest genre peer) starts the player on London only and unlocks further cities by score (e.g. about 100 passengers delivered in London unlocks Paris); endless mode does not count toward unlocks — [Droid Life review](https://www.droid-life.com/2016/10/24/mini-metro/); [Untapped Cities](https://www.untappedcities.com/build-your-own-subway-system-with-mini-metro-game/); [TV Tropes: Mini Metro](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/MiniMetro). (These are reviews and a fan wiki, not official docs; city counts vary by version.)

### Inferences
- 11 maps is not huge, but a first-time visitor has no preference yet (high "preference uncertainty") and does not know how maps differ (complex set), which is exactly when overload shows up per Chernev et al. Expect slower decisions and more "leave without choosing".
- Best-supported pattern: one clearly marked default for first play ("처음이라면 여기서" badge on one map, likely 서울 for Korean users, or the 솔내 fictional map if the tutorial is tuned to it), plus a big single "바로 시작" button that starts it. The other maps stay visible but secondary.
- Sandbox is an advanced/rarely-needed mode for a first visit: progressive disclosure suggests keeping it off the first display (e.g. a small toggle or second step), staying within 2 levels.
- Mini Metro shows genre players accept "one map first, more later". 레일맵 could copy the spirit softly (all maps open, but one recommended) rather than hard locking, since locking is a bigger design change. Hard locking would be a "next idea" only.
- The three tabs already group options (good for Hick's law), but a tab the visitor must choose before seeing anything is itself a decision; the default tab should be the one containing the recommended map.

### Gaps
- No game-specific study on how many level/map choices on a first screen is optimal.
- No measured data on "recommended" badges in game menus specifically (evidence is from defaults in general UX and behavioral economics).

## 3. First-time vs. returning visitors on the same screen; is a prominent "continue" helpful?

### Takeaway
Practice is consistent: show "continue" first and largest when a save exists, hide it when there is none, and make the default action adapt to the player's progress. This is supported by default/progressive-disclosure principles, but I found no controlled study measuring retention gains from a prominent continue button.

### Cited Findings
- [OPINION] "Make Continue the first option" in the main menu, because returning players press through to the top option; putting the main action behind even one extra menu layer is "annoying at first and maddening over time" — [TechSpot: The ten commandments of video game menus](https://www.techspot.com/news/62281-ten-commandments-video-game-menus.html)
- [OPINION] When a save exists, most returning players want to continue nearly every time; some argue the game could load the save directly, but new players still need the menu — [PC Gamer forums thread](https://forums.pcgamer.com/threads/no-more-press-any-key-prompts-at-game-start-please.2462)
- [OPINION] A Rogue Company redesign case study notes a play button defaulting to "play tutorial" is ideal for first boot but becomes wrong after the tutorial; the fix is a default that adapts to progress — [UX Collective: Redesigning Rogue Company](https://uxdesign.cc/redesigning-rogue-company-cfa15719f563)
- [OPINION] Always include a continue button on the menu page — [Xsolla: 5 words to remember when designing your game menu](https://blog.webflow.xsolla.com/blog/5-words-to-remember-when-designing-your-game-menu)
- [PRINCIPLE] Users stick to defaults, so the default should be what most users need — [NN/g: The Danger of Defaults](https://www.nngroup.com/videos/the-danger-of-defaults/); put frequently needed items up front — [NN/g: Progressive Disclosure](https://nngroup.com/articles/progressive-disclosure/)

### Inferences
- 레일맵 can show two states of the same screen: (a) no saves → the recommended map and "바로 시작" are the hero; (b) saves exist → "이어서 하기" with the most recent save (map thumbnail, date in game, money) is the hero, and map choice moves below.
- Remembering the last chosen tab/map in the browser (localStorage, wrapped safely) is a cheap version of an adaptive default.
- A returning player with exactly one save probably wants a one-click "이어서 하기"; auto-loading without asking is riskier (removes the chance to pick a different map) and only community opinion supports it.

### Gaps
- No quantitative evidence (A/B test or telemetry) that a prominent continue button improves retention; support is from principles and practitioner consensus.

## 4. Cards with thumbnails: information scent, card anatomy, one-line descriptions, difficulty

### Takeaway
NN/g supports cards for browsing heterogeneous items with a summary (thumbnail + title + short text), with consistent anatomy, the whole card clickable, and secondary actions (like sandbox) visually separated. Descriptions and thumbnails should be specific and representative, telling the player what the map is like to play, not decoration.

### Cited Findings
- [PRINCIPLE] Cards suit browsing heterogeneous content; they are worse than lists for comparison tasks because users look back and forth between cards (eye-tracking) and positions vary card to card — [NN/g: Cards Component](https://www.nngroup.com/articles/cards-component/)
- [PRINCIPLE] Card anatomy: a few short related pieces (image, title, summary); a card is a short linked summary, not the full details; items meant for comparison get consistent visual treatment; fixed width; make the whole card clickable; secondary actions may sit on a card but should be separated from the main area so the main link stays clear — [NN/g: Cards Component](https://www.nngroup.com/articles/cards-component/)
- [PRINCIPLE] Avoid too many cards on small screens; they force scrolling and rely on short-term memory — [European Commission component library: Card usage](https://ec.europa.eu/component-library/ec/components/card/usage); cards should be scannable and give no more detail than needed to decide — [ECB style guide: cards](https://www.ecb.europa.eu/styleguide/components/component/html/index.en.html?name=cards)
- [PRINCIPLE] Information scent: users pick the option whose cues best predict value. Labels should be "a succinct yet accurate description"; avoid jargon and branded terms; descriptions should "convey the gist" and add what the label lacks; images should be "descriptive and representative", not chosen for aesthetics alone; new users lack domain knowledge, so do not rely on brand familiarity; promise only what is delivered — [NN/g: Information Scent](https://www.nngroup.com/articles/information-scent/)
- [PRINCIPLE] Unfair, punishing first experiences push out inexperienced players — [GameAnalytics: 16 reasons](https://www.gameanalytics.com/blog/16-reasons-players-leaving-game) (relevant to labeling difficulty so novices do not pick the hardest map first)

### Inferences
- Consistent card anatomy for 레일맵: thumbnail (already game-colored SVG, good scent because it is the real map) → name → one line that says what is different to play (e.g. "강이 많아 다리 공사가 많다", "땅 높이와 터널이 있는 가상 지방", "돈이 넉넉하다"), not a tourism description → a small difficulty or "처음 추천" tag → sandbox as a small separate secondary action.
- Difficulty can be derived from existing data in regions.js (starting money, track cost multiplier, population multiplier), so tags stay honest ("promise only what is delivered").
- Because cards are weak for comparison, if players need to compare maps (money, difficulty), a consistent small line of the same 1-2 facts in the same position on every card helps.
- Terms like "샌드박스" may be jargon for some players; a plainer label ("돈 무제한") or a one-line hint gives better scent.

### Gaps
- No game-specific study on what one-line level/map descriptions should contain; guidance is transferred from web UX.
- No evidence found on difficulty labels' effect on retention specifically.

## 5. Forced vs. optional tutorials and letting players skip

### Takeaway
The strongest data (Andersen et al., CHI 2012, 45,000+ players) shows tutorials help only in complex games and add little in simple ones that players can learn by experimenting; practitioner guidance favors optional/skippable tutorials and not forcing experienced players through them. Popular statistics about "unskippable tutorials causing X% abandonment" could not be traced to primary sources.

### Cited Findings
- [DATA] Andersen et al., "The Impact of Tutorials on Games of Varying Complexity" (CHI 2012): eight tutorial designs tested in three games (Refraction, Hello Worlds, Foldit) with over 45,000 players. In the most complex game (Foldit) tutorials increased play time by up to 29%; in the two simpler games they did not significantly improve engagement. Authors suggest tutorial investment may not pay off for games whose mechanics can be discovered by experimentation — [project page](https://grail.cs.washington.edu/projects/game-abtesting/chi2012/); [paper PDF](https://grail.cs.washington.edu/wp-content/uploads/2015/08/andersen2012tio.pdf)
- [DATA] A related GDC 2012 talk by Andersen reported text tutorials were only effective in the most complex and least conventional game of the three — [GDC Vault: Optimization of Online Games through Telemetry and Large-Scale Experimentation](https://gdcvault.com/play/1015740/Optimization-of-Online-Games-through) (summary only; vault partly behind login)
- [PRINCIPLE] Do not "force the experienced player through a long, boring, patronizing first game session"; prefer optional tutorials (Dark Souls 2's optional area as example) — [GameAnalytics: 16 reasons](https://www.gameanalytics.com/blog/16-reasons-players-leaving-game)
- [PRINCIPLE] Teach navigation/controls and the core loop (what to do and why); test tutorial step variants by completion rate — [Roblox Creator Docs: Onboarding](https://create.roblox.com/docs/production/game-design/onboarding)
- [UNVERIFIED] A blog claims a 2021 University of Waterloo study found 68% of players abandon games with long unskippable tutorials within an hour, and an ESA 2022 study found +23% retention for just-in-time learning; no primary sources found, do not cite as fact — [Wayline blog](https://www.wayline.io/blog/just-in-time-learning-revolutionizing-game-design)

### Inferences
- 레일맵's mechanics (place station, draw track, make route) are partly discoverable, but the economy, routes and demand are less conventional, so a short guided first-steps tutorial (already present: station → track → route → train) is justified, while making it skippable and not re-showing it to returning players fits the evidence.
- For the start screen: do not add a separate "tutorial" choice the player must decide on; start the recommended map and let the existing in-game tutorial run, with a visible skip.

### Gaps
- No controlled study found that directly compares forced vs. skippable versions of the same tutorial.
- Hodent's specific onboarding rules (book/GDC talk) could not be read from accessible pages; only topic summaries were available.
