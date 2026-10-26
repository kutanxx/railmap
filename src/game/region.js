// 지금 하는 지도(지역): 시작 화면에서 고른다 (config.js의 REGIONS 중 하나).
// 저장 칸, 왼쪽 위 배지의 지역 이름, 돈 계산 밸런스(시작 자금, 인구 배율, 선로 공사비 배율)가 지역마다 다르다.
import { REGIONS, PEOPLE_PER_BUILT_M2 } from '../config.js';

let current = 'seoul';

export function setRegion(id) {
  if (!REGIONS[id]) throw new Error(`없는 지도예요: ${id}`);
  current = id;
}

// 결과: { id, name, title, description, center, zoom, startMoney, populationScale, trackCostScale }
export const getRegion = () => ({ id: current, ...REGIONS[current] });

// 건물 1㎡에 사는 사람 수 (지도마다 인구 배율을 곱한다). 인구 재기와 이웃 역과 나누기가 함께 쓴다
export const peoplePerBuiltM2 = () => PEOPLE_PER_BUILT_M2 * REGIONS[current].populationScale;
