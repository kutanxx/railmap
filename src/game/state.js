// 게임 상태: 역, 선로 등. 화면 코드와 분리되어 있고,
// 상태가 바뀌면 subscribe로 등록한 함수들을 불러서 화면이 다시 그리게 한다.
import { length, lineString } from '@turf/turf';
import { ROUTE_COLORS, DEFAULT_TRAINS_PER_ROUTE, MAX_TRAINS_PER_ROUTE } from '../config.js';

const state = {
  // 역 하나 = { id: 's1', name: '역 1', coord: [경도, 위도], angle: 0 }
  // angle: 승강장 방향(도). 0 = 가로, 90 = 세로
  stations: [],
  // 선로 하나 = { id: 't1', from: 역 id, to: 역 id, waypoints: [[경도, 위도], …] }
  // 양 끝은 역 위치를 그대로 쓰고, 경유점만 따로 저장한다
  tracks: [],
  // 노선 하나 = { id: 'r1', name: '1호선', color: '#3F6E9A', stations: [역 id, …], trainCount: 1 }
  // 이웃한 두 역 사이에는 반드시 선로가 있다
  routes: [],
  // 열차 하나 = { id, routeId, distance: 노선 위 위치(km), direction: 1 또는 -1, dwell: 남은 정차 시간(초) }
  // 열차는 sim.js가 노선의 열차 수에 맞춰 만들고 매 프레임 움직인다
  trains: [],
  // 시간 배속 (0 = 멈춤, 1 = 1배, 3 = 3배)
  speed: 1,
  // 게임 시작 뒤 흐른 게임 시간 (초)
  elapsedSeconds: 0,
  // 다음에 붙일 번호. 지운 번호는 다시 쓰지 않는다
  nextStationNumber: 1,
  nextTrackNumber: 1,
  nextRouteNumber: 1,
};

const listeners = new Set();

export function getState() {
  return state;
}

// 상태가 바뀔 때마다 불릴 함수를 등록한다
export function subscribe(listener) {
  listeners.add(listener);
}

function notify() {
  for (const listener of listeners) listener(state);
}

// 시간 배속을 바꾼다
export function setSpeed(speed) {
  state.speed = speed;
  notify();
}

// ── 역 ──────────────────────────────

export function findStation(id) {
  return state.stations.find((station) => station.id === id);
}

// coord 자리에 새 역을 만들고, 만든 역을 돌려준다
export function addStation(coord) {
  const number = state.nextStationNumber;
  state.nextStationNumber += 1;
  const station = { id: `s${number}`, name: `역 ${number}`, coord, angle: 0 };
  state.stations.push(station);
  notify();
  return station;
}

export function renameStation(id, name) {
  const station = findStation(id);
  if (!station) return;
  station.name = name;
  notify();
}

// 승강장 방향을 바꾼다 (0~179도)
export function rotateStation(id, angle) {
  const station = findStation(id);
  if (!station) return;
  station.angle = angle;
  notify();
}

// 역을 지우면 그 역에 이어진 선로도 함께 지운다 (끊긴 노선도 지운다)
export function removeStation(id) {
  state.stations = state.stations.filter((station) => station.id !== id);
  state.tracks = state.tracks.filter((track) => track.from !== id && track.to !== id);
  removeBrokenRoutes();
  notify();
}

// ── 선로 ─────────────────────────────

export function findTrack(id) {
  return state.tracks.find((track) => track.id === id);
}

// 역 from에서 경유점들을 지나 역 to까지 선로를 만들고, 만든 선로를 돌려준다
export function addTrack(from, to, waypoints) {
  const number = state.nextTrackNumber;
  state.nextTrackNumber += 1;
  const track = { id: `t${number}`, from, to, waypoints };
  state.tracks.push(track);
  notify();
  return track;
}

// 선로를 지우면 그 선로가 있어야 하는 노선도 지운다
export function removeTrack(id) {
  state.tracks = state.tracks.filter((track) => track.id !== id);
  removeBrokenRoutes();
  notify();
}

// 두 역을 바로 잇는 선로를 찾는다 (방향은 상관없다). 없으면 undefined
export function findTrackBetween(a, b) {
  return state.tracks.find(
    (track) => (track.from === a && track.to === b) || (track.from === b && track.to === a),
  );
}

// 선로가 지나는 좌표 전체: 출발역 → 경유점들 → 도착역
export function trackCoords(track) {
  return [findStation(track.from).coord, ...track.waypoints, findStation(track.to).coord];
}

// 선로 길이 (km)
export function trackLengthKm(track) {
  return length(lineString(trackCoords(track)), { units: 'kilometers' });
}

// ── 노선 ─────────────────────────────

export function findRoute(id) {
  return state.routes.find((route) => route.id === id);
}

// 역 id 목록 순서대로 노선을 만들고, 만든 노선을 돌려준다
// 이름은 "1호선", "2호선" …, 색은 ROUTE_COLORS를 차례로 돌아가며 받는다
export function addRoute(stationIds) {
  const number = state.nextRouteNumber;
  state.nextRouteNumber += 1;
  const route = {
    id: `r${number}`,
    name: `${number}호선`,
    color: ROUTE_COLORS[(number - 1) % ROUTE_COLORS.length].color,
    stations: stationIds,
    trainCount: DEFAULT_TRAINS_PER_ROUTE,
  };
  state.routes.push(route);
  notify();
  return route;
}

export function renameRoute(id, name) {
  const route = findRoute(id);
  if (!route) return;
  route.name = name;
  notify();
}

export function recolorRoute(id, color) {
  const route = findRoute(id);
  if (!route) return;
  route.color = color;
  notify();
}

// 노선의 열차 수를 바꾼다 (0 ~ MAX_TRAINS_PER_ROUTE)
export function setRouteTrainCount(id, count) {
  const route = findRoute(id);
  if (!route) return;
  route.trainCount = Math.max(0, Math.min(MAX_TRAINS_PER_ROUTE, count));
  notify();
}

export function removeRoute(id) {
  state.routes = state.routes.filter((route) => route.id !== id);
  notify();
}

// 노선이 지나는 선로들 (역 순서대로)
export function routeTracks(route) {
  const tracks = [];
  for (let i = 1; i < route.stations.length; i++) {
    tracks.push(findTrackBetween(route.stations[i - 1], route.stations[i]));
  }
  return tracks;
}

// 노선이 지나는 좌표 전체. 선로가 거꾸로 놓여 있으면 뒤집어서 잇는다
export function routeCoords(route) {
  const coords = [];
  routeTracks(route).forEach((track, i) => {
    let segment = trackCoords(track);
    if (track.from !== route.stations[i]) segment = [...segment].reverse();
    // 이어지는 구간은 첫 점(앞 구간의 끝 역)이 겹치므로 빼고 붙인다
    coords.push(...(i === 0 ? segment : segment.slice(1)));
  });
  return coords;
}

// 노선 전체 길이 (km)
export function routeLengthKm(route) {
  return routeTracks(route).reduce((sum, track) => sum + trackLengthKm(track), 0);
}

// 역이나 선로가 지워져서 끊긴 노선을 지운다
function removeBrokenRoutes() {
  state.routes = state.routes.filter(
    (route) =>
      route.stations.every((id) => findStation(id)) &&
      routeTracks(route).every((track) => track),
  );
}
