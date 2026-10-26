// 게임 화면의 중심: 화면 상태(도구, 선택), 패널과 도구 만들기, 다시 그리기, 애니메이션, 저장 버튼.
// 지도 위 클릭·마우스·키보드 처리는 mapInput.js, 선로 끌기는 trackEditor.js가 맡는다.
import { REGION_NAME } from '../config.js';
import { addStationLayers, updateStations } from '../map/stationLayers.js';
import {
  addTrackLayers,
  updateTracks,
  addDraftLayers,
  updateDraft,
  addHandleLayers,
} from '../map/trackLayers.js';
import { addTrainLayers, updateTrains } from '../map/trainLayers.js';
import { updateStationLabels } from '../map/stationLabels.js';
import {
  getState,
  subscribe,
  setSpeed,
  findStation,
  renameStation,
  rotateStation,
  removeStation,
  addTrack,
  removeTrack,
  trackCoords,
  findTrackBetween,
  resetGame,
  routeCoords,
} from '../game/state.js';
import {
  addRoute,
  renameRoute,
  recolorRoute,
  setRouteTrainCount,
  removeRoute,
  removeStationFromRoute,
} from '../game/routes.js';
import { syncTrains, stepSimulation, trainFeatures } from '../game/sim.js';
import { trackCostForCoords } from '../game/economy.js';
import { updateEconomy, getEconomy } from '../game/demand.js';
import { startAutosave, exportToFile, importFromFile } from '../game/save.js';
import { renderBadge } from './badge.js';
import { createToolbar } from './toolbar.js';
import { createSpeedControl } from './speedControl.js';
import { createPanel } from './panel.js';
import { createTrackTool } from './trackTool.js';
import { createRouteTool } from './routeTool.js';
import { createRoutePanel } from './routePanel.js';
import { infoPanelView, routePanelView, routeColors, highlightedTracks } from './views.js';
import { createStatus } from './status.js';
import { createCursorTip } from './cursorTip.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';
import { createFileMenu } from './fileMenu.js';
import { bindMapInput } from './mapInput.js';
import { createTrackEditor } from './trackEditor.js';

export function startApp(map, loadMessage) {
  // 화면 상태: 게임 상태가 아니라 지금 고른 도구, 선택한 것, 진행 중인 편집
  const ui = {
    tool: 'select',
    selected: null, // { type: 'station' | 'track' | 'route', id } 또는 null
    insertingInto: null, // 역을 끼워넣는 중인 노선 id
    routeMessage: '', // 노선 패널에 보여줄 안내
    trackPreview: null, // 끌어서 고치는 중인 선로 { id, waypoints }
  };

  // 공사비가 자금보다 많으면 모자란 금액을 알려주는 글, 아니면 null
  const shortfall = (cost) => {
    const { money } = getState();
    return cost > money ? `자금이 ${formatMoney(cost - money)} 모자라요` : null;
  };
  // 화면 가운데 말풍선 알림
  const notice = (text, tone = 'info') => showCallout(map, map.getCenter().toArray(), text, tone);

  // 고른 것을 바꾼다. 노선 편집 상태는 다른 것을 고르면 끝난다
  function select(next) {
    if (next?.type !== 'route' || next.id !== ui.selected?.id) {
      ui.insertingInto = null;
      ui.routeMessage = '';
    }
    ui.selected = next;
  }

  const toolbar = createToolbar(document.getElementById('toolbar'), (toolId) => {
    ui.tool = toolId;
    select(null); // 도구를 바꾸면 선택도 푼다
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

  const panel = createPanel(document.getElementById('panel'), {
    onRename: (id, name) => renameStation(id, name),
    onRotate: (id, angle) => rotateStation(id, angle),
    onDeleteStation: (id) => {
      select(null);
      removeStation(id);
    },
    onDeleteTrack: (id) => {
      select(null);
      removeTrack(id);
    },
  });

  const routePanel = createRoutePanel(document.getElementById('routes'), {
    onSelect: (id) => {
      select({ type: 'route', id });
      render();
    },
    onRename: (id, name) => renameRoute(id, name),
    onRecolor: (id, color) => recolorRoute(id, color),
    onTrainCount: (id, count) => setRouteTrainCount(id, count),
    onDelete: (id) => {
      select(null);
      removeRoute(id);
    },
    // 노선에서 역 빼기: 못 빼면 이유를 패널에 보여준다
    onRemoveStation: (routeId, stationId) => {
      ui.routeMessage = removeStationFromRoute(routeId, stationId) ?? '';
      render();
    },
    // [역 끼워넣기]: 켜면 지도에서 역을 클릭해 넣는다 (mapInput.js가 처리)
    onToggleInsert: (routeId) => {
      ui.insertingInto = ui.insertingInto === routeId ? null : routeId;
      ui.routeMessage = ui.insertingInto ? '노선에 넣을 역을 지도에서 클릭하세요. (Esc로 끝내기)' : '';
      render();
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
      select({ type: 'track', id: track.id });
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
      select({ type: 'route', id: route.id });
      render();
      // 노선 가운데쯤 역 위에 개통 말풍선을 띄운다
      const middle = stationIds[Math.floor(stationIds.length / 2)];
      showCallout(map, findStation(middle).coord, `${route.name} 개통`);
    },
  });

  // 선로만 다시 그린다 (선로를 끄는 동안 매 마우스 움직임마다 부르므로 가볍게)
  function renderTracks() {
    const { tracks, routes } = getState();
    const { trackColor } = routeColors(routes);
    const preview = ui.trackPreview;
    updateTracks(
      map,
      tracks.map((track) => ({
        id: track.id,
        coords: trackCoords(preview?.id === track.id ? { ...track, waypoints: preview.waypoints } : track),
        routeColor: trackColor.get(track.id) ?? null,
      })),
      highlightedTracks(ui.selected),
    );
    trackEditor.showHandles();
  }

  // 상태를 읽어서 화면 전체를 다시 그린다 (열차는 아래 애니메이션에서 따로 그린다)
  function render() {
    const { stations, routes, speed, money, year, month } = getState();
    const { stationColors } = routeColors(routes);

    renderBadge(document.getElementById('badge'), { year, month, region: REGION_NAME });
    status.show({ money, net: getEconomy().net });
    toolbar.setActive(ui.tool);
    speedControl.setActive(speed);
    renderTracks();
    updateStations(map, stations, ui.selected?.type === 'station' ? ui.selected.id : null);
    updateStationLabels(map, stations, stationColors);
    panel.show(infoPanelView(ui.selected));
    routePanel.show(
      routePanelView({
        selected: ui.selected,
        tool: ui.tool,
        draft: routeTool.getDraft(),
        routes,
        inserting: ui.insertingInto !== null,
        message: ui.routeMessage,
      }),
    );
    map.getCanvas().style.cursor = ui.tool === 'select' ? '' : 'crosshair';
  }

  // 지도 입력과 선로 끌기가 함께 쓰는 것들
  const ctx = { map, ui, select, render, renderTracks, trackTool, routeTool, cursorTip, shortfall, notice };
  const trackEditor = createTrackEditor(ctx);

  // 그리는 순서: 선로 → 역 → 열차 → 미리보기 → 선로 손잡이 (나중에 추가한 것이 위에 보인다)
  addTrackLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addDraftLayers(map);
  addHandleLayers(map);

  // 상태가 바뀌면: 열차를 노선에 맞추고 → 수입·운영비를 다시 계산하고 → 화면을 다시 그린다
  let trainsChanged = true;
  subscribe(() => {
    syncTrains();
    trainsChanged = true;
  });
  subscribe(updateEconomy);
  subscribe(render);
  // 불러온 게임이 있으면 그 노선에 맞춰 열차를 놓고 수입을 계산한 뒤 그린다
  syncTrains();
  updateEconomy();
  render();

  bindMapInput(ctx);

  // ── 저장: 자동 저장, 내보내기·불러오기·새로 시작 ──
  startAutosave((problem) => notice(problem, 'bad'));
  if (loadMessage) notice(loadMessage.text, loadMessage.tone);

  // 불러오기·새로 시작 뒤에는 고르던 것과 그리던 것을 모두 놓는다
  const clearWork = () => {
    select(null);
    trackTool.cancel();
    routeTool.cancel();
  };
  createFileMenu(document.getElementById('file-menu'), {
    onExport: exportToFile,
    onImport: (file) => {
      importFromFile(file)
        .then(() => {
          clearWork();
          render();
          notice('저장 파일을 불러왔어요');
        })
        .catch((error) => notice(error.message, 'bad'));
    },
    onReset: () => {
      clearWork();
      resetGame();
      notice('새 게임을 시작해요');
    },
  });

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
}
