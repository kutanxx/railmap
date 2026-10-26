// 시작점: 지도와 화면 요소를 연결만 한다
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// 지도 타일을 뒤에서 처리하는 작업 파일(워커). Vite가 이 파일을 고치지 않도록
// 원본 글자 그대로 받아와서 브라우저 안의 임시 주소(blob)로 만들어 MapLibre에 알려준다
import mapWorkerCode from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';
import './style.css';

import {
  START_CENTER,
  START_ZOOM,
  BASE_STYLE_URL,
  REGION_NAME,
  START_YEAR,
  START_MONTH,
} from './config.js';
import { loadBeigeStyle } from './map/style.js';
import {
  addStationLayers,
  updateStations,
  stationIdAt,
  addTrackLayers,
  updateTracks,
  trackIdAt,
  addDraftLayers,
  updateDraft,
} from './map/layers.js';
import { updateStationLabels } from './map/stationLabels.js';
import {
  getState,
  subscribe,
  findStation,
  addStation,
  renameStation,
  rotateStation,
  removeStation,
  findTrack,
  addTrack,
  removeTrack,
  trackCoords,
  trackLengthKm,
  findTrackBetween,
  findRoute,
  addRoute,
  renameRoute,
  recolorRoute,
  removeRoute,
  routeTracks,
  routeCoords,
  routeLengthKm,
} from './game/state.js';
import { renderBadge } from './ui/badge.js';
import { createToolbar } from './ui/toolbar.js';
import { createPanel } from './ui/panel.js';
import { createTrackTool } from './ui/trackTool.js';
import { createRouteTool } from './ui/routeTool.js';
import { createRoutePanel } from './ui/routePanel.js';

renderBadge(document.getElementById('badge'), {
  year: START_YEAR,
  month: START_MONTH,
  region: REGION_NAME,
});

const workerBlob = new Blob([mapWorkerCode], { type: 'text/javascript' });
setWorkerUrl(URL.createObjectURL(workerBlob));

const style = await loadBeigeStyle(BASE_STYLE_URL);

const map = new MapLibreMap({
  container: 'map',
  style,
  center: START_CENTER,
  zoom: START_ZOOM,
});

// 지도가 다 준비된 뒤에 도구와 패널을 연결한다 (그 전에 누르면 그릴 곳이 없다)
map.on('load', () => {
  // 화면 상태: 게임 상태가 아니라 지금 고른 도구와 선택한 것
  let currentTool = 'select';
  let selected = null; // { type: 'station' | 'track' | 'route', id } 또는 null

  const toolbar = createToolbar(document.getElementById('toolbar'), (toolId) => {
    currentTool = toolId;
    selected = null; // 도구를 바꾸면 선택도 푼다
    // 도구를 바꾸면 그리던 선로·고르던 노선은 취소
    trackTool.cancel();
    routeTool.cancel();
    // 클릭으로 무언가를 놓는 도구에서는 빠른 두 번 클릭이 확대로 바뀌지 않게 한다
    if (toolId === 'select') map.doubleClickZoom.enable();
    else map.doubleClickZoom.disable();
    render();
  });

  const panel = createPanel(document.getElementById('panel'), {
    onRename: (id, name) => renameStation(id, name),
    onRotate: (id, angle) => rotateStation(id, angle),
    onDeleteStation: (id) => {
      selected = null;
      removeStation(id);
    },
    onDeleteTrack: (id) => {
      selected = null;
      removeTrack(id);
    },
  });

  const routePanel = createRoutePanel(document.getElementById('routes'), {
    onSelect: (id) => {
      selected = { type: 'route', id };
      render();
    },
    onRename: (id, name) => renameRoute(id, name),
    onRecolor: (id, color) => recolorRoute(id, color),
    onDelete: (id) => {
      selected = null;
      removeRoute(id);
    },
    onFinishDraft: () => routeTool.finish(),
    onCancelDraft: () => routeTool.cancel(),
  });

  const trackTool = createTrackTool({
    onChange: (draft) => updateDraft(map, draft),
    onComplete: (from, to, waypoints) => {
      const track = addTrack(from, to, waypoints);
      selected = { type: 'track', id: track.id };
      render();
    },
  });

  const routeTool = createRouteTool({
    // 앞 역과 다음 역 사이에 선로가 없으면 이유를 알려준다
    checkLink: (from, to) =>
      findTrackBetween(from, to)
        ? null
        : `${findStation(from).name}과(와) ${findStation(to).name} 사이에 선로가 없어요. [선로] 도구로 먼저 이어주세요.`,
    onChange: () => {
      // 고른 역들을 잇는 선로를 점선으로 미리 보여준다
      const draft = routeTool.getDraft();
      updateDraft(
        map,
        draft && {
          coords: routeCoords({ stations: draft.stations }),
          waypoints: draft.stations.map((id) => findStation(id).coord),
          cursor: null,
        },
      );
      render();
    },
    onComplete: (stationIds) => {
      const route = addRoute(stationIds);
      selected = { type: 'route', id: route.id };
      render();
    },
  });

  // 선택한 역·선로를 오른쪽 위 패널에 보여줄 내용으로 바꾼다. 없거나 지워졌으면 null
  function panelView() {
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

  // 노선 패널에 보여줄 내용
  function routePanelView(routes) {
    const route = selected?.type === 'route' ? findRoute(selected.id) : null;
    const draft = routeTool.getDraft();
    const stationNames = (ids) => ids.map((id) => findStation(id).name);
    return {
      tool: currentTool,
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
      },
    };
  }

  // 상태를 읽어서 화면 전체를 다시 그린다
  function render() {
    const { stations, tracks, routes } = getState();

    // 노선 색: 선로마다 지나는 노선 중 먼저 만든 노선의 색, 역마다 지나는 노선 색 전부
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

    // 노란색으로 강조할 선로: 고른 선로 하나, 또는 고른 노선의 선로 전부
    const highlighted = new Set();
    if (selected?.type === 'track') highlighted.add(selected.id);
    if (selected?.type === 'route') {
      const route = findRoute(selected.id);
      if (route) for (const track of routeTracks(route)) highlighted.add(track.id);
    }

    toolbar.setActive(currentTool);
    updateTracks(
      map,
      tracks.map((track) => ({
        id: track.id,
        coords: trackCoords(track),
        routeColor: trackColor.get(track.id) ?? null,
      })),
      highlighted,
    );
    updateStations(map, stations, selected?.type === 'station' ? selected.id : null);
    updateStationLabels(map, stations, stationColors);
    panel.show(panelView());
    routePanel.show(routePanelView(routes));
    map.getCanvas().style.cursor = currentTool === 'select' ? '' : 'crosshair';
  }

  // 그리는 순서: 선로 → 역 → 그리는 중인 미리보기 (나중에 추가한 것이 위에 보인다)
  addTrackLayers(map);
  addStationLayers(map);
  addDraftLayers(map);
  subscribe(render);
  render();

  map.on('click', (event) => {
    const coord = event.lngLat.toArray();
    const stationId = stationIdAt(map, event.point);

    if (currentTool === 'track') {
      if (stationId) trackTool.clickStation(stationId, findStation(stationId).coord);
      else trackTool.clickEmpty(coord);
      return;
    }
    if (currentTool === 'route') {
      if (stationId) routeTool.clickStation(stationId);
      return;
    }

    if (stationId) {
      // 어느 도구든 기존 역을 누르면 그 역을 고른다
      selected = { type: 'station', id: stationId };
    } else if (currentTool === 'station') {
      selected = { type: 'station', id: addStation(coord).id };
    } else {
      const trackId = trackIdAt(map, event.point);
      selected = trackId ? { type: 'track', id: trackId } : null;
    }
    render();
  });

  map.on('mousemove', (event) => {
    const stationId = stationIdAt(map, event.point);

    if (currentTool === 'track') {
      // 역 위에 올리면 미리보기 끝을 역 한가운데에 붙인다
      const cursor = stationId ? findStation(stationId).coord : event.lngLat.toArray();
      trackTool.moveCursor(cursor);
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
    } else if (currentTool === 'route') {
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
    } else if (currentTool === 'select') {
      // 역이나 선로 위에 올리면 손가락 모양으로 바꾼다
      const onSomething = stationId || trackIdAt(map, event.point);
      map.getCanvas().style.cursor = onSomething ? 'pointer' : '';
    }
  });

  // Esc: 그리던 것 취소 (그리는 중이 아니면 선택 해제)
  // Backspace: 마지막 경유점·역 빼기, Enter: 노선 완성
  document.addEventListener('keydown', (event) => {
    // 패널의 이름 칸에 글자를 치는 중이면 건드리지 않는다
    if (event.target instanceof HTMLInputElement) return;

    if (event.key === 'Escape') {
      if (trackTool.isDrawing()) trackTool.cancel();
      else if (routeTool.isDrawing()) routeTool.cancel();
      else {
        selected = null;
        render();
      }
    } else if (event.key === 'Backspace') {
      if (trackTool.isDrawing()) trackTool.undoWaypoint();
      else if (routeTool.isDrawing()) routeTool.undoStation();
      else return;
      event.preventDefault();
    } else if (event.key === 'Enter' && routeTool.isDrawing()) {
      routeTool.finish();
    }
  });
});
