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
