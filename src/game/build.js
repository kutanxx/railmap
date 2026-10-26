// 역과 선로 짓기·고치기: 역 짓기·이름·옮기기·방향·지우기, 선로 깔기·경유점 바꾸기·지우기.
// 모든 바뀜은 state.js의 change()를 거쳐 되돌리기 기록에 남는다.
// 공사비는 빚 한도 안에서만 낼 수 있다 (canAfford).
import { stationCost, stationMoveFee, trackCostForCoords } from './economy.js';
import {
  getState,
  change,
  canAfford,
  findStation,
  findTrack,
  trackCoords,
  routeTracks,
} from './state.js';

const state = getState();

// ── 역 ──────────────────────────────

// coord 자리에 새 역을 짓고, 지은 역을 돌려준다
// 빚 한도 안에서도 공사비를 낼 수 없으면 짓지 않고 null을 돌려준다
export function addStation(coord, { population, builtArea, cells }) {
  return change(null, () => {
    const cost = stationCost();
    if (!canAfford(cost)) return null;
    state.money -= cost;
    const number = state.nextStationNumber;
    state.nextStationNumber += 1;
    const station = {
      id: `s${number}`,
      name: `역 ${number}`,
      coord,
      angle: 0,
      autoAngle: true,
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

// 역을 coord로 옮길 때 드는 돈: 이전 비용 + 이어진 선로들이 길어진 만큼의 공사비
// (짧아진 선로는 돌려받지 않는다)
export function moveStationCost(id, coord) {
  let addedKm = 0;
  let trackCost = 0;
  for (const track of state.tracks) {
    if (track.from !== id && track.to !== id) continue;
    const before = trackCostForCoords(trackCoords(track));
    const from = track.from === id ? coord : findStation(track.from).coord;
    const to = track.to === id ? coord : findStation(track.to).coord;
    const after = trackCostForCoords([from, ...track.waypoints, to]);
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
    station.autoAngle = false;
    return station;
  });
}

// 승강장 방향을 다시 선로 방향에 맡긴다
export function setStationAutoAngle(id) {
  change(null, () => {
    const station = findStation(id);
    if (!station) return null;
    station.autoAngle = true;
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

// 역 from에서 경유점들을 지나 역 to까지 선로를 깔고, 깐 선로를 돌려준다
// 빚 한도 안에서도 공사비를 낼 수 없으면 깔지 않고 null을 돌려준다
export function addTrack(from, to, waypoints) {
  return change(null, () => {
    const coords = [findStation(from).coord, ...waypoints, findStation(to).coord];
    const { cost } = trackCostForCoords(coords);
    if (!canAfford(cost)) return null;
    state.money -= cost;
    const number = state.nextTrackNumber;
    state.nextTrackNumber += 1;
    const track = { id: `t${number}`, from, to, waypoints };
    state.tracks.push(track);
    return track;
  });
}

// 경유점을 바꿨을 때 더 내야 하는 공사비 (길어진 만큼만. 짧아지면 0)
export function rerouteCost(track, waypoints) {
  const before = trackCostForCoords(trackCoords(track));
  const after = trackCostForCoords([
    findStation(track.from).coord,
    ...waypoints,
    findStation(track.to).coord,
  ]);
  return { addedKm: after.km - before.km, cost: Math.max(0, after.cost - before.cost) };
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

// ── 안쪽에서만 쓰는 것 ─────────────────

// 역이나 선로가 지워져서 끊긴 노선을 지운다
function removeBrokenRoutes() {
  state.routes = state.routes.filter(
    (route) =>
      route.stations.every((id) => findStation(id)) &&
      routeTracks(route).every((track) => track),
  );
}
