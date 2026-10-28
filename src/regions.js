// 시작 화면에서 고르는 지도 목록과 지도마다 다른 밸런스 숫자.
// 나머지 숫자 설정은 config.js에 있다. 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.
// 도시를 하나 더하려면 아래 목록에 한 덩어리를 복사해 넣고 이름·위치·범위·인구 배율을 바꾼다.

// 시작 화면에서 고르는 지도들. 역·선로·노선·열차·돈 계산은 어느 지도든 똑같다
// name: 왼쪽 위 배지와 시작 화면 카드에 보일 지역 이름, description: 시작 화면 카드의 한 줄 설명 (두 줄 안쪽으로 짧게),
// country: 나라 ('kr' 한국, 'jp' 일본, 'us' 미국, 'uk' 영국, 'fr' 프랑스). 요금 방식과 출구 이름 방식이 나라마다 다르다
//          (config.js의 FARES, EXIT_NAMING). virtual: 가상 지도인지 (시작 화면에서 따로 묶는다),
// center: 처음 화면 가운데 [경도, 위도], zoom: 처음 확대 정도 (클수록 가까이, 14 ≈ 동네 몇 개)
// bounds: 실제 지도에서 움직일 수 있는 범위 [서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도] (도시 경계쯤. 가상 지도는 자료 범위로 정해진다)
// 실제 도시의 populationScale은 역 자리 일곱 곳쯤의 주변 인구(1배로 잰 값)를 재서, 평균이 서울(약 2.3만 명)과 비슷해지게 맞췄다 (2026-10-27).
// 지도(OpenStreetMap)에 건물이 얼마나 그려져 있는지가 도시마다 달라서다.
// 2026-10-28 밸런스 점검: 도시 한가운데에 같은 노선망(십자 노선 2개, 역 13개, 열차 6대)을 짓고 본전까지 걸리는 달을 비교해서
// 서울(32개월)과 크게 다른 도시만 고쳤다 (부산·인천 110개월 넘게 → 약 55개월, 파리 17 → 약 26, 대전 24 → 약 37).
// 고친 뒤 다시 잰 값: 서울 32, 부산 53, 인천 51, 대전 37, 파리 28개월 (부산·인천은 가운데 근처에 산·바다·빈 땅이 많아 일부러 조금 어렵게 둔다)
// 승객은 인구의 제곱쯤으로 늘어서, 배율을 1.25배 하면 승객이 약 1.5배가 된다
// 지도마다 다른 돈 계산 (밸런스):
//   startMoney: 시작 자금 (억)
//   populationScale: 건물 면적으로 잰 인구에 곱하는 배율 (1 = config.js의 PEOPLE_PER_BUILT_M2 그대로)
//   trackCostScale: 선로·교량·터널 공사비와 선로 운영비에 곱하는 배율 (지방은 땅값이 싸서 1보다 작다)
//   soundStyle: 효과음 음색 (ui/sounds.js). 'gugak' 대금 같은 국악 관악기풍, 'marimba' 마림바풍,
//               'bell' 벨·마림바 섞음 (지도별 음색을 넣기 전 소리)
// 저장이 하나도 없는 사람(처음 온 사람)에게 시작 화면 맨 위에서 "바로 시작"으로 권할 지도
// (밸런스 기준 지도라 가장 무난하고, 한국어 사용자에게 가장 익숙하다. reports/레일맵 시작 화면 개선 조사.md)
export const RECOMMENDED_REGION = 'seoul';

export const REGIONS = {
  seoul: {
    name: '서울',
    country: 'kr',
    description: '한강을 건너는 수도, 도심에서 분당까지',
    center: [126.9895, 37.5615],
    zoom: 14,
    // 서울 시 경계쯤. 남쪽은 분당(정자·오리)까지 들어오게 조금 더 내렸다
    bounds: [126.76, 37.38, 127.19, 37.72],
    startMoney: 600,
    populationScale: 1,
    trackCostScale: 1,
    soundStyle: 'gugak',
    riderGoalScale: 1,
  },
  busan: {
    name: '부산',
    country: 'kr',
    description: '바다와 산 사이로 길게 뻗은 항구 도시',
    // 부산역과 서면 사이
    center: [129.05, 35.14],
    zoom: 14,
    bounds: [128.76, 35.0, 129.31, 35.39],
    startMoney: 600,
    // 지도에 그려진 건물이 서울보다 성겨서(사상·덕천 같은 아파트 동네도 건물이 적게 그려져 있다) 1배로 재면
    // 역 주변 인구가 서울의 절반쯤 나온다 (서울 종로3가 2.5만·홍대입구 3.3만, 부산 연산 1.3만·사상 0.5만).
    // 1.8배면 보통 역이 서울과 비슷하고, 서면은 약 9만 명으로 부산의 큰 중심이 된다.
    // 다만 가운데 근처에 산과 바다가 많아 노선망을 지어 보면 서울보다 훨씬 어려워서(본전 116개월) 2.25배로 올렸다
    populationScale: 2.25,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  incheon: {
    name: '인천',
    country: 'kr',
    description: '바다를 낀 항구 도시, 부평·주안에서 송도까지',
    // 부평·주안·인천시청 사이
    center: [126.7, 37.47],
    zoom: 14,
    bounds: [126.42, 37.36, 126.8, 37.62],
    startMoney: 600,
    // 1배면 평균 1.2만 명으로 서울의 절반: 주안 2.1만, 부평 2.0만, 인천시청 1.1만, 송도 0.9만.
    // 2배로는 노선망이 서울보다 훨씬 어려워서(본전 110개월) 2.5배로 올렸다
    populationScale: 2.5,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  daegu: {
    name: '대구',
    country: 'kr',
    description: '산으로 둘러싸인 분지, 반월당이 한가운데',
    // 반월당과 중앙로 사이
    center: [128.6, 35.868],
    zoom: 14,
    bounds: [128.42, 35.76, 128.78, 36.0],
    startMoney: 600,
    // 1배면 평균 1.6만 명: 반월당 2.8만, 동대구 2.6만, 범어 1.3만, 상인 1.0만
    populationScale: 1.4,
    trackCostScale: 1,
    soundStyle: 'gugak',
    riderGoalScale: 1,
  },
  daejeon: {
    name: '대전',
    country: 'kr',
    description: '대전역 옛 도심과 둔산 새 도심이 떨어진 도시',
    // 둔산 새 도심 (시청·정부청사). 옛 도심(대전역)은 동쪽으로 4km쯤
    center: [127.385, 36.355],
    zoom: 14,
    bounds: [127.26, 36.21, 127.56, 36.49],
    startMoney: 600,
    // 지도에 건물이 성겨서 1배면 평균 0.9만 명: 정부청사 1.4만, 시청 1.4만, 대전역 0.6만, 중앙로 0.5만.
    // 2.5배로는 노선망이 서울보다 쉬워서(본전 24개월) 2.1배로 내렸다
    populationScale: 2.1,
    trackCostScale: 1,
    soundStyle: 'marimba',
    riderGoalScale: 1,
  },
  gwangju: {
    name: '광주',
    country: 'kr',
    description: '금남로 옛 도심과 상무지구가 있는 도시',
    // 금남로 옛 도심. 상무지구는 서쪽으로 6km쯤
    center: [126.912, 35.149],
    zoom: 14,
    bounds: [126.66, 35.06, 127.02, 35.26],
    startMoney: 600,
    // 1배면 평균 1.4만 명: 상무 2.4만, 금남로4가 2.3만, 운천 1.5만, 양동시장 0.4만
    populationScale: 1.6,
    trackCostScale: 1,
    soundStyle: 'gugak',
    riderGoalScale: 1,
  },
  tokyo: {
    name: '도쿄',
    country: 'jp',
    description: '세계에서 철도가 가장 붐비는 도시, 23구',
    // 도쿄역. 신주쿠는 서쪽으로 6km쯤
    center: [139.767, 35.681],
    zoom: 14,
    bounds: [139.56, 35.52, 139.92, 35.82],
    startMoney: 600,
    // 지도에 건물이 아주 촘촘해서 1배면 평균 4.0만 명: 이케부쿠로 4.7만, 도쿄역 4.6만, 신주쿠 4.5만, 우에노 2.9만
    populationScale: 0.6,
    trackCostScale: 1,
    soundStyle: 'marimba',
    riderGoalScale: 1,
  },
  newyork: {
    name: '뉴욕',
    country: 'us',
    description: '맨해튼과 다리 건너 브루클린·퀸스',
    // 맨해튼 미드타운 (타임스스퀘어 근처)
    center: [-73.985, 40.754],
    zoom: 14,
    bounds: [-74.26, 40.49, -73.7, 40.92],
    startMoney: 600,
    // 큰 건물이 많아 1배면 평균 5.5만 명: 그랜드센트럴 9.0만, 타임스스퀘어 7.4만, 브루클린 애틀랜틱 3.8만, 퀸스 잭슨하이츠 3.2만
    populationScale: 0.4,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  london: {
    name: '런던',
    country: 'uk',
    description: '템스강을 따라 펼쳐진 첫 지하철의 도시',
    // 채링크로스 (트래펄가 광장 근처)
    center: [-0.125, 51.508],
    zoom: 14,
    bounds: [-0.51, 51.28, 0.33, 51.7],
    startMoney: 600,
    // 1배면 평균 4.5만 명: 뱅크 7.4만, 옥스퍼드서커스 5.7만, 킹스크로스 4.1만, 브릭스턴 2.5만
    populationScale: 0.5,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  paris: {
    name: '파리',
    country: 'fr',
    description: '센강과 순환도로 안쪽에 빽빽한 도시',
    // 샤틀레 (시내 한가운데)
    center: [2.347, 48.859],
    zoom: 14,
    bounds: [2.15, 48.75, 2.55, 48.96],
    startMoney: 600,
    // 1배면 평균 4.7만 명: 라데팡스 6.2만, 몽파르나스 5.1만, 샤틀레 4.4만, 이탈리광장 3.5만.
    // 시내 전체가 빽빽해서 0.5배로는 노선망이 너무 쉬워서(본전 17개월) 0.43배로 내렸다
    populationScale: 0.43,
    trackCostScale: 1,
    soundStyle: 'marimba',
    riderGoalScale: 1,
  },
  sollae: {
    name: '솔내 지방',
    country: 'kr',
    virtual: true,
    description: '마을 넷과 금빛강, 봉우리산이 있는 가상의 지방',
    center: [131.0, 37.56],
    zoom: 12,
    startMoney: 600,
    // 지방 소도시는 건물이 낮고 넓게 퍼져 있어서 건물 면적만으로 재면 인구가 적게 나온다.
    // 3배면 솔내 약 5만, 가람 3만, 새터 4만, 한골 5만 명이 된다
    populationScale: 3,
    // 땅값이 싸서 선로 공사비와 선로 운영비가 서울의 절반이다.
    // 이 두 값으로 솔내–가람 첫 노선(열차 1대)이 서울 첫 노선처럼 200개월쯤에 본전이 된다
    trackCostScale: 0.5,
    soundStyle: 'marimba',
    // 지방이라 승객이 서울보다 적어서, 하루 승객 목표를 이만큼 줄인다 (config.js의 GOALS).
    // 0.4면 8천 → 2만 → 4만 → 12만 명. 솔내–가람 첫 노선(열차 1대)이 약 7,800명, 네 마을 한 줄이 약 3.6만 명
    riderGoalScale: 0.4,
  },
};
