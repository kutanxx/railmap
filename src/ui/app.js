// 게임 화면의 중심: 화면 상태(도구, 선택), 패널과 도구 만들기, 다시 그리기, 상태 바뀜 연결.
// 나눠 맡은 곳: 지도 클릭·마우스·키보드 mapInput.js, 선로 끌기 trackEditor.js, 역 끌기 stationMover.js,
// 공사비 안내 costText.js, 저장 버튼·파산 창 saveControls.js, 매 프레임 애니메이션 animation.js, 경고 warnings.js,
// 선로 그리기 trackView.js, 노선 패널 연결 routeControls.js, [선로]·[노선] 도구 drawingTools.js,
// 혼잡도·지형·소리 버튼 viewToggles.js, 튜토리얼 tutorial.js, 종단면도 profilePanel.js
import { BANKRUPT_GRACE_MONTHS } from '../config.js';
import { getRegion } from '../game/region.js';
import {
  addStationLayers,
  updateStations,
  addCatchmentLayer,
  updateCatchment,
} from '../map/stationLayers.js';
import { addTrackLayers, addDraftLayers, addHandleLayers } from '../map/trackLayers.js';
import { addTrainLayers } from '../map/trainLayers.js';
import { addPassageLayers, addExitLayers } from '../map/exitLayers.js';
import { updateStationLabels, arrangeStationLabels } from '../map/stationLabels.js';
import { getState, subscribe, setSpeed, findStation, monthlyInterest } from '../game/state.js';
import { renameStation, rotateStation, removeStation, removeTrack } from '../game/build.js';
import { removeRoute } from '../game/routes.js';
import { syncTrains } from '../game/sim.js';
import { setWaterTest, trackProfile } from '../game/trackProfile.js';
import { waterAt, waterVersion } from '../map/water.js';
import { updateEconomy, getEconomy } from '../game/demand.js';
import { renderBadge } from './badge.js';
import { createToolbar } from './toolbar.js';
import { createSpeedControl } from './speedControl.js';
import { createPanel } from './panel.js';
import { createRouteControls } from './routeControls.js';
import { drawTracks } from './trackView.js';
import { infoPanelView, routePanelView, profilePanelView, routeColors } from './views.js';
import { createStatus } from './status.js';
import { createCursorTip } from './cursorTip.js';
import { showCallout } from './callouts.js';
import { createDrawingTools } from './drawingTools.js';
import { createViewToggles } from './viewToggles.js';
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
import { createHelpCard } from './helpCard.js';
import { createTutorial } from './tutorial.js';
import { hasTerrain, terrainGrid } from '../game/terrain.js';
import { addContourLayers } from '../map/contours.js';
import { createProfilePanel } from './profilePanel.js';

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
    removing: null, // 삭제 버튼에 마우스를 올려서 지도에 미리 보여줄 것 { type, id } 또는 null
    congestion: false, // 혼잡도 보기: 켜면 선로를 구간 혼잡도 색으로 칠한다
    terrain: false, // 지형 보기: 켜면 등고선이 보인다 (땅 높이가 있는 가상 지도만)
  };

  // 물 위(한강 등)를 지나는 선로는 교량 공사비를 받는다. 물 모양은 지도에서 읽는다
  setWaterTest(
    (points) => waterAt(map, points),
    () => waterVersion(map),
  );

  // 화면 가운데 말풍선 알림
  const notice = (text, tone = 'info') => showCallout(map, map.getCenter().toArray(), text, tone);

  // 고른 것을 바꾼다. 노선 편집 상태는 다른 것을 고르면 끝난다
  function select(next) {
    if (next?.type !== 'route' || next.id !== ui.selected?.id) {
      ui.insertingInto = null;
      ui.routeMessage = '';
    }
    ui.selected = next;
    ui.removing = null;
  }

  // 삭제 버튼에 마우스를 올리면 고른 것을 지울 때 사라질 선로·노선을 지도에 빨갛게 보여준다
  const previewDelete = (on) => {
    ui.removing = on ? ui.selected : null;
    renderTracks();
  };

  // 도구 바꾸기 (도구 버튼, 숫자키 1~4)
  function chooseTool(toolId) {
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
  }
  const toolbar = createToolbar(document.getElementById('toolbar'), chooseTool);

  // 고른 역·선로·노선 지우기 (패널의 삭제 버튼, Delete 키)
  function deleteSelected() {
    const selected = ui.selected;
    if (!selected) return;
    select(null);
    if (selected.type === 'station') removeStation(selected.id);
    if (selected.type === 'track') removeTrack(selected.id);
    if (selected.type === 'route') removeRoute(selected.id);
  }

  const speedControl = createSpeedControl(document.getElementById('speed'), setSpeed);
  // 튜토리얼 (처음 온 사람에게 저절로) 과 조작 안내 카드 ([?])
  const tutorial = createTutorial(document.getElementById('tutorial'));
  createHelpCard(document.getElementById('help'), document.getElementById('help-button'), {
    onTutorial: tutorial.start,
  });
  // [혼잡도 보기]·[지형]·[소리] 버튼 (viewToggles.js)
  const toggles = createViewToggles({ map, ui, render });
  const status = createStatus(document.getElementById('status'));
  // 화면 아래 종단면도 (땅 높이가 있는 가상 지도만): 선로를 그리는 중이면 그리는 선로, 아니면 고른 선로·노선
  const profilePanel = createProfilePanel(document.getElementById('profile'));
  const showDraftProfile = (coords) => {
    if (hasTerrain()) profilePanel.show({ title: '새 선로 (그리는 중)', parts: [trackProfile(coords)] });
  };

  const cursorTip = createCursorTip(document.getElementById('cursor-tip'));

  const panel = createPanel(document.getElementById('panel'), {
    onRename: (id, name) => renameStation(id, name),
    onRotate: (id, angle) => rotateStation(id, angle),
    onDeleteStation: deleteSelected,
    onDeleteTrack: deleteSelected,
    onDeletePreview: previewDelete,
  });

  // [선로]·[노선] 그리기 도구 (drawingTools.js)
  const { trackTool, routeTool } = createDrawingTools({ map, select, render, notice });

  // 오른쪽 노선 패널 (routeControls.js)
  const routePanel = createRouteControls(document.getElementById('routes'), {
    ui,
    select,
    render,
    notice,
    routeTool,
    deleteSelected,
    previewDelete,
  });

  // 끌고 있는 역은 끄는 자리에 있는 것처럼 보여준다
  const shownCoord = (station) =>
    ui.stationPreview?.id === station.id ? ui.stationPreview.coord : station.coord;
  const shownStations = () =>
    getState().stations.map((station) =>
      ui.stationPreview?.id === station.id ? { ...station, coord: ui.stationPreview.coord } : station,
    );

  // 선로만 다시 그린다 (선로를 끄는 동안 매 마우스 움직임마다 부르므로 가볍게, trackView.js)
  function renderTracks() {
    drawTracks(map, ui, shownCoord);
    trackEditor.showHandles();
  }

  // 역 출구 (stationExits.js): 역 모양이 바뀌었거나, 지도를 움직여 새 역이 보일 때 찾는다
  // 끌어서 옮기는 중인 역은 출구를 숨긴다. 그다음 역 말풍선을 출구를 덮지 않는 쪽으로 옮긴다
  let stationExits = null;
  let lastBands = null; // 마지막으로 그린 역들과 그 모양
  function updateStationExits() {
    if (stationExits && lastBands) {
      stationExits.update(lastBands.stations, lastBands.bands, ui.stationPreview?.id);
      arrangeStationLabels(map, stationExits.coords());
    }
  }

  // 상태를 읽어서 화면 전체를 다시 그린다 (열차는 아래 애니메이션에서 따로 그린다)
  function render() {
    const { routes, speed, money, year, month, monthsOverDebtLimit, bankrupt } = getState();
    const stations = shownStations();
    const { stationRoutes } = routeColors(routes);
    // 승강장 방향(선로 따라 자동), 환승역·종착역, 가까이서 보이는 띠·대합실 모양
    const shapes = stationShapes(stations, getState().tracks, routes);
    const bands = stationBands(stations, getState().tracks, routes, shapes);
    lastBands = { stations, bands };

    renderBadge(document.getElementById('badge'), { year, month, region: getRegion().name });
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
    toggles.show();
    speedControl.setActive(speed);
    renderTracks();
    updateStations(map, stations, ui.selected?.type === 'station' ? ui.selected.id : null, shapes, bands);
    // 500m 원: 역 놓기 도구면 마우스 자리, 아니면 고른 역 둘레
    const selectedStation = ui.selected?.type === 'station' ? findStation(ui.selected.id) : null;
    const selectedCoord = selectedStation ? shownCoord(selectedStation) : null;
    updateCatchment(map, ui.tool === 'station' ? ui.hover : selectedCoord);
    updateStationLabels(map, stations, stationRoutes, economy.stationRiders, shapes, selectedStation?.id ?? null);
    updateStationExits();
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
    // 선로를 그리는 동안은 mapInput.js가 그리는 선로의 종단면도를 보여준다
    if (!trackTool.isDrawing()) profilePanel.show(hasTerrain() ? profilePanelView(ui.selected) : null);
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
    chooseTool,
    deleteSelected,
    toggleCongestion: toggles.toggleCongestion,
    toggleTerrain: toggles.toggleTerrain,
    toggleSound: toggles.toggleSound,
    showDraftProfile,
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

  // 그리는 순서: 등고선 → 역세권 원 → 선로 → 출구 통로 → 역 → 열차 → 출구 배지 → 미리보기 → 선로 손잡이
  // (나중에 추가한 것이 위에 보인다)
  if (hasTerrain()) addContourLayers(map, terrainGrid());
  addCatchmentLayer(map);
  addTrackLayers(map);
  addPassageLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addExitLayers(map);
  addDraftLayers(map);
  addHandleLayers(map);
  stationExits = createStationExits(map);
  // 지도를 움직이고 타일을 다 불러오면, 새로 보이는 역의 출구를 찾고 말풍선 자리를 다시 고른다
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
