// 지도 위 클릭·마우스 움직임과 키보드를 도구에 맞게 처리한다.
// ctx: app.js가 넘겨주는 화면 상태와 도구들
import { stationIdAt, updateCatchment } from '../map/stationLayers.js';
import { trackIdAt } from '../map/trackLayers.js';
import { estimatePopulation, zoomedInEnough } from '../map/population.js';
import { nearbyPlaceName } from '../map/placeNames.js';
import { mapDataLoaded } from '../map/mapFeatures.js';
import { getState, findStation, undo, redo } from '../game/state.js';
import { addStation } from '../game/build.js';
import { sharedPopulations } from '../game/catchment.js';
import { intercityLinks } from '../game/intercity.js';
import { insertStationIntoRoute } from '../game/routes.js';
import { stationCost, trackCostForCoords } from '../game/economy.js';
import { showCallout } from './callouts.js';
import { TOOLS } from './toolbar.js';
import { stationHoverText } from './views.js';
import { togglePause } from './speedControl.js';
import { playSound } from './sounds.js';
import { isNarrowScreen } from './sidePanels.js';
import { FINGER } from '../map/hitPad.js';
import { formatMoney, formatPopulation } from './format.js';

// 너무 멀리서 역을 놓으려 할 때 안내
const TOO_FAR = '더 확대해야 역을 놓을 수 있어요';
// 아직 짓지 않은 새 역을 다른 역들과 함께 계산할 때 쓰는 이름표
const NEW_STATION = '__new';
// 고른 자리가 아래 판의 윗변에서 이만큼(px) 안쪽까지 내려와 있으면 가린 것으로 친다
const SHEET_MARGIN_PX = 24;

export function bindMapInput(ctx) {
  const {
    map,
    ui,
    select,
    render,
    chooseTool,
    deleteSelected,
    toggleCongestion,
    toggleTerrain,
    toggleSound,
    toggleControlRoom,
    toggleDraftCurve,
    toggleDraftPlan,
    toggleHideUi,
    openSearch,
    diagram,
  } = ctx;
  const { trackTool, routeTool, cursorTip, shortfall, costNote, notice, showDraftProfile } = ctx;

  // 화면의 한 점에 있는 역 id. 방금 지운 역이 지도에 잠깐 남아 보일 수 있어서, 상태에 있는 역만 인정한다
  const stationAt = (point) => {
    const id = stationIdAt(map, point);
    return id && findStation(id) ? id : null;
  };

  // 마우스 옆 공사비 안내: 못 지으면 붉게, 빚을 내서 지으면 주황으로 (costNote)
  const tip = (point, text, cost) => {
    const note = costNote(cost);
    cursorTip.show(point.x, point.y, note ? `${text} · ${note.text}` : text, note?.tone ?? 'info');
  };

  // ── 역 놓기 미리보기: 마우스 자리에 500m 원, 마우스가 멈추면 주변 인구 ──
  // 인구 재기는 0.1초쯤 걸려서, 마우스를 움직이는 동안에는 재지 않고 멈춘 뒤에 한 번 잰다
  const ESTIMATE_DELAY_MS = 250;
  let estimateTimer = null;
  let estimate = null; // { key: 잰 자리, population: 이웃 역과 나눈 뒤 인구, hubs: 이어질 고속철도역들 }
  const placeKey = (coord) => coord.map((value) => value.toFixed(5)).join(',');

  function showStationTip(point, coord) {
    const cost = `역 공사비 ${formatMoney(stationCost())}`;
    const measured = estimate?.key === placeKey(coord);
    const people = measured ? `주변 인구 약 ${formatPopulation(estimate.population)}` : '주변 인구 재는 중…';
    // 고속철도역 가까이면 이어진다고 알려준다 (그 역을 드나드는 사람이 승객 수요에 더해진다)
    const hubs = measured
      ? estimate.hubs.map((hub) => ` · ${hub.label} ${hub.name}과(와) 이어져요 +${formatPopulation(hub.people)}`).join('')
      : '';
    tip(point, `${cost} · ${people}${hubs}`, stationCost());
  }

  function previewStation(point, coord) {
    ui.hover = coord;
    updateCatchment(map, coord);
    showStationTip(point, coord);
    clearTimeout(estimateTimer);
    estimateTimer = setTimeout(() => {
      const { population, cells } = estimatePopulation(map, coord);
      // 이미 있는 역들과 나눈 뒤의 인구를 보여준다 (실제로 지으면 받을 인구)
      const preview = { id: '__preview', coord, population, cells };
      const shared = sharedPopulations([...getState().stations, preview]).get(preview.id);
      // 이 자리에 지으면 이어질 고속철도역 (이미 더 가까운 역이 이어져 있으면 그 역이 그대로 갖는다)
      const hubs = intercityLinks([...getState().stations, preview])
        .filter(({ stationId }) => stationId === preview.id)
        .map(({ hub }) => hub);
      estimate = { key: placeKey(coord), population: shared, hubs };
      if (ui.tool === 'station' && ui.hover === coord) showStationTip(point, coord);
    }, ESTIMATE_DELAY_MS);
  }

  // 좁은 화면: coord 자리가 아래에서 올라온 판에 가려 있으면, 위쪽 버튼 묶음과 판 사이 가운데로 지도를 민다
  // (고른 역이 제 카드에 가리면 손가락으로 끌어 옮길 수 없다)
  function keepAboveSheet(coord) {
    if (!isNarrowScreen()) return;
    const sheet = document.querySelector('.side').getBoundingClientRect();
    if (sheet.height === 0) return;
    const top = document.querySelector('.top-left').getBoundingClientRect().bottom;
    const y = map.project(coord).y;
    if (y > top && y < sheet.top - SHEET_MARGIN_PX) return;
    map.panBy([0, y - (top + sheet.top) / 2]);
  }

  function clearPreview() {
    clearTimeout(estimateTimer);
    ui.hover = null;
    if (ui.tool === 'station') updateCatchment(map, null);
  }

  map.on('click', (event) => {
    const coord = event.lngLat.toArray();
    const stationId = stationAt(event.point);

    if (ui.tool === 'track') {
      if (stationId) trackTool.clickStation(stationId, findStation(stationId).coord);
      else trackTool.clickEmpty(coord);
      // 손가락 화면은 마우스 움직임이 없으니, 누를 때마다 종단면도를 바꾼다 (가상 지도)
      const coords = FINGER && trackTool.previewCoords();
      if (coords) showDraftProfile(coords);
      return;
    }
    if (ui.tool === 'route') {
      if (stationId) routeTool.clickStation(stationId);
      return;
    }
    // 노선에 역을 끼워넣는 중이면, 누른 역을 그 노선에 넣는다
    if (ui.insertingInto && stationId) {
      const problem = insertStationIntoRoute(ui.insertingInto, stationId);
      ui.routeMessage = problem ?? `${findStation(stationId).name}을(를) 넣었어요. 더 넣거나 Esc로 끝내세요.`;
      render();
      return;
    }

    if (stationId) {
      // 어느 도구든 기존 역을 누르면 그 역을 고른다
      select({ type: 'station', id: stationId });
    } else if (ui.tool === 'station') {
      if (!zoomedInEnough(map)) {
        showCallout(map, coord, TOO_FAR, 'bad');
        return;
      }
      if (!mapDataLoaded(map)) {
        showCallout(map, coord, '지도를 불러오는 중이에요. 잠시 뒤에 놓아 주세요', 'bad');
        return;
      }
      // 이름은 가까운 지명에서 (다른 역이 쓰는 이름은 피한다). 고속철도역과 이어지는 자리면 그 역 이름 (서울역 옆은 "서울역")
      const usedNames = new Set(getState().stations.map((station) => station.name));
      const hub = intercityLinks([...getState().stations, { id: NEW_STATION, coord }]).find(
        ({ stationId }) => stationId === NEW_STATION,
      )?.hub;
      const name = hub && !usedNames.has(hub.name) ? hub.name : nearbyPlaceName(map, coord, usedNames);
      const station = addStation(coord, estimatePopulation(map, coord), name);
      if (station) {
        select({ type: 'station', id: station.id });
        playSound('station');
      }
      else showCallout(map, coord, shortfall(stationCost()), 'bad');
    } else {
      const trackId = trackIdAt(map, event.point);
      select(trackId ? { type: 'track', id: trackId } : null);
    }
    render();
    if (ui.selected) keepAboveSheet(stationId ? findStation(stationId).coord : coord);
  });

  map.on('mousemove', (event) => {
    // 손가락 화면: 누를 때 브라우저가 흉내 내는 마우스 움직임은 무시한다
    // (미리보기 선·마우스 옆 안내가 마지막으로 누른 자리에 남는다. 길이·공사비는 아래 그리기 막대에)
    if (FINGER) return;
    const stationId = stationAt(event.point);

    if (ui.tool === 'track') {
      // 역 위에 올리면 미리보기 끝을 역 한가운데에 붙인다
      const cursor = stationId ? findStation(stationId).coord : event.lngLat.toArray();
      trackTool.moveCursor(cursor);
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
      // 그리는 중이면 지금까지의 길이와 예상 공사비를 마우스 옆에 보여준다
      const coords = trackTool.previewCoords();
      if (coords) {
        const { km, bridgeKm, tunnelKm, cost } = trackCostForCoords(coords);
        const structures = [];
        if (bridgeKm >= 0.01) structures.push(`교량 ${bridgeKm.toFixed(2)} km`);
        if (tunnelKm >= 0.01) structures.push(`터널 ${tunnelKm.toFixed(2)} km`);
        const detail = structures.length ? ` (${structures.join(' · ')})` : '';
        // 계획 선로는 지금 돈을 내지 않으므로 빚 안내 없이 "지을 때 공사비"로 보여준다
        if (trackTool.isPlan()) tip(event.point, `계획 ${km.toFixed(2)} km${detail} · 지을 때 ${formatMoney(cost)}`, 0);
        else tip(event.point, `${km.toFixed(2)} km${detail} · 공사비 ${formatMoney(cost)}`, cost);
        // 땅 높이가 있으면 화면 아래 종단면도도 같이 바꾼다
        showDraftProfile(coords);
      } else {
        cursorTip.hide();
      }
    } else if (ui.tool === 'station') {
      // 역을 놓을 자리에 500m 원, 예상 공사비, 주변 인구를 보여준다
      if (stationId) {
        cursorTip.hide();
        clearPreview();
      } else if (!zoomedInEnough(map)) {
        clearPreview();
        cursorTip.show(event.point.x, event.point.y, TOO_FAR, 'bad');
      } else {
        previewStation(event.point, event.lngLat.toArray());
      }
    } else if (ui.tool === 'route' || ui.insertingInto) {
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
    } else if (ui.tool === 'select' && !ui.trackPreview) {
      // 역이나 선로 위에 올리면 손가락 모양으로 바꾼다
      const onSomething = stationId || trackIdAt(map, event.point);
      map.getCanvas().style.cursor = onSomething ? 'pointer' : '';
      // 역 위에 올리면 마우스 옆에 이름·하루 이용객·지나는 노선 (누르지 않아도 알 수 있게)
      const hoverText = stationId && !ui.stationPreview ? stationHoverText(stationId) : null;
      if (hoverText) cursorTip.show(event.point.x, event.point.y, hoverText);
      else cursorTip.hide();
    }
  });

  // 마우스가 지도 밖으로 나가면 안내와 미리보기 원을 숨긴다
  map.on('mouseout', () => {
    cursorTip.hide();
    clearPreview();
  });

  // Esc·오른쪽 클릭: 그리던 것 취소 (그리는 중이 아니면 역 끼워넣기 끝, 그다음 선택 해제)
  function cancelWork() {
    if (trackTool.isDrawing()) trackTool.cancel();
    else if (routeTool.isDrawing()) routeTool.cancel();
    else if (ui.insertingInto) {
      ui.insertingInto = null;
      ui.routeMessage = '';
      render();
    } else {
      select(null);
      render();
    }
  }
  // 오른쪽 클릭. 오른쪽 버튼으로 끌어서 지도를 돌린 것은 클릭으로 치지 않는다
  let rightDown = null;
  map.on('mousedown', (event) => {
    if (event.originalEvent.button === 2) rightDown = event.point;
  });
  map.on('contextmenu', (event) => {
    event.preventDefault();
    const dragged = rightDown && rightDown.dist(event.point) > 5;
    rightDown = null;
    if (dragged) return;
    cursorTip.hide();
    cancelWork();
  });

  // 1~4: 도구 바꾸기, Space: 멈춤·다시 가기, Delete: 고른 것 지우기, C: 혼잡도 보기, T: 지형 보기, M: 소리, N: 관제실 모드,
  // V: 새로 그릴 선로를 직선 ↔ 곡선, P: 새로 그릴 선로를 계획 선로로 ([선로] 도구일 때), H: 버튼·패널 숨기기, /: 역·노선 찾기, D: 노선도 보기
  // Esc: 그리던 것 취소, Backspace: 마지막 경유점·역 빼기, Enter: 노선 완성
  // Ctrl+Z (맥은 Cmd+Z): 되돌리기, Ctrl+Shift+Z 또는 Ctrl+Y: 다시 하기
  // 되돌리기·다시 하기 (Ctrl+Z·Ctrl+Y, 왼쪽 아래 [↶][↷] 버튼)
  function undoOrRedo(redoing) {
    // 그리던 선로·노선은 먼저 취소한다 (되돌린 뒤 없어진 역을 붙잡고 있지 않게)
    trackTool.cancel();
    routeTool.cancel();
    const result = redoing ? redo() : undo();
    if (result === false) notice(redoing ? '다시 할 것이 없어요' : '되돌릴 것이 없어요', 'bad');
    else if (result === null) notice('다시 하기에 필요한 돈이 모자라요', 'bad');
    else if (result.noRefund) notice('지난 정산보다 앞선 공사라 공사비는 돌려받지 못했어요', 'warn');
  }
  document.getElementById('undo-button').addEventListener('click', () => undoOrRedo(false));
  document.getElementById('redo-button').addEventListener('click', () => undoOrRedo(true));

  // 글자를 치는 칸 (이름 칸, 찾기 칸). 막대(range) 같은 다른 입력에 초점이 있을 때는 단축키를 그대로 받는다
  const typingIn = (target) =>
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable ||
    (target instanceof HTMLInputElement && ['text', 'search'].includes(target.type));
  // 화면을 가리는 창(조작 안내, 파산)이 떠 있으면 뒤의 게임은 키를 받지 않는다
  const dialogOpen = () => !document.getElementById('help').hidden || !document.getElementById('bankrupt').hidden;

  document.addEventListener('keydown', (event) => {
    // 이름 칸에 글자를 치는 중이면 건드리지 않는다 (이름 칸은 자기 되돌리기를 쓴다)
    if (typingIn(event.target) || dialogOpen()) return;

    const command = event.ctrlKey || event.metaKey;
    // 글자 단축키는 자판 자리(event.code)로 읽는다: 한글 입력 상태에서도 C·T·H…가 그대로 먹게
    const letter = event.code.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase();
    // 노선도를 보는 동안에는 D·Esc(닫기)만 받는다 (보이지 않는 지도에서 무언가 바뀌지 않게. 되돌리기도 막는다)
    if (diagram.isOpen()) {
      if (!command && (event.key === 'Escape' || letter === 'd')) diagram.close();
      return;
    }
    if (command && (letter === 'z' || letter === 'y')) {
      event.preventDefault();
      undoOrRedo(letter === 'y' || event.shiftKey);
      return;
    }

    if (command || event.altKey) return;
    const tool = TOOLS.find((t) => t.key === event.key);
    if (tool) {
      chooseTool(tool.id);
    } else if (event.key === ' ') {
      // 버튼에 초점이 있어도 Space가 그 버튼을 누르지 않게 한다
      event.preventDefault();
      togglePause();
    } else if (event.key === 'Delete') {
      deleteSelected();
    } else if (letter === 'c') {
      toggleCongestion();
    } else if (letter === 't') {
      toggleTerrain();
    } else if (letter === 'm') {
      toggleSound();
    } else if (letter === 'n') {
      toggleControlRoom();
    } else if (letter === 'v') {
      toggleDraftCurve();
    } else if (letter === 'p') {
      toggleDraftPlan();
    } else if (letter === 'h') {
      // 알림 목록에는 남기지 않는다 (누를 때마다 [알림]이 쌓이지 않게)
      if (toggleHideUi()) showCallout(map, map.getCenter().toArray(), '버튼을 숨겼어요. H나 Esc로 다시 보여요', 'info', { log: false });
    } else if (letter === 'd') {
      diagram.open();
    } else if (event.key === '/' || event.code === 'Slash') {
      event.preventDefault();
      // 버튼을 숨긴 중이면 찾기 칸도 안 보이므로 먼저 다시 보이게 한다
      toggleHideUi(false);
      openSearch();
    } else if (event.key === 'Escape') {
      // 버튼을 숨긴 중이면 먼저 다시 보이게 한다
      if (document.body.classList.contains('ui-hidden')) toggleHideUi(false);
      else cancelWork();
    } else if (event.key === 'Backspace') {
      if (trackTool.isDrawing()) trackTool.undoWaypoint();
      else if (routeTool.isDrawing()) routeTool.undoStation();
      else return;
      event.preventDefault();
    } else if (event.key === 'Enter' && routeTool.isDrawing()) {
      routeTool.finish();
    }
  });
}
