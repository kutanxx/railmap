# 디비전(The Division 1·2) 게임 UI 디자인 조사 메모

조사일: 2026-10-27. 검색 약 17번, 웹 문서 직접 읽기 약 8번.
표시 규칙: 모든 사실 뒤에 출처 링크를 단다. 출처를 못 찾은 것은 "빈칸(Gaps)"에 적는다. "(확인 안 됨)"은 출처가 약하거나 직접 확인하지 못한 내용이다.

> 미리 알려둘 한계: 질문에 있던 **정확한 색 코드(주황 #?), 게임 안 HUD 글꼴 이름, 디비전 1→2 UI가 왜 바뀌었는지 개발자 설명, ArtStation/Behance 포트폴리오, Game UI Database 항목, 디비전 리서전스(Resurgence)/하트랜드(Heartland) UI**는 믿을 만한 글 출처를 찾지 못했다. 아래 각 질문의 "빈칸"에 자세히 적었다.

---

## 1. 핵심 개념: 세상 안에 떠 있는 증강현실(AR) UI, SHD 기술, ISAC

### Takeaway
디비전 UI의 뼈대는 "화면 테두리에 붙은 계기판"이 아니라, 요원이 찬 **SHD 손목시계가 공중에 쏘아 올린 주황색 홀로그램**이라는 설정이다. HUD는 캐릭터 옆에 살짝 기울어져 붙어 있고, 지도는 축소된 도시 모형 홀로그램으로 펼쳐지며, 길 이름·진행 막대도 세상 속에 떠 있다. (이런 방식을 "디제틱(diegetic) UI"라고 부른다 — 게임 속 인물도 볼 수 있는, 이야기 세계 안에 실제로 존재하는 화면이라는 뜻.)

### Cited Findings
- **HUD가 화면이 아니라 캐릭터에 붙어 있다.** 2013년 공개 영상을 분석한 글은 HUD가 화면 둘레를 감싸지 않고 "환경 안에 녹아 있다"고 했고, 그래서 더 몰입된다고 평가했다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **HUD는 살짝 기울어져(비스듬히) 있다.** 이 기울기가 UI가 장면 속에 있다는 느낌을 더해준다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **HUD는 캐릭터가 움직이면 조금 따라 흔들리고, 멈춰서 둘러보면 같이 멈춘다.** 글쓴이는 이것이 긴장감을 더한다고 봤다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **손목 홀로그램 메뉴:** 캐릭터 손목을 빙 둘러싸는 홀로그램 회전 메뉴(캐러셀)가 있었다. 글쓴이는 "디제틱 UI의 좋은 예"라고 칭찬했지만, 플레이어가 그 메뉴를 실제로 어떻게 넘기는지는 의문이라고 적었다. 파이널 판타지, 매스 이펙트의 옴니툴(손목 장치)과 비교했다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **세상 속 글자와 진행 막대:** 거리 이름과 관심 지점이 공중에 떠 있는 글자로 표시되고, 금고 따기 같은 행동의 진행 막대도 세상 속에 들어 있다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **스마트 손목시계 공개(2014년 5월 14일):** 유비소프트가 첫 이미지를 공개했다. 원형이고, "주황색 홀로그램 배열"을 띄운다. 기능은 다른 요원 추적, 현재 위치 구조 보기, 인벤토리 관리, 지정 장소·아이템 표시. 유비소프트는 이 시계를 "요원에게 가장 중요한 장비 중 하나"라고 소개했다. — [Gameranx (2014)](https://gameranx.com/updates/id/21916/article/the-division-agents-wear-a-holographic-smart-watch-here-s-how-it-looks/)
- **ISAC(게임 속 AI 비서):** 팬 위키에 따르면 ISAC과 많은 SHD 기술은 게임 속 회사 "오르티스 로보틱스"가 만들었다는 설정이다. 독일 게임 매체 특집은 ISAC이 통신, 실시간 분석, 데이터 수집, 생체 신호 평가로 요원을 돕는다고 설명한다. 디비전 2에는 위성망을 다시 이어 ISAC을 전국에서 다시 켜는 임무가 있다. (팬 위키는 공식 자료가 아니므로 설정 참고용) — [Division 위키: Ortiz Robotics](https://thedivision.fandom.com/wiki/Ortiz_Robotics), [PC Games 특집(독일어)](https://www.pcgames.de/Tom-Clancys-The-Division-2-Spiel-61585/Specials/DIe-Geschichte-der-Serie-in-der-grossen-Reportage-1345471/), [Division 위키: Space Administration HQ](https://thedivision.fandom.com/wiki/Space_Administration_HQ)

### Inferences
- UI가 "손목시계가 쏜 빛"이라는 설정 하나로 HUD·지도·메뉴·알림 목소리(ISAC)를 모두 설명한다. 그래서 UI가 게임 세계관을 깨지 않는다. 레일맵에 빗대면 "관제 단말기 화면"처럼 한 가지 설정으로 모든 패널을 묶는 방식이 된다.
- HUD를 캐릭터 옆에 비스듬히 붙인 것은 3인칭 슈팅 게임이라 가능한 방식이다. 레일맵 같은 위에서 내려다보는 지도 게임에는 그대로 옮기기 어렵고, "지도 위에 떠 있는 말풍선·라벨" 쪽이 같은 생각에 가깝다.

### Gaps
- ISAC의 정식 풀이(약자 뜻)를 믿을 만한 출처에서 확인하지 못했다. 흔히 "Intelligent System Analytic Computer"라고 알려져 있으나 이번 검색에서는 확인되지 않았다 **(확인 안 됨)**.
- 적 머리 위 체력 막대, 땅바닥에 그려지는 길 안내 선(GPS 선), 등에 붙은 UI 등 구체적 구현을 다룬 글 출처를 찾지 못했다. 이 기능들은 게임 화면에 실제로 있다고 널리 알려져 있지만 이번 조사에서 출처로 확인하지 못했다 **(확인 안 됨)**.
- 2013년 분석 글은 출시 3년 전 시연 영상 기준이다. 손목 회전 메뉴 같은 일부 요소는 출시판에서 달라졌을 수 있다.

---

## 2. 시각 언어: 색, 글꼴, 선 굵기, 모양, 빛남, 움직임

### Takeaway
확인된 것은 **주황색 홀로그램이 일부러 고른 세계관 장치**라는 점과, 디비전 브랜드 글꼴이 **Borda(보르다)**라는 점 두 가지다. 정확한 색 코드, 게임 HUD 안의 글꼴, 선 굵기·애니메이션 시간 같은 세부 수치는 공개된 글 출처를 찾지 못했다.

### Cited Findings
- **주황 홀로그램:** 스마트 시계가 "주황색 홀로그램 배열"을 띄운다고 공식 공개 때 소개됐다. — [Gameranx (2014)](https://gameranx.com/updates/id/21916/article/the-division-agents-wear-a-holographic-smart-watch-here-s-how-it-looks/)
- **글꼴 Borda:** 글꼴 회사 The Northern Block의 사례 소개에 따르면, Borda는 디비전(2016)과 후속작의 마케팅 자료, 트레일러, 옷, SNS, 공식 웹사이트에 쓰였다. 유비소프트 대변인(이름 없음)은 이 글꼴이 여전히 "브랜드와 게임 정체성에 가장 잘 맞는다"고 했다. 글은 Borda의 기하학적이고 논리적인 모양이 게임의 미래적·종말적 분위기와 어울린다고 설명한다. — [The Northern Block: Borda 사례](https://www.thenorthernblock.com/casestudy-borda)
- **Borda의 성격:** 조너선 힐(Jonathan Hill)이 디자인했고 2012년에 나왔다. 화면용으로 만든 기하학적 산세리프(끝에 꺾쇠 장식이 없는 글꼴)로, 비스듬히 잘린 획과 둥글린 모서리, 촘촘한 글자 폭, 6가지 굵기(각각 기울임꼴 포함)를 가진다. — [The Northern Block: Borda](https://thenorthernblock.co.uk/fonts/p/borda), [Fontspring: Borda](https://fontspring.com/fonts/northern-block/borda)
- **로고 글꼴은 따로:** 팬 글꼴 사이트는 공식 사이트 제목·본문이 Borda이고, 로고의 "THE DIVISION"은 Helvetica Black을 바탕으로 한 것 같다고 적었다 (추정 표현) **(확인 안 됨)**. — [FontMeme](https://fontmeme.com/tom-clancys-the-division-font/)
- **홀로그램에 밝은 색이 잘 보이는 이유(배경 지식):** 마이크로소프트 홀로렌즈 디자인 지침에 따르면 홀로그램 기기는 빛을 더하는 방식이라 흰색은 밝게, 검정은 투명하게 보인다. 디비전에 대한 글은 아니지만, 홀로그램 UI에 밝고 채도 높은 색을 쓰는 이유의 배경이다. — [Microsoft: Color, light and materials](https://learn.microsoft.com/fi-fi/windows/mixed-reality/design/color-light-and-materials)

### Inferences
- 주황은 회색·눈 덮인 뉴욕 배경(차가운 색)과 반대되는 따뜻한 색이라 눈에 잘 띄었을 것이다 (추론, 출처 없음).
- 레일맵의 "배경은 베이지, 플레이어가 만든 것만 색" 규칙과 디비전의 "세상은 무채색, UI만 주황" 방식은 같은 원리다: 바탕을 조용하게 두고 강조 색 하나로 중요한 것만 띄운다.

### Gaps
- **정확한 주황 색 코드**(예: #F?????), 아군 청록·적 빨강의 정확한 값: 공식이나 디자이너 자료를 찾지 못했다. 팬들이 화면에서 뽑은 값은 있을 수 있으나 출처로 쓸 만한 것을 찾지 못했다.
- **게임 HUD·메뉴 안의 글꼴:** Borda가 게임 화면 안에도 쓰였는지는 Northern Block 글도 분명히 말하지 않는다("화면 속 게임 그림" 정도로만 언급). Bebas 등 다른 글꼴 설도 확인하지 못했다.
- 육각형·꺾쇠 괄호·얇은 외곽선, 주사선(scanline)·글리치 효과, 애니메이션 시간(몇 밀리초 등)에 대한 설계 문서나 인터뷰를 찾지 못했다.
- 효과음(UI 소리) 설계 자료도 찾지 못했다. 2013년 분석 글에 "지도에서 관심 지점을 고르면 소리가 난다"는 언급만 있다 — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/).

---

## 3. 3D 홀로그램 지도와 다크존 UI, 정보량 다루기

### Takeaway
지도는 "거인의 눈높이에서 내려다보는 축소 도시 홀로그램"으로, 열릴 때 애니메이션이 있고 관심 지점을 고르면 소리가 난다. 정보가 너무 많다는 비판이 컸고, 시선 추적 장치로 안 보는 UI를 흐리게 하는 실험도 있었다.

### Cited Findings
- **축소 홀로그램 지도:** 플레이어가 도시를 "거인의 관점"에서 내려다보며 길을 찾는다. 지도가 열릴 때 애니메이션으로 펼쳐지고, 관심 지점을 고르면 소리가 난다. 시연에서는 경찰서 지도를 스캔하자 플레이어 지도가 저절로 갱신됐다. 글쓴이는 영화 아이언맨 3와 비슷하다고 했다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **다크존은 메뉴 없이 이어진다:** 마시브의 IP 책임자 마틴 훌트베리(Martin Hultberg)는 캠페인 지역과 다크존 사이를 로비나 메뉴 없이 매끄럽게 오가는 것이 스노우드롭 엔진의 핵심이라고 말했다 (검색 요약으로 확인, 원문 직접 읽지 못함). — [Wccftech](https://wccftech.com/divisions-snowdrop-engine-ubisoft-titles-future/amp/)
- **화면이 복잡하다는 비판(디비전 1):** 데스트럭토이드 기자 브렛 마케돈스키(2016년 3월 17일)는 AR 스타일 UI가 화면에 늘 떠 있어서 뉴욕 풍경을 즐기기 어렵다고 했다. 숫자가 "정말 어디에나" 있다고 썼다. — [Destructoid (2016)](https://destructoid.com/eye-tracking-tech-makes-the-divisions-cluttered-ui-way-more-bearable)
- **시선 추적으로 정보량 줄이기:** GDC 2016에서 토비(Tobii) 시선 추적 장치 시연에서는, 플레이어가 쳐다보는 UI만 밝아졌다. 전투 중에는 미니맵이 흐려지고, 돌아다닐 때는 체력·탄약 표시가 흐려졌다. 기자는 이 덕분에 복잡함이 훨씬 견딜 만해졌다고 했다. — [Destructoid (2016)](https://destructoid.com/eye-tracking-tech-makes-the-divisions-cluttered-ui-way-more-bearable)
- **HUD 고치기(디비전 2):** 디비전 2에서는 미니맵이나 다른 아이콘을 옮기거나 끌 수 있고, 파티 목록·오른쪽 위 알림·다크존 정보·목표 글자의 크기를 따로 키울 수 있다 (검색 요약 기반, 원문 직접 확인 못 함). — [Can I Play That: Mobility review](https://caniplaythat.com/2019/03/19/mobility-game-review-the-division-2/), [GameRevolution](https://www.gamerevolution.com/?p=510195)

### Inferences
- "상황에 따라 필요 없는 UI를 흐리게" (전투 중 지도, 이동 중 체력)는 시선 추적 없이도 쓸 수 있는 아이디어다. 레일맵에서는 "선로 그리는 중에는 수입 패널을 흐리게" 같은 식으로 옮길 수 있다.
- 디비전의 문제(숫자가 너무 많음)는 루트 슈터(아이템 수치가 중요한 게임) 특성 때문이기도 하다. 레일맵처럼 숫자(자금·승객·혼잡도)가 많은 게임도 같은 위험이 있다.

### Gaps
- 지도의 층(레이어)·필터·확대 단계가 어떻게 설계됐는지 설명한 개발자 자료를 찾지 못했다.
- 다크존 전용 UI(오염 아이템 표시, 로그 요원 표시 등) 설계 자료를 찾지 못했다.

---

## 4. 디비전 1과 2의 UI 차이, 그리고 왜 바뀌었나

### Takeaway
출시 전 체험기들은 "디비전 2 UI가 1편과 거의 같다"는 의견과 "더 매끈해졌다"는 의견이 섞여 있다. 큰 변화는 출시 후 업데이트(2019년 10월, 에피소드 2 / 타이틀 업데이트 6)의 인벤토리·메뉴 개편이며, 유비소프트는 이유로 "플레이어 피드백"과 "더 효율적인 탐색"을 들었다. 개발자가 1→2 HUD 변화 이유를 직접 설명한 인터뷰는 찾지 못했다.

### Cited Findings
- **2019년 2월 베타 체험기:** 디비전 2 UI를 매끈하다고 칭찬하고, 1편에는 나쁜 디자인 선택이 많았다고 평했다 (검색 요약 기반). — [GamingBolt](https://gamingbolt.com/the-division-2-is-shaping-up-to-be-a-huge-improvement-over-its-predecessor)
- **E3 체험기(반대 의견):** 한 체험기는 UI가 1편과 "구별이 안 된다"고 했고, 다른 체험기는 큰 개편은 없어 보이며 플레이어 정보가 머리 위와 오른쪽 아래에 두 번 나와 반복적이라고 했다 (검색 요약 기반, 어느 글이 어느 말을 했는지 정확히 확인 못 함) **(확인 안 됨)**. — [GameCloud 첫인상](https://gamecloud.net.au/features/first-impressions/the-division-2), [MP1st 베타 체험](https://mp1st.com/news/the-divsion-2-private-demo-hands-on-impressions-familiar-construct)
- **베타에서 DPS(초당 피해량) 숫자가 빠졌다:** 1편에서 무기를 비교할 때 가장 중요한 숫자였는데 2편 베타에서는 없었다는 지적. — [MP1st 베타 체험](https://mp1st.com/news/the-divsion-2-private-demo-hands-on-impressions-familiar-construct)
- **2019년 10월 5일 발표된 UI 개편 (에피소드 2 / TU6):**
  - 로드아웃(장비 묶음) 최대 12개로 늘림
  - 모드 인벤토리를 공격·방어·유틸리티(+예전 모드용 일반)로 나누고 격자 보기 추가
  - 무기가 굴려진 피해량을 기본 피해량과 비교해 보여줌
  - 이름 붙은 아이템에 꺾쇠(chevron) 무늬와 하이엔드 글자색
  - 모든 인벤토리에 필터·정렬 추가, 화면 아래에 현재 정렬·필터 표시
  - 장착한 장비가 더 눈에 띄게, 비교 화살표와 색 있는 속성 아이콘
  - 옵션 메뉴를 격자 모양으로 다시 만듦
  - 능력치가 어디서 오는지 보여주는 "능력치 분해" 페이지
  - 유비소프트가 밝힌 이유: 피드백을 "아주 많이" 받았고, "더 효율적인 탐색"을 위해, 전리품이 많아서 필요한 장비를 찾게 하려고. — [PlayStation LifeStyle (2019)](https://www.playstationlifestyle.net/2019/10/05/division-2-update-ui-overhaul/)

### Inferences
- 디비전 2의 UI 변화는 "보기 좋게"보다 "숫자 많은 인벤토리를 빨리 찾게"가 중심이었다. 정렬·필터·분류·비교 화살표는 레일맵의 노선 목록·역 목록이 길어질 때도 그대로 쓸 수 있는 방법이다.

### Gaps
- 1→2 HUD 변화(색, 크기, 배치)에 대한 마시브 공식 설명이나 인터뷰를 찾지 못했다.
- 콘솔과 PC UI 차이 설계 자료를 찾지 못했다.
- 디비전 리서전스(모바일)·하트랜드(취소된 생존 게임) UI는 이번 조사에서 자료를 찾지 못했다.

---

## 5. 디자인 강연·기사·포트폴리오 (만든 과정)

### Takeaway
확인된 공식 강연은 **GDC 2017 "Lessons Learned Creating UI for 'The Division'" (크리스티앙 사부아, 마시브)** 하나다. 새 UI 기술(시스템)을 바닥부터 만든 교훈을 다루며, 프로그래머 쪽 이야기에 가깝다. UI 아티스트의 공개 포트폴리오(ArtStation, Behance)는 찾지 못했다.

### Cited Findings
- **GDC 2017 강연:** 마시브의 크리스티앙 사부아(Christian Savoie)가 디비전을 위해 UI 시스템을 바닥부터 새로 만들며 배운 교훈을, 팀이 부딪힌 문제 예시와 함께 설명했다. UI 프로그래머 대상. GDC 유튜브에 무료 공개. — [Game Developer (2018)](https://gamedeveloper.com/design/video-designing-a-new-ui-system-for-i-the-division-i-), [GDC Vault 페이지](https://gdcvault.com/play/1024026/Lessons-Learned-Creating-UI-for) (조사 당시 GDC Vault는 점검 중이라 원문을 열지 못함)
- **UI는 스노우드롭 엔진 안에서 노드 편집기로 만든다:** 마시브 채용 공고(디비전 2 서바이버즈, 시니어 UI 테크니컬 아티스트)에 따르면 스노우드롭의 노드 기반 편집기로 게임 화면 UI를 만들고, 포토샵·일러스트레이터·애프터 이펙트를 쓴다. — [Jobbank 채용 공고](https://jobbank.dk/en/job/3111465/massive-entertainment-a-ubisoft-studio/senior-ui-technical-artist/)
- **UI 아티스트 크레디트:** 모비게임즈에 올리버 야노셰크(Oliver Janoschek)가 디비전 2 UI 아티스트로 올라 있다. — [MobyGames](https://www.mobygames.com/person/465013/)
- **작업 방식(개인 프로필):** 유비소프트 루마니아 출신 UI 아티스트의 링크드인은 디비전 2 UI 콘셉트를 낮은 완성도 와이어프레임(뼈대 그림)부터 최종 프로토타입까지 만들고, 스노우드롭에 내부 비주얼 스크립팅 도구로 넣었다고 적었다. — [LinkedIn: Cosmin Ispas](https://ro.linkedin.com/in/cosminispas)
- **Game UI Database:** 에드 코츠(Edd Coates)가 만든 게임 UI 스크린샷 모음으로, 2.0판은 1,341개 게임의 스크린샷 55,000장 이상을 HUD 요소 등으로 찾을 수 있다. 다만 디비전 항목 페이지는 이번 검색에서 직접 확인하지 못했다. — [Creative Bloq](https://creativebloq.com/3d/video-game-design/game-ui-database-20-is-the-ultimate-free-reference-tool-for-game-designers)

### Inferences
- 디비전 UI는 "예쁜 그림"만이 아니라 엔진 안에 UI 전용 도구를 새로 만든 기술 프로젝트였다. 세상 속(3D 공간)에 UI를 띄우려면 일반 2D 메뉴 도구로는 부족했을 것이다 (추론).

### Gaps
- 사부아 강연의 구체적 내용(슬라이드, 교훈 목록)은 원문을 열지 못해 적지 못했다.
- 디비전 1·2 UI/UX 디렉터 인터뷰, 아트 디렉터의 UI 관련 발언을 찾지 못했다 (아트 디렉터 로드리고 코르테스 인터뷰가 있으나 독일어 포럼 글이라 UI 언급 여부 확인 못 함 — [PCGH](https://extreme.pcgameshardware.de/threads/327494)).
- ArtStation·Behance 사례 연구를 찾지 못했다.

---

## 6. 평가: 칭찬과 비판, 접근성 옵션

### Takeaway
칭찬은 "세상 속에 녹아든 몰입감 있는 UI", 비판은 "숫자와 UI가 너무 많아 풍경을 가린다"로 나뉜다. 디비전 2는 큰 글씨, 고대비 UI, 색맹 모드, 메뉴 읽어주기, HUD 요소 옮기기·끄기 같은 접근성 옵션을 갖췄다.

### Cited Findings
- **칭찬:** 손목 홀로그램 UI는 디제틱 UI의 좋은 예, HUD를 시점에 묶은 방식이 몰입감을 준다. — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- **비판:** 화면이 바빠서 풍경에서 눈을 돌리게 만들고, 숫자가 어디에나 있다. — [Destructoid (2016)](https://destructoid.com/eye-tracking-tech-makes-the-divisions-cluttered-ui-way-more-bearable)
- **디비전 2 베타(2019년 2월 7일 기사) 접근성 메뉴:** 큰 글꼴, 고대비 UI, 색맹 모드(종류는 기사에 안 나옴), 메시지 알림, 메뉴 읽어주기(음량 따로). 자막은 전체/화자만, 크기, 언어, 화자 강조. — [DualShockers (2019)](https://www.dualshockers.com/division-2-accessibility-options-private-beta/)
- **세부:** 큰 글꼴을 켜면 모든 메뉴 글자가 커지고, 고대비 UI는 메뉴 배경을 훨씬 어둡게 해 글을 읽기 쉽게 한다. 글자 크기는 한꺼번에가 아니라 메뉴·자막·HUD로 나눠 조절한다. 자막 대비 옵션이 10가지 있었다 (검색 요약 기반). — [GameRevolution](https://www.gamerevolution.com/?p=510195), [Can I Play That: Deaf review](https://caniplaythat.com/?p=897)

### Inferences
- 고대비 모드가 "배경을 더 어둡게"라는 점은, 반투명 홀로그램 UI가 밝은 배경 위에서 읽기 어렵다는 약점을 스스로 인정하고 보완한 것으로 볼 수 있다 (추론). 레일맵이 그림자·반투명을 쓰지 않는 플랫 규칙은 이 문제를 처음부터 피한다.

### Gaps
- 색맹 모드의 종류(적록·청황 등)와 어떤 색이 바뀌는지 확인하지 못했다.
- UI 전체 크기(스케일) 조절 슬라이더가 있는지 확인하지 못했다.
- 디비전 1의 접근성 옵션 자료는 찾지 못했다.

---

## 7. 비슷한 디제틱/AR UI 참고 (맥락용, 짧게)

### Takeaway
이번 조사에서는 비교 게임들에 대한 출처를 깊게 찾지 않았다. 확인된 것은 디제틱 UI를 다룬 다른 GDC 강연 몇 개뿐이다.

### Cited Findings
- **GDC 2021 "Cutting Apart The Diegetic Interface" (하드스페이스: 십브레이커, 비디 샤):** 완전 디제틱 UI를 다룬 강연. — [GDC Vault](https://www.gdcvault.com/play/1027158/Cutting-Apart-The-Diegetic-Interface), [GDC 소식](https://gdconf.com/news/go-behind-fully-diegetic-ui-hardspace-shipbreaker-gdc-2021)
- **GDC 2024 스타워즈 제다이: 서바이버의 몰입형 UI 강연.** — [GDC 일정](https://schedule.gdconf.com/session/ux-summit-designing-immersive-ui-for-star-wars-jedi-survivor/901582)
- **HUDs and GUIs는 디비전 손목 UI를 매스 이펙트 옴니툴, 파이널 판타지와, 지도를 아이언맨 3과 비교했다.** — [HUDs and GUIs (2013)](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)

### Inferences
- 데드 스페이스(체력 막대가 주인공 등뼈 장치에 표시), 고스트 리콘 브레이크포인트, 데스티니, 사이버펑크 2077은 흔히 디제틱/AR UI 예로 언급되지만 이번 조사에서 출처를 확인하지 않았다 **(확인 안 됨)**.

### Gaps
- 데드 스페이스·고스트 리콘 브레이크포인트·데스티니·사이버펑크 2077 UI에 대한 출처 있는 비교는 조사하지 못했다 (도구 호출 횟수 한도).
