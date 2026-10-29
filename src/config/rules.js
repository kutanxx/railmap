// 게임 규칙과 밸런스 숫자: 시간·열차, 돈·빚, 지형, 날짜, 승객 수요, 역 주변 인구, 게임 목표, 요금.
// (src/config.js가 이 파일을 그대로 내보낸다. 숫자를 바꾸면 브라우저가 알아서 새로고침된다)

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

// 노선 하나에 처음 넣는 열차 수
export const DEFAULT_TRAINS_PER_ROUTE = 1;
// 노선 하나의 최대 열차 수: 열차 사이(배차 간격)가 MIN_HEADWAY_MINUTES분보다 짧아지지 않을 만큼 (왕복 시간 ÷ 이 값, 적어도 1대).
// 노선이 길수록 많이 넣을 수 있다: 왕복 10분이면 5대, 1시간이면 30대, 2시간이면 60대 (game/routes.js의 maxTrainCount)
export const MIN_HEADWAY_MINUTES = 2;
// 지도 전체 열차 수 한도: 화면이 느려지지 않게 (2026-10 런던 실제 노선망으로 잼: 1,000대까지 1초에 60장 넘게 부드럽고,
// 2,000대가 넘으면 끊김이 보였다. 보통 노트북·휴대폰을 생각해 조금 낮췄다). 돈이 드는 일반 게임에서는 거의 닿지 않는다
export const MAX_TRAINS_TOTAL = 800;

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

// ── 광역급행 (GTX). 노선을 만들 때 [지하철]·[광역급행]을 고른다 (game/routeKinds.js) ──
// 지하철보다 빠르고 한 번에 많이 나르지만 열차가 비싸고 운영비도 많이 든다.
// 같은 선로를 지하철과 함께 쓸 수 있다. 꺾이는 곳·가파른 곳 제한 속도는 똑같이 받는다.
// 역 사이가 짧으면 최고 속도까지 올라가기 전에 다시 서야 해서 이점이 줄어든다 → 역을 띄엄띄엄 둘수록 좋다
// 최고 속도 (km/h). 실제 GTX-A는 180km/h, 게임 지하철(60)처럼 실제보다 조금 낮게
export const EXPRESS_SPEED_KMH = 140;
// 빨라지고 느려지는 정도 (m/s²). 무거운 긴 열차라 지하철보다 조금 느리게
export const EXPRESS_ACCELERATION = 0.7;
// 열차 한 편에 탈 수 있는 사람 수 (지하철 TRAIN_CAPACITY의 1.5배)
export const EXPRESS_CAPACITY = 1500;
// 열차 한 대 값 (억 원). 노선을 만들 때 기본 열차 값도 이 값으로 낸다
export const EXPRESS_TRAIN_COST = 15;
// 열차 한 대 매달 운영비 (억 원, 지하철은 OPEX_PER_TRAIN)
export const EXPRESS_OPEX_PER_TRAIN = 3;
// 요금: 광역급행을 탄 거리만큼은 보통 요금의 이 배수를 받는다 (실제 GTX-A는 지하철의 2~3배쯤이지만,
// 게임 승객은 요금으로 덜 타지 않아서 크게 잡으면 모든 노선을 급행으로 바꾸는 게 늘 이득이 된다)
export const EXPRESS_FARE_RATIO = 1.3;
// 승객이 길을 고를 때 광역급행의 비싼 요금을 시간처럼 느끼는 정도 (탄 1km마다 몇 분 더 걸리는 것으로 친다).
// 시간을 크게 줄여 주지 않으면 나란한 지하철을 고르고, 역 사이가 짧은 급행은 승객이 조금 줄어든다
export const EXPRESS_FARE_MINUTES_PER_KM = 0.2;
// 열차 길이 (미터, 지도 위 캡슐)
export const EXPRESS_TRAIN_LENGTH_M = 200;
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

// ── 고속철도역 (처음부터 지도에 있는 고정 역, src/intercityStations.js) ──
// 고속철도역에서 이 거리(미터) 안에 지하철역을 지으면 이어진 것으로 친다 (가장 가까운 지하철역 하나만).
// 갈아타려고 걸어갈 만한 거리
export const INTERCITY_LINK_M = 300;
// 고속철도역을 드나들며 지하철로 갈아타려는 사람 (명). 이어진 지하철역의 인구에 더한다.
// 실제 이용객 통계가 아니라 게임 숫자다. 서울 지하철역 주변 인구가 보통 2만~3만 명이니, 큰 역은 역 하나만큼 더 붙는 셈
export const INTERCITY_PEOPLE = { large: 30000, medium: 15000 };

// ── 게임 목표 (game/goals.js) ─────────────
// 위에서부터 차례로 보여주고, 이루면 말풍선과 함께 보상(억)을 준다. 샌드박스에는 목표가 없다
// kind: 'routes' 노선 수, 'stations' 역 수, 'transfers' 환승역 수, 'riders' 하루 승객 (지도의 riderGoalScale을 곱한다),
//       'net' 월 수지(억, 이 값을 넘으면. 0이면 "흑자"), 'money' 자금(억),
//       'hubs' 노선이 서는 역과 이어진 고속철도역(인천은 공항역) 수, 'express' 광역급행 노선 수
// 보상은 "다음 목표로 가는 한 걸음" 값에 맞췄다. 서울 기준으로 잰 값 (2026-10-27):
//   첫 노선(역 6개·열차 1대): 공사비 약 450억, 하루 승객 약 1.4만, 수지 +2억/월 → 열차를 늘리면 2만
//   노선 3개(역 30개): 승객 약 10만, 수지 +22억/월 / 역 50개·노선 8개·환승 15곳: 승객 약 28만, 수지 +76억/월
// 역 하나 40억, 선로 1km 60억, 열차 한 대 5억이니 첫 보상들은 역 한두 개, 뒤 보상들은 노선 하나쯤을 지을 수 있다
// 목표는 매달 정산 때 위에서부터 확인하고 못 이룬 첫 목표에서 멈추므로, 실제로 짓는 순서대로 놓는다.
// 2026-10-28: 노선 3개쯤에서 목표 4개(노선 3·승객 5만·역 20·승객 10만, 470억)가 한꺼번에 이뤄지고
// 그 뒤 흑자 +50억까지 한참 비어서, 사이에 환승역 3곳·흑자 +25억·노선 6개를 넣었다
// 2026-10-29: 새 기능을 써 보게 고속철도역 잇기(첫 노선 무렵)와 첫 광역급행(노선 3개 뒤, 급행 열차 15억)을 넣었다.
// 예전 저장에서 이미 지나친 자리에 끼운 목표는 뒤 목표를 막지 않는다 (game/goals.js)
export const GOALS = [
  { kind: 'routes', value: 1, reward: 30 },
  { kind: 'riders', value: 20000, reward: 40 },
  { kind: 'hubs', value: 1, reward: 60 },
  { kind: 'transfers', value: 1, reward: 80 },
  { kind: 'net', value: 10, reward: 50 },
  { kind: 'routes', value: 3, reward: 100 },
  { kind: 'express', value: 1, reward: 100 },
  { kind: 'riders', value: 50000, reward: 100 },
  { kind: 'stations', value: 20, reward: 120 },
  { kind: 'transfers', value: 3, reward: 120 },
  { kind: 'riders', value: 100000, reward: 150 },
  { kind: 'net', value: 25, reward: 150 },
  { kind: 'routes', value: 6, reward: 200 },
  { kind: 'net', value: 50, reward: 200 },
  { kind: 'riders', value: 300000, reward: 300 },
];

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
