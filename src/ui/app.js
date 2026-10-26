// 게임 화면의 중심: 화면 상태(도구, 선택), 패널과 도구 만들기, 다시 그리기, 상태 바뀜 연결.
// 나눠 맡은 곳: 지도 클릭·마우스·키보드 mapInput.js, 선로 끌기 trackEditor.js, 역 끌기 stationMover.js,
// 공사비 안내 costText.js, 저장 버튼·파산 창 saveControls.js, 매 프레임 애니메이션 animation.js, 경고 warnings.js
import { REGION_NAME, BANKRUPT_GRACE_MONTHS } from '../config.js';
import {
  addStationLayers,
  updateStations,
  addCatchmentLayer,
  updateCatchment,
} from '../map/stationLayers.js';
import {
  addTrackLayers,
  updateTracks,
  addDraftLayers,
  updateDraft,
  addHandleLayers,
} from '../map/trackLayers.js';
import { addTrainLayers } from '../map/trainLayers.js';
import { addPassageLayers, addExitLayers } from '../map/exitLayers.js';
import { updateStationLabels } from '../map/stationLabels.js';
import {
  getState,
  subscribe,
  setSpeed,
  findStation,
  findTrackBetween,
  routeCoords,
  monthlyInterest,
} from '../game/state.js';
import {
  renameStation,
  rotateStation,
  removeStation,
  addTrack,
  removeTrack,
} from '../game/build.js';
import {
  addRoute,
  renameRoute,
  recolorRoute,
  setRouteTrainCount,
  removeRoute,
  removeStationFromRoute,
  newRouteCost,
  trainPurchaseCost,
} from '../game/routes.js';
import { syncTrains } from '../game/sim.js';
import { trackCostForCoords } from '../game/economy.js';
import { updateEconomy, getEconomy } from '../game/demand.js';
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
import { bindMapInput } from './mapInput.js';
import { createWarnings } from './warnings.js';
import { shortfall, costNote } from './costText.js';
import { bindSaveControls } from './saveControls.js';
import { startAnimation } from './animation.js';
import { createStationMover } from './stationMover.js';
import { stationShapes } from './stationShapes.js';
import { stationBands } from './stationBands.js';
import { createStationExits } from './stationExits.js';
import { createTrackEditor } from './trackEditor.js';

export function startApp(map, loadMessage) {
  // 화면 상태: 게임 상태가 아니라 지금 고른 도구, 선택한 것, 진행 중인 편집
  const ui = {
    tool: 'select',
    selected: null, // { type: 'station' | 'track' | 'route', id } 또는 null
    insertingInto: null, // 역을 끼워넣는 중인 노선 id
    routeMessage: '', // 노선 패널에 보여줄 안내
    trackPreview: null, // 끌어서 고치는 중인 선로 { id, waypoints }
    stationPreview: null, // 끌어서 옮기는 중인 역 { id, coord }
    hover: null, // 역 놓기 도구에서 마우스가 있는 자리 [경도, 위도]
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
    // 열차를 늘릴 돈이 모자라면 이유를 알려준다
    onTrainCount: (id, count) => {
      if (setRouteTrainCount(id, count)) return;
      const route = getState().routes.find((r) => r.id === id);
      notice(shortfall(trainPurchaseCost(route, count)), 'bad');
    },
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
      if (!route) {
        // 기본 열차 값을 낼 돈이 모자라면 고르던 역을 그대로 두고 이유를 알려준다
        notice(`${shortfall(newRouteCost())} (열차 값)`, 'bad');
        return false;
      }
      select({ type: 'route', id: route.id });
      render();
      // 노선 가운데쯤 역 위에 개통 말풍선을 띄운다
      const middle = stationIds[Math.floor(stationIds.length / 2)];
      showCallout(map, findStation(middle).coord, `${route.name} 개통`);
    },
  });

  // 끌고 있는 역은 끄는 자리에 있는 것처럼 보여준다
  const shownCoord = (station) =>
    ui.stationPreview?.id === station.id ? ui.stationPreview.coord : station.coord;
  const shownStations = () =>
    getState().stations.map((station) =>
      ui.stationPreview?.id === station.id ? { ...station, coord: ui.stationPreview.coord } : station,
    );

  // 선로만 다시 그린다 (선로를 끄는 동안 매 마우스 움직임마다 부르므로 가볍게)
  // 끌고 있는 경유점·역이 있으면 그 모양대로 그린다
  function renderTracks() {
    const { tracks, routes } = getState();
    const { trackColor } = routeColors(routes);
    const preview = ui.trackPreview;
    const coordsOf = (track) => [
      shownCoord(findStation(track.from)),
      ...(preview?.id === track.id ? preview.waypoints : track.waypoints),
      shownCoord(findStation(track.to)),
    ];
    updateTracks(
      map,
      tracks.map((track) => ({
        id: track.id,
        coords: coordsOf(track),
        routeColor: trackColor.get(track.id) ?? null,
      })),
      highlightedTracks(ui.selected),
    );
    trackEditor.showHandles();
  }

  // 역 출구 (stationExits.js): 역 모양이 바뀌었거나, 지도를 움직여 새 역이 보일 때 찾는다
  // 끌어서 옮기는 중인 역은 출구를 숨긴다
  let stationExits = null;
  let lastBands = null; // 마지막으로 그린 역들과 그 모양
  function updateStationExits() {
    if (stationExits && lastBands) {
      stationExits.update(lastBands.stations, lastBands.bands, ui.stationPreview?.id);
    }
  }

  // 상태를 읽어서 화면 전체를 다시 그린다 (열차는 아래 애니메이션에서 따로 그린다)
  function render() {
    const { routes, speed, money, year, month, monthsOverDebtLimit, bankrupt } = getState();
    const stations = shownStations();
    const { stationColors } = routeColors(routes);
    // 승강장 방향(선로 따라 자동), 환승역·종착역, 가까이서 보이는 띠·대합실 모양
    const shapes = stationShapes(stations, getState().tracks, routes);
    const bands = stationBands(stations, getState().tracks, routes, shapes);
    lastBands = { stations, bands };

    renderBadge(document.getElementById('badge'), { year, month, region: REGION_NAME });
    const economy = getEconomy();
    status.show({
      money,
      net: economy.net - monthlyInterest(),
      riders: economy.dailyRiders,
      monthsLeft:
        monthsOverDebtLimit > 0 && !bankrupt ? BANKRUPT_GRACE_MONTHS - monthsOverDebtLimit : null,
    });
    bankruptDialog.show({ bankrupt, year, month, money });
    toolbar.setActive(ui.tool);
    speedControl.setActive(speed);
    renderTracks();
    updateStations(map, stations, ui.selected?.type === 'station' ? ui.selected.id : null, shapes, bands);
    updateStationExits();
    // 500m 원: 역 놓기 도구면 마우스 자리, 아니면 고른 역 둘레
    const selectedStation = ui.selected?.type === 'station' ? findStation(ui.selected.id) : null;
    const selectedCoord = selectedStation ? shownCoord(selectedStation) : null;
    updateCatchment(map, ui.tool === 'station' ? ui.hover : selectedCoord);
    updateStationLabels(map, stations, stationColors, economy.stationRiders, shapes);
    panel.show(infoPanelView(ui.selected, shapes));
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

  // 혼잡·빚 경고 말풍선 (warnings.js)
  const warnings = createWarnings(map, notice);

  // ── 저장: 자동 저장, 내보내기·불러오기·새로 시작, 파산 창 (saveControls.js) ──
  // 불러오기·새로 시작 뒤에는 고르던 것과 그리던 것을 모두 놓는다
  const clearWork = () => {
    select(null);
    trackTool.cancel();
    routeTool.cancel();
  };
  const { bankruptDialog } = bindSaveControls({ notice, loadMessage, clearWork, render });

  // 지도 입력과 선로·역 끌기가 함께 쓰는 것들
  const ctx = {
    map,
    ui,
    select,
    render,
    renderTracks,
    trackTool,
    routeTool,
    cursorTip,
    shortfall,
    costNote,
    notice,
  };
  const trackEditor = createTrackEditor(ctx);
  createStationMover(ctx);

  // 그리는 순서: 역세권 원 → 선로 → 출구 통로 → 역 → 열차 → 출구 배지 → 미리보기 → 선로 손잡이
  // (나중에 추가한 것이 위에 보인다)
  addCatchmentLayer(map);
  addTrackLayers(map);
  addPassageLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addExitLayers(map);
  addDraftLayers(map);
  addHandleLayers(map);
  stationExits = createStationExits(map);
  // 지도를 움직이고 타일을 다 불러오면, 새로 보이는 역의 출구를 찾는다
  map.on('idle', updateStationExits);

  // ── 애니메이션: 매 프레임 시간을 흘리고 열차를 다시 그린다 (animation.js) ──
  const animation = startAnimation(map);

  // 상태가 바뀌면: 열차를 노선에 맞추고 → 수입·운영비를 다시 계산하고 → 화면을 다시 그린다
  subscribe(() => {
    syncTrains();
    animation.markTrainsChanged();
  });
  subscribe(updateEconomy);
  subscribe(() => warnings.crowding());
  subscribe(warnings.debt);
  subscribe(render);
  // 불러온 게임이 있으면 그 노선에 맞춰 열차를 놓고 수입을 계산한 뒤 그린다
  syncTrains();
  updateEconomy();
  warnings.crowding({ silent: true });
  render();

  bindMapInput(ctx);
}
