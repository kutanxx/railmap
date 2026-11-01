# Calm creative toys and sandbox builders: what makes building rewarding and shareable

Scope note: researched 2026-11-01 with web search and page reads (about 16 tool calls). Primary sources were preferred; where only a journalist's paraphrase was available, that is said. Railmap-specific applications are kept in "Inferences".

## (a) Intrinsic motivation in creative/sandbox play: why building itself is rewarding

### Takeaway
Toy designers tie the reward to the act of building, not to goals: one small input produces a rich, legible result the player feels they authored ("large shapes" are the player's, small details are the system's). Self-determination theory says play motivates when it feels autonomous, competent and related, and a goal-free sandbox has to supply competence through readable cause and effect rather than through scores.

### Cited Findings
- Will Wright on SimCity: a publisher "kept wanting a win/lose" and "a traditional game," but he wanted it "much more open-ended, more of a toy," so that publisher never released it. SimCity went on to sell more than 20 million copies. His "software toys" are games that cannot be won or lost and are played indefinitely. — [Game Developer, The Replay Interviews: Will Wright](https://www.gamedeveloper.com/business/the-replay-interviews-will-wright); [Wikipedia: Will Wright](https://en.wikipedia.org/wiki/Will_Wright_(game_designer))
- Oskar Stålberg says Townscaper (June 2020) is "more of a toy than a game." His design principle: "I want the user to feel like they're in control of the large shapes." Large forms stay predictable while small details vary, so players can learn the rules. He gives high priority to hidden "recipes" (for example, gardens appear in certain enclosed shapes) that players can discover and reproduce. His core approach focuses on "what happens when things change." — [Game Developer, How Townscaper Works (2022-04-06)](https://gamedeveloper.com/blogs/how-townscaper-works-a-story-four-games-in-the-making)
- Townscaper is "allowed to fail silently": when two cells can't fit together, it ignores the placement instead of showing an error. — [Game Developer (2022)](https://gamedeveloper.com/blogs/how-townscaper-works-a-story-four-games-in-the-making)
- Stålberg: "I'm quite surprised with how large things people would build." With no goal, players set their own scale. — [Game Developer (2022)](https://gamedeveloper.com/blogs/how-townscaper-works-a-story-four-games-in-the-making)
- Publisher Raw Fury describes Townscaper as having "no goals or story beyond what you make yourself." Bloomberg says it has no aim beyond the pleasure of watching a town grow. — [IHBC news summary](https://newsblogs.ihbc.org.uk/?p=27666); [Bloomberg (2020-07-24)](https://www.bloomberg.com/news/articles/2020-07-24/the-video-game-where-you-build-an-empty-town)
- Critics split on this: Cubed3 scored the Switch version 5/10 partly because results look alike however imaginative the input. Destructoid praised it as a town builder "with no combat and zero stakes." — [Cubed3 review](https://www.cubed3.com/games/reviews/nintendo-switch/townscaper); [Destructoid](https://vip-develop.destructoid.com/?p=258363)
- Tiny Glade (Pounce Light, two developers, Steam release 2024-09-24), as paraphrased by Automaton: the aims were "many results from little effort," "there is no wrong answer," a glade shown as "a living world," and a "handmade feel." Pieces snap together and adapt when they touch: two windows merge into one, and a path through a wall becomes a gate. The game sold about 616,000 copies in its first month, with about 1.4 million wishlists at launch. — [Automaton (2024-10-30)](https://automaton-media.com/articles/newsjp/tiny-glade-20241030-316261/)
- Reviewers credit Tiny Glade's "gridless building chemistry": widening a path through a wall turns the door into an archway, and undo and redo are animated. The game has no timers, quests or combat, and co-developer Anastasia Opara called it a "toy box for making dioramas" (secondary report). — [GamingOnLinux (2024)](https://gamingonlinux.com/2024/06/tiny-glade-is-a-gorgeous-castle-doodling-game-thats-real-clever-to-relax-with); [80.lv](https://80.lv/articles/relaxing-castle-builder-tiny-glade-has-finally-arrived-on-steam/)
- Mini Metro co-creator Peter Curry: in a game this minimal, the disciplines can't be separated, so "graphic design is game design." Robert Curry said the minimalism was one of the things that made the game hard to make (2016). — [Giant Bomb interview](https://giantbomb.com/users/3929/articles/interview-peter-curry-co-creator-of-mini-metro); [Indieorama (2016)](https://www.indieorama.com/mini-metro-and-robert-curry-the-minimalism-was-one-of-the-things-that-made-the-game-hard-to-make)
- Mini Metro started as a Ludum Dare 48-hour jam prototype on the theme "minimalism," and Jamie Churchman gave the GDC 2017 talk "When Less Is More" on its visual design. A sandbox Creative mode (create, move and add stations) was added in 2018. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game)); [Game Developer GDC 2017 preview](https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev)
- Self-determination theory (Ryan, Rigby & Przybylski, 2006, *Motivation and Emotion*, four studies): perceived autonomy, competence and relatedness each independently predicted enjoyment and future play. Autonomy and competence were linked to intuitive controls and presence. The work produced the PENS (Player Experience of Need Satisfaction) questionnaire. — [Ewha repository record](https://pure.ewha.ac.kr/en/publications/the-motivational-pull-of-video-games-a-self-determination-theory-/); [Rochester PDF](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf); [SDT.org PENS](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)

### Inferences
- In a goal-free sandbox, competence comes from understanding the system: "I drew this line and the network did that." For Railmap, every build action should show a visible, understandable consequence right away (passenger numbers on stations, trains appearing, the diagram reorganising).
- Stålberg's "recipes" suggest a Railmap version: hidden but reproducible small payoffs for particular shapes, such as a loop line, a cross-platform interchange, or three lines meeting at one station, each giving a special visual or sound flourish.
- "Fail silently" fits Railmap's sandbox: an invalid placement could snap or be ignored gently rather than raising a ✕ warning callout, at least in sandbox mode.
- Players control the large shape (the route), the system adds the details (platform bands, exits, station names). Railmap already does this; the research supports pushing more automatic detail onto each player stroke.

### Gaps
- No primary transcript found of Stålberg's talks on "toys" (Sweden Game Conference 2021 and others), or of Tiny Glade developer interviews in their own words; Tiny Glade material above is paraphrase or reviewer description.
- No direct developer statement found on Mini Metro Creative mode design goals.

## (b) Juice and feedback for each build action, and why calm games turn it down

### Takeaway
Research shows juice helps, but only in moderation: medium juice beats both none and extreme, and amplified feedback can hurt if it weakens the sense of agency. For calm games the strongest model is Mini Metro's generative audio, where each line is a musical voice, combined with gentle, low-arousal signals.

### Cited Findings
- Kao (2020), large-scale study: medium and high juiciness beat both extreme juiciness and none on player experience, intrinsic motivation, play time and performance. A game-feel survey sums this up as juice that has to fit the situation. — [Designing Game Feel: A Survey (arXiv 2011.09201)](https://arxiv.org/pdf/2011.09201)
- Kao, Ballou, Gerling, Breitsohl & Deterding (CHI 2024), pre-registered experiment with 1,699 participants: curiosity was the strongest predictor of enjoyment and the only predictor of playtime. Feedback that depended on success raised all motives, but "amplification" unexpectedly lowered them, possibly because it got in the way of agency. — [Imperial Spiral record](https://spiral.imperial.ac.uk/entities/publication/253c32f5-d124-4a23-88b5-9aaaf114608d); [Staffordshire eprint](https://eprints.staffs.ac.uk/8527)
- Hicks et al. (CHI PLAY 2024), "Juicy Audio," expert interviews: juicy-design principles apply to audio, and sound designers use them on purpose to improve feedback. — [summary via search; Staffs/arXiv listing](https://eprints.staffs.ac.uk/8527/1/3677084.pdf)
- Mini Metro audio (Disasterpeace / Rich Vreeland, 2016 interview): each subway line is tied to a note and a rhythm, and each station adds a pulse. Changing a line moves its rhythm to the next option in a list and swaps notes in the harmony. Passenger spawns are spread out rhythmically (the "Arpeggio" module) instead of clumping. Passenger types arrive on set beats of the in-game hour. When paused the music is at its most ambient. Hard caps (7 lines, 4 locomotives per line, a fixed number of sounds per short window) stop overload, and failsafes sit "at the outer edges of the system" so they are rarely noticed. The music "helps to actually counterbalance some of the stress." There are no looping tracks. — [Designing Sound (2016-02-18)](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace); [Disasterpeace blog](https://disasterpeace.com/blog/tag.analysis)
- Project Horseshoe 2017 "Coziness in Games": softness means gentle, low-arousal sensory signals and slower pacing. Anti-patterns include "sudden, bright, or loud stimuli" and notifications and pop-ups as "intrusive, non-consensual distractions." Mechanic pattern: "intrinsically satisfying actions" (shaking trees in Animal Crossing). — [Project Horseshoe 2017 report](https://www.projecthorseshoe.com/reports/featured/ph17r3.htm)
- Tiny Glade's animated undo and redo, and its sound design ("satisfying sounds"), are named by reviewers as part of why building feels good. — [GamingOnLinux (2024)](https://gamingonlinux.com/2024/06/tiny-glade-is-a-gorgeous-castle-doodling-game-thats-real-clever-to-relax-with)

### Inferences
- Railmap already makes sound with Web Audio and has generative music. The Mini Metro model suggests binding the music to the network: each line a voice with its own pitch and rhythm, each station a note, transfers as chords, line color mapped to timbre. Then building a network literally composes a piece, which would be a strong intrinsic reward and something people want to share.
- Gentle juice for a calm game: a short "draw-on" animation as a track is laid, a soft settle or bounce of a new station, a quiet rising tone on opening a line, and animated undo (pieces visibly un-building). Avoid screen shake and flashes (Horseshoe anti-patterns; Kao 2024's amplification result).
- Sound caps and rate limits (like Mini Metro's Arpeggio) matter for Railmap at 800 trains: arrival sounds should be quantised to a beat and capped per window.

### Gaps
- Primary sources for "Juice it or lose it" (Martin Jonasson and Petri Purho, 2012) and Vlambeer/Jan Willem Nijman's "The Art of Screenshake" (about 2013) were not retrieved in this session; both are well known but not cited here.
- No published research found specifically on juice in calm or cozy games, as opposed to action games.

## (c) How toys with no fail state keep players engaged

### Takeaway
Calm builders keep players by removing pressure (timers, threats, intrusive pop-ups) while keeping optional, self-chosen depth: a separate "creative mode" next to a gentle challenge mode, seasonal rituals and abundance. Cozy is defined as safety, abundance and softness, and extrinsic rewards actively erode it.

### Cited Findings
- Project Horseshoe 2017 (Tanya X. Short, Daniel Cook, Chelsea Howe and others) defines coziness as how strongly a game evokes "the fantasy of safety, abundance, and softness." Safety means no danger, risk or impending loss, and activities are voluntary. Abundance means basic needs are met, freeing attention for mastery and self-expression. Anti-patterns: extrinsic rewards that create short-term transactional needs, mandatory responsibility, FOMO timers, social comparison. Pattern: "many optional activities that are never required to progress," and watching for min-maxing creeping in, then "obscuring feedback" when it takes over. — [Project Horseshoe 2017](https://www.projecthorseshoe.com/reports/featured/ph17r3.htm)
- Boudreau, Consalvo & Phelps (HICSS 2025), "Whose Vibe is it Anyway?": the "cozy" label is variable, socially constructed and often personal, despite designers' intentions. — [ScholarSpace](https://scholarspace.manoa.hawaii.edu/items/a39f3507-2b9f-4971-a3d4-722638ebe0fc)
- A Games and Culture article argues cozy games are not the same as casual games, because they ask for a lot of time and knowledge from players. — [Oxford ORA](https://ora.ox.ac.uk/objects/uuid:dd66abc4-10c5-4043-8898-ea55cc392703/files/r3197xp996)
- Dorfromantik (Toukana): the team removed elements that pressure players, such as timers, and had a design pillar "Minimalism and Simplicity." Co-founder Luca Langenberg said calm does not rule out challenge, and finding the balance was key to it being more than a "cozy curiosity." A later Creative Mode removed all limits (no tile stack, quests or score), for players who prefer to build in peace. — [Digital Trends interview](https://qa2.www.digitaltrends.com/gaming/dorfromantik-interview); [PCGamesN](https://www.pcgamesn.com/dorfromantik/creative-mode); [Galaxus interview](https://www.galaxus.fr/en/page/dorfromantik-developer-success-has-opened-a-lot-of-doors-for-us-23775)
- Mini Metro (2018) and Dorfromantik both added sandbox or creative modes alongside their core challenge modes. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game)); [PCGamesN](https://www.pcgamesn.com/dorfromantik/creative-mode)
- Kao et al. (CHI 2024): curiosity, not competence, was the strongest predictor of playtime. — [Imperial Spiral](https://spiral.imperial.ac.uk/entities/publication/253c32f5-d124-4a23-88b5-9aaaf114608d)

### Inferences
- In a sandbox with no failure, engagement rests on curiosity: "what happens if I…" Railmap's real maps are a huge source of that (every city and neighbourhood is new), and real-network presets invite "what if Seoul had line 10 here" play.
- Horseshoe's "obscure feedback when min-maxing takes over" suggests that sandbox mode in Railmap could hide or soften money and efficiency numbers by default, showing network-shape facts (length, stations, transfers, diagram) instead.
- Railmap's monthly settlement callouts and red danger warnings fit the normal game but go against coziness in sandbox; a calm mode could suppress them.

### Gaps
- Found no quantitative retention data comparing creative modes with challenge modes in Mini Metro or Dorfromantik.

## (d) What drives players to share their creations

### Takeaway
Sharing is driven by self-expression, the beauty of the result, and recognition, and it is made far more likely by built-in, frictionless artifacts: Townscaper's town in a URL hash, photo modes, export. The academic evidence is qualitative and small-scale.

### Cited Findings
- Townscaper's free browser version (December 2021) stores the town in the string after the # in the URL, which can be pasted into the Steam version. The Steam version has "Save to Clipboard" and "Load from Clipboard" buttons. — [PC Gamer](https://www.pcgamer.com/au/the-most-pleasant-game-of-2021-is-now-playable-in-your-browser); [Steam community](https://steamcommunity.com/app/1291340/discussions/0/3471730015131058160)
- Townscaper players share creations online and 3D-print them through a Steam export feature (author's description). — [Game Developer (2022)](https://gamedeveloper.com/blogs/how-townscaper-works-a-story-four-games-in-the-making)
- Tiny Glade: the photo mode and attention to detail feed the "joy of sharing" players show on social media. — [Automaton (2024)](https://automaton-media.com/articles/newsjp/tiny-glade-20241030-316261/)
- Spies (Game Studies), an interview study of the Society of Virtual Photographers, names self-expression and motivation as themes. Wojciechowski & Shelton (Acta Ludologica 2022) note many reasons photo modes captivate players and their promotional use. — [Game Studies, Spies](https://gamestudies.org/2602/articles/spies_urban); [Acta Ludologica 2022](https://actaludologica.com/wp-content/uploads/2022/12/AL_2022-5-2_Study-2_Wojciechowski-Shelton.pdf)
- Virtual photographers cite keeping in-game moments to share with others, and being drawn in by how good a game looks. — [Den of Geek](https://www.denofgeek.com/?p=655317)
- Project Horseshoe: social systems should be an opt-in "social onion" of layers with low-cost positive tools; gifting that "feels personal and considered" (Triple Town); non-consensual social presence and social comparison are anti-patterns. — [Project Horseshoe 2017](https://www.projecthorseshoe.com/reports/featured/ph17r3.htm)

### Inferences
- Railmap already has the Townscaper pattern (`#share=` link) plus a diagram PNG. The research suggests making the artifact beautiful by default (the PNG is the "photo"), adding a calm map photo mode (hide the UI, as the H key does, plus framing and a title card), and treating a shared link as a "gift" (show "a network from a friend" with the sender's chosen title or message).
- With no server there is no workshop or leaderboard. Sharing therefore runs through outside channels (messengers, social media), so the artifact must carry its own context: city, line count, a title, the game's name and a link.
- Avoid comparison and likes (Horseshoe anti-pattern); emphasise personal sharing.

### Gaps
- Found no sources this session on Mario Maker or Minecraft sharing motivation, or on Cities: Skylines Workshop usage studies.
- No usage statistics found on photo-mode or share-button use rates.

## (e) Concrete design patterns to apply (gentle structure, prompts, creativity rewards)

### Takeaway
The patterns that fit a calm, serverless 2D builder: system-generated detail from simple strokes, discoverable "recipes," generative music driven by the network, animated undo, optional creative prompts and constraints instead of goals, and beautiful self-contained share artifacts.

### Cited Findings
- Control over large shapes plus system-made detail; discoverable, reproducible recipes; silent failure. — [Game Developer, Townscaper (2022)](https://gamedeveloper.com/blogs/how-townscaper-works-a-story-four-games-in-the-making)
- "Many results from little effort," "no wrong answer," contextual adapting pieces (a path through a wall becomes a gate). — [Automaton, Tiny Glade (2024)](https://automaton-media.com/articles/newsjp/tiny-glade-20241030-316261/)
- A generative score tied to network data, with caps and beat quantisation. — [Designing Sound (2016)](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- Optional activities never required to progress; seasonal cycles and ritual; avoid extrinsic transactional rewards and intrusive pop-ups. — [Project Horseshoe 2017](https://www.projecthorseshoe.com/reports/featured/ph17r3.htm)
- A creative mode with no limits offered alongside a gentle challenge mode. — [PCGamesN, Dorfromantik](https://www.pcgamesn.com/dorfromantik/creative-mode)
- Moderate juice, and feedback tied to the player's own success, over amplification. — [arXiv game feel survey](https://arxiv.org/pdf/2011.09201); [Kao et al. CHI 2024](https://spiral.imperial.ac.uk/entities/publication/253c32f5-d124-4a23-88b5-9aaaf114608d)

### Inferences (candidate ideas for Railmap, ordered roughly by fit)
1. Network-as-music: each line a voice (pitch from its order, rhythm from its train count or headway), stations as notes, transfer stations as chords, express lines a lower register. Quantise train-arrival sounds to the beat and cap them per window. (Mini Metro model.)
2. Discoverable "recipes" (hidden flourishes, not goals): a loop line closing, three or more lines at one station, a line crossing a river, reaching the edge of the map. Each triggers a soft one-time visual or sound and a note in a "discoveries" list. These reward creativity and shape, not efficiency.
3. Creative prompts or postcards: optional cards such as "only 3 lines," "connect every high-speed rail station," "one ring line," "rebuild your hometown line," "a network that spells a letter." No penalty, only a stamp. A daily prompt can be picked by date with no server (seed = date).
4. Animated undo and redo, with track un-drawing and stations shrinking back. Keep gentle settle animations and a soft placement tone; avoid shake and flash.
5. A calm sandbox presentation: hide the money, debt and monthly callouts by default and show network-shape stats (km of track, stations, transfers, longest line).
6. Share artifacts as gifts: the diagram PNG and link carry a player-given title and the city; a "postcard" export frames a map view with a title band; an opening card for a received link shows its title and stats.
7. A timelapse or replay of building (the order in which tracks were laid) as a shareable GIF or canvas animation. This is a candidate only, not found in the sources.

### Gaps
- No sources found this session on "inspiration cards" or prompt systems in specific shipped sandbox builders, on achievements that reward creativity, or on "challenge seeds" in calm builders. Items 3 and 7 are design extrapolations, not documented patterns.
