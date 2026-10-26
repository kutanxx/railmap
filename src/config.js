// 게임의 모든 숫자 설정을 모아두는 곳.
// 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.

// ── 지도 ──────────────────────────────
// 처음 화면에 보일 위치 [경도, 위도]. 지금은 서울 도심(을지로 근처).
export const START_CENTER = [126.9895, 37.5615];

// 처음 확대 정도. 숫자가 클수록 가까이 보인다 (14 ≈ 동네 몇 개가 보이는 정도).
export const START_ZOOM = 14;

// 기본 지도 데이터 주소 (OpenFreeMap positron, 가입·키 없음)
export const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// ── 화면 표시 ──────────────────────────
// 왼쪽 위 배지에 보일 지역 이름
export const REGION_NAME = '서울';

// 게임 시작 날짜
export const START_YEAR = 2026;
export const START_MONTH = 3;

// ── 역(승강장) 모양 ─────────────────────
// 승강장의 실제 크기 (미터). 가까이 확대하면 이 크기로 땅 위에 그려진다
// (실제 지하철 승강장은 길이 150~200m쯤이고, 폭은 잘 보이게 조금 넓게 잡았다)
export const PLATFORM_LENGTH_M = 160;
export const PLATFORM_WIDTH_M = 40;

// 이 줌부터는 실제 크기로 그리고, 더 멀리서는 작은 그림으로 대신 보여준다
export const PLATFORM_REAL_SIZE_ZOOM = 14;

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

// 열차 속도 (km/h, 게임 시간 기준)
export const TRAIN_SPEED_KMH = 60;

// 역에 멈춰 있는 시간 (게임 시간 초)
export const STATION_DWELL_SECONDS = 30;

// 노선 하나에 처음 넣는 열차 수와 최대 열차 수
export const DEFAULT_TRAINS_PER_ROUTE = 1;
export const MAX_TRAINS_PER_ROUTE = 10;

// 열차 길이 (미터). 지도 위 캡슐 길이가 된다
export const TRAIN_LENGTH_M = 120;

// ── 돈 (단위: 억 원) ────────────────────
// 시작 자금
export const START_MONEY = 500;

// 공사비 = 선로 길이(km) × TRACK_COST_PER_KM + 새 역 개수 × STATION_COST
export const TRACK_COST_PER_KM = 22;
export const STATION_COST = 15;

// 매달 운영비 = 선로 km × OPEX_PER_TRACK_KM + 열차 대수 × OPEX_PER_TRAIN
export const OPEX_PER_TRACK_KM = 0.1;
export const OPEX_PER_TRAIN = 0.5;

// ── 날짜 ───────────────────────────────
// 1배속에서 한 달이 실제 몇 초인지
export const SECONDS_PER_MONTH = 20;

// ── 승객 수요 (중력 모델) ─────────────────
// 두 역 사이 하루 승객(명, 오가는 사람 모두) =
//   RIDERS_FACTOR × (역 A 인구 ÷ 1000) × (역 B 인구 ÷ 1000) ÷ 소요 시간(분)^DEMAND_TIME_POWER
// 43이면 전에 쓰던 수입 공식(월 0.02억 × …)과 비슷한 수입이 나온다
export const RIDERS_FACTOR = 43;
export const DEMAND_TIME_POWER = 0.8;
// 소요 시간이 이보다 짧아도 이 값(분)으로 친다. 아주 가까운 두 역의 수요가 터무니없이 커지지 않게
export const MIN_TRIP_MINUTES = 3;
// 갈아탈 때 더 걸리는 시간 (분). 기다리는 시간과 별개로 걸어서 옮기는 시간
export const TRANSFER_MINUTES = 2;

// ── 역 주변 인구 ─────────────────────────
// 역을 놓을 때 이 반경(미터) 안의 건물 바닥 면적을 재어 인구를 추정한다
export const POPULATION_RADIUS_M = 500;
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
