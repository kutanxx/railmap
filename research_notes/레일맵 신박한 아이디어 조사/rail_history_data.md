# 실제 철도 역사·공개 자료로 만드는 가벼운 도전과 장난감

(조사일 2026-11-01. 레일맵은 이미 OpenStreetMap에서 만든 "실제 노선망" 프리셋 12도시가 있다. 아래 "아이디어 씨앗"은 모두 실패 없이 해 볼 수 있는 선택 놀이로 적었다.)

## 1. 개통 역사: 도시마다 노선·역 개통 날짜 자료가 있나? "역사 순서대로 짓기"·"X년의 노선망"이 될까?

### Takeaway
서울은 공식 공공데이터에 **구간 단위 개통일**(1974-08-15 1호선 서울역~청량리부터 2024-08-10 8호선 암사역사공원역까지)이 CSV로 있고 공공누리 1유형이라 게임에 넣기 가장 쉽다. 일본은 국토교통성 국토수치정보 "철도 시계열(N05)"에 1950년부터의 개업 연도가 있고, 런던·뉴욕·파리·도쿄는 위키백과 목록과 Wikidata(CC0)의 "공식 개통일(P1619)"로 역 단위 날짜를 모을 수 있다. 다만 도시마다 형식이 달라 프리셋 만들 때(tools/make-presets.mjs) 미리 합쳐 두는 방식이 맞다.

### Cited Findings
- 서울교통공사 "지하철 개통 정보"(서울열린데이터광장 OA-13317): 운영기관·호선·구간·역 개수·연장·개통일자 항목, CSV 제공, 공공누리 1유형(출처표시, 상업 이용·변경 가능). 최신 파일 "개통 현황_20250813" — [서울열린데이터광장](https://data.seoul.go.kr/dataList/OA-13317/F/1/datasetView.do)
- 같은 자료의 data.go.kr 메타데이터: 1974-08-15 1호선 서울역~청량리 구간부터 2024-08-10 8호선 암사역사공원역까지 담김. 같은 호선도 구간마다 날짜가 달라 "구간 단위"로 봐야 함. 서울교통공사 운영 노선만이라 9호선 일부·신분당선·코레일 구간은 빠질 수 있음 — [data.go.kr 15044439](https://www.data.go.kr/dcat/metadata/15044439)
- 서울 1호선 첫 개통: 1974년 8월 15일 서울역~청량리 9개 역, 7.8km. 1980년대 4개 노선 106개 역 → 2000년대 9개 노선 338개 역 → 2023년 기준 23개 노선 624개 역 — [SBS Biz](https://biz.sbs.co.kr/amp/article/10000626180)
- 일본 국토수치정보 "철도 시계열 데이터(N05)": 전국 철도 노선·역을 1950년도부터 자료 작성 연도까지 시계열로. 지물마다 "공용 개시 연도"와 "설치 기간" 속성이 있다 — [N05 제품 사양서 2.1판](https://nlftp.mlit.go.jp/ksj/gml/product_spec/KS-PS-N05-v2_1.pdf); [시계열 데이터 이용법](https://Nlftp.Mlit.Go.Jp/ksj/gml/codelist/transition_use.pdf)
- N05 GeoJSON에서 설치 기간 시작·끝은 N05_005b·N05_005e 속성이고 문자열이라 숫자로 바꿔야 함 — [Qiita](https://qiita.com/syanseto/items/39fe2b52b6366c1b511c)
- 도쿄 긴자선 첫 구간 우에노~아사쿠사 1927년 12월 30일 개통(도쿄메트로 공식 연혁과 위키백과 일치). 1934년 신바시까지, 1939년 완성. "긴자선"이라는 이름은 1950년대 마루노우치선 개통 즈음에 붙음 — [Tokyo Metro 연혁](https://www.tokyometro.jp/lang_en/corporate/profile/history/index.html); [Wikipedia Ginza Line](https://en.wikipedia.org/wiki/Ginza_Line); [Old Tokyo](https://www.oldtokyo.com/opening-of-the-chikatetsu-tokyo-underground-railway-co-december-1927/)
- 뉴욕 첫 지하철 IRT: 1904년 10월 27일 시청(City Hall)~145번가, 28개 역, 약 9.1마일. 157번가는 1904년 11월 12일 개통 — [Wikipedia IRT](https://en.wikipedia.org/wiki/Interborough_Rapid_Transit_Company); [145th Street station](https://en.wikipedia.org/wiki/145th_Street_station_(IRT_Broadway%E2%80%93Seventh_Avenue_Line))
- 파리 메트로 1호선: 1900년 7월 19일 Porte Maillot~Porte de Vincennes, 계획한 18개 역 중 8개만 열고 나머지 10개는 8월 6일~9월 1일 사이 차례로 개통. 1934년 3월 24일 Château de Vincennes 연장 — [Wikipedia Paris Métro Line 1](https://en.wikipedia.org/wiki/Paris_M%C3%A9tro_Line_1); [RATP 1호선 역사](https://www.ratp.fr/decouvrir/patrimoine/histoire-metro-ligne-1)
- 위키백과 "List of London Underground stations" 표에 "Opened" 열이 있고 272개 역. Baker Street·Farringdon·Euston Square·Edgware Road는 1863-01-10 (메트로폴리탄 철도) — [Wikipedia](https://en.wikipedia.org/wiki/List_of_London_Underground_stations)
- Wikidata P1619 "date of official opening": 장소·조직·행사가 공식으로 열린 날짜, 자료형 "시점", start time의 하위 속성. Wikidata 구조 자료는 CC0, 다른 글은 CC BY-SA 4.0 — [Wikidata P1619](https://www.wikidata.org/wiki/Property:P1619)
- 노선망 성장 애니메이션 선례: Geoff Marshall의 1863년부터 튜브 노선도 변천 3D 애니메이션 타임라인 — [Londonist 2015](https://londonist.com/2015/06/watch-this-3d-animated-timeline-of-how-the-tube-map-developed); 2008년까지 전체 노선망을 애니메이션으로 보인 영상 모음 — [kottke 2011](https://www.kottke.org/11/08/evolution-of-the-london-underground-map); 전시 "Mapping the Tube: 1863–2024" — [The Map House](https://www.themaphouse.com/exhibitions/57-mapping-the-tube-1863-2024/)
- OpenHistoricalMap(OHM)은 철도에 start_date·end_date를 단다 (예: 브뤼셀 지하철 관계 railway=subway, start_date 1976-09-16). 불확실한 날짜는 start_date:edtf, 출처·신뢰도는 start_date:source·start_date:confidence. 일부는 1900-01-01 같은 임시 날짜가 섞여 있다고 편집자가 표시함 — [OHM relation 2700547](https://www.openhistoricalmap.org/relation/2700547/history/5); [OHM way 198311965](https://api.openhistoricalmap.org/way/198311965); [OHM way 200493904](https://api.openhistoricalmap.org/way/200493904/history/1); [OSM wiki: OHM 뷔르템베르크 철도 프로젝트](https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Projects/Railroads_in_W%C3%BCrttemberg)

### Inferences
- **아이디어 "타임머신 슬라이더"(장난감)**: 실제 노선망 프리셋의 선로·역에 개통 연도를 붙여 두고(프리셋 만들 때 Wikidata·서울 CSV·N05로), [노선도]나 지도에 연도 막대를 두어 1974→2024로 끌면 노선이 하나씩 생긴다. 실패 없음, 보는 재미. 열차도 그 해 노선만 달리게 하면 "1985년 서울을 달려 보기"가 된다.
- **아이디어 "역사 따라 짓기"(가벼운 도전)**: 빈 지도에 "1974년: 서울역~청량리를 이어 보세요"처럼 실제 개통 순서대로 한 구간씩 과제를 준다. 정답 선과 겹치는 정도(예: 역이 실제 역 300m 안)만 보고 "실제와 82% 비슷해요"라고 칭찬만 한다. 서울은 구간 단위 자료가 있어 가장 먼저 만들기 쉽다.
- **아이디어 "X년의 노선망으로 시작"**: [실제 노선망으로 시작] 옆에 "1990년 서울", "1933년 런던"처럼 연도 프리셋을 고르게 한다. 이미 있는 프리셋에서 연도 이후 것을 빼기만 하면 되므로 새 자료 구조가 거의 없다. 다만 옛 노선은 지금 노선과 이름·갈래가 다를 수 있어(긴자선 이름이 나중에 붙음) 정확도는 "대략"이라고 밝혀야 한다.
- **"오늘의 개통 기념일"**: 날짜 배지가 실제 개통일과 같은 달이면 알림 말풍선("1974년 오늘 1호선이 열렸어요")을 한 번 띄운다. 게임 날짜가 2026년부터 흐르므로 달·일만 맞춰도 된다.
- N05는 1950년 이후만 다루므로 긴자선(1927) 같은 전쟁 전 구간은 "1950년에 이미 있음"으로만 보인다. 일본 전쟁 전 날짜는 Wikidata·위키백과로 메워야 한다.

### Gaps
- 지금 OpenStreetMap(OHM 말고)의 각 도시 지하철 역·노선 관계에 start_date가 얼마나 채워져 있는지는 확인하지 못했다. 실제로 Overpass로 세어 봐야 한다.
- Wikidata에서 12개 도시 역마다 P1619가 얼마나 채워졌는지(커버리지)는 확인하지 못했다. 역 항목이 P571(시작 시점)이나 다른 속성을 쓰는 경우도 있을 수 있다.
- 부산·인천·대구·대전·광주의 구간별 개통일 공공데이터(각 도시교통공사)는 따로 찾지 못했다. 위키백과 한국어판 노선 문서 표로는 가능할 것으로 보이나 미확인.
- 국토수치정보 N05의 정확한 이용 약관(재배포·출처 표기 방식)은 이번 검색 결과에 없었다. 국토교통성 자료는 "무상 제공"이라고만 확인 — [국토교통성](https://www1.mlit.go.jp/report/press/content/001746231.pdf).
- 서울 1974~2024 노선 변천 유튜브 애니메이션은 검색으로 찾지 못했다(없다는 뜻은 아님).
- 뉴욕·파리·시카고·오사카의 역별 개통일 목록이 위키백과 표에 열로 있는지는 런던만 직접 확인했다.

## 2. 안 지은 노선·계획 노선: 자료가 있나? "만약에" 도전이 될까?

### Takeaway
뉴욕 1929년 "IND 2차 시스템", 런던 크로스레일 2, 파리 그랑 파리 익스프레스(GPE), 도쿄 유라쿠초선·난보쿠선 연장, 서울 강북횡단선·서부선·위례신사선처럼 이야깃거리가 많은 미완성·계획 노선이 도시마다 있다. 다만 바로 쓸 수 있는 공개 선 자료(GeoJSON)는 드물고, 파리 GPE는 오히려 "재배포 권리가 SGP에 있어 공개 못 한다"고 적혀 있다. 그래서 게임에는 정밀한 선 대신 **역 몇 개의 대략 자리 + 설명 한 줄**만 넣는 "만약에 카드"가 현실적이다.

### Cited Findings
- 뉴욕 IND 2차 시스템(1929): 약 100마일의 새 선로로 모든 보로를 잇겠다는 계획. 2번가 지하철, 사우스 4번가 지하철, 유티카 애비뉴선이 핵심. 1929년 가을 발표 몇 주 뒤 주식 대폭락으로 돈줄이 끊김. 발표일은 출처마다 1929-08-23 / 1929-09-16으로 엇갈림 — [Joseph Brennan, Columbia](https://www.columbia.edu/~brennan/abandoned/indsecsys.html); [Second Avenue Sagas](https://secondavenuesagas.com/2008/09/19/dreaming-of-the-second-system-where-the-subways-should-go); [nycsubway.org 1929 Plan](https://www.nycsubway.org/wiki/IND_Second_System_-_1929_Plan)
- 1929년 교통위원회 지도는 안 지은 노선을 굵은 검정으로 그렸고, Vanshnookenraggen 블로그는 1929년부터 지금까지 모든 공식 확장안을 지금 노선 색으로 그린 선로 지도를 만듦 — [Vanshnookenraggen IND Second System Track Map](https://www.vanshnookenraggen.com/_index/?p=3803); [1943년 계획](https://www.vanshnookenraggen.com/_index/?p=4828)
- 위키백과에 "2번가 지하철의 안 지은 계획들", "뉴욕 지하철 확장 제안" 문서가 따로 있음 — [Unbuilt plans for the Second Avenue Subway](https://en.wikipedia.org/wiki/Unbuilt_plans_for_the_Second_Avenue_Subway); [Proposed expansion of the NYC Subway](https://en.wikipedia.org/wiki/Proposed_expansion_of_the_New_York_City_Subway)
- 런던 크로스레일 2: 2020-11-01 코로나 긴급 지원(18억 파운드) 조건으로 보류. 2015년 협의 노선은 서리~윔블던~발햄~클래펌 정크션~킹스로드(첼시)~빅토리아~토트넘 코트 로드~유스턴/세인트판크라스, 북동쪽은 토트넘 헤일·뉴사우스게이트. 노선 보호(safeguarding)는 1991년 처음. 2024년 9월에도 보호 연장 논의 중 — [Wikipedia Crossrail 2](https://en.wikipedia.org/wiki/Crossrail_2); [Fitzrovia News 2024](https://fitzrovianews.com/2024/09/04/dft-and-tfl-had-summer-talks-about-crossrail-2-future/); [Rail Magazine 2024](https://www.railmagazine.com/news/2024/09/05/crossrail-2-route-still-to-be-safeguarded); [TfL 2015 보도자료](https://tfl.gov.uk/info-for/media/press-releases/2015/march/major-step-forward-for-crossrail-2)
- 파리: IDFM의 "일드프랑스 계획 노선" 자료(data.gouv.fr, JSON 있음)는 그랑 파리 익스프레스 노선 GIS 자료를 SGP가 만들고 배포 권리를 가져 IDFM이 올릴 수 없다고 적음. SGP의 "15호선 남부 노선·역 위치"(2017, KML·ZIP)는 라이선스 "미지정", 참고용이며 바뀔 수 있다고 적힘 — [data.gouv.fr 계획 노선](https://www.data.gouv.fr/datasets/lignes-de-transport-en-projet-en-ile-de-france); [PRIM](https://prim.iledefrance-mobilites.fr/en/jeux-de-donnees/projets_lignes_idf); [15호선 남부](https://www.data.gouv.fr/datasets/ligne-15-sud-trace-et-localisation-des-gares/informations)
- 도쿄: 유라쿠초선 도요스~스미요시 약 4.8km(새 역 2개), 난보쿠선 시로카네타카나와~시나가와 2.5km(주오 신칸센 자기부상 시나가와 종점과 연결). 2022년 국토교통성 허가, 2030년대 중반 개업 목표. 허가 날짜는 출처마다 2022-01-28 / 2022-03으로 엇갈림 — [Railway Gazette](https://www.railwaygazette.com/metro/tokyo-metro-extensions-approved/60920.article); [Japan Property Central](https://japanpropertycentral.com/2022/01/yurakucho-and-namboku-subway-lines-to-see-extension-by-2030s); [International Railway Journal](https://www.railjournal.com/passenger/metros/tokyo-metro-receives-approval-for-yurakucho-and-namboku-line-extensions/)
- 도쿄 도심~임해 신선(도쿄 임해 지하철) 계획, 2040년대 개업을 바라봄 — [Wikipedia Tokyo Rinkai Subway Line](https://en.wikipedia.org/wiki/Tokyo_Rinkai_Subway_Line); [Asia News Network](https://asianews.network/?p=73693)
- 서울: 2026년 6월 서울시가 강북횡단선(목동역~청량리역, 25.79km로 가장 김)·난곡선 등 6개 철도에 9.2조 원 추진 발표. 강북횡단선은 사업성이 낮아 재정사업으로, 정거장 2개를 줄일 계획. 서부선은 남부 연장으로 여의도·서울대 정문 앞 환승. 위례신사선은 민자사업 — [서울신문 2026-06-11](https://m.go.seoul.co.kr/news/2026/06/11/20260611018008); [서울시 내 손안에 서울](https://mediahub.seoul.go.kr/archives/2018271)
- 제5차 국가철도망 구축계획(2026~2035) 발표 시점은 기사마다 다름(2026년 1월 전망 / 7월께 예정) — [한국경제 2026-01](https://www.hankyung.com/article/202601289333i); [전북일보 2025-10](https://jjan.kr/article/20251015580314)

### Inferences
- **아이디어 "만약에 카드"(도전)**: 도시마다 카드 1~3장. "1929년 뉴욕은 2번가 지하철을 계획했지만 대공황으로 멈췄어요. 직접 지어 볼까요?" → 지도에 계획 역 자리를 회색 점(레일맵의 "계획 선로" 주황 점선과 같은 말투)으로 놓아 주고, 지으면 "1929년의 꿈을 이뤘어요" 말풍선. 실패 없음. 레일맵에는 이미 계획 선로(돈 안 드는 점선)가 있어 "역사 속 계획 선로를 미리 깔아 둔 샌드박스"로 만들면 새 기능이 적다.
- **아이디어 "미래 노선 미리 타기"**: 서울 GTX(레일맵은 이미 광역급행 GTX-A·B·C 이름이 있음), 강북횡단선, 도쿄 난보쿠선 시나가와 연장, 크로스레일 2를 "미래" 묶음으로. 개통 전이라 "뉴스 기준 대략 자리"라고 적는다.
- 자료는 정밀 선 대신 **역 이름 + 대략 좌표 몇 개**만 손으로 적는 편이 라이선스·정확도 둘 다 안전하다(GPE 선 자료는 재배포 권리가 막혀 있음). 역 좌표 몇 개와 사실(날짜·이름)은 저작권 대상이 아닌 경우가 많지만, 남의 지도를 그대로 따라 그리면 안 된다.

### Gaps
- 서울 GTX 계획 노선·역의 공개 GIS 자료는 찾지 못했다.
- 크로스레일 2 보호 구역 도면의 공개 형식(GIS인지 PDF뿐인지)과 라이선스는 확인 못 함.
- 부산·대구·대전·광주·인천·오사카·시카고·파리(GPE 말고)의 유명한 "안 지은 노선"은 조사하지 못했다.
- 제5차 국가철도망 계획의 최종 고시 여부는 확인되지 않았다(2026-11 기준 출처 엇갈림).

## 3. 옛 공식 노선도(벡 1933, 비녤리 1972, 옛 서울 노선도)와 팬들의 옛·새 비교

### Takeaway
런던 해리 벡(1933)과 뉴욕 마시모 비녤리(1972)는 "지도가 아니라 도식"의 대표 사례이고, 둘 다 45도 선·고른 역 간격 같은 규칙이 분명해 레일맵의 [노선도] 보기(이미 가로·세로·45도만 쓴다)와 잘 맞는다. 서울도 2023년 새 노선도 디자인을 발표해 "옛 노선도 vs 새 노선도" 이야기가 있다.

### Cited Findings
- 벡은 신호부 기술자 출신으로, 전기 회로도처럼 역을 고르게 늘어놓는 도식을 만듦. 1932년 시험판 500부 → 1933년 정식 70만 부. 1933년 1월 주머니판이 첫 판이고 환승역은 마름모. 45도 선이 특징. 1935년 베이커루·센트럴선 색 바뀜, 1960년 해럴드 허친슨이 크게 바꿈. 지금도 노선도에 "1931년 해리 벡이 구상한 원래 디자인의 발전형"이라고 적힌다 — [Wikipedia Harry Beck](https://en.wikipedia.org/wiki/Harry_Beck); [London Transport Museum 1933 주머니판](https://www.ltmuseum.co.uk/collections/collections-online/maps/item/1991-248); [London Museum](https://www.londonmuseum.org.uk/collections/london-stories/harry-beck-revolutionised-tube-map/)
- 비녤리 뉴욕 지하철 도식은 1972년 8월 나와 바로 논란(지리를 너무 단순화). 1979년 마이클 허츠 지도로 바뀜. 비녤리는 "센트럴파크가 직사각형인 걸 안다"며 도식이라고 변호. 2025년 4월 MTA가 1972년 비녤리 디자인을 되살린 새 지도 공개 — [Wikipedia NYC Subway map](https://en.wikipedia.org/wiki/New_York_City_Subway_map); [Wikipedia Massimo Vignelli](https://en.wikipedia.org/wiki/Massimo_Vignelli); [Vital City](https://www.vitalcitynyc.org/new-yorks-new-subway-map.md)
- 뉴욕 노선도 18장으로 본 변천 — [Gizmodo](https://gizmodo.com/18-subway-maps-that-trace-nycs-transit-history-1242514280); 노선도 디자인 변천을 다룬 학술 논문(Peter Lloyd, Diagrams 2018) — [Kent](https://www.cs.kent.ac.uk/projects/metromap/papers/Diagrams2018-paper104.pdf)
- Transit Maps 블로그(transitmap.net)는 1933년 런던 "Underground Power" 포스터 등 옛 지도와 팬 지도를 소개 — [transitmap.net](https://transitmap.net/underground-power-1933)
- 서울시: "보기 쉬워졌네! 지하철 노선도, 40년 만에 확 바뀐다"(2023 새 노선도 디자인), 2025년 4월 단일 노선도 표준화 — [내 손안에 서울](https://mediahub.seoul.go.kr/archives/2009054); [YTN 2025-04](https://www.ytn.co.kr/_ln/0103_202504171108250868)

### Inferences
- **아이디어 "노선도 옷 갈아입히기"(장난감)**: [노선도] 보기에 모양 고르기 — "벡 1933풍"(환승역 마름모, 굵은 선), "비녤리 1972풍"(역을 점, 노선마다 가는 나란한 선, 검은 바탕 대신 땅색은 유지), "지금 레일맵풍". 실제 옛 그림을 넣는 게 아니라 **규칙만 흉내** 내므로 저작권 문제 없음(벡·비녤리 원본 그림·이름 상표는 넣지 않는다). [그림 저장]과 이어 공유 재미.
- **아이디어 "옛 지도 vs 내 지도"**: 저장한 노선도 PNG 옆에 "같은 해 실제 노선망"(1번의 연도 프리셋)을 나란히 그려 비교. 팬들이 즐기는 옛·새 비교를 게임 안에서.

### Gaps
- 옛 서울 노선도(1980~90년대) 공식 그림의 공개 여부·라이선스는 확인 못 함.
- 도쿄·파리 옛 공식 노선도의 디자인 변천 자료는 조사하지 못했다.
- 벡·비녤리 스타일을 흉내 낼 때 상표·디자인권 문제가 있는지 법적 확인은 안 함(규칙 흉내는 일반적으로 문제없다고 보지만 추정).

## 4. 조용한 게임에 맞는 가벼운 도전: 퀴즈, 기억해서 그리기, 서버 없는 "오늘의 문제"

### Takeaway
"역 이름 기억해서 채우기"(Metro Memory, 서울·뉴욕·파리·런던 등), "오늘의 노선 맞히기"(Subwaydle), "3×3 역 빙고"(Tokyo Doc), Mini Metro의 매일·매주 도전이 이미 인기다. Wordle식 매일 문제는 **날짜(UTC)로 정해지는 순번**만 있으면 서버 없이 모두 같은 문제를 받는다. 레일맵은 실제 노선망 프리셋이 있어 "실제와 비교해 몇 % 비슷한가"를 채점 대신 칭찬으로 쓸 수 있다.

### Cited Findings
- Metro Memory: 역 이름을 쳐 넣으면 지도에 색이 채워짐. 런던판 목표 416개 역(튜브·오버그라운드·엘리자베스선). Benjamin Tran Dinh 제작, 출시 직후 10만, 이후 약 50만 명. 파리·베를린·서울·뉴욕·마드리드·멕시코시티 등으로 늘어남 — [Time Out London](https://www.timeout.com/london/news/how-to-play-londons-viral-tube-metro-memory-game-102423); [The Week](https://www.theweek.com/tech/why-the-metro-memory-game-is-so-addictive); [adn40 (멕시코시티판)](https://www.adn40.mx/es-tendencia/como-es-y-como-jugar-metro-memory-el-juego-del-metro-cdmx/)
- Mind The Map: 런던 지도에 역 이름을 주면 자리를 찍는 브라우저 게임. Tubedoku도 있음 — [Londonist](https://londonist.com/london/transport/mind-the-map-tube-game)
- Subwaydle: 뉴욕 지하철판 Wordle. 매일 두 역 사이 숨은 경로(노선 조합)를 6번 안에 맞힘. 추측은 실제로 탈 수 있는 경로여야 하고 갈아타기 2번. 녹색 = 맞는 노선·맞는 자리. 평일·주말 운행이 달라 조합 수가 다름(평일 6,835 / 주말 4,188이라는 보도). 제작자 Sunny Ng, 교통박물관 퀴즈 밤에서 영감 — [Time Out New York](https://timeout.com/newyork/news/subwaydle-is-an-addictive-subway-inspired-take-on-wordle-020422); [Kotaku](https://kotaku.com/games-like-wordle-subwaydle-nyct-mta-best-routes-1848461481)
- Tokyo Doc(tokyodoku.io): 3×3 칸에 가로·세로 단서(역 이름 글자 수, "마루노우치선에 있음" 등)를 둘 다 만족하는 역을 넣음. 역 하나는 한 칸만, 세 번 틀리면 끝, 매일 새 문제 + 지난 문제 모음 — [GIGAZINE 2026-07](https://gigazine.net/gsc_news/en/20260723-tokyo-doku/)
- Mini Metro: 그날 모든 사람에게 같은 "매일 도전"과 "매주 도전"으로 순위표 경쟁. 매일 도전은 인터넷 연결 필요. 업적 "Day trip"(매일 도전 점수 올리기), "Commuter"(한 주 평일 매일) — [Dinosaur Polo Club 보도자료](https://dinopoloclub.com/press/index.php); [Steam 토론](https://steamcommunity.com/app/287980/discussions/0/1742229167200711179)
- Wordle은 2,315개 단어 목록을 브라우저 안에 두고, 2021-06-19부터 지난 날 수를 순번으로 써서 모두 같은 답을 받게 함(서버 없음, 역분석 결과) — [GitHub WordleCheater](https://github.com/FractalSystem/WordleCheater); 날짜를 의사 난수 씨앗으로 쓰면 서버 없이 같은 문제 — [DEV Community](https://dev.to/nikhil_657d136fec04f0e0b2/building-a-daily-puzzle-site-what-the-tech-stack-actually-looks-like-1hfj); 시간대가 달라도 같게 하려면 UTC 날짜로 순번 계산 권장 — [aiidelist 가이드](https://aiidelist.com/blog/how-to-build-your-own-dle-games)
- 팬 노선도 만들기 도구 Metro Dreamin(가상 노선망, r/TransitDiagrams 공유 문화), Metro Map Maker(워싱턴 노선 다시 만들기) — [Metro Dreamin](https://metrodreamin.com/view/QUhreVo2TGhUQ1ROaTh5ekthcHB6YjJqMW5RMnwxOQ%3D%3D); [DCist 2017](https://dcist.com/story/17/09/07/metro-map-maker-helps-you-build-you)

### Inferences
- **"기억으로 2호선 그리기"**: 빈 서울에서 2호선 순환선을 기억으로 깔면, 끝난 뒤 실제 프리셋 2호선을 얇게 겹쳐 보여주고 "역 43개 중 31개를 300m 안에 놓았어요". 실패 없음, 레일맵 고유(지도 위에 직접 그리는 Metro Memory).
- **"오늘의 노선"(서버 없는 매일 도전)**: UTC 날짜 순번으로 도시·두 장소를 고른다("오늘: 김포공항 → 강남, 30분 안에"). 예산 고정 샌드박스 지도에서 짓고, 결과는 "28분, 역 6개" 같은 짧은 글(이모지 대신 노선 색 네모 글자)로 복사 — 레일맵의 [링크로 공유]와 같은 방식. 순위표는 없음(서버 없음). 같은 날 친구와 링크로 비교만.
- **가벼운 목표 예시(실패 없음, 배지만)**: "공항에서 도심까지 N분"(인천공항역은 이미 고속철도역으로 있음, tripFinder로 가장 빠른 여행 계산 가능), "도시 인구 X%를 역 30분 안에"(역세권·이동 시간 계산이 이미 있음), "1904년 IRT 28개 역 다시 만들기", "1863년 메트로폴리탄 철도 6km 다시 만들기", "실제 노선망보다 적은 역으로 같은 승객".
- **"역 이름 맞히기" 장난감**: 실제 노선망 샌드박스에서 [역 이름 가리기]를 켜면 말풍선이 "?"로 바뀌고 눌러서 이름을 쳐 맞힘. Metro Memory를 레일맵 지도 위에.
- **Tokyo Doc식 단서**: "2개 노선이 서는 환승역 + 이름 3글자" 같은 단서는 프리셋 자료(노선 목록·이름)만으로 만들 수 있다.

### Gaps
- Mini Metro 매일 도전의 씨앗(seed) 방식은 공개 자료가 없었다.
- "공항~도심 N분" 같은 실제 기준 시간(예: 인천공항철도 직통 소요 시간)은 이번에 조사하지 않았다.
- 이런 가벼운 목표가 실제로 플레이어 유지에 효과가 있는지에 대한 자료는 찾지 못했다.

## 5. 서버 없이 쓸 수 있는 공개 자료와 라이선스 (OSM, OpenRailwayMap·OHM, Wikidata, GTFS)

### Takeaway
게임 안에 자료를 넣을 때 가장 쉬운 순서는 **Wikidata(CC0) → 서울 공공데이터(공공누리 1유형, 출처표시) → OSM(ODbL, 이미 출처 표기 중)**이다. 위키백과 표 글은 CC BY-SA지만 날짜 같은 사실만 뽑아 쓰는 것과는 다르다. 교통기관 GTFS·API는 기관마다 약관이 달라(예: TfL은 "Data provided by Transport for London" 표기 + TfL 상표 금지) 쓸 때마다 확인해야 하고, 레일맵에는 시간표가 범위 밖이라 GTFS는 우선순위가 낮다.

### Cited Findings
- OSM 출처 표기 지침(2021-06-25 채택): 게임은 보통 "만든 작품(Produced Work)"이라 자유롭게 약관을 정할 수 있지만, 요청하면 쓴 자료·파생 DB를 ODbL로 주거나 만드는 방법을 줘야 함. 만든 작품이 OSM 자료를 상당 부분 뽑아내거나 다시 만드는 데 쓰이면 "파생 데이터베이스". 지리 자료 자체를 배포하면(예: 비행 시뮬레이터의 목적지 목록) 배포로 봄. 출처에 "OpenStreetMap" 이름과 ODbL임을 밝히고 작품 가까이 또는 사람들이 기대하는 자리에 둬야 함 — [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Attribution); [OSMF Licence and Legal FAQ](https://osmfoundation.org/wiki/Licence_and_Legal_FAQ)
- OSM 자료에 다른 자료를 더해 보강하면 그 전체에 share-alike가 붙음. 반면 따로 떨어진 묶음(Collective Database)의 다른 자료에는 붙지 않음 — [OSMF Licence and Legal FAQ](https://osmfoundation.org/wiki/Licence_and_Legal_FAQ)
- Wikidata 구조 자료는 CC0 — [Wikidata P1619](https://www.wikidata.org/wiki/Property:P1619)
- 서울 개통 정보는 공공누리 1유형(출처표시, 상업·변경 가능) — [서울열린데이터광장 OA-13317](https://data.seoul.go.kr/dataList/OA-13317/F/1/datasetView.do)
- TfL 오픈데이터: "Data provided by Transport for London" 표기, TfL 상표를 쓰거나 공식 앱처럼 보이게 하면 안 됨. 여정 응답 안의 OSM 파생 자료는 별도 출처 표기 필요 — [TfL open data policy](https://tfl.gov.uk/info-for/open-data-users/open-data-policy); [TfL 개발자 포럼](https://techforum.tfl.gov.uk/t/important-information-about-external-data-sources-in-tfl-open-data/3019)
- 파리 GPE 노선 GIS는 SGP가 배포 권리를 가져 IDFM 공개 자료에 없음, SGP 15호선 남부 자료는 라이선스 미지정 — [data.gouv.fr](https://www.data.gouv.fr/datasets/lignes-de-transport-en-projet-en-ile-de-france)
- OHM(OpenHistoricalMap)은 start_date/end_date로 과거 철도를 담는 별도 지도(예: 브뤼셀 지하철) — [OHM relation 2700547](https://www.openhistoricalmap.org/relation/2700547/history/5)

### Inferences
- 레일맵 방식(프리셋을 미리 만들어 src/data/presets/에 넣고 고를 때만 받기)이 그대로 맞다: 개통 연도·계획 노선도 **tools/make-presets.mjs가 빌드 때 Wikidata SPARQL·서울 CSV를 읽어 프리셋 JSON에 `opened: 1974` 한 칸만 더하는** 식이면 게임은 서버 없이 돈다. 브라우저에서 바로 Wikidata를 부르면 느리고 지도마다 실패할 수 있어 권하지 않는다.
- 프리셋은 이미 OSM에서 뽑은 자료라 ODbL 출처 표기가 이미 필요하다. 여기에 Wikidata(CC0) 날짜를 더해도 추가 의무는 없지만, OSM 자료에 날짜를 "보강"한 묶음이 되므로 share-alike가 프리셋 파일 전체에 붙는다고 보는 게 안전하다(프리셋 파일은 ODbL로 공개한다고 README에 적기). 서울 공공데이터를 쓰면 "서울교통공사 개통 정보, 공공누리 1유형" 출처 한 줄을 시작 화면 출처 칸에 더한다.
- 위키백과 표는 사람이 확인용으로만 쓰고, 기계로 뽑을 때는 Wikidata를 먼저 쓴다(라이선스가 가장 단순).
- GTFS(시간표)는 "시간표 만들지 않음" 범위라 쓰지 않는다. 쓸 일이 생겨도 역 좌표 정도이고, 그건 이미 OSM으로 있다.

### Gaps
- OpenRailwayMap이 지하철 노선에 opening_date/start_date를 별도로 보여주는지, OSM 지하철 자료에 그 태그가 얼마나 있는지는 확인 못 함(검색이 OHM 결과만 돌려줌). OSM wiki의 Key:start_date 문서 원문도 직접 읽지 못했다.
- MTA·IDFM·도쿄메트로·서울교통공사 GTFS의 재배포 약관은 조사하지 않았다(범위상 우선순위 낮음).
- 국토수치정보 N05의 출처 표기·재배포 조건 원문은 확인 못 함.
