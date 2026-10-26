// 공사비와 운영비 계산 (단위: 억 원). 숫자는 모두 config.js에서 가져온다.
import {
  TRACK_COST_PER_KM,
  BRIDGE_COST_PER_KM,
  TUNNEL_COST_PER_KM,
  STATION_COST,
  STATION_MOVE_COST_RATIO,
  OPEX_PER_TRACK_KM,
  OPEX_PER_TRAIN,
  OPEX_PER_STATION,
  FARE_BASE_WON,
  FARE_BASE_KM,
  FARE_STEP_WON,
  FARE_STEP_KM,
  FARE_LONG_KM,
  FARE_LONG_STEP_KM,
} from '../config.js';
import { getRegion } from './region.js';
import { trackProfile } from './trackProfile.js';

// 역 하나 공사비
export function stationCost() {
  return STATION_COST;
}

// 역 하나를 옮기는 이전 비용 (이어진 선로가 늘어난 만큼은 따로 더한다)
export function stationMoveFee() {
  return STATION_COST * STATION_MOVE_COST_RATIO;
}

// 좌표들을 잇는 선로의 길이(km), 그중 교량·터널 길이(km), 공사비 (교량·터널 판정은 trackProfile.js)
// 공사비 = (땅 위 × TRACK_COST_PER_KM + 교량 × BRIDGE_COST_PER_KM + 터널 × TUNNEL_COST_PER_KM) × 지도의 선로 공사비 배율
export function trackCostForCoords(coords) {
  const { km, groundKm, bridgeKm, tunnelKm } = trackProfile(coords);
  const base =
    groundKm * TRACK_COST_PER_KM + bridgeKm * BRIDGE_COST_PER_KM + tunnelKm * TUNNEL_COST_PER_KM;
  return { km, bridgeKm, tunnelKm, cost: base * getRegion().trackCostScale };
}

// 매달 운영비 = 역 개수 × 역 유지비 + 선로 km × km당 운영비 × 지도의 선로 공사비 배율 + 열차 대수 × 열차당 운영비
export function monthlyOpex(stationCount, totalTrackKm, totalTrains) {
  return (
    stationCount * OPEX_PER_STATION +
    totalTrackKm * OPEX_PER_TRACK_KM * getRegion().trackCostScale +
    totalTrains * OPEX_PER_TRAIN
  );
}

// 승객 한 명의 요금 (원). 서울 지하철처럼 탄 거리에 따라 오른다
// 예) 8km → 1,550원, 12km → 1,650원, 30km → 1,950원
export function fareWon(km) {
  let fare = FARE_BASE_WON;
  if (km > FARE_BASE_KM) {
    const middleKm = Math.min(km, FARE_LONG_KM) - FARE_BASE_KM;
    fare += Math.ceil(middleKm / FARE_STEP_KM) * FARE_STEP_WON;
  }
  if (km > FARE_LONG_KM) {
    fare += Math.ceil((km - FARE_LONG_KM) / FARE_LONG_STEP_KM) * FARE_STEP_WON;
  }
  return fare;
}
