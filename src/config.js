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
