# How transit, railway and city-building games design build and feedback sounds

Researched 2026-10-27. Source-quality legend used below:
- **[DOC]** = developer's own documentation, talk transcript, postmortem, official changelog/wiki, or developer interview.
- **[PLAYER]** = Steam forum / review descriptions (what players say they hear).
- **[INFERRED]** = my inference; not confirmed by a source. No gameplay videos were watched.

Coverage was uneven: Mini Metro, Mini Motorways, Cities: Skylines 1/2, OpenTTD and Subway Builder have usable primary sources. NIMBY Rails, Transport Fever 2, Train Valley 1/2, Rail Route and Railway Empire have almost nothing documented about their sound effects (see Gaps).

## Q1. For each game, which events have sounds, and what do they sound like?

### Takeaway
Two broad families exist: (a) **abstract/musical** builders (Mini Metro, Mini Motorways, and more recently Subway Builder's UI) where every game object plays pitched notes or percussion tied to one musical clock, and (b) **realistic/diegetic** builders (OpenTTD, Cities: Skylines 1/2, Transport Fever 2) where vehicles, buildings and ambience play recorded real-world sounds and only a few "feedback" events (money, year-end result, upgrade) get short stylized cues such as a cash till or a bell "ding". Some games are almost silent (NIMBY Rails shipped with no sound at all, at least through 2021).

### Cited Findings

**Mini Metro (Dinosaur Polo Club; audio by Rich Vreeland / Disasterpeace)**
- [DOC] "Pretty much everything you hear in the game consists of samples that are triggered in real-time as a result of player actions." Built in Unity; the team tried FMOD, dropped it and used the G-Audio plugin to play sounds at rhythmic intervals. Synth tones made in Serum, UI sounds from sine tones processed in S-Layer (Reaktor), passenger sounds from mouth sounds and old drum-machine samples processed in Battery. (Interview, Designing Sound, 2016-02-18) — [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Lines: "Each line is represented and formally differentiated by a sequence of pulses of the same pitch." Stations: "Each station on a line creates a pulse in that line's pitch"; the station's shape sets the timbre. These per-line sequences are called Line Loops. (Postmortem, 2017-03-18) — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Station spawn / station shape change and passenger spawn: stations and passengers of the same shape "share a percussive signature which can be heard when passengers spawn and stations spawn or mutate." Passenger percussion plays when they appear and can vary in pitch. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Trains: each engine has a rhythmic sound that is "tonal when the train is occupied by passengers, and just noise when the train is empty," pitched to its line; train-stop exhaust has pitch variation. Osaka's Shinkansen has its own engine sound. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Passengers board and leave in a "pre-determined rhythm"; the audio system controls embark/disembark speed. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Changing a line's routing moves its rhythm to the next option in a list and swaps the oldest harmonic note for the next one. — [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Weekly/end-of-game markers: chords play at the end of each in-game week and at game end. Optional per-city kick drum that progresses week to week. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] UI/SFX are mostly "controlled random variations on sine wave samples"; hundreds of random variations were rendered as a pool. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] New elements "are announced" when introduced and then recur as part of the ambient texture; "a smaller metro sounds smaller." (GDC 2018 AI Summit talk transcript "Serialism & Sonification in Mini Metro", posted 2018-04-01) — [Disasterpeace talk](https://disasterpeace.com/blog/mini-metro.serialism-talk)
- [DOC] A search-result summary of the talk/postmortem says a crowded station's emitted sound differs from the sound of a new station being created, and that line sound is driven by number of stations, order, station types, occupancy and on-screen position. I could not see the full text confirming occupancy/screen position. — [Disasterpeace tag page](https://disasterpeace.com/blog/tag.analysis) (search snippet only)
- Overall philosophy [DOC]: "how we avoided using looping music tracks completely, by using sequential sets of data to generate music and sound" — there is no separate background music track; the music *is* the sum of game-object sounds. Style influences: Steve Reich, Philip Glass, the Wii menu music. — [Disasterpeace talk](https://disasterpeace.com/blog/mini-metro.serialism-talk); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)

**Mini Motorways (Dinosaur Polo Club, 2019; audio by Disasterpeace)**
- [DOC] Peter Curry's goal: "Ideally, you could hear whether your city was working or struggling and about to break." Audio is "another vector of information." (Game Developer, 2022-02-28) — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] Many sounds are reused from Mini Metro. Car horns are "designed to only be slightly out of tune" and governed by conditions (each driver has a "generosity score" for tailgating and red-light waiting), so horns signal "growing discord in their city." — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] Player interaction sounds must feel "tactile and immediate," often pitched to match the current musical state. Music is driven by a scheduling system and attached to colored groups of vehicles and buildings, not individual cars; per-city triggers can be road connections, night, weekends or progression. — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] A 2025 talk ("Weird Sibling as Sequel") describes taking Mini Metro's "hyper clean procedural audio" and "circuit-bending" it for a "messier" sequel; topics include procedural harmony and rhythm, pulse masking, metric modulation, polymeter. (talk listing 2025-05-27) — [Disasterpeace](https://disasterpeace.com/blog/mini-motorways.talk); [VCFA](https://vcfa.edu/events/2025-05-27)
- [PLAYER/REVIEW] Reviewers describe "simplistic and minimalistic pops, drones, and atmospheric ambiance" and "tactical and bubbly" sounds over a meditative soundscape. — search summary of [OpenCritic reviews](https://opencritic.com/game/11703/-zge-g-zel/reviews?page=2) and [Redbrick](https://www.redbrick.me/?p=467568) (snippet-level; individual reviews not opened)

**Subway Builder (Redistricter; web-map-based subway builder, very close to Railmap's genre)**
- [DOC] Official changelog entries (verified verbatim by two fetches):
  - v0.5.0 (2024-10-12): "New music"
  - v1.0.0 (2026-02-10): "Better UI/UX sounds. Adjust or mute in Settings."
  - v1.4.17 (2026-07-20): "Tutorial and achievement sounds are in key with the music now."
  - v1.5.0 (2026-07-28): "The tutorial's step chime is tuned to a pentatonic scale so it's easier on the ears."
  - v1.6.0 (2026-08-06): "Fixed crowd noises lasting too long after zooming into a station."
  - v1.7.0 (2026-08-30): "Fixed minor bugs with grade crossing noises repeating continuously."
  — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- [INFERRED] From these entries the game has: background music, UI sounds, tutorial step chimes, achievement sounds, zoom-dependent crowd ambience at stations, and grade-crossing bells. No entry mentions sounds for station placement, track completion, train arrival or money. v1.7.2 (2026-09-29) added "Better route capacity warning UI" but no sound is mentioned for it.

**OpenTTD (open-source remake of Transport Tycoon Deluxe)**
- [DOC] Official sound ID table (verified for v1.10.0) maps every sound to an event: 00 "positive year-end" / 01 "negative year-end" when the year-end finance screen opens after profit / loss; 04/10/65/71 train departure (steam, diesel/electric, maglev, monorail) when a train **leaves** a station; 14 level-crossing signal; 20 "cash till" when a vehicle earns money; 21 button click for any GUI button; 22 Morse when a news ticker message appears; 29 applause when the newspaper reports the first arrival at a station; 30 "amazed exclamation" for a new vehicle invention; 31 land construction "splat", 32 rail construction "splat", 39 bridge construction, 02 water construction splat; 15/16 breakdown; 19 crash; ambient animal/wind/industry sounds at farms, trees and factories. — [OpenTTD wiki: Sound IDs](https://wiki.openttd.org/en/Development/SoundIDs)
- [DOC] There is no dedicated sound for a train *arriving* (only departure), and no dedicated "error" sound in the table. — [OpenTTD wiki: Sound IDs](https://wiki.openttd.org/en/Development/SoundIDs)
- [DOC] OpenSFX is the free replacement sound set (CC BY-SA 3.0) so the game runs without the original copyrighted TTD sound files. — [OpenTTD wiki: OpenSFX](https://wiki.openttd.org/en/Basesets/OpenSFX)

**Cities: Skylines 1 (Colossal Order, 2015)**
- [PLAYER] A building upgrade plays a bell-like "ding" ("a pleasant ding sound", compared to a hotel bell); a separate high-frequency "beep beep" near commercial/office zones annoyed players; sounds get louder as you zoom in; turning off ambient sound removes the beep but also seagulls, livestock and noise-pollution sounds. One player missed SimCity's under-construction sound. (Steam thread, 2015-03-12/13) — [Steam discussion](https://steamcommunity.com/app/255710/discussions/0/610574827763353893)
- [PLAYER] Complaints about a constant wind sound when zoomed out; workaround is lowering the ambient slider. A community mod "Ambient Sounds Tuner" exists to turn down individual ambient sounds (seagulls, animals). — search summaries of [Steam discussion](https://steamcommunity.com/app/255710/discussions/0/3275815186880080864) and [mod comments](https://steamcommunity.com/sharedfiles/filedetails/comments/818641631)

**Cities: Skylines II (2023)**
- [DOC] Almost all service buildings and their upgrades have unique sounds "that convey operational status"; buildings have short randomized "spots" layered over loops; some react to time of day and temperature (schools quiet at night). Vehicles change sound with speed; citizens/animals play a cue when clicked that reflects mood. Ambience comes from zone type and weather and "always follow[s] the camera." Music is delivered through in-game radio stations, which interrupt for disaster announcements. (Feature Highlight #12, 2023-09-04) — [Paradox](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/sound-music)
- [DOC] The official page does not mention sounds for UI, Chirper, milestones or money. — [Paradox](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/sound-music)

**Transport Fever 2**
- [PLAYER] Level-crossing bell "bing bing bing" kept being heard after zooming away (in one case caused by a mod). Players asked how to turn off bird sounds. — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3418808914581578485) (search summary)
- [DOC-ish, modder] A station-announcement mod author said catching "train approaching" requires code that slows the game because there is no public event for it — i.e., the base game has no built-in station announcement on approach. — same Steam search results (not opened in full)
- [PLAYER] Community mods replace vehicle sounds (trains, trams); "Steam trams have default clacking sounds." — [mod comments](https://steamcommunity.com/sharedfiles/filedetails/comments/2744110635) (search summary)

**NIMBY Rails (Weird and Wry, early access since 2021-01-26)**
- [DOC, secondary] Wikipedia: "As of 2023, the game does not include any sounds or music," citing a Rock, Paper, Shotgun review from 2021-07-20 (so the 2023 date is not actually supported by the cited source). — [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)

**Train Valley 2**
- [DOC/store] Soundtrack by Alexander Ahura; store listings disagree (GOG: 16 themes, 39 min; Green Man Gaming: 21 themes, 49 min). — [GOG](https://www.gog.com/en/game/train_valley_2_original_soundtrack); [Green Man Gaming](https://www.greenmangaming.com/games/train-valley-2-original-soundtrack-pc/)

**Rail Route**
- [DOC/store] Soundtrack by Rupert Cole, "soothing" neoclassical piano and strings; the developers planned layered, dynamic tracks (one devlog joke about freight trains "bringing in a cello"). — [Steam soundtrack page](https://store.steampowered.com/app/2788780/); [GameDev.net devlog](https://comic.gamedev.net/blogs/entry/2272655-an-introduction-to-the-rail-route-experience) (search summaries)

### Inferences
- [INFERRED] Across documented games, the events most often given a dedicated feedback cue are: **money earned** (OpenTTD cash till per vehicle), **year/period result** (OpenTTD positive/negative year-end; Mini Metro weekly chord), **construction** (OpenTTD rail/land/bridge "splat"), **upgrade/progress** (CS1 bell ding), **first arrival / milestone** (OpenTTD applause), **news/warning** (OpenTTD Morse ticker), and **UI click**. Train *departure* is more common than *arrival* (OpenTTD only has departure).
- [INFERRED] Warnings in the calm/abstract games are expressed by *changing the music/texture* (Mini Motorways' out-of-tune horns, Mini Metro's crowded-station sound) rather than by an alarm sound.
- [INFERRED] For a 2D top-down web game like Railmap, the Mini Metro / Subway Builder model (short synthesized tones, one key, quiet UI cues) is closer and cheaper than the CS2/TF2 model (recorded, camera-positioned ambience).

### Gaps
- No primary source found for Mini Metro's exact station-placement sound, overcrowding timer sound, or game-over sound (only that crowded vs. new station differ, via a search snippet).
- No source on Mini Motorways' specific build/overflow (pin) sounds.
- NIMBY Rails: no source after 2021 confirming whether sound was ever added (devblog search found nothing on audio).
- Transport Fever 2, Train Valley 1/2, Rail Route, Railway Empire: no documentation found about build, arrival, money or warning sound effects; only soundtrack info. Railway Empire was not covered by any result.
- Cities: Skylines 1/2: no source on placement/money/Chirper UI sounds.
- Subway Builder: changelog says nothing about which in-game events (other than tutorial/achievement/UI/crowd/crossing) make sounds.

## Q2. Which games tie sounds to musical scales or to the background music so they never clash? How?

### Takeaway
Mini Metro is the clearest documented case: every sound is scheduled on one master clock (1 in-game hour = 0.8 s = one beat at 72 bpm) and pitched from authored per-city note lists, so sounds are quantized in time and constrained in pitch. Mini Motorways pitches interaction sounds to the current musical state and chooses chords by shared tones. Subway Builder (2026) retrofitted its tutorial/achievement sounds to be "in key with the music" and moved the tutorial chime to a pentatonic scale.

### Cited Findings
- [DOC] Mini Metro master clock: "1 In-Game Hour = 0.8 secs = 1 beat @ 72 bpm = our master pulse." Most sounds trigger periodically at fractional durations of 0.8 s; rhythms are series like [1, 2, 3, 4, 6] (multiples of a time fragment). — [Disasterpeace talk, 2018-04-01](https://disasterpeace.com/blog/mini-metro.serialism-talk)
- [DOC] Mini Metro quantization implementation: a Unity update loop runs at musical subdivisions (e.g., 5 or 16 times per bar) rather than per frame. Feels vary by city (swing in New York/St. Petersburg, uneven rhythms in Cairo, tuplets in Paris). — [Designing Sound, 2016-02-18](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Mini Metro pitch control: lines take the next available pitch from a shared sequence (or per-line sequences); keys can be limited per city; harmony is set in JSON lists such as `["C3", "E3", "G3", "B3"]`; bass notes come from station spawns/mutations; line pitches can jump an octave with a set probability. "Pitch was" designed to be exclusive per line, rhythm was not. Each city has its own harmonic progression that can change by in-game week. — [Disasterpeace postmortem, 2017-03-18](https://disasterpeace.com/blog/mini-metro.postmortem); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Mini Metro coupling went both ways: passenger spawning was "retrofitted" to fire on rhythm assignments from the sound system, and "changing the audio parameters for a level actually changes the way the subway simulation runs." — [Disasterpeace talk](https://disasterpeace.com/blog/mini-metro.serialism-talk); [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Mini Metro clock speed: four music states (fast-forward, pausing from fast-forward, normal, pausing from normal); slower clocks use longer attacks, faster speeds need tighter attacks "to prevent muddiness." In São Paulo, line tones lengthen as the clock slows and the music is most ambient when paused. — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem); [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Mini Motorways: interaction sounds "often pitched to match the current musical state"; a "Common Tone Chord Network" picks each next chord by shared pitches with the previous chord (with fallbacks). — [Game Developer, 2022-02-28](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] Mini Motorways deliberately breaks consonance for warnings: horns are "slightly out of tune." — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] Subway Builder: "Tutorial and achievement sounds are in key with the music now" (v1.4.17, 2026-07-20); "The tutorial's step chime is tuned to a pentatonic scale so it's easier on the ears" (v1.5.0, 2026-07-28). — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- [DOC] Realistic builders do not tie SFX to music: Cities: Skylines II plays music through in-game radio stations, separate from diegetic building/vehicle sound. — [Paradox, 2023-09-04](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/sound-music)

### Inferences
- [INFERRED] Three practical techniques appear: (1) **fixed key / authored note list** (Mini Metro per-city lists; Subway Builder "in key"), (2) **pentatonic** for chimes that may overlap (Subway Builder; pentatonic has no semitone clashes, which is presumably why it is "easier on the ears"), (3) **beat quantization** of event playback to a master pulse (Mini Metro). A cheap web version: keep one key (e.g., C major pentatonic), and delay event sounds to the next 1/8 or 1/16 of a slow pulse.
- [INFERRED] Deliberate dissonance (Mini Motorways horns) is a documented way to make warnings audible without a separate alarm.

### Gaps
- No source names Mini Metro's actual keys/scales per city (only the example JSON list C3-E3-G3-B3, a Cmaj7 arpeggio).
- No source on Mini Motorways' tempo or whether its event sounds are beat-quantized.
- No source on whether Subway Builder quantizes sounds in time.

## Q3. What did players and reviewers praise or complain about?

### Takeaway
Abstract, musical, sparse audio (Mini Metro/Mini Motorways) is consistently praised as relaxing and "satisfying"; complaints across the genre are about **repetitive or high-pitched recurring sounds** (CS1 beeping, CS1 dings), **sounds that persist after the camera moves away** (TF2 crossing bell, Subway Builder crowd noise and crossing noise bugs), **ambient wind/animals** that can't be individually turned down, and **music that becomes monotonous** (Train Valley 2).

### Cited Findings
- [REVIEW] Mini Motorways: procedural soundtrack gives a "relaxing and beautiful experience"; sound design of "pops, drones, and atmospheric ambiance" makes feedback "calming yet satisfying"; one reviewer said there's not much soundtrack but what exists is relaxing; aggregated player feedback calls it therapeutic. — search summaries of [OpenCritic](https://opencritic.com/game/11703/-zge-g-zel/reviews?page=2), [Redbrick](https://www.redbrick.me/?p=467568), [Well Played](https://www.well-played.com.au/?p=415618), [Vaporlens](https://vaporlens.app/app/1127500/mini_motorways.md) (snippet-level)
- [DOC] Vreeland's intent: sounds "tone down the stressfulness of the gameplay" so the soundscape "isn't entirely on the same level" as the chaotic city; horns are only as irritating as needed. — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [PLAYER] Cities: Skylines 1: "every few minutes there's a really distinctive high frequency beeping sound and It's really annoying"; building-upgrade "DING" heard constantly; a player thought it was a bug and asked how to turn it off; others found the ding pleasant. (2015-03) — [Steam discussion](https://steamcommunity.com/app/255710/discussions/0/610574827763353893)
- [PLAYER] CS1 players complain of constant wind when zoomed out, and loud seagulls/animals (mod made to tune them). — search summaries, [Steam](https://steamcommunity.com/app/255710/discussions/0/3275815186880080864), [mod comments](https://steamcommunity.com/sharedfiles/filedetails/comments/818641631)
- [PRESS] Netzwelt (2023-09-05) says CS1 suffered from too many audio sources playing at once, creating a cacophony, which CS2's audio grouping aims to fix. — [Netzwelt](https://www.netzwelt.de/news/221835-cities-skylines-2-entwickler-finden-loesung-klangchaos-kommenden-spiel.html)
- [PLAYER] Transport Fever 2: crossing bell kept sounding after zooming out; players wanted to turn off bird sounds. — [Steam discussion](https://steamcommunity.com/app/1066780/discussions/0/3418808914581578485) (search summary)
- [DOC] Subway Builder had to fix "crowd noises lasting too long after zooming into a station" (2026-08-06) and "grade crossing noises repeating continuously" (2026-08-30), and retuned the tutorial chime to pentatonic "so it's easier on the ears" (2026-07-28). — [Subway Builder changelog](https://www.subwaybuilder.com/changelog)
- [REVIEW] Train Valley 2: music fit at first but became "grating" and monotonous because tracks sound alike; reviewer turned it off. Another reviewer said the "melodic soundtrack" lulls you into calm. — [Indiecator, 2020-06-20](https://indiecator.org/2020/06/20/indietail-train-valley-2/); [Indie Game Reviewer](https://indiegamereviewer.com/review-train-valley-2/) (search summaries)
- [REVIEW] NIMBY Rails was reviewed with no sound or music at all (RPS, 2021-07-20, per Wikipedia). — [Wikipedia](https://en.wikipedia.org/wiki/NIMBY_Rails)

### Inferences
- [INFERRED] The recurring complaint pattern is "a short, bright, identical sound that repeats with no player action behind it." Railmap's monthly settlement and train arrivals are exactly such recurring events, so they are the highest-risk sounds for annoyance.
- [INFERRED] Offering a separate mute/volume for UI vs. world sounds is what players reach for (CS1 ambient slider, Subway Builder "Adjust or mute in Settings").

### Gaps
- No direct Reddit threads were read; player opinion is from Steam threads and review snippets.
- No player feedback found for Rail Route, Railway Empire or Transport Fever 2 build/money sounds.

## Q4. How do games keep frequent events (many trains arriving) from becoming noisy?

### Takeaway
Documented methods: hard caps on simultaneous voices and on how many repeated events are heard (Mini Metro hears only the first 7 same-shape passengers, flammed in 16ths), spreading events in time (passenger "cascade", staggered spawn times), grouping many sources into one aggregate sound by camera distance (CS2), playing sound per *group* not per object (Mini Motorways), zoom-dependent volume (CS1, Subway Builder crowd ambience), tighter envelopes at high game speed, and random variation pools so repeats are not identical.

### Cited Findings
- [DOC] Mini Metro: when many passengers of one shape arrive at once, only the first seven are heard, flammed in 16th notes; the Arpeggio module only honors a limited number of interactions within a short window; failsafes sit at the outer edges of the system so they are rarely noticed. — [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [DOC] Mini Metro: passenger shapes arrive at different times of the hour (e.g., triangles on the half hour), spreading sound; passengers that spawn together appear in "a pleasing cascade" whose interval the audio system sets; game limits (max 7 lines, 4 locomotives per line, 4 carriages per locomotive) bound density; voice count, note duration and attack/decay can be restricted. — [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace); [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Mini Metro: a selected line can be "semi-soloed" (others ducked). Fast-forward needs tighter attacks "to prevent muddiness." — [Disasterpeace postmortem](https://disasterpeace.com/blog/mini-metro.postmortem)
- [DOC] Mini Motorways: a constant pitch per car was rejected because a busy road system became "abstract and overwhelming"; music follows vehicle groups; horn conditions limit how often and how harshly horns sound. — [Game Developer](https://www.gamedeveloper.com/design/turning-road-noise-into-music-mini-motorways)
- [DOC] Cities: Skylines II: audio grouping switches between close and distant audio based on camera distance and number of nearby sources, to "reduce the number of potential audio sources being active at the same time" so you aren't "overwhelmed by the sound of 100 cars"; ambience follows the camera; schools go quiet at night. — [Paradox, 2023-09-04](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/sound-music)
- [DOC] Mini Metro UI: hundreds of rendered random variations of sine-based UI sounds (avoids identical repeats). — [Designing Sound](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace)
- [PLAYER] CS1: sounds get louder as you zoom in (so zoomed-out play is quieter). — [Steam discussion](https://steamcommunity.com/app/255710/discussions/0/610574827763353893)
- [DOC] OpenTTD: per-vehicle event sounds (cash till each time a vehicle earns, departure each time a train leaves) exist; sound settings are a struct in source. — [OpenTTD wiki](https://wiki.openttd.org/en/Development/SoundIDs); [OpenTTD source docs](https://docs.openttd.org/source/d9/d2b/structSoundSettings)

### Inferences
- [INFERRED] For Railmap (up to ~30 trains, top-down MapLibre view, Web Audio synthesis), applicable patterns are: (1) a global rate limit per sound type (e.g., at most N arrival blips per beat window, like Mini Metro's "first 7"), (2) play train sounds only for trains inside the visible map area and scale volume by zoom, (3) quantize to a slow pulse so bursts become rhythmic instead of noisy, (4) small random pitch/timing variation within the scale, (5) keep monthly money/settlement as one aggregated sound per month rather than per train or per passenger (unlike OpenTTD's per-vehicle cash till).
- [INFERRED] OpenTTD's per-vehicle cash-till is a counter-example: fine with few vehicles at a zoomed-in viewport, but likely noisy at scale; I found no source documenting OpenTTD's throttling.

### Gaps
- No source found on OpenTTD's or Transport Fever 2's distance falloff / voice limits.
- No source documents randomized pitch for repeated events in any of these games other than Mini Metro (pitch variation on passenger percussion and train-stop exhaust).
- No source on Subway Builder's mixing/limiting approach beyond the zoom-related crowd-noise bug fix.
