// 공사비와 운영비 계산 (단위: 억 원). 숫자는 모두 config.js에서 가져온다.
import { length, lineString } from '@turf/turf';
import {
  TRACK_COST_PER_KM,
  STATION_COST,
  OPEX_PER_TRACK_KM,
  OPEX_PER_TRAIN,
} from '../config.js';

// 역 하나 공사비
export function stationCost() {
  return STATION_COST;
}

// 좌표들을 잇는 선로의 길이(km)와 공사비
export function trackCostForCoords(coords) {
  const km = coords.length >= 2 ? length(lineString(coords), { units: 'kilometers' }) : 0;
  return { km, cost: km * TRACK_COST_PER_KM };
}

// 매달 운영비 = 선로 km × km당 운영비 + 열차 대수 × 열차당 운영비
export function monthlyOpex(totalTrackKm, totalTrains) {
  return totalTrackKm * OPEX_PER_TRACK_KM + totalTrains * OPEX_PER_TRAIN;
}
