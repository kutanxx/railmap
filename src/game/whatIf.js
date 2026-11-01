// "만약에" 노선 ([메뉴] → [만약에 노선], ui/whatIfCard.js): 실제로 짓고 있거나 계획만 된 노선(src/data/whatif.json,
// tools/make-whatif.mjs가 만든다)을 내 노선망에 계획 선로(주황 점선)로 깐다.
// 역 자리 가까이(WHAT_IF_REUSE_M 안)에 내 역이 있으면 그 역을 쓰고, 없으면 새 역을 짓는다 (역 값을 낸다).
// 선로는 계획 선로라 돈이 들지 않고, [계획 선로 모두 짓기]로 그때 모양대로 짓는다. 한 번에 되돌릴 수 있다 (change)
// (역·선로를 바꾸는 일이지만 build.js가 400줄에 가까워 따로 둔다)
import WHAT_IF from '../data/whatif.json';
import { WHAT_IF_REUSE_M } from '../config.js';
import { getState, change, canAfford, findTrackBetween } from './state.js';
import { stationCost } from './economy.js';
import { getRegion } from './region.js';
import { METERS_PER_DEGREE_LAT, metersPerDegreeLng } from './earth.js';

// 지금 지도의 "만약에" 노선들 [{ id, name, status, stations: [{ name, coord }] }]
export const whatIfLines = () => WHAT_IF[getRegion().id] ?? [];

const distanceM = ([lng1, lat1], [lng2, lat2]) =>
  Math.hypot((lng2 - lng1) * metersPerDegreeLng((lat1 + lat2) / 2), (lat2 - lat1) * METERS_PER_DEGREE_LAT);

// 깔기 전 계획: { stops: 역마다 { name, coord, existing: 붙일 내 역 id 또는 null }, newStations: 새로 지을 역 수,
//                newTracks: 새로 깔 계획 선로 수, cost: 새 역 공사비 }
export function whatIfPlan(line) {
  const { stations } = getState();
  const stops = line.stations.map((stop) => {
    let existing = null;
    let best = WHAT_IF_REUSE_M;
    for (const station of stations) {
      const distance = distanceM(station.coord, stop.coord);
      if (distance <= best) {
        best = distance;
        existing = station.id;
      }
    }
    return { ...stop, existing };
  });
  const newStations = stops.filter((stop) => !stop.existing).length;
  const newTracks = stops
    .slice(1)
    .filter((stop, i) => !(stops[i].existing && stop.existing && findTrackBetween(stops[i].existing, stop.existing, { planned: true })))
    .length;
  return { stops, newStations, newTracks, cost: newStations * stationCost() };
}

// 깐다. measured: 새로 지을 역마다 주변 인구 Map(stops 번호 → { population, builtArea, cells }) (ui/whatIfCard.js가 잰다)
// 결과: { stationIds: 노선 역 순서의 역 id들, tracks: 새로 깐 계획 선로 수 }, 공사비를 낼 수 없으면 null
export function applyWhatIf(line, measured) {
  return change(null, () => {
    const state = getState();
    const plan = whatIfPlan(line);
    if (!canAfford(plan.cost)) return null;
    state.money -= plan.cost;
    const usedNames = new Set(state.stations.map((station) => station.name));
    const stationIds = plan.stops.map((stop, i) => {
      if (stop.existing) return stop.existing;
      const id = `s${state.nextStationNumber}`;
      state.nextStationNumber += 1;
      // 다른 역이 쓰는 이름이면 노선 이름을 붙인다 ("서울역 (GTX-B)")
      const name = usedNames.has(stop.name) ? `${stop.name} (${line.name})` : stop.name;
      usedNames.add(name);
      state.stations.push({ id, name, coord: stop.coord, angle: 0, ...measured.get(i) });
      return id;
    });
    let tracks = 0;
    for (let i = 1; i < stationIds.length; i++) {
      const [from, to] = [stationIds[i - 1], stationIds[i]];
      if (from === to || findTrackBetween(from, to, { planned: true })) continue;
      state.tracks.push({ id: `t${state.nextTrackNumber}`, from, to, waypoints: [], curve: false, planned: true });
      state.nextTrackNumber += 1;
      tracks += 1;
    }
    return { stationIds, tracks };
  });
}
