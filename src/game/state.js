// 게임 상태: 역, 선로, 노선, 돈, 날짜. 화면 코드와 분리되어 있고,
// 상태가 바뀌면 subscribe로 등록한 함수들을 불러서 화면이 다시 그리게 한다.
// 플레이어가 바꾼 것은 모두 change()를 거쳐서 되돌리기 기록에 남는다.
// 이 파일: 상태, 되돌리기, 시간과 정산, 역·선로·노선 찾기.
// 바꾸는 함수는 따로 있다: 역·선로는 build.js, 노선은 routes.js, 저장은 save.js
import { length, lineString } from '@turf/turf';
import {
  START_MONEY,
  START_YEAR,
  START_MONTH,
  DEBT_INTEREST_PER_MONTH,
  DEBT_LIMIT,
  BANKRUPT_GRACE_MONTHS,
} from '../config.js';
import { createHistory } from './history.js';

const state = {
  // 역 하나 = { id: 's1', name: '역 1', coord: [경도, 위도], angle: 0, population, builtArea, cells }
  // angle: 선로가 없을 때 승강장 방향(도). 0 = 가로, 90 = 세로. 선로가 이어지면 선로를 따른다 (ui/stationShapes.js)
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
  // 지난달 정산 결과 { revenue, opex, interest, net } (아직 없으면 null)
  lastSettlement: null,
  // 자금이 빚 한도(DEBT_LIMIT)보다 낮은 채로 이어진 달 수. BANKRUPT_GRACE_MONTHS가 되면 파산
  monthsOverDebtLimit: 0,
  // 파산했는지. 파산하면 시간이 멈추고 아무것도 지을 수 없다
  bankrupt: false,
  // 다음에 붙일 번호. 지운 번호는 다시 쓰지 않는다
  nextStationNumber: 1,
  nextTrackNumber: 1,
  nextRouteNumber: 1,
};

const listeners = new Set();
const history = createHistory();

// 되돌리기 기록을 모두 지운다 (불러오기·새로 시작 때. game 폴더 안에서만 쓴다)
export function clearHistory() {
  history.clear();
}

export function getState() {
  return state;
}

// 상태가 바뀔 때마다 불릴 함수를 등록한다
export function subscribe(listener) {
  listeners.add(listener);
}

// (game 폴더 안에서만 쓴다)
export function notify() {
  for (const listener of listeners) listener(state);
}

// ── 되돌리기 ───────────────────────────
// "철도망" = 플레이어가 지은 것과 그에 쓴 돈. 되돌리기는 이것만 바꾸고 날짜·시간은 그대로 둔다

// (game 폴더 안에서만 쓴다: 저장할 때)
export function snapshotNetwork() {
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

// (game 폴더 안에서만 쓴다: 불러올 때)
export function restoreNetwork(snapshot) {
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
  // 파산하면 더는 아무것도 바꿀 수 없다
  if (state.bankrupt) return null;
  const before = snapshotNetwork();
  const result = action();
  if (result === null) return null;
  history.record(key, before, snapshotNetwork());
  notify();
  return result;
}

// 되돌리기: 그때 쓴 공사비는 돌려받고, 그 뒤로 번 돈은 그대로 둔다
export function undo() {
  if (state.bankrupt) return false;
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
  if (state.bankrupt) return false;
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
  if (state.bankrupt) return;
  state.speed = speed;
  notify();
}

// 이 공사비를 낼 수 있는지: 자금이 모자라도 빚 한도(DEBT_LIMIT)까지는 빚을 내서 지을 수 있다
export function canAfford(cost) {
  return state.money - cost >= DEBT_LIMIT;
}

// 빚이 있으면 이번 달에 낼 이자 (억 원)
export function monthlyInterest() {
  return state.money < 0 ? -state.money * DEBT_INTEREST_PER_MONTH : 0;
}

// 한 달을 마무리한다: 수입 − 운영비 − 이자를 자금에 더하고 날짜를 한 달 넘긴다
// 빚이 한도보다 깊은 달이 BANKRUPT_GRACE_MONTHS만큼 이어지면 파산한다
export function settleMonth(revenue, opex) {
  const interest = monthlyInterest();
  const net = revenue - opex - interest;
  state.money += net;
  state.lastSettlement = { revenue, opex, interest, net };
  state.monthsOverDebtLimit = state.money < DEBT_LIMIT ? state.monthsOverDebtLimit + 1 : 0;
  if (state.monthsOverDebtLimit >= BANKRUPT_GRACE_MONTHS) {
    state.bankrupt = true;
    state.speed = 0;
  }
  state.month += 1;
  if (state.month > 12) {
    state.month = 1;
    state.year += 1;
  }
  notify();
}

// ── 찾기: 역 ────────────────────────────

export function findStation(id) {
  return state.stations.find((station) => station.id === id);
}

// ── 찾기: 선로 ───────────────────────────

export function findTrack(id) {
  return state.tracks.find((track) => track.id === id);
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

// ── 찾기: 노선 ───────────────────────────

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

