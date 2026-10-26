# 지도 서비스와 지도 스타일이 역·승강장·환승역을 그리는 방식 (map_services)

조사일: 2026-10-26. 기본 원칙: 출처 URL이 붙은 것만 사실로 적었다. 네이버·카카오·구글 지도의 실제 화면 모양(아이콘 모양, 색)은 공식 문서가 거의 없어서 "Gaps"에 따로 적었다. 이미지 확인은 하지 않았고, 스타일 파일(코드)과 문서 텍스트로 확인했다.

## 1. 줌 단계별로 역은 어떻게 보이나 (아이콘 → 라벨 → 역 영역 → 승강장 → 출입구)

### Takeaway
공개된 스타일 코드(OSM Carto, OpenRailwayMap-vector)는 모두 "줌아웃: 작은 기호(점·네모) → 중간 줌: 역 이름 라벨 + 역 영역(면) → 줌 15~16 이상: 실제 승강장 모양 → 줌 17~19: 승강장 번호·출입구 번호" 순서로 정보를 늘린다. 승강장은 "역 기호"가 아니라 실제 지도 데이터(OSM 폴리곤/선)를 그대로 그린 것이다.

### Cited Findings
**OSM Carto (openstreetmap.org 기본 지도)**
- `railway=station` 은 `square.svg` 네모 마커로 그린다. 색 `@station-color: #7981b0`(회보라). 일반 역: 줌12 폭 4, 줌13 폭 6, 줌15부터 폭 9. 지하철역은 한 단계 늦게(줌14 폭 6, 줌16 폭 9) 커진다. 라벨은 굵은 글꼴, 일반 역 줌14부터(크기 10), 줌15부터 크기 11; 지하철역 라벨은 줌15부터 — [openstreetmap-carto style/stations.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/stations.mss)
- 정차장(`railway=halt`)·트램 정류장은 더 작은 네모(폭 4→6), 트램은 줌14부터 — 같은 출처 [stations.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/stations.mss)
- 지하철 출입구(`railway=subway_entrance`): 줌18부터 `entrance.svg` 아이콘, 줌19부터 `ref`(출구 번호) 라벨, 크기 10, 10px 떨어뜨려 표시 — [stations.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/stations.mss)
- `railway=station` 이 면(area)으로 그려져 있으면 줌10부터 `@railway`(= `@industrial`, 공업지역 색) 로 칠한다 — [openstreetmap-carto style/landcover.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/landcover.mss)
- 승강장(`railway=platform`, `highway=platform`): **줌16부터만** 보인다. 면이면 `@platform-fill: #bbbbbb`(밝은 회색) 채우기 + 회색 2px 테두리(둥근 모서리). 선(가운데 줄 하나)으로 그려진 승강장은 회색 6px 바깥선 위에 #bbbbbb 4px 안쪽선, 끝이 둥근(round cap/join) 선 — [openstreetmap-carto style/roads.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/roads.mss)
- Carto 이슈 논의: 승강장 라벨은 역 이름 대신 승강장 번호(ref)로 바꾸자는 제안이 있었다 — 역 이름은 이미 역 객체에서 그리기 때문 — [Talk-GB 2022-08](https://lists.openstreetmap.org/pipermail/talk-gb/2022-August/029344.html)

**OpenRailwayMap-vector (2025년 발표된 MapLibre 기반 OpenRailwayMap 포크)**
- 스택: OSM → PostGIS → Martin 벡터 타일 → MapLibre GL JS 스타일. 즉 레일맵과 같은 MapLibre 방식 — [GitHub hiddewie/OpenRailwayMap-vector](https://github.com/hiddewie/OpenRailwayMap-vector); [OSM 포럼 발표](https://community.openstreetmap.org/t/openrailwaymap-vector-announcement/126995)
- 줌 4~12: 역은 `station-{크기}` 아이콘 + 라벨이며 역 중요도(노선 수 등)로 크기를 정한다(`station_size`, `get_station_importance.sql`) — [proxy/js/styles.mjs](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs); [import/sql 목록](https://github.com/hiddewie/OpenRailwayMap-vector/tree/master/import/sql)
- **줌13부터 "역 영역" 면**: 같은 이름의 역 시설을 400 m 안에서 묶고(DBSCAN 400), 역 노드 + 출입구 + 승강장의 볼록 껍질(convex hull)에 50 m 버퍼를 준 면을 만든다. 채우기 불투명도 0.2, 테두리 2px(불투명도 0.3). 색은 종류별(지하철/경전철/트램/본선) 또는 운영사 색 — [import/sql/stations_clustered.sql](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/import/sql/stations_clustered.sql); [styles.mjs `railway_grouped_stations`](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- **줌15부터 승강장**: 면 승강장은 `#aaa` 채우기 + 2px 같은 색 테두리(line-join round). 선 승강장은 폭을 줌에 따라 키운다: 줌15 2px → 줌18 6px → 줌20 10px. 줌17부터 승강장 가장자리(`railway=platform_edge`)를 3px 선으로, 승강장 번호 라벨도 줌17부터 — [styles.mjs `railway_platforms_*`](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- 범례는 줌에 따라 바뀐다(현재 줌에서 보이는 것만 표시) — [OpenRailwayMap Wikipedia](https://en.wikipedia.org/wiki/OpenRailwayMap); [OSM 포럼](https://community.openstreetmap.org/t/openrailwaymap-vector-announcement/126995)

**Apple Maps**
- 대중교통 모드에서는 노선을 강조하고, "주요 종점과 환승역(key terminus and transfer stations)을 강조", 도로는 흐리게 한다. 역 발자국(station footprints/outline)을 별도 데이터로 모으고 지도에 그린다 — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- 출입구를 하나하나 조사(계단/에스컬레이터/엘리베이터 종류 포함), 당시 16,000개 이상. 역 안에 적힌 출구 번호·코드를 지도에 그대로 표시(예: BART "E3") — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- "줌마다 보여주는 정보 밀도와 노선이 바뀐다" — 줌아웃하면 전체 노선망, 줌인하면 세부 — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- 2021년 3D 도시 보기(런던·LA·뉴욕·SF 등)는 도로 차선·횡단보도·랜드마크를 3D로 그린다고 발표했으나, 역 승강장 3D 묘사에 대한 언급은 없다 — [Apple Newsroom 2021-09](https://www.apple.com/newsroom/2021/09/apple-maps-introduces-new-ways-to-explore-major-cities-in-3d/)

**Google Maps**
- Transit 레이어는 버스·지하철·철도 노선을 보여주고, 역에는 운영 기관 로고(BART, Metro, London Underground 등) 아이콘을 쓴다 — [Google 지도 고객센터: 레이어](https://support.google.com/maps/answer/3092439?hl=en)
- 2009년 기사: 줌인해야 개별 역 아이콘이 나타나고, 역 이름을 누르면 그 역의 노선만 남고 다른 노선은 흐려진다 — [Search Engine Watch 2009](https://www.searchenginewatch.com/2009/11/09/google-maps-adds-nyc-subway-system-layer-available-for-some-mobile-phones-too/?amp=1); [Ubergizmo 2009](https://ubergizmo.com/2009/11/google-maps-support-subway-lines-now)
- 비판: 대부분의 줌에서 노선·역 이름이 부족하다(2016, TU Delft 블로그) — [Ken Arroyo Ohori 2016](https://3d.bk.tudelft.nl/ken/en/2016/07/27/the-awful-public-transport-layer-of-google-maps.html)

**Mapbox Streets v8 (타일셋 문서)**
- `transit_stop_label` 레이어: `stop_type` = `station` / `stop` / `entrance` (출입구를 따로 점으로 가짐), `mode` = rail, metro_rail, light_rail 등, `network` 값으로 도시별 아이콘(`london-underground`, `tokyo-metro`, `new-york-subway` 등). 한국 지하철 전용 network 값은 없음. `filterrank`로 줌별 라벨 밀도 조절 — [Mapbox Streets v8 문서](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/)
- 승강장은 별도 클래스가 없고 `road` 레이어의 `pedestrian` 클래스("public transportation platforms" 포함)에 섞여 있다 — [Mapbox Streets v8 문서](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/)

**OpenMapTiles 스키마 / Positron (레일맵이 쓰는 OpenFreeMap 기본 지도)**
- OpenMapTiles `transportation` 레이어의 subclass에 `platform`이 있다(public_transport 태그에서 옴). 역은 `poi` 레이어(class `railway`), 출입구는 class `entrance`. `brunnel` = bridge/tunnel/ford. `level`/`indoor`는 계단·보도에만 채워지는 실험 기능 — [OpenMapTiles schema](https://openmaptiles.org/schema/)
- 직접 확인: OpenFreeMap positron 스타일(`https://tiles.openfreemap.org/styles/positron`)과 openmaptiles positron-gl-style의 레이어 목록에는 역(poi station)·승강장 레이어가 **없다**. 철도는 `#dddddd` 3px 선 위에 `#fafafa` 점선(3,3), 일반 철도 줌13부터, 지하철·도시철도(`class=transit`)는 줌16부터이고 `brunnel=tunnel`(지하 구간)은 **제외**한다 — [OpenFreeMap positron style JSON](https://tiles.openfreemap.org/styles/positron); [positron-gl-style style.json](https://raw.githubusercontent.com/openmaptiles/positron-gl-style/master/style.json)

### Inferences
- "역 = 고정 크기 직사각형"은 실제 지도에는 없는 표현이다. 실제 지도는 줌아웃에서는 **화면 픽셀 크기가 일정한 아이콘**(Carto 네모 4~9px, ORM 크기별 아이콘), 줌인에서는 **실제 미터 크기의 승강장 모양**(데이터 그대로)으로 바뀐다. 레일맵의 현재 "줌아웃 = 작은 회전 아이콘" 단계는 이 관행과 맞다.
- 줌 경계로 참고할 숫자: 승강장 모양은 줌15(ORM)~16(Carto)부터, 승강장 번호·출입구 번호는 줌17~19부터.
- 레일맵 기본 지도(positron)에는 기존 역·승강장이 아예 그려지지 않으므로, 플레이어 역이 "실제 지도처럼" 보이려면 승강장 모양을 게임이 직접 만들어야 한다.

### Gaps
- 네이버 지도·카카오맵이 줌 단계별로 지하철역을 어떤 아이콘/모양으로 그리는지 설명한 공식 문서를 찾지 못했다(검색 결과는 길안내 기능 기사뿐).
- 구글 지도 현재(2026) 화면의 역 묘사 문서는 없다. 위 구글 내용 대부분은 2009~2016 자료.

## 2. 승강장은 어떻게 그리나 (선로 곡선 따르기, 섬식/상대식, 지하역)

### Takeaway
승강장은 OSM에서 "실제 둘레를 따라 그린 면"이 권장 방식이고, 렌더러는 그 면을 그대로 칠할 뿐이다. 그래서 곡선 역에서는 승강장도 저절로 휘어 보인다. 선 하나로 그린 승강장은 둥근 끝의 굵은 선으로 칠한다. 섬식/상대식은 별도 기호가 아니라 승강장 면이 선로 사이 1개인지, 선로 바깥 2개인지로 드러난다. 지하 노선·지하 역 구간은 일반 지도(positron)에서 숨긴다.

### Cited Findings
- `railway=platform`: 승강장 둘레를 따라 면으로 그리는 것이 "권장, 더 자세한 방식", 가운데 선 하나도 허용. 면이면 `area=yes` — [OSM Wiki Tag:railway=platform](https://wiki.openstreetmap.org/wiki/Tag:railway=platform)
- 승강장 가장자리(선로와 맞닿는 선)는 `railway=platform_edge`로 따로 그릴 수 있다 — [OSM Wiki Tag:railway=platform](https://wiki.openstreetmap.org/wiki/Tag:railway=platform); ORM-vector는 이것을 줌17부터 3px 선으로 그린다 — [styles.mjs](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- Carto/ORM 모두 승강장 선·테두리를 `line-join: round`, `line-cap: round`로 그린다(끝이 둥근 알약 모양) — [roads.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/roads.mss); [styles.mjs](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- 승강장 색은 무채색: Carto `#bbbbbb`, ORM `#aaa` — 같은 출처들
- Positron은 `brunnel=tunnel`인 도시철도 선을 필터로 제외한다(지하 구간 안 보임) — [positron-gl-style style.json](https://raw.githubusercontent.com/openmaptiles/positron-gl-style/master/style.json)
- Apple은 노선을 "실제 경로"대로 그린다(도식 노선도가 아님) — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)

### Inferences
- "선로를 따라 휘는 승강장"은 실제 지도에서 특별한 기법이 아니라 **선로 선을 따라가는 굵은 선(또는 그 선을 양쪽으로 offset한 면)**으로 만들어진다. 레일맵에서는 역 위치 전후 약 ±80 m 구간의 선로 좌표를 잘라(Turf `lineSliceAlong`) 그 선을 `line` 레이어로 굵게(미터 단위로 줌에 맞춰 `line-width` 보간) 그리면, 직사각형 회전 없이 곡선을 따르는 승강장이 된다. 끝은 `line-cap: round`로 둥글게(ORM/Carto와 같음). 이 방법은 데이터 하나에 레이어 하나라 역 50개에서도 가볍다.
- 상대식 승강장: 잘라낸 선로 선을 좌우로 offset(MapLibre `line-offset` 또는 Turf `lineOffset`)한 두 줄. 섬식: 선로를 두 줄로 벌리고 가운데 한 줄. 지금 게임은 선로가 한 줄이므로 상대식(양쪽 두 줄) 또는 "선로 위에 겹친 한 줄"이 가장 단순하다.
- 지하역을 "숨김/점선/투명"으로 그리는 공개 규칙은 이번 조사에서 확인하지 못했다(아래 Gaps). 일반 지도(positron)는 숨김을 택한다.

### Gaps
- OSM Carto의 지하(tunnel) 철도 렌더링 세부값(점선 여부)은 이번에 확인하지 않았다.
- 섬식/상대식 승강장을 지도 서비스가 기호로 구분한다는 자료는 찾지 못했다(데이터 모양으로만 구분되는 것으로 보임 — 추론).
- 네이버·카카오가 지하역 승강장을 지도에 그리는지(실내지도 제외) 확인 못 함.

## 3. 환승역은 어떻게 보이나

### Takeaway
공개 스타일에서 환승역은 "하나의 큰 기호"가 아니라 (1) 같은 이름 역들을 묶은 하나의 역 영역 + (2) 그 안에 노선별 승강장이 각자 따로 그려지는 방식이다. Apple은 환승역을 일반 역보다 강조한다. 서울 노선도(네이버 제공 포함)에서는 환승역에 노선 색과 번호를 함께 표기한다.

### Cited Findings
- ORM-vector는 이름이 같은 역 시설(역 노드·출입구·승강장)을 400 m 안에서 하나로 묶어 볼록 껍질 + 50 m 버퍼 면으로 그린다. 승강장은 묶지 않고 각자 그린다 — [stations_clustered.sql](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/import/sql/stations_clustered.sql); [styles.mjs](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- ORM 역 아이콘 크기는 역 중요도(노선 수 기반 importance 계산)로 정한다 — [import/sql/get_station_importance.sql 목록](https://github.com/hiddewie/OpenRailwayMap-vector/tree/master/import/sql); [styles.mjs `station_size`](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- Apple: 대중교통 지도에서 "주요 종점과 환승역을 강조" — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- 서울시·네이버 색각이상자용 노선도(2018): 2·4·7·9호선에 별도 색 테두리, 환승역에 노선 색과 노선 번호를 함께 표기, 네이버 지도 PC웹에서 제공 — [서울시 미디어허브](https://mediahub.seoul.go.kr/archives/917354)
- 2023년 서울 노선도 개편은 일반역과 환승역이 잘 구분되지 않던 문제를 고쳤다 — [서울시 미디어허브 2009054](https://mediahub.seoul.go.kr/archives/2009054)

### Inferences
- 레일맵의 "환승역 = 폭 1.8배 직사각형"보다, **노선(선로)마다 따로 휘는 승강장 + 그 묶음을 감싸는 옅은 역 영역(혹은 승강장들을 잇는 연결 통로 선)**이 실제 지도에 더 가깝다. 역 영역은 ORM처럼 "승강장들의 볼록 껍질 + 작은 버퍼"(Turf `convex` + `buffer`)로 만들 수 있다.
- 줌아웃 아이콘 단계에서는 환승역 아이콘을 더 크게 하거나(중요도), 노선 색 점 여러 개를 붙이는 방식이 서울 노선도·Apple 관행과 맞다.

### Gaps
- 네이버·카카오 지도 화면(노선도 화면 말고 일반 지도)의 환승역 아이콘 모양(여러 노선 색 원 묶음 등)에 대한 공식 자료를 찾지 못했다.

## 4. 역 주변 노선 색 사용 (노선 배지)

### Takeaway
구글·애플은 운영 기관 색 체계를 따르고, 역에는 기관 로고나 노선 색을 쓴다. 공개 OSM 스타일은 역에 노선 색을 쓰지 않고(Carto 회보라 단색), ORM만 종류별/운영사 색을 쓴다. 승강장 자체는 모든 공개 스타일에서 회색 무채색이다.

### Cited Findings
- 구글: 가능하면 지도 위 노선 색을 운영 기관 색 체계에 맞춘다(예: 뉴욕 A선 파랑) — [Google 지도 고객센터](https://support.google.com/maps/answer/3092439?hl=en)
- 구글 역 아이콘 = 기관 로고 — 같은 출처
- Apple: 뉴욕 MTA처럼 노선을 색 순서로 나열하는 관행을 따른다 — [WWDC 2016 세션 241](https://developer.apple.com/videos/play/wwdc2016/241/)
- Carto 역 = 단색 `#7981b0` — [stations.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/stations.mss)
- ORM 역 영역 = 종류별 색 또는 운영사 색, 불투명도 0.2 — [styles.mjs](https://raw.githubusercontent.com/hiddewie/OpenRailwayMap-vector/master/proxy/js/styles.mjs)
- Mapbox는 `network` 값으로 도시별 역 아이콘을 고르지만 한국 지하철 값은 없다 — [Mapbox Streets v8](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/)

### Inferences
- 레일맵 아트 규칙(배경 베이지, 플레이어 것만 색)과 맞추려면: 승강장 몸체는 지금처럼 #A7BED4/#1F3A55, **노선 색은 배지(라벨 말풍선 옆 작은 색 점/원)나 승강장 가장자리 얇은 줄**로만 넣는 것이 실제 지도 관행(승강장=무채색, 노선 정보=배지/아이콘)과 맞다.

### Gaps
- 네이버·카카오 일반 지도의 역 라벨 옆 노선 번호 색 배지(예: 원 안의 "2") 표기 규칙 공식 문서 없음. 서울 지하철 노선 공식 색 값도 이번 범위에서 출처를 확보하지 못했다.

## 5. 지하 / 고가 / 지상 구분

### Takeaway
공개 스타일에서 구분은 주로 선로 쪽(`brunnel`/`tunnel`/`bridge` 속성)에서 이루어지며, 일반 배경 지도는 지하 노선을 숨긴다. 역 자체를 지하/고가로 다르게 그리는 공개 규칙은 찾지 못했다.

### Cited Findings
- OpenMapTiles `brunnel` = bridge/tunnel/ford, Mapbox `structure` = bridge/tunnel/ford/none, 별도 `structure` 레이어는 줌13부터 — [OpenMapTiles schema](https://openmaptiles.org/schema/); [Mapbox Streets v8](https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/)
- Positron은 지하(tunnel) 도시철도 선을 그리지 않는다 — [positron-gl-style style.json](https://raw.githubusercontent.com/openmaptiles/positron-gl-style/master/style.json)
- Carto: 지하철(`railway=subway`) 선은 줌12부터 회색 #999 2px, 다리(bridge) 위에서는 줌14부터 다리 테두리를 그린다 — [roads.mss](https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/style/roads.mss)

### Inferences
- 게임에서 지하 구간/지하역을 표현하려면 흔한 방식은 "같은 모양을 연하게(불투명도 낮춤) 또는 점선 테두리". 다만 CLAUDE.md는 반투명 효과를 금지하므로, 반투명 대신 **연한 단색 채우기 + 점선 테두리**가 규칙에 맞는 선택이다(추론, 출처 없음).

### Gaps
- 네이버·카카오·구글·애플이 지하역과 고가역을 지도에서 다르게 그리는 방식에 대한 문서는 찾지 못했다. Apple 3D 도시 보기에서 고가 역사 3D 모델 여부도 확인 못 함.
