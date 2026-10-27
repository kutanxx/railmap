// 게임의 모든 숫자 설정을 모아두는 곳.
// 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.

// ── 지도 (지역) ─────────────────────────
// 시작 화면에서 고르는 지도들. 역·선로·노선·열차·돈 계산은 어느 지도든 똑같다
// name: 왼쪽 위 배지에 보일 지역 이름, title·description: 시작 화면 글,
// center: 처음 화면 가운데 [경도, 위도], zoom: 처음 확대 정도 (클수록 가까이, 14 ≈ 동네 몇 개)
// 지도마다 다른 돈 계산 (밸런스):
//   startMoney: 시작 자금 (억)
//   populationScale: 건물 면적으로 잰 인구에 곱하는 배율 (1 = PEOPLE_PER_BUILT_M2 그대로)
//   trackCostScale: 선로·교량·터널 공사비와 선로 운영비에 곱하는 배율 (지방은 땅값이 싸서 1보다 작다)
export const REGIONS = {
  seoul: {
    name: '서울',
    title: '실제 지도 · 서울',
    description: 'OpenStreetMap의 실제 서울 도심 위에 노선을 깔아요',
    center: [126.9895, 37.5615],
    zoom: 14,
    startMoney: 600,
    populationScale: 1,
    trackCostScale: 1,
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
  },
};

// 실제 지도의 기본 지도 데이터 주소 (OpenFreeMap positron, 가입·키 없음)
export const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// 미터를 화면 px로 바꿀 때 쓰는 위도. 서울과 솔내 지방 모두 이 위도에 있다
export const GROUND_LATITUDE = 37.56;

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
// 이 줌부터는 실제 크기로 그리고, 더 멀리서는 작은 승강장 그림으로 대신 보여준다
export const PLATFORM_REAL_SIZE_ZOOM = 14;

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
// 출구 이름 붙이는 방식. 지금은 'seoul'(상행 오른쪽 앞이 1번, 시계 방향)만 있다 (ui/exitNames.js)
export const EXIT_NAMING = 'seoul';


// ── 노선 색 ────────────────────────────
// 노선마다 고를 수 있는 차분한 색 6가지. 새 노선은 이 순서대로 돌아가며 받는다
export const ROUTE_COLORS = [
  { name: '파랑', color: '#3F6E9A' },
  { name: '초록', color: '#5E8C61' },
  { name: '벽돌', color: '#B0574A' },
  { name: '보라', color: '#7E6A9E' },
  { name: '청록', color: '#3E8A8A' },
  { name: '자두', color: '#9C5B7A' },
];

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

// ── 돈 (단위: 억 원) ────────────────────
// 시작 자금은 지도마다 다르다: 위의 REGIONS의 startMoney (서울 600억 = 역 3개짜리 첫 노선 약 320억 + 여유)

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
// 지도 위 말풍선 알림이 떠 있는 시간 (실제 초)
export const CALLOUT_SECONDS = 4;

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
// 소리마다 크기 (dB, 노선 개통을 0으로). −6이면 대략 절반. 자주 나는 소리일수록 작게
export const SOUND_LEVELS = {
  open: 0, // 노선 개통 (아주 드묾)
  track: -4, // 선로 완성
  station: -6, // 역 놓기
  arrive: -14, // 열차 도착 (계속 남)
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
// 열차가 역에 서는 소리는 열차가 많아도 이만큼(실제 초)에 한 번만 낸다 (3배속이어도 같다)
export const ARRIVAL_SOUND_GAP_SECONDS = 1.5;

// ── 요금 (서울 지하철 거리 비례 요금, 2025-06-28 기준) ──
// 기본 거리까지는 기본요금, 그 뒤로는 일정 거리마다 추가요금
export const FARE_BASE_WON = 1550; // 기본요금 (원)
export const FARE_BASE_KM = 10; // 기본요금으로 갈 수 있는 거리 (km)
export const FARE_STEP_WON = 100; // 추가요금 한 번 (원)
export const FARE_STEP_KM = 5; // 기본 거리 ~ 50km 구간: 이 거리마다 추가요금
export const FARE_LONG_KM = 50; // 이 거리부터는 더 긴 간격으로 추가요금
export const FARE_LONG_STEP_KM = 8; // 50km 넘는 구간: 이 거리마다 추가요금
// 한 달을 며칠로 칠지 (하루 승객 × 요금 × 이 날수 = 월 수입)
export const DAYS_PER_MONTH = 30;
