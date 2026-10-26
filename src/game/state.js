// 게임 상태: 역, 선로, 노선, 돈, 날짜. 화면 코드와 분리되어 있고,
// 상태가 바뀌면 subscribe로 등록한 함수들을 불러서 화면이 다시 그리게 한다.
// 플레이어가 바꾼 것은 모두 change()를 거쳐서 되돌리기 기록에 남는다.
import { length, lineString } from '@turf/turf';
import {
  START_MONEY,
  START_YEAR,
  START_MONTH,
} from '../config.js';
import { stationCost, trackCostForCoords } from './economy.js';
import { createHistory } from './history.js';

const state = {
  // 역 하나 = { id: 's1', name: '역 1', coord: [경도, 위도], angle: 0, population, builtArea, cells }
  // angle: 승강장 방향(도). 0 = 가로, 90 = 세로
  // population: 반경 안 전체 인구 (이웃 역과 나누기 전), builtArea: 반경 안 건물 면적 ㎡ (못 쟀으면 null)
  // cells: 반경 안 건물 면적을 칸마다 적은 것 [[경도, 위도, 면적㎡], …] (못 쟀으면 null)
  //        이웃 역과 인구를 나눌 때 쓴다 (game/catchment.js)
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
  // 자금 (억 원)
  money: START_MONEY,
  // 지금 날짜와 이번 달이 얼마나 지났는지 (0 ~ 1)
  year: START_YEAR,
  month: START_MONTH,
  monthProgress: 0,
  // 지난달 정산 결과 { revenue, opex, net } (아직 없으면 null)
  lastSettlement: null,
  // 다음에 붙일 번호. 지운 번호는 다시 쓰지 않는다
  nextStationNumber: 1,
  nextTrackNumber: 1,
  nextRouteNumber: 1,
};

const listeners = new Set();
const history = createHistory();

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

// ── 되돌리기 ───────────────────────────
// "철도망" = 플레이어가 지은 것과 그에 쓴 돈. 되돌리기는 이것만 바꾸고 날짜·시간은 그대로 둔다

function snapshotNetwork() {
  return structuredClone({
    stations: state.stations,
    tracks: state.tracks,
    routes: state.routes,
    nextStationNumber: state.nextStationNumber,
    nextTrackNumber: state.nextTrackNumber,
    nextRouteNumber: state.nextRouteNumber,
    money: state.money,
  });
}

function restoreNetwork(snapshot) {
  const copy = structuredClone(snapshot);
  state.stations = copy.stations;
  state.tracks = copy.tracks;
  state.routes = copy.routes;
  state.nextStationNumber = copy.nextStationNumber;
  state.nextTrackNumber = copy.nextTrackNumber;
  state.nextRouteNumber = copy.nextRouteNumber;
}

// 플레이어의 바뀜 하나를 실행하고 되돌리기 기록에 남긴다 (game 폴더 안에서만 쓴다)
// action이 null을 돌려주면 (예: 자금 부족) 아무것도 바뀌지 않은 것으로 보고 기록하지 않는다
// key가 같은 바뀜이 이어지면 한 번으로 합친다 (예: 이름을 한 글자씩 칠 때)
export function change(key, action) {
  const before = snapshotNetwork();
  const result = action();
  if (result === null) return null;
  history.record(key, before, snapshotNetwork());
  notify();
  return result;
}

// 되돌리기: 그때 쓴 공사비는 돌려받고, 그 뒤로 번 돈은 그대로 둔다
export function undo() {
  const entry = history.undo();
  if (!entry) return false;
  const spent = entry.after.money - entry.before.money;
  restoreNetwork(entry.before);
  state.money -= spent;
  notify();
  return true;
}

// 다시 하기: 되돌릴 때 돌려받은 공사비를 다시 낸다
export function redo() {
  const entry = history.redo();
  if (!entry) return false;
  const spent = entry.after.money - entry.before.money;
  restoreNetwork(entry.after);
  state.money += spent;
  notify();
  return true;
}

// ── 시간 ──────────────────────────────

// 시간 배속을 바꾼다
export function setSpeed(speed) {
  state.speed = speed;
  notify();
}

// 한 달을 마무리한다: 수입 − 운영비를 자금에 더하고 날짜를 한 달 넘긴다
export function settleMonth(revenue, opex) {
  const net = revenue - opex;
  state.money += net;
  state.lastSettlement = { revenue, opex, net };
  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
  }
  notify();
}

// ── 저장과 불러오기 ─────────────────────

const SAVE_VERSION = 1;

// 저장할 내용 (열차 위치는 저장하지 않고, 불러올 때 노선에 맞춰 새로 놓는다)
export function saveData() {
  return {
    version: SAVE_VERSION,
    network: snapshotNetwork(),
    speed: state.speed,
    elapsedSeconds: state.elapsedSeconds,
    year: state.year,
    month: state.month,
    monthProgress: state.monthProgress,
    lastSettlement: state.lastSettlement,
  };
}

// 저장한 내용을 불러온다. 형식이 맞지 않으면 이유를 담은 에러를 던진다
export function loadData(data) {
  const network = data?.network;
  if (data?.version !== SAVE_VERSION || !network) {
    throw new Error('레일맵 저장 파일이 아니거나, 지원하지 않는 버전이에요.');
  }
  for (const key of ['stations', 'tracks', 'routes']) {
    if (!Array.isArray(network[key])) throw new Error(`저장 파일에 ${key} 목록이 없어요.`);
  }
  restoreNetwork(network);
  state.money = network.money;
  state.trains = [];
  state.speed = data.speed;
  state.elapsedSeconds = data.elapsedSeconds;
  state.year = data.year;
  state.month = data.month;
  state.monthProgress = data.monthProgress;
  state.lastSettlement = data.lastSettlement;
  history.clear();
  notify();
}

// 처음 상태로 돌아간다
export function resetGame() {
  restoreNetwork({
    stations: [],
    tracks: [],
    routes: [],
    nextStationNumber: 1,
    nextTrackNumber: 1,
    nextRouteNumber: 1,
  });
  state.trains = [];
  state.money = START_MONEY;
  state.speed = 1;
  state.elapsedSeconds = 0;
  state.year = START_YEAR;
  state.month = START_MONTH;
  state.monthProgress = 0;
  state.lastSettlement = null;
  history.clear();
  notify();
}

// ── 역 ──────────────────────────────

export function findStation(id) {
  return state.stations.find((station) => station.id === id);
}

// coord 자리에 새 역을 짓고, 지은 역을 돌려준다
// 자금이 공사비보다 모자라면 짓지 않고 null을 돌려준다
export function addStation(coord, { population, builtArea, cells }) {
  return change(null, () => {
    const cost = stationCost();
    if (state.money < cost) return null;
    state.money -= cost;
    const number = state.nextStationNumber;
    state.nextStationNumber += 1;
    const station = {
      id: `s${number}`,
      name: `역 ${number}`,
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

// 승강장 방향을 바꾼다 (0~179도)
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

export function findTrack(id) {
  return state.tracks.find((track) => track.id === id);
}

// 역 from에서 경유점들을 지나 역 to까지 선로를 깔고, 깐 선로를 돌려준다
// 자금이 공사비보다 모자라면 깔지 않고 null을 돌려준다
export function addTrack(from, to, waypoints) {
  return change(null, () => {
    const coords = [findStation(from).coord, ...waypoints, findStation(to).coord];
    const { cost } = trackCostForCoords(coords);
    if (state.money < cost) return null;
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

// 선로의 경유점을 바꾼다 (끌어서 옮기기). 자금이 모자라면 바꾸지 않고 null
export function setTrackWaypoints(id, waypoints) {
  return change(null, () => {
    const track = findTrack(id);
    if (!track) return null;
    const { cost } = rerouteCost(track, waypoints);
    if (state.money < cost) return null;
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
