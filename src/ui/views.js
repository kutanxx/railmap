// 게임 상태를 읽어서 패널과 지도에 보여줄 내용으로 바꾸는 함수들.
// 상태를 고치지 않고 읽기만 한다.
import {
  findStation,
  findTrack,
  findRoute,
  routeTracks,
  routeLengthKm,
  trackLengthKm,
  trackCoords,
} from '../game/state.js';
import { getEconomy } from '../game/demand.js';
import { removalPreview } from '../game/build.js';
import { trackCostForCoords } from '../game/economy.js';
import { trackProfile } from '../game/trackProfile.js';
import { routeNumber } from '../game/routes.js';

const stationNames = (ids) => ids.map((id) => findStation(id).name);
const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

// 오른쪽 위 패널 (고른 역 또는 선로). 고른 게 없거나 지워졌으면 null
// shapes: stationShapes()의 결과 (화면에 보이는 승강장 방향, 선로를 따르는지)
export function infoPanelView(selected, shapes) {
  if (selected?.type === 'station') {
    const station = findStation(selected.id);
    if (!station) return null;
    // 패널에는 이웃 역과 나눈 뒤의 인구와 하루 이용객을 보여준다
    const { stationPopulation, stationRiders } = getEconomy();
    const shared = stationPopulation.get(station.id) ?? station.population;
    return {
      type: 'station',
      station,
      sharedPopulation: shared,
      riders: stationRiders.get(station.id) ?? 0,
      averageRiders: averageStationRiders(),
      angle: shapes.get(station.id)?.angle ?? station.angle,
      followsTrack: shapes.get(station.id)?.followsTrack ?? false,
      removal: removalText(selected),
    };
  }
  if (selected?.type === 'track') {
    const track = findTrack(selected.id);
    if (!track) return null;
    return {
      type: 'track',
      track: {
        id: track.id,
        lengthKm: trackLengthKm(track),
        ...pick(trackCostForCoords(trackCoords(track)), ['bridgeKm', 'tunnelKm']),
        fromName: findStation(track.from).name,
        toName: findStation(track.to).name,
        waypointCount: track.waypoints.length,
      },
      removal: removalText(selected),
    };
  }
  return null;
}

// 역·선로를 지우면 함께 사라지는 것을 패널 삭제 버튼 아래에 적을 글
function removalText(selected) {
  const { trackIds, routes } = removalPreview(selected);
  const lost = [];
  if (selected.type === 'station' && trackIds.length > 0) lost.push(`선로 ${trackIds.length}개`);
  if (routes.length > 0) lost.push(`노선 ${routes.length}개(${routes.map((r) => r.name).join(', ')})`);
  if (lost.length === 0) return '지워도 다른 것은 그대로예요.';
  return `지우면 ${lost.join('와 ')}도 함께 사라져요. 버튼에 마우스를 올리면 지도에 빨갛게 보여요.`;
}

// 화면 아래 종단면도 (ui/profilePanel.js): 고른 선로나 노선의 높이 분석. 고른 게 없으면 null
export function profilePanelView(selected) {
  if (selected?.type === 'track') {
    const track = findTrack(selected.id);
    if (!track) return null;
    return {
      title: `${findStation(track.from).name} ↔ ${findStation(track.to).name}`,
      parts: [trackProfile(trackCoords(track))],
    };
  }
  if (selected?.type === 'route') {
    const route = findRoute(selected.id);
    if (!route) return null;
    // 노선을 따라 역 순서대로: 선로가 반대 방향으로 놓였으면 뒤집어서 잇는다
    const parts = routeTracks(route).map((track, i) => {
      const coords = trackCoords(track);
      return trackProfile(track.from === route.stations[i] ? coords : [...coords].reverse());
    });
    return { title: route.name, parts };
  }
  return null;
}

// 노선 패널 (새 노선 안내, 고른 노선, 노선 목록)
export function routePanelView({ selected, tool, draft, routes, inserting, message }) {
  const route = selected?.type === 'route' ? findRoute(selected.id) : null;
  const { routeRevenue, routeRiders, routeAvgKm, routeLoad, routeLost } = getEconomy();
  return {
    tool,
    inserting,
    message,
    draft: draft && { stationNames: stationNames(draft.stations), message: draft.message },
    routes: routes.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      number: routeNumber(r),
      lengthKm: routeLengthKm(r),
      revenue: routeRevenue.get(r.id) ?? 0,
      riders: routeRiders.get(r.id) ?? 0,
      load: routeLoad.get(r.id) ?? 0,
    })),
    selected: route && {
      id: route.id,
      name: route.name,
      color: route.color,
      number: routeNumber(route),
      lengthKm: routeLengthKm(route),
      stops: route.stations.map((id) => ({ id, name: findStation(id).name })),
      trainCount: route.trainCount,
      revenue: routeRevenue.get(route.id) ?? 0,
      riders: routeRiders.get(route.id) ?? 0,
      avgKm: routeAvgKm.get(route.id) ?? 0,
      load: routeLoad.get(route.id) ?? 0,
      lost: routeLost.get(route.id) ?? 0,
    },
  };
}

// 승객이 있는 역들의 하루 이용객 평균 (역 패널에서 비교용)
function averageStationRiders() {
  const served = [...getEconomy().stationRiders.values()].filter((riders) => riders > 0);
  return served.length > 0 ? served.reduce((sum, riders) => sum + riders, 0) / served.length : 0;
}

// 노선 색: 선로마다 지나는 노선 중 먼저 만든 노선의 색
// 역마다 지나는 노선 전부 [{ color, number }] (역 말풍선의 노선 번호 배지)
export function routeColors(routes) {
  const trackColor = new Map();
  const stationRoutes = new Map();
  for (const route of routes) {
    for (const track of routeTracks(route)) {
      if (!trackColor.has(track.id)) trackColor.set(track.id, route.color);
    }
    for (const id of new Set(route.stations)) {
      const list = stationRoutes.get(id) ?? [];
      list.push({ color: route.color, number: routeNumber(route) });
      stationRoutes.set(id, list);
    }
  }
  return { trackColor, stationRoutes };
}

// 노란색으로 강조할 선로: 고른 선로 하나, 또는 고른 노선의 선로 전부
export function highlightedTracks(selected) {
  const ids = new Set();
  if (selected?.type === 'track') ids.add(selected.id);
  if (selected?.type === 'route') {
    const route = findRoute(selected.id);
    if (route) for (const track of routeTracks(route)) ids.add(track.id);
  }
  return ids;
}
