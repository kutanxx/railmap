// 노선 고치기: 만들기, 이름·색·열차 수 바꾸기, 역 끼워넣기·빼기, 지우기.
// 모든 바뀜은 state.js의 change()를 거쳐 되돌리기 기록에 남는다.
import { ROUTE_COLORS, DEFAULT_TRAINS_PER_ROUTE, MAX_TRAINS_PER_ROUTE } from '../config.js';
import { getState, change, findStation, findTrackBetween, findRoute } from './state.js';

// 역 id 목록 순서대로 노선을 만들고, 만든 노선을 돌려준다
// 이름은 "1호선", "2호선" …, 색은 ROUTE_COLORS를 차례로 돌아가며 받는다
export function addRoute(stationIds) {
  return change(null, () => {
    const state = getState();
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
    return route;
  });
}

// 노선 하나를 고치는 바뀜들의 공통 모양
function changeRoute(key, id, edit) {
  return change(key, () => {
    const route = findRoute(id);
    if (!route) return null;
    edit(route);
    return route;
  });
}

export function renameRoute(id, name) {
  changeRoute(`rename-route:${id}`, id, (route) => {
    route.name = name;
  });
}

export function recolorRoute(id, color) {
  changeRoute(null, id, (route) => {
    route.color = color;
  });
}

// 노선의 열차 수를 바꾼다 (0 ~ MAX_TRAINS_PER_ROUTE)
export function setRouteTrainCount(id, count) {
  changeRoute(null, id, (route) => {
    route.trainCount = Math.max(0, Math.min(MAX_TRAINS_PER_ROUTE, count));
  });
}

export function removeRoute(id) {
  change(null, () => {
    const state = getState();
    state.routes = state.routes.filter((route) => route.id !== id);
    return true;
  });
}

// 노선에 역을 끼워넣는다. 선로로 이어지는 자리(맨 앞, 맨 뒤, 두 역 사이)를 알아서 찾는다
// 결과: 넣었으면 null, 못 넣으면 이유(글)
export function insertStationIntoRoute(routeId, stationId) {
  const route = findRoute(routeId);
  if (route.stations.includes(stationId)) return '이미 이 노선에 들어 있는 역이에요.';

  const stops = route.stations;
  const linked = (a) => Boolean(findTrackBetween(a, stationId));
  let position = -1;
  // 두 역 사이에 끼울 수 있는 자리를 먼저 찾고, 없으면 끝에 붙인다
  for (let i = 0; i < stops.length - 1 && position < 0; i++) {
    if (linked(stops[i]) && linked(stops[i + 1])) position = i + 1;
  }
  if (position < 0 && linked(stops[stops.length - 1])) position = stops.length;
  if (position < 0 && linked(stops[0])) position = 0;
  if (position < 0) {
    return `${findStation(stationId).name}은(는) 이 노선의 역과 선로로 이어져 있지 않아요. 먼저 [선로]로 이어주세요.`;
  }

  changeRoute(null, routeId, (target) => {
    target.stations.splice(position, 0, stationId);
  });
  return null;
}

// 노선에서 역을 뺀다
// 결과: 뺐으면 null, 못 빼면 이유(글)
export function removeStationFromRoute(routeId, stationId) {
  const route = findRoute(routeId);
  const index = route.stations.indexOf(stationId);
  if (route.stations.length <= 2) return '노선에는 역이 2개 이상 있어야 해요. 노선 자체를 지우려면 [노선 삭제]를 누르세요.';
  // 가운데 역을 빼려면 앞뒤 역이 선로로 바로 이어져 있어야 한다
  const isMiddle = index > 0 && index < route.stations.length - 1;
  if (isMiddle) {
    const before = route.stations[index - 1];
    const after = route.stations[index + 1];
    if (!findTrackBetween(before, after)) {
      return `${findStation(before).name}과(와) ${findStation(after).name} 사이에 선로가 없어서 뺄 수 없어요.`;
    }
  }
  changeRoute(null, routeId, (target) => {
    target.stations.splice(index, 1);
  });
  return null;
}

