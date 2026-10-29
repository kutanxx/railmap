// 지금 하는 지도(지역): 시작 화면에서 고른다 (regions.js의 REGIONS 중 하나).
// 저장 칸, 왼쪽 위 배지의 지역 이름, 돈 계산 밸런스(시작 자금, 인구 배율, 선로 공사비 배율)가 지역마다 다르다.
// 샌드박스(돈 무제한, 빚·파산·목표 없음)도 시작 화면에서 고르고, 지도마다 저장 칸이 따로 있다.
import { PEOPLE_PER_BUILT_M2 } from '../config.js';
import { REGIONS } from '../regions.js';

let current = 'seoul';
// getRegion()이 돌려줄 값. 지도를 바꿀 때 한 번만 만든다 (요금 계산이 승객 쌍마다 불러서, 부를 때마다 만들면 느렸다)
let region = { id: current, ...REGIONS[current] };
let sandbox = false;

// 샌드박스로 할지 (시작 화면에서 정한다)
export function setSandbox(on) {
  sandbox = on;
}
export const isSandbox = () => sandbox;

export function setRegion(id) {
  if (!REGIONS[id]) throw new Error(`없는 지도예요: ${id}`);
  current = id;
  region = { id, ...REGIONS[id] };
}

// 결과: { id, name, title, description, center, zoom, startMoney, populationScale, trackCostScale }
export const getRegion = () => region;

// 건물 1㎡에 사는 사람 수 (지도마다 인구 배율을 곱한다). 인구 재기와 이웃 역과 나누기가 함께 쓴다
export const peoplePerBuiltM2 = () => PEOPLE_PER_BUILT_M2 * REGIONS[current].populationScale;
