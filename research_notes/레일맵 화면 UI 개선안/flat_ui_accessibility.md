# 플랫 인포그래픽 게임·지도 UI의 위계와 접근성 (레일맵 팔레트 기준 평가)

> 조사일 2026-10-27. 대비율과 색각이상 시뮬레이션 숫자는 직접 계산했다 (계산 방법은 각 절에 적음). 계산 스크립트는 세션 임시 폴더에 있었고 프로젝트에는 넣지 않았다.
> 참고: 지금 `src/style.css`는 `'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR'` 글꼴을 쓰고, 글자 크기는 10~17px이며 대부분 12~14px이다 (2026-10-27 grep 결과).

## 1. 그림자·그라데이션 없이 위계 만들기 (테두리, 채움, 굵기, 간격, 크기, 색 블록)

### Takeaway
깊이 효과 없이도 위계는 (1) 크기·굵기 단계 수를 줄이고, (2) 단단한 단색 판(plate)이나 테두리로 배경과 분리하고, (3) 색은 "플레이어가 만든 것"과 "지금 중요한 것"에만 쓰는 방식으로 만든다. 교통 지도 전통(Beck, Vignelli)과 게임 접근성 지침(XAG)이 모두 "단순화 + 단색 배경 판 + 테두리"를 권한다.

### Cited Findings
- Vignelli Canon은 한 지면에 글자 크기를 보통 두 가지 이하로 쓰고, 예외로 작은 본문과 대략 두 배 크기의 큰 글자를 짝짓는다. 제목·소제목은 본문과 같은 크기에 굵게 하고, 위에만 한 줄 띄우고 아래는 띄우지 않는다. — [SEGD: The Vignelli Canon 발췌](https://segd.org/?p=7876)
- Vignelli는 그리드를 그래픽 디자인의 기본 구조로 보고, 내용 정리와 일관성의 수단으로 설명한다. — [UX Collective: The Vignelli Canon](https://uxdesign.cc/the-vignelli-canon-a-design-classic-from-the-last-of-the-modernists-74d6e7dc0169)
- Harry Beck의 지하철 노선도는 선을 가로·세로·45도로만 긋고, 역 간격을 실제 거리와 관계없이 고르게 하며, 지리 정보를 줄이고 연결 관계를 앞세웠다. 노선은 색으로 구분했다. — [London Transport Museum](https://www.ltmuseum.co.uk/collections/stories/design/transforming-tube-map-harry-becks-iconic-design); [Geography Realm](https://www.geographyrealm.com/?p=56327)
- 지금 런던 노선도도 Beck의 핵심 규칙을 그대로 유지한다. Mark Noad의 2011년 변형안은 45도 대신 30·60도를 썼다. — [HERE: Beck meaning underground](https://www.here.com/learn/blog/expert-takes-beck-meaning-underground); [Dezeen](https://www.dezeen.com/2011/08/08/london-tube-map-by-mark-noad-design/amp/)
- XAG 102는 대비를 높이는 일반 방법으로 다음을 든다. 글자 뒤에 단색 배경 판 놓기, 글자·요소 색 고르기 옵션, 고대비 모드, 글자·요소에 테두리 두르기. — [Xbox Accessibility Guideline 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- XAG 102 예시: Forza Horizon 4 지도 표식은 노란 단색 채움 + 검은 테두리 + 검은 글자로 지도 위에서 잘 보인다. For Honor 아이콘은 안쪽 검은 테두리와 바깥 흰 테두리를 겹쳐, 밝은 배경과 어두운 배경 모두에서 보이게 했다. — [XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- XAG 102는 고대비 모드의 진짜 목적을 "중요한 요소를 잘 보이게, 중요한 요소끼리 구분되게, 중요한 것과 덜 중요한 것을 분리"로 정의한다 (밝고 어두움 차이만 키우는 게 아님). — [XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- XAG 102: 무늬나 단색이 아닌 배경 위 글자는 배경의 가장 대비가 낮은 부분을 기준으로 대비를 잰다. — [XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- KRDS(대한민국 정부 디자인 시스템)는 글자 굵기를 최대 4가지 정도로 제한하고 (400 본문, 500, 700 제목·강조), 너무 얇거나 너무 두꺼운 굵기를 피하라고 한다. 제목과 본문의 크기 비율은 1.25~1.5배가 이상적이다. 강조는 밑줄 대신 색이나 굵기로 한다 (밑줄은 링크에만). — [KRDS 타이포그래피](https://www.krds.go.kr/html/site/style/style_03.html)
- WCAG 2.2 1.4.11: 화면 요소를 알아보는 데 필요한 시각 정보와 내용 이해에 필요한 그래픽 부분은 인접 색과 3:1 이상 대비가 있어야 한다. 그림자 없는 플랫 UI에서는 버튼·패널 경계가 테두리나 채움색 대비로만 드러나므로 이 기준이 직접 적용된다. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Inferences
- 레일맵 적용: 위계를 4단계 정도로 정하면 된다. ① 지도 배경(베이지 단계들, 색 없음) → ② 플레이어가 만든 것(노선색 선, 승강장) → ③ 지도 위 라벨(흰 판 + 남색 테두리 + 노란 점) → ④ 화면 고정 UI(남색 배지, 흰 패널 + 남색 테두리). 그림자 대신 "흰 판 + 남색 1.5~2px 테두리"가 떠 있는 느낌을 대신한다.
- 남색 테두리는 흰색과 11.70:1, 땅색과 9.51:1이라 (아래 3절 계산) 1.4.11의 3:1을 크게 넘는다. 따라서 테두리만으로 패널 경계를 충분히 보여줄 수 있다.
- 선택 상태는 "채움 반전"(흰 바탕 남색 글자 → 남색 바탕 흰 글자, 11.70:1)이나 "테두리 굵기 1px→3px"로 표시하면 그림자 없이 분명하다. 노란 점·노란 밑줄 같은 강조 표식은 남색 위에서만 대비가 나온다 (노랑/남색 6.98:1, 노랑/흰색 1.68:1).
- 지금 style.css가 10~17px 사이에 크기를 10가지 가까이 쓰고 있다. Vignelli·KRDS 원칙대로라면 3~4단계(예: 13/15/17/22px)로 줄이는 것이 위계를 더 분명하게 한다.
- Beck식 단순화는 레일맵의 지도 자체(실제 지리)에는 적용하지 않지만, 노선 패널 안의 "노선 미니 다이어그램"(역을 고른 간격의 점으로)에 쓰기 좋다.

### Gaps
- Material Design 3의 "tonal elevation"(그림자 대신 표면 색 단계로 높이 표현) 공식 문구는 페이지가 스크립트로 그려져 가져오지 못했다 (m3.material.io). Fluent 문서도 확인하지 못했다.
- RealLifeLore·Wendover 같은 해설 영상 지도 스타일을 직접 다룬 디자인 문서는 찾지 못했다. 이 스타일은 `reference/style-reference.png`로 판단할 수밖에 없다.
- Vignelli Canon 원문은 직접 보지 못하고 SEGD 발췌로만 확인했다.

## 2. 게임 UI 가독성: 최소 글자 크기, 숫자 형식, 아이콘+글자, 정보 밀도

### Takeaway
PC 게임 기준 최소 글자 크기는 XAG가 1080p에서 "글자 몸 높이(어센더~디센더) 18px", GAG는 더 보수적으로 28px(TV 기준)이다. 웹 기준 KRDS는 본문 최소 16px, 기본 17px, 줄 간격 150%다. 아이콘은 글자 라벨과 함께 쓰고, 아이콘 안 글자도 최소 크기를 지켜야 한다.

### Cited Findings
- XAG 101 최소 기본 글자 크기 (몸 높이 = 디센더+엑스하이트+어센더 픽셀 합): 콘솔 1080p 26px, 4K 52px / PC·VR 1080p 18px, 4K 36px / 모바일 100DPI 18px, 400DPI 72px. 화면 확대 기능은 작은 글자의 대안이 아니다. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101: 글자 크기를 최소 크기의 200%까지 키워도 내용·기능이 사라지지 않아야 하고, 키웠을 때도 제목과 본문이 구분되어야 하며, 가로·세로 두 방향 스크롤을 요구하면 안 된다. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101: 아이콘·글리프 안의 글자도 최소 글자 크기를 지켜야 하고, 아이콘도 글자 확대에 맞춰 200%까지 커져야 한다. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101 글자 간격(두 줄 넘는 글): 한 줄 너비는 한·중·일 40자 이하, 줄 간격 1.5 이상, 문단 간격은 줄 간격의 2배 이상, 자간 0.12em, 단어 간격 0.16em. 문장은 언어 방향대로 왼쪽 정렬(가운데·양쪽 정렬 X). 한두 단어 라벨은 대소문자 규칙에서 예외. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- Game Accessibility Guidelines(기본 단계): 1080p에서 28px를 최소로 쓰고(목표가 아니라 바닥), 가능하면 넘기라고 한다. 숫자는 Amazon TV 10-foot UI 지침에서 왔다. 이상적인 해법은 글자 크기 선택 옵션이다. — [GAG: Use an easily readable default font size](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/)
- KRDS: 본문 최소 16px 이상, Pretendard GOV가 상대적으로 작아 보여 기본 17px. 크기 표: Body 19/17/15/13px, Label 19/17/15/13px, Heading small 19px, medium 24px(PC). 줄 간격 모두 150%, 단위는 px 대신 em·%. — [KRDS 타이포그래피](https://www.krds.go.kr/html/site/style/style_03.html)
- XAG 103: 글자 라벨은 아이콘·기호가 무엇을 뜻하는지 말로 알려 인지 부담을 줄인다. 기호는 글을 읽기 힘든 사람에게 빨리 전달되지만, 글자 라벨을 함께 두는 것이 똑같이 중요하다 (예: Grounded 제작 메뉴의 탭마다 아이콘+글자). — [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103)
- XAG 103: 쓸 수 없는 버튼을 회색으로만 표시하지 말고 다른 표시(자물쇠 아이콘, "사용할 수 없음" 글자)를 함께 쓴다. — [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103)
- Pretendard는 `tnum`(고정폭 숫자)을 지원하며, 예시로 ₩1,111,111 / ₩7,777,777 같은 가격·날짜 정렬을 든다. `zero`(빗금 0), `ss06`(I·l·1, 0·O 구분 강화)도 있다. — [Pretendard OpenType 기능 (제작자 블로그)](https://cactus.tistory.com/306)

### Inferences
- 레일맵 지금 상태: 10~13px 글자가 많다. XAG의 18px는 "몸 높이"라 CSS font-size와 1:1이 아니지만 (한글·라틴 글꼴은 대개 몸 높이가 font-size보다 약간 작거나 비슷함 — 출처 없는 일반 관찰, 실제 측정 필요), 10~12px는 어떤 기준으로도 모자라다. 제안: 본문·패널 15~16px, 보조 13~14px(숫자 단위 등 짧은 것만), 제목 19~20px, 날짜 배지 17px 이상. 10~11px는 없앤다.
- 돈·승객 수는 `font-variant-numeric: tabular-nums`로 자릿수를 맞추면, 매 프레임 바뀌는 자금 숫자가 좌우로 흔들리지 않는다. 표시 형식은 지금처럼 "1.2억", "3,400명"처럼 한국식 큰 단위를 쓰되, 자릿수가 바뀌어도 폭이 일정하게 한다.
- 도구 막대([선택] [역] [선로] [노선])는 아이콘만 두지 말고 아이콘 + 짧은 한국어 글자 + 숫자키 표시를 유지한다 (XAG 103 근거).
- 정보 밀도: 상시 화면에는 자금·월 수지·하루 승객·날짜만 두고, 나머지는 선택했을 때 열리는 패널로 미루는 것이 "하나의 주요 행동" 원칙(KRDS 무드)과 맞다.

### Gaps
- AbleGamers의 APX 패턴(Clear Text, Distinguish This From That)은 XAG가 링크만 걸어서 직접 읽지 못했다 (accessible.games).
- 브라우저 게임 전용 정보 밀도 수치(한 화면 요소 수 등)를 제시한 GDC 강연·연구는 찾지 못했다.
- WCAG의 "큰 글자" 정의에서 한·중·일 글꼴 환산 메모는 가져온 본문에서 잘려 확인하지 못했다. KRDS는 큰 글자를 24px 이상 또는 굵은 18.66px 이상으로 쓴다.

## 3. 색각이상: 노선 6색 구분, 대비율 계산, 중복 표시

### Takeaway
6개 노선색은 일반 시각에서는 구분되지만, 적색맹(프로타노피아)·녹색맹(듀터라노피아)에서는 **파랑 #3F6E9A와 보라 #7E6A9E가 거의 같은 색**(ΔE2000 1.0 / 5.3)이 되고, 초록–벽돌, 청록–자주도 가까워진다. 청색맹(트리타노피아)에서는 벽돌–자주, 초록–청록, 파랑–청록이 가까워진다. 6색 모두 비슷한 밝기(L* 45~54)여서 색이 사라지면 밝기로도 구분이 안 되는 것이 근본 원인이다. 색만 고치기보다 **서울 지하철식 번호 원 + 노선 이름 라벨**을 함께 쓰는 것이 해답이다. 대비는 남색 글자는 모든 배경에서 충분하지만, 작은 지명 글자 #9A8F7B와 기존 철도 #A69C8B, 일부 노선색은 배경에 따라 기준에 못 미친다.

### 계산 방법
- 대비율: WCAG 상대 휘도 공식. sRGB 값을 선형화(0.04045 기준, c/12.92 또는 ((c+0.055)/1.055)^2.4) → L = 0.2126R + 0.7152G + 0.0722B → (L밝은+0.05)/(L어두운+0.05). 공식 출처 — [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (가져온 본문에서 공식 부분은 잘렸으나 contrast ratio 정의 "(L1 + 0.05) / (L2 + 0.05)"는 확인).
- 색각이상 시뮬레이션: 적색맹·녹색맹은 Viénot 1999, 청색맹은 Brettel 1997 (libDaltonLens의 선형 RGB 행렬 사용, 분리 평면 법선과의 내적 부호로 두 행렬 중 하나 선택). 모두 sRGB → 선형 RGB에서 적용 후 다시 sRGB. 근거: DaltonLens는 적·녹색맹에는 Viénot/Brettel이 가장 낫고, 청색맹에는 Brettel 1997이 사실상 유일하게 타당하며, Machado 2009는 청색맹을 잘 다루지 못한다고 정리한다 — [DaltonLens: Review of open source CVD simulations](https://daltonlens.org/opensource-cvd-simulation/); 선형 RGB에서 적용해야 한다는 점 — [DaltonLens: Understanding CVD simulation](https://daltonlens.org/understanding-cvd-simulation/); 행렬 값 — [libDaltonLens.c](https://raw.githubusercontent.com/DaltonLens/libDaltonLens/master/libDaltonLens.c)
- 색 차이: CIELAB(D65) 기준 CIEDE2000(ΔE00). 대략 ΔE00 ≈ 1~2는 거의 같은 색, 10 아래는 가는 선에서 헷갈리기 쉬움으로 해석했다 (해석 기준은 출처 없는 경험칙 — Gaps 참고).
- 참고로 Machado 2009(심도 1.0)로도 계산했는데 결과 경향이 같았다: 적색맹 파랑–보라 1.6, 녹색맹 파랑–보라 5.5.

### 대비율 결과 (직접 계산)
| 앞 색 | 흰색 #FFF | 땅 #EFE7D6 | 블록 #E9E0CC | 도로 #FBF7EE | 공원 #CFE0B4 | 물 #B8CBDA | 남색 #1F3A55 |
|---|---|---|---|---|---|---|---|
| 남색 #1F3A55 | **11.70** | **9.51** | 8.91 | 10.94 | 8.34 | 7.02 | – |
| 노랑 #F2C230 | 1.68 | 1.36 | 1.28 | 1.57 | 1.19 | 1.00 | **6.98** |
| 운행 선로 #3E4651 | 9.55 | 7.76 | 7.27 | 8.93 | 6.81 | 5.72 | 1.23 |
| 지명 #6F6656 | 5.66 | **4.60** | 4.31 | 5.29 | 4.04 | 3.39 | 2.07 |
| 작은 지명 #9A8F7B | 3.19 | **2.59** | 2.43 | 2.98 | 2.27 | 1.91 | 3.67 |
| 승강장 #A7BED4 | 1.92 | 1.56 | 1.46 | 1.79 | 1.37 | 1.15 | 6.11 |
| 공사 중 #C9772F | 3.41 | 2.77 | 2.60 | 3.19 | 2.43 | 2.04 | 3.43 |
| 기존 철도 #A69C8B | 2.71 | 2.20 | 2.06 | 2.53 | 1.93 | 1.62 | 4.32 |
| 파랑 #3F6E9A | 5.37 | 4.37 | 4.09 | 5.03 | 3.83 | 3.22 | 2.18 |
| 초록 #5E8C61 | 3.89 | **3.16** | 2.96 | 3.64 | **2.77** | **2.33** | 3.01 |
| 벽돌 #B0574A | 4.87 | 3.96 | 3.71 | 4.56 | 3.48 | 2.92 | 2.40 |
| 보라 #7E6A9E | 4.73 | 3.84 | 3.60 | 4.42 | 3.37 | 2.83 | 2.48 |
| 청록 #3E8A8A | 4.03 | **3.28** | 3.07 | 3.77 | **2.88** | **2.42** | 2.90 |
| 자주 #9C5B7A | 5.01 | 4.07 | 3.82 | 4.69 | 3.57 | 3.00 | 2.34 |

- 흰 글자를 노선색 위에 올릴 때(번호 원 안 숫자): 파랑 5.37, 초록 3.89, 벽돌 4.87, 보라 4.73, 청록 4.03, 자주 5.01.
- 노선색 밝기 L*: 파랑 45.0, 초록 54.0, 벽돌 47.7, 보라 48.5, 청록 53.0, 자주 46.9 (범위 9 정도로 좁음).

### 색각이상 시뮬레이션 결과 (가장 가까운 쌍, ΔE00, 직접 계산)
| 시각 | 가장 헷갈리는 쌍 |
|---|---|
| 일반 | 보라–자주 14.4, 초록–청록 16.8, 벽돌–자주 18.1, 파랑–보라 18.6, 파랑–청록 20.8 |
| 적색맹 (Viénot) | **파랑–보라 1.0**, 파랑–자주 8.9, 보라–자주 9.6, 초록–벽돌 13.6, 청록–자주 13.8 |
| 녹색맹 (Viénot) | **파랑–보라 5.3**, **청록–자주 6.1**, **초록–벽돌 6.6**, 보라–청록 10.1, 파랑–청록 14.2 |
| 청색맹 (Brettel) | **벽돌–자주 6.4**, **초록–청록 6.6**, **파랑–청록 7.7**, 파랑–초록 10.4, 초록–보라 14.3 |

- 모든 노선색은 모든 시뮬레이션에서 땅색 #EFE7D6과는 ΔE00 27 이상 차이가 나서, "선이 배경에 묻히는" 문제는 없다. 문제는 노선끼리의 구분이다.
- 예시 실험: 밝기를 벌린 후보 (파랑 #2F5A85, 초록 #6F9A55, 벽돌 #B5523F, 보라 #9583BC, 청록 #2F7A7A, 자주 #8A4466)는 적색맹 파랑–보라를 1.0 → 18.8로 크게 벌렸지만, 녹색맹 청록–자주 7.2·초록–벽돌 8.2, 청색맹 초록–보라 8.7·파랑–청록 8.7로 여전히 가까운 쌍이 남고, 밝아진 초록(땅 대비 2.66)과 보라(2.73)는 1.4.11의 3:1 아래로 떨어졌다. 즉 6색을 색만으로 세 종류 색각이상 모두에서 구분되게 하면서 베이지 위 3:1도 지키는 것은 어렵다 (이 후보는 추천안이 아니라 한계를 보여주는 예시).

### Cited Findings
- WCAG 2.2 1.4.1: 색을 정보 전달·행동 표시·응답 유도·요소 구분의 유일한 시각 수단으로 쓰지 않는다. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- WCAG 2.2 1.4.3: 글자 4.5:1 이상, 큰 글자 3:1 이상. 1.4.6(AAA): 7:1, 큰 글자 4.5:1. 1.4.11: UI 요소와 필요한 그래픽은 인접 색 대비 3:1 이상. 큰 글자 = 18pt 이상 또는 굵은 14pt 이상. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/); 픽셀 환산 24px / 굵은 18.66px — [KRDS](https://www.krds.go.kr/html/site/style/style_03.html)
- XAG 102: 보통 글자·중요 요소 4.5:1, 큰 글자·큰 요소 3:1 (PC에서 큰 글자는 1080p 36px), 쓸 수 없는 요소의 글자 3:1, 고대비 모드는 모든 UI 요소 7:1 이상. — [XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- XAG 103: 색으로 전달하는 중요한 정보는 모양·무늬·아이콘·글자 라벨 중 하나 이상을 함께 써야 한다. 색이 주된 수단이라면 프리셋이나 자유 색 선택을 제공한다 (예: Call of Duty 지도 아이콘 색, Battlefield 2042 HUD 색 지정). 시뮬레이션은 실제 색각이상 플레이어 테스트를 대신할 수 없다. — [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103)
- XAG 103: 백내장도 색 인식에 영향을 주며 색각이상보다 흔하다. — [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103)
- 서울시는 40년 만에 노선도를 새로 만들며 색각이상 승객이 구분하기 쉬운 색 체계를 넣었고, 환승은 신호등식 표시(역에 지나가는 노선마다 따로 원)로 바꾸며, 역마다 역 번호를 표시한다. 23개 노선 전체에 적용, 2025년 하반기부터. — [Korea JoongAng Daily](https://www.koreajoongangdaily.com/korea/new-colors-better-labels-and-pictograms-seouls-individual-subway-line-maps-to-get-first-fresh-look-in-40-years/12421135); [Korea JoongAng Daily (2023-12)](https://www.koreajoongangdaily.com/korea/seoul-subway-to-receive-first-new-map-in-40-years/12373864); [Korea Herald](https://www.koreaherald.com/article/10466669)
- 같은 보도에서 색각이상 시험자가 새 노선이 구분하기 쉽고 무늬로도 분류된다고 말했다는 내용이 검색 요약에 나오지만, 원문에서 직접 확인하지는 못했다. — [Korea JoongAng Daily (2023-12)](https://www.koreajoongangdaily.com/korea/seoul-subway-to-receive-first-new-map-in-40-years/12373864)

### Inferences
- **꼭 할 것 (중복 표시)**: 노선마다 번호(①②③… 또는 이름 첫 글자)를 넣은 원 배지를 만든다. 노선 패널 목록, 역 말풍선(지나가는 노선 배지 나열 = 서울 신호등식 환승 표시), 열차 아이콘에 같은 배지를 쓴다. 원 안 흰 숫자는 6색 모두 3.89~5.37:1이라 굵은 숫자면 큰 글자 기준 3:1을 넘는다 (초록 3.89·청록 4.03은 보통 크기 글자 4.5:1에는 못 미치므로 숫자를 굵게·크게).
- **노선 선 자체**: 파랑–보라처럼 가장 헷갈리는 쌍은 선 모양으로도 구분할 수 있다. 예: 짝수 번째 노선은 가운데 흰 줄(지금 선로의 가운데 줄과 같은 방식), 또는 일정 간격으로 노선 번호 배지를 선 위에 반복해 놓기. 서울 노선도의 "무늬로도 분류"와 같은 방향이다 (출처 확인은 Gaps).
- **노선색 자동 배정 순서**: 노선을 만들 때 색이 차례로 배정된다면, 적·녹색맹에서 가장 멀리 떨어진 순서(예: 파랑 → 벽돌 → 초록 → 자주 → 청록 → 보라)로 배정해 노선이 2~3개뿐인 초반에는 헷갈림이 거의 없게 한다. 파랑과 보라는 가능한 한 늦게 함께 나오게 한다.
- **혼잡도 색**: 혼잡도 보기에서 색(초록→빨강 계열)만 쓰면 적·녹색맹이 구분하기 어렵다 (XAG 102의 빨강·초록 주의). 선 굵기 변화나 % 숫자 라벨을 함께 쓴다.
- **대비 개선이 필요한 곳**: 작은 지명 #9A8F7B는 땅 위 2.59:1로 글자 기준 미달 → #857A66 정도로 어둡게 하거나 장식용(읽을 필요 없는) 지명에만 쓴다. 기존 철도 #A69C8B(2.20)는 배경 요소라 기준 대상이 아닐 수 있다 (WCAG는 꼭 필요한 그래픽에만 적용). 승강장 #A7BED4는 땅 위 1.56:1이라 승강장 모양은 남색 테두리(9.51:1)가 경계 역할을 해야 한다 — 지금 규칙(테두리 #1F3A55)을 유지해야 하는 이유. 노란 강조 점은 흰 판 위에서 1.68:1이므로 반드시 남색 테두리나 남색 바탕과 함께 쓴다.
- **물·공원 위**: 초록·청록 노선은 공원 위 2.77·2.88, 물 위 2.33·2.42로 3:1 미만. 선로에 #D8C9AA 테두리(바깥선)가 있으면 배경과의 경계는 그 테두리가 만든다. 노선색 선에도 얇은 밝은 바깥선을 두면 어느 배경에서든 보인다 (For Honor식 이중 테두리 원리).
- **설정 옵션(선택)**: XAG 103 권고대로 "노선색 직접 고르기"를 노선 패널에 두면 색각이상 플레이어가 스스로 해결할 수 있다. 이미 노선 이름·색 바꾸기 기능(routes.js)이 있으므로 비용이 작다.

### Gaps
- 한국인 색각이상 비율(남성·여성 %)의 믿을 만한 1차 출처를 찾지 못했다. 흔히 도는 "남성 5.9%"류 수치는 출처 미확인. 전 세계 아동·청소년 메타분석은 있으나 ([PubMed 40769301](https://pubmed.ncbi.nlm.nih.gov/40769301/)) 수치를 직접 읽지 못했다.
- ΔE00 몇 이상이면 "가는 선에서도 구분된다"는 공식 기준은 찾지 못했다. 위의 10 기준은 경험칙이다. 실제 판단은 Color Oracle 같은 화면 필터로 게임 화면을 직접 보는 것이 좋다 ([Color Oracle](https://colororacle.org/), XAG 102·103이 추천).
- 서울 새 노선도의 실제 색 값과 "무늬" 방식은 공개 자료에서 확인하지 못했다.
- 시뮬레이션은 완전 색맹(이색형) 기준이다. 더 흔한 약한 색각이상(이상 삼색형)은 그 사이 정도로 보면 된다 (DaltonLens는 이 경우 Machado 2009를 추천).

## 4. 한국어 UI 글꼴: 추천 웹 글꼴, 굵기, 줄 간격, 숫자 고정폭

### Takeaway
Pretendard(또는 정부용 변형 Pretendard GOV)가 가장 무난하다. 9가지 굵기, 가변 글꼴, 페이지에 쓴 글자만 받는 동적 서브셋, `tnum` 고정폭 숫자를 모두 지원하고 OFL 라이선스다. 굵기는 400/500/700 세 가지로 제한하고, 여러 줄 글은 줄 간격 1.5, 한 줄짜리 라벨·숫자는 더 좁게 쓴다.

### Cited Findings
- Pretendard: 9가지 굵기 + 가변 글꼴("Pretendard Variable"), Google Fonts 한국어 글꼴과 같은 방식의 동적 서브셋(`pretendard-dynamic-subset.min.css`), jsDelivr CDN 제공(`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css`), npm 설치 가능, SIL Open Font License(단독 판매만 금지). 라틴은 Inter, 한글은 Source Han Sans, 가나는 M PLUS 1p 기반. — [Pretendard GitHub](https://github.com/orioncactus/pretendard)
- Pretendard OpenType: `tnum`(고정폭 숫자, 가격·날짜 정렬 예시), `zero`, `ss06`(헷갈리는 글자 구분 강화), `case`, `calt`("12:34" 같은 문맥 조정) 등. — [cactus.tistory.com/306](https://cactus.tistory.com/306)
- KRDS 표준형: 국문·영문 모두 Pretendard GOV. 확장형 추천 서체: 노토 산스, 나눔 고딕, 스포카 한 산스. 굵기 400 본문 / 500 / 700 제목·강조, 최대 4가지. 줄 간격 150% 이상(상대 단위). 자간 0px (큰 제목만 1px). — [KRDS 타이포그래피](https://www.krds.go.kr/html/site/style/style_03.html)
- WCAG 2.2 1.4.12: 사용자가 줄 간격 1.5배, 문단 뒤 간격 2배, 자간 0.12배, 단어 간격 0.16배로 바꿔도 내용·기능이 깨지지 않아야 한다. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- XAG 101: 한·중·일 글은 한 줄 40자 이하, 줄 간격 1.5 이상. 산세리프 글꼴 옵션을 최소 하나 두고, 지원 언어의 글자를 모두 담은 글꼴을 쓴다. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)

### Inferences
- 레일맵 적용: `font-family: 'Pretendard Variable', Pretendard, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;` 로 바꾸고, 동적 서브셋 CSS를 쓰면 한글 글꼴 전체(수 MB)를 받지 않아도 된다. 다만 MapLibre 지도 라벨은 CSS 글꼴이 아니라 지도 스타일의 글리프(glyphs)를 쓰므로, 지도 위 지명은 이 변경의 영향을 받지 않는다 (DOM으로 그리는 역 이름 말풍선·패널만 해당).
- 새 라이브러리(npm 패키지)라기보다 글꼴 파일이므로, CLAUDE.md 규칙대로 추가 전에 이유를 설명하면 된다. CDN 대신 npm `pretendard` 패키지로 넣으면 오프라인·GitHub Pages 배포에서도 같은 결과가 나온다 (Gaps: npm 패키지 이름·경로는 GitHub 페이지에 "npm 가능"으로만 확인).
- 숫자: 자금·수지·승객·날짜 배지에 `font-variant-numeric: tabular-nums;`. 줄 간격: 패널 설명 글 1.5, 한 줄 라벨·배지·버튼은 1.2~1.3 (1.5 규칙은 여러 줄 글 기준).
- Noto Sans KR도 대안이지만, Pretendard가 Inter 기반이라 숫자·영문이 더 촘촘하고 고정폭 숫자 지원이 명확하다 (Noto Sans KR의 tnum 지원 여부는 확인 못 함).

### Gaps
- SUIT 글꼴(선린 제작) 공식 문서는 확인하지 못했다.
- Noto Sans KR의 `tnum` 지원 여부, Pretendard GOV와 Pretendard의 차이(크기·간격)는 1차 출처로 확인하지 못했다.
- 한글 글꼴의 CSS font-size 대비 실제 "몸 높이" 비율(XAG 18px 기준 환산)은 측정 자료를 찾지 못했다. 실제 화면에서 XAG 101의 그림판 측정법으로 재보는 것이 확실하다.

## 5. 플랫 UI에서 상태 변화 알리기 (돈 오르내림, 선택) — 그림자 없이

### Takeaway
짧은(100~300ms) ease-out 움직임, 색 채움 반전, 테두리 굵기, 숫자 옆 +/− 기호와 화살표를 함께 쓴다. 색(초록=이익, 빨강=손해)만으로 표시하면 안 되고, "움직임 줄이기" 설정을 따라야 한다.

### Cited Findings
- NN/g: 체크박스·토글 같은 단순 피드백은 약 100ms, 모달처럼 큰 화면 변화는 200~300ms, 일반 범위 100~400ms. 500ms부터는 느리게 느껴진다. 나타날 때가 사라질 때보다 약간 길게 (예: 300ms / 200~250ms). 자주 나오는 애니메이션일수록 더 짧고 은은하게. — [NN/g: Executing UX Animations: Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/)
- NN/g: 대부분 ease-out(빨리 시작해 천천히 멈춤)이 반응이 빠르게 느껴진다. 완전한 직선(linear) 움직임은 부자연스럽다. 상태 변화는 색이 바뀌거나 서서히 나타나는 방식으로 알릴 수 있다. 움직임 줄이기 설정을 켠 사용자에게는 애니메이션을 없애고, 깜빡임·패럴랙스는 피한다. — [NN/g](https://www.nngroup.com/articles/animation-duration/)
- WCAG 2.2 2.3.3(AAA): 사용자 조작으로 생기는 움직임 애니메이션은 꼭 필요한 경우가 아니면 끌 수 있어야 한다. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- WCAG 2.2 2.4.13(AAA): 키보드 초점 표시는 요소 둘레 2 CSS px 두께 이상의 면적이고, 초점 전후 같은 픽셀의 대비가 3:1 이상이어야 한다. — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- XAG 103: 중요한 시각 정보는 다른 감각(소리 등)으로도 전달한다. Grounded는 새 목표가 뜰 때 소리 신호를 함께 준다. — [XAG 103](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103)

### Inferences
- 돈 변화: 매달 정산 때 자금 옆에 "+1.2억 ▲" / "−3,400만 ▼" 를 남색 판 위 글자로 300ms 동안 떠오르게(ease-out) 하고 1~2초 뒤 사라지게 한다. 색은 보조로만 (▲▼ 기호와 +/− 가 주 정보). 빚 상태는 숫자 앞 "빚" 글자 + 배지 테두리 색으로.
- 선택: 선택된 역·노선은 "테두리 굵기 증가 + 채움 반전"으로 표시하고, 지도에서는 노란 #F2C230 링을 남색 테두리 안쪽에 두르면 (노랑/남색 6.98:1) 그림자 없이도 분명하다. 2.4.13 기준(2px, 3:1)을 키보드 초점 표시에도 그대로 쓴다.
- 레일맵은 이미 소리 효과(개통 차임, 도착음)가 있으므로 XAG 103의 "다른 감각으로 함께" 원칙을 일부 충족한다. 반대로 소리만으로 알리는 사건(예: 첫 열차 경적)이 있다면 지도 말풍선을 함께 띄운다.
- `@media (prefers-reduced-motion: reduce)`일 때 숫자 떠오르기·패널 슬라이드를 끄고 즉시 바뀌게 한다. 열차 이동 자체는 게임 내용이므로 "꼭 필요한 애니메이션"에 해당한다.
- 매 프레임 바뀌는 숫자(자금)에 애니메이션을 걸면 50역·30열차 성능 목표에 부담이 될 수 있으므로, 월 정산처럼 드문 사건에만 건다.

### Gaps
- Material 3 motion 토큰(지속 시간·easing 이름)과 Apple HIG 피드백 지침은 직접 확인하지 못했다 (페이지가 스크립트로 그려짐 / 시간 부족).
- 게임에서 돈 증감 표시 방식(떠오르는 숫자 등)에 대한 연구·GDC 자료는 찾지 못했다. 위 제안은 일반 UI 원칙에서 끌어낸 추론이다.
