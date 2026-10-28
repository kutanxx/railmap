// 고속철도역: 처음부터 지도에 있는 고정 역 (src/intercityStations.js). 플레이어가 짓거나 운영하지 않는다.
// 고속철도역에서 INTERCITY_LINK_M 안의 가장 가까운 지하철역 하나가 "이어진 역"이 되고,
// 고속철도역을 드나드는 사람(INTERCITY_PEOPLE)이 그 역 인구에 더해진다 (demand.js가 승객 수요에 쓴다).
import { distance } from '@turf/turf';
import { INTERCITY_LINK_M, INTERCITY_PEOPLE } from '../config.js';
import { INTERCITY_STATIONS } from '../intercityStations.js';
import { getRegion } from './region.js';

// 지금 지도의 고속철도역들 [{ name, coord, size, people }]
export function intercityStations() {
  return (INTERCITY_STATIONS[getRegion().id] ?? []).map((hub) => ({ ...hub, people: INTERCITY_PEOPLE[hub.size] }));
}

// 미터 단위 거리
const meters = (a, b) => distance(a, b, { units: 'kilometers' }) * 1000;

// 고속철도역마다 이어진 지하철역: [{ hub, stationId }] (이어진 역이 없는 고속철도역은 빠진다)
// stations: 지하철역들 (끌어 옮기는 중이면 옮긴 자리로 넘겨도 된다)
export function intercityLinks(stations) {
  const links = [];
  for (const hub of intercityStations()) {
    let best = null;
    for (const station of stations) {
      const gap = meters(hub.coord, station.coord);
      if (gap <= INTERCITY_LINK_M && (!best || gap < best.gap)) best = { stationId: station.id, gap };
    }
    if (best) links.push({ hub, stationId: best.stationId });
  }
  return links;
}
