# Web Audio synthesis of pleasant railway-like sounds, and keeping frequent game sounds comfortable

Context: 레일맵 is a calm browser railway-building game. It currently plays plain sine beeps (station placed = 1 note; track done = 2 rising notes; route opened = do-mi-sol; train arrival = quiet ping, throttled to once per 1.5 s). No library, no audio files.

Labels used below: **[source]** = number taken from a cited source. **[rule of thumb]** = my own engineering default, not from a source, to be tuned by ear.

---

## A1. Bell, chime and marimba tones (additive / FM, partial ratios, envelopes)

### Takeaway
Bells sound "bell-like" because of inharmonic partials, higher partials decaying faster, and slight beating between near-identical partials. Marimbas sound warm because their bars are tuned so overtones sit near 4x and 10x the fundamental. Both are easy to build with 3 to 6 OscillatorNodes per hit, or with 2-oscillator FM (C:M = 1:1.4).

### Cited Findings
- Inharmonic partials are frequencies that are not integer multiples of the fundamental; an example bell partial set: 0.56, 0.92, 1.19, 1.71, 2, 2.74, 3.0, 3.76, 4.07 × f0 **[source]** — [PyTorch additive synthesis tutorial](https://docs.pytorch.org/audio/2.5.0/tutorials/additive_synthesis_tutorial.html)
- Church-bell partials are named hum, prime, tierce, quint, nominal. Ideal ("true-harmonic") ratios relative to the nominal: hum 0.25, prime 0.5, tierce 0.6, quint 0.75, nominal 1 (i.e. -2400, -1200, -900, -500 cents) **[source]**. The tierce at a minor third gives church bells their minor colour — [Wikipedia: Strike tone](https://en.wikipedia.org/wiki/Strike_tone); [Hibberts: The musical pitch of bells](https://hibberts.co.uk/?p=665)
- A measured good-quality church bell had tierce 2.378 and quint 2.997 relative to the hum; literature commonly rounds these to 2.4 and 3 **[source]** — [Perrin, Charnley & Depont 1982 (PDF)](https://www.hibberts.co.uk/wp-content/uploads/2022/01/perrin_charnley_depont_1982.pdf)
- Perceived strike pitch of a middling bell comes mostly from the nominal, superquint and octave nominal; for small bells the hum dominates — [Wikipedia: Strike tone](https://en.wikipedia.org/wiki/Strike_tone)
- Risset's observation: higher partials usually decay faster; additive synthesis lets you shape this per partial — [CCRMA: Additive synthesis](https://ccrma.stanford.edu/guides/planetccrma/Additive_Synthesis_on.html)
- Bell "warble" comes from near-degenerate modes beating; add slightly detuned copies of partials (e.g. ratio 1.01, 1.02 next to main partials) — [SuperCollider bell example (sccode)](https://sccode.org/1-5iD/fork); [Csound list advice](https://ml.csound.1bpm.net/mailinglist.csound/thread/51657); [Sound On Sound: Synthesizing bells](https://www.soundonsound.com/techniques/synthesizing-bells)
- Sound On Sound bell anatomy: short inharmonic strike (clapper; shorter decay), a body of ~6 stretched quasi-harmonic sines with a fast initial drop then slower decay, a hum about an octave below with slower attack and longer tail, and beating pairs. It gives no numeric envelope values — [Sound On Sound: Synthesizing bells](https://www.soundonsound.com/techniques/synthesizing-bells)
- In Web Audio, connecting several sources to one destination sums them automatically; one OscillatorNode per partial is the standard additive approach — [teropa: Learn Web Audio Part 4, additive synthesis](https://teropa.info/blog/2016/09/20/additive-synthesis)
- FM bells (Chowning): C:M ratio 1:1.4 (≈5:7) gives inharmonic partials **[source]**. Example patch: carrier 200 Hz, modulator 280 Hz, peak modulation index 10, 15 s duration, index and amplitude both following the same exponential decay **[source]** — [Truax FM tutorial (SFU)](https://www.sfu.ca/~truax/fmtut.html); [UW CSE466 FM examples (PDF)](https://courses.cs.washington.edu/courses/cse466/10wi/pdfs/FMSynthesisExamples.pdf)
- As intensity falls the modulation index falls, moving the tone from complex/inharmonic toward a pure sine; that falling index plus long exponential decay is what reads as "bell" — [Chowning (Aberdeen page)](https://homepages.abdn.ac.uk/d.j.benson/pages/html/Chowning.html); [Cycling '74 MSP Tutorial 11](https://docs.cycling74.com/legacy/max5/tutorials/msp-tut/mspchapter11.html)
- Note: sources define the ratio inconsistently (Fm/Fc vs Fc/Fm) — [Cycling '74 MSP Tutorial 11](https://docs.cycling74.com/legacy/max5/tutorials/msp-tut/mspchapter11.html)
- Concert marimba bars are tuned with overtones at 4x and 10x the fundamental ("triple tuned") **[source]** — [Yamaha: Structure of the marimba](https://www.yamaha.com/en/musical_instrument_guide/marimba/mechanism/mechanism003.html); [La Favre: marimba bars](https://lafavre.us/marimba-bars.htm). Other sources put the upper overtone at ≈9.2 ([CCRMA percussion notes](https://ccrma.stanford.edu/courses/150-2001/percussion.html)) or ≈9.6 ([HyperPhysics](https://hyperphysics.gsu.edu/hbase/Music/xylo.html)) — so 10x is the nominal target, real bars land a bit lower.
- Marimba resonator tubes reinforce only the fundamental, so upper overtones are weaker/shorter than the fundamental — [HyperPhysics: Xylophone and marimba](https://hyperphysics.gsu.edu/hbase/Music/xylo.html)
- `exponentialRampToValueAtTime()` throws a RangeError for value 0; use a small positive target (e.g. 0.0001) or `setTargetAtTime()` — [W3C Web Audio API spec](https://webaudio.github.io/web-audio-api/)

### Inferences
- **Recipe: soft station chime (additive)** [rule of thumb values]. f0 from the game's fixed scale (e.g. 523–880 Hz). Partials (ratio, relative gain, decay to -60 dB): (1, 1.0, 1.2 s), (2.0, 0.35, 0.8 s), (2.76, 0.2, 0.5 s), (4.07, 0.08, 0.25 s), plus one detuned copy at 1.003 × f0, gain 0.3, for slow shimmer. Attack 3–5 ms linear ramp (avoids click). Each partial: `g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(a,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+decay); osc.stop(t+decay+0.05)`. The higher-decays-faster shape follows Risset (cited above).
- **Recipe: marimba blip** [ratios from source, timings rule of thumb]. Partials 1×, 4×, ~9.5–10× with gains 1.0 / 0.25 / 0.08 and decays 0.4 s / 0.12 s / 0.05 s. Sine oscillators only. This is the warmest, least fatiguing choice for the most frequent sound (train arrival) because energy is almost entirely in the fundamental.
- **Recipe: FM bell for "route opened"** [ratio from source, scaled down for a calm game]. Carrier f, modulator 1.4 f, modulator gain (= index × modulator freq) starting at index 3–5 (not 10; 10 is a long concert bell) and decaying to ~0 over the same 1.5–2.5 s as the amplitude. Lower index = less metallic, gentler.
- **Railway-station chime** idea: Japanese/European platform chimes are typically 2–4 note bell/vibraphone figures; a do-mi-sol figure played with the additive chime above (rather than bare sines) already moves the current sound toward "station" without changing its melody. (Inference; I found no source with specific station chime spectra.)
- Church-bell (minor tierce) ratios will sound darker/sadder; for a cheerful game, use the PyTorch-style or "stretched harmonic" sets, or marimba 1:4:10.

### Gaps
- No primary source gave numeric decay times per partial for small bells/chimes; values above are rules of thumb.
- No source found on the actual spectra of Korean subway / platform arrival chimes.

---

## A2. Train horn / whistle (chords of saw/square through lowpass)

### Takeaway
Real North American air horns are multi-chime chords; the Nathan K5LA plays roughly D#4–F#4–G#4–B4–D#5 (≈311/370/415/494/622 Hz), a "B major 6th, first inversion". Synthesize with 3–5 detuned sawtooth (or square) oscillators through a lowpass around 1–2 kHz with a soft attack and pitch "sag" at start/end.

### Cited Findings
- Nathan K5LA chord frequencies ≈ 311, 370, 415, 494, 622 Hz **[source]** — [US patent 9602937 (USPTO PDF)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9602937)
- Factory tuning given as D#, F#, G#, B, D# (octave); one table lists two F# bells instead of G#, so the third note is uncertain — [Scribd acoustics paper](https://www.scribd.com/document/911509704/Topics-Include-Acoustics); [The Beauty of Transport: The Horn Section](https://thebeautyoftransport.com/2015/06/17/the-horn-section-or-the-music-of-trains/)
- K5LA was designed as a "B-major 6th chord in first inversion", a more pleasant replacement for the K5H's D# minor 6th (D#, F#, A#, C, D#) — [Locomotive Wiki: Nathan AirChime K-series](https://locomotive.fandom.com/wiki/Nathan_AirChime_K-series_Air_Horns); [Wikipedia: Train horn](https://www.wikipedia.org/wiki/Train_horn)

### Inferences
- **Recipe: distant, polite horn** [rule of thumb]. 3 notes only (e.g. 311, 370, 494 Hz, or transpose into the game's key), each a `sawtooth` with ±4–8 cents detune; sum → `BiquadFilterNode` lowpass, frequency 900–1400 Hz, Q 0.7–1 → gain. Attack 60–120 ms, sustain 0.3–0.6 s, release 150–250 ms. Pitch: start each oscillator ~30–50 cents flat and glide up over 80 ms (air horns "come up to pitch"); optionally drop a few cents in the release. Overall gain well below the chimes (horns have dense harmonics and sound louder at equal peak).
- Square waves give a hollower, steam-whistle-like timbre; a steam whistle can be approximated with 1–2 sines/triangles plus a little bandpassed noise for breath. (Inference.)
- Because horns are loud and harmonically dense, reserve them for rare events (e.g. the very first train of a new route) — consistent with Material's "hero sound" guidance in B2.

### Gaps
- No source found on Korean (KTX/Korail/Seoul Metro) horn pitches; the US K5LA is the best-documented chord.
- No source gave filter cutoffs or envelope times for synthetic horns.

---

## A3. Rail clack (filtered noise bursts in a rhythm)

### Takeaway
I found no authoritative source with parameters for synthesizing rail-joint clacks; the approach below is a standard noise-burst technique stated as a rule of thumb.

### Cited Findings
- (None specific.) General principle supporting variation per hit: small random pitch/volume changes per repeated hit reduce repetitiveness (applies directly to clacks) — [Game Developer: The power of pitch shifting](https://gamedeveloper.com/audio/the-power-of-pitch-shifting); [Bugnet: footstep sounds](https://bugnet.io/blog/footstep-sounds-matter-more-than-you-think)
- Scheduling rhythmic hits should use `AudioContext.currentTime`, not `setTimeout`; Chris Wilson's scheduler uses a 25 ms timer and 100 ms lookahead **[source]** — [web.dev: A tale of two clocks](https://web.dev/articles/audio-scheduling)

### Inferences
- **Recipe** [rule of thumb]. Create one 1-second white-noise `AudioBuffer` once at startup and reuse it (new `AudioBufferSourceNode` per hit with random `offset`). Per hit: noise → bandpass (centre 600–1500 Hz, Q 1–3) → gain with 1 ms attack, 30–60 ms exponential decay. Add a low "thump" layer: sine 80–120 Hz, decay 40–80 ms. Pattern: two hits ~70–120 ms apart (front and rear bogie over a joint) = "ta-tak", repeating every ~0.6–1.2 s depending on speed. Random ±10% bandpass frequency and ±2 dB gain per hit.
- For a calm map-scale game, continuous clacks for 30 trains will be the most fatiguing thing possible; at most play clacks for the selected/followed train, or a single very quiet ambience bed, not per-train.

### Gaps
- No source found with measured spectra/timing of rail-joint clacks (jointed vs welded rail).

---

## A4. Soft UI clicks

### Takeaway
Keep UI ticks very short (≈30–150 ms), low-to-mid frequency, and much quieter than event sounds.

### Cited Findings
- UI taps/clicks: 30–150 ms; notifications up to ~500 ms **[source; blog-level]** — [Violet Recording: How to design UI sounds](https://violetrecording.com/how-to-design-ui-sounds/)
- Micro-interaction sounds typically 50–200 ms **[source; skill/blog-level]** — [skills.sh: ui-sound-design](https://www.skills.sh/jeremielim/skills/ui-sound-design)
- Material: sound is generally unsuitable for "actions that are performed frequently"; decorative sounds should be used sparingly to reduce user fatigue — [Material Design: Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html)

### Inferences
- **Recipe** [rule of thumb]. Sine or triangle at 800–1600 Hz with a fast pitch drop (e.g. 1400 → 700 Hz over 25 ms), gain envelope 1 ms attack, 25–40 ms exponential decay; or a 10–20 ms noise burst through a bandpass at ~1–2 kHz. Peak ≈ -12 dB relative to the chime.
- Following Material, the most frequent clicks (tool-button presses, drag waypoints) are best left silent or nearly so; reserve sound for confirmations (station placed, track done).

### Gaps
- No authoritative (platform) numeric spec for click duration/level; the numbers above are from blogs.

---

## A5. Simple room reverb (ConvolverNode or feedback delay)

### Takeaway
A ConvolverNode fed with a short synthetic impulse response (exponentially decaying noise, ~0.8–1.5 s) gives a cheap, file-free "station hall" ambience; send only 10–20% wet.

### Cited Findings
- ConvolverNode `normalize` defaults to `true` "in order to achieve a more uniform output level" **[source]** — [W3C Web Audio API spec](https://webaudio.github.io/web-audio-api/)
- ConvolverNode channelCount is capped at 2 and does not allow "max" channel-count mode — [W3C Web Audio API spec](https://webaudio.github.io/web-audio-api/)

### Inferences
- **Generated IR** [rule of thumb]: stereo buffer, length = sampleRate × 1.2 s; each sample = `(Math.random()*2-1) * Math.pow(1 - i/len, 3)` (different noise per channel for width). Build once at startup.
- **Routing**: each voice → dry gain → master; each voice also → one shared `reverbSend` gain (0.1–0.2) → convolver → master. One shared convolver, never one per sound (convolution is the most CPU-expensive node).
- **Cheaper alternative**: feedback delay — DelayNode 0.08–0.15 s, feedback GainNode 0.25–0.35, lowpass ~2–3 kHz inside the loop so echoes darken; wet 0.1–0.15. Keep feedback < 1 or it runs away.
- A darker (lowpassed) reverb tail softens attack transients and reduces perceived harshness.

### Gaps
- No source with recommended IR length or wet levels for UI/game effects.

---

## A6. Master bus, DynamicsCompressor, scheduling and performance

### Takeaway
Route everything: voices → category gains (ui / events / trains) → master gain (user volume) → DynamicsCompressor (as a safety limiter) → destination. Spec defaults for the compressor are known; a gentler setting suits a calm game.

### Cited Findings
- DynamicsCompressorNode defaults and ranges **[source]**: threshold -24 dB (−100…0), knee 30 dB (0…40), ratio 12 (1…20), attack 0.003 s (0…1), release 0.25 s (0…1); all k-rate — [W3C Web Audio API spec §1.19](https://webaudio.github.io/web-audio-api/)
- `attack` = time to reduce gain by 10 dB; `release` = time to increase gain by 10 dB; `reduction` reports current gain reduction — [MDN: DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode)
- `start()` on an AudioScheduledSourceNode (Oscillator, BufferSource) can only be called once; a second call throws InvalidStateError — so create a fresh source node per sound — [W3C Web Audio API spec](https://webaudio.github.io/web-audio-api/)
- Source nodes are created throughout the context's lifetime and are not explicitly removed from the graph — [W3C Web Audio API spec §1.1.6](https://webaudio.github.io/web-audio-api/)
- Use `AudioContext.currentTime` (hardware clock) for timing; `setTimeout` can slip by tens of ms; scheduler pattern: 25 ms timer, 100 ms lookahead **[source]**; use `requestAnimationFrame` for visuals — [web.dev: A tale of two clocks](https://web.dev/articles/audio-scheduling)
- Scheduled AudioParam methods override direct `.value` assignment — [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- ZzFX shows a complete game SFX generator can be <1 KB compressed, no audio files, 20 parameters, with a default randomness of 0.05 per play — [ZzFX on GitHub](https://github.com/KilledByAPixel/ZzFX)

### Inferences
- **Gentle master compressor** [rule of thumb]: threshold -18 dB, knee 12 dB, ratio 4, attack 0.005 s, release 0.2 s. With the spec default ratio 12 and threshold -24 it acts more like a limiter and can audibly "pump" overlapping chimes. Keep master gain so that a single loud sound peaks around -6 dBFS (gain ≈ 0.5) and the compressor only catches pile-ups.
- **Performance** [rule of thumb]: a 4-partial chime = ~8 nodes; 10 overlapping = 80 nodes — trivial. Costs that matter: ConvolverNode (use one, shared), creating noise buffers per hit (create once), and leaving nodes connected forever (call `osc.stop(t)`; set `osc.onended = () => gain.disconnect()`). Hard-cap simultaneous voices (see B2). Avoid creating an AudioContext per sound — one per page.
- Always end envelopes before `stop()` to avoid clicks; always start with a ≥2–5 ms ramp from 0.
- Map pan to screen x with a StereoPannerNode (±0.3–0.5 max) for spatial hint of where a train arrived — cheap and helpful, but keep subtle.

### Gaps
- No source gave measured node counts at which browsers start to struggle; spec does not state performance figures.

---

## B1. Loudness targets and balancing effects against each other

### Takeaway
Console games standardised on about -24 LUFS integrated loudness (Sony ASWG-R001, ITU-R BS.1770-based); for a browser game the practical goal is consistency: a clear hierarchy where frequent sounds are the quietest and rare "hero" moments are the loudest.

### Cited Findings
- Sony's ASWG-R001 adopted -24 LUFS (from ITU-R BS.1770), published/updated 2013; Microsoft and Nintendo later aligned with similar recommendations **[source; secondary]** — [Audio Media International: Mobile loudness](https://audiomediainternational.com/mobile-loudness-an-adaptive-approach/); [Designing Sound: interview with Garry Taylor](https://designingsound.org/2012/07/30/video-games-and-loudness-standards-interview-with-sonys-garry-taylor/)
- Motivation was inconsistent levels between titles, notably the system-menu (XMB) sounds — [Designing Sound: interview with Garry Taylor](https://designingsound.org/2012/07/30/video-games-and-loudness-standards-interview-with-sonys-garry-taylor/)
- Contradiction: a general audio blog says -16 LUFS is typical for gaming and that there is no hard rule — [KEF: In search of audio standards, part two](https://us.kef.com/blogs/news/in-search-of-audio-standards-part-two); a course wiki gives -24 LUFS with -2 dBFS true peak (student-level source) — [Curtin MCASI wiki](https://curtinmcasi.atlassian.net/wiki/x/BICYBg)
- UI sound level recommendations conflict across blogs: -18 to -24 dB vs -12 to -6 dB; one gives feedback sounds -6 dB relative to notifications at 0 dB. References differ, treat as hypotheses — [Violet Recording](https://violetrecording.com/how-to-design-ui-sounds/); [skillselion: ux-sound-design](https://skillselion.com/skills/guia-matthieu/clawfu-skills/ux-sound-design)
- Material sound hierarchy: brand > hero > alerts > primary UX > secondary UX; same type shares the same level — [Material Design: Sound choreography](https://m2.material.io/design/sound/sound-choreography.html)

### Inferences
- **Suggested 레일맵 hierarchy** [rule of thumb, relative peak levels]: route opened (hero, rare) 0 dB; track done -4 dB; station placed -6 dB; train arrival -14 to -18 dB (by far the most frequent); UI clicks -18 dB or silent; warnings (debt, congestion) -6 dB but with a distinct timbre rather than more volume.
- A browser game cannot measure LUFS at runtime cheaply; balance by ear at a fixed master volume, comparing every sound against one reference (e.g. the station chime).
- Perceived loudness depends on spectrum and duration, not only peak gain: a 300 ms saw-wave horn will sound far louder than a 300 ms sine at the same gain, so harmonically rich sounds need lower gain.

### Gaps
- The ASWG-R001 PDF itself was not opened; -24 LUFS is from secondary sources. No web/browser-game loudness standard was found.

---

## B2. Avoiding fatigue: variation, voice limits, throttling, ducking, scales

### Takeaway
Fatigue comes from repetition and density. Fixes, in order of value: make frequent sounds rarer and quieter (throttle/aggregate), add small random variation (pitch ±few %, gain ±1–2 dB), cap simultaneous voices per category, duck lower-priority sounds under important ones, and keep all pitched sounds in one key/pentatonic scale so overlaps harmonise.

### Cited Findings
- Listening fatigue comes from repetition; frequently heard sounds matter most — [A Sound Effect: game audio immersion (Bjørn Jacobsen)](https://www.asoundeffect.com/game-audio-immersion/)
- Small random pitch shift per play adds natural variation and reduces repetitiveness even if not consciously noticeable — [Game Developer: The power of pitch shifting](https://gamedeveloper.com/audio/the-power-of-pitch-shifting)
- Footstep guideline: 4–8 variations, random selection without immediate repeats, subtle randomized pitch (a few percent) and volume **[source; blog-level]** — [Bugnet: footstep sounds](https://bugnet.io/blog/footstep-sounds-matter-more-than-you-think)
- Pitch variation alone can still feel repetitive; combine techniques — [USPTO patent 10453434](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10453434)
- ZzFX applies a default per-play randomness of 0.05 — [ZzFX on GitHub](https://github.com/KilledByAPixel/ZzFX)
- Voice limiting: engines cap simultaneous voices; lowest priority voices are culled first; per-category limits (e.g. eight footsteps don't need eight voices) — [Game Developer: Game audio theory: ducking](https://www.gamedeveloper.com/audio/game-audio-theory-ducking); [Bugnet: how to mix game audio](https://bugnet.io/blog/how-to-mix-game-audio-so-nothing-drowns-out)
- Ducking lowers one group while another plays; sidechain ducking follows the transients, event ducking lowers for a fixed time; suggested dip of "a few dB with a quick attack and gentle release" — [Game Developer: Game audio theory: ducking](https://www.gamedeveloper.com/audio/game-audio-theory-ducking); [Bugnet: how to mix game audio](https://bugnet.io/blog/how-to-mix-game-audio-so-nothing-drowns-out); [MCV: Audiokinetic clarity guide](https://mcvuk.com/?p=121596)
- Material: limit the frequency of decorative sound to reduce fatigue; hero sounds should be rare and consistent; avoid sound for frequently performed actions — [Material: Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html); [Material: About sound](https://m2.material.io/design/sound/about-sound.html)
- Pentatonic scale is commonly used in games as a "no wrong notes" constraint for random/generative notes; it is forgiving but does not guarantee pleasant results — [femdev: Generative melody and harmony](https://hive.blog/hive-196387/@femdev/learn-creative-coding-120-generative-melody-and-harmony); [Stack Overflow (Kiwix mirror)](https://dev.library.kiwix.org/content/stackoverflow_en_nopic_2021-08/questions/23408263/how-to-create-nice-sounding-notes-and-music-from-simple-user-input)

### Inferences
- **Variation per play** [rule of thumb]: detune ±20–40 cents (≈±1–2%) or, better for a musical game, pick a random note from the scale instead of continuous detune; gain ±1.5 dB; decay ±10%. Never repeat the exact same note twice in a row for train arrivals.
- **Key choice**: put every pitched sound in one key, e.g. C or D major pentatonic (C D E G A). Then train-arrival pings stacking with a station chime or the do-mi-sol fanfare always form consonant intervals. Station-specific or route-specific pitch (route colour ↔ scale degree) adds information without adding annoyance.
- **Throttling** [rule of thumb]: keep the existing 1.5 s arrival throttle, but scale it with density: with many trains, merge arrivals inside a window into one ping (optionally one note per unique route). Global cap: ≤6–8 voices total, ≤2 arrival pings at once; drop (not queue) excess low-priority sounds.
- **Ducking** [rule of thumb]: when a hero sound (route opened) plays, ramp the "trains" category gain down 6 dB over 20 ms and back over 400–600 ms; simple event ducking via `setTargetAtTime` is enough — no sidechain needed.
- At 3x speed, arrivals triple; tie throttle interval to real time (not game time) so speed-up does not triple audio density.

### Gaps
- No controlled study found quantifying how much pitch variation is "enough"; values are practitioner guidance.

---

## B3. Frequency ranges to avoid, and how short is short enough

### Takeaway
Human hearing is most sensitive around 2–5 kHz; energy there makes sounds cut through but also sound harsh and tiring. Keep the bulk of energy roughly 200 Hz–2 kHz, keep the strongest partials below ~2 kHz, and lowpass bright waveforms.

### Cited Findings
- Irritating/painful frequencies are those humans are most sensitive to, roughly 2–5 kHz **[source; forum-level]** — [Audiotool board: mastering help](https://audiotool.com/board/mastering/mastering_help)
- UI-sound guide advises trimming harsh peaks around 2–5 kHz in EQ — [Violet Recording](https://violetrecording.com/how-to-design-ui-sounds/)
- Contradiction: another source says 2–5 kHz sounds cut through background noise "without being harsh" — [soundcy: what sound does UI make](https://soundcy.com/article/what-sound-does-ui-make). Reasonable reading: this band gives clarity and fatigue risk at once; check for peaks there rather than ban it.
- Durations: clicks 30–150 ms, notifications ≤~500 ms; micro-interactions 50–200 ms **[source; blog-level]** — [Violet Recording](https://violetrecording.com/how-to-design-ui-sounds/); [skills.sh: ui-sound-design](https://www.skills.sh/jeremielim/skills/ui-sound-design)
- Avoid relying only on high frequencies (some users cannot hear them) — [skillselion: ui-sound-design](https://skillselion.com/skills/dannyjpwilliams/ui-sound-design-skill/ui-sound-design)

### Inferences
- [rule of thumb] Fundamentals for chimes: ~400–1000 Hz (G4–C6). Square/saw sources: lowpass at 1.5–2.5 kHz. Bell partial sets: drop or attenuate any partial landing above ~4 kHz. Avoid fundamentals below ~150 Hz on small laptop/phone speakers (inaudible) — put any "weight" in 150–300 Hz.
- [rule of thumb] Effective length (to -40 dB): clicks ≤60 ms; frequent event pings ≤300 ms; confirmations ≤600 ms; rare hero sounds 1–2.5 s. Long bell tails are fine only if quiet and rare.
- The current pure sines are actually low-fatigue spectrally; the "annoying" quality likely comes from abrupt envelopes (clicks at start/stop), identical repetition, and lack of decay — fixable without making them brighter.

### Gaps
- I did not retrieve a primary psychoacoustics source (e.g. ISO 226 equal-loudness contours) in this session; the 2–5 kHz sensitivity claim is cited from secondary sources only.

---

## B4. Respecting users: mute, volume slider, autoplay policy

### Takeaway
Create or resume the single AudioContext inside a user gesture (click/key), and provide a persistent mute toggle plus a volume slider wired to a master GainNode.

### Cited Findings
- Since Chrome 71, an AudioContext created before a user gesture starts "suspended"; check `ctx.state`, listen for `statechange`, call `resume()` from a click; calling `start()` on a node after a gesture also resumes — [Chrome for Developers: Autoplay policy](https://developer.chrome.com/blog/autoplay)
- MDN: "Create or resume context from inside a user gesture"; a context created inside a click handler starts `running`; states are suspended/running/closed — [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- MDN: provide play/stop and volume/mute controls; `<input type="checkbox">` for mute, `<input type="range">` for volume; use `role="switch"` for audio on/off buttons; label controls for screen readers — [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- Material: avoid sound for users who requested no interruptions or contexts needing discretion — [Material: Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html)

### Inferences
- [rule of thumb] Volume slider should be perceptual: `gain = slider^2` (or map 0–100 to -40…0 dB), smoothed with `setTargetAtTime(v, now, 0.02)` to avoid zipper noise. Persist mute and volume in localStorage. Mute = ramp master to 0 (and optionally `ctx.suspend()` to save CPU), not just skipping play calls.
- Resume on the first pointerdown/keydown anywhere (e.g. the start-screen map choice), and make all `play*()` functions no-ops while `ctx.state !== 'running'` so nothing queues up and bursts out later.
- Consider pausing/ducking when `document.hidden` (tab in background) so a long-running sim does not ping in a background tab.

### Gaps
- Safari/Firefox autoplay specifics were not separately fetched; MDN's guidance is cross-browser in general terms.

---

## B5. Accessibility: never convey information only by sound

### Takeaway
Every sound in 레일맵 must duplicate something visible (callout bubble, panel change, badge); sound is reinforcement, never the sole channel.

### Cited Findings
- Sound should not be the only channel; pair cues with visual feedback; avoid relying only on high frequencies — [skillselion: ui-sound-design](https://skillselion.com/skills/dannyjpwilliams/ui-sound-design-skill/ui-sound-design)
- Provide accessible, labelled audio controls (role="switch", screen-reader labels) — [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

### Inferences
- In 레일맵 the existing map callouts (station built, warnings, bankruptcy dialog) already carry the information; keep warnings (debt, congestion) visual first, sound second.
- Distinguish important cues by rhythm/contour (e.g. falling two-note for warnings, rising for success), not only by pitch, so users with partial hearing loss or on poor speakers still tell them apart.

### Gaps
- WCAG 1.4.2 (Audio Control) and Apple HIG sound pages were not fetched in this session; Apple HIG guidance is not represented here.
