// 시작 화면에서 고르는 지도 목록과 지도마다 다른 밸런스 숫자.
// 나머지 숫자 설정은 config.js에 있다. 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.
// 도시를 하나 더하려면 아래 목록에 한 덩어리를 복사해 넣고 이름·위치·범위·인구 배율을 바꾼다.

// 시작 화면에서 고르는 지도들. 역·선로·노선·열차·돈 계산은 어느 지도든 똑같다
// name: 왼쪽 위 배지에 보일 지역 이름, title·description: 시작 화면 글,
// center: 처음 화면 가운데 [경도, 위도], zoom: 처음 확대 정도 (클수록 가까이, 14 ≈ 동네 몇 개)
// bounds: 실제 지도에서 움직일 수 있는 범위 [서쪽 경도, 남쪽 위도, 동쪽 경도, 북쪽 위도] (도시 경계쯤. 가상 지도는 자료 범위로 정해진다)
// 실제 도시의 populationScale은 역 자리 일곱 곳쯤의 주변 인구를 재서, 평균이 서울(약 2.3만 명)과 비슷해지게 맞췄다 (2026-10-27).
// 지도(OpenStreetMap)에 건물이 얼마나 그려져 있는지가 도시마다 달라서다
// 지도마다 다른 돈 계산 (밸런스):
//   startMoney: 시작 자금 (억)
//   populationScale: 건물 면적으로 잰 인구에 곱하는 배율 (1 = config.js의 PEOPLE_PER_BUILT_M2 그대로)
//   trackCostScale: 선로·교량·터널 공사비와 선로 운영비에 곱하는 배율 (지방은 땅값이 싸서 1보다 작다)
//   soundStyle: 효과음 음색 (ui/sounds.js). 'gugak' 대금 같은 국악 관악기풍, 'marimba' 마림바풍,
//               'bell' 벨·마림바 섞음 (지도별 음색을 넣기 전 소리)
export const REGIONS = {
  seoul: {
    name: '서울',
    title: '실제 지도 · 서울',
    description: 'OpenStreetMap의 실제 서울 위에 노선을 깔아요',
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
    title: '실제 지도 · 부산',
    description: '바다와 산 사이로 길게 뻗은 실제 부산 위에 노선을 깔아요',
    // 부산역과 서면 사이
    center: [129.05, 35.14],
    zoom: 14,
    bounds: [128.76, 35.0, 129.31, 35.39],
    startMoney: 600,
    // 지도에 그려진 건물이 서울보다 성겨서(사상·덕천 같은 아파트 동네도 건물이 적게 그려져 있다) 1배로 재면
    // 역 주변 인구가 서울의 절반쯤 나온다 (서울 종로3가 2.5만·홍대입구 3.3만, 부산 연산 1.3만·사상 0.5만).
    // 1.8배면 보통 역이 서울과 비슷하고, 서면은 약 9만 명으로 부산의 큰 중심이 된다
    populationScale: 1.8,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  incheon: {
    name: '인천',
    title: '실제 지도 · 인천',
    description: '바다를 낀 항구 도시, 부평·주안에서 송도까지 실제 인천 위에 노선을 깔아요',
    // 부평·주안·인천시청 사이
    center: [126.7, 37.47],
    zoom: 14,
    bounds: [126.42, 37.36, 126.8, 37.62],
    startMoney: 600,
    // 역 주변 인구(1배)가 서울보다 조금 적다: 부평 3.7만, 주안 3.7만, 인천시청 2.0만, 송도 1.7만
    populationScale: 1.1,
    trackCostScale: 1,
    soundStyle: 'bell',
    riderGoalScale: 1,
  },
  daegu: {
    name: '대구',
    title: '실제 지도 · 대구',
    description: '산으로 둘러싸인 분지, 반월당을 가운데 둔 실제 대구 위에 노선을 깔아요',
    // 반월당과 중앙로 사이
    center: [128.6, 35.868],
    zoom: 14,
    bounds: [128.42, 35.76, 128.78, 36.0],
    startMoney: 600,
    // 지도에 건물이 촘촘해서 1배면 서울보다 많다: 반월당 5.0만, 동대구 4.7만, 범어 2.4만, 상인 1.8만
    populationScale: 0.8,
    trackCostScale: 1,
    soundStyle: 'gugak',
    riderGoalScale: 1,
  },
  daejeon: {
    name: '대전',
    title: '실제 지도 · 대전',
    description: '대전역 옛 도심과 둔산 새 도심이 떨어져 있는 실제 대전 위에 노선을 깔아요',
    // 둔산 새 도심 (시청·정부청사). 옛 도심(대전역)은 동쪽으로 4km쯤
    center: [127.385, 36.355],
    zoom: 14,
    bounds: [127.26, 36.21, 127.56, 36.49],
    startMoney: 600,
    // 지도에 건물이 성겨서 1배면 서울의 70%쯤: 정부청사 2.5만, 시청 2.4만, 대전역 1.0만, 중앙로 0.9만
    populationScale: 1.4,
    trackCostScale: 1,
    soundStyle: 'marimba',
    riderGoalScale: 1,
  },
  gwangju: {
    name: '광주',
    title: '실제 지도 · 광주',
    description: '금남로 옛 도심과 상무지구가 있는 실제 광주 위에 노선을 깔아요',
    // 금남로 옛 도심. 상무지구는 서쪽으로 6km쯤
    center: [126.912, 35.149],
    zoom: 14,
    bounds: [126.66, 35.06, 127.02, 35.26],
    startMoney: 600,
    // 1배면 서울보다 조금 많다: 상무 4.3만, 금남로4가 4.2만, 운천 2.6만, 양동시장 0.8만
    populationScale: 0.9,
    trackCostScale: 1,
    soundStyle: 'gugak',
    riderGoalScale: 1,
  },
  sollae: {
    name: '솔내 지방',
    title: '가상 지도 · 솔내 지방',
    description: '마을 넷과 금빛강, 봉우리산이 있는 가상의 지방이에요',
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
