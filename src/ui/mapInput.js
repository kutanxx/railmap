// 지도 위 클릭·마우스 움직임과 키보드를 도구에 맞게 처리한다.
// ctx: app.js가 넘겨주는 화면 상태와 도구들
import { stationIdAt } from '../map/stationLayers.js';
import { trackIdAt } from '../map/trackLayers.js';
import { estimatePopulation } from '../map/population.js';
import { findStation, addStation, undo, redo } from '../game/state.js';
import { insertStationIntoRoute } from '../game/routes.js';
import { stationCost, trackCostForCoords } from '../game/economy.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

export function bindMapInput(ctx) {
  const { map, ui, select, render, trackTool, routeTool, cursorTip, shortfall, notice } = ctx;

  // 마우스 옆 안내: 모자란 돈이 있으면 붉게
  const tip = (point, text, problem) =>
    cursorTip.show(point.x, point.y, problem ? `${text} · ${problem}` : text, problem ? 'bad' : 'info');

  map.on('click', (event) => {
    const coord = event.lngLat.toArray();
    const stationId = stationIdAt(map, event.point);

    if (ui.tool === 'track') {
      if (stationId) trackTool.clickStation(stationId, findStation(stationId).coord);
      else trackTool.clickEmpty(coord);
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
      const station = addStation(coord, estimatePopulation(map, coord));
      if (station) select({ type: 'station', id: station.id });
      else showCallout(map, coord, shortfall(stationCost()), 'bad');
    } else {
      const trackId = trackIdAt(map, event.point);
      select(trackId ? { type: 'track', id: trackId } : null);
    }
    render();
  });

  map.on('mousemove', (event) => {
    const stationId = stationIdAt(map, event.point);

    if (ui.tool === 'track') {
      // 역 위에 올리면 미리보기 끝을 역 한가운데에 붙인다
      const cursor = stationId ? findStation(stationId).coord : event.lngLat.toArray();
      trackTool.moveCursor(cursor);
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
      // 그리는 중이면 지금까지의 길이와 예상 공사비를 마우스 옆에 보여준다
      const coords = trackTool.previewCoords();
      if (coords) {
        const { km, cost } = trackCostForCoords(coords);
        tip(event.point, `${km.toFixed(2)} km · 공사비 ${formatMoney(cost)}`, shortfall(cost));
      } else {
        cursorTip.hide();
      }
    } else if (ui.tool === 'station') {
      // 역을 놓을 자리에 예상 공사비를 보여준다
      if (stationId) cursorTip.hide();
      else tip(event.point, `역 공사비 ${formatMoney(stationCost())}`, shortfall(stationCost()));
    } else if (ui.tool === 'route' || ui.insertingInto) {
      map.getCanvas().style.cursor = stationId ? 'pointer' : 'crosshair';
    } else if (ui.tool === 'select' && !ui.trackPreview) {
      // 역이나 선로 위에 올리면 손가락 모양으로 바꾼다
      const onSomething = stationId || trackIdAt(map, event.point);
      map.getCanvas().style.cursor = onSomething ? 'pointer' : '';
    }
  });

  // 마우스가 지도 밖으로 나가면 안내를 숨긴다
  map.on('mouseout', () => cursorTip.hide());

  // Esc: 그리던 것 취소 (그리는 중이 아니면 역 끼워넣기 끝, 그다음 선택 해제)
  // Backspace: 마지막 경유점·역 빼기, Enter: 노선 완성
  // Ctrl+Z (맥은 Cmd+Z): 되돌리기, Ctrl+Shift+Z 또는 Ctrl+Y: 다시 하기
  document.addEventListener('keydown', (event) => {
    // 패널의 이름 칸에 글자를 치는 중이면 건드리지 않는다 (이름 칸은 자기 되돌리기를 쓴다)
    if (event.target instanceof HTMLInputElement) return;

    const command = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (command && (key === 'z' || key === 'y')) {
      event.preventDefault();
      // 그리던 선로·노선은 먼저 취소한다 (되돌린 뒤 없어진 역을 붙잡고 있지 않게)
      trackTool.cancel();
      routeTool.cancel();
      const redoing = key === 'y' || event.shiftKey;
      const changed = redoing ? redo() : undo();
      if (!changed) notice(redoing ? '다시 할 것이 없어요' : '되돌릴 것이 없어요', 'bad');
      return;
    }

    if (event.key === 'Escape') {
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
