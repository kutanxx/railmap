// 화면에 그리는 모양 숫자: 지도 주소·시작 날짜, 역(승강장) 모양, 역 출구, 노선 색, 통계 그래프, 노선도, 알림.
// (src/config.js가 이 파일을 그대로 내보낸다)

// ── 지도 (지역) ─────────────────────────
// 시작 화면에서 고르는 지도 목록(서울, 부산, 솔내 지방 …)과 지도별 밸런스는 regions.js에 있다

// 실제 지도의 기본 지도 데이터 주소 (OpenFreeMap positron, 가입·키 없음)
export const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// 게임 시작 날짜
export const START_YEAR = 2026;
export const START_MONTH = 3;

// ── 역(승강장) 모양 ─────────────────────
// 가까이 확대하면 역은 "승강장 띠 + 대합실"로 그려진다. 띠는 놓은 선로 모양을 따라 휜다
// 승강장 띠의 실제 크기 (미터). 5~8호선 8량 승강장이 약 160m (2호선 10량은 약 200m)
export const PLATFORM_LENGTH_M = 150;
export const PLATFORM_WIDTH_M = 12;
// 대합실(표를 찍고 지나가는 넓은 곳)의 기본 크기 (미터). 띠 위에 더 넓게 붙는다
export const CONCOURSE_LENGTH_M = 35;
export const CONCOURSE_WIDTH_M = 22;
// 역마다 대합실 크기를 얼마나 다르게 할지 (0이면 모두 같고, 0.25면 ±25%까지)
export const STATION_SHAPE_VARIETY = 0.25;
// 환승역에서 선로가 만나는 곳에 놓는 큰 대합실의 크기 (미터, 가로·세로)
export const TRANSFER_HALL_M = 34;
// 같은 선로를 두 노선이 함께 쓰면 띠를 나란히 놓는다. 띠 사이 틈 (미터)
export const PARALLEL_PLATFORM_GAP_M = 3;
// 이 줌부터는 역을 실제 크기(승강장 띠 + 대합실)로 그리고, 더 멀리서는 노선도처럼 동그라미로 보여준다
// (멀리서 네모난 승강장이 지도에서 툭 튀어나와 보이지 않게. 15 = 출구 점이 보이기 시작하는 줌과 같다)
export const PLATFORM_REAL_SIZE_ZOOM = 15;
// 멀리서 보이는 환승역 (map/stationIcons.js): 노선 색 원을 이어 붙인 캡슐 (서울 2023 "신호등 방식"·홍콩 MTR처럼)
// 이 줌부터 PLATFORM_REAL_SIZE_ZOOM 전까지 캡슐, 더 멀리서는 이웃 역과 겹치지 않게 흰 원 + 굵은 남색 테두리
export const STATION_CAPSULE_MIN_ZOOM = 11;
// 캡슐 크기 (줌 15 바로 아래 기준 px): 노선 색 원 지름, 원 사이·둘레 흰 띠, 남색 테두리, 고른 역의 노란 테두리
// 더 멀리서는 줄인다 (줌 13에서 0.75배, 줌 11에서 0.55배)
export const STATION_CAPSULE = { circle: 14, band: 1.5, outline: 2, ring: 3 };

// ── 역 출구 ────────────────────────────
// 대합실 양옆으로 통로를 뻗어, 건물이 없는 가장 가까운 길가(보도)에 출구를 놓는다
// 통로를 이만큼(미터)까지 뻗어도 길가가 없으면, 건물 밑이면 "건물 연결" 출구, 빈 땅이면 그냥 출구로 한다
export const EXIT_SEARCH_M = 120;
// 길가가 없을 때 대합실에서 출구까지 거리 (미터)
export const BUILDING_EXIT_M = 40;
// 도로 가장자리에서 이만큼(미터) 안쪽까지를 보도로 본다
export const SIDEWALK_M = 8;
// 도로 종류별 반쪽 폭 (미터). 지도 데이터에는 도로 폭이 없어서 종류로 어림한다. 여기 없는 종류(골목길·철도 등)는 무시
export const ROAD_HALF_WIDTH_M = {
  motorway: 15, // 고속도로·도시고속도로
  trunk: 14, // 큰 간선도로
  primary: 12, // 주요 도로 (예: 을지로, 퇴계로)
  secondary: 10,
  tertiary: 8,
  minor: 5, // 동네 길
  service: 3, // 건물 진입로
};
// 대합실에서 이만큼(미터) 안에 큰 길끼리 만나는 사거리가 있으면, 그 대합실 출구는 사거리 네 모퉁이에 낸다
export const CORNER_EXIT_REACH_M = 60;
// 사거리로 치는 큰 길 종류 (ROAD_HALF_WIDTH_M의 이름)
export const CORNER_ROAD_CLASSES = ['trunk', 'primary', 'secondary', 'tertiary'];
// 역 하나의 출구 수 상한 (큰 환승역은 노선마다 출구가 늘어서 넉넉하게), 이보다 가까운 출구는 하나로 합친다 (미터)
export const MAX_EXITS_PER_STATION = 12;
export const EXIT_MIN_GAP_M = 25;
// 통로 폭 (미터)
export const PASSAGE_WIDTH_M = 4;
// 이 줌부터 출구가 작은 노란 점으로, EXIT_LABEL_ZOOM부터 통로와 번호 배지로 보인다
export const EXIT_DOT_ZOOM = 15;
export const EXIT_LABEL_ZOOM = 16;
// 나라마다 출구 이름 붙이는 방식 (ui/exitNames.js, 근거: docs/station-exit-research.md). 지도의 나라는 regions.js의 country
// 'seoul' 숫자 (상행 오른쪽 앞이 1번, 시계 방향), 'tokyo' 글자+숫자 (노선 묶음마다 A, B … 안에서 1, 2 …),
// 'street' 거리 이름 (런던 "Way out"처럼 출구가 나가는 길 이름), 'none' 이름 없음 (뉴욕처럼 노란 점만)
export const EXIT_NAMING = { kr: 'seoul', jp: 'tokyo', us: 'none', uk: 'street', fr: 'seoul' };
// 거리 이름 출구: 출구에서 이 거리(미터) 안의 가장 가까운 이름 있는 길을 쓴다. 없으면 이름 없이 노란 점만
export const STREET_NAME_REACH_M = 40;
// 역 이름 말풍선은 줌에 따라 줄인다 (멀리서 보면 지도가 말풍선으로 덮이지 않게)
// - LABEL_NAME_ZOOM보다 멀리: 환승역·종착역만 말풍선, 나머지 역은 지도의 동그라미만
// - LABEL_NAME_ZOOM ~ LABEL_DETAIL_ZOOM: 모든 역의 이름과 노선 번호 (하루 이용객 숫자는 숨김)
// - LABEL_DETAIL_ZOOM부터: 전부 (이용객 숫자까지)
// 고른 역은 줌과 상관없이 전부 보인다. 서울은 줌 14, 솔내 지방은 줌 12로 시작한다
export const LABEL_NAME_ZOOM = 13.5;
export const LABEL_DETAIL_ZOOM = 15;


// ── 노선 색 ────────────────────────────
// 새 노선은 그 도시의 실제 노선 색을 1호선부터 차례로 받는다 (src/lineColors.js, game/routeColors.js).
// 실제 노선보다 더 만들거나 가상 지도면 아래 추천 10색으로 이어 간다 (도시 색과 거의 같은 색은 건너뛴다).
// 추천 10색: 서울 지하철 1~9호선 느낌의 순서(남색·초록·주황·하늘·보라·갈색·올리브·분홍·금색) + 청록.
// 색약(빨강·초록을 잘 구별하지 못함)인 눈에서 비슷해 보이는 색끼리는 밝기를 다르게 해서 덜 겹치게 맞췄다
// (2026-10-28, 지금까지의 6색은 적색약이면 파랑·보라가 거의 같아 보였다). 노선 번호 배지가 있어서 색이 비슷해도 구별된다
export const ROUTE_COLORS = [
  { name: '남색', color: '#005998' },
  { name: '초록', color: '#3C8048' },
  { name: '주황', color: '#D9803C' },
  { name: '하늘', color: '#4BA6C6' },
  { name: '보라', color: '#917AC2' },
  { name: '갈색', color: '#7D4F24' },
  { name: '올리브', color: '#6F711E' },
  { name: '분홍', color: '#C2597E' },
  { name: '금색', color: '#CFAD53' },
  { name: '청록', color: '#128583' },
];
// 추천 색 가운데 도시 노선 색과 이만큼(색 차이 ΔE)보다 가까운 색은 건너뛴다 (같은 지도에 거의 같은 색이 두 번 나오지 않게)
export const SAME_ROUTE_COLOR_DISTANCE = 15;

// ── 통계 그래프 (위쪽 [통계]) ──────────────
// 매달 정산 기록을 이만큼(달)까지 기억한다 (저장 파일에도 들어간다. 오래된 달부터 지운다)
export const STATS_KEEP_MONTHS = 240;
// 그래프에 보여주는 최근 달 수
export const STATS_SHOWN_MONTHS = 36;

// ── 노선도 보기 ([노선도], D 키) ────────────
// 역 자리를 가로·세로·45도 선에 맞게 고치는 계산을 몇 번 되풀이할지 (많을수록 반듯하지만 열 때 느리다. 역 50개에 300번이면 0.1초쯤)
export const DIAGRAM_ITERATIONS = 300;

// ── 알림 ──────────────────────────────
// 말풍선 알림이 떠 있는 시간 (실제 초). 단계마다 다르다 (ui/callouts.js)
// 정보(개통 등)와 안 되는 이유: CALLOUT_SECONDS, 주의(노선 혼잡): CALLOUT_WARN_SECONDS,
// 위험(빚 한도를 넘음, 파산까지 남은 달): 누를 때까지 남는다
export const CALLOUT_SECONDS = 4;
export const CALLOUT_WARN_SECONDS = 8;
// 지난 알림을 몇 개까지 기억할지 (위쪽 [알림] 목록)
export const NOTICE_LOG_SIZE = 20;
