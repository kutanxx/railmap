# 실제 지도와 실제 데이터를 쓰는 교통 게임·도구 조사 (서울 배경 브라우저 게임 관점)

조사일: 2026-10-26. 도구 호출 약 20회. Subway Builder, NIMBY Rails, OpenFreeMap/OpenMapTiles, OSM 출처 표기, 한국 공공데이터(SGIS, 서울 열린데이터광장, 건물통합정보)는 1차 자료를 읽었다. Metro Dreamin', Mini Metro, Cities: Skylines 지도 임포터는 1차 자료를 거의 찾지 못했다 (각 Gaps 참고).

## 1. 지도 출처와 그리기 (OSM 벡터 타일, 자체 타일, 스타일, 성능 기법)

### Takeaway
실제 지도를 쓰는 교통 게임은 거의 다 OpenStreetMap(OSM)을 바탕으로 쓴다. Subway Builder는 도시마다 Mapbox식 벡터 타일(.mvt)을 따로 만들어 쓰고, NIMBY Rails는 OSM 원본 전체를 자체 타일 형식으로 미리 가공해 둔다. 레일맵처럼 공개 벡터 타일(OpenFreeMap, OpenMapTiles 스키마)에 스타일만 새로 입히는 방식이 가장 가볍다. 대신 타일에 들어 있는 정보만 쓸 수 있다.

### Cited Findings
- **Subway Builder**: 커스텀 도시 하나에 필요한 것은 벡터 타일(`.mvt`, tileserver-gl·PMTiles·자체 서버로 제공, `tilesUrl`·`foundationTilesUrl`·`maxZoom` 설정), 도로(`roads.geojson.gz`), 활주로(`runways_taxiways.geojson.gz`), 건물 인덱스, 수요 데이터다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- Subway Builder의 건물 인덱스는 이진 파일(`buildings-index.bin` 또는 `.bin.gz`)만 받는다. 문서는 메모리 부담 때문에 "JSON is not supported"라고 적었다. 건물마다 경계 상자, foundationDepth(지하 기초 깊이), 폴리곤, 선택 항목인 osmIds가 들어간다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- Subway Builder는 기본값으로 건물을 줌 12부터, 기초(foundation)를 줌 13부터 서서히 보여준다. 타일 레이어 이름이 다르면 `setLayerOverride`로 맞추고, 없는 레이어는 `setDefaultLayerVisibility`로 끈다 (예: `buildingFoundations`, `oceanFoundations`) — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- Subway Builder 모드 API에는 로컬 타일을 쓰는 `window.SubwayBuilderAPI.map.setTileURLOverride`가 있고, 최대 줌을 설정할 수 있다 — [Subway Builder Custom Cities API](https://www.subwaybuilder.com/docs/api-reference/cities)
- **NIMBY Rails**: Windows용 샌드박스 게임으로, 지구 어디에나 철도를 깔 수 있다. 도로·건물·장소(POI)는 OSM에서 가져오고, 문서가 공개되지 않은 자체 지도 형식을 쓴다 — [OSM Wiki: NIMBY Rails](https://wiki.openstreetmap.org/wiki/NIMBY_Rails)
- NIMBY Rails는 목표가 "세계 전체 지도를 20GB 이하로, 오프라인으로"였다. OSM PBF 덤프를 LMDB로 색인하는 데 RAM 1.4TB 인스턴스에서 약 8시간이 걸렸고(나중에 800GB로 줄임), 32코어·128GB RAM 서버와 수 TB 스왑으로 타일을 만들었다. "OSM에 있는 거의 모든 도로"를 담은 결과가 16GB였다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- NIMBY Rails의 압축 기법: 삼각분할을 게임 실행 중이 아니라 전처리 단계에서 하고, 좌표를 6비트로 양자화(quantization: 좌표를 정해진 간격의 칸에 맞춰 정밀도를 줄이는 것)한 뒤 델타 부호화(앞 점과의 차이만 저장)한다. 개발자는 이것이 "적도에서 최대 해상도 32cm"와 같다고 했다. 렌더러는 bgfx로 직접 만든 C++ 엔진이고, 선은 GPU 기본 선 대신 직접 짠 두께 있는 선 생성 코드로 바꿨다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- NIMBY Rails는 낮은 줌에서 OSM이 "지형도가 아니라서" 도로와 강만으로는 보기 좋지 않아, NASA 고도 래스터와 ESA GlobCover 토지이용 래스터를 저·중 줌에 깔고 높은 줌에서는 흐리게 사라지게 했다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- **OpenFreeMap**(레일맵이 쓰는 타일): 공개 인스턴스는 지도 조회·요청 수 제한이 없고, 가입·API 키·쿠키가 필요 없으며, 상업적 이용도 된다. 스키마는 OpenMapTiles를 "수정하지 않은" 그대로 쓰고, 스타일만 "fork 후 크게 수정"했다. 전 세계 데이터를 매주 내려받을 수 있다(Btrfs, MBTiles). 자체 호스팅도 가능하고, SLA(서비스 수준 보장)는 없다 — [OpenFreeMap](https://openfreemap.org/)
- OpenFreeMap 오프라인 다운로드 조건: 한 번에 타일 3,000개 또는 50MB 이하, 병렬 요청 4개 이하, 고유한 User-Agent. 이보다 크면 연락해야 한다 — [OpenFreeMap](https://openfreemap.org/)
- **OpenMapTiles 스키마**(OpenFreeMap이 따르는 형식): building 레이어 속성은 `render_height`, `render_min_height`, `colour`, `hide_3d`다. water는 낮은 줌에서 Natural Earth, 높은 줌에서 OSM 물 폴리곤을 쓰고, 그리기 성능을 위해 폴리곤을 작게 잘라 둔다. landuse 클래스에는 `railway`, `residential`, `commercial`, `industrial`, `retail`, `school`, `hospital` 등이 있다 — [OpenMapTiles Schema](https://openmaptiles.org/schema/)
- OpenMapTiles의 transportation 레이어에는 `rail` 클래스가 없고, 철도는 subclass(`rail`, `narrow_gauge`, `subway`, `light_rail`, `monorail`, `tram`, `funicular`, `platform` 등)로 구분된다 — [OpenMapTiles Schema](https://openmaptiles.org/schema/)

### Inferences
- 레일맵은 OpenFreeMap positron을 쓰므로 데이터 형식은 OpenMapTiles 스키마다. 그래서 landuse 클래스(`residential`, `commercial` 등)와 `render_height`(건물 높이)를 수요 계산에 쓸 수 있다. 다만 브라우저에서 타일을 읽어 계산하면 화면에 불러온 타일 범위와 줌에 따라 결과가 달라진다.
- Subway Builder와 NIMBY Rails는 모두 무거운 데이터 가공을 게임 밖에서 미리 해 둔다. 레일맵도 서울 한 도시만이라면 수요 데이터를 미리 계산한 작은 파일(GeoJSON이나 격자)로 만들어 두는 편이 실행 속도와 결과의 일관성 면에서 낫다.

### Gaps
- Metro Dreamin'이 Mapbox를 쓰는지, 어떤 타일과 스타일을 쓰는지 1차 자료를 찾지 못했다 (검색에는 지도 페이지만 나왔다).
- Mini Metro는 실제 도시를 추상화한 지도로 알려져 있지만, 이번 조사에서 출처를 확보하지 못했다.
- Subway Builder가 기본 도시용 타일을 무엇으로 만드는지(Planetiler, Protomaps 등)는 문서에 없다.

## 2. 인구·일자리 데이터와 추정 방법 (특히 한국 공개 데이터)

### Takeaway
Subway Builder는 인구조사(census)의 "사는 곳–일하는 곳" 자료와 중력 모델로 승객 수백만 명을 만든다. NIMBY Rails는 도로·건물 모양의 밀도로 인구를 대충 추정했고, 개발자 스스로 "아직 손볼 게 많다"고 했다. 서울에는 공식 자료로 SGIS 집계구·격자 인구, 국토부 건물통합정보(건축물대장 연계), 서울 지하철 역별 승하차 인원(공공누리 1유형)이 있다. 이 자료들은 OSM 건물 연면적으로 추정하는 레일맵의 현재 방식을 보정하거나 대체할 수 있다.

### Cited Findings
- **Subway Builder**: 집과 직장 위치를 담은 인구조사 자료로 통근자 수백만 명을 만들고, 거리 기반 중력 모델(distance-based gravity model)로 각자 직장을 정한다. 통근자는 시간, 비용, 시간 가치를 따져 교통수단을 고른다. 대학생과 공항 이용객(FAA 데이터)은 따로 다룬다 — [Steam: Subway Builder](https://store.steampowered.com/app/4039140/Subway_Builder/); [PC Gamer](https://www.pcgamer.com/games/city-builder/the-sleeper-hit-of-the-fall-might-be-this-mad-lads-hyper-realistic-traffic-management-sim-that-uses-real-census-data-and-a-distance-based-gravity-model-to-produce-millions-of-npc-commuters/)
- Subway Builder의 데이터 출처는 US Census, 미국 교육부, FAA, OpenStreetMap, 개발자의 Redistricter 데이터베이스다. 2026년 10월 현재 지도 56개(도시 55 + 샌드박스 1)이고, 미국·영국·프랑스·일본·뉴질랜드·스위스·아일랜드 7개국을 다룬다. 개발자는 Colin Miller(1인), 공개 베타 2025-10-09, 1.0 2026-02-10, Steam 출시 2026-07-17 — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Subway Builder 수요 데이터 형식: `points` 배열(id, location, jobs, residents, popIds)과 `pops` 배열(id, size, residenceId, jobId, drivingSeconds, drivingDistance, 선택 항목 drivingPath). 문서는 게임에 pop마다 `drivingSeconds`와 `drivingDistance`가 꼭 필요하다고 하고, OSRM(오픈소스 길찾기 엔진)으로 계산하라고 권한다. 길찾기에는 OSRM·Valhalla·GraphHopper, 원본 데이터는 Geofabrik·Overpass Turbo(OSM)를 소개한다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- **NIMBY Rails**: 인구를 "특정 도로 종류와 건물 모양의 꼭짓점 밀도"로 시험 삼아 추정했다. 역에는 영향권 반경이 있어 그 안의 인구를 "끌어오고", 그 인구가 여행 수요를 만든다. 개발자는 이 부분을 "아직 탐구하지 않은 영역이라 손볼 것이 많다"고 썼다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- OSM의 `population` 태그는 장소의 대략적인 인구일 뿐이고 자주 비어 있다. OSM 도움말은 관심 지역에 맞는 다른 출처의 인구 자료를 쓰라고 권한다 — [OSM Wiki: Key:population](https://wiki.openstreetmap.org/wiki/Key:population?uselang=it); [OSM Help](https://help.openstreetmap.org/questions/24623/how-to-get-population-data)
- **SGIS(통계지리정보서비스)**: 국가데이터처가 운영한다. 인구·가구·주택·사업체 센서스 자료를 위치 기반으로 제공하는 플랫폼이고, 포털 주소는 `sgis.mods.go.kr`로 바뀌었다 — [data.go.kr 15141768](https://www.data.go.kr/data/15141768/fileData.do)
- data.go.kr의 "국가데이터처_SGIS 격자 통계 및 경계_20250630": 전국 격자 통계(CSV)와 경계(shp, cpg, dbf, prj, shx)이고, 기간은 2024년, 이용허락범위는 "제한 없음", 무료다. 공공누리 유형은 페이지에 적혀 있지 않다 — [data.go.kr 15141768](https://www.data.go.kr/data/15141768/fileData.do)
- 집계구(행정동보다 작은 통계 단위) 2000~2024년 시계열 통계와 경계는 data.go.kr 파일에 들어 있지 않다. SGIS 포털 "자료제공" 메뉴에서 신청해야 받을 수 있다 — [data.go.kr 15141768](https://www.data.go.kr/data/15141768/fileData.do)
- SGIS 개발지원센터(SGIS OpenAPI)는 REST 형식 Data API를 제공한다 — [data.go.kr 15124020](https://data.go.kr/data/15124020/openapi.do) (검색 결과 요약으로 확인)
- **건물 데이터**: data.go.kr의 "국토교통부_GIS건물통합정보(WMS/WFS)"는 연속지적도 기반 건물 공간정보에 세움터 건축물대장 속성을 합친 자료이고, REST API로 json/xml을 돌려준다(shp 직접 다운로드가 아니라 API 중심) — [data.go.kr 15123970](https://www.data.go.kr/catalog/15123970/openapi.json) (검색 결과 요약으로 확인)
- 국토지리정보원 "통계지도_건물"은 격자 단위로 연면적, 건폐율, 용적률, 대지면적을 담고 있다. 내려받으려면 대용량 파일 전송 프로그램이 필요하다 — [data.go.kr 15062298](https://www.data.go.kr/catalog/15062298/fileData.json) (검색 결과 요약으로 확인)
- **지하철 승하차**: 서울 열린데이터광장 "서울시 지하철호선별 역별 승하차 인원 정보"(OA-12914)는 공공누리 1유형(출처 표시, 상업적 이용·변경 가능)이다. 원자료는 티머니이고, 환승객 여부와 관계없이 집계하며, 신분당선은 없다. 웹 시트로는 최근 한 달치만 보이고 전체는 CSV로 받는다 — [서울 열린데이터광장 OA-12914](https://data.seoul.go.kr/dataList/OA-12914/S/1/datasetView.do)
- 열린데이터광장에는 OA-12252라는 관련 지하철 통계 데이터셋도 있다(검색 결과에 나옴. 내용은 확인하지 않았다) — [서울 열린데이터광장 OA-12252](https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do)

### Inferences
- 레일맵의 현재 방식(500m 안 OSM 건물 연면적 × 0.1명/㎡)은 NIMBY Rails의 "지도 모양으로 인구 추정"과 같은 계열이다. Subway Builder 수준의 사실성을 원하면 SGIS 격자 인구(무료, 이용 제한 없음, CSV+shp)를 미리 가공해 역 반경 안 인구를 합산하는 방법이 가장 직접적인 대안이다. 일자리 쪽은 SGIS 사업체 통계나 국토지리정보원 격자 연면적을 쓸 수 있다.
- 지하철 승하차 통계(공공누리 1유형)는 게임 수요 모델이 실제와 얼마나 비슷한지 확인하는 "정답지"로 쓸 수 있다. 예를 들어 강남역·잠실역 같은 큰 역이 게임에서도 상위에 오르는지 비교하는 식이다.
- 이 데이터들은 모두 브라우저에서 바로 쓰기 어려운 형식(shp, 대용량 CSV, API 키가 필요한 API)이다. 개발 중에 Node 스크립트 등으로 미리 변환해 `src/data/`에 작은 GeoJSON이나 JSON으로 넣는 편이 현실적이다. 단, CLAUDE.md의 "실제 인구 통계 연동"은 "만들지 않을 것" 목록에 있으므로 주인 확인이 필요하다.

### Gaps
- SGIS 격자 인구의 격자 크기(100m, 500m, 1km 등)별 제공 범위, 서울 해상도, 공공누리 유형은 1차 페이지에서 확인하지 못했다.
- SGIS OpenAPI의 이용 약관(인증키 발급, 호출 제한, 출처 표기 문구)은 확인하지 못했다.
- 건물통합정보 shp에 연면적 필드가 있는지, V-World에서 어떻게 내려받는지는 확정하지 못했다.
- 서울 생활인구(통신사 기반) 같은 다른 자료는 조사하지 못했다.

## 3. 지형과 물 (터널·교량 판정, 공사비) — 레일맵은 데모 전까지 실제 고도 데이터 금지

### Takeaway
실제 지도 게임들은 물(강·바다)은 "지나갈 수 없는 곳 / 교량이나 터널이 필요한 곳"으로 거의 다 쓰지만, 고도는 장식이나 단순 판정에만 쓰거나 아예 쓰지 않기도 한다. Subway Builder는 고가·지상·여러 깊이의 터널을 고르게 하고 건물 기초 깊이를 데이터로 가진다. **레일맵은 CLAUDE.md "만들지 않을 것"에 "실제 지형 고도 데이터"가 있으므로, 고도 관련 내용은 데모 이후 참고용으로만 다뤄야 한다.**

### Cited Findings
- **Subway Builder**: 선로는 고가, 지상, 그리고 "여러 깊이"의 터널로 지을 수 있다. 공사비는 미국 밖의 마일당 건설비를 기준으로 했는데, 미국 비용은 "대체로 2~5배 높다". 해외 단가를 쓴 것이 "게임이 플레이 가능해지는 유일한 방법"이었다고 한다 — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Subway Builder 건물 데이터에는 `foundationDepth`(기초 깊이)가 있다. osmIds가 없는 건물은 철거 여부를 추적할 수 없어, 선로가 철거한 뒤에도 화면에 남는다. 바다 기초 레이어(`oceanFoundations`)를 따로 둔다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- **NIMBY Rails**: 고도는 NASA 타일, 토지이용은 ESA GlobCover에서 가져와 색과 간단한 음영으로 그렸다. 주로 보기 좋게 하려는 용도다. 바다 폴리곤은 OSM이 아닌 별도 shape 데이터에서 가져왔다. 선로 종류는 고가(viaduct), 지상, 트램, 터널·지하철이고, 지상 선로는 강을 건널 수 없다. 선로는 도로·다른 선로·지도 요소와 충돌 판정을 한다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- **Transport Fever 2**: 실제 지형은 회색조 높이맵(heightmap) 이미지를 맵 에디터로 불러오는 방식이다. terrain.party 같은 도구는 18km×18km(최대 60km) 정도만 만들어 큰 지도에는 부족하다는 의견이 있고, 맵 스크립트 모드들이 오래되어 충돌한다는 사용자 보고도 있다. TF1 포럼 기준으로 높이맵 크기는 (256의 배수)+1이어야 한다 — [Steam TF2 토론](https://steamcommunity.com/app/1066780/discussions/0/4635989156416290255); [Steam TF2 토론 2](https://steamcommunity.com/app/1066780/discussions/0/2262438048216035391); [Steam TF 토론](https://steamcommunity.com/app/446800/discussions/2/1736588252373355276) (사용자 게시물이라 신뢰도 낮음)
- OpenMapTiles water 레이어는 `river`, `lake`, `ocean`, `dock`, `pond` 등의 클래스가 있는 폴리곤이다 — [OpenMapTiles Schema](https://openmaptiles.org/schema/)

### Inferences
- 레일맵은 고도 데이터 없이도 "물 위를 지나면 교량, 아니면 지상"처럼 2단계로 판정할 수 있다. OpenMapTiles water 폴리곤(한강 등)과 선로가 겹치는지 Turf.js로 검사하면 된다. 이 방식은 NIMBY Rails의 "지상 선로는 강을 못 건넌다"와 같은 계열이고, 고도 데이터 금지 규칙에도 걸리지 않는다.
- "시가지 아래는 터널(비쌈)"도 고도 없이 landuse/건물 밀도로 판정할 수 있다. 실제 지형 데이터가 필요한 판정은 `reference/prototype-sollae.html`의 가상 지도 모드에서 다루는 편이 규칙에 맞다.
- 고도 데이터를 쓸 수 없더라도, 물·도로·건물 데이터는 타일에서 브라우저가 즉시 읽을 수 있다. 다만 타일은 줌별로 단순화되어 있어 판정 정확도가 줌에 따라 달라진다 (아래 6번 참고).

### Gaps
- Subway Builder가 물(강·바다)을 지날 때 비용이나 제약을 어떻게 다르게 매기는지는 확인하지 못했다.
- Cities: Skylines 1·2의 실제 도시 높이맵·OSM 임포터 관련 1차 자료는 이번 조사에서 확보하지 못했다.

## 4. 기존 실제 노선 (보여주는지, 경쟁하는지)

### Takeaway
이번 조사로는 실제 노선을 경쟁자로 시뮬레이션하는 게임을 1차 자료로 확인하지 못했다. 확인된 것은 Subway Builder 통근자가 대중교통과 자동차(운전 시간·거리) 사이에서 고른다는 것 정도이고, 기존 철도는 보통 배경 지도 선으로만 보인다.

### Cited Findings
- Subway Builder의 수요 데이터는 pop마다 운전 시간·거리(`drivingSeconds`, `drivingDistance`)를 꼭 요구한다. 통근자가 플레이어 노선과 자동차를 비교한다는 뜻이다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- Subway Builder 통근자는 시간·비용·시간대로 이동 방법을 고르고, 지연·운행 취소가 있으면 이용을 꺼린다. 환승을 피하는 경향이 알려진 문제로 적혀 있다(위키백과는 이 문장을 독자 연구로 표시) — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Wikipedia 페이지에는 실제 기존 노선이 지도에 나오는지 언급이 없다 — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- Metro Dreamin'은 사용자가 만든 공상 노선도마다 "Ridership" 숫자를 보여준다(예: 베이 에어리어 357M, 뉴욕 2.10B, 세계 철도망 지도 15.1B, 역 3,806개, 노선 228개, 7,097km). 숫자 옆에 "Where do these numbers come from?" 설명 링크가 있지만 내용은 확인하지 못했다 — [MetroDreamin 지도 예시](https://metrodreamin.com/view/bEpSakFqSE9xaE9lekVpSU1NSXdoMThrdFA3M3w2NA%3D%3D); [MetroDreamin 세계 지도](https://metrodreamin.com/edit/YndvWkhkQUE0WlE5ZEtGQ1hOeW9tSDFDb3pvMXww)
- OpenMapTiles 타일에는 기존 철도가 transportation 레이어의 subclass(`rail`, `subway`, `light_rail` 등)로 들어 있어, 스타일에서 따로 색을 칠하거나 숨길 수 있다 — [OpenMapTiles Schema](https://openmaptiles.org/schema/)

### Inferences
- 레일맵은 이미 기존 철도를 #A69C8B로 칠하고 점선 레이어는 숨긴다. 서울은 지하철 대부분이 지하라서 OSM에서 `subway` subclass로 따로 잡힌다. 지하철을 보이게 할지(경쟁 노선 인식) 숨길지(백지 상태)를 디자인으로 정해야 한다.
- 실제 노선과 경쟁하게 만들려면 기존 노선의 소요 시간을 중력 모델의 "대안 소요 시간"으로 넣어야 하는데, 이는 현재 범위를 넘는 기능이다. 대신 실제 승하차 통계를 비교용 정답지로 쓰는 것(2번)이 가볍다.

### Gaps
- NIMBY Rails, Metro Dreamin', Mini Metro가 실제 기존 노선을 어떻게 다루는지 1차 자료가 없다.
- Subway Builder가 기존 지하철(예: 뉴욕 지하철)을 지도에 보여주는지, 통근자가 그것을 이용하는지 확인하지 못했다.

## 5. 라이선스와 출처 표기 (OSM ODbL, 인구조사 자료, 타일 제공자)

### Takeaway
OSM 데이터로 그린 지도에는 "OpenStreetMap" 출처와 ODbL 라이선스를 알 수 있는 표기가 꼭 있어야 한다(게임은 스플래시 화면이나 크레딧도 허용). OpenFreeMap을 쓰면 "© OpenMapTiles"와 "Data from OpenStreetMap"이 필요하고, MapLibre가 자동으로 붙인다. OSM에서 건물 면적 등을 뽑아 별도 데이터 파일로 만들면 "파생 데이터베이스(Derivative Database)"가 될 수 있다. 한국 공공데이터는 공공누리 1유형(출처 표시만)이나 "이용허락범위 제한 없음"인 것이 많다.

### Cited Findings
- OSM 출처 표기는 "OpenStreetMap"이라는 이름과, 데이터가 ODbL(오픈 데이터베이스 라이선스)이라는 사실이 드러나야 한다. "OpenStreetMap"을 openstreetmap.org/copyright로 연결하는 방법이 있고, 직접 스타일을 입힌 지도는 "Map data from OpenStreetMap"처럼 써도 된다. 위치는 지도 모서리(전통적으로 오른쪽 아래)이고, 어느 모서리든 괜찮다 — [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)
- 표기는 닫기 버튼, 지도 조작(이동 등), 또는 5초 후에 접혀도 된다. 접힌 뒤에도 "(i)" 버튼이나 "About" 메뉴 등에서 라이선스 정보를 찾을 수 있어야 한다 — [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)
- 게임·시뮬레이션은 시작 스플래시 화면, 게임 화면, 플레이 중, 크레딧, 메뉴 등에 표기할 수 있다. 처음 표기가 간단하면 자세한 정보를 다른 적절한 곳에 둬야 하고, 스플래시 문구는 읽을 수 있을 만큼 오래 보여야 한다 — [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)
- 결과물(Produced Work, 예: 그린 지도)은 공개적으로 쓸 때만 표기 의무가 있다. OSM에서 상당 부분을 추출한 데이터셋(예: 학습용 건물 윤곽)은 파생 데이터베이스로 보고, 공개적으로 쓰면 ODbL로 제공해야 한다. "상당 부분(substantial)"의 기준은 별도 가이드라인을 따른다 — [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)
- OpenFreeMap: 출처 표기는 필수이고 MapLibre가 자동으로 넣는다. 다른 클라이언트·인쇄물·영상에서는 "© OpenMapTiles"와 "Data from OpenStreetMap"이 들어간 문구를 써야 한다. OpenFreeMap 이름 표기는 선택이다("nice if you do"). 프로젝트 자체는 MIT 라이선스다 — [OpenFreeMap](https://openfreemap.org/)
- 서울 지하철 승하차 통계(OA-12914)는 공공누리 1유형(출처 표시, 상업적 이용·변경 가능)이다 — [서울 열린데이터광장 OA-12914](https://data.seoul.go.kr/dataList/OA-12914/S/1/datasetView.do)
- SGIS 격자 통계 및 경계(data.go.kr)는 "이용허락범위 제한 없음", 무료다 — [data.go.kr 15141768](https://www.data.go.kr/data/15141768/fileData.do)
- NIMBY Rails 개발 회고에는 OSM·NASA·ESA 데이터의 라이선스나 출처 표기 언급이 없고, Subway Builder 커스텀 도시 문서에도 라이선스·출처 표기 안내가 없다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/); [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)

### Inferences
- 레일맵의 "오른쪽 아래 OSM 출처 표기를 지우지 않는다" 규칙은 OSMF 가이드라인과 OpenFreeMap 요구사항에 맞는다. 화면이 좁을 때 MapLibre의 접히는 출처 버튼(compact attribution)을 써도 가이드라인상 허용된다.
- 레일맵이 OSM 건물 연면적을 미리 계산해 역별 인구 파일로 저장해 배포하면, 그 파일이 ODbL 파생 데이터베이스가 될 수 있다. 그러면 그 파일도 ODbL로 공개해야 할 수 있다. 실행 중 브라우저에서 바로 계산하면 이 문제가 줄어든다. 확실한 판단은 OSMF의 Substantial Guideline 확인이 필요하다.
- SGIS나 서울시 자료를 쓰면 게임 안 크레딧이나 정보 패널에 "출처: 국가데이터처 SGIS", "출처: 서울 열린데이터광장"을 함께 적는 것이 안전하다.

### Gaps
- OSMF "Substantial Guideline"(얼마나 뽑아야 상당 부분인지)은 읽지 못했다.
- OpenFreeMap 전체 약관(/tos)은 직접 읽지 않았다.
- SGIS 집계구 자료를 신청할 때 붙는 이용 조건(재배포 금지 여부 등)은 확인하지 못했다.

## 6. 실제로 부딪힌 문제 (데이터 빈틈, 여러 도시, 로딩 시간, 정확성과 재미)

### Takeaway
가장 흔한 문제는 OSM 건물 데이터가 지역마다 고르지 않다는 점, 데이터가 크고 처리가 무겁다는 점, 그리고 지나친 사실성이 재미를 해친다는 점이다. 레일맵이 겪은 "도심 건물이 블록으로 합쳐져 개수 세기가 실패"한 문제는 OpenMapTiles가 줌 13에서 건물을 블록으로 묶어 단순화하는 처리와 맞아떨어진다.

### Cited Findings
- OpenMapTiles 3.12(2021년 1월)는 줌 13 건물 레이어를 바꿨다. 새 알고리즘은 "건물을 블록으로 묶은 다음 단순화한다". 이 글은 줌 14 이상에서 개별 건물이 나오는지는 밝히지 않는다 — [MapTiler: OpenMapTiles 3.12](https://www.maptiler.com/news/2021/01/openmaptiles-3-12-improved-city-centers/)
- uMap에서 쓰는 Positron 버전은 `building:part`(건물 일부를 나눠 그린 것)를 예측하기 어렵게 그린다는 OSM 커뮤니티 보고가 있다 — [OSM Community: building:part rendered unexpectedly](https://community.openstreetmap.org/t/building-part-rendered-unexpectedly/137007)
- NIMBY Rails: OSM의 "건물 윤곽은 제한적"이라 일부 도시는 일부만 있거나 아예 없다. 그래서 건물을 지도 데이터에서 빼고 나중에 절차적으로 만들기로 했다. 그 밖의 문제로 파일 크기 초과, 도형 그리기 속도, 큰 메모리 요구, OSM relation(여러 선을 묶은 도형) 처리의 "큰 골칫거리", 검색에서 드러난 지명 부족(지명을 약 10배 늘림)을 들었다 — [NIMBY Rails 개발 회고](https://carloscarrasco.com/nimby-rails-retrospective/)
- Subway Builder 커스텀 도시 팁: Electron `file://`과 gz 경로에서 `fetch()`가 깨지므로 `api.utils.loadCityData()`를 쓰고, 폴리곤 고리는 닫혀 있어야 하며, 태그 파일에는 태그가 있는 건물만 넣는다. 문서 예제가 `buildings_index.json.gz`를 쓰는데 본문은 JSON을 지원하지 않는다고 해서 서로 맞지 않는다 — [Subway Builder Custom Cities Guide](https://www.subwaybuilder.com/docs/guides/custom-cities)
- Subway Builder는 미국 실제 공사비를 쓰면 너무 비싸서 해외 단가를 썼다. 난이도는 도시마다 "Very Easy"(런던, 뉴욕, 파리, 도쿄)부터 "Very Hard"(댈러스, 디트로이트, 뉴올리언스, 피닉스, 세인트루이스)까지 다르다. 출시 뒤 Steam 평가는 엇갈렸다 — [Wikipedia: Subway Builder](https://en.wikipedia.org/wiki/Subway_Builder)
- OSM 객체 수와 인구 데이터의 상관관계를 본 OSM 메일링 리스트 글에서는 OSM 데이터가 인구나 소득과 그다지 상관이 없다는 지적이 나왔다 — [OSM-talk 2019-07](https://lists.openstreetmap.org/pipermail/talk/2019-July/082828.html)

### Inferences
- 레일맵의 "연면적 × 0.1명/㎡" 방식도 줌 13 이하 타일을 읽으면 합쳐진 블록 면적을 쓰게 되고, 높이(`render_height`)가 블록 단위로 뭉개지거나 사라질 수 있다. 인구를 계산할 때는 항상 줌 14 타일(OpenMapTiles 최대 상세 줌)을 기준으로 읽도록 고정하는 편이 결과가 흔들리지 않는다. 이 동작은 레일맵 코드에서 직접 확인해야 한다.
- 서울 OSM 건물 데이터는 구마다 입력 수준이 다를 수 있다(NIMBY Rails가 말한 지역 편차). 공식 자료(SGIS 격자 인구, 건물통합정보)로 보정하면 이 편차를 줄일 수 있다.
- Subway Builder 사례는 "실제 비용을 그대로 쓰면 재미가 없다"는 점을 보여준다. 레일맵도 `config.js`의 km당 비용을 실제 서울 지하철 공사비보다 게임 밸런스에 맞추는 것이 맞다.
- 여러 도시와 로딩 시간 문제는 레일맵의 현재 범위(서울 한 곳, 여러 도시 금지)에서는 크지 않다. 다만 큰 데이터를 미리 가공해 파일로 넣는다면 파일 크기(gzip 압축, 필요한 속성만 남기기)를 신경 써야 한다.

### Gaps
- OpenFreeMap positron 스타일이 building 레이어를 어떤 줌부터 그리는지, OpenFreeMap 타일의 최대 줌이 14인지는 1차 자료로 확인하지 못했다.
- 서울 OSM 건물 데이터의 완성도(구별 비율)를 잰 자료는 찾지 못했다.
- Mini Metro, Metro Dreamin', Cities: Skylines 지도 임포터가 겪은 문제는 자료가 없다.
- MapLibre 기반으로 실제 지도를 쓰는 다른 웹 게임 사례는 이번 조사에서 찾지 못했다.
