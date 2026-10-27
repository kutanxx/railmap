# 지도 앱 UI 관례 조사 (레일맵 화면 UI 개선용)

조사일: 2026-10-27. 대상: 카카오맵, 네이버 지도, Google 지도, Apple 지도(웹 포함), MapLibre/Esri Calcite/Material·NN/g 가이드.
주의: 일부 출처는 검색 결과 요약으로만 확인했고 원문 전체를 읽지 못했다(각 항목에 표시). 카카오·네이버의 PC 웹 화면 배치에 대한 공식 문서는 거의 찾지 못했다(아래 Gaps).

## 1. 컨트롤 위치 (줌, 나침반, 레이어 토글, 내 위치, 축척, 출처 표기)

### Takeaway
레이어(지도 종류·대중교통·교통·지형) 버튼은 지도 앱마다 "구석에 버튼 하나 → 펼치면 목록" 구조로 통일돼 있다. Google 지도 데스크톱은 왼쪽 아래, 다음(카카오) 모바일은 오른쪽 위에 둔다. MapLibre 기본값은 모든 컨트롤이 네 구석 중 하나(기본 오른쪽 위)에 붙는 구조라, 레일맵도 "구석 하나에 성격이 같은 버튼끼리 묶기"가 사용자 기대와 맞는다.

### Cited Findings
- Google 지도 데스크톱: 지도 종류를 바꾸려면 "at the bottom left, click Layers" — 레이어 버튼은 왼쪽 아래. 레이어에 마우스를 올리고 More를 누르면 추가 레이어가 열린다 — [Google Maps Help: 지도 종류 바꾸기](https://support.google.com/maps/answer/3093389?hl=en&co=GENIE.Platform%3DDesktop)
- Google 레이어 목록 구성: 지도 종류(기본 지도/위성) + 추가 레이어(지형=등고선과 회색 고도 숫자, 교통=초록·주황·빨강, 대중교통=버스·지하철·철도 노선, 자전거, 스트리트뷰, 지구본, 대기질, 이동 시간, 산불). 데이터가 없는 지역에서는 일부 레이어가 회색으로 꺼진다 — [Google Maps Help 3093389](https://support.google.com/maps/answer/3093389?hl=en&co=GENIE.Platform%3DDesktop); [Google Maps Help 3092439](https://support.google.com/maps/answer/3092439?hl=en)
- 다음 지도(현 카카오맵) 2012년 개편: 모바일 앱 화면 오른쪽 위에 레이어 버튼을 새로 넣어 대중교통, 스토어뷰, 실시간 교통, CCTV 같은 정보를 지도 위에 띄우거나 지도 종류를 고르게 했다 (검색 요약으로 확인) — [카카오 보도자료: 다음 지도 PC·모바일앱 개편](https://www.kakaocorp.com/page/detail/7014)
- 카카오맵 PC 웹: 거리재기는 지도 오른쪽의 자 모양 버튼, 반경재기는 오른쪽의 원 모양 버튼(시작점 클릭 후 끌면 원이 그려짐). 면적·반경재기는 PC에서만 된다 (비공식 사용법 블로그, 검색 요약) — [specialmanual.com 카카오맵 거리재기](https://specialmanual.com/%EC%B9%B4%EC%B9%B4%EC%98%A4%EB%A7%B5-%EA%B1%B0%EB%A6%AC%EC%9E%AC%EA%B8%B0-%EB%B0%8F-%EB%A9%B4%EC%A0%81%EA%B3%BC-%EB%B0%98%EA%B2%BD-%EC%B8%A1%EC%A0%95-%EB%B0%A9%EB%B2%95-3%EA%B0%80%EC%A7%80/)
- MapLibre GL JS: `addControl()` 위치 값은 'top-left', 'top-right', 'bottom-left', 'bottom-right' 네 가지이고 기본은 'top-right' — [MapLibre Map API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)
- MapLibre 출처 표기(AttributionControl): `compact: true` 옵션으로 접을 수 있고, 문서상 "By default, the attribution control is expanded (regardless of map width)" — [MapLibre AttributionControl](https://maplibre.org/maplibre-gl-js/docs/API/classes/AttributionControl/)
- Apple MapKit 나침반: 누르면 북쪽이 위로 오게 지도를 다시 돌린다 — [Apple MapKit MapCompass](https://developer.apple.com/documentation/mapkit/mapcompass.md) (검색 요약)
- Apple MapKit 축척: 축척 막대는 줌에 따라 늘고 줄지만 틀은 고정되고, 기본적으로 앞쪽(왼쪽) 끝이 고정된다. 오른쪽 정렬 배치에서는 뒤쪽 끝에 붙이라고 권한다 — [Apple MapKit MapScaleView](https://developer.apple.com/tutorials/data/documentation/mapkit/mapscaleview.md) (검색 요약)
- Apple HIG(지도): 컨트롤이 지도에 묻히지 않도록 대비를 확보하라(얇은 테두리 등), 사람들은 익숙한 방식으로 줌·이동하길 기대하므로 지도를 가리는 비상호작용 요소를 피하라 — [Apple HIG Maps](https://developer-mdn.apple.com/design/human-interface-guidelines/technologies/maps) (검색 요약. 원문 페이지는 직접 읽기에 실패)
- Google Navigation SDK(참고): 나침반은 북쪽으로 돌아가면 사라지는(fade) 패턴 — [Google Navigation iOS SDK controls](https://developers.google.com/maps/documentation/navigation/ios-sdk/controls?authuser=6) (검색 요약)

### Inferences
- 레일맵의 [혼잡도 보기]·[지형]·[소리] 같은 "보기 켜고 끄기"는 지도 앱의 "레이어 버튼" 자리와 같은 성격이다. 사용자는 이것을 한 구석(대개 오른쪽 위 또는 왼쪽 아래)에 모아 둔 버튼 묶음으로 기대할 것이다. 많아지면 Google처럼 "버튼 하나 → 펼친 목록"으로 접는 방식이 맞다.
- 북쪽 고정 2D 탑뷰라면 나침반은 필요 없다. 회전을 허용하는 경우에만, 돌렸을 때만 보이는 나침반(Google·Apple 방식)이 관례다.
- OpenStreetMap 출처 표기는 오른쪽 아래가 MapLibre/카카오/Google 모두의 관습적 자리이고, 레일맵 아트 규칙(지우지 않기)과 맞다. 좁은 화면에서는 `compact: true`로 접을 수 있다(지우는 것이 아님).
- 축척 막대는 왼쪽 아래(Apple 기본: 앞쪽 끝 고정)가 자연스럽다. 레일맵은 공사비가 km 단위라 축척이 게임 정보로도 쓸모가 있다.

### Gaps
- Google 지도 데스크톱의 줌 버튼·내 위치·페그맨 위치(오른쪽 아래로 알려져 있음)를 공식 문서로 확인하지 못했다.
- 네이버 지도 PC 웹(map.naver.com) 오른쪽 세로 버튼 묶음(줌, 지도 종류, 거리재기 등)의 공식 설명을 찾지 못했다. 네이버 지도 API 컨트롤 문서 URL은 404였다.
- 카카오 지도 API의 ControlPosition·MapTypeControl·ZoomControl 문서는 페이지가 잘려 읽지 못했다(apis.map.kakao.com/web/documentation/).

## 2. 정보 보여주기: 사이드 패널 / 바텀 시트 / 떠 있는 카드, 패널 구조와 닫기, 겹치기

### Takeaway
요즘 지도 앱은 "지도는 항상 뒤에 살아 있고, 정보는 그 위에 얹는다"가 핵심 원칙이다. 모바일은 끌어서 높이를 바꾸는 바텀 시트(지도를 계속 만질 수 있는 비모달), 데스크톱은 왼쪽 사이드 패널이 표준이고, 장소 카드는 "큰 제목/사진 → 핵심 정보 → 자주 쓰는 동작 버튼" 순서다. 시트를 여러 겹 쌓는 것은 피하라는 것이 NN/g의 조언이다.

### Cited Findings
- Google 지도 2024–2025 시트 개편: 앱 요소를 전체 화면 대신 시트로 띄워 뒤의 지도가 열려 있게 했다. 완전히 펼쳐도 화면 위에 지도 한 줄("a sliver of the map")이 남는다. 반쯤 펼친 상태에서는 지도를 보며 스크롤할 수 있고, 시트를 줄이면 위쪽에 검색창이 보인다. 목적은 탭끼리의 일관성과 지도 맥락 유지 — [9to5Google 2025-01-21](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/)
- 같은 개편: 최소화한 시트는 둥근 모서리로 아래 탭 막대에 붙어, 검색창·필터·길찾기 버튼이 있는 지도 층이 그대로 보인다. Material Design 3를 따른다고 보도됨 — [9to5Google](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/); 관련 보도 [Android Authority](https://www.androidauthority.com/google-maps-sheets-3548003/) (검색 요약)
- Google 2014 Material 개편: 아래쪽 정보 시트를 누르면 사진·리뷰 층이 올라오는 구조를 도입 — [MacStories](https://www.macstories.net/linked/google-maps-for-ios-getting-new-material-design/); [MobileSyrup](https://mobilesyrup.com/2014/11/05/google-maps-for-android-and-ios-get-material-redesigned/) (검색 요약)
- NN/g: 바텀 시트는 "a form of progressive disclosure"(필요할 때만 더 보여주기)이며, 뒤 화면을 계속 보여주는 것이 가장 큰 장점이다. Google 지도는 목적지 정보를 보여주는 동안에도 지도를 이동·확대할 수 있는 비모달 시트의 예다 — [NN/g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)
- NN/g: 손잡이(grab handle)로 끌어 내리는 것만으로 닫게 하지 말고 위쪽에 보이는 닫기(X) 버튼을 두라. 뒤로 가기 버튼·제스처에도 반응해야 한다. 시트 위에 시트를 쌓지 말라(뒤로와 X를 헷갈림). 한 페이지 단위 흐름을 시트로 대신하지 말라 — [NN/g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)
- NN/g: "바텀 시트가 손이 닿기 쉽다"는 생각은 "largely incorrect" — 화면 가운데가 가장 누르기 쉽다 — [NN/g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)
- 카카오맵 장소상세 개편(5.18.0 이상): 예약·배달·영업시간 등 핵심 정보를 기본 영역에서 한눈에 보이게 하고, 주차장·주유소·역 같은 교통 장소의 정보 가시성을 높였다. 예약·배달·즐겨찾기·전화·길찾기 버튼을 접근하기 쉽게 배치하고 장소 사진을 크게 보여준다 (검색 요약) — [디지털투데이: 카카오맵 장소상세 UI·UX 개편](https://ditoday.com/?p=107652)
- Apple 지도 웹(2024년 7월 베타): 장소 카드에 사진, 영업시간, 평점·리뷰와 함께 카드에서 바로 실행하는 동작(음식 주문, 티켓 구매 등)이 있다 — [MacTrast](https://www.mactrast.com/2024/07/apple-maps-now-available-on-the-web-in-beta-form/); [iPhone in Canada](https://www.iphoneincanada.ca/2024/07/24/apple-maps-web-beta-available) (검색 요약)
- Apple 지도 웹은 사이드바를 Shift-S로 보이고 숨긴다(사이드바 + 지도 구조임을 시사) — [Apple Support: Maps on the web 키보드 단축키](https://support.apple.com/en-gb/126616)
- Esri Calcite: 앱 틀(shell) 안에 지도를 두고, 옆에 붙였다 접었다 하는 패널(shell panel)에 컨트롤·필터·범례를 넣는다. 패널은 시작/끝/위/아래에 둘 수 있다. 지도 튜토리얼은 지도 옆 패널에 세로 동작 막대(action bar: 레이어, 배경지도 등 아이콘)를 두고 누르면 해당 패널이 열리는 구조 — [ArcGIS: Creating app layouts](https://developers.arcgis.com/javascript/latest/creating-app-layouts/); [Calcite: Construct a mapping app](https://developers.arcgis.com/calcite-design-system/tutorials/construct-a-mapping-app-components/) (검색 요약)
- Calcite 2023년 5월: 패널 위쪽에 그 패널 내용에 맞는 동작 막대를 둘 수 있는 슬롯 추가 — [ArcGIS Blog: Calcite May 2023](https://www.esri.com/arcgis-blog/products/developers/developers/calcite-design-system-may-2023-update) (검색 요약)
- MapLibre 예제: 마우스를 올리면 뜨는 팝업은 닫기 버튼 없이(`closeButton: false`, `closeOnClick: false`) 만들고, 마우스가 떠나면 지운다 — [MapLibre: Display a popup on hover](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup-on-hover/)

### Inferences
- 레일맵의 역·선로 정보 패널(오른쪽 위)과 노선 패널(오른쪽)은 데스크톱 관례상 "한쪽 가장자리에 붙은 패널 하나"로 모으는 편이 익숙하다. 두 패널이 동시에 떠 있으면 NN/g가 경고한 "쌓인 시트" 문제와 비슷해진다. 하나의 패널 안에서 내용(역 → 노선)을 바꾸고 뒤로 버튼을 두는 방식이 대안이다.
- 역 카드 구조 제안(장소 카드 관례 적용): 제목(역 이름, 노선 색 점) → 핵심 숫자(하루 승객, 혼잡도, 주변 인구) → 동작 버튼 줄(이름 바꾸기, 옮기기, 노선에 넣기, 지우기). 카카오맵이 "핵심 정보를 기본 영역에서 한눈에"를 개편 방향으로 삼은 것과 같다.
- 닫기: 보이는 X 버튼 + Esc + 지도 빈 곳 클릭(레일맵은 이미 오른쪽 클릭 취소가 있음). 모달(뒤를 막는 창)은 파산 창처럼 꼭 필요한 곳에만.
- 마우스 올리기(hover)는 가벼운 미리보기(이름, 숫자 한두 개), 클릭은 고정 패널 — MapLibre 예제가 보여주는 구분과 같다.

### Gaps
- Material Design 3 바텀 시트 가이드 원문은 페이지가 스크립트로 그려져 읽지 못했다.
- 네이버 지도 앱의 장소/역 상세 시트 구조에 대한 공식 설명이나 디자인 글을 찾지 못했다.
- Apple 지도 웹의 사이드바 배치를 공식으로 설명한 글을 찾지 못했다(단축키만 확인).

## 3. 대중교통 화면: 노선 색, 역 정보, 환승역, 실제 지도 ↔ 노선도 전환

### Takeaway
Google은 대중교통을 "레이어"로 켜고 끄며 노선 색을 운영사 색에 맞춘다. 역 아이콘은 충분히 확대해야 나타난다. 한국에서는 카카오가 노선도를 별도 앱(카카오지하철)으로, 그것도 실제 역 위치를 바탕으로 직접 그린 노선도로 제공했고, 네이버는 지도 위에 실시간 열차 위치를 보여준다. 레일맵처럼 "실제 지도 위 노선 + 실시간 열차"는 네이버/카카오 사용자가 이미 아는 그림이다.

### Cited Findings
- Google: 가능하면 지도 위 노선 색은 운영사 색 체계를 따른다(뉴욕 A선은 MTA 색이라 파랑). 역 아이콘을 고르면 다음 열차·버스가 나온다 — [Google Maps Help 3092439](https://support.google.com/maps/answer/3092439?hl=en)
- Google 대중교통 레이어는 노선은 켜지만 역 아이콘은 충분히 확대해야 보인다는 사용자 비판이 있었다(오래된 글, 현재와 다를 수 있음) — [Greater Greater Washington: Google Maps loses transit icons](https://ggwash.org/view/31980/google-maps-loses-transit-icons)
- 2009년 Google 뉴욕 지하철 레이어도 확대하면 개별 역 아이콘이 드러나는 방식 — [Search Engine Watch 2009](https://www.searchenginewatch.com/2009/11/09/google-maps-adds-nyc-subway-system-layer-available-for-some-mobile-phones-too/?amp=1) (검색 요약)
- 카카오지하철(2016): 수도권·부산·대구·광주·대전의 실제 역 위치를 바탕으로 노선도를 직접 만들었고, 주요 랜드마크(회현역 근처 남대문, 여의도역 근처 63빌딩 등)를 노선도에 표시. 급행 노선도를 따로 볼 수 있고, 계단 앞에서 내리는 하차문, 출구별 주변 시설·버스 환승 정보를 준다 — [카카오 보도자료: 카카오지하철 출시](https://www.kakaocorp.com/page/detail/8064) (검색 요약); [스포츠경향 2016](https://sports.khan.co.kr/article/201606091239003)
- 네이버 지도: 2022년부터 수도권 지하철 실시간 도착 정보, 이후 실시간 열차 위치까지 제공, 2025년 5월 부산도시철도 1~4호선으로 확대. 증편·지연·운행 연장 같은 이례 상황도 실시간 안내 — [비즈워치 2025-05-08](https://news.bizwatch.co.kr/article/mobile/2025/05/08/0015); [네이버 보도자료](https://navercorp.com/media/pressReleasesDetail?seq=32500) (검색 요약)
- 네이버 지도 대중교통 길안내: 승하차 알림, 경로안내 막대, 내릴 때까지 남은 역 수, 열차 문 위치, 출구 번호 — [ITWorld](https://www.itworld.co.kr/article/3556335/) (검색 요약)
- 카카오맵 장소상세 개편에서 역은 "교통 장소"로 묶어 정보 가시성을 따로 높였다 — [디지털투데이](https://ditoday.com/?p=107652) (검색 요약)
- 카카오는 실시간 버스 위치를 지도 위에 움직이는 모습으로 보여주는 기능을 소개했다(10cm 단위, 1초 간격 갱신이라고 소개) — [카카오 2024-01 소개 글](https://www.kakaocorp.com/page/detail/10935?lang=ENG) (검색 요약)

### Inferences
- 레일맵의 "노선마다 색, 지도 위에 실시간 열차"는 네이버·카카오의 실시간 위치 화면과 같은 언어라 설명 없이 이해될 가능성이 높다.
- 확대 단계에 따라 "멀리서는 노선 선만, 가까이서 역 모양·이름" 순서로 드러내는 것이 Google 대중교통 레이어의 관례이고, 레일맵의 "가까이서 보이는 역 모양(stationBands)"과 같은 방향이다.
- 노선도(도식) 보기를 넣는다면 카카오지하철처럼 "실제 위치를 바탕으로 한 단순화 + 랜드마크 몇 개"가 실제 지도와 연결 고리를 남긴다. 다만 이는 새 기능이라 "다음에 할 만한 것" 후보.
- 출구 번호·하차문 같은 역 세부 정보는 카카오지하철의 핵심 기능이었고, 레일맵이 이미 노란 출구 번호 배지를 가진 점과 맞닿는다.

### Gaps
- 카카오맵/네이버 지도 앱 안에서 "지도 ↔ 지하철 노선도" 전환 버튼이 어디 있고 어떻게 작동하는지 공식 자료를 찾지 못했다.
- 환승역을 지도에서 어떻게 그리는지(흰 원+검은 테두리 등)에 대한 각 사의 공식 설명은 찾지 못했다.

## 4. 라벨·마커 밀도(줌별), 마우스 올리기 vs 클릭, 선택 강조

### Takeaway
지도 앱은 줌에 따라 보여줄 양을 조절하고(Apple HIG: 너무 많은 세부는 지도를 어지럽힌다), MapLibre는 이것을 레이어 minzoom/maxzoom과 라벨 충돌 규칙(symbol-sort-key로 우선순위)으로 해결한다. 마우스 올리기는 닫기 버튼 없는 가벼운 팝업 + 손가락 커서, 클릭은 고정 정보가 관례다.

### Cited Findings
- Apple HIG: 줌 단계에 맞게 세부를 조절하라. 세부가 너무 많으면 지도가 어지러워 보인다 — [Apple HIG Maps](https://developer-mdn.apple.com/design/human-interface-guidelines/technologies/maps) (검색 요약)
- MapLibre `minzoom`: 이보다 작은 줌에서 레이어가 숨는다. `maxzoom`: 이 값 이상에서 숨는다 — [MapLibre Style Spec: Layers](https://maplibre.org/maplibre-style-spec/layers/)
- MapLibre `symbol-sort-key`: 값이 낮은 것을 먼저 그리고 먼저 자리 잡는다. 겹침 허용이 꺼져 있으면 낮은 값이 우선권을 얻는다 — [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/layers/)
- MapLibre `icon-allow-overlap`(기본 false): true면 다른 기호와 부딪혀도 보인다. `icon-optional`: 아이콘이 부딪혀도 글자는 보이게 — [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/layers/)
- MapLibre `text-variable-anchor`: 여러 자리(위·아래·옆)를 차례로 시도해 "high-priority labels"가 놓일 확률을 높인다 — [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/layers/)
- MapLibre 마우스 올리기 예제: 레이어에 `mousemove`(마커가 겹칠 때도 갱신되게), 커서를 `pointer`로 바꾸고, `mouseleave`에서 커서를 되돌리고 팝업을 지운다 — [MapLibre: Display a popup on hover](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup-on-hover/)
- Google 대중교통 레이어: 역 아이콘은 확대해야 나타남(위 3번 참고) — [GGWash](https://ggwash.org/view/31980/google-maps-loses-transit-icons)

### Inferences
- 레일맵 역 이름 말풍선은 HTML이라 MapLibre 충돌 규칙을 그대로 못 쓴다(이미 겹침 피하기를 직접 구현함, 메모 참고). 우선순위 기준은 symbol-sort-key 생각과 같게 "환승역·승객 많은 역 먼저"가 자연스럽다.
- 줌 단계 3층 구조 제안: 멀리(노선 선 + 환승역만) → 중간(모든 역 점 + 큰 역 이름) → 가까이(승강장 띠, 출구, 모든 이름).
- 선택 강조: 선택한 역/노선만 진하게, 나머지는 흐리게 하는 방식은 아트 규칙(반투명 금지)과 부딪힐 수 있으므로, 흐리게 대신 "테두리 굵게 + 노란 강조 점(#F2C230)"으로 표시하는 편이 규칙에 맞다.

### Gaps
- Google·카카오·네이버가 줌별 라벨 밀도를 어떻게 정하는지 설명한 공식 디자인 글은 찾지 못했다.
- 선택 강조(선택한 노선 외 흐리게 등)에 대한 각 사의 공식 자료는 찾지 못했다.

## 5. 검색·명령 막대와 데스크톱 키보드

### Takeaway
Apple 지도 웹은 키보드만으로 지도·도구를 다룰 수 있게 정리된 단축키 표를 공식으로 낸다: 이동은 화살표, 줌은 +/-, 도구 패널은 Shift+글자, 지도 종류는 Option(Alt)+숫자. 레일맵의 숫자키 도구 전환과 같은 계열이다.

### Cited Findings
- Apple 지도 웹 단축키: Shift-S 사이드바, Shift-G 가이드, Shift-R 길찾기, Shift-K 둘러보기, Shift-F 검색; Option-1/2/3 표준/하이브리드/위성; +/- 줌; 화살표 이동; Option-좌/우 회전; Shift-Option-위 북쪽으로; Control-Option-L 내 위치; Option-P 지도 가운데에 핀. Windows에서는 Option 대신 Alt — [Apple Support 126616](https://support.apple.com/en-gb/126616)
- MapLibre/MapTiler에는 키보드 조작 담당(KeyboardHandler)이 있다 — [MapTiler SDK KeyboardHandler](https://docs.maptiler.com/sdk-js/api-reference/classes/KeyboardHandler/) (검색 결과 제목만 확인)
- Apple 지도 웹 베타는 2024년 7월 공개, 영어만, 맥·아이패드 Safari/Chrome과 Windows Chrome/Edge 지원. 출시 때 대중교통 길찾기와 둘러보기는 없었다 — [heise](https://heise.de/en/news/Apple-Maps-gets-its-own-website-for-certain-web-browsers-9812833.html); [MacTrast](https://www.mactrast.com/2024/07/apple-maps-now-available-on-the-web-in-beta-form/) (검색 요약)

### Inferences
- 레일맵 단축키 규칙 제안: 도구 = 숫자키(지금처럼), 보기 켜기/끄기 = Shift+글자(Apple 방식), 지도 이동 = 화살표, 줌 = +/-. 화면 어디선가 "?"로 단축키 목록을 보여주는 것은 이미 있는 도움말 카드와 맞다.
- 검색창(역·노선 이름 찾기)은 지도 앱의 가장 기본 요소지만 레일맵에는 아직 없다. 역이 50개쯤 되면 쓸모가 생기므로 "다음에 할 만한 것" 후보.

### Gaps
- Google 지도 웹의 공식 키보드 단축키 목록을 찾지 못했다.
- 카카오맵·네이버 지도 PC 웹의 단축키 자료는 찾지 못했다.

## 6. 좁은 화면 대응

### Takeaway
같은 앱이 넓은 화면에서는 옆에 붙은 패널(dock), 좁은 화면에서는 지도 위에 덮는 패널(overlay)이나 바텀 시트로 바뀐다. 버튼이 넘치면 "더보기" 메뉴로 접는다(Esri Calcite).

### Cited Findings
- Esri Calcite 적응형 예제: 좁은 화면에서 옆 패널의 표시 방식이 "dock"(옆에 붙어 지도를 줄임)에서 "overlay"(지도 위에 덮음)로 바뀌고, 열린 편집 패널은 닫힌다. 동작 막대는 공간이 줄면 넘치는 버튼을 동작 메뉴(Action Menu)로 옮긴다. 지도 여러 개 배치는 하나로 합친다 — [Calcite: App adaptive grid](https://developers.arcgis.com/calcite-design-system/sample-code/app-adaptive-grid/)
- 같은 예제: 상태 컨트롤은 동작 막대에 눈에 띄게, 저장·복제 같은 관리 동작은 가까이 두라고 안내 — [Calcite: App adaptive grid](https://developers.arcgis.com/calcite-design-system/sample-code/app-adaptive-grid/)
- Google 지도 모바일: 정보는 바텀 시트(최소/반/전체), 전체로 펼쳐도 지도 한 줄 남김 — [9to5Google](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/)
- 네이버 PC 메인(지도는 아님) 2023 개편은 화면 너비에 따라 단 수가 바뀌는 방식 — [designcompass](https://designcompass.org/2023/05/22/naver-home-renewal/) (검색 요약, 지도 앱 자료 아님)
- MapLibre 출처 표기는 `compact: true`로 접을 수 있다 — [MapLibre AttributionControl](https://maplibre.org/maplibre-gl-js/docs/API/classes/AttributionControl/)

### Inferences
- 레일맵 좁은 화면 규칙 제안: 오른쪽 패널들 → 아래쪽 시트 하나(반 높이 기본, 지도는 계속 조작 가능), 도구 막대 → 아이콘만, 넘치는 보기 버튼 → "더보기" 하나로 접기, 출처 표기 → compact.
- 데스크톱이 주 대상인 게임이므로 좁은 화면은 "보기·간단 조작"까지만 보장하는 것도 현실적인 선택이다.

### Gaps
- 카카오맵·네이버 지도 웹이 좁은 창에서 어떻게 바뀌는지에 대한 자료는 찾지 못했다.

## 7. 공개된 UX 연구·근거

### Takeaway
지도 회사가 직접 쓴 디자인 근거 글은 드물다. 찾은 것은 Google 시트 개편 보도(지도 맥락 유지와 일관성), 카카오맵 장소상세 개편(핵심 정보를 한눈에, 동작 버튼 가까이), Apple HIG(지도를 가리지 말고, 컨트롤 대비 확보, 줌별 세부 조절), NN/g(바텀 시트 사용법) 정도다.

### Cited Findings
- Google 2014: Material 개편 설명에서 층(layer)과 버튼을 살려 "어디를 눌러야 할지" 알게 하고, 현실을 닮은 면과 그림자를 썼다고 함 — [MacStories](https://www.macstories.net/linked/google-maps-for-ios-getting-new-material-design/) (검색 요약)
- Google 2024: 아래 탭 막대를 5개에서 3개로 줄이고 청록 강조색을 도입 — [9to5Google](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/)
- 카카오맵 장소상세 개편의 목표는 사용자 편의성과 사용성, 사진을 크게 배치해 가독성 향상 — [디지털투데이](https://ditoday.com/?p=107652) (검색 요약)
- Apple HIG: 지도를 상호작용 가능하게 유지, 컨트롤 대비 확보, 줌에 따라 세부 조절 — [Apple HIG Maps](https://developer-mdn.apple.com/design/human-interface-guidelines/technologies/maps) (검색 요약)
- NN/g 바텀 시트 가이드(위 2번) — [NN/g](https://www.nngroup.com/articles/bottom-sheet/)

### Inferences
- 레일맵 아트 규칙(그림자·그라데이션 금지)은 Google 2014 Material의 "그림자로 층 표현"과 다르다. 플랫한 화면에서는 층 구분을 테두리(남색 #1F3A55)와 배경 단계로 해야 하고, Apple HIG도 "얇은 테두리"를 대비 수단으로 든다.

### Gaps
- 카카오 테크 블로그, 네이버 D2/디자인 블로그에서 지도 화면 설계 근거를 다룬 글은 이번 조사에서 찾지 못했다.
- Mapbox의 지도 UI 디자인 가이드(컨트롤 배치 근거)는 확인하지 못했다.
