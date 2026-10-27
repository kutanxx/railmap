# Map UI surface design: light vs dark panels, filled vs outlined controls, visual weight, figure–ground (for 레일맵)

Context: 레일맵 is fully flat (no shadows, gradients or translucency). Map palette: land #EFE7D6, blocks #E9E0CC, buildings #E2D6BF (edge #CFC0A3), roads #FBF7EE (edge #D6C9AF), parks #CFE0B4, water #B8CBDA. UI: navy #1F3A55, yellow accent #F2C230; station-name bubbles are white with navy borders.
Candidates: (A) white boxes + 2px navy border everywhere, (B) navy-filled control bars, white text, yellow active state, with white info panels, (C) light beige paper cards #FBF7EE with thin #CFC0A3 borders.

## 1. How do map products style floating controls and panels, and what replaces shadows in flat contexts?

### Takeaway
The common pattern is light (white) control groups over the map. They separate from the map with an outline ring or a shadow, not with a dark fill. MapLibre, the library 레일맵 already uses, ships white buttons with a flat 2px ring and no blur. That ring is a border in effect, so it is the closest existing model for a "flat" map control. I found no primary documentation for Kakao, Naver, Apple Maps or Esri Calcite control styling.

### Cited Findings
- MapLibre GL default control group CSS: `.maplibregl-ctrl-group{border-radius:4px;background:#fff}` and `.maplibregl-ctrl-group:not(:empty){box-shadow:0 0 0 2px rgba(0,0,0,.1)}`. The ring has 0 blur and 2px spread, so it draws as a solid 2px outline, not a soft shadow. In forced-colors (high-contrast) mode it becomes `0 0 0 2px ButtonText`, a solid system-color outline. The focus style is `box-shadow:0 0 2px 2px #0096ff`. The attribution box uses a 50% white translucent background — [maplibre-gl.css on unpkg](https://unpkg.com/maplibre-gl/dist/maplibre-gl.css) (verified in the project's installed `node_modules/maplibre-gl/dist/maplibre-gl.css`).
- Mapbox GL has the same defaults (white, 4px radius, 2px 10%-black ring). Hover adds a light gray tint and 1px light-gray dividers separate buttons — [mapbox-gl.css copy hosted by recreation.gov](https://www.recreation.gov/shared/libraries/mapbox-gl-2.2.0/mapbox-gl.css). Mapbox's own guide suggests restyling controls with CSS to match the map style — [Mapbox blog: advanced guide to customizing controls](https://blog.mapbox.com/advanced-guide-customize-controls-more-a543e27c5fd1).
- Felt 2.0 moved its toolbar to the top, shrank the illustrated icons and added dropdowns "to free up map space" so the map view is larger. Felt describes five parts of a map: toolbar, legend, detail panel, table and map — [Felt blog: UI upgrades](https://felt.com/blog/ui-upgrades); [Felt help: tour the interface](https://help.felt.com:443/getting-started/tour-the-interface).
- Google Maps (Material redesigns, 2019): reporting said "white is, again, the dominant color," replacing light grey backgrounds in the search UI. Category chips appeared as a floating scrolling bar at the top, with "cleaner lines, a thicker font, and greyscale icons" — [BGR](https://bgr.com/2019/01/28/the-new-google-maps-design-just-got-an-updated-search-look/); [Android Police](https://www.androidpolice.com/2019/11/04/google-maps-testing-floating-scrolling-bar-category-searches/); [9to5Google: Material You](https://9to5google.com/2021/11/09/google-maps-material-you/).
- A Google patent defines a "floating toolbar" as one with a gap between its edges and the display edges, so it seems to hover over the content. In other words, the gap from the screen edge is itself a separation cue — [US10564797B2](https://patents.google.com/patent/US10564797).

### Inferences
- The industry default for map chrome is a light surface with a thin ring or shadow. MapLibre's own ring (2px, no blur) shows that a flat outline can stand in for a shadow. That supports a "light card + solid border" approach (A or C) over a dark fill.
- The MapLibre ring is very low contrast, though. Over 레일맵 land the composited ring is about #D7D0C1, only 1.25:1 against the land (computed below). Mainstream products rely on shadows plus white-against-colorful-map for separation. Without shadows, 레일맵 has to get that separation from a stronger border or fill.
- Felt and Google both work to shrink chrome to "free up map space". Products treat UI weight as a cost to minimize, not a feature.

### Gaps
- I found no primary source (design blog or style guide) for Kakao Map, Naver Map or Apple Maps control styling. Any claim about them (for example, white rounded buttons with soft shadows, or dark-mode controls) comes from general familiarity only and is unverified.
- Esri Calcite: searches returned no official docs on panel elevation or shadow tokens for map UIs ([ArcUser on Calcite](https://www.esri.com/about/newsroom/arcuser/calcite) only confirms Calcite has panels, color schemes and components).
- Apple HIG "Maps" page did not render via fetch, so I have no verified Apple guidance.
- I found no documented example of a mainstream map product using dark-filled control bars over a light basemap. Dark controls do appear in dark-mode maps, but I have no citation for that.

## 2. How do design systems separate layers and interactive elements without shadows?

### Takeaway
Shadow-free systems separate layers with tonal (lightness) steps between surfaces, and they mark interactivity with fills, borders and consistent color. In Carbon, depth comes from background steps, and borders are used inside a layer. Material 3 moved from shadow-based elevation to tone-based "surface container" roles. NN/g warns that fully flat controls, especially thin-outline "ghost buttons", are weak signifiers. A visible boundary only needs to meet 3:1 contrast if nothing else identifies the control.

### Cited Findings
- Material 3: dedicated surface color roles (surface container, etc.) are "no longer tied to elevation". "Surface container" is the recommended default role for a contained area on the "surface" role — [Material blog: tone-based surface color in M3](https://material.io/blog/tone-based-surface-color-m3) (summary from search snippet; full page did not render). In Compose, tonal elevation makes a surface darker in light theme and lighter in dark theme, and the shadow is a separate, optional parameter — [Jetpack Compose Surface docs](https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-surface.html).
- IBM Carbon: there are four layers (base, layer 01, 02, 03). "Each step in UI color (excluding interaction colors) is another layer." Light themes alternate White and Gray 10 as layers are added. Dark themes step one shade lighter per layer. Borders such as "subtle borders" separate tiles within the same layer, and depth between layers comes from background steps. The usage page does not mention shadows. Interaction-state tokens belong to each layer set — [Carbon color usage](https://carbondesignsystem.com/elements/color/usage); [Carbon color overview](https://carbondesignsystem.com/elements/color/overview/).
- NN/g flat-design best practices: buttons should "at least vaguely look like physical buttons." Avoid ghost buttons (text inside a thin outline). "Never use the same visual treatment for static text and linked text." Keep color consistent, and don't reuse the primary-action color as a static background. Use an accent color for primary actions. NN/g recommends "flat 2.0" with subtle shadows under toolbars and interactive elements to separate them from content — [NN/g: Flat-Design Best Practices](https://www.nngroup.com/articles/flat-design-best-practices/).
- NN/g eyetracking (71 users, 9 site pairs): pages with weak signifiers took 22% more time and drew 25% more fixations. Ghost buttons and links styled like static text were the weak signifiers. Strong signifiers were traditional blue underlined links, buttons with depth, and links in a contrasting color — [NN/g: Flat UI Elements Attract Less Attention and Cause Uncertainty](https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/). NN/g also lists borders, color, size, consistency and placement as clickability cues — [NN/g signifiers topic](https://www.nngroup.com/topic/signifiers/).
- WCAG 2.2 SC 1.4.11: visual information needed to identify a control and its state must have at least 3:1 contrast with adjacent colors. The SC "does not require that controls have a visual boundary indicating the hit area." A boundary is needed only "when there is no other visual way to identify the presence of the control". A focus indicator must have enough contrast against the adjacent background. A state change (for example, selected) must not lose contrast with adjacent colors. Thin borders or subtle shadows that don't identify the component are folded into the nearest color — [W3C Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast). Do not round: 2.999:1 fails — [TabNav on 1.4.11](https://tabnav.com/academy/wcag/success-criterion-1.4.11).

### Inferences
- Without shadows, the tools left are (1) tonal steps between map and panel, (2) borders, and (3) filled controls. Carbon and M3 use (1) for containers and (2)/(3) for interactive parts.
- In option C, the #FBF7EE paper card is also exactly the road color (1.00:1), and only 1.15–1.34:1 from land, blocks and buildings. That is too small a tonal step to read as a separate layer over a busy map. The thin #CFC0A3 border (1.25–1.68:1) does not compensate. C works best as a large docked panel's fill. Its controls still need a stronger cue.
- Option A uses outline-only controls. If every button is "white box + navy border" with no fill difference, buttons, static info boxes and map name bubbles share one treatment. That is exactly what NN/g warns against ("same visual treatment for static text and linked text"; ghost-button-like). Making the border 2px and navy (strong contrast) helps, but it does not tell actions apart from information.
- Option B has filled navy controls, which are a strong signifier: a filled button reads as "pressable". It also gives a clear selected state (yellow on navy is 6.98:1). It matches NN/g's advice to keep the action color for actions and not reuse it as a static background. The navy fill must then not also be used for static labels such as the date badge, or the cue gets diluted. That is a real conflict, because the CLAUDE.md art rules make the date badge navy.

### Gaps
- I did not fetch Fluent 2, GOV.UK or KRDS (Korean government design system) guidance on borders vs fills. Their positions are unverified here.
- I found no controlled study comparing filled vs outlined controls placed specifically over maps.

## 3. Visual weight and figure–ground: how subordinate should the UI be to the map?

### Takeaway
Cartography guidance is consistent: the visual hierarchy should follow the intellectual hierarchy, and ancillary elements should be "more subtle". Larger and darker objects draw the eye on a light background. Lightness contrast is the main lever of figure–ground. HUD chrome should therefore be lower in weight than the player's network (routes, stations, trains), while still clearly separated from the map.

### Cited Findings
- Axis Maps: visual hierarchy should match intellectual hierarchy. What the eye sees first should be the most important element, and ancillary elements should be more subtle. "Larger and darker objects generally draw the eye" on a light background. Low contrast weakens figure–ground and the overall hierarchy. If the map is the main story, maximize it and shrink oversized decorative items. Use the "squint test" to check hierarchy — [Axis Maps Cartography Guide: Visual Hierarchy](https://axismaps.com/guide/visual-hierarchy).
- GIS&T Body of Knowledge: figure–ground is "the advancing visual prominence of one part of an image against the rest", and contrast is the essential factor controlling prominence in a visual hierarchy — [UCGIS GIS&T BoK](https://gistbok.ucgis.org/node/100007389) (via search snippet).
- Esri ArcUser lists ways to create figure–ground separation: show only the figure, add a drop shadow, screening, illumination or a vignette — [Esri ArcUser: five primary design principles](https://www.esri.com/about/newsroom/arcuser/make-maps-people-want-to-look-at-five-primary-design-principles-for-cartography); [Wikipedia: Figure-ground (cartography)](https://en.wikipedia.org/wiki/Figure-ground_(cartography)).
- Value contrast drives visual weight: dark elements carry more weight than light ones, and the stronger the value contrast with the background, the more weight the object has — [Smashing Magazine: Visual Weight and Direction](https://www.smashingmagazine.com/2014/12/12/design-principles-visual-weight-direction/).

### Inferences
- 레일맵's intellectual hierarchy (from CLAUDE.md: "only what the player builds has color") is: the player's lines, stations and trains first; then station labels and alerts; then HUD chrome; then the beige basemap. By Axis Maps' rule, chrome should be visually weaker than the network but stronger than the basemap.
- The running track is #3E4651. Navy #1F3A55 is only 1.23:1 against it, so large navy bars sit in the same "darkest value" band as the player's track. Big navy areas (B) would compete with the network for "darkest = most important" attention. Small navy accents (borders, badges, a selected chip) would not.
- Figure–ground between UI and map comes from a value step plus a crisp edge. A white or paper surface with a dark (navy) edge gives a strong edge with low mass. A navy fill gives a strong edge and high mass.
- In option A, controls copy the station-name bubbles (white + navy border). That creates figure–figure confusion: the player can't tell at a glance whether a white navy-bordered box is a map label or a button. Grouping and position (docked to the screen edge) and a distinct corner radius or size would be needed to keep them apart.

### Gaps
- I found no peer-reviewed perception study measuring how dark vs light HUD panels over maps affect map-reading performance.

## 4. Contrast numbers for each candidate (WCAG relative luminance)

### Takeaway
Navy as text or border passes easily everywhere (7–11.7:1). Yellow on navy passes for text (6.98:1). Yellow on light surfaces fails (1.36–1.68:1), so the yellow "active" state only works on a navy background. The #CFC0A3 border (C) and the white or paper fill alone (A and C without border) fail 3:1 against every map color. A navy filled bar (B) has a 7–11:1 boundary against the map.

### Method
WCAG 2.x relative luminance: each sRGB channel c/255 is linearized (c ≤ 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4). L = 0.2126R + 0.7152G + 0.0722B. Ratio = (Lmax + 0.05)/(Lmin + 0.05). Thresholds are 4.5:1 for normal text, 3:1 for large text and UI components, with no rounding — [W3C Understanding SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast); [WCAG 2.2 relative luminance definition](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). I computed these with a Node script (scratchpad `contrast.mjs`).

Luminances: white 1.000, #FBF7EE 0.932, #EFE7D6 0.804, #E9E0CC 0.750, #CFE0B4 0.699, #E2D6BF 0.680, #B8CBDA 0.580, #F2C230 0.577, #CFC0A3 0.536, #A7BED4 0.498, #6F6656 0.136, #3E4651 0.060, #1F3A55 0.040.

### Cited Findings (computed values; method source above)
Text and state pairs:
| Pair | Ratio | Text 4.5 | UI 3:1 |
|---|---|---|---|
| white text on navy #1F3A55 (B) | 11.70 | pass | pass |
| yellow #F2C230 on navy (B active) | 6.98 | pass | pass |
| navy on white (A, panels) | 11.70 | pass | pass |
| navy on paper #FBF7EE (C) | 10.94 | pass | pass |
| label #6F6656 on paper | 5.29 | pass | pass |
| small label #9A8F7B on paper | 2.98 | fail | fail (just) |
| yellow on white | 1.68 | fail | fail |
| yellow on paper | 1.57 | fail | fail |
| yellow on land | 1.36 | fail | fail |

Control boundary against the map (non-text 3:1). The boundary is the outermost visible edge:
| Edge vs map color | land #EFE7D6 | block #E9E0CC | bldg #E2D6BF | road #FBF7EE | park #CFE0B4 | water #B8CBDA |
|---|---|---|---|---|---|---|
| (A) navy 2px border | 9.51 | 8.91 | 8.14 | 10.94 | 8.34 | 7.02 |
| (B) navy filled bar | 9.51 | 8.91 | 8.14 | 10.94 | 8.34 | 7.02 |
| (C) #CFC0A3 border | 1.46 | 1.36 | 1.25 | 1.68 | 1.28 | 1.07 |
| (C) paper fill alone | 1.15 | 1.23 | 1.34 | 1.00 | 1.31 | 1.56 |
| white fill alone | 1.23 | 1.31 | 1.44 | 1.07 | 1.40 | 1.67 |
| MapLibre default ring (10% black over land → #D7D0C1) | 1.25 vs land | | | | | |

Possible stronger borders for a C-like paper card (computed):
| Border | land | block | bldg | road/paper | park | water |
|---|---|---|---|---|---|---|
| #A69C8B (existing-rail color) | 2.20 | 2.06 | 1.88 | 2.53 | 1.93 | 1.62 |
| #9A8F7B (small-label color) | 2.59 | 2.43 | 2.22 | 2.98 | 2.27 | 1.91 |
| #6F6656 (label color) | 4.60 | 4.31 | 3.94 | 5.29 | 4.04 | 3.39 |

Navy against the player's own map elements: navy vs running track #3E4651 = 1.23. Navy vs platform #A7BED4 = 6.11. Navy vs existing rail #A69C8B = 4.32.

### Inferences
- **A** passes 3:1 everywhere thanks to the navy border. The yellow "active" state can't be yellow-on-white (1.68). It needs a navy fill with a yellow mark, a yellow dot with a navy outline, or a thicker navy border.
- **B** passes everywhere and has the only built-in high-contrast active state (yellow on navy 6.98).
- **C** as specified fails 3:1 against every map color, and its fill matches the road color exactly (1.00). Under SC 1.4.11 that is allowed only if the control is identified some other way (icon, text, position). Visually it would melt into roads and blocks. To make C work, the border must be at least #6F6656 (3.39–5.29), which is no longer "thin and quiet", or the controls inside need navy fills or text.
- Over water (#B8CBDA), only navy edges and #6F6656 clear 3:1. Water is the worst case for any light-edged surface.

### Gaps
- These are flat-color calculations. Real perceptibility of a 1px vs 2px edge also depends on width, and WCAG ignores width. Antialiasing at subpixel widths lowers effective contrast further (not quantified here).

## 5. Large dark UI areas over a light map: glare, attention capture, "heaviness"?

### Takeaway
Evidence is indirect. Design references agree that dark, high-contrast areas carry the most visual weight and pull the eye. On a light map that means a large navy bar will be the heaviest thing on screen unless it is kept small. I found no study of glare or performance for dark HUD panels over light maps.

### Cited Findings
- Dark elements carry more visual weight than light ones. More value contrast with the background means more weight — [Smashing Magazine: Visual Weight and Direction](https://www.smashingmagazine.com/2014/12/12/design-principles-visual-weight-direction/).
- "Larger and darker objects generally draw the eye" on a light background, and ancillary elements should be more subtle — [Axis Maps: Visual Hierarchy](https://axismaps.com/guide/visual-hierarchy).
- Irradiation: bright shapes on a dark field look slightly larger and bolder. White text on navy will look heavier than navy text on white at the same font weight, so text inside B's navy bars may need a lighter weight or slightly more spacing — [nerdy.dev: adjust perceived typeface weight for dark mode](https://nerdy.dev/adjust-perceived-typepace-weight-for-dark-mode-without-layout-shift).
- Map products shrink chrome to give the map more room (Felt 2.0: smaller icons and dropdowns "to free up map space") — [Felt blog](https://felt.com/blog/ui-upgrades).

### Inferences
- A full-width or tall navy bar over a beige map would be the darkest, most contrasty mass on screen, darker even than the player's track (navy L 0.040 vs track L 0.060). By the cartographic rule it would outrank the network in the visual hierarchy. That inverts 레일맵's priority ("only what the player builds has color").
- A compromise in line with the evidence: keep dark fills small and meaningful, such as the date badge, the active or selected tool, or the primary action. Use light surfaces with crisp navy edges for containers and panels. This mirrors Carbon/M3 (tonal containers, filled emphasis for actions) and NN/g (filled, accent-colored primary actions; distinct treatment for interactive vs static).
- Concretely, a hybrid of A and B fits the evidence best. White panels with a navy border for figure–ground (they pass 3:1 everywhere and are low in mass). Idle buttons as white or light with navy icons and text. Selected or active states filled navy with a yellow mark (6.98:1). Keep controls visibly different from station-name bubbles through shape, size, radius and docked position. C's #CFC0A3 border is too weak (≤1.68:1) to use without a shadow.

### Gaps
- I found no empirical source on "glare" from dark UI panels over light maps, and no eyetracking study of dark vs light HUD over maps. The heaviness claims above rest on general design and cartography references, not controlled experiments.
- Mixed-polarity (light map with dark chrome) effects on eye adaptation: I found no source.
