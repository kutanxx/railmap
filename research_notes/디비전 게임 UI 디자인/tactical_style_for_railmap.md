# 디비전 같은 "전술 HUD" 화면 스타일을 2D 지도 게임(레일맵)에 쓰는 법

> 용어 풀이
> - **HUD**(헤드업 디스플레이): 게임 화면 위에 겹쳐 띄우는 정보 표시(체력, 지도, 숫자 등).
> - **AR**(증강현실): 실제 세상 위에 가상의 글자·선을 겹쳐 보이게 하는 것. 디비전은 "요원의 안경/시계가 세상 위에 정보를 띄운다"는 설정이다.
> - **다이제틱(diegetic) UI**: 게임 세계 안에 실제로 존재하는 것처럼 보이는 화면 요소(손목 시계 화면, 홀로그램 지도 등).
> - **CTC / 관제 화면**: 철도 관제실에서 선로와 열차 위치를 한눈에 보는 큰 화면.
> - **대비(contrast) 비율**: 글자색과 배경색이 얼마나 차이 나는지 나타내는 숫자. 클수록 잘 읽힌다.

---

## 질문 1. 2D/탑뷰 게임과 웹 지도에서 전술·SF HUD 스타일을 쓴 예

### Takeaway
"어두운 배경 + 빛나는 가는 선 + 단순한 기호" 지도는 DEFCON처럼 "작전 상황판(war room)" 느낌을 노린 게임에서 이미 검증된 스타일이고, 디비전 자체는 화면 테두리보다 "세상 속에 떠 있는 UI"가 핵심이다. 미니 메트로처럼 차분한 철도 퍼즐 게임은 전술풍 대신 "밤 모드(어두운 회색 배경)"만 옵션으로 둔다.

### Cited Findings
**디비전(The Division)**
- 디비전의 HUD는 화면을 액자처럼 두르는 대신 게임 세계 안에 녹아 있고, 플레이어에게 붙어서 살짝 기울어진 채 움직이며, 플레이어가 멈추면 같이 멈춘다 — [HUDS+GUIS](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- 손목을 감싸는 회전식(캐러셀) 메뉴, 도시를 작게 줄인 홀로그램 지도, 길 이름·장소를 "떠 있는 글자"로 붙이는 길찾기 표시가 하이테크 느낌을 만든다. 진행 막대(예: 금고 여는 중)도 세상 위에 뜬다 — [HUDS+GUIS](https://www.hudsandguis.com/2013/06/26/tom-clancys-the-division-interface-design/)
- 개발사 Ubisoft Massive는 디비전 UI를 위해 UI 시스템(기술)을 처음부터 새로 만들었다(2017 GDC, Christian Savoie 발표) — [Game Developer](https://gamedeveloper.com/design/video-designing-a-new-ui-system-for-i-the-division-i-), [GDC Vault](https://gdcvault.com/play/1024026/contactUs)
- 디비전 UI는 "어수선하다(cluttered)"는 평을 받았고, Tobii 시선 추적 기능을 쓰면 플레이어가 바라볼 때만 UI가 켜져서 덜 거슬린다는 보도가 있었다 — [Destructoid](https://destructoid.com/eye-tracking-tech-makes-the-divisions-cluttered-ui-way-more-bearable)

**DEFCON (Introversion, 2006)**
- 1980년대 벡터 그래픽 컴퓨터 느낌의 세계 지도. 영화 WarGames 같은 "빅 보드(큰 작전 상황판)"를 본떴다 — [Wikipedia](https://en.wikipedia.org/wiki/DEFCON_(video_game))
- 땅은 새까맣고 바다는 전기 파란색, 그 경계를 밝게 빛나는 선으로 그린다. 유닛은 단순한 윤곽선 기호이고 움직임 연출이 적다. 핵 폭발은 위력에 비례한 흰 원으로 표시 — [Giant Bomb](https://www.giantbomb.com/games/3030-6676/)
- 평론은 이 스타일을 "작전실 미학을 빌려온 것"이며 섬뜩한 분위기와 짝을 이룬다고 평가 — [A.V. Club](https://www.avclub.com/defcon-1798209885)

**Highfleet**
- UI가 게임 속 실물 손잡이·레버로 표현되고, 전투는 흐릿한 아날로그 화면에 나온다. 지도에서는 컴퍼스·자·연필·지우개로 항로를 그린다 — [PC Gamer](https://www.pcgamer.com/au/unique-action-strategy-game-highfleet-is-coming-to-early-access-this-month)
- 냉전기~1990년대 기술을 섞은 미학이며, 빽빽한 배치가 "옛날 컴퓨터" 느낌을 일부러 만든다는 학생 블로그 분석(2차 자료) — [Ulster 블로그](https://blogs.ulster.ac.uk/matthewgrissam/2022/05/02/ixd-304-art-direction)
- 비슷한 "종이 해도 + 아날로그 계기" 전술 지도 게임 개발 일지: 지도 바깥 테두리가 비어 보이는 문제를 다룸 — [Atlantic '41 devlog](https://stephanrewind.itch.io/atlantic-41/devlog/647244/tactical-chart-deep-dive)

**미니 메트로(Mini Metro) — 레일맵과 가장 가까운 장르**
- 공식 스토어 설명에 색약 모드와 밤 모드가 있다고 적혀 있다 — [Steam](https://store.steampowered.com/sub/40131), [App Store](https://apps.apple.com/us/app/mini-metro/id1047760200?mt=12)
- 설정의 "Dark Mode"는 밝은 흰 배경을 어두운 회색으로 바꾸는 것이라는 사용자 설명(포럼, 비공식) — [Rail Forums](https://www.railforums.co.uk/threads/mini-metro.105003/)
- 리뷰어는 피곤한 눈으로 할 때 이 모드가 도움이 됐다고 씀 — [GamingOnLinux](https://www.gamingonlinux.com/articles/17909/)

**웹 지도 스타일**
- OpenFreeMap(레일맵이 지금 쓰는 무료 지도)은 Liberty, Bright, Positron 외에 Dark, Fiord 스타일도 제공한다고 목록에 적혀 있다. 공개된 주소 형식은 `https://tiles.openfreemap.org/styles/positron` 등 — [OpenFreeMap Quick Start](https://openfreemap.org/quick_start/)

### Inferences
- 2D 지도 게임에서 "전술 HUD" 느낌의 핵심은 세 가지로 보인다: ① 어두운 배경 위 밝은 가는 선(DEFCON), ② 단순 기호 + 숫자 판독값, ③ 화면 구석의 각진 괄호 프레임. 디비전의 "세상 속에 떠 있는 3D UI"는 탑뷰 2D에선 그대로 옮기기 어렵고, 지도 위에 떠 있는 라벨·진행 막대 정도로만 옮겨진다.
- 레일맵은 이미 "알림을 구석 팝업이 아니라 지도 위 말풍선으로" 띄우는 규칙이 있어서(CLAUDE.md 아트 규칙), 디비전의 "세상 속 UI" 철학과는 오히려 방향이 같다.
- 같은 장르(미니 메트로)는 전술풍이 아니라 "밤 모드" 정도에 그친다. 레일맵도 "따로 켜는 모드"로 시작하는 게 장르 관례와 맞는다.

### Gaps
- XCOM 지오스케이프, Frostpunk, Hacknet, Carrier Command, Shadow Tactics의 UI는 이번에 출처를 확인하지 못했다(조사 시간 한도).
- Game UI Database, ArtStation/Behance의 SF UI 사례는 직접 열어 확인하지 못했다. 그림 저작권 문제로 이미지 자체를 옮기지도 않았다.
- 디비전 UI의 정확한 색 값(주황색 계열 hex), 글꼴 이름, 가는 선 두께에 대한 공식 자료는 찾지 못했다. "주황/호박색 강조"는 널리 알려진 인상이지만 이번 조사에서는 출처로 확인되지 않았다.
- OpenFreeMap Dark·Fiord 스타일의 정확한 주소는 페이지에 안 나와 있었다(`.../styles/dark`일 것으로 보이나 확인 안 됨).
- Mapbox "dark/monochrome", "Cyberpunk" MapLibre 스타일 갤러리는 확인하지 못했다.

---

## 질문 2. 실제 철도 관제실(신호·CTC) 화면 관례 — "관제실 모드"가 철도 게임에 맞을까?

### Takeaway
철도 관제 화면의 정확한 색 규칙(예: 배경 몇 번 회색, 점유 구간 빨강)은 공개 자료로 확인하지 못했지만, "선로 구간이 열차로 점유되면 그 구간 전체에 불이 들어온다", "열차는 번호(헤드코드)로 표시한다", "늦음·빠름을 색으로 구분한다"는 관례는 확인됐다. 산업 제어 화면 표준(ISA-101)은 "평소엔 차분한 회색, 이상할 때만 진한 색"을 권한다 — 이건 오히려 레일맵의 "배경은 베이지, 플레이어가 만든 것만 색" 규칙과 정신이 같다.

### Cited Findings
- 고정식 관제판에서는 열차가 한 구간에 들어오면 열차 길이·방향과 상관없이 그 구간 전체에 불이 들어온다("flooding") — [SimSig 포럼](https://www.simsig.co.uk/Forum/PostView/53145) (철도 신호 시뮬레이터 사용자 포럼, 비공식)
- SimSig 운영자 설명: 빨간 "선로 점유" 표시는 열차이거나 궤도회로 고장이다 — [SimSig 포럼](https://simsig.co.uk/forum/PostView/52473)
- 1990년 무렵부터 새 신호 센터는 큰 패널 대신 VDU(컴퓨터 모니터) 화면을 쓰되, 열차 번호 표시(Train Describer) 기능은 그대로 두었다는 포럼 설명 — [Rail Forums](https://www.railforums.co.uk/threads/xxxx-headcode.34921/)
- 영국 Network Rail 실제 데이터로 노선도를 보여주는 signalmaps.co.uk는 열차 번호(예: 1A23) 칸의 배경색으로 지연을 표시한다: 3분 이상 일찍 = 파랑, 정시(±2분) = 초록, 3~9분 늦음 = 노랑→빨강, 10~19분 늦음 = 빨강→분홍 — [signalmaps.co.uk](https://signalmaps.co.uk/about/)
- 영국에는 "철도 신호 제어·표시용 컬러 VDU" 규격 BR1878이 있었으나 Issue C는 폐지(withdrawn) 표시 — [RSSB](https://www.rssb.co.uk/standards-catalogue/CatalogueItem/BR1878-Iss-C)
- 1985년 열차 번호 표시기 규격 NR/BR 800은 신호·선로전환기 상태를 색 전구로 보여주는 모형판(mimic panel)을 다룬다 — [GlobalSpec](https://standards.globalspec.com/std/1410045/nr-br-800)
- 크로스레일(런던) 관제센터는 ISO 11064(관제실 설계 표준) 틀에 따라 "화면·조작 장치 설계"를 인간공학적으로 다뤘고, 큰 개요 화면의 글자 판독성과 시야선을 모형으로 시험했다. 경보가 너무 많이 쏟아지는 문제(alarm flooding)가 따로 다뤄졌다 — [Crossrail Learning Legacy](https://learninglegacy.crossrail.co.uk/documents/a-people-centred-design-human-factors-integration-of-the-crossrail-route-control-centre/)
- 관제 화면에 정보가 "딱 적당한 양"이 되도록 어수선함을 피하는 게 인간공학 과제라는 호주 철도신호 학회 논문 — [IRSE Australasia](https://irse.org.au/?p=2728)
- 독일 전자연동장치(ESTW) 조작 화면을 실제 관제사와 함께 다시 설계한 사용성 연구가 있다 — [DLR elib](https://elib.dlr.de/85977)
- 산업 제어 화면 표준 ISA-101(2015 발행) 계열 "고성능 HMI" 원칙: 배경은 중립적인 낮은 대비 회색, 진한 색은 이상 상황·경보에만 쓴다. 정상일 때 화면은 회색이다 — [ISA Interchange](https://blog.isa.org/the-high-performance-hmi), [GoJS HMI 예제](https://gojs.net/latest/samples/hmiOperatorScreen), [Control Engineering](https://www.controleng.com/high-performance-hmis-designs-to-improve-operator-effectiveness/)
  - 주의: 이 원칙의 근거는 2차 자료이며 표준 원문 문구는 확인하지 못했다. 회색 hex 값(예: #D9D9D9)은 업체·블로그 예시일 뿐 표준 값이 아니다 — [Tatsoft](https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to)

### Inferences
- "관제실 모드"는 철도 게임에 주제상 잘 맞는다. 단, 진짜 관제 화면은 "어둡고 화려한 SF"가 아니라 "차분하고 색을 아끼는" 화면이다. 그래서 레일맵 관제실 모드는 디비전 같은 주황 네온보다 **어두운 회색 배경 + 선로는 밝은 회색 + 열차·혼잡·지연 같은 '상태'만 색**으로 가는 게 사실에 가깝고 읽기도 쉽다.
- 게임에 옮기기 좋은 관제 관례:
  - 열차를 점 대신 **번호 칩**(예: `1호선 03`)으로 표시
  - 역 사이 구간을 열차가 지나는 동안 **구간째로 강조**(flooding)
  - 혼잡도를 이미 색으로 보여주므로, 관제실 모드에서는 "정상은 회색, 혼잡만 노랑→빨강"처럼 ISA-101식으로 **색을 이상 상황에만** 쓰기
- 레일맵은 시간표·지연 개념이 없으므로(만들지 않을 것 목록에 "시간표") signalmaps식 지연 색은 그대로는 못 쓴다. 대신 혼잡도·배차 간격에 같은 "색은 이상 신호" 원칙을 쓸 수 있다.

### Gaps
- 실제 한국(코레일·서울교통공사) 관제 화면의 색 규칙, 지멘스·히타치 등 업체 관제 화면 색 규격은 공개 자료로 찾지 못했다.
- 관제실 화면이 "어두운 배경"이 표준인지 "밝은 회색"이 표준인지 확인된 1차 자료가 없다. 자료마다 다르고, ISA-101은 회색 배경을 권하지만 철도 전용 규격은 아니다.
- BR1878 본문은 유료/폐지라 내용을 읽지 못했다.

---

## 질문 3. 어둡고 가늘고 빛나는 UI의 가독성·접근성 문제와 완화 방법

### Takeaway
보통 시력을 가진 사람에게는 밝은 배경(라이트 모드)이 더 잘 읽히고, 글자가 작을수록 그 차이가 커진다. 그래서 어두운 전술 화면은 "기본값"이 아니라 "켜고 끄는 옵션"이어야 하며, 가는 글꼴·작은 글자·네온 번짐은 피하거나 크게 키워야 한다.

### Cited Findings
- 닐슨 노먼 그룹 정리: 시력이 정상인 사람은 라이트 모드가 시력·교정 과제에서 "모든 면에서" 더 좋았고, **글자가 작을수록 라이트 모드 우위가 커졌다**. 밤에는 작은 글자에서 라이트 모드가 더 나았다. 이유는 밝을 때 동공이 작아져 흐림이 줄기 때문 — [NN/g Dark Mode](https://www.nngroup.com/articles/dark-mode/)
- 같은 글: 백내장처럼 눈의 매질이 흐린 사람은 다크 모드가 더 잘 읽힐 수 있다. 결론은 "일반 대중 대상이면 다크 모드를 기본값으로 하지 말고, 사용자가 켤 수 있게 하라" — [NN/g Dark Mode](https://www.nngroup.com/articles/dark-mode/)
- 검은 바탕의 흰 글자는 흰 바탕 검은 글자보다 글자 주변이 번져 보이는 현상(halation)이 더 강하다는 디자인 시스템 설명 — [Trimble Modus](https://modus.trimble.com/foundations/dark-mode). 난시와 연결하는 주장은 대부분 2차 자료이고 난시 비율 수치도 출처마다 다르다(30%~절반) — [raghuveer 블로그](https://raghuveerdotnet.netlify.com/posts/darkmode), [Shopify 커뮤니티](https://community.shopify.com/t/admin-panel-dark-mode-setting/689574)
- 완화책으로 "완전 검정 대신 짙은 회색, 완전 흰색 대신 살짝 누른 흰색"을 권하는 글 — [ezud](https://ezud.com/dark-mode-accessibility-feature/)
- Xbox 접근성 지침 XAG 101: PC에서 글자 크기는 1080p 기준 **18px 이상**(4K 36px), 글자를 **200%까지 키울 수 있게**, 산세리프 글꼴 선택지를 최소 하나, 멋 부린 글꼴을 쓰면 **평범한 글꼴 옵션**도 제공, 줄 단위 문장은 전부 대문자 대신 문장식 표기, 자간은 글자 크기의 0.12배 이상 — [Xbox Accessibility Guideline 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- 같은 지침: 게임 화면 위 글자는 뒤 배경이 무엇이든 보이게 **글자 테두리(외곽선)**를 두는 예시(Fenyx Immortals Rising) — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- WCAG 1.4.11: UI 부품(버튼 테두리 등)과 의미 있는 그래픽(선, 아이콘)은 옆 색과 **3:1 이상** 대비. 3:1은 기준선이라 반올림하면 안 된다 — [W3C Understanding 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- 디비전 2는 메뉴 글자 크게(Large Fonts), 자막 크기(작게/보통/크게), HUD 요소 따로 끄고 켜기(Customize HUD)를 제공한다 — [GameRevolution](https://www.gamerevolution.com/?p=510195)
- 디비전은 시선 추적 기기를 쓰면 바라보는 UI만 켜지게 해서 어수선함을 줄였다 — [Destructoid](https://destructoid.com/eye-tracking-tech-makes-the-divisions-cluttered-ui-way-more-bearable)
- 움직임: 브라우저의 `prefers-reduced-motion` 설정은 사용자가 기기에서 "불필요한 움직임 줄이기"를 켰는지 알려준다(어지럼증 있는 사람 배려). 값은 `no-preference` / `reduce` — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- VR에서 빨강·주황 HUD 글자가 번져 보인다는 다른 게임(Elite Dangerous) 사용자 의견(1차 연구 아님) — [Frontier 포럼](https://forums.frontier.co.uk/goto/post?id=4946994)

### Inferences
- 전술 HUD의 대표 요소들 — **가는 선, 좁은(condensed) 글꼴, 작은 대문자 라벨, 어두운 배경, 네온 번짐** — 은 위 지침들과 거의 정면으로 부딪친다. 특히 레일맵은 역 이름·숫자를 오래 보는 게임이라 영향이 크다.
- 완화하려면: 글자 18px 안팎 이상 유지, 좁은 글꼴은 숫자 판독값(돈, 승객 수)처럼 짧은 곳에만, 한국어 문장은 보통 글꼴, 배경은 완전 검정 대신 짙은 남색·회색, "빛나기"는 진짜 번짐 대신 **밝은 단색 선 + 어두운 테두리선**으로 흉내, 스캔 애니메이션은 `prefers-reduced-motion`이면 끄기.
- 디비전의 교훈 중 레일맵에 바로 쓸 만한 것은 "모양"보다 "**HUD 요소를 하나씩 끄고 켜게 하기**"와 "**보는 곳만 자세히 보여주기**"다. 레일맵은 이미 확대 단계에 따라 역 모양을 바꾸므로 같은 방향이다.

### Gaps
- 디비전이 주황 HUD의 대비 문제를 어떻게 해결했는지(색 선택 옵션 유무 등)에 대한 공식 자료를 찾지 못했다.
- 한글을 좁은(condensed) 글꼴로 쓸 때의 가독성 연구는 찾지 못했다. 한글 condensed 글꼴 선택지 자체가 적을 수 있다(확인 안 됨).
- 글자 번짐(halation)에 대한 1차 동료 심사 연구는 이번에 찾지 못했다. 근거는 디자인 시스템·블로그 수준이다.

---

## 질문 4. 웹 기술로 구현하는 법 (CSS/SVG/Canvas, MapLibre 스타일 바꾸기, 성능)

### Takeaway
괄호 프레임·고정폭 숫자·격자 같은 "정적인" 장식은 CSS만으로 싸게 만들 수 있다. 지도 색 전체를 "관제실 모드"로 바꾸는 건 MapLibre `setStyle`로 가능하지만, 레일맵이 직접 얹은 역·선로·열차 레이어를 새 스타일로 옮겨야 하므로(`transformStyle`) 설계가 필요하다. 매 프레임 움직이는 효과(스캔선, 글로우 깜빡임)는 성능과 접근성 모두에 부담이라 최소화한다.

### Cited Findings
**CSS 장식**
- 숫자 폭 맞추기: `font-variant-numeric: tabular-nums`는 모든 숫자를 같은 폭으로 만들어 표처럼 줄이 맞게 한다(OpenType `tnum` 기능) — [MDN font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)
- 모서리 괄호: `border-image`로 SVG 하나를 9조각으로 잘라 테두리로 쓰는 방법. 먼저 일반 `border`로 테두리 자리를 만들고 그 위에 `border-image`를 얹으며, slice 값을 잘못 잡으면 모서리가 일그러진다 — [ceslava CSS 강좌](https://cursos.ceslava.com/en/curso/css/leccion/css-border-image-pro)
- `border-image`는 `border-radius`를 무시한다(둥근 모서리가 사각이 됨). 대안은 투명 테두리 + 배경 두 겹(padding-box / border-box) — [codeshack](https://codeshack.io/css-gradient-border-generator/)
- 게임 코드에서 "사각형 바깥에 L자 모서리 괄호 네 개(팔 길이·두께·색 설정, 기본은 가는 호박색 선)"를 그리는 함수 예(UCSD 학생 프로젝트) — [UCSD cse125](https://cse125.ucsd.edu/2026/cse125g2/docs/namespacevoidfall.html)
- 움직임 줄이기 설정이 켜져 있으면 애니메이션을 다른(덜 움직이는) 것으로 바꾸는 CSS 예 — [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

**MapLibre 스타일 바꾸기**
- `map.setStyle(style, options)`는 지도 스타일을 새 값(JSON 또는 주소)으로 바꾼다. `diff` 옵션이 켜져 있으면 지금 스타일과 비교해 **필요한 부분만** 바꾼다. 단 스프라이트(아이콘 묶음)와 글리프(글꼴)는 비교가 안 돼서, 둘이 다르면 스타일을 통째로 지우고 새로 만든다 — [MapLibre Map API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)
- `transformStyle(이전 스타일, 다음 스타일)` 함수로 이전 스타일의 source·layer(예: 내가 추가한 선로·열차 레이어)를 새 스타일에 복사해 넣을 수 있다 — [MapLibre Map API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)
- OpenFreeMap은 Dark, Fiord 등 어두운 계열 스타일을 목록에 제공한다 — [OpenFreeMap](https://openfreemap.org/quick_start/)

**성능 관련 (레일맵 쪽 사실)**
- 레일맵은 이미 열차를 GeoJSON source 하나에 매 프레임 `setData`로 갱신하고, 역 50개·열차 30대 성능을 목표로 둔다(프로젝트 CLAUDE.md 코딩 규칙, 커밋 `9faf010 성능: 역 50개·열차 30대…`) — 로컬 파일 `C:\projects\railmap\CLAUDE.md`

### Inferences
- **싸고 안전한 것**: 패널·배지에 CSS 모서리 괄호(가상 요소 `::before/::after` 네 개 또는 SVG `border-image`), 숫자에 `tabular-nums`, 얇은 1px 선 구분. 한 번 그리면 끝이라 성능 부담이 거의 없다.
- **격자 오버레이**: 화면 전체에 CSS `repeating-linear-gradient` 배경 한 장을 깔고 움직이지 않게 두면 싸다. 지도와 같이 움직이는 격자가 필요하면 MapLibre 선 레이어(경위도 격자)로 넣는 게 맞다 — 둘 다 근거 출처는 없음(일반적 구현 지식).
- **비싼 것**: CSS `filter: blur()`·`box-shadow` 글로우를 매 프레임 움직이는 요소에 쓰거나, 화면 전체 스캔선 애니메이션을 계속 돌리는 것. 30대 열차 각각에 HTML 글로우 요소를 붙이면 레일맵의 "열차는 source 하나" 규칙도 깨진다. MapLibre 안에서는 선 레이어 두 겹(넓고 흐린 색 + 좁고 밝은 색)으로 "빛나는 선"을 흉내 내면 GPU에서 한 번에 그려져 부담이 작다. (일반적 구현 지식, 출처 없음 — 실측 필요)
- **관제실 모드 지도 바꾸기**: 레일맵은 `map/style.js`에서 positron을 불러와 베이지로 다시 칠하는 구조라, "같은 positron을 어두운 팔레트로 다시 칠하는 함수"를 하나 더 두는 쪽이 `setStyle`로 다른 스타일 주소를 받아오는 것보다 간단할 수 있다(글꼴·아이콘이 같으면 diff가 통째 재생성을 피함). 가상 지도(솔내)도 `sollaeStyle.js`가 같은 방식이라 팔레트 표 하나만 바꾸면 된다. 역·선로·열차 레이어 색도 config의 색 표에서 읽게 바꿔야 한다.

### Gaps
- `setStyle`의 `diff` 기본값이 무엇인지 문서 발췌에서 확인하지 못했다.
- "빛나는 선 두 겹" 방식, CSS 격자의 실제 프레임 비용은 출처 있는 벤치마크를 찾지 못했다 — 레일맵에서 직접 재봐야 한다.

---

## 질문 5. 레일맵의 지금 아트 규칙과 부딪치는 것 / 빌려도 되는 것

### Takeaway
"어두운 배경, 네온 글로우, 반투명 유리, 주황 강조"는 지금 규칙(완전 플랫, 그림자·그라데이션·반투명 금지, 베이지 배경, 남색+노랑)과 정면으로 부딪친다. 반면 **모서리 괄호 프레임, 고정폭 숫자, 짧은 데이터 판독값, 열차 번호 칩, "색은 상태에만"** 원칙은 플랫 규칙을 깨지 않고 지금 화면에 바로 빌릴 수 있다. 전면 전환은 별도 토글 "관제실 모드"로 두는 게 맞다.

### Cited Findings
- 레일맵 아트 규칙: 그림자·그라데이션·반투명 유리 효과 금지, 완전 플랫. 배경은 베이지 몇 단계, 플레이어가 만든 것만 색. 라벨·배지 남색 #1F3A55, 강조 점 #F2C230. 알림은 지도 위 말풍선 — 로컬 파일 `C:\projects\railmap\CLAUDE.md` "아트 규칙"
- 산업 관제 화면 원칙(ISA-101 계열): 평소엔 회색, 색은 이상 상황에만 — [ISA Interchange](https://blog.isa.org/the-high-performance-hmi)
- 닐슨 노먼: 다크 모드는 기본값 말고 선택 옵션으로 — [NN/g](https://www.nngroup.com/articles/dark-mode/)
- 미니 메트로도 밤 모드를 "옵션"으로 둔다 — [Steam](https://store.steampowered.com/sub/40131)
- 디비전 2는 HUD 요소를 따로 끄고 켤 수 있다 — [GameRevolution](https://www.gamerevolution.com/?p=510195)

### Inferences
부딪치는 것 (지금 기본 화면에는 넣지 않기)

| 전술 HUD 요소 | 부딪치는 규칙 | 메모 |
| --- | --- | --- |
| 어두운/검은 배경 | 배경은 베이지 | 관제실 모드에서만 |
| 네온 글로우(번지는 빛) | 그림자·그라데이션 금지 | 관제실 모드에서도 "단색 두 겹 선"으로 흉내 |
| 반투명 유리 패널 | 반투명 금지 | 쓰지 않음 |
| 주황/호박 강조색 | 남색+노랑 팔레트, 주황 #C9772F는 이미 "공사 중" 뜻 | 주황을 강조로 쓰면 "공사 중"과 헷갈림 → 노랑 #F2C230 유지 |
| 스캔선·깜빡임 애니메이션 | 차분한 게임 분위기, 접근성 | 클릭한 순간 한 번만(예: 역 선택 시 괄호가 한 번 좁혀짐), reduced-motion이면 끔 |
| 영문 대문자 좁은 글꼴 | 쉬운 한국어, 가독성 | 숫자·짧은 코드에만 |

빌려도 되는 것 (플랫 규칙 안에서)

1. **모서리 괄호 프레임**: 선택한 역·열차 주변, 정보 패널 네 모서리에 남색 1~2px L자 괄호. 그림자 없는 단색 선이라 플랫 규칙 그대로.
2. **고정폭 숫자**: 자금·월 수지·하루 승객·혼잡도 숫자에 `tabular-nums`. 숫자가 바뀌어도 글자가 흔들리지 않아 "계기판" 느낌.
3. **데이터 판독값 줄**: 역 패널에 `승객 12,400/일 · 혼잡 87% · 배차 4분` 같은 짧은 한 줄 요약.
4. **열차 번호 칩**: 관제 화면처럼 열차에 노선 색 + 번호(가까이 확대했을 때만).
5. **"색은 상태에만"**: 이미 규칙("플레이어가 만든 것만 색")과 같은 생각. 혼잡 경고만 진한 색으로.
6. **관제실 모드 토글**(별도 기능): [혼잡도 보기]·[지형]처럼 버튼 하나로 지도 팔레트를 짙은 남색·회색으로 바꾸고, 선로는 밝은 회색, 열차·혼잡만 색. 투명·그라데이션은 여전히 쓰지 않는 "플랫한 다크 팔레트"로 만들면 규칙의 정신(플랫)은 지키고 색만 바꾸는 셈. 이건 아트 규칙 표를 "낮 팔레트 / 관제실 팔레트" 두 벌로 늘리는 결정이라 주인 확인이 필요.

추천 순서(제안): ① 괄호 프레임 + 고정폭 숫자(작고 안전) → ② 데이터 판독값 줄 → ③ 관제실 모드 토글(지도 팔레트 두 벌, 큰 변경).

### Gaps
- 관제실 모드 팔레트의 구체 색 값과 대비 비율은 아직 계산하지 않았다(WCAG 3:1, 글자 4.5:1 기준으로 따로 검증 필요).
- 플레이어가 실제로 관제실 모드를 원하는지(놀이 테스트)는 확인되지 않았다.
