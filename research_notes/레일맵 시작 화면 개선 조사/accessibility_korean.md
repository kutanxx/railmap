# 레일맵 시작 화면 접근성 — 한국어 사용자 관점 조사 메모

(조사일 2026-10-28. 대비 수치는 WCAG 상대 휘도 공식으로 직접 계산했다. 현재 코드 대조는 `src/ui/startScreen.js`, `src/styles/start.css`, `src/styles/base.css`, `index.html`을 읽고 확인했다.)

## 1. 게임·웹 지침(GAG, Xbox XAG, WCAG 2.2)이 메뉴에 요구하는 것: 글자 크기·대비·누름 크기·키보드·탭·이미지·움직임·색

### Takeaway
웹 기준(WCAG 2.2 AA)으로는 글자 대비 4.5:1, 버튼 테두리·초점 표시 3:1, 누름 대상 24×24 CSS px, 모든 기능 키보드 조작이 최소선이다. 게임 지침은 글자 크기를 훨씬 크게 요구한다(Xbox PC 기준 1080p에서 글자 몸통 높이 18px, GAG는 TV 기준 28px). 13px 보조 글자는 웹 기준으로는 허용되지만 게임 지침 기준으로는 작다.

### Cited Findings
**글자 대비**
- WCAG 2.2 SC 1.4.3 (AA): 글자와 배경 대비 4.5:1 이상. "큰 글자"(18pt ≈ 24 CSS px, 또는 굵게 14pt ≈ 18.66 CSS px)는 3:1. — [W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- WCAG 2.2 SC 1.4.11 (AA): 버튼 테두리, 초점 표시 같은 UI 구성요소의 경계는 주변과 3:1 이상. — [W3C Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- GAG Basic(시각): "Provide high contrast between text/UI and background", "Ensure no essential information is conveyed by a fixed colour alone". — [Game Accessibility Guidelines – Basic](https://gameaccessibilityguidelines.com/basic/)

**글자 크기 (게임 지침)**
- Xbox XAG 101: 실행 첫 화면부터 기본 글자 크기가 PC/VR 1080p에서 18px 이상(4K 36px), 콘솔 1080p 26px, 모바일 100 DPI당 18px. 여기서 px는 CSS font-size가 아니라 **위로 솟은 획 꼭대기~아래로 내려간 획 끝까지의 실제 픽셀 높이(body height)**다. 화면 돋보기는 작은 글자의 대안이 될 수 없다고 명시. — [Microsoft Learn, XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101: 글자는 기본 최소 크기의 200%까지 키울 수 있어야 하고, 키워도 내용·기능을 잃지 않으며 한 판 안에서 가로·세로 두 방향 스크롤을 요구하지 않을 것. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101: "If a player can't read menu text, they might be excluded before they can even enter the gameplay experience" — 메뉴 글자가 첫 관문이라는 점을 직접 지적. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- XAG 101 글줄 간격(두 줄 넘는 글 묶음): 한 줄 너비 80자 이하, **한국어·중국어·일본어는 40자 이하**, 행간 1.5 이상, 문단 간격은 행간의 2배, 자간 0.12em, 어간 0.16em. 글은 언어 방향대로 왼쪽 정렬(가운데·양쪽 정렬 지양). 산세리프 서체 한 가지 이상, 모든 지원 언어 글자 세트 포함. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- GAG "Use an easily readable default font size": 1080p 화면에서 28px을 "목표가 아닌 최소"로 제시(출처는 Amazon TV 10-foot UI 지침, 즉 TV 거리 기준). 가장 좋은 해법은 글자 크기 선택권. — [GAG](https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/)
- WCAG 2.2 SC 1.4.4 (AA): 브라우저 확대 200%에서 내용·기능 손실 없음. SC 1.4.12 (AA): 사용자가 행간 1.5, 문단 간격 2배, 자간 0.12em, 어간 0.16em으로 바꿔도 글이 잘리거나 겹치지 않을 것. — [W3C Understanding 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [W3C Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

**누름 대상 크기**
- WCAG 2.2 SC 2.5.8 Target Size (Minimum) (AA): 24×24 CSS px 이상. 더 작으면 대상 가운데를 중심으로 지름 24px 원이 다른 대상(또는 그 원)과 겹치지 않으면 통과. 예외: 같은 기능의 다른 큰 버튼이 있음, 문장 속 링크, 브라우저 기본 컨트롤, 꼭 필요한 경우. 더 엄격한 2.5.5(Enhanced)를 중요한 컨트롤에 권장. — [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- WCAG 2.5.5 (AAA)는 44×44 CSS px. — [frontendchecklist.io touch targets](https://frontendchecklist.io/rules/accessibility/touch-targets) (2차 출처, W3C 원문은 [Understanding 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html))
- GAG Basic(운동·시각): "Ensure interactive elements / virtual controls are large and well spaced, particularly on small or touch screens". — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)

**키보드·초점**
- WCAG 2.1.1 (A): 모든 기능 키보드로 조작. 2.4.3 (A): 초점 순서가 의미에 맞게. 2.4.7 (AA): 초점 표시가 보일 것. 2.4.11 Focus Not Obscured (Minimum) (AA, 2.2 신설): 초점 받은 요소가 다른 내용에 완전히 가려지지 않을 것. — [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- WCAG 2.4.13 Focus Appearance (**AAA**): 초점 표시 면적이 요소 둘레 2 CSS px 두께 테두리 이상, 초점 전후 같은 픽셀 대비 변화 3:1 이상. 실선 2px 외곽선이 가장 쉬운 방법. 예: 90×30 버튼이면 최소 480px². — [W3C Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- GAG Basic: "Ensure that all areas of the user interface can be accessed using the same input method as the gameplay", "Allow the game to be started without the need to navigate through multiple levels of menus", "Ensure that all settings are saved/remembered". — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)

**탭 패턴 (WAI-ARIA APG)**
- 탭 묶음 `role="tablist"`(보이는 제목이 있으면 `aria-labelledby`, 없으면 `aria-label`), 각 탭 `role="tab"` + `aria-controls`(패널 id) + `aria-selected="true/false"`, 패널 `role="tabpanel"` + `aria-labelledby`(탭 id). — [WAI-ARIA APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- 키보드: Tab으로 들어오면 **현재 고른 탭**에 초점, 다시 Tab이면 탭 묶음을 떠나 패널로. 왼쪽/오른쪽 화살표로 탭 사이 이동(끝에서 처음으로 돌아감), Home/End(선택)로 처음/끝 탭. 패널이 바로 보일 수 있으면(미리 불러온 내용) 초점이 가면 바로 바뀌는 "자동 활성화"를 권장. 패널 안 첫 요소가 초점을 못 받으면 패널에 `tabindex="0"`. — [WAI-ARIA APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

**이미지 대체 글, 움직임, 깜빡임, 언어**
- WCAG 1.1.1 (A): 의미 있는 이미지는 대체 글. 옆 글자가 같은 정보를 이미 주는 이미지는 장식으로 보고 `alt=""`. — [W3C WAI Images Tutorial – Decorative](https://www.w3.org/WAI/tutorials/images/decorative/)
- WCAG 2.3.1 (A): 1초에 3번 넘게 번쩍이지 않기. 2.3.3 Animation from Interactions (AAA): 사용자 동작으로 생기는 움직임을 끌 수 있게(보통 `prefers-reduced-motion`로 구현). — [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- GAG Basic(인지): "Avoid flickering images and repetitive patterns", "Use simple clear language", "Use simple clear text formatting". — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)
- WCAG 3.1.1 (A): 페이지 기본 언어 표시(`<html lang="ko">`) — 화면 읽기 프로그램이 한국어 음성을 고르게 한다. — [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Inferences
- XAG의 18px은 "글자 몸통 높이"라서 CSS font-size와 다르다. 한글은 네모 틀 안에 그려져 실제 높이가 font-size보다 약간 작으므로(정확한 비율은 서체마다 다름, 측정 필요), 13px 한글은 몸통 높이가 대략 11~12px로 XAG PC 기준(18px)에 한참 못 미친다. 15px도 미달, 20px 정도여야 근접할 것으로 추정한다. 시작 화면 설명 글을 13px에서 15px로 올리고, [메뉴]의 [작게][보통][크게] 화면 크기 설정을 시작 화면에서도 쓰게 하는 것이 XAG "200% 확대" 요구에 가장 싼 대응이다.
- 웹 게임은 법적·관행적으로 WCAG(웹) 쪽이 기본선이고, XAG/GAG는 "좋은 게임"의 목표선이다. 시작 화면은 HTML 버튼이므로 WCAG 항목을 그대로 시험할 수 있다.

### Gaps
- Xbox XAG 102(대비)·XAG 112(UI 탐색)는 직접 열어보지 못했다. 게임 쪽 대비 수치는 WCAG 값(4.5:1)을 따르는 것으로 알려져 있으나 이번 조사에서 원문 확인은 못 했다.
- AbleGamers / Can I Play That?의 메뉴 접근성 글은 이번 조사 범위(도구 호출 수) 안에서 찾지 못했다.

## 2. 한국 기준: KWCAG 2.2 해당 항목, 한글 글자 크기·행간, 13px 한글은 작은가

### Takeaway
KWCAG 2.2(KS X OT0003:2022, 33개 검사항목)는 WCAG 2.1을 바탕으로 해서 대비(4.5:1)·키보드·초점 요구는 같지만, 누름 크기는 "대각선 6.0mm 이상 권고"로 WCAG 2.2의 24px보다 느슨하고, "이웃한 콘텐츠 구분(5.4.4)", "자동 재생 금지(5.4.2)", "문자 단축키(6.1.4)"를 따로 검사한다. 한글 글자 크기는 국내 연구·가이드가 "클수록, 행간 넓을수록 낫다"는 경향만 일치하고 13px 하한을 직접 다룬 근거는 찾지 못했다. 정부 디자인 시스템(KRDS)은 본문 17px·캡션 13px로 소개되어, 13px는 "짧은 캡션용"이라는 해석이 자연스럽다.

### Cited Findings
**KWCAG 2.2 기본 정보**
- 정식 이름 한국형 웹 콘텐츠 접근성 지침 2.2(KS X OT0003:2022), 2022-12-28 개정, W3C WCAG 2.1(2018) 기반. 4원칙·14지침·33검사항목. 공식본은 국립전파연구원에서 배포. — [a11ykr KWCAG 2.2 HTML(비공식 변환본)](https://a11ykr.github.io/kwcag22/), [요즘IT](https://yozm.wishket.com/magazine/detail/1942)

**시작 화면에 걸리는 KWCAG 2.2 항목 (원문 요구 문장)**
- 5.1.1 적절한 대체 텍스트 제공: "텍스트 아닌 콘텐츠는 그 의미나 용도를 인식할 수 있도록 대체 텍스트를 제공해야 한다." — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 5.3.2 콘텐츠의 선형구조 / 5.3.3 명확한 지시사항 제공(모양·위치·색·소리 한 감각에만 기대지 않기). — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 5.4.1 색에 무관한 콘텐츠 인식: "콘텐츠는 색에 관계없이 인식될 수 있어야 한다." — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 5.4.2 자동 재생 금지: 소리 자동 재생 금지, 3초 넘는 소리는 멈춤·정지·음량 조절 제공. — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 5.4.3 텍스트 콘텐츠의 명도 대비: 4.5:1 이상, 18pt 이상 또는 굵은 14pt 이상이면 3:1. (WCAG 1.4.3과 같음) — [a11ykr](https://a11ykr.github.io/kwcag22/), [websoul KWCAG 2.2 PDF](https://www.websoul.co.kr/accessibility/PDF/%ED%95%9C%EA%B5%AD%ED%98%95%EC%9B%B9%EC%BD%98%ED%85%90%EC%B8%A0%EC%A0%91%EA%B7%BC%EC%84%B1%EC%A7%80%EC%B9%A82.2.pdf)
- 5.4.4 콘텐츠 간의 구분: "이웃한 콘텐츠는 구별될 수 있어야 한다." (테두리·간격·색 등으로 구별. WCAG에 1:1 대응 항목이 없는 한국 고유 항목) — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.1.1 키보드 사용 보장: "모든 기능은 키보드만으로도 사용할 수 있어야 한다." — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.1.2 초점 이동과 표시: "키보드에 의한 초점은 논리적으로 이동해야 하며, 시각적으로 구별할 수 있어야 한다." — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.1.3 조작 가능: "사용자 입력 및 콘트롤은 조작 가능하도록 제공되어야 한다." 권고 크기 **대각선 6.0mm 이상, 안쪽 여백 1px 이상**. — [a11ykr](https://a11ykr.github.io/kwcag22/); 2.1판에서도 6.0mm는 의무가 아닌 권고였다는 설명 — [kwacc 표준 문서](http://www.kwacc.or.kr/Home/DownLoad?seq=246)
- 6.1.4 문자 단축키: 한 글자 단축키는 끌 수 있거나, 조합키로 바꿀 수 있거나, 초점이 있을 때만 작동. — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.2.2 정지 기능 제공: 자동으로 바뀌는 콘텐츠는 움직임 제어 가능. 6.3.1 깜빡임과 번쩍임 사용 제한: 초당 3~50회 깜빡임 금지(10인치 이상 화면은 면적 10% 이하). — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.4.2 제목 제공: "페이지, 프레임, 콘텐츠 블록에는 적절한 제목을 제공해야 한다." — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 6.5.3 레이블과 네임: 보이는 글자가 있는 컨트롤은 접근 가능한 이름에 그 글자를 포함. — [a11ykr](https://a11ykr.github.io/kwcag22/)
- 7.1.1 기본 언어 표시: "주로 사용하는 언어를 명시해야 한다." 7.2.1 사용자 요구에 따른 실행: 의도하지 않은 새 창·초점 이동에 따른 맥락 변화 금지. 7.2.2 찾기 쉬운 도움 정보: 도움말은 각 페이지에서 같은 상대 순서. 8.2.1 웹 애플리케이션 접근성 준수. — [a11ykr](https://a11ykr.github.io/kwcag22/)

**한글 글자 크기·행간**
- KRDS(행정안전부 대한민국 정부 UI/UX 디자인 시스템): 본문(body-medium) 17px·굵기 400·행간 1.5, Body Small 15px, Caption 13px. 고령층·저시력 사용자를 고려해 본문을 17px로 잡았다는 설명. **주의: 서드파티 갤러리 사이트 한 곳의 정리이며 krds.go.kr 원문에서 수치를 확인하지 못했다.** — [oppadu 디자인 시스템 갤러리 – KRDS](https://www.oppadu.com/tools/design-systems-site/brand/krds.html); KRDS 개요 — [krds.go.kr](https://krds.go.kr/html/eng/outline/outline_02.html), [디자인 컴퍼스](https://designcompass.org/2025/01/22/krds-start/)
- 국내 전문가 조사(KCI): 행간 120%·160%·200% 중 200%가 좁은·넓은 문서 모두에서 가독성 가장 높게 평가, 좁은 화면 글자 크기는 1rem(보통 16px)이 선호. — [KCI 웹 문서의 가독성 향상을 위한 전문가 조사](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002575850)
- 스마트폰 실험(한국디지털콘텐츠학회, 20~30대·50~60대 각 10명): 9pt보다 12pt, 행간 100%보다 160%가 두 연령대 모두 가독성이 좋았다(표본 작음). — [Korea Digital Contents Society](http://journal.dcs.or.kr/_common/do.php?a=full&b=12&bidx=1671&aidx=18118)
- 실무 가이드: 한글 본문 행간 150~180%, 최소 1.5배 권장(실험 근거 없는 실무 정리). — [inthiswork 모바일 UI 텍스트 가독성](https://inthiswork.com/archives/250750)
- WCAG 1.4.8(AAA)·XAG 101: CJK 글은 한 줄 40자 이하(영어 80자). — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)

### Inferences
- **한국 기준이 영어권과 다른 점**
  1. 누름 크기: KWCAG는 "대각선 6.0mm 권고"뿐이다. 화면 96 CSS px = 1인치(25.4mm)로 치면 6.0mm ≈ 22.7 CSS px 대각선 ≈ 정사각형 16×16px 수준이라, WCAG 2.2의 24×24px(AA)보다 훨씬 느슨하다. 시작 화면은 더 엄격한 WCAG 2.2 값을 따르면 두 기준을 다 만족한다.
  2. KWCAG 2.2는 WCAG 2.1 기반이라 WCAG 2.2의 2.4.11(초점 가려짐 없음)·2.5.8(24px)이 의무 항목에 없다. 반대로 5.4.4 "콘텐츠 간의 구분"은 한국 고유 항목으로, 카드끼리·탭끼리 테두리나 간격으로 확실히 갈라져 보여야 한다(레일맵의 "흰 판 + 남색 2px 테두리" 규칙이 이미 잘 맞는다).
  3. 5.4.2 자동 재생 금지와 6.1.4 문자 단축키가 독립 검사항목이다. 게임 화면의 H·N·V·Space·숫자 단축키는 6.1.4 대상이 될 수 있다(시작 화면 자체에는 해당 없음).
  4. 한글은 영어보다 글자 하나에 획이 많아 같은 px에서 더 빽빽해 보이고, 국내 자료는 영어권(행간 1.5)보다 넉넉한 행간(1.6~2.0)을 지지한다. 시작 화면 카드 설명 글의 현재 행간 1.4(`start.css` 235행)는 국내 권장(1.5 이상)보다 좁다.
- **13px 한글은 작은가**: KRDS 체계에서 13px는 "캡션" 단계라, 지도 종류("실제 지도 · 한국")·저장 상태 같은 한두 단어 꼬리표엔 무방하지만, 한 줄 설명 문장(카드 설명)은 15px(Body Small) 이상이 한국 기준에도 맞다. 게임 지침(XAG 18px 몸통 높이)으로 보면 13px는 확실히 작다.
- 맑은 고딕은 화면 표시용으로 만든 서체라 작은 크기에서도 비교적 또렷하지만, 13px에서 굵기 400 + 보조 색(#6F6656)이 겹치면 대비 여유가 적다(아래 4번의 계산 참고).

### Gaps
- KRDS 공식 사이트에서 17px/13px 수치를 직접 확인하지 못했다(서드파티 정리만 확인).
- "13px 한글"의 최소 가독 크기를 직접 실험한 국내 연구는 찾지 못했다. 국립국어원·한글 타이포그래피 기관의 웹 글자 크기 권고도 찾지 못했다.
- 토스·카카오 디자인 가이드의 글자 크기 수치는 이번 조사에서 확인하지 못했다.
- 민간 웹 게임에 KWCAG 준수가 법적 의무인지(장애인차별금지법 적용 범위)는 조사하지 않았다.

## 3. 색각이상 안전: 지도 그림(썸네일)과 노선 색

### Takeaway
"색만으로 정보를 전하지 말 것"은 GAG·WCAG·KWCAG 모두의 기본 항목이다. 서울시는 2015·2018년 색각이상자용 노선도에서 비슷해 보이는 노선(2·4·7·9호선)에 굵기·테두리를 달리하고 환승역에 노선 색과 번호를 함께 써서 해결했다. 레일맵 시작 화면은 지도 그림이 베이지 단색 계열이고 이름·글자가 함께 있어 색 의존이 낮다.

### Cited Findings
- GAG Basic: "Ensure no essential information is conveyed by a fixed colour alone"(기호를 함께 쓰거나 다른 색 선택지 제공). — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)
- WCAG 1.4.1 Use of Color (A) / KWCAG 5.4.1 색에 무관한 콘텐츠 인식. — [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [a11ykr](https://a11ykr.github.io/kwcag22/)
- 서울시·네이버 색각이상자용 지하철 노선도(2015): 색이 비슷한 노선은 굵기를 달리하거나 외곽선을 더해 구분, 레드닷 어워드 수상. 2018년 개정판: 호선별 색상·명도·채도 조정, 비슷하게 보이는 2·4·7·9호선에 별도 색 테두리, 환승역에 노선 색과 번호 함께 표기. — [서울시 내 손안에 서울: 색각이상자용 지하철 노선도](https://mediahub.seoul.go.kr/archives/917354), [서울시 교통 누리집 – 색맹 태그](https://news.seoul.go.kr/traffic/archives/tag/%ec%83%89%eb%a7%b9)
- 2014 삼성 투모로우 솔루션 공모: 색각이상자 눈으로 본 노선도를 만들고 무늬(패턴)로 노선을 구분하는 안. — [삼성전자 뉴스룸](https://news.samsung.com/kr/%ED%88%AC%EB%AA%A8%EB%A1%9C%EC%9A%B0-%EA%B8%B0%ED%9A%8D-%EC%82%AC%ED%9A%8C%EA%B3%B5%ED%97%8C%EC%9D%84-%EB%A7%90%ED%95%98%EB%8B%A4_%E3%89%93-%EC%82%BC%EC%84%B1-%ED%88%AC%EB%AA%A8%EB%A1%9C%EC%9A%B0)
- 서울시는 이후 색각이상자도 구분하기 쉬운 색상체계와 픽토그램을 넣은 새 노선도로 바꾼다고 발표(정확한 연도는 기사에서 확인 못 함). — [위키트리](https://www.wikitree.co.kr/articles/1042756), [내 손안에 서울](https://mediahub.seoul.go.kr/archives/2009054)

### Inferences
- 시작 화면 지도 그림은 장식에 가깝다(이름·종류·설명 글이 옆에 있다). 그러니 그림 속 색 구분이 정보 전달에 쓰이지 않는 한 색각이상 문제는 작다. 다만 그림에 노선 색을 넣는 쪽으로 바꾼다면 서울 노선도처럼 노선 번호 배지·굵기 차이를 함께 써야 한다.
- 현재 코드 확인: 하던 게임이 있는 카드는 이름 앞 노란 점(`start-dot`)과 함께 "이어하기 · 2026년 3월" 글자가 나온다 → 색만으로 전하지 않음(통과). 고른 탭은 남색 채움 + `aria-selected` → 모양·상태로도 구분(통과).
- 노란 점(#F2C230)은 흰 바탕 위 1.68:1, 베이지 위 1.36:1이라 점 자체는 1.4.11 비텍스트 대비(3:1)에 못 미친다. 글자가 같은 정보를 주므로 위반은 아니지만, 점을 "알아보는 표시"로 기대하면 안 된다.
- 게임 안 노선 색은 이미 "추천 10색 밝기 맞춤 + 번호 배지 + 노선 이름"이 있어 서울 2018 방식과 같은 방향이다. 실제 도시 노선 색(서울 2·4·7·9호선 같은 초록·파랑·올리브 계열)은 색각이상 눈에 겹칠 수 있다.

### Gaps
- 레일맵 실제 노선 색 조합을 색각이상 시뮬레이터로 돌려보지는 않았다(이번 범위 밖).

## 4. 모바일·터치: 최소 누름 크기와 데스크톱 전용 게임일 때

### Takeaway
누름 크기 기준은 WCAG 2.2 AA 24×24 CSS px, WCAG AAA·Apple 44×44(pt), Material 48×48dp, KWCAG 대각선 6mm 권고 순으로 엄격하다. 시작 화면 버튼은 터치 화면에서도 44px 이상을 목표로 하는 것이 안전하다. 데스크톱 전용 게임이 터치·좁은 화면에서 어떻게 안내해야 하는지 다루는 공식 지침은 찾지 못했다.

### Cited Findings
- Apple HIG: 누름 영역 최소 44×44pt. Material Design: 48×48dp, 버튼 그림이 작으면 둘레에 누름 영역을 넓힘. — [frontendchecklist.io](https://frontendchecklist.io/rules/accessibility/touch-targets), [OpenReplay blog](https://blog.openreplay.com/improving-tap-targets-mobile-ux/) (2차 출처, Apple·Google 원문은 확인 못 함)
- WCAG 2.5.8 (AA) 24×24 CSS px 또는 24px 간격, 2.5.5 (AAA) 44×44 CSS px. — [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- KWCAG 6.1.3: 대각선 6.0mm 이상, 안쪽 여백 1px 이상 권고. — [a11ykr](https://a11ykr.github.io/kwcag22/)
- GAG Basic: 작은 화면·터치 화면에서 특히 크고 간격 넓은 컨트롤. — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)
- XAG 101: 모바일 글자는 100 DPI당 18px(400 DPI면 72px)로 DPI에 비례해 키운다. — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)

### Inferences
- `title` 속성 말풍선(현재 [샌드박스] 버튼의 "돈 무제한 (빚·파산·목표 없음). 저장 칸이 따로예요")은 마우스를 올려야만 보여서 **터치·키보드 사용자는 볼 수 없다.** 이 설명은 화면에 글로 보이게 하거나 버튼 이름 옆에 짧게 적는 편이 낫다.
- 데스크톱 전용 게임이면: (1) 시작 화면은 터치로도 고를 수 있게 두되, (2) 좁은 화면·터치 기기에서는 "이 게임은 마우스와 키보드가 있는 컴퓨터에 맞춰져 있어요" 같은 안내를 시작 화면에 한 줄 보이게 하는 것이 현실적이다(공식 지침이 아니라 GAG "접근성 정보를 게임 안에서 알려라"(Provide details of accessibility features in-game)에서 끌어낸 추론).
- 레일맵 시작 화면은 `padding: 24px 16px`로 좁은 화면 바깥 여백이 이미 있다.

### Gaps
- 데스크톱 전용 웹 게임이 모바일 접속자에게 어떻게 알려야 하는지 다룬 공식 지침·연구는 찾지 못했다.
- Apple HIG·Material 원문 페이지를 직접 열어 확인하지 못했다(2차 출처 여러 곳이 같은 값을 제시).

## 5. 레일맵 시작 화면 점검표 (지침 × 현재 코드·색 대조)

### Takeaway
기본 틀(버튼 사용, `lang="ko"`, 초점 3px 남색 외곽선, 움직임 줄이기, 탭의 `role`/`aria-selected`, 지도 그림 `alt`)은 이미 갖춰져 있다. 고칠 곳은 ① 탭의 키보드·ARIA 연결이 반쪽, ② 주황 저장 상태 글자 대비 미달, ③ 지도 그림 alt 중복, ④ [샌드박스] 설명이 `title`에만 있음, ⑤ 13px 설명 글과 행간 1.4, ⑥ [샌드박스] 버튼 높이 확인 필요다.

### Cited Findings
**색 대비 (직접 계산, 기준은 [W3C 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)·[1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)·KWCAG 5.4.3)**

| 글자 / 바탕 | 대비 | 4.5:1 글자 기준 |
| --- | --- | --- |
| 남색 #1F3A55 / 흰색 | 11.70 | 통과 |
| 남색 #1F3A55 / 땅 베이지 #EFE7D6 | 9.51 | 통과 |
| 흰색 / 남색 (고른 탭·눌린 카드) | 11.70 | 통과 |
| 노랑 #F2C230 / 남색 | 6.98 | 통과 |
| 연회청 #D3DCE5 / 남색 (눌린 카드의 보조 글) | 8.44 | 통과 |
| 보조 #6F6656 / 흰색 | 5.66 | 통과 |
| 보조 #6F6656 / 땅 #EFE7D6 | 4.60 | 겨우 통과 |
| 보조 #6F6656 / 시가지 #E9E0CC | 4.31 | **미달** |
| 주황 #C9772F / 흰색 (카드의 "이어하기 · n년 n월" 13px 굵게) | 3.41 | **미달** (13px 굵게는 "큰 글자"(굵게 18.66px) 아님) |
| 흐린 지명색 #9A8F7B / 흰색 | 3.19 | 미달 (CLAUDE.md가 이미 패널에서 금지) |
| 노란 점 #F2C230 / 흰색 | 1.68 | 점은 비텍스트 3:1 미달 (글자가 같은 정보 → 위반 아님) |
| 얇은 테두리 #CFC0A3 / 흰색 | 1.79 | 누를 수 없는 정보 판에만 쓰면 무방. 버튼 경계로 쓰면 1.4.11 미달 |

**현재 코드 대조**
- `index.html` 2행 `<html lang="ko">` → WCAG 3.1.1 / KWCAG 7.1.1 통과.
- `base.css` 37~40행 `:focus-visible { outline: 3px solid navy; outline-offset: 2px }` → 2.4.7 / KWCAG 6.1.2 통과, 두께 3px라 2.4.13(AAA) 면적 조건도 충족. 고른 탭(남색 채움)의 바깥 2px 띄운 남색 외곽선은 흰 탭 바탕 위에 그려지므로 보임.
- `base.css` 43행 `@media (prefers-reduced-motion: reduce)`로 애니메이션·전환 끔 → 2.3.3 대응.
- `startScreen.js` 64행 `role="tablist"`, 105·119행 `role="tab"`·`aria-selected` → 있음. **없는 것**: tablist의 이름(`aria-labelledby`로 바로 위 "새로 시작할 지도" 제목 연결), 각 탭의 `id`·`aria-controls`, 카드 묶음(`.start-choices`)의 `role="tabpanel"`·`aria-labelledby`, 화살표·Home/End 키, 고르지 않은 탭의 `tabindex="-1"`(roving tabindex). 지금은 모든 탭이 Tab 키 순서에 들어가 있어 APG 패턴과 다르다. — 기준: [WAI-ARIA APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- `startScreen.js` 138행 지도 그림 `alt = "서울 지도"` + 같은 버튼 안에 "서울" 이름 글자 → 화면 읽기 프로그램이 "서울 지도 서울 실제 지도 · 한국 …"처럼 이름을 두 번 읽는다. 옆 글자가 같은 정보를 주므로 `alt=""`가 맞다. — 기준: [W3C WAI Images – Decorative](https://www.w3.org/WAI/tutorials/images/decorative/)
- `startScreen.js` 155행 [샌드박스]의 설명이 `title`에만 있음 → 터치·키보드 사용자는 못 봄(위 4번 참고).
- `start.css` 268~270행 [샌드박스] `padding: 4px 10px`, 13px 글자 → 높이는 대략 26~30px로 추정(측정 필요). 24px(AA)는 넘지만 44px(AAA/Apple)에는 못 미침. 탭 `padding: 6px 14px`도 15px 글자 기준 대략 32~36px로 추정.
- `start.css` 233~235행 카드 설명: 13px, 보조 색, 행간 1.4 → 대비는 흰 카드 위 5.66:1로 통과지만 크기·행간은 국내 권장(15px 이상, 행간 1.5 이상)과 XAG(18px 몸통)에 못 미침.
- 6.4.2 제목 제공: 시작 화면에 `h2` "이어서 하기"·"새로 시작할 지도"가 있음 → 블록 제목 있음. 페이지 맨 위 게임 제목이 `h1`인지 확인 필요(이번에 확인 못 함).

### Inferences
**바로 시험할 수 있는 점검표 (우선순위 순)**
1. [ ] 키보드만으로: Tab → 이어서 하기 줄 → 탭(고른 탭 하나에만 멈춤) → ←/→로 한국 도시·세계 도시·가상 지도가 바뀜 → Tab → 첫 지도 카드 → [샌드박스] → 다음 카드… 순서로 갈 수 있다. Enter/Space로 고를 수 있다. (WCAG 2.1.1·2.4.3, KWCAG 6.1.1·6.1.2, APG Tabs)
2. [ ] 화면 읽기 프로그램(Windows 내레이터나 NVDA)으로 탭에서 "새로 시작할 지도, 탭 목록, 한국 도시 3개 중 1번째, 선택됨"처럼 읽힌다. (APG Tabs, KWCAG 8.2.1)
3. [ ] 지도 카드를 읽을 때 지도 이름을 한 번만 읽는다(그림 `alt=""`). (WCAG 1.1.1, KWCAG 5.1.1)
4. [ ] 모든 글자 대비 4.5:1 이상: 주황 "이어하기 · n년 n월"을 더 진한 색(예: 남색 + 노란 점, 또는 주황을 4.5:1 넘게 어둡게)으로. 보조 글자는 흰 판 위에만. (WCAG 1.4.3, KWCAG 5.4.3)
5. [ ] 카드 설명 한 줄 글은 15px 이상, 행간 1.5 이상. 13px는 지도 종류·숫자 같은 짧은 꼬리표만. (KRDS 캡션 13px/본문 17px, XAG 101, 국내 가독성 연구)
6. [ ] 브라우저 확대 200%(Ctrl +)에서 카드 글자가 잘리지 않고 가로 스크롤이 생기지 않는다. (WCAG 1.4.4·1.4.10, XAG 101)
7. [ ] 모든 버튼이 24×24px 이상(가능하면 [샌드박스]·탭·이어하기 버튼은 44px 높이). (WCAG 2.5.8, Apple 44pt, KWCAG 6.1.3)
8. [ ] [샌드박스]가 무엇인지 마우스를 올리지 않아도 글로 보인다. (title 의존 제거)
9. [ ] 움직임 줄이기를 켜면 시작 화면에 움직이는 것이 없다. 번쩍임은 초당 3회 미만. (WCAG 2.3.1·2.3.3, KWCAG 6.3.1)
10. [ ] 시작 화면에서 소리가 저절로 나지 않는다(배경 음악은 게임을 고른 뒤). (KWCAG 5.4.2)
11. [ ] 색을 흑백으로 바꿔 봐도(브라우저 개발자 도구의 색각이상 흉내) 고른 탭·하던 게임 표시가 구별된다. (WCAG 1.4.1, KWCAG 5.4.1)
12. [ ] 카드·탭·이어하기 줄끼리 테두리나 간격으로 확실히 갈라져 보인다. (KWCAG 5.4.4)
13. [ ] 휴대폰 너비(375px)에서 버튼이 겹치지 않고, 데스크톱 전용이라는 안내가 보인다(선택). (GAG Basic)

### Gaps
- 버튼 실제 높이는 브라우저에서 재지 않았다(추정치). 브라우저 개발자 도구로 `.start-sandbox`, `.start-tab`, `.start-continue-item` 높이를 재야 한다.
- 시작 화면 맨 위 게임 제목이 `h1`인지, 탭 숫자 배지(`start-tab-count`)의 색 대비는 확인하지 못했다.
- 실제 화면 읽기 프로그램(NVDA·내레이터·센스리더)으로 들어보지 않았다. 국내 시각장애인이 많이 쓰는 센스리더에서 ARIA 탭이 어떻게 읽히는지는 조사하지 못했다.
