// 게임 상태: 역, 선로 등. 화면 코드와 분리되어 있고,
// 상태가 바뀌면 subscribe로 등록한 함수들을 불러서 화면이 다시 그리게 한다.
import { length, lineString } from '@turf/turf';

const state = {
  // 역 하나 = { id: 's1', name: '역 1', coord: [경도, 위도], angle: 0 }
  // angle: 승강장 방향(도). 0 = 가로, 90 = 세로
  stations: [],
  // 선로 하나 = { id: 't1', from: 역 id, to: 역 id, waypoints: [[경도, 위도], …] }
  // 양 끝은 역 위치를 그대로 쓰고, 경유점만 따로 저장한다
  tracks: [],
  // 다음에 붙일 번호. 지운 번호는 다시 쓰지 않는다
  nextStationNumber: 1,
  nextTrackNumber: 1,
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

// 역을 지우면 그 역에 이어진 선로도 함께 지운다
export function removeStation(id) {
  state.stations = state.stations.filter((station) => station.id !== id);
  state.tracks = state.tracks.filter((track) => track.from !== id && track.to !== id);
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

export function removeTrack(id) {
  state.tracks = state.tracks.filter((track) => track.id !== id);
  notify();
}

// 선로가 지나는 좌표 전체: 출발역 → 경유점들 → 도착역
export function trackCoords(track) {
  return [findStation(track.from).coord, ...track.waypoints, findStation(track.to).coord];
}

// 선로 길이 (km)
export function trackLengthKm(track) {
  return length(lineString(trackCoords(track)), { units: 'kilometers' });
}
