// 노선 고치기: 만들기, 이름·색·열차 수 바꾸기, 역 끼워넣기·빼기, 지우기.
// 모든 바뀜은 state.js의 change()를 거쳐 되돌리기 기록에 남는다.
import { DEFAULT_TRAINS_PER_ROUTE, MAX_TRAINS_PER_ROUTE, MIN_HEADWAY_MINUTES } from '../config.js';
import { getState, change, canAfford, findStation, findTrackBetween, findRoute } from './state.js';
import { routeColorFor, routeNameFor, expressNameAndColor } from './routeColors.js';
import { kindOf, trainSpec } from './routeKinds.js';
import { roundTripMinutes } from './tripFinder.js';

// 노선 번호 (1호선이면 1). 노선 id가 "r번호"라서 이름을 바꿔도 번호는 그대로다
export const routeNumber = (route) => Number(route.id.slice(1));

// 노선을 만들 때 내는 돈: 기본 열차 값 (kind: 'subway' 지하철 | 'express' 광역급행, routeKinds.js)
export function newRouteCost(kind = 'subway') {
  return DEFAULT_TRAINS_PER_ROUTE * trainSpec(kind).trainCost;
}

// 역 id 목록 순서대로 노선을 만들고, 만든 노선을 돌려준다
// 이름과 색은 그 도시의 실제 노선을 차례로 받는다 (서울 "1호선"·남색, 런던 "베이커루선"·갈색 …. 모자라면 "n호선"·추천 색, routeColors.js)
// 기본 열차 값을 빚 한도 안에서 낼 수 없으면 만들지 않고 null을 돌려준다
// kind: 'subway'(지하철) | 'express'(광역급행). 광역급행은 이름·색을 광역급행 목록에서 받는다 (서울 "GTX-A")
export function addRoute(stationIds, kind = 'subway') {
  return change(null, () => {
    const state = getState();
    if (!canAfford(newRouteCost(kind))) return null;
    state.money -= newRouteCost(kind);
    const number = state.nextRouteNumber;
    state.nextRouteNumber += 1;
    const express = kindOf(kind) === 'express';
    const { name, color } = express
      ? expressNameAndColor(number, new Set(state.routes.map((route) => route.name)))
      : { name: routeNameFor(number), color: routeColorFor(number) };
    const route = {
      id: `r${number}`,
      name,
      color,
      stations: stationIds,
      trainCount: DEFAULT_TRAINS_PER_ROUTE,
    };
    // 지하철은 따로 적지 않는다 (예전 저장 파일과 같은 모양)
    if (express) route.kind = 'express';
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

// 열차 수를 바꿀 때 내는 돈: 늘린 대수 × 그 노선 종류의 열차 값 (줄이면 0, 돌려받지 않는다)
export function trainPurchaseCost(route, count) {
  return Math.max(0, count - route.trainCount) * trainSpec(route).trainCost;
}

// 노선 종류를 바꿀 때 내는 돈: 지금 열차들을 새 종류로 바꾸는 값 차이 (더 싼 종류로 바꾸면 0, 돌려받지 않는다)
export function kindChangeCost(route, kind) {
  return Math.max(0, route.trainCount * (trainSpec(kind).trainCost - trainSpec(route).trainCost));
}

// 노선 종류를 바꾼다 (지하철 ↔ 광역급행). 이름·색은 그대로 둔다. 돈이 모자라면 바꾸지 않고 null
export function setRouteKind(id, kind) {
  return change(null, () => {
    const route = findRoute(id);
    if (!route || kindOf(route) === kindOf(kind)) return null;
    const cost = kindChangeCost(route, kind);
    if (!canAfford(cost)) return null;
    getState().money -= cost;
    if (kindOf(kind) === 'express') route.kind = 'express';
    else delete route.kind;
    return route;
  });
}

// 노선을 복제한다: 같은 역 순서로 새 노선을 만든다 (이름·색은 다음 차례, 기본 열차 값을 낸다)
// 급행·완행처럼 비슷한 노선을 여러 개 만들 때 쓴다. 결과: 새 노선, 돈이 모자라면 null
export function duplicateRoute(id) {
  const route = findRoute(id);
  return route ? addRoute([...route.stations], kindOf(route)) : null;
}

// 노선의 역 순서를 바꾼다: from번째 역을 to번째 자리로 옮긴다
// 바뀐 순서에서도 이웃한 역끼리 선로로 바로 이어져 있어야 한다. 결과: 바꿨으면 null, 못 바꾸면 이유(글)
export function moveRouteStop(routeId, from, to) {
  const route = findRoute(routeId);
  if (!route) return '이 노선은 이제 없어요.';
  const stations = [...route.stations];
  const [moved] = stations.splice(from, 1);
  stations.splice(to, 0, moved);
  for (let i = 1; i < stations.length; i++) {
    if (!findTrackBetween(stations[i - 1], stations[i])) {
      const a = findStation(stations[i - 1]).name;
      const b = findStation(stations[i]).name;
      return `${a}과(와) ${b} 사이에 선로가 없어서 그 순서로는 바꿀 수 없어요.`;
    }
  }
  changeRoute(null, routeId, (target) => {
    target.stations = stations;
  });
  return null;
}

// 노선에 넣을 수 있는 최대 열차 수: 배차 간격이 MIN_HEADWAY_MINUTES분보다 짧아지지 않을 만큼 (왕복 시간 ÷ 이 값),
// 짧은 노선도 MAX_TRAINS_PER_ROUTE대까지는 (config.js)
export function maxTrainCount(route) {
  return Math.max(MAX_TRAINS_PER_ROUTE, Math.floor(roundTripMinutes(route) / MIN_HEADWAY_MINUTES));
}

// 노선의 열차 수를 바꾼다 (0 ~ maxTrainCount)
// 늘린 열차 값을 빚 한도 안에서 낼 수 없으면 바꾸지 않고 null을 돌려준다
export function setRouteTrainCount(id, count) {
  return change(null, () => {
    const route = findRoute(id);
    if (!route) return null;
    const next = Math.max(0, Math.min(maxTrainCount(route), count));
    const cost = trainPurchaseCost(route, next);
    if (!canAfford(cost)) return null;
    getState().money -= cost;
    route.trainCount = next;
    return route;
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
  if (!route) return '이 노선은 이제 없어요.';
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
  if (!route) return '이 노선은 이제 없어요.';
  const index = route.stations.indexOf(stationId);
  if (index < 0) return '이 노선에 들어 있지 않은 역이에요.';
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

