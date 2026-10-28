// 역과 선로 짓기·고치기: 역 짓기·이름·옮기기·방향·지우기, 선로 깔기·경유점 바꾸기·직선/곡선 바꾸기·지우기,
// 계획 선로 그려 두기·짓기.
// 모든 바뀜은 state.js의 change()를 거쳐 되돌리기 기록에 남는다.
// 공사비는 빚 한도 안에서만 낼 수 있다 (canAfford). 계획 선로는 그리고 고칠 때 돈이 들지 않고, 지을 때 한꺼번에 낸다.
import { stationCost, stationMoveFee, trackCostForCoords } from './economy.js';
import { shapeCoords } from './trackShape.js';
import {
  getState,
  change,
  canAfford,
  findStation,
  findTrack,
  findRoute,
  trackCoords,
  routeTracks,
} from './state.js';

const state = getState();

// ── 역 ──────────────────────────────

// coord 자리에 새 역을 짓고, 지은 역을 돌려준다. name: 역 이름 (가까운 지명, map/placeNames.js. 없으면 "역 n")
// 빚 한도 안에서도 공사비를 낼 수 없으면 짓지 않고 null을 돌려준다
export function addStation(coord, { population, builtArea, cells }, name = null) {
  return change(null, () => {
    const cost = stationCost();
    if (!canAfford(cost)) return null;
    state.money -= cost;
    const number = state.nextStationNumber;
    state.nextStationNumber += 1;
    const station = {
      id: `s${number}`,
      name: name ?? `역 ${number}`,
      coord,
      angle: 0,
      population,
      builtArea,
      cells,
    };
    state.stations.push(station);
    return station;
  });
}

export function renameStation(id, name) {
  change(`rename-station:${id}`, () => {
    const station = findStation(id);
    if (!station) return null;
    station.name = name;
    return station;
  });
}

// 역을 coord로 옮길 때 드는 돈: 이전 비용 + 이어진 (지은) 선로들이 길어진 만큼의 공사비
// (짧아진 선로는 돌려받지 않는다. 계획 선로는 돈이 들지 않는다)
export function moveStationCost(id, coord) {
  let addedKm = 0;
  let trackCost = 0;
  for (const track of state.tracks) {
    if (track.from !== id && track.to !== id) continue;
    if (track.planned) continue;
    const before = trackCostForCoords(trackCoords(track));
    const from = track.from === id ? coord : findStation(track.from).coord;
    const to = track.to === id ? coord : findStation(track.to).coord;
    const after = trackCostForCoords(shapeCoords([from, ...track.waypoints, to], track.curve));
    addedKm += after.km - before.km;
    trackCost += Math.max(0, after.cost - before.cost);
  }
  return { addedKm, cost: stationMoveFee() + trackCost };
}

// 역을 옮긴다. 새 자리의 주변 인구(estimate)도 함께 바꾼다. 빚 한도 안에서도 낼 수 없으면 null
export function moveStation(id, coord, { population, builtArea, cells }) {
  return change(null, () => {
    const station = findStation(id);
    if (!station) return null;
    const { cost } = moveStationCost(id, coord);
    if (!canAfford(cost)) return null;
    state.money -= cost;
    Object.assign(station, { coord, population, builtArea, cells });
    return station;
  });
}

// 승강장 방향을 직접 정한다 (0~179도). 이제부터는 선로 방향을 따라가지 않는다
export function rotateStation(id, angle) {
  change(`rotate-station:${id}`, () => {
    const station = findStation(id);
    if (!station) return null;
    station.angle = angle;
    return station;
  });
}

// 역을 지우면 그 역에 이어진 선로도 함께 지운다 (끊긴 노선도 지운다)
export function removeStation(id) {
  change(null, () => {
    state.stations = state.stations.filter((station) => station.id !== id);
    state.tracks = state.tracks.filter((track) => track.from !== id && track.to !== id);
    removeBrokenRoutes();
    return true;
  });
}

// ── 선로 ─────────────────────────────

// 역 from에서 경유점들을 지나 역 to까지 선로를 깔고, 깐 선로를 돌려준다. curve: 곡선으로 깔지
// planned: 계획 선로로 그려만 둘지 (돈을 내지 않는다. 나중에 buildPlannedTrack으로 짓는다)
// 빚 한도 안에서도 공사비를 낼 수 없으면 깔지 않고 null을 돌려준다
export function addTrack(from, to, waypoints, curve = false, planned = false) {
  return change(null, () => {
    const coords = shapeCoords([findStation(from).coord, ...waypoints, findStation(to).coord], curve);
    const cost = planned ? 0 : trackCostForCoords(coords).cost;
    if (!canAfford(cost)) return null;
    state.money -= cost;
    const number = state.nextTrackNumber;
    state.nextTrackNumber += 1;
    const track = { id: `t${number}`, from, to, waypoints, curve };
    if (planned) track.planned = true;
    state.tracks.push(track);
    return track;
  });
}

// 경유점을 바꿨을 때 더 내야 하는 공사비 (길어진 만큼만. 짧아지면 0, 계획 선로도 0)
export function rerouteCost(track, waypoints) {
  const before = trackCostForCoords(trackCoords(track));
  const after = trackCostForCoords(
    shapeCoords([findStation(track.from).coord, ...waypoints, findStation(track.to).coord], track.curve),
  );
  return { addedKm: after.km - before.km, cost: track.planned ? 0 : Math.max(0, after.cost - before.cost) };
}

// 직선 ↔ 곡선으로 바꿀 때 더 내야 하는 공사비 (길어진 만큼만. 곡선은 경유점 바깥으로 부풀어 1~2% 길다. 계획 선로는 0)
export function curveChangeCost(track, curve) {
  const before = trackCostForCoords(trackCoords(track));
  const after = trackCostForCoords(trackCoords({ ...track, curve }));
  return { addedKm: after.km - before.km, cost: track.planned ? 0 : Math.max(0, after.cost - before.cost) };
}

// 계획 선로를 지을 때 낼 공사비 (지금 모양 그대로의 공사비 전부)
export function plannedTrackCost(track) {
  return trackCostForCoords(trackCoords(track)).cost;
}

// 계획 선로를 짓는다: 공사비를 내고 진짜 선로가 된다. 빚 한도 안에서도 낼 수 없으면 짓지 않고 null
export function buildPlannedTrack(id) {
  return change(null, () => {
    const track = findTrack(id);
    if (!track?.planned) return null;
    const cost = plannedTrackCost(track);
    if (!canAfford(cost)) return null;
    state.money -= cost;
    delete track.planned;
    return track;
  });
}

// 계획 선로를 모두 지을 때 낼 공사비 합계와 개수
export function allPlannedCost() {
  const planned = state.tracks.filter((track) => track.planned);
  return { count: planned.length, cost: planned.reduce((sum, track) => sum + plannedTrackCost(track), 0) };
}

// 계획 선로를 모두 한꺼번에 짓는다 (되돌리기 한 번으로 모두 계획으로 돌아간다).
// 합계를 빚 한도 안에서도 낼 수 없으면 하나도 짓지 않고 null
export function buildAllPlannedTracks() {
  return change(null, () => {
    const { count, cost } = allPlannedCost();
    if (count === 0 || !canAfford(cost)) return null;
    state.money -= cost;
    for (const track of state.tracks) delete track.planned;
    return count;
  });
}

// 선로를 직선 또는 곡선으로 바꾼다. 빚 한도 안에서도 낼 수 없으면 바꾸지 않고 null
export function setTrackCurve(id, curve) {
  return change(null, () => {
    const track = findTrack(id);
    if (!track) return null;
    const { cost } = curveChangeCost(track, curve);
    if (!canAfford(cost)) return null;
    state.money -= cost;
    track.curve = curve;
    return track;
  });
}

// 선로의 경유점을 바꾼다 (끌어서 옮기기). 빚 한도 안에서도 낼 수 없으면 바꾸지 않고 null
export function setTrackWaypoints(id, waypoints) {
  return change(null, () => {
    const track = findTrack(id);
    if (!track) return null;
    const { cost } = rerouteCost(track, waypoints);
    if (!canAfford(cost)) return null;
    state.money -= cost;
    track.waypoints = waypoints;
    return track;
  });
}

// 선로를 지우면 그 선로가 있어야 하는 노선도 지운다
export function removeTrack(id) {
  change(null, () => {
    state.tracks = state.tracks.filter((track) => track.id !== id);
    removeBrokenRoutes();
    return true;
  });
}

// ── 지우기 미리보기 ────────────────────

// 고른 것을 지우면 함께 사라지는 것. 상태는 고치지 않는다 (지우기 전에 미리 보여줄 때 쓴다)
// selected: { type: 'station' | 'track' | 'route', id }
// 결과: { trackIds: 함께 지워지는 선로 id들, routes: 함께 지워지는 노선들 }
// 역을 지우면 이어진 선로와 그 역·선로를 쓰는 노선이, 선로를 지우면 그 선로를 쓰는 노선이 사라진다
export function removalPreview(selected) {
  if (selected.type === 'route') {
    const route = findRoute(selected.id);
    return { trackIds: [], routes: route ? [route] : [] };
  }
  const trackIds =
    selected.type === 'station'
      ? state.tracks.filter((t) => t.from === selected.id || t.to === selected.id).map((t) => t.id)
      : [selected.id];
  const gone = new Set(trackIds);
  const routes = state.routes.filter(
    (route) =>
      (selected.type === 'station' && route.stations.includes(selected.id)) ||
      routeTracks(route).some((track) => !track || gone.has(track.id)),
  );
  return { trackIds, routes };
}

// ── 안쪽에서만 쓰는 것 ─────────────────

// 역이나 선로가 지워져서 끊긴 노선을 지운다
function removeBrokenRoutes() {
  state.routes = state.routes.filter(
    (route) =>
      route.stations.every((id) => findStation(id)) &&
      routeTracks(route).every((track) => track),
  );
}
