// 역 끌어서 옮기기: [선택] 도구로 먼저 고른 역을 끌면 옮겨진다 (고르지 않은 역은 끌리지 않아 실수로 옮기지 않는다).
// 끄는 동안 이어진 선로가 따라오고, 마우스 옆에 이전 비용을 보여준다. 놓으면 새 자리의 주변 인구를 다시 잰다.
import { stationIdAt } from '../map/stationLayers.js';
import { estimatePopulation } from '../map/population.js';
import { moveStationCost, moveStation } from '../game/build.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

const MIN_DRAG_PX = 5; // 이만큼도 안 움직였으면 옮긴 게 아니라 그냥 누른 것으로 본다

export function createStationMover({ map, ui, render, cursorTip, shortfall, costNote }) {
  // 끄는 중이면 { id, startPoint: 누른 화면 위치, moved: 충분히 움직였는지 }
  let drag = null;

  map.on('mousedown', (event) => {
    if (ui.tool !== 'select' || ui.selected?.type !== 'station') return;
    const id = stationIdAt(map, event.point);
    if (id !== ui.selected.id) return;
    // 지도가 끌려 움직이지 않게 막는다
    event.preventDefault();
    drag = { id, startPoint: event.point, moved: false };
    map.getCanvas().style.cursor = 'grabbing';
  });

  map.on('mousemove', (event) => {
    if (!drag) return;
    const distance = Math.hypot(event.point.x - drag.startPoint.x, event.point.y - drag.startPoint.y);
    if (!drag.moved && distance < MIN_DRAG_PX) return;
    drag.moved = true;
    const coord = event.lngLat.toArray();
    ui.stationPreview = { id: drag.id, coord };
    render();

    const { addedKm, cost } = moveStationCost(drag.id, coord);
    const track = addedKm > 0.005 ? ` (선로 +${addedKm.toFixed(2)} km 포함)` : '';
    const text = `역 옮기기 · 공사비 ${formatMoney(cost)}${track}`;
    const note = costNote(cost);
    cursorTip.show(event.point.x, event.point.y, note ? `${text} · ${note.text}` : text, note?.tone ?? 'info');
  });

  map.on('mouseup', (event) => {
    if (!drag) return;
    const { id, moved } = drag;
    drag = null;
    ui.stationPreview = null;
    cursorTip.hide();
    if (moved) {
      const coord = event.lngLat.toArray();
      // 새 자리의 주변 인구를 다시 잰다 (지도 데이터는 지금 화면에 불러온 것)
      if (!moveStation(id, coord, estimatePopulation(map, coord))) {
        showCallout(map, coord, shortfall(moveStationCost(id, coord).cost), 'bad');
      }
    }
    render();
  });
}
