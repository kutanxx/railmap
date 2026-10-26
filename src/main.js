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
import { addStationLayers, updateStations, stationIdAt } from './map/stationLayers.js';
import {
  addTrackLayers,
  updateTracks,
  trackIdAt,
  addDraftLayers,
  updateDraft,
} from './map/trackLayers.js';
import { addTrainLayers, updateTrains } from './map/trainLayers.js';
import { updateStationLabels } from './map/stationLabels.js';
import {
  getState,
  subscribe,
  setSpeed,
  findStation,
  addStation,
  renameStation,
  rotateStation,
  removeStation,
  addTrack,
  removeTrack,
  trackCoords,
  findTrackBetween,
  addRoute,
  renameRoute,
  recolorRoute,
  setRouteTrainCount,
  removeRoute,
  routeCoords,
} from './game/state.js';
import { syncTrains, stepSimulation, trainFeatures } from './game/sim.js';
import { stationCost, trackCostForCoords } from './game/economy.js';
import { updateEconomy, getEconomy } from './game/demand.js';
import { estimatePopulation } from './map/population.js';
import { renderBadge } from './ui/badge.js';
import { createToolbar } from './ui/toolbar.js';
import { createSpeedControl } from './ui/speedControl.js';
import { createPanel } from './ui/panel.js';
import { createTrackTool } from './ui/trackTool.js';
import { createRouteTool } from './ui/routeTool.js';
import { createRoutePanel } from './ui/routePanel.js';
import { infoPanelView, routePanelView, routeColors, highlightedTracks } from './ui/views.js';
import { createStatus } from './ui/status.js';
import { createCursorTip } from './ui/cursorTip.js';
import { showCallout } from './ui/callouts.js';
import { formatMoney } from './ui/format.js';

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
    cursorTip.hide();
    // 클릭으로 무언가를 놓는 도구에서는 빠른 두 번 클릭이 확대로 바뀌지 않게 한다
    if (toolId === 'select') map.doubleClickZoom.enable();
    else map.doubleClickZoom.disable();
    render();
  });

  const speedControl = createSpeedControl(document.getElementById('speed'), setSpeed);
  const status = createStatus(document.getElementById('status'));
  const cursorTip = createCursorTip(document.getElementById('cursor-tip'));

  // 공사비가 자금보다 많으면 모자란 금액을 알려주는 글, 아니면 null
  const shortfall = (cost) => {
    const { money } = getState();
    return cost > money ? `자금이 ${formatMoney(cost - money)} 모자라요` : null;
  };

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
    onTrainCount: (id, count) => setRouteTrainCount(id, count),
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
      if (!track) {
        const coords = [findStation(from).coord, ...waypoints, findStation(to).coord];
        const { cost } = trackCostForCoords(coords);
        showCallout(map, findStation(to).coord, shortfall(cost), 'bad');
        return false;
      }
      selected = { type: 'track', id: track.id };
      render();
      return true;
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
      // 노선 가운데쯤 역 위에 개통 말풍선을 띄운다
      const middle = stationIds[Math.floor(stationIds.length / 2)];
      showCallout(map, findStation(middle).coord, `${route.name} 개통`);
    },
  });

  // 상태를 읽어서 화면 전체를 다시 그린다 (열차는 아래 애니메이션에서 따로 그린다)
  function render() {
    const { stations, tracks, routes, speed, money, year, month } = getState();
    const { trackColor, stationColors } = routeColors(routes);

    renderBadge(document.getElementById('badge'), { year, month, region: REGION_NAME });
    status.show({ money, net: getEconomy().net });
    toolbar.setActive(currentTool);
    speedControl.setActive(speed);
    updateTracks(
      map,
      tracks.map((track) => ({
        id: track.id,
        coords: trackCoords(track),
        routeColor: trackColor.get(track.id) ?? null,
      })),
      highlightedTracks(selected),
    );
    updateStations(map, stations, selected?.type === 'station' ? selected.id : null);
    updateStationLabels(map, stations, stationColors);
    panel.show(infoPanelView(selected));
    routePanel.show(
      routePanelView({ selected, tool: currentTool, draft: routeTool.getDraft(), routes }),
    );
    map.getCanvas().style.cursor = currentTool === 'select' ? '' : 'crosshair';
  }

  // 그리는 순서: 선로 → 역 → 열차 → 그리는 중인 미리보기 (나중에 추가한 것이 위에 보인다)
  addTrackLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addDraftLayers(map);

  // 상태가 바뀌면: 열차를 노선에 맞추고 → 수입·운영비를 다시 계산하고 → 화면을 다시 그린다
  let trainsChanged = true;
  subscribe(() => {
    syncTrains();
    trainsChanged = true;
  });
  subscribe(updateEconomy);
  subscribe(render);
  render();

  // ── 애니메이션: 매 프레임 시간을 흘리고 열차를 다시 그린다 ──
  let lastFrame = performance.now();
  function frame(now) {
    // 탭을 오래 비웠다 돌아와도 열차가 순간이동하지 않게 한 프레임은 최대 0.1초로 친다
    const realSeconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const { speed, trains } = getState();
    // 시간이 흐르면 달력·정산을 위해 매 프레임 계산하지만,
    // 열차를 다시 그리는 건 움직이는 열차가 있거나 열차가 바뀌었을 때만 한다 (지도가 쉴 수 있게)
    stepSimulation(realSeconds * speed);
    if ((speed > 0 && trains.length > 0) || trainsChanged) {
      updateTrains(map, trainFeatures());
      trainsChanged = false;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

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
      const station = addStation(coord, estimatePopulation(map, coord));
      if (station) selected = { type: 'station', id: station.id };
      else showCallout(map, coord, shortfall(stationCost()), 'bad');
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
      // 그리는 중이면 지금까지의 길이와 예상 공사비를 마우스 옆에 보여준다
      const coords = trackTool.previewCoords();
      if (coords) {
        const { km, cost } = trackCostForCoords(coords);
        const problem = shortfall(cost);
        const text = `${km.toFixed(2)} km · 공사비 ${formatMoney(cost)}`;
        cursorTip.show(event.point.x, event.point.y, problem ? `${text} · ${problem}` : text, problem ? 'bad' : 'info');
      } else {
        cursorTip.hide();
      }
    } else if (currentTool === 'station') {
      // 역을 놓을 자리에 예상 공사비를 보여준다
      if (stationId) {
        cursorTip.hide();
      } else {
        const problem = shortfall(stationCost());
        const text = `역 공사비 ${formatMoney(stationCost())}`;
        cursorTip.show(event.point.x, event.point.y, problem ? `${text} · ${problem}` : text, problem ? 'bad' : 'info');
      }
    } else if (currentTool === 'route') {
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
    } else if (currentTool === 'select') {
      // 역이나 선로 위에 올리면 손가락 모양으로 바꾼다
      const onSomething = stationId || trackIdAt(map, event.point);
      map.getCanvas().style.cursor = onSomething ? 'pointer' : '';
    }
  });

  // 마우스가 지도 밖으로 나가면 안내를 숨긴다
  map.on('mouseout', () => cursorTip.hide());

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
