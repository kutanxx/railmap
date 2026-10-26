// 게임 화면의 중심: 화면 상태(도구, 선택), 패널과 도구 만들기, 다시 그리기, 애니메이션, 저장 버튼.
// 지도 위 클릭·마우스·키보드 처리는 mapInput.js, 선로 끌기는 trackEditor.js가 맡는다.
import { REGION_NAME, DEBT_LIMIT, BANKRUPT_GRACE_MONTHS } from '../config.js';
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
  routeCoords,
  monthlyInterest,
} from '../game/state.js';
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
import { syncTrains, stepSimulation, trainFeatures } from '../game/sim.js';
import { trackCostForCoords } from '../game/economy.js';
import { updateEconomy, getEconomy } from '../game/demand.js';
import { startAutosave, exportToFile, importFromFile, resetGame } from '../game/save.js';
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
import { createBankruptDialog } from './bankruptDialog.js';
import { createTrackEditor } from './trackEditor.js';

export function startApp(map, loadMessage) {
  // 화면 상태: 게임 상태가 아니라 지금 고른 도구, 선택한 것, 진행 중인 편집
  const ui = {
    tool: 'select',
    selected: null, // { type: 'station' | 'track' | 'route', id } 또는 null
    insertingInto: null, // 역을 끼워넣는 중인 노선 id
    routeMessage: '', // 노선 패널에 보여줄 안내
    trackPreview: null, // 끌어서 고치는 중인 선로 { id, waypoints }
    hover: null, // 역 놓기 도구에서 마우스가 있는 자리 [경도, 위도]
  };

  // 빚 한도까지 써도 공사비가 모자라면 모자란 금액을 알려주는 글, 아니면 null
  const shortfall = (cost) => {
    const room = getState().money - DEBT_LIMIT; // 빚 한도까지 쓸 수 있는 돈
    return cost > room
      ? `빚 한도(${formatMoney(DEBT_LIMIT)})까지 ${formatMoney(cost - room)} 모자라요`
      : null;
  };
  // 마우스 옆 공사비 안내에 붙일 말: 못 지으면 붉게, 빚을 내서 지으면 주황으로, 아니면 null
  const costNote = (cost) => {
    const problem = shortfall(cost);
    if (problem) return { text: problem, tone: 'bad' };
    const borrowed = cost - Math.max(getState().money, 0);
    if (borrowed > 0) return { text: `빚 ${formatMoney(borrowed)}으로 지어요`, tone: 'warn' };
    return null;
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
    const { stations, routes, speed, money, year, month, monthsOverDebtLimit, bankrupt } = getState();
    const { stationColors } = routeColors(routes);

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
    updateStations(map, stations, ui.selected?.type === 'station' ? ui.selected.id : null);
    // 500m 원: 역 놓기 도구면 마우스 자리, 아니면 고른 역 둘레
    const selectedStation = ui.selected?.type === 'station' ? findStation(ui.selected.id) : null;
    updateCatchment(map, ui.tool === 'station' ? ui.hover : (selectedStation?.coord ?? null));
    updateStationLabels(map, stations, stationColors, economy.stationRiders);
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

  // 노선이 새로 혼잡해지면 (혼잡도 100% 넘음) 그 노선 가운데 역 위에 말풍선을 띄운다
  // 이미 혼잡한 노선은 다시 알리지 않는다. silent: 처음 불러올 때는 알리지 않고 기억만 한다
  let crowdedRoutes = new Set();
  function warnCrowding({ silent = false } = {}) {
    const { routeLoad } = getEconomy();
    const now = new Set(getState().routes.filter((r) => routeLoad.get(r.id) > 1).map((r) => r.id));
    if (!silent) {
      for (const route of getState().routes) {
        if (!now.has(route.id) || crowdedRoutes.has(route.id)) continue;
        const middle = route.stations[Math.floor(route.stations.length / 2)];
        showCallout(map, findStation(middle).coord, `${route.name} 혼잡 — 열차가 더 필요해요`, 'bad');
      }
    }
    crowdedRoutes = now;
  }

  // 빚 경고: 한도를 처음 넘은 달, 그 뒤 매달 남은 달, 한도 안으로 돌아온 달에 말풍선을 띄운다
  let lastDebtMonths = getState().monthsOverDebtLimit;
  function warnDebt() {
    const { monthsOverDebtLimit: months, bankrupt } = getState();
    if (months === lastDebtMonths || bankrupt) {
      lastDebtMonths = months;
      return;
    }
    if (months === 1) {
      notice(
        `빚이 한도(${formatMoney(DEBT_LIMIT)})를 넘었어요. ${BANKRUPT_GRACE_MONTHS}개월 안에 갚지 못하면 파산해요`,
        'bad',
      );
    } else if (months > 1) {
      notice(`파산까지 ${BANKRUPT_GRACE_MONTHS - months}개월 남았어요`, 'bad');
    } else {
      notice('빚이 한도 안으로 돌아왔어요');
    }
    lastDebtMonths = months;
  }

  // 지도 입력과 선로 끌기가 함께 쓰는 것들
  const bankruptDialog = createBankruptDialog(document.getElementById('bankrupt'), {
    onReset: () => startOver(),
    onImport: (file) => importGame(file),
  });

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

  // 그리는 순서: 역세권 원 → 선로 → 역 → 열차 → 미리보기 → 선로 손잡이 (나중에 추가한 것이 위에 보인다)
  addCatchmentLayer(map);
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
  subscribe(warnCrowding);
  subscribe(warnDebt);
  subscribe(render);
  // 불러온 게임이 있으면 그 노선에 맞춰 열차를 놓고 수입을 계산한 뒤 그린다
  syncTrains();
  updateEconomy();
  warnCrowding({ silent: true });
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
  const importGame = (file) => {
    importFromFile(file)
      .then(() => {
        clearWork();
        render();
        notice('저장 파일을 불러왔어요');
      })
      .catch((error) => notice(error.message, 'bad'));
  };
  const startOver = () => {
    clearWork();
    resetGame();
    notice('새 게임을 시작해요');
  };
  createFileMenu(document.getElementById('file-menu'), {
    onExport: exportToFile,
    onImport: importGame,
    onReset: startOver,
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
