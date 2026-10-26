// 게임 상태를 읽어서 패널과 지도에 보여줄 내용으로 바꾸는 함수들.
// 상태를 고치지 않고 읽기만 한다.
import {
  findStation,
  findTrack,
  findRoute,
  routeTracks,
  routeLengthKm,
  trackLengthKm,
} from '../game/state.js';

const stationNames = (ids) => ids.map((id) => findStation(id).name);

// 오른쪽 위 패널 (고른 역 또는 선로). 고른 게 없거나 지워졌으면 null
export function infoPanelView(selected) {
  if (selected?.type === 'station') {
    const station = findStation(selected.id);
    return station ? { type: 'station', station } : null;
  }
  if (selected?.type === 'track') {
    const track = findTrack(selected.id);
    if (!track) return null;
    return {
      type: 'track',
      track: {
        id: track.id,
        lengthKm: trackLengthKm(track),
        fromName: findStation(track.from).name,
        toName: findStation(track.to).name,
        waypointCount: track.waypoints.length,
      },
    };
  }
  return null;
}

// 노선 패널 (새 노선 안내, 고른 노선, 노선 목록)
export function routePanelView({ selected, tool, draft, routes }) {
  const route = selected?.type === 'route' ? findRoute(selected.id) : null;
  return {
    tool,
    draft: draft && { stationNames: stationNames(draft.stations), message: draft.message },
    routes: routes.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      lengthKm: routeLengthKm(r),
    })),
    selected: route && {
      id: route.id,
      name: route.name,
      color: route.color,
      lengthKm: routeLengthKm(route),
      stationNames: stationNames(route.stations),
      trainCount: route.trainCount,
    },
  };
}

// 노선 색: 선로마다 지나는 노선 중 먼저 만든 노선의 색, 역마다 지나는 노선 색 전부
export function routeColors(routes) {
  const trackColor = new Map();
  const stationColors = new Map();
  for (const route of routes) {
    for (const track of routeTracks(route)) {
      if (!trackColor.has(track.id)) trackColor.set(track.id, route.color);
    }
    for (const id of route.stations) {
      const colors = stationColors.get(id) ?? [];
      if (!colors.includes(route.color)) colors.push(route.color);
      stationColors.set(id, colors);
    }
  }
  return { trackColor, stationColors };
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
