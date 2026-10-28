// 게임의 모든 숫자 설정을 모아두는 곳.
// 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.

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

// ── 시간과 열차 ─────────────────────────
// 1배일 때 실제 1초가 게임 몇 초인지. 30이면 실제 1초 = 게임 30초
export const TIME_SCALE = 30;

// 배속 버튼에 나오는 값. 0은 멈춤
export const SPEED_OPTIONS = [0, 1, 3];

// 열차 최고 속도 (km/h, 게임 시간 기준)
export const TRAIN_SPEED_KMH = 60;
// 출발할 때 빨라지고 역에 설 때 느려지는 정도 (m/s², 실제 지하철은 0.8~1.0쯤)
export const TRAIN_ACCELERATION = 0.9;
// 선로가 꺾이는 곳의 제한 속도: GENTLE_CURVE_ANGLE도까지는 그대로 달리고,
// SHARP_CURVE_ANGLE도 이상 꺾이면 SHARP_CURVE_SPEED_KMH까지 줄인다 (그 사이는 비례로)
export const GENTLE_CURVE_ANGLE = 15;
export const SHARP_CURVE_ANGLE = 90;
export const SHARP_CURVE_SPEED_KMH = 30;
// 꺾이는 곳 앞뒤로 이만큼(미터)은 제한 속도로 달린다
export const CURVE_ZONE_M = 60;
// 꺾인 정도는 이 길이(미터) 안에서 꺾인 각도를 모두 더해서 잰다. 곡선 선로는 조금씩 여러 번 휘므로,
// 좁게 휘는 곡선일수록 이 길이 안에서 많이 꺾여 느려진다 (반경 230m쯤부터 느려지기 시작, 60m면 거의 직각처럼)
export const CURVE_WINDOW_M = 60;
// 곡선 선로를 이 간격(미터)마다 점으로 나눠 그린다 (작을수록 매끄럽지만 계산이 늘어난다, game/trackShape.js)
export const CURVE_SAMPLE_M = 15;
// 곡선의 팽팽함 (0 ~ 1). 곡선은 경유점을 꼭 지나야 해서 경유점 바깥으로 조금 부풀어 나간다.
// 0이면 가장 둥글게 출렁이고, 클수록 꺾인 직선에 가까워진다 (1이면 직선과 같다).
// 0.4면 바깥으로 부풀어 나가는 거리가 0일 때의 60%쯤이다 (직각으로 꺾는 1km 선로에서 75m → 45m)
export const CURVE_TENSION = 0.4;

// 역에 멈춰 있는 시간 (게임 시간 초)
export const STATION_DWELL_SECONDS = 30;

// 노선 하나에 처음 넣는 열차 수와 최대 열차 수
export const DEFAULT_TRAINS_PER_ROUTE = 1;
export const MAX_TRAINS_PER_ROUTE = 10;

// 열차 한 편에 탈 수 있는 사람 수 (서울 지하철 10량 정원 약 1,600명보다 조금 작게)
export const TRAIN_CAPACITY = 1000;
// 하루 승객 중 가장 붐비는 한 시간(출퇴근)에 타는 비율. 혼잡도는 이 시간을 기준으로 잰다
export const PEAK_HOUR_SHARE = 0.12;
// 열차 한 대 사는 값 (억 원). 노선을 만들 때 기본 열차 값도 낸다. 줄여도 돌려받지 않는다
export const TRAIN_COST = 5;
// 혼잡도가 이 비율을 넘으면 노선 패널에 주황색으로 경고한다 (1 = 100%)
export const CROWDED_WARNING = 0.8;

// 열차 길이 (미터). 지도 위 캡슐 길이가 된다
export const TRAIN_LENGTH_M = 120;
// 멀리서 볼 때도 열차가 점처럼 작아지지 않게, 화면에서 적어도 이만큼(px) 길게 그린다
export const TRAIN_MIN_SCREEN_PX = 24;
// 이 줌부터 열차 위에 번호표("3-1" = 3호선 1번 열차)를 붙인다 (실제 관제실의 열차 번호처럼).
// 멀리서는 열차가 많아 글자로 덮이므로 가까이 볼 때만. 열차 글자는 매 프레임 자리를 다시 잡아서, 줌을 낮추면 느려질 수 있다
export const TRAIN_LABEL_MIN_ZOOM = 15.5;

// ── 돈 (단위: 억 원) ────────────────────
// 시작 자금은 지도마다 다르다: regions.js의 startMoney (서울 600억 = 역 3개짜리 첫 노선 약 320억 + 여유)

// 선로 공사비 = (땅 위 km × TRACK_COST_PER_KM + 교량 km × BRIDGE_COST_PER_KM + 터널 km × TUNNEL_COST_PER_KM)
//              × 지도의 trackCostScale. 교량·터널은 game/trackProfile.js가 판정한다
// 서울 실제(km당 약 1,200억)보다 20배쯤 싸게 잡았다. 서울에서 역 6개짜리 첫 노선이 열차 2대로 약 8년(93개월)에 본전
export const TRACK_COST_PER_KM = 60;
// 물(한강·호수 등) 위나 높은 고가 구간은 교량이라 km당 이만큼 든다 (보통 선로의 2.5배)
export const BRIDGE_COST_PER_KM = 150;
// 터널 구간은 km당 이만큼 든다 (가상 지도처럼 땅 높이가 있을 때만 생긴다)
export const TUNNEL_COST_PER_KM = 230;
// 새 역 하나 공사비
export const STATION_COST = 40;
// 역을 끌어서 옮길 때 내는 이전 비용 = 역 값 × 이 비율 (+ 늘어난 선로 길이만큼의 공사비)
export const STATION_MOVE_COST_RATIO = 0.25;

// 매달 운영비 = 역 개수 × OPEX_PER_STATION + 선로 km × OPEX_PER_TRACK_KM × 지도의 trackCostScale
//              + 열차 대수 × OPEX_PER_TRAIN
// 한적한 곳에 지은 노선은 이 운영비 때문에 적자가 난다
export const OPEX_PER_STATION = 0.4;
export const OPEX_PER_TRACK_KM = 0.2;
export const OPEX_PER_TRAIN = 1.0;

// ── 빚과 파산 ───────────────────────────
// 자금이 마이너스면 매달 빚의 이만큼을 이자로 낸다 (0.01 = 1%)
export const DEBT_INTEREST_PER_MONTH = 0.01;
// 자금이 이보다 낮아지면 (예: −200억) 파산 경고가 시작된다
export const DEBT_LIMIT = -200;
// 한도 아래로 이만큼 달이 이어지면 파산해서 게임이 끝난다
export const BANKRUPT_GRACE_MONTHS = 6;

// ── 지형 (땅 높이가 있는 가상 지도만) ───────
// 선로를 이만큼(미터)마다 짚어 땅 높이를 잰다
export const PROFILE_STEP_M = 25;
// 선로 높이를 정할 때 땅 높이를 앞뒤 이만큼(미터) 범위로 고르게 편다 (클수록 선로가 평평해진다)
export const PROFILE_SMOOTH_M = 900;
// 선로가 오르내릴 수 있는 가장 가파른 경사 (0.03 = 100m 가서 3m 오르내림)
export const MAX_GRADE = 0.03;
// 땅이 선로보다 이만큼(미터) 넘게 높으면 터널, 선로가 땅보다 이만큼 넘게 높으면 고가(교량)
export const TUNNEL_DEPTH_M = 14;
export const VIADUCT_HEIGHT_M = 10;
// 이보다 짧은 터널은 땅을 깎아 지나가는 것으로 친다 (미터)
export const MIN_TUNNEL_M = 100;
// 열차는 경사가 이만큼을 넘으면 느려지기 시작해서, 가장 가파른 경사(MAX_GRADE)에서는 최고 속도의 이 비율로 달린다
export const GRADE_SLOW_START = 0.015;
export const SPEED_RATIO_AT_MAX_GRADE = 0.75;

// ── 날짜 ───────────────────────────────
// 1배속에서 한 달이 실제 몇 초인지
export const SECONDS_PER_MONTH = 20;

// ── 통계 그래프 (위쪽 [통계]) ──────────────
// 매달 정산 기록을 이만큼(달)까지 기억한다 (저장 파일에도 들어간다. 오래된 달부터 지운다)
export const STATS_KEEP_MONTHS = 240;
// 그래프에 보여주는 최근 달 수
export const STATS_SHOWN_MONTHS = 36;

// ── 노선도 보기 ([노선도], D 키) ────────────
// 역 자리를 가로·세로·45도 선에 맞게 고치는 계산을 몇 번 되풀이할지 (많을수록 반듯하지만 열 때 느리다. 역 50개에 300번이면 0.1초쯤)
export const DIAGRAM_ITERATIONS = 300;

// ── 승객 수요 (중력 모델) ─────────────────
// 두 역 사이 하루 승객(명, 오가는 사람 모두) =
//   RIDERS_FACTOR × (역 A 인구 ÷ 1000) × (역 B 인구 ÷ 1000) ÷ 소요 시간(분)^DEMAND_TIME_POWER
// DEMAND_TIME_POWER: 클수록 먼 역끼리는 덜 오간다 (교통 연구에서 흔히 0.5~3, 1.5가 잘 맞았다는 연구도 있다)
// 열차 가감속을 넣으면서 소요 시간이 늘어 승객이 12%쯤 줄어서, 예전 밸런스(55)에 맞게 62로 올렸다
export const RIDERS_FACTOR = 62;
export const DEMAND_TIME_POWER = 1.0;
// 소요 시간이 이보다 짧아도 이 값(분)으로 친다. 아주 가까운 두 역의 수요가 터무니없이 커지지 않게
export const MIN_TRIP_MINUTES = 3;
// 갈아탈 때 더 걸리는 시간 (분). 기다리는 시간과 별개로 걸어서 옮기는 시간
export const TRANSFER_MINUTES = 2;

// ── 역 주변 인구 ─────────────────────────
// 역을 놓을 때 이 반경(미터) 안의 건물 바닥 면적을 재어 인구를 추정한다
export const POPULATION_RADIUS_M = 500;
// 이 줌 이상으로 확대해야 역을 놓거나 옮길 수 있다. 더 멀리 보면 지도 건물 자료가 블록으로 뭉쳐 있어서
// 같은 자리라도 인구가 10%쯤 다르게 재진다 (줌 14부터는 늘 같은 자료라 같은 숫자가 나온다)
export const STATION_MIN_ZOOM = 14;
// 새 역 이름: 이 거리(미터) 안의 지도 지명을 따서 붙인다 (map/placeNames.js). 없으면 "역 n"
export const STATION_NAME_SEARCH_M = 1500;
// 역 이름으로 쓸 지명 종류 (OpenMapTiles place 층의 class, 가상 지도의 kind). 작은 동네부터 도시까지
export const STATION_NAME_KINDS = ['neighbourhood', 'quarter', 'suburb', 'hamlet', 'village', 'town', 'city'];
// 이웃 역과 인구를 나눌 때 쓰는 칸 크기(미터). 칸마다 가장 가까운 역에만 인구를 준다
// 작을수록 정확하지만 저장 파일이 커진다
export const CATCHMENT_CELL_M = 50;
// 건물 바닥 면적 1㎡당 사는(일하는) 사람 수. 명동 근처 ≈ 35만 ㎡ → 약 3.5만 명
export const PEOPLE_PER_BUILT_M2 = 0.1;
// 건물을 재지 못했을 때 쓰는 인구 (예: 너무 멀리 축소해서 건물 데이터가 없을 때)
export const DEFAULT_STATION_POPULATION = 10000;
// 아무리 한적한 곳도 이 정도 인구는 있다고 친다
export const MIN_STATION_POPULATION = 1000;

// ── 알림 ──────────────────────────────
// 말풍선 알림이 떠 있는 시간 (실제 초). 단계마다 다르다 (ui/callouts.js)
// 정보(개통 등)와 안 되는 이유: CALLOUT_SECONDS, 주의(노선 혼잡): CALLOUT_WARN_SECONDS,
// 위험(빚 한도를 넘음, 파산까지 남은 달): 누를 때까지 남는다
export const CALLOUT_SECONDS = 4;
export const CALLOUT_WARN_SECONDS = 8;
// 지난 알림을 몇 개까지 기억할지 (위쪽 [알림] 목록)
export const NOTICE_LOG_SIZE = 20;

// ── 게임 목표 (game/goals.js) ─────────────
// 위에서부터 차례로 보여주고, 이루면 말풍선과 함께 보상(억)을 준다. 샌드박스에는 목표가 없다
// kind: 'routes' 노선 수, 'stations' 역 수, 'transfers' 환승역 수, 'riders' 하루 승객 (지도의 riderGoalScale을 곱한다),
//       'net' 월 수지(억, 이 값을 넘으면. 0이면 "흑자"), 'money' 자금(억)
// 보상은 "다음 목표로 가는 한 걸음" 값에 맞췄다. 서울 기준으로 잰 값 (2026-10-27):
//   첫 노선(역 6개·열차 1대): 공사비 약 450억, 하루 승객 약 1.4만, 수지 +2억/월 → 열차를 늘리면 2만
//   노선 3개(역 30개): 승객 약 10만, 수지 +22억/월 / 역 50개·노선 8개·환승 15곳: 승객 약 28만, 수지 +76억/월
// 역 하나 40억, 선로 1km 60억, 열차 한 대 5억이니 첫 보상들은 역 한두 개, 뒤 보상들은 노선 하나쯤을 지을 수 있다
// 목표는 매달 정산 때 위에서부터 확인하고 못 이룬 첫 목표에서 멈추므로, 실제로 짓는 순서대로 놓는다.
// 2026-10-28: 노선 3개쯤에서 목표 4개(노선 3·승객 5만·역 20·승객 10만, 470억)가 한꺼번에 이뤄지고
// 그 뒤 흑자 +50억까지 한참 비어서, 사이에 환승역 3곳·흑자 +25억·노선 6개를 넣었다
export const GOALS = [
  { kind: 'routes', value: 1, reward: 30 },
  { kind: 'riders', value: 20000, reward: 40 },
  { kind: 'transfers', value: 1, reward: 80 },
  { kind: 'net', value: 10, reward: 50 },
  { kind: 'routes', value: 3, reward: 100 },
  { kind: 'riders', value: 50000, reward: 100 },
  { kind: 'stations', value: 20, reward: 120 },
  { kind: 'transfers', value: 3, reward: 120 },
  { kind: 'riders', value: 100000, reward: 150 },
  { kind: 'net', value: 25, reward: 150 },
  { kind: 'routes', value: 6, reward: 200 },
  { kind: 'net', value: 50, reward: 200 },
  { kind: 'riders', value: 300000, reward: 300 },
];

// ── 소리 (ui/sounds.js, 설계 근거 docs/sound-research.md) ──
// 효과음에 쓰는 음: C장조 5음 음계(도·레·미·솔·라). 반음으로 부딪치는 음이 없어서 소리가 겹쳐도 어울린다.
// 새 소리를 만들 때도 이 음들만 쓴다 (Hz)
export const SOUND_NOTES = {
  C5: 523.25, // 도
  D5: 587.33, // 레
  E5: 659.25, // 미
  G5: 783.99, // 솔
  A5: 880.0, // 라
};
// 소리마다 크기 (dB). −6이면 대략 절반. 자주 나는 소리일수록 작게 (악기마다 크게 들리는 정도가 달라서 귀로 맞춘 값)
export const SOUND_LEVELS = {
  open: -3, // 노선 개통 (아주 드묾, 가장 큰 소리)
  horn: -14, // 새 노선의 첫 열차가 떠날 때 경적 (노선마다 한 번). 톱니파라 같은 값이어도 크게 들려서 낮게
  track: -4, // 선로 완성
  station: -6, // 역 놓기
  arrive: -14, // 열차 도착 (계속 남)
  clack: -23, // 레일 덜컹 (아주 가까이 볼 때 열차 한 대만, 계속 남)
};
// 가장 큰 소리(노선 개통)의 크기 (0~1). 음량 막대를 끝까지 올렸을 때 기준
export const SOUND_PEAK = 0.3;
// 음량 막대 처음 값 (0~1)
export const DEFAULT_SOUND_VOLUME = 0.8;
// 매번 크기와 길이를 이만큼(±) 무작위로 바꿔서 똑같이 반복되지 않게 한다 (0.05 = ±5%)
export const SOUND_VARIATION = 0.05;
// 맨 끝 압축기: 소리가 겹쳐 갑자기 커질 때만 부드럽게 눌러 준다 (브라우저 기본값보다 약하게)
// threshold 이 크기(dB)를 넘으면 누르기 시작, ratio 넘친 만큼을 이 비율로 줄임, knee 부드럽게 시작하는 폭(dB),
// attack·release 누르기 시작·풀리는 데 걸리는 초
export const SOUND_COMPRESSOR = { threshold: -18, knee: 12, ratio: 4, attack: 0.005, release: 0.2 };
// 노선 개통·경적처럼 큰 소리가 날 때 열차 소리(도착·덜컹)와 배경 음악을 이만큼(dB) 잠깐 줄인다 (덕킹)
export const DUCK_DB = -6;
// 열차가 역에 서는 소리는 열차가 많아도 이만큼(실제 초)에 한 번만 낸다 (3배속이어도 같다)
// 그 사이에 선 열차들은 묶어서 다음 소리 때 한꺼번에 낸다
export const ARRIVAL_SOUND_GAP_SECONDS = 1.5;
// 노선마다 열차 도착 음 (SOUND_NOTES의 이름). 1호선 라, 2호선 미, 3호선 솔, 4호선 도, 5호선 레, 6호선부터 다시 라
// 소리만 들어도 어느 노선 열차가 섰는지 어렴풋이 알 수 있게
export const ARRIVAL_NOTES = ['A5', 'E5', 'G5', 'C5', 'D5'];
// 열차 도착 소리는 이 줌 이상으로 가까이 볼 때만, 화면 안 역에 선 열차만 낸다
// (15 ≈ 화면에 동네 몇 블록, 가로 2~3km). 멀리서 노선망 전체를 볼 때는 열차가 몇십 대여도 조용하다
export const ARRIVAL_SOUND_MIN_ZOOM = 15;
// 한 번에 내는 열차 음은 많아야 이만큼 (서로 다른 노선 음), 음 사이 간격 (초)
export const MAX_ARRIVAL_NOTES = 2;
export const ARRIVAL_NOTE_SPACING = 0.12;
// 울림(잔향): 넓은 역 대합실 안처럼 소리 뒤에 옅은 울림을 남긴다
// 울림이 사라지는 데 걸리는 초, 울림 크기 (dB, 원래 소리 대비. 작을수록 옅다)
export const REVERB_SECONDS = 1.8;
export const REVERB_DB = -15;
// 레일 덜컹 소리: 이 줌 이상으로 아주 가까이 볼 때, 화면 가운데에서 가장 가까운 달리는 열차 한 대만 낸다
// (16 ≈ 화면에 한두 블록). 열차 30대가 모두 내면 가장 피곤한 소리가 되므로 한 대만
export const CLACK_MIN_ZOOM = 16;
// 최고 속도로 달릴 때 "따닥" 사이 간격 (실제 초). 느리게 달리면 간격이 길어지고, 서 있으면 조용하다
export const CLACK_GAP_SECONDS = 0.8;
// 화면 가운데에서 이만큼(화면 픽셀) 넘게 떨어진 열차는 덜컹 소리를 내지 않는다. 가까울수록 크다
export const CLACK_REACH_PX = 400;
// 배경 음악: 5음 음계의 느린 화음 위에 가끔 음 몇 개가 지도 음색으로 울린다 ([음악] 버튼으로 끄고 켠다)
// 빠르기 (1분에 몇 박. 72 = 한 박 약 0.8초), 크기 (dB, 노선 개통 소리 대비. 효과음보다 훨씬 작게)
export const MUSIC_BPM = 72;
export const MUSIC_DB = -25;
// 화음 순서. 한 화음이 MUSIC_CHORD_BEATS박 동안 이어진 뒤 다음으로 넘어가고, 끝나면 처음부터 다시
// 음 이름 = SOUND_NOTES의 글자 + 옥타브 숫자 (C3은 C5보다 두 옥타브 낮은 도). 모두 5음 음계 안의 음
export const MUSIC_CHORDS = [
  ['C3', 'G3', 'E4'], // 도 화음
  ['A2', 'E3', 'C4'], // 라 화음 (조금 쓸쓸하게)
  ['D3', 'A3', 'E4'], // 레·라·미 (열린 느낌)
  ['G2', 'D3', 'A3'], // 솔·레·라 (다시 도로 돌아가고 싶게)
];
export const MUSIC_CHORD_BEATS = 8;
// 멜로디에 쓰는 음 (낮은 음부터 차례로). 앞 음에서 한두 칸만 움직여서 노래처럼 들리게 한다
export const MUSIC_MELODY_NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
// 반 박마다 멜로디 음이 날 확률. 노선이 없으면 처음 값, 노선이 하나 늘 때마다 조금씩 늘어 최대값까지
// (노선망이 커질수록 음악이 조금씩 풍성해진다). 멈춤 중에는 화음만 울린다
export const MUSIC_NOTE_CHANCE = { start: 0.08, perRoute: 0.03, max: 0.28 };

// ── 요금 (나라마다 매기는 방식이 다르다. 지도의 나라는 regions.js의 country) ──
// 방식은 실제 나라를 따르고, 금액은 서울과 비슷하게 맞췄다 (어느 도시든 돈 버는 어려움이 비슷하게).
// 승객이 흔히 타는 5~15km 여행이 1,550~1,650원쯤 되게 했다. 단위는 모두 원
export const FARES = {
  // 한국: 거리 비례 (서울 지하철, 2025-06-28 기준). 기본 거리까지는 기본요금, 그 뒤로는 일정 거리마다 추가요금
  kr: {
    type: 'distance',
    baseWon: 1550, // 기본요금
    baseKm: 10, // 기본요금으로 갈 수 있는 거리 (km)
    stepWon: 100, // 추가요금 한 번
    stepKm: 5, // 기본 거리 ~ 50km 구간: 이 거리마다 추가요금
    longKm: 50, // 이 거리부터는 더 긴 간격으로 추가요금
    longStepKm: 8, // 50km 넘는 구간: 이 거리마다 추가요금
  },
  // 일본: 거리 구간 (도쿄메트로처럼 몇 km까지 얼마). [이 거리(km)까지, 요금]
  // 실제 IC 요금 178·209·252·293·324엔의 비율 그대로, 7~11km 구간이 서울 기본요금과 같게
  jp: {
    type: 'bands',
    bands: [
      [6, 1320],
      [11, 1550],
      [19, 1870],
      [27, 2170],
      [Infinity, 2400],
    ],
  },
  // 미국: 어디까지 가든 같은 요금 (뉴욕 지하철 균일 요금 2.90달러처럼)
  us: { type: 'flat', won: 1650 },
  // 영국: 구역제 (런던처럼 도심에서 둥글게 구역 1, 2, 3 …). 지나는 구역 수에 따라 요금이 오른다
  uk: {
    type: 'zones',
    zoneKm: 4, // 구역 하나의 폭 (지도 처음 화면 가운데에서 이 거리마다 구역이 하나씩 바깥으로)
    baseWon: 1450, // 한 구역 안에서만 탈 때
    stepWon: 200, // 구역을 하나 더 지날 때마다
  },
  // 프랑스: 어디까지 가든 같은 요금 (파리 지하철 티켓 한 장처럼)
  fr: { type: 'flat', won: 1650 },
};
// 한 달을 며칠로 칠지 (하루 승객 × 요금 × 이 날수 = 월 수입)
export const DAYS_PER_MONTH = 30;
