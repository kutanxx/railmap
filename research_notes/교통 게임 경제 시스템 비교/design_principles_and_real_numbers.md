# 교통 건설 게임의 경제 설계 원칙과 서울 실제 수치 (레일맵 밸런스 기준값용)

조사일: 2026-10-26. 도구 호출 약 17회. 아래 모든 사실에는 출처를 붙였고, 출처 없는 추정은 "Inferences"에만 넣었다.

## 1. 설계자들은 건설 게임 경제의 속도(투자 회수 기간, 초반 부족 vs 후반 돈 넘침)를 어떻게 맞추나?

### Takeaway
게임 회사가 직접 밝힌 "투자 회수 기간 N분" 같은 수치 기준은 찾지 못했다. 공개된 원칙은 질적인 것들이다: 돈이 들어오는 곳(faucet)과 나가는 곳(sink)을 짝지어 균형을 맞추고, 작은 불균형이 쌓여 "돈 폭주" 또는 "회복 불가 악순환"이 되는 것을 경계하며, Mini Metro처럼 자원을 조금씩만 주어 "노선을 길게 vs 자주 다니게"를 맞바꾸게 한다.

### Cited Findings
- 타이쿤 경제는 되먹임 고리(feedback loop)라서, 고리 하나의 작은 불균형이 몇 시간에 걸쳐 쌓이면 걷잡을 수 없는 인플레이션이나, 플레이어가 회복하지 못하는 "죽음의 소용돌이(death spiral)"가 된다고 설명한다. — [Bugnet: bug tracking for management tycoon games](https://bugnet.io/blog/bug-tracking-for-management-tycoon-games)
- 경제 설계의 핵심 규칙: 돈이 들어오는 곳(source/faucet)마다 나가는 곳(sink)을 짝지어 균형을 맞추고, 이 균형으로 플레이어의 긴장감을 만든다. 출시 때 맞는 경제가 몇 년 뒤에도 맞는 경우는 드물다는 지적도 있다. — [Metavert: Game Economy Design](https://metavert.io/game-economy-design)
- Mini Metro: 플레이어는 역을 놓지 못하고 선만 긋는다. 선 하나에 열차가 하나라서 노선을 늘리면 배차 간격이 길어지고 혼잡 위험이 커진다. Human Transit의 Jarrett Walker는 정해진 예산 안에서 "얼마나 멀리 가나 vs 얼마나 자주 다니나"를 맞바꾸는 것이 현실과 맞다고 평가했다. 오래 버티면 노선 하나를 더 주거나 속도·용량을 올려주며, 자금이 "slow trickle of funding"(조금씩 흘러드는 자금)으로 들어온다고 묘사한다. — [Human Transit, "Overcrowding and underfunding: the lessons of Mini Metro" (2014)](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- 같은 글은 Mini Metro의 약점도 짚는다. 노선을 공짜로 부수고 다시 만들 수 있다는 점이 비현실적이고, 용량만 최적화하는 것은 승객 편의를 최적화하는 것과 다르다고 지적한다. — [Human Transit (2014)](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- 새 역이 계속 어색하고 비싼 곳에 생겨나는 구조가 "바깥으로 계속 넓히라"는 현실의 정치적 압력을 닮았다. 돈 대부분이 확장에 쓰이니 혼잡은 끝내 사라지지 않고, 결국 도심 핵심 구간의 용량에 투자해야 한다. — [Human Transit (2014)](https://humantransit.org/2014/03/the-lessons-of-mini-metro.html)
- Mini Metro GDC 2017 강연("Mini Metro: When Less Is More", Jamie Churchman, Dinosaur Polo Club)은 경제가 아니라 UI·시각 디자인을 다룬다. — [Game Developer (2017)](https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev); [GDC news](https://gdconf.com/news/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-mini-metro-dev)

### Inferences
- 레일맵에 맞게 바꾸면: 초반에는 시작 자금으로 "짧은 노선 1개 + 열차 1~2대"만 지을 수 있게 하고, 첫 노선이 게임 시간으로 몇 년 안에 공사비를 회수하게 맞추면 초반의 긴장과 성장감을 함께 줄 수 있다. (회수 기간 숫자는 출처가 없는 추정이므로 config.js에서 실험해서 정해야 한다.)
- 후반 돈 넘침을 막는 방법(돈이 나가는 곳): 선로 km당 운영비, 열차당 운영비, 그리고 새 노선을 점점 더 비싼 도심 구간에 깔게 되는 구조. Mini Metro와 Human Transit의 분석은 "도심 핵심 구간 혼잡"이 자연스러운 후반 비용이 될 수 있음을 보여준다.

### Gaps
- Transport Fever, OpenTTD, NIMBY Rails, Subway Builder 개발자가 수치로 밝힌 투자 회수 기간 목표는 찾지 못했다.
- SimCity 교통 시스템의 경제 설계를 다룬 강연·사후 분석(postmortem)은 이번 조사에서 확인하지 못했다.

## 2. 게임에서 잘 통하는 단순하고 설명하기 쉬운 수요 모델은 무엇이고, 함정은 무엇인가? (실패 상태, 되먹임, 가독성 포함)

### Takeaway
실제로 쓰이는 형태는 (1) 거리 기반 중력 모델(Subway Builder), (2) 역 반경 안 인구와 거리 구간별로 정한 수요 곡선(NIMBY Rails), (3) "최근에 운행한 역이 있으면 도시가 빨리 자란다"는 성장 되먹임(OpenTTD)이다. 함정으로는 역 반경이 겹칠 때 수요가 두 번 세어지는 문제, 업데이트로 공식이 바뀌면 기존 결과가 크게 바뀌는 문제, Mini Metro처럼 혼잡 하나로만 지는 단일 실패 조건이 있다.

### Cited Findings
- Subway Builder(개발자 Colin Miller): 인구조사 데이터의 집 위치에서 통근자를 만들고, 거리 기반 중력 모델로 직장을 배정한다. 통근자는 소요 시간, 요금, 시간 가치를 따져 교통수단을 고르고, 지연·운행 취소가 이후 행동에 반영된다. 대학·공항 통근자는 따로 모델링한다. 2025년 10월 기준 미국 26개 도시 베타였다. — [Greater Greater Washington](https://ggwash.org/view/101667/subway-builder-turns-metro-enthusiasts-into-transit-designers); [Planetizen (2025-10)](https://www.planetizen.com/news/2025/10/136214-nerd-alert-subway-builder-video-game-lets-you-build-your-dream-transit-system); [Steam 상점 페이지](https://store.steampowered.com/app/4039140/Subway_Builder)
- NIMBY Rails 개발 블로그(2020-10): 역 수요 생성기가 요일을 반영하고, 승객을 거리별로 근거리(locals)·지역(regionals)·장거리(long distance) 세 구간으로 나눈다. 수요 곡선은 손으로 만든 고정값이고, 일요일 오후에는 장거리 승객이 몰린다. — [NIMBY Rails devblog 2020-10 (carloscarrasco.com)](https://carloscarrasco.com/page/57/)
- NIMBY Rails 1.12 업데이트 뒤 한 플레이어의 승객 수가 크게 줄었다. 개발자는 수요 시스템이 완전히 바뀌어 예전 값을 공식으로 재현할 수 없다고 답했다. 다른 플레이어는 역 반경이 훨씬 커졌고 역 영역이 겹친 것이 원인일 수 있다고 봤다. — [Steam 토론: NIMBY Rails](https://steamcommunity.com/app/1134710/discussions/0/4352242595078331742)
- OpenTTD: 회사가 50일 안에 도시 영향권 안의 역(최대 5개)에서 화물을 싣거나 내리면 도시 성장이 빨라진다. 어떤 화물인지는 상관없고, 서비스가 없어도 아주 천천히 자란다. "City"는 일반 도시보다 2배 빨리 자란다. 큰 건물일수록 승객을 많이 만든다. 50일 안에 운행한 역은 지역 평판을 올리고 버려진 역은 깎으며, 평판이 -200(Poor) 이상이어야 역을 지을 수 있다. — [OpenTTD Wiki: Towns](https://wiki.openttd.org/en/Manual/Towns)
- Mini Metro의 실패 조건: 한 역이 정원(보통 6명)을 넘긴 상태가 일정 시간 이어지면 게임이 끝난다. — [Wikipedia: Mini Metro](https://en.wikipedia.org/wiki/Mini_Metro_(video_game))
- 교통 계획가 Jarrett Walker는 일자리가 거의 없는 넓은 주거 지역이 무엇을 하든 망을 금방 과부하시킨다고 말한다(수요의 방향이 한쪽으로 쏠리는 문제). — [Vice: We asked a transit planner how to up our Mini Metro game](https://vice.com/en/article/we-asked-a-transit-planner-how-to-up-our-mini-metro-game)
- 중력 모델의 거리 감쇠는 거듭제곱 형태(1/t^β)와 지수 형태(e^(−βt)) 둘 다 쓰이며, 데이터에 따라 맞는 형태가 다르다. — [Systematic comparison of trip distribution laws and models (arXiv 1506.04889)](https://arxiv.org/pdf/1506.04889)
- η, β, k 같은 감쇠 함수 계수를 조정해도 짧은 통행과 긴 통행을 동시에 잘 맞추지 못한다는 평가가 있다. — [Distilling human mobility models with symbolic regression (arXiv 2501.05684)](https://arxiv.org/pdf/2501.05684)

### Inferences
- 레일맵의 기획 공식 "수요 ∝ 인구A × 인구B ÷ 소요시간^0.8"은 Subway Builder와 같은 중력 모델 계열이라 설명하기 쉽다. 다만 시간이 아주 짧은 이웃 역 쌍에서 값이 지나치게 커질 수 있으니 최소 시간(예: 몇 분)을 바닥값으로 두는 것이 안전하다(추정).
- 역 반경이 겹치면 인구가 두 번 세어질 수 있다(NIMBY Rails 사례). 인구 칸 하나를 가장 가까운 역에만 배정하면 피할 수 있다(추정).
- OpenTTD식 "운행 중인 역 주변은 인구가 늘어난다"는 되먹임은 성장감을 주지만 후반 돈 폭주의 원인도 되므로 성장 상한이 필요하다(추정, 1번 항목의 death spiral·inflation 지적과 연결됨).
- 가독성(노선별 수익, 수요 히트맵): 이번 조사에서는 이를 직접 다룬 개발자 자료를 찾지 못했다. 다만 Subway Builder처럼 수요 원리가 복잡한 게임일수록 원인을 보여주는 UI가 중요하다는 것은 합리적인 추정이다.

### Gaps
- 노선별 손익 표시나 수요 히트맵의 효과를 다룬 개발자 강연·글은 찾지 못했다.
- Transport Fever의 도시 성장·연결 규칙을 다룬 1차 자료는 이번 검색에 나오지 않았다.
- OpenTTD 역 영향 반경(catchment) 수치는 Towns 문서에 없었다(Game mechanics 문서는 404).

## 3. 서울의 실제 수치(원화, 연도 포함): km당 건설비, 요금, 운영비, 역별 승객 수

### Takeaway
요금은 확실하다: 2025-06-28부터 기본요금 1,550원(카드), 10km까지 기본, 10~50km는 5km마다 100원, 50km 초과는 8km마다 100원. 승객 수: 2024년 1위 잠실역 하루 15.6만 명, 1~8호선 하루 평균 660만 명. 원가: 2025년 승객 1명 수송원가 1,817원, 평균 운임 1,036원. km당 건설비는 공식 단일 수치가 없고, 서울 사업들로 계산하면 대략 km당 1,000억~1,200억 원 수준(경전철 포함)이다. Transit Costs Project 기준으로는 PPP 달러로 km당 약 8,100만~1억2,200만 달러다.

### Cited Findings
**요금 (서울교통공사·서울시)**
- 2025년 6월 28일 첫차부터 수도권 지하철 기본요금이 카드 기준 1,400원에서 1,550원으로 올랐다. 청소년은 800원에서 900원, 어린이는 500원에서 550원이 됐다. — [한국경제 (2025-06-23)](https://www.hankyung.com/article/2025062320567); [이투데이](https://www.etoday.co.kr/news/view/2480312); [SBS Biz](https://biz.sbs.co.kr/amp/article/20000243176)
- 그전에는 2023년 10월에 1,250원에서 1,400원으로 올랐고, 이때 거리 추가요금은 동결했다. — [세계일보 (2025-06-23)](https://www.segye.com/newsView/20250623501862); [블록미디어](https://www.blockmedia.co.kr/archives/283479)
- 거리비례요금제: 10km 이하는 기본요금, 10km 초과~50km 이하는 5km마다 100원, 50km 초과는 8km마다 100원을 더 낸다. — [서울시 교통 누리집: 환승할인](https://news.seoul.go.kr/traffic/transfer_discount)
- 한 기사는 1,550원 인상 때 거리별 추가 운임 체계를 그대로 유지했다고 전한다. 다만 검색 결과에서 이 기사 날짜가 "2026년 7월"로 표시되어 실제 인상일(2025-06-28)과 맞지 않으므로 날짜 표기 오류로 보인다. — [인사이트](https://www.insight.co.kr/news/508003)

**원가·운영 적자 (서울교통공사, 1~8호선)**
- 2025년 승객 1명 수송원가는 1,817원, 실제 평균 운임은 1,036원으로 1명당 781원 손실이다. 원가 보전율은 57%다. 수송원가에는 인건비, 감가상각비, 전기요금이 포함된다. 2025년 당기순손실은 8,268억 원으로, 2024년 7,241억 원보다 14.2% 늘었다. — [아시아경제 (2026-06-12)](https://view.asiae.co.kr/article/2026061208331966120); [머니투데이](https://www.mt.co.kr/article/2026061123414886284); [헤럴드경제](https://www.heraldk.com/article/2026061114342074222)
- 원가 보전율은 2021년 50.2%, 2022년 53.3%, 2023년 54.7%, 2024년 53.9%였다. 2024년 공익서비스(무임수송 등) 손실은 7,381억 원이다. — [아시아경제 (2026-06-12)](https://view.asiae.co.kr/article/2026061208331966120)

**승객 수 (서울교통공사 "2024년 서울 지하철 1~8호선 수송 통계")**
- 2024년 하루 평균 승하차 인원: 1위 잠실역 156,177명, 2위 홍대입구역 150,369명, 3위 강남역 149,757명(전체 273개 역 중). — [서울신문 (2025-02-19)](https://m.go.seoul.co.kr/news/2025/02/19/20250219500088); [아주경제 (2025-02-19)](https://www.ajunews.com/view/20250219101125137)
- 2024년 1~8호선 총 수송 인원은 24억 1,752만 명, 하루 평균 660만 5,250명으로 2023년보다 2.5% 늘었다. 잠실역은 8호선 별내선 연장의 영향으로 2년 연속 1위다. — [서울신문 (2025-02-19)](https://m.go.seoul.co.kr/news/2025/02/19/20250219500088); [내 손안에 서울](https://mediahub.seoul.go.kr/archives/2013487)
- 성수역은 7년 사이 승객이 75% 늘었다. — [아주경제 (2025-02-19)](https://www.ajunews.com/view/20250219101125137)

**건설비**
- Transit Costs Project(NYU Marron, PPP 환산 미국 달러, 물가 반영): 신분당선 17.3km(2005~2011) 약 15.2억 달러, km당 약 8,780만 달러. — [transitcosts.com: Seoul Sinbundang](https://transitcosts.com/seoul-sinbundang/)
- 같은 출처: 김포골드라인(경전철) 23.7km(2014~2019) km당 약 8,100만 달러. — [transitcosts.com ?p=7322](https://transitcosts.com/?p=7322)
- 같은 출처: 7호선 연장 3.9km(2014~2021) km당 약 1억 2,190만 달러. — [transitcosts.com ?p=7323](https://transitcosts.com/?p=7323)
- 같은 출처: 2020년대 확장 계획 71km(2020~2028, 계획 예산) km당 약 1억 1,200만 달러. — [transitcosts.com ?p=7328](https://transitcosts.com/?p=7328)
- 주의: 이 프로젝트는 일부 서울 항목이 공식 기록이 아니라 언론 자료에 기댄다고 밝힌다. 신분당선은 출처에 따라 1.69조 원과 1.169조 원으로 엇갈려 오타를 바로잡았다. 서울의 km당 비용이 뉴욕의 약 1/20이라는 것이 대표 결론이다. — [transitcosts.com ?p=8828](https://transitcosts.com/?p=8828)
- 위례신사선(경전철, 지하, 14.7km, 2024년 기사): 공사비가 1조 4,847억 원에서 1조 7,605억 원으로 2,758억 원 올랐다. 다른 기사는 14.8km, 역 11개로 적어 길이가 엇갈린다. — [이투데이](https://www.etoday.co.kr/news/view/2391884); [경향신문 (2024-12-18)](https://www.khan.co.kr/article/202412182144045); [파이낸셜뉴스 (2024-10)](https://www.fnnews.com/news/202410061904071958)
- 서부선(경전철): 새절역~서울대입구역 15.6km, 역 16개. 늘어난 총사업비는 기사에서 확인하지 못했다. — [내 손안에 서울](https://mediahub.seoul.go.kr/archives/1061913)
- 경전철 건설비는 1~9호선 같은 중량전철의 절반 수준이라는 전문가 인터뷰가 있다(날짜 확인 필요, 오래된 자료일 수 있음). — [프레시안](https://www.pressian.com/pages/articles/108203)
- 2003년 대구 기사: 경전철은 km당 500억~600억 원(오래된 자료). — [매일신문 (2003)](https://www.imaeil.com/page/view/2003032011290023412)
- 경전철은 지하 구조물이 작아 건설비가 줄어든다는 서울시 설명. — [내 손안에 서울: 지하철, 그 다음은 뭐지?](https://mediahub.seoul.go.kr/archives/165093)

### Inferences
- 위례신사선 km당 비용(직접 계산): 1조 7,605억 ÷ 14.7km ≈ km당 약 1,200억 원(증액 전 기준 약 1,010억 원). 역 11개까지 포함한 금액이다.
- 게임용 단순화 제안: 지하 중량전철 km당 약 1,200억~1,500억 원, 지하 경전철 km당 약 1,000억 원, 지상·고가는 그보다 싸게(예: 절반) 두는 정도면 현실 감각과 맞는다. (지상·고가 비율은 아래 Gaps 참고. 서울 공식 수치가 없는 추정이다.)
- 게임 요금 공식은 실제 체계를 그대로 써도 쉽다: `요금 = 1,550 + max(0, ceil((거리 − 10) / 5)) × 100` (50km 이하). 다만 수송원가(1,817원)가 평균 운임(1,036원)보다 높은 현실을 그대로 옮기면 게임이 늘 적자가 된다. 게임에서는 운영비를 현실보다 낮추거나 수요를 키워 흑자가 가능하게 해야 한다.
- 잠실역 하루 약 15.6만 명은 "가장 붐비는 역" 상한의 기준이 된다. 1~8호선 하루 660만 명을 273개 역으로 나누면 역당 평균 약 2.4만 명이다(직접 계산, 승하차 합계 기준이므로 정의를 확인해야 한다).

### Gaps
- 서울에서 지하와 고가(지상)의 km당 건설비를 나란히 비교한 2015년 이후 공식 자료는 찾지 못했다.
- 역 1개당 건설비만 따로 공개한 2015~2026년 자료는 찾지 못했다.
- 열차-km당 또는 선로 km당 연간 운영비(서울교통공사 영업비용 ÷ 운행거리)는 확인하지 못했다. 서울교통공사 경영공시(ALIO)의 손익계산서와 운행 km로 계산할 수 있을 것이다.
- 2024년 1인당 수송원가 금액 자체는 찾지 못했다(2025년 1,817원만 확인).

## 4. 교통 계획가들이 쓰는 역 영향 반경과 중력 모델 지수는?

### Takeaway
국제적으로는 걸어서 400m/800m가 관례지만 연구들은 이를 "단순하고 오해를 부를 수 있다"고 본다. 서울 제도에서 쓰는 "역세권"은 250m(일반)·350m(중심지·환승역)이고, 최근 500m로 넓히는 추세다. 중력 모델의 거리·시간 지수 β는 문헌에서 0.5~3.0 범위로 보정하며, 한 사례는 소요 시간 지수 1.5를 얻었다. 기획서의 0.8은 이 범위의 낮은 쪽(먼 거리 통행에 관대함)이다.

### Cited Findings
- 400m·800m 도보 기준은 계획에서 널리 쓰이지만 기껏해야 단순하고 크게 오해를 부를 수 있다. 퍼스(Perth) 자료에서는 많은 승객이 800m 넘게 걷는다. — [Ker & Ginn (2003), "Myths and realities in walkable catchments" (TRID)](https://trid.trb.org/View/665133); [SWOV](https://swov.nl/en/publicatie/myths-and-realities-walkable-catchments-case-walking-and-transit-0)
- 마드리드 지하철 연구(García-Palomares 외, 2013): 거리 감쇠 함수를 승객 데이터에 맞춰 봤다. 젊은 층, 성인, 남성, 이민자, 대중교통 의존층이 더 멀리 걷는다. 고정 반경과 감쇠 방식은 포함하는 인구가 다르다. — [UCM: Walking accessibility to public transport](https://produccioncientifica.ucm.es/documentos/5d399a1e299952068445f410?lang=en)
- 미국 5개 도시 연구(2021): 300m~1,500m 반경을 시험했고, 거리 감쇠 가중치는 모델을 거의 개선하지 못했으며, 가장 좋은 반경은 도시마다 달랐다. — [Journal of Advanced Transportation (2021), DOAJ](https://doaj.org/article/247ac8fc65b84435946c98930cce8688)
- 애들레이드 O-Bahn 연구(2024): 400m/800m는 흔한 계획 목표지만, 환승 주차·연계 버스가 있는 고빈도 역에는 기준이 없고 몇 km씩 오는 이용자도 있다. — [University of Adelaide repository](https://digital.library.adelaide.edu.au/items/2e40b7c3-4ead-45ba-a527-77c7c718acba)
- 서울 역세권 활성화사업: 환승역 또는 지역중심 이상 역은 350m, 환승역이 아닌 지구중심 이하 역은 250m. 서울시는 역세권 범위를 250m에서 350m로 넓혔다. — [역세권 활성화사업 안내 리플렛 (2024-03 기준)](https://files-scs.pstatic.net/2024/09/08/liskypxBqi/붙임%203.%20역세권%20활성화사업%20안내%20리플렛(’24.3.%20기준).pdf); [파이낸셜뉴스 (2025-04)](https://www.fnnews.com/news/202504201825123562)
- 2026년 서울시 발표: 역세권 장기전세주택 대상을 역에서 350m에서 500m로 넓히는 방안이 나왔고, 환승역 반경 500m 안은 "성장거점형 도심복합개발" 대상이다. — [헤럴드경제 (2026-05-05)](https://www.heraldk.com/article/2026050500410358031); [뉴스서울](https://newsseoul.co.kr/news/view/1065585629018945)
- 2021년 정부의 500m 역세권 구상에 서울시가 반대했다. 250m만으로도 서울 시가화 면적의 약 24%가 대상이라는 이유였다. — [아주경제 (2021-01-07)](https://www.ajunews.com/view/20210107094644539)
- 다른 도시: 인천은 승강장 경계에서 500m, 부산은 350m(상업·업무 등)와 250m(주거 등)로 정했다. — [경향신문 (2025-04-29)](https://www.khan.co.kr/article/202504291050001)
- 중력 모델 지수: 인디애나주 통행 수요 연구는 문헌에서 받아들여지는 범위라며 β를 0.5~3.0에서 찾았다. — [arXiv 2404.13211](https://arxiv.org/pdf/2404.13211)
- 인도 지역 교통계획 연구는 소요 시간 기반 거듭제곱 감쇠에서 지수 n = 1.50이 가장 잘 맞았다(평균 통행 길이를 조사값과 약 3% 안으로 맞춤). — [WCTRS abstract](https://wctrs-society.com/wp-content/uploads/abstracts/lisbon/general/02697.pdf)
- 중력 모델 계수는 거리와 시간 중 무엇으로 보정하느냐에 매우 민감하다. — [Springer (BF00243358)](https://link.springer.com/doi/10.1007/BF00243358)

### Inferences
- 레일맵 기본값 제안: 역 영향 반경 500m(서울 최신 제도와 국제 관례 400~800m 사이), 또는 350m에서 시작해 config.js에서 고칠 수 있게 둔다. 반경 끝에서 수요를 0으로 자르기보다 줄여 가는 방식은 연구상 이득이 크지 않으므로, 단순한 고정 반경으로도 충분하다(미국 5개 도시 연구 근거).
- β = 0.8은 먼 역 사이 수요를 상대적으로 크게 만든다. 1.0~1.5로 올리면 가까운 역끼리의 수요가 더 강해진다. 주인이 직접 바꿔보도록 config.js의 조절값으로 두는 것이 좋다.

### Gaps
- 서울 지하철 승객 데이터로 보정한 중력 모델 β 값(한국교통연구원 등)은 찾지 못했다.
- 서울 지하철 승객이 실제로 걷는 평균 접근 거리 통계는 확인하지 못했다.
