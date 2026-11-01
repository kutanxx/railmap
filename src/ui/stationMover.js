// 역 끌어서 옮기기: [선택] 도구로 먼저 고른 역을 끌면 옮겨진다 (고르지 않은 역은 끌리지 않아 실수로 옮기지 않는다).
// 마우스와 손가락(한 손가락으로 누른 채 움직이기) 모두 같다.
// 끄는 동안 이어진 선로가 따라오고, 마우스 옆에 이전 비용을 보여준다. 놓으면 새 자리의 주변 인구를 다시 잰다.
import { stationIdAt } from '../map/stationLayers.js';
import { estimatePopulation, zoomedInEnough } from '../map/population.js';
import { moveStationCost, moveStation } from '../game/build.js';
import { findStation } from '../game/state.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

const MIN_DRAG_PX = 5; // 이만큼도 안 움직였으면 옮긴 게 아니라 그냥 누른 것으로 본다

export function createStationMover({ map, ui, render, cursorTip, shortfall, costNote }) {
  // 끄는 중이면 { id, startPoint: 누른 화면 위치, moved: 충분히 움직였는지, tooFar: 너무 멀리 봐서 옮길 수 없는지 }
  let drag = null;
  // 끄는 동안 화면은 한 프레임에 한 번만 다시 그린다 (역이 많은 지도에서 마우스가 움직일 때마다 다 그리면 버벅였다)
  let renderQueued = false;
  const renderSoon = () => {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (drag) render();
    });
  };

  // 고른 역을 누르면 끌기 시작 (event: 지도의 마우스·손가락 이벤트)
  function start(event) {
    if (ui.tool !== 'select' || ui.selected?.type !== 'station') return;
    const id = stationIdAt(map, event.point);
    if (id !== ui.selected.id) return;
    // 너무 멀리 보면 새 자리 인구를 제대로 못 재므로 옮기지 않는다 (지도는 그대로 끌린다).
    // 누르기만 했을 때는 알리지 않고, 실제로 끌면 그때 한 번 알린다
    if (!zoomedInEnough(map)) {
      drag = { id, startPoint: event.point, moved: false, lastCoord: null, tooFar: true };
      return;
    }
    // 지도가 끌려 움직이지 않게 막는다
    event.preventDefault();
    drag = { id, startPoint: event.point, moved: false, lastCoord: null, tooFar: false };
    map.getCanvas().style.cursor = 'grabbing';
  }

  function move(event) {
    if (!drag) return;
    // 끄는 동안 되돌리기·지우기로 역이 없어졌으면 끌기를 그만둔다
    if (!findStation(drag.id)) {
      cancel();
      return;
    }
    const distance = Math.hypot(event.point.x - drag.startPoint.x, event.point.y - drag.startPoint.y);
    if (!drag.moved && distance < MIN_DRAG_PX) return;
    if (drag.tooFar) {
      showCallout(map, event.lngLat.toArray(), '더 확대해야 역을 옮길 수 있어요', 'bad');
      drag = null;
      return;
    }
    drag.moved = true;
    const coord = event.lngLat.toArray();
    drag.lastCoord = coord;
    ui.stationPreview = { id: drag.id, coord };
    renderSoon();

    const { addedKm, cost } = moveStationCost(drag.id, coord);
    const track = addedKm > 0.005 ? ` (선로 +${addedKm.toFixed(2)} km 포함)` : '';
    const text = `역 옮기기 · 공사비 ${formatMoney(cost)}${track}`;
    const note = costNote(cost);
    cursorTip.show(event.point.x, event.point.y, note ? `${text} · ${note.text}` : text, note?.tone ?? 'info');
  }

  map.on('mousedown', start);
  map.on('mousemove', move);

  // 놓기. 지도 밖(패널 위 등)에서 놓으면 옮기지 않고 끝낸다 (계속 따라다니지 않게)
  function finish(coord) {
    if (!drag) return;
    const { id, moved } = drag;
    drag = null;
    ui.stationPreview = null;
    cursorTip.hide();
    if (moved && coord && findStation(id)) {
      // 새 자리의 주변 인구를 다시 잰다 (지도 데이터는 지금 화면에 불러온 것)
      if (!moveStation(id, coord, estimatePopulation(map, coord))) {
        showCallout(map, coord, shortfall(moveStationCost(id, coord).cost), 'bad');
      }
    }
    render();
  }
  map.on('mouseup', (event) => finish(event.lngLat.toArray()));
  // 지도 밖에서 놓은 경우 (지도는 그 mouseup을 받지 못한다)
  document.addEventListener('mouseup', (event) => {
    if (drag && !event.target.closest?.('#map')) finish(null);
  });

  // 손가락: 한 손가락으로 고른 역을 누른 채 움직이면 옮긴다 (두 손가락이면 지도 확대·이동)
  map.on('touchstart', (event) => {
    if (event.points.length === 1) start(event);
  });
  map.on('touchmove', (event) => {
    if (drag && event.points.length === 1) move(event);
  });
  map.on('touchend', () => {
    if (drag) finish(drag.lastCoord);
  });

  // 끌던 것을 옮기지 않고 그만둔다 (끄는 중에 되돌리기·지우기를 누르면 mapInput.js가 부른다)
  function cancel() {
    if (!drag) return;
    drag = null;
    ui.stationPreview = null;
    cursorTip.hide();
    render();
  }

  return { cancel };
}
