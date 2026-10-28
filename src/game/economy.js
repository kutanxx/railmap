// 공사비와 운영비 계산 (단위: 억 원). 숫자는 모두 config.js에서 가져온다.
import {
  TRACK_COST_PER_KM,
  BRIDGE_COST_PER_KM,
  TUNNEL_COST_PER_KM,
  STATION_COST,
  STATION_MOVE_COST_RATIO,
  OPEX_PER_TRACK_KM,
  OPEX_PER_STATION,
  FARES,
} from '../config.js';
import { distance } from '@turf/turf';
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

// 매달 운영비 = 역 개수 × 역 유지비 + 선로 km × km당 운영비 × 지도의 선로 공사비 배율 + 열차 운영비
// trainOpex: 열차 운영비 합 (노선마다 열차 대수 × 그 종류의 열차당 운영비, demand.js가 더해 넘긴다)
export function monthlyOpex(stationCount, totalTrackKm, trainOpex) {
  return stationCount * OPEX_PER_STATION + totalTrackKm * OPEX_PER_TRACK_KM * getRegion().trackCostScale + trainOpex;
}

// 승객 한 명의 요금 (원). 나라마다 매기는 방식이 다르다 (config.js의 FARES)
// km: 탄 거리, from·to: 타고 내린 역 자리 [경도, 위도] (구역제에서 쓴다)
// 예) 한국 8km → 1,550원, 12km → 1,650원, 30km → 1,950원 / 뉴욕·파리 어디든 1,650원
export function fareWon(km, from, to) {
  const fare = FARES[getRegion().country];
  if (fare.type === 'flat') return fare.won;
  if (fare.type === 'bands') return fare.bands.find(([upToKm]) => km <= upToKm)[1];
  if (fare.type === 'zones') {
    // 지도 처음 화면 가운데가 구역 1의 한가운데다
    const zone = (coord) => 1 + Math.floor(distance(getRegion().center, coord) / fare.zoneKm);
    const zonesCrossed = Math.abs(zone(from) - zone(to)) + 1;
    return fare.baseWon + (zonesCrossed - 1) * fare.stepWon;
  }
  // 'distance': 탄 거리에 따라 오른다
  let won = fare.baseWon;
  if (km > fare.baseKm) {
    won += Math.ceil((Math.min(km, fare.longKm) - fare.baseKm) / fare.stepKm) * fare.stepWon;
  }
  if (km > fare.longKm) {
    won += Math.ceil((km - fare.longKm) / fare.longStepKm) * fare.stepWon;
  }
  return won;
}
