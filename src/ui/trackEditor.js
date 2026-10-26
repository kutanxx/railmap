// 이미 지은 선로 다듬기: [선택] 도구로 선로를 고르면 손잡이가 생긴다.
// - 경유점 손잡이를 끌면 그 경유점이 옮겨진다
// - 두 점 사이의 작은 손잡이를 끌면 그 자리에 경유점이 새로 생긴다
// - 경유점 손잡이를 두 번 클릭하면 그 경유점이 지워진다 (선로가 짧아지니 돈은 들지 않는다)
// 끄는 동안 마우스 옆에 바뀐 길이와 더 낼 공사비를 보여주고, 놓을 때 공사비를 낸다.
import { updateHandles, handleAt } from '../map/trackLayers.js';
import { findTrack, trackCoords } from '../game/state.js';
import { rerouteCost, setTrackWaypoints } from '../game/build.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

export function createTrackEditor({ map, ui, render, renderTracks, cursorTip, shortfall, costNote }) {
  // 끄는 중이면 { trackId, original: 원래 경유점, waypoints: 바뀐 경유점, index }
  let drag = null;

  // 지금 고른 선로 (선택 도구일 때만 다듬을 수 있다)
  const editableTrack = () =>
    ui.tool === 'select' && ui.selected?.type === 'track' ? findTrack(ui.selected.id) : null;

  // 고른 선로의 손잡이를 그린다 (끄는 중이면 바뀐 모양 기준)
  function showHandles() {
    const track = editableTrack();
    if (!track) {
      updateHandles(map, []);
      return;
    }
    const waypoints = drag ? drag.waypoints : track.waypoints;
    const coords = trackCoords({ ...track, waypoints });
    const handles = waypoints.map((coord, index) => ({ coord, kind: 'waypoint', index }));
    // 이웃한 두 점 사이 가운데: 끌면 index 자리에 새 경유점이 끼워진다
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      handles.push({ coord: [(x1 + x2) / 2, (y1 + y2) / 2], kind: 'midpoint', index: i });
    }
    updateHandles(map, handles);
  }

  map.on('mousedown', (event) => {
    const track = editableTrack();
    if (!track) return;
    const handle = handleAt(map, event.point);
    if (!handle) return;
    // 지도가 끌려 움직이지 않게 막는다
    event.preventDefault();
    const waypoints = track.waypoints.map((point) => [...point]);
    if (handle.kind === 'midpoint') waypoints.splice(handle.index, 0, event.lngLat.toArray());
    drag = { trackId: track.id, original: track.waypoints, waypoints, index: handle.index };
    map.getCanvas().style.cursor = 'grabbing';
  });

  map.on('mousemove', (event) => {
    if (!drag) return;
    drag.waypoints[drag.index] = event.lngLat.toArray();
    ui.trackPreview = { id: drag.trackId, waypoints: drag.waypoints };
    renderTracks();

    const { addedKm, cost } = rerouteCost(findTrack(drag.trackId), drag.waypoints);
    const sign = addedKm >= 0 ? '+' : '−';
    const text = `${sign}${Math.abs(addedKm).toFixed(2)} km · ${cost > 0 ? `공사비 +${formatMoney(cost)}` : '공사비 없음'}`;
    const note = costNote(cost);
    cursorTip.show(event.point.x, event.point.y, note ? `${text} · ${note.text}` : text, note?.tone ?? 'info');
  });

  map.on('mouseup', (event) => {
    if (!drag) return;
    const { trackId, original, waypoints } = drag;
    drag = null;
    ui.trackPreview = null;
    cursorTip.hide();
    // 손잡이를 누르기만 하고 움직이지 않았으면 아무것도 바꾸지 않는다
    const moved = JSON.stringify(original) !== JSON.stringify(waypoints);
    if (moved && !setTrackWaypoints(trackId, waypoints)) {
      const { cost } = rerouteCost(findTrack(trackId), waypoints);
      showCallout(map, event.lngLat.toArray(), shortfall(cost), 'bad');
    }
    render();
  });

  // 경유점 손잡이를 두 번 클릭하면 지운다
  map.on('dblclick', (event) => {
    const track = editableTrack();
    if (!track) return;
    const handle = handleAt(map, event.point);
    if (handle?.kind !== 'waypoint') return;
    // 두 번 클릭이 지도 확대로 이어지지 않게 막는다
    event.preventDefault();
    setTrackWaypoints(
      track.id,
      track.waypoints.filter((_, index) => index !== handle.index),
    );
    render();
  });

  return { showHandles };
}
