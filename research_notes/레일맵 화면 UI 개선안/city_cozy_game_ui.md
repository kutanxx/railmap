# 도시 건설·코지 빌더 게임의 화면 UI (최소 HUD, 단계적 공개, 처음 배우기)

조사일: 2026-10-27. 검색·페치 약 20회. 여러 출처(PCGames Hardware, gamedev.net, TouchArcade 일부)는 403으로 본문을 못 읽어 검색 요약만 썼고, 그런 곳은 따로 적었다. 옛 정보는 연도를 붙였다.

## 1. 도구 막대, 정보 패널, 전체 수치(돈·인구·날짜)를 어떻게 놓는가

### Takeaway
확인된 사례에서는 "아래쪽 막대 하나 + 그 안의 분류(카테고리) 메뉴"가 기본이다 (Pocket City, Cities: Skylines). 콘솔·터치판은 원형(라디얼) 메뉴로 다시 짰다 (Frostpunk). 코지 게임(Dorfromantik, Townscaper, Mini Metro)은 화면 요소를 줄이는 것 자체를 설계 원칙으로 둔다. 2026년에 CS2가 고친 내용도 막대를 더 단순하게 만들고, 크기와 투명도를 바꿀 수 있게 하는 쪽이었다.

### Cited Findings
- Pocket City(1편, 2018 무렵 리뷰): 건물은 아래 도구 막대의 Build 버튼 뒤에 분류별로 들어 있고, 손가락으로 땅을 끌어 놓는다. 거의 모든 조작이 메뉴와 끌어 놓기로 이뤄진다. 다만 UI에 "거슬리는 버릇"이 있고, 특히 세로 화면에서 그렇다는 평이 있다 — [Destructoid 리뷰](https://destructoid.com/?p=227371) (검색 요약 기준)
- Pocket City 2(2023): TouchArcade는 터치 조작이 "거의 완벽"하다고 평했다. 앱스토어 사용자 리뷰는 1편의 직관적인 UI를 그대로 이어받았다고 했다 — [TouchArcade 리뷰](https://toucharcade.com/2023/04/18/pocket-city-2-review-mobile-iphone-ipad-premium-city-builder/) (본문 403, 검색 요약만 확인); 이후 업데이트로 컨트롤러 지원이 붙었다 — [appgefahren](https://www.appgefahren.de/pocket-city-2-jetzt-mit-controller-support-und-survival-modus-358757.html)
- Frostpunk 콘솔판(2019): 도시가 발전기를 가운데 둔 원형이라 UI도 원으로 새로 짰다. "Command Hub"는 큰 원 둘레에 작은 원들이 붙어 다른 탭으로 이어진다. 건물 분류(의료, 석탄, 주거)마다 원 하나가 하위 메뉴 노릇을 한다. 엄지로 꼭 필요한 기능에 닿게 했고, PC UI를 옮기지 않고 처음부터 다시 만들었다. "City Info" 패널이 사회 상태의 핵심 정보를 보여준다 — [Xbox Wire, Kuba Stokalski](https://news.xbox.com/en-us/?p=125332)
- Cities: Skylines II(2026-01-29 City Corner #1, 새 개발사 Iceflake): 도구 막대의 색과 모양을 바꾸고 모서리를 더 둥글게 했다. 수요 막대(demand bars)를 더 눈에 띄게 했다. 개발 트리(Development Tree)는 새 색, 현대화한 모양, 더 나은 아이콘 품질을 받았다. 개발사 말: "UI가 때로 무언가를 전달하는 데 조금 헷갈릴 수 있다는 걸 안다", 목표는 "UI를 더 이해하기 쉽게" — [Paradox 공식 City Corner #1](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/upcoming-visual-updates)
- CS2 2026년 봄 패치: 도구 막대 크기와 UI 투명도를 플레이어가 조절할 수 있게 했다 (2026-04-25 기사) — [PCGH](https://www.pcgameshardware.de/Cities-Skylines-2-Spiel-74219/News/Update-Patch-Benchmark-Tool-1527926/) (본문 403, 검색 요약 기준)
- Dorfromantik: 개발진이 디자인 기둥 네 개 중 하나로 "Minimalism and Simplicity"를 두었다. 타이머처럼 압박을 주는 요소를 뺐다. "어수선한 UI나 많은 글 상자와 설명을 피하고 싶었다. 핵심 규칙은 쉽게 전달되어야 했다" — [Digital Trends 인터뷰](https://digitaltrends.com/?p=3063350) (검색 요약의 인용, 원문 페치는 실패)
- Townscaper: "단순하고 미니멀한 UI". 목표나 이야기가 없고, 개발자 Oskar Stålberg는 "게임이라기보다 장난감"이라고 불렀다. 블록은 주변에 따라 저절로 모양이 바뀐다 (아치, 계단 등) — [Wikipedia](https://en.wikipedia.org/wiki/Townscaper)
- Mini Metro / Mini Motorways (Dinosaur Polo Club): GDC 2017 강연 "Mini Metro: When Less Is More"(Jamie Churchman)는 UI와 시각 디자인이 보상감에 끼치는 영향, 일관된 시각 언어, "빼는 과정으로 아름다움을 디자인하기"를 다뤘다 — [Game Developer](https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev)
- Peter Curry(Mini Metro): "이렇게 미니멀한 게임에서는 분야를 나눌 수 없다. 그래픽 디자인이 곧 게임 디자인이다" — [Giant Bomb 인터뷰](https://giantbomb.com/users/3929/articles/interview-peter-curry-co-creator-of-mini-metro) (검색 요약 기준)
- Dinosaur Polo Club 아티스트: "미니멀한 게임에 엄청난 양의 일이 들어간다는 걸 배웠다" — [Dinosaur Polo Club 블로그 2023](https://dinopoloclub.com/2023/07/20/a-chat-with-the-devs-part-two/)
- Mini Motorways는 Mini Metro처럼 Helvetica, 굵은 색, 단순한 도형을 로고와 화면에 쓴다 — [Fonts In Use](https://fontsinuse.com/uses/51247/mini-motorways-logo-and-interfaces); 리뷰어들은 어수선하지 않은 UI라 쉽게 집어 들 수 있고 조작을 "과하게 디자인하지 않았다"고 평했다 — [Nintendo World Report](https://nintendoworldreport.com/review/60463), [Pocket Tactics](https://www.pockettactics.com/mini-motorways/review) (검색 요약 기준)
- Frostpunk 2(2024-07): 베타 피드백을 받아 HUD를 "더 명확하고 직관적으로" 만들고, 새 건설 메뉴를 넣고, Idea Tree의 "명료함, 읽기 쉬움, 느낌"을 다시 손봤다 — [PCGamesN](https://www.pcgamesn.com/frostpunk-2/ui-improvements)
- 플레이어 의견(개발사 입장 아님): Frostpunk 2의 UI가 너무 작고 흩어져 있어서, 1편 UI가 도시와 더 잘 이어졌다는 Steam 토론 글 — [Steam 토론](https://steamcommunity.com/app/1601580/discussions/0/7845908683579905746)

### Inferences
- 레일맵처럼 차분한 게임에 맞는 배치: 아래(또는 한쪽)에 도구 막대 하나, 왼쪽 위에 날짜·지역 배지, 돈은 작은 수치 하나만 늘 보이게 하고 나머지 통계는 열어야 보이게.
- CS2가 2026년에 도구 막대 크기와 투명도 설정을 넣은 것은, 복잡한 빌더에서도 "지도가 주인공"이라는 요구가 컸다는 뜻으로 읽힌다. 레일맵은 반투명을 금지하므로 대신 "숨기기/줄이기" 토글이 맞는 해석이다.
- Mini Metro 계열의 "빼서 디자인하기"는 레일맵의 플랫 벡터 아트 규칙과 같은 방향이다. 지도 위 색을 플레이어가 만든 것에만 쓰는 규칙이 UI에도 그대로 이어질 수 있다.

### Gaps
- Islanders, Dorfromantik의 화면 배치(점수·남은 타일이 정확히 어디에 있는지)를 그대로 적은 1차 출처를 찾지 못했다.
- SimCity BuildIt의 UI 배치는 조사하지 못했다 (호출 수 제한).
- 정보 패널을 오른쪽 고정 패널로 둘지, 떠 있는 카드로 둘지, 아래 시트로 둘지를 직접 비교한 개발자 글은 찾지 못했다.

## 2. 정보 보기(오버레이): 켜고 끄는 법과 색 설명(범례)

### Takeaway
Cities: Skylines 1의 정보 보기(info views)가 이 장르의 기준이다. 한 번에 하나의 보기를 켜면 지도 전체가 그 주제의 색으로 바뀌고, 관련 건물·도로만 강조된다. 숨은 배관 같은 것도 보이게 된다. 색은 거의 빨강–초록 척도이고, 작은 막대(meter)로 요약을 함께 보여준다.

### Cited Findings
- CS1의 정보 보기는 도시 서비스(전기, 쓰레기, 교육, 의료, 소방, 치안, 라디오, 대중교통), 시민(행복, 주택 등급, 인구), 지도(오염, 땅값, 자원, 구역)로 묶이고, 30개가 넘는다 — [Cities: Skylines Wiki, Info views](https://skylines.paradoxwikis.com/Info_views) (v1.16 기준, 옛 정보)
- 색 규칙 예: 전기 보기는 부족(빨강)·여유 적음(노랑)·충분(초록) 막대가 있다. 행복 보기는 건물이 빨강→초록으로 칠해진다. 교육·쓰레기 보기는 서비스가 닿는 도로가 초록, 안 닿으면 회색이다. 교통 보기는 많이 쓰이는 도로가 빨강인데, 위키는 "빨강이 늘 정체를 뜻하지는 않는다"고 적었고, 평균 흐름 막대를 함께 보여준다 — [같은 위키](https://skylines.paradoxwikis.com/Info_views)
- 정보 보기를 켜면 세상 그리기 자체가 바뀐다. 전기가 들어간 건물은 파랑으로 보이고, 주변에 하늘색 공급 범위가 그려진다. 물·난방 보기에서는 땅속 배관이 드러나고, 그 보기 안에서 배관을 지울 수도 있다. 대중교통 보기는 교통수단별 노선과 시설을 강조한다 — [같은 위키](https://skylines.paradoxwikis.com/Info_views)
- CS2 출시 리뷰(2023): 트램 선로를 깔 때 어느 도로에 트램 선로가 있는지 보기 어렵다는 지적이 있었다 — [TheSixthAxis 리뷰](https://www.thesixthaxis.com/2023/10/24/cities-skylines-2-review/)

### Inferences
- 레일맵의 [혼잡도 보기], [지형] 버튼은 이미 CS식 "한 번에 하나 켜는 정보 보기"와 같은 모양이다. CS처럼 켠 보기 옆에 작은 색 설명과 요약 막대(예: 평균 혼잡도)를 붙이면 된다.
- CS 교통 보기의 "빨강이 늘 나쁜 건 아니다" 문제는 레일맵 혼잡도 색에도 해당된다. 범례 문구를 "많이 탐"처럼 사실만 적는 편이 오해가 적다.
- 정보 보기 안에서만 할 수 있는 조작(CS의 배관 지우기)은, 레일맵의 [지형] 보기에서 터널·교량 선로를 손보게 하는 식으로 응용할 수 있다.

### Gaps
- Anno 1800의 정보 레이어(매력도, 영향력 범위 등)를 어떻게 켜고 범례를 보여주는지 설명한 출처를 찾지 못했다. 검색에는 치트 트레이너 단축키만 나왔다.
- CS1에서 정보 보기를 여는 단축키와 버튼 위치를 적은 출처를 이번에는 확인하지 못했다.
- CS2 정보 보기(info views)에 대한 패치 변경 내용은 찾지 못했다.

## 3. 알림 설계: 지도 위 아이콘, 심각도 단계, 알림 피로 피하기

### Takeaway
1차 개발자 자료는 거의 없었고, 증거는 대부분 플레이어 포럼이다. 공통 요구는 네 가지다: 급하지 않은 알림은 숨기거나 약하게, 급한 것과 덜 급한 것은 색으로 나누기, 아이콘 크기 조절, 정말 급한 일은 소리나 다른 색으로 확실히 알리기.

### Cited Findings
- Timberborn: 건물 위에 뜨는 원형 경고 아이콘을 건물마다 끌 수 있게 해 달라는 오래된 요청이 있다. 꽉 찬 창고나 물탱크처럼 급하지 않은 알림은 덜 놀라운 색이나 끌 수 있게 해 달라는 의견, 확대했을 때 아이콘이 "너무 크다"는 의견이 있다 — [Timberborn Feature Upvote](https://timberborn.featureupvote.com/suggestions/312554/comment/313282)
- Workers & Resources: 알림을 놓쳐 건물을 잃었다는 반대 문제가 있다. 화재 같은 긴급 상황에는 사이렌 소리와 다른 색 알림이 필요하다는 제안이 나왔다 — [Steam 토론](https://steamcommunity.com/app/784150/discussions/0/3124911622556818847)
- Urban Empire: 건물 위 기호가 2초만 떠서 읽기 어렵다는 불만 — [Steam 토론](https://steamcommunity.com/app/352550/discussions/0/143388132201535069)
- Songs of Conquest: 건물 완성 때마다 전체 화면 알림을 띄우는 대신, 건물 옆에 작은 표시를 두었다가 클릭하거나 마우스를 올리면 사라지게 하자는 의견이 많았다 — [Feature Upvote](https://songsofconquest.featureupvote.com/suggestions/303835/building-complete-splash-screen)
- Frostpunk(1편): 결정이 필요한 이야기 사건은 큰 아이콘 알림으로 뜨고, 콘솔에서는 진동이 함께 온다 — [Can I Play That? 청각장애 리뷰](https://caniplaythat.com/2020/01/16/deaf-game-review-frostpunk/); Steam 사용자는 1편의 작은 소리·시각 신호(법 통과, 위험한 폭풍)를 좋게 평했다 (플레이어 의견) — [Steam 토론](https://steamcommunity.com/app/1601580/discussions/0/7845908683579905746)
- CS2 출시 리뷰(2023): Destructoid는 "메뉴, 알림, 도구의 바다"를 짜증과 즐거움이 섞인 경험의 원인으로 꼽았다 — [Destructoid](https://destructoid.com/?p=417568)

### Inferences
- 레일맵은 이미 "지도 위 말풍선" 규칙이 있다. 여기에 단계 2~3개(정보/주의/위험)를 두고, 정보는 작은 점 표시만, 위험(파산 직전, 혼잡 150% 등)만 말풍선과 소리를 쓰는 식이 포럼 요구와 맞는다.
- 같은 종류 알림은 묶고, 사라지기 전에 충분히 오래 띄우거나 클릭할 때까지 남기는 편이 Urban Empire 같은 불만을 피한다.
- 개발 중인 소리 시스템(덕킹 등)을 위험 알림에만 쓰면 "소리 = 정말 중요"라는 약속이 생긴다.

### Gaps
- Frostpunk 알림 디자인에 대한 GDC 강연이나 개발사 글을 찾지 못했다.
- CS1/CS2의 건물 위 알림 아이콘 체계(심각도별 모양)를 설명한 1차 출처는 확인하지 못했다.
- 알림 피로에 대한 정식 UX 연구는 찾지 못했다.

## 4. 단계적 공개와 처음 배우기 (도구 잠금 해제, 튜토리얼 vs 상황별 힌트)

### Takeaway
두 가지 흐름이 확인된다. (1) CS1 마일스톤처럼 인구가 늘면 기능 묶음을 차례로 여는 방식, (2) Islanders·Mini Metro처럼 규칙이 단순해서 따로 가르칠 게 거의 없는 방식. CS2는 2026년 패치에서 첫 안내 과정을 짧게 다듬고, 아이콘을 더 뜻이 잘 드러나게 바꾸고, 검색되는 백과사전을 나중에 넣겠다고 했다. 리뷰어들은 "직접 해볼 때 비로소 튜토리얼이 이해됐다"고 말한다.

### Cited Findings
- CS1 마일스톤(v1.16 기준, 옛 정보): 시작 때는 전기·물·도로와 주거·상업·공업 구역만 있다. 인구 120~500의 "Little Hamlet"에서 대출·세금, 교육·쓰레기·의료가 열린다. 240~1,000의 "Worthy Village"에서 구역(districts), 두 번째 대출, 경찰이 열린다. 360~1,600의 "Tiny Town"에서 공원·산업 구역 등이 열린다 — [Cities: Skylines Wiki, Milestones](https://skylines.paradoxwikis.com/Milestones)
- 즉 CS1은 처음부터 돈·세금 화면을 다 보여주지 않는다. 세금·대출 기능 자체가 첫 마일스톤에서 열린다 — [같은 위키](https://skylines.paradoxwikis.com/Milestones)
- CS2 City Corner #1(2026-01-29): 첫 안내 과정을 다듬었고, 아이콘을 더 표현력 있게 바꿔 맥락을 이해하기 쉽게 했다. 분류별로 정리되고 검색되는 게임 내 백과사전은 나중에 넣을 계획이다 — [Paradox 공식](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/upcoming-visual-updates)
- CS2 출시 리뷰(2023): TechRadar는 UI가 도시 건설을 매끄럽게 설명한다고 칭찬했다 — [TechRadar](https://techradar.com/gaming/consoles-pc/cities-skylines-2-review-road-to-success). Destructoid는 튜토리얼이 "직접 해보기 전까지는 와닿지 않았다"고 했다 — [Destructoid](https://destructoid.com/?p=417568). 두 리뷰의 평가가 엇갈린다.
- Islanders: 한 번에 질문 하나만 던진다 (어떤 묶음을 고를지, 어디에 놓을지). 점수 기준에 닿으면 다음 묶음으로 테마 두 개 중 하나를 고른다 — [Wikipedia](https://en.wikipedia.org/wiki/Islanders_(video_game)), [Checkpoint Gaming, New Shores 리뷰 2025](https://checkpointgaming.net/reviews/2025/07/islanders-new-shores-review-a-whole-new-world/)
- Islanders: 놓은 건물은 지우거나 위에 지을 수 없다 — [Checkpoint Gaming](https://checkpointgaming.net/reviews/2025/07/islanders-new-shores-review-a-whole-new-world/). 긴 판에서는 코지한 느낌이 깨질 수 있다는 사용자 의견도 있다 (검색 요약 기준).
- Mini Metro: 마우스로 두 점을 이을 줄만 알면 플레이할 수 있고 나머지는 게임이 해 준다. 사람들이 이미 아는 지하철 노선도라는 시각 언어 덕에 접근성이 좋다는 평 — [Indie-o-rama 인터뷰](https://www.indieorama.com/mini-metro-and-robert-curry-the-minimalism-was-one-of-the-things-that-made-the-game-hard-to-make)
- Dorfromantik: 글 상자와 설명을 피하고 핵심 규칙이 쉽게 전달되게 했다 — [Digital Trends](https://digitaltrends.com/?p=3063350) (검색 요약 인용)

### Inferences
- 레일맵에 맞는 방식: 처음엔 [선택]·[역]·[선로]·[노선] 네 도구와 돈·날짜만 보이고, 첫 노선 개통 뒤에 혼잡도 보기, 빚을 처음 지면 빚 정보, 솔내 지방에서 처음 고도가 문제 될 때 [지형]·종단면도를 여는 식. CS1 마일스톤의 "기능 묶음을 단계적으로 연다"를 작게 옮긴 모양이다.
- 지금 있는 튜토리얼(역 → 선로 → 노선 → 열차 출발)은 Destructoid 지적처럼 "직접 하면서 배우는" 방식이라 맞는 방향이다. 그 뒤로는 상황이 생겼을 때 한 번만 뜨는 힌트(처음 혼잡 100% 넘음, 처음 빚)를 더하는 편이 긴 튜토리얼보다 낫다.
- Islanders의 "한 번에 질문 하나"는 패널을 열 때 버튼 수를 줄이는 원칙으로 쓸 수 있다.

### Gaps
- Mini Metro / Mini Motorways의 실제 튜토리얼 흐름을 설명한 1차 출처는 찾지 못했다.
- 잠금 해제형과 처음부터 다 여는 방식을 비교한 개발자·연구 자료는 찾지 못했다.
- CS2 2026 패치에서 실제로 바뀐 첫 안내의 구체 내용(몇 단계, 어떤 문구)은 확인하지 못했다.

## 5. 어수선한 빌더 UI 비판과 고친 방법 (CS2 중심)

### Takeaway
CS2 출시(2023-10) 때 UI 평가는 엇갈렸다 (쉽다 vs 메뉴·알림의 바다). 2025년 11월 개발이 Colossal Order에서 Iceflake로 넘어간 뒤, 2026년 1월 첫 개발 일지가 UI를 가장 먼저 고칠 대상으로 꼽았다. 고친 방향은 더 뜻이 잘 드러나는 아이콘, 더 단순하고 둥근 도구 막대, 수요 막대 강조, 짧은 첫 안내, 도구 막대 크기·투명도 설정이다.

### Cited Findings
- 2023 출시 리뷰: "메뉴, 알림, 도구의 바다", 그래도 메뉴는 읽기 쉽다 — [Destructoid](https://destructoid.com/?p=417568); 트램 선로가 깔린 도로를 알아보기 어렵다 — [TheSixthAxis](https://www.thesixthaxis.com/2023/10/24/cities-skylines-2-review/); 쉽게 다룰 수 있다 — [TechRadar](https://techradar.com/gaming/consoles-pc/cities-skylines-2-review-road-to-success)
- 2023년 주간 패치의 UI 수정은 메인 메뉴 여백, 일본어 배치 같은 작은 것들이었다 — [TechRaptor](https://techraptor.net/gaming/news/cities-skylines-2-gets-last-weekly-patch-with-even-more-fixes) (검색 요약 기준)
- Paradox는 2025년 11월 Colossal Order와 결별하고 Iceflake Studios가 개발을 이어받았다. Iceflake는 다음 패치에서 UI를 크게 손봐 더 이해하고 읽기 쉽게 하겠다고 했다 — [PCGames.de](https://www.pcgames.de/Cities-Skylines-2-Spiel-74219/News/UI-Ueberarbeitung-Iceflace-Studios-1494328/) (검색 요약 기준)
- City Corner #1(2026-01-29) 변경 목록: 짧아진 첫 안내, 더 표현력 있는 아이콘, 도구 막대 색·모양(더 둥글게), 수요 막대 강조, 개발 트리 정리, 건물·소품·차량 색 바꾸기 UI, 나중에 검색되는 백과사전 — [Paradox 공식](https://www.paradoxinteractive.com/games/cities-skylines-ii/news/upcoming-visual-updates)
- Ars Technica 요약: 핵심 업데이트는 다듬은 첫 안내, 더 표현력 있는 아이콘, 더 명확한 도구 막대 — [Ars Technica 재게시](https://chat.macaw.me/community/news.movim.eu/ArsTechnica/urn-uuid-2b81d2b1-2e51-5787-9967-795410a2ff8f) (재게시본, 검색 요약 기준)
- 봄 패치(2026-04 말 예정, 기사 2026-04-25): 도구 막대 크기와 UI 투명도 조절 — [PCGH](https://www.pcgameshardware.de/Cities-Skylines-2-Spiel-74219/News/Update-Patch-Benchmark-Tool-1527926/) (본문 403, 검색 요약 기준)
- Frostpunk 2도 베타 피드백 뒤 출시를 미루면서 HUD를 "더 명확하고 직관적으로" 바꿨다 (2024) — [PCGamesN](https://www.pcgamesn.com/frostpunk-2/ui-improvements)

### Inferences
- 두 큰 게임이 모두 "아이콘 뜻을 더 분명하게, 막대를 단순하게, 처음 안내를 짧게"로 고쳤다. 레일맵 도구 버튼도 아이콘만 두지 말고 짧은 한국어 글자를 함께 두는 편이 안전하다.
- "UI 크기 조절"은 노트북·태블릿 브라우저까지 생각하면 레일맵에도 쓸모 있는 설정이다.

### Gaps
- 2026년 CS2 패치 노트 원문(UI 항목)을 직접 확인하지 못했다. 실제로 나간 최종 모습은 미확인이다.
- CS2 출시 때의 UI 불만을 구체적으로 모은 UX 비평 글(Game Developer 등)은 찾지 못했다.

## 6. 되돌리기, 일시정지·배속, 단축키 알리기

### Takeaway
이번 조사에서는 이 주제의 출처를 거의 찾지 못했다. 확인된 건 Islanders가 놓은 건물을 지울 수 없게 한 점(되돌리기 없음이 긴장감의 원천) 정도다.

### Cited Findings
- Islanders: 놓은 건물은 지울 수도, 위에 지을 수도 없어 신중한 계획이 중요하다 — [Checkpoint Gaming](https://checkpointgaming.net/reviews/2025/07/islanders-new-shores-review-a-whole-new-world/)
- Dorfromantik는 타이머처럼 압박하는 요소를 뺐다 — [Digital Trends](https://digitaltrends.com/?p=3063350) (검색 요약 인용)

### Inferences
- 레일맵은 이미 되돌리기·다시 하기가 있으므로, 실수에 관대한 코지 쪽에 가깝다. 버튼 옆이나 마우스를 올렸을 때 단축키(Ctrl+Z 등)를 보여주는 일반 관례를 따르면 된다 (출처 없는 일반 관례).

### Gaps
- CS, Mini Motorways 등 일시정지·배속 버튼 위치와 단축키(스페이스 = 멈춤, 1/2/3 = 배속 등)를 확인한 출처를 이번에 찾지 못했다.
- 단축키를 알리는 방법(툴팁, 버튼 위 숫자, 도움말 카드)을 다룬 글도 찾지 못했다.

## 7. 마우스와 터치 둘 다 되는 패턴 (브라우저 게임)

### Takeaway
터치에서 좋은 평을 받은 빌더는 "아래 막대 → 분류 → 끌어서 놓기"(Pocket City)와 "두 점을 이어 긋기"(Mini Metro/Motorways)처럼 한 손가락 동작 하나로 핵심을 끝낸다. 컨트롤러·엄지 조작용으로는 원형 메뉴가 쓰였다(Frostpunk 콘솔판).

### Cited Findings
- Pocket City: 아래 막대의 Build 버튼, 분류별 건물, 손가락으로 끌어 놓기. 세로 화면에서는 UI 버릇이 거슬린다는 평 — [Destructoid](https://destructoid.com/?p=227371) (검색 요약 기준)
- Pocket City 2: 터치 조작 "거의 완벽" — [TouchArcade](https://toucharcade.com/2023/04/18/pocket-city-2-review-mobile-iphone-ipad-premium-city-builder/) (검색 요약 기준)
- Mini Motorways: 리뷰어가 직관적인 터치 조작의 본보기라고 평했다 — [Pocket Tactics](https://www.pockettactics.com/mini-motorways/review) (검색 요약 기준); 색약 옵션(건물·목적지 색을 고를 수 있음)과 밤 모드가 있다 — [검색 요약에 언급된 리뷰들](https://futurefive.co.nz/story/game-review-mini-motorways-pc)
- Mini Metro: 마우스로 두 점을 잇는 것만 알면 된다 — [Indie-o-rama](https://www.indieorama.com/mini-metro-and-robert-curry-the-minimalism-was-one-of-the-things-that-made-the-game-hard-to-make)
- Frostpunk 콘솔판: 엄지로 닿는 원형 메뉴, PC UI를 옮기지 않고 새로 만듦 — [Xbox Wire](https://news.xbox.com/en-us/?p=125332)
- Timberborn 플레이어: 확대하면 알림 아이콘이 너무 커진다, 크기 조절을 원한다 — [Timberborn Feature Upvote](https://timberborn.featureupvote.com/suggestions/312554/comment/313282)

### Inferences
- 레일맵의 오른쪽 클릭 취소, 단축키 같은 마우스 전용 동작에는 터치용 대안(화면의 [취소] 버튼, 길게 누르기)이 필요하다.
- 선로 긋기는 Mini Metro식 "끌어서 잇기"라 터치와 잘 맞는다. 다만 지도 이동(끌기)과 선로 긋기(끌기)가 부딪히므로 도구 모드로 나누는 지금 구조를 유지하는 게 좋다.
- 확대 단계에 따라 알림·라벨 크기를 고정 픽셀로 두는 편이 Timberborn 같은 불만을 피한다.

### Gaps
- 확대 단계별로 정보를 보여주는 방식(줌 레벨 단계적 공개)을 다룬 빌더 게임 출처를 찾지 못했다. Frostpunk 2의 "Zoom Stories"는 기사 제목에만 있고 내용은 확인하지 못했다 — [GamingBolt 제목](https://gamingbolt.com/frostpunk-2-gameplay-improvements-new-ui-features-and-zoom-stories-detailed)
- 브라우저 빌더 게임의 터치 조작을 다룬 개발자 글은 찾지 못했다.
- Game UI Database(gameuidatabase.com)는 이번에 직접 살펴보지 못했다. 스크린샷 비교에 다음 조사로 쓸 만하다.
