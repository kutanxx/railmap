// 30분 지도: 고른 역에서 REACH_BANDS(10·20·30분) 안에 갈 수 있는 곳.
// 출발역에서 걸어서, 또는 열차를 타고(기다리기·갈아타기 포함, tripFinder.js) 어느 역에 내린 뒤 남은 시간만큼 걸어서 닿는 곳을
// 역마다 둥근 곳(원)으로 낸다. 원들을 겹쳐 칠하면 갈 수 있는 곳 전체가 된다 (map/reachLayers.js가 그린다).
// 열차가 다니는 노선만 탈 수 있다 (승객 수요 계산과 같다). 광역급행의 비싼 요금은 시간으로 치지 않는다 (실제 걸리는 시간만)
import { REACH_BANDS, REACH_WALK_M_PER_MIN } from '../config.js';
import { getState, findStation } from './state.js';
import { buildGraph, minutesFrom } from './tripFinder.js';

// 결과: { bands: 시간대마다 원들 [{ minutes: 10, circles: [{ center: [경도, 위도], radius: m }] }, …],
//         arrivals: 가장 긴 시간대 안에 열차로 닿는 역 수 (출발역 빼고) }. 출발역이 없으면 bands는 빈 목록
export function reachFrom(originId) {
  const origin = findStation(originId);
  if (!origin) return { bands: [], arrivals: 0 };
  const running = getState().routes.filter((route) => route.trainCount > 0);
  const minutes = minutesFrom(buildGraph(running), originId);
  // 출발역은 0분, 다른 역은 내리는 데까지 걸린 시간
  const stops = [{ coord: origin.coord, minutes: 0 }];
  for (const [id, value] of minutes) stops.push({ coord: findStation(id).coord, minutes: value });
  const bands = REACH_BANDS.map((limit) => ({
    minutes: limit,
    circles: stops
      .filter((stop) => stop.minutes < limit)
      .map((stop) => ({ center: stop.coord, radius: (limit - stop.minutes) * REACH_WALK_M_PER_MIN })),
  }));
  const longest = REACH_BANDS.at(-1);
  const arrivals = [...minutes.values()].filter((value) => value < longest).length;
  return { bands, arrivals };
}
