// 역 출구 관리: 지도에서 자리를 찾고(map/exitFinder.js), 이름을 붙이고(exitNames.js), 기억해 두고, 그린다.
// 출구는 게임 상태에 저장하지 않는다. 같은 역 모양과 같은 지도에서는 늘 같은 자리가 나오므로,
// 역이 화면에 보일 때 한 번 찾아서 기억해 두고, 선로를 바꿔 역 모양이 달라지면 다시 찾는다.
// 지도 건물·도로는 불러온 곳에만 있으므로, 화면 안에 있고 충분히 확대한 역만 찾는다.
import { EXIT_DOT_ZOOM } from '../config.js';
import { readSurroundings, findExits } from '../map/exitFinder.js';
import { updateExits } from '../map/exitLayers.js';
import { nameExits, usesStreetNames } from './exitNames.js';

export function createStationExits(map) {
  const remembered = new Map(); // 역 id → { key: 역 모양, exits }
  let drawnKeys = null; // 지금 지도에 그려 둔 출구들 (같으면 다시 그리지 않는다)
  let drawnCoords = []; // 지금 지도에 그려 둔 출구 자리들

  // stations: 화면에 보일 역들, bands: ui/stationBands.js의 결과, skipId: 끌어서 옮기는 중인 역 (출구 숨김)
  function update(stations, bands, skipId) {
    const ready = map.getZoom() >= EXIT_DOT_ZOOM;
    const bounds = map.getBounds();
    let surroundings;
    const shown = [];
    for (const station of stations) {
      const band = bands.get(station.id);
      if (station.id === skipId || !band) continue;
      const key = JSON.stringify([band.headings, band.parts]);
      let entry = remembered.get(station.id);
      if (entry?.key !== key) {
        remembered.delete(station.id);
        if (!ready || !bounds.contains(station.coord)) continue;
        surroundings ??= readSurroundings(map, usesStreetNames());
        if (!surroundings) continue; // 지도 타일을 아직 불러오는 중
        const found = findExits(surroundings, station.coord, band.parts);
        const names = nameExits(found, band.headings);
        entry = { key, exits: found.map((exit, i) => ({ ...exit, name: names[i] })) };
        remembered.set(station.id, entry);
      }
      shown.push(entry);
    }
    // 지워진 역의 기억은 버린다
    const ids = new Set(stations.map((station) => station.id));
    for (const id of remembered.keys()) if (!ids.has(id)) remembered.delete(id);

    const keys = shown.map((entry) => entry.key).join('|');
    if (keys === drawnKeys) return;
    drawnKeys = keys;
    const exits = shown.flatMap((entry) => entry.exits);
    drawnCoords = exits.map((exit) => exit.coord);
    updateExits(map, exits);
  }

  // 지금 지도에 그려 둔 출구 자리들 [[경도, 위도], …] (역 말풍선이 피해 갈 때 쓴다)
  const coords = () => drawnCoords;

  return { update, coords };
}
