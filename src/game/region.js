// 지금 하는 지도(지역): 시작 화면에서 고른다 (config.js의 REGIONS 중 하나).
// 저장 칸과 왼쪽 위 배지의 지역 이름이 지역마다 다르다.
import { REGIONS } from '../config.js';

let current = 'seoul';

export function setRegion(id) {
  if (!REGIONS[id]) throw new Error(`없는 지도예요: ${id}`);
  current = id;
}

// 결과: { id, name, title, description, center, zoom }
export const getRegion = () => ({ id: current, ...REGIONS[current] });
