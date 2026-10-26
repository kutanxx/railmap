// 게임 상태: 역 목록 등. 화면 코드와 분리되어 있고,
// 상태가 바뀌면 subscribe로 등록한 함수들을 불러서 화면이 다시 그리게 한다.

const state = {
  // 역 하나 = { id: 's1', name: '역 1', coord: [경도, 위도], angle: 0 }
  // angle: 승강장 방향(도). 0 = 가로, 90 = 세로
  stations: [],
  // 다음에 붙일 역 번호 ("역 1", "역 2" …). 지운 번호는 다시 쓰지 않는다
  nextStationNumber: 1,
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

export function removeStation(id) {
  state.stations = state.stations.filter((station) => station.id !== id);
  notify();
}
