// 게임 화면의 중심: 화면 상태(도구, 선택), 패널과 도구 만들기, 다시 그리기, 상태 바뀜 연결.
// 나눠 맡은 곳: 지도 클릭·마우스·키보드 mapInput.js, 선로 끌기 trackEditor.js, 역 끌기 stationMover.js,
// 공사비 안내 costText.js, 저장 버튼·파산 창 saveControls.js, 매 프레임 애니메이션 animation.js, 경고 warnings.js,
// 선로 그리기 trackView.js, 역·이름표·출구 그리기 mapView.js, 오른쪽 패널 sidePanels.js, [선로]·[노선] 도구 drawingTools.js,
// 혼잡도·지형·소리 버튼 viewToggles.js, 튜토리얼 tutorial.js, 종단면도 profilePanel.js, 지도 레이어 순서 map/gameLayers.js
import { BANKRUPT_GRACE_MONTHS } from '../config.js';
import { getRegion, isSandbox } from '../game/region.js';
import { addGameLayers } from '../map/gameLayers.js';
import { getState, subscribe, setSpeed, findStation, findTrack, findRoute, monthlyInterest } from '../game/state.js';
import { removeStation, removeTrack } from '../game/build.js';
import { removeRoute } from '../game/routes.js';
import { syncTrains } from '../game/sim.js';
import { setWaterTest, trackProfile } from '../game/trackProfile.js';
import { waterAt, waterVersion } from '../map/water.js';
import { updateEconomy, getEconomy } from '../game/demand.js';
import { startEconomyWorker, requestEconomy } from '../game/economyJob.js';
import { renderBadge } from './badge.js';
import { createToolbar } from './toolbar.js';
import { createSpeedControl, togglePause } from './speedControl.js';
import { createSidePanels } from './sidePanels.js';
import { createMapView } from './mapView.js';
import { drawTracks } from './trackView.js';
import { profilePanelView, routeColors } from './views.js';
import { createStatus } from './status.js';
import { createCursorTip } from './cursorTip.js';
import { showCallout } from './callouts.js';
import { createDrawingTools } from './drawingTools.js';
import { createViewToggles } from './viewToggles.js';
import { bindMapInput } from './mapInput.js';
import { createWarnings } from './warnings.js';
import { createNoticeLog } from './noticeLog.js';
import { createGoalsPanel } from './goalsPanel.js';
import { createStatsPanel } from './statsPanel.js';
import { createReveal } from './reveal.js';
import { createSearch } from './search.js';
import { createDiagramView } from './diagramView.js';
import { shortfall, costNote } from './costText.js';
import { bindSaveControls } from './saveControls.js';
import { startAnimation } from './animation.js';
import { createStationMover } from './stationMover.js';
import { createTrackEditor } from './trackEditor.js';
import { createHelpCard } from './helpCard.js';
import { createTips } from './tips.js';
import { createTutorial } from './tutorial.js';
import { hasTerrain, terrainGrid } from '../game/terrain.js';
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
    controlRoom: false, // 관제실 모드: 어두운 지도 (viewToggles.js가 브라우저에 기억한 값으로 정한다)
    panelFolded: false, // 오른쪽 노선 목록을 접어 번호 띠만 남겼는지 (sidePanels.js가 브라우저에 기억한 값으로 정한다)
    trackPanelOpen: false, // 선로 도구를 쓰는 중에 [◂]로 노선 목록을 다시 펼쳤는지 (도구를 바꾸면 잊는다)
    newRouteKind: 'subway', // 새로 만들 노선의 종류: 'subway' 지하철 | 'express' 광역급행 (노선 패널에서 고른다)
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
    ui.trackPanelOpen = false;
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
  // 도구 막대 ([선로] 도구일 때 끝의 [곡선]은 아래 toggleDraftCurve)
  const toolbar = createToolbar(
    document.getElementById('toolbar'),
    chooseTool,
    () => toggleDraftCurve(),
    () => toggleDraftPlan(),
  );

  // 고른 역·선로·노선 지우기 (패널의 삭제 버튼, Delete 키)
  function deleteSelected() {
    dropMissing();
    const selected = ui.selected;
    if (!selected) return;
    select(null);
    if (selected.type === 'station') removeStation(selected.id);
    if (selected.type === 'track') removeTrack(selected.id);
    if (selected.type === 'route') removeRoute(selected.id);
  }

  const speedControl = createSpeedControl(document.getElementById('speed'), setSpeed);
  // 날짜 배지를 누르면 멈춤·다시 가기 (Space 키와 같다)
  document.getElementById('badge').addEventListener('click', togglePause);
  // 튜토리얼 (처음 온 사람에게 저절로) 과 조작 안내 카드 ([?])
  const tutorial = createTutorial(document.getElementById('tutorial'));
  // 튜토리얼 뒤 새 기능(계획 선로, 노선도, 통계, 찾기)을 쓸 일이 생기면 한 번씩 알려준다 (tips.js)
  const tips = createTips({ ui, notice });
  createHelpCard(document.getElementById('help'), document.getElementById('help-button'), {
    onTutorial: tutorial.start,
  });
  // [혼잡도 보기]·[지형]·[소리] 버튼 (viewToggles.js)
  const toggles = createViewToggles({ map, ui, render });
  const status = createStatus(document.getElementById('status'));
  // 단계적 공개: 쓸 일이 생기면 버튼이 하나씩 나타난다 (reveal.js)
  const reveal = createReveal({ notice });
  // 위쪽 [통계]: 최근 달들의 자금·월 수지·하루 승객 그래프 (statsPanel.js)
  const stats = createStatsPanel(document.getElementById('stats-button'), document.getElementById('stats-panel'));
  // 노선도 보기 ([노선도], D 키, diagramView.js): 역을 누르면 지도에서 그 역으로 가서 고른다
  const diagram = createDiagramView({
    onPickStation: (id) => {
      select({ type: 'station', id });
      map.flyTo({ center: findStation(id).coord, zoom: Math.max(map.getZoom(), 15) });
      render();
    },
  });
  document.getElementById('diagram-button').addEventListener('click', diagram.toggle);
  // 위쪽 [알림]: 지난 알림 목록
  createNoticeLog(document.getElementById('notice-button'), document.getElementById('notice-log'), map);
  // 달이 바뀌면 정산 숫자를 자금 옆에 띄운다 (불러온 첫 화면에서는 띄우지 않는다)
  let shownMonth = null;
  // 화면 아래 종단면도 (땅 높이가 있는 가상 지도만): 선로를 그리는 중이면 그리는 선로, 아니면 고른 선로·노선
  const profilePanel = createProfilePanel(document.getElementById('profile'));
  const showDraftProfile = (coords) => {
    if (hasTerrain()) profilePanel.show({ title: '새 선로 (그리는 중)', parts: [trackProfile(coords)] });
  };

  const cursorTip = createCursorTip(document.getElementById('cursor-tip'));

  // [선로]·[노선] 그리기 도구 (drawingTools.js)
  const { trackTool, routeTool, setDraftCurve, setDraftPlan } = createDrawingTools({
    map,
    select,
    render,
    notice,
    chooseTool: (id) => chooseTool(id),
    routeKind: () => ui.newRouteKind,
  });
  // 새로 그릴 선로를 직선 ↔ 곡선 (도구 막대의 [곡선], V 키)
  const toggleDraftCurve = () => {
    if (ui.tool === 'track') setDraftCurve(!trackTool.isCurve());
  };
  // 새로 그릴 선로를 바로 짓기 ↔ 계획 선로 (도구 막대의 [계획], P 키)
  const toggleDraftPlan = () => {
    if (ui.tool === 'track') setDraftPlan(!trackTool.isPlan());
  };

  // 오른쪽 패널: 역·선로 카드, 노선 패널, 접힌 노선 번호 띠 중 하나 (sidePanels.js)
  const sidePanels = createSidePanels({ ui, select, render, notice, routeTool, deleteSelected, previewDelete });

  // 지도 위 역·500m 원·괄호·이름표·출구 (mapView.js)
  const mapView = createMapView({ map, ui });

  // 선로만 다시 그린다 (선로를 끄는 동안 매 마우스 움직임마다 부르므로 가볍게, trackView.js)
  function renderTracks() {
    drawTracks(map, ui, mapView.shownCoord);
    trackEditor.showHandles();
  }

  // 되돌리기·불러오기로 사라진 것을 붙잡고 있지 않게: 고른 것·역 끼워넣는 노선이 없어졌으면 놓는다
  function dropMissing() {
    const exists = { station: findStation, track: findTrack, route: findRoute };
    if (ui.selected && !exists[ui.selected.type](ui.selected.id)) select(null);
    if (ui.insertingInto && !findRoute(ui.insertingInto)) {
      ui.insertingInto = null;
      ui.routeMessage = '';
    }
  }

  // 위쪽 날짜·자금·월 수지와 정산 숫자, 배속, 파산 창, 통계 그래프만 다시 그린다
  // (매달 정산·배속 바꾸기처럼 철도망은 그대로이고 날짜·돈만 바뀌었을 때는 이것만 부른다)
  function renderHud() {
    const { speed, money, year, month, monthsOverDebtLimit, bankrupt } = getState();
    reveal.update();
    renderBadge(document.getElementById('badge'), {
      year,
      month,
      region: getRegion().name,
      paused: speed === 0,
      sandbox: isSandbox(),
    });
    const economy = getEconomy();
    status.show({
      money,
      net: economy.net - monthlyInterest(),
      riders: economy.dailyRiders,
      flow: reveal.shown('flow'),
      monthsLeft:
        monthsOverDebtLimit > 0 && !bankrupt ? BANKRUPT_GRACE_MONTHS - monthsOverDebtLimit : null,
    });
    bankruptDialog.show({ bankrupt, year, month, money });
    const monthKey = `${year}-${month}`;
    if (shownMonth !== null && monthKey !== shownMonth && getState().lastSettlement) {
      status.flashSettlement(getState().lastSettlement.net);
    }
    shownMonth = monthKey;
    stats.update();
    speedControl.setActive(speed);
  }

  // 상태를 읽어서 화면 전체를 다시 그린다 (열차는 아래 애니메이션에서 따로 그린다)
  function render() {
    dropMissing();
    renderHud();
    const { routes } = getState();
    const { stationRoutes } = routeColors(routes);
    diagram.update();
    toolbar.setActive(ui.tool, trackTool.isCurve(), trackTool.isPlan());
    toggles.show();
    renderTracks();
    const shapes = mapView.drawStations(stationRoutes, getEconomy().stationRiders);
    sidePanels.show({ routes, shapes });
    // 패널을 펼치고 접은 뒤에 (말풍선이 패널 밑으로 들어가지 않게 자리를 고른다)
    mapView.updateStationExits();
    map.getCanvas().style.cursor = ui.tool === 'select' ? '' : 'crosshair';
    // 선로를 그리는 동안은 mapInput.js가 그리는 선로의 종단면도를 보여준다
    if (!trackTool.isDrawing()) profilePanel.show(hasTerrain() ? profilePanelView(ui.selected) : null);
    // 처음 쓸 때 안내는 버튼들을 다 그린 뒤에 (강조할 버튼이 보이는 상태여야 한다)
    tips.update();
  }

  // 혼잡·빚 경고 말풍선 (warnings.js)
  const warnings = createWarnings(map);

  // ── 저장: 자동 저장, 내보내기·불러오기·새로 시작, 파산 창 (saveControls.js) ──
  // 불러오기·새로 시작 뒤에는 고르던 것과 그리던 것을 모두 놓는다
  const clearWork = () => {
    select(null);
    trackTool.cancel();
    routeTool.cancel();
  };
  // 역·노선 찾기 (/ 키, [메뉴]의 [역·노선 찾기], search.js)
  const search = createSearch({ map, select, render });
  // 새 게임 안내는 튜토리얼이 떠 있으면 내지 않는다 (튜토리얼이 같은 것을 안내한다)
  const startMessage = loadMessage?.newGame && !document.getElementById('tutorial').hidden ? null : loadMessage;
  const { bankruptDialog } = bindSaveControls({ notice, loadMessage: startMessage, clearWork, render, onSearch: search.open });

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
    toggleControlRoom: toggles.toggleControlRoom,
    toggleHideUi: toggles.toggleHideUi,
    openSearch: search.open,
    diagram,
    toggleDraftCurve,
    toggleDraftPlan,
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

  // 지도 레이어를 정한 순서대로 올린다 (map/gameLayers.js)
  addGameLayers(map, hasTerrain() ? terrainGrid() : null);
  mapView.start();
  // 관제실 모드를 켜 둔 채 끝냈으면 레이어를 다 올린 지금 어두운 색을 입힌다
  toggles.applyControlRoom();

  // ── 애니메이션: 매 프레임 시간을 흘리고 열차를 다시 그린다 (animation.js) ──
  const animation = startAnimation(map);

  // 상태가 바뀌면: 열차를 노선에 맞추고 → 화면을 바로 다시 그리고 → 수입·운영비는 일꾼이 다시 계산한다 (economyJob.js).
  // 계산이 끝나면 목표·혼잡 경고를 확인하고 숫자가 바뀐 화면을 한 번 더 그린다 (역이 많아도 열차가 멈추지 않게)
  // 날짜·돈만 바뀐 때(kind 'time': 매달 정산, 배속)는 철도망 계산을 건너뛰고 위쪽 숫자만 다시 그린다
  const goals = createGoalsPanel(document.getElementById('goals-button'), document.getElementById('goals-list'));
  subscribe((state, kind) => {
    if (kind !== 'network') return;
    syncTrains();
    animation.markTrainsChanged();
    requestEconomy(() => {
      goals.update();
      warnings.crowding();
      render();
    });
  });
  // 게임 목표: 매달 정산 뒤에 확인한다 (이루면 말풍선과 보상)
  subscribe(goals.update);
  subscribe(() => warnings.debt());
  subscribe((state, kind) => {
    if (kind === 'network') render();
    else {
      renderHud();
      tips.update();
    }
  });
  // 불러온 게임이 있으면 그 노선에 맞춰 열차를 놓고 수입을 계산한 뒤 그린다 (처음 한 번은 화면에서 바로 계산한다)
  syncTrains();
  updateEconomy();
  startEconomyWorker();
  warnings.crowding({ silent: true });
  render();
  // 불러온 게임이 이미 이룬 목표도 확인한다 (목표 기록이 없는 예전 저장 파일)
  goals.update();

  bindMapInput(ctx);
}
