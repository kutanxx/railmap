// 이미 지은 선로 다듬기: [선택] 도구로 선로를 고르면 손잡이가 생긴다.
// - 경유점 손잡이를 끌면 그 경유점이 옮겨진다
// - 두 점 사이의 작은 손잡이를 끌면 그 자리에 경유점이 새로 생긴다
// - 경유점 손잡이를 두 번 클릭(손가락이면 빠르게 두 번 누르기)하면 그 경유점이 지워진다 (선로가 짧아지니 돈은 들지 않는다)
// 마우스와 손가락(한 손가락으로 누른 채 움직이기) 모두 같은 동작을 한다
// 끄는 동안 마우스 옆에 바뀐 길이와 더 낼 공사비를 보여주고, 놓을 때 공사비를 낸다.
import { updateHandles, handleAt } from '../map/trackLayers.js';
import { findTrack, trackControlPoints } from '../game/state.js';
import { curveSegments } from '../game/trackShape.js';
import { rerouteCost, setTrackWaypoints } from '../game/build.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

// 손가락으로 두 번 누르기로 치는 간격 (밀리초)
const DOUBLE_TAP_MS = 400;

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
    const points = trackControlPoints({ ...track, waypoints });
    const handles = waypoints.map((coord, index) => ({ coord, kind: 'waypoint', index }));
    // 이웃한 두 점 사이 가운데: 끌면 index 자리에 새 경유점이 끼워진다 (곡선이면 곡선 위의 가운데)
    const segments = track.curve && points.length >= 3 ? curveSegments(points) : null;
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const middle = segments ? segments[i][Math.floor(segments[i].length / 2)] : [(x1 + x2) / 2, (y1 + y2) / 2];
      handles.push({ coord: middle, kind: 'midpoint', index: i });
    }
    updateHandles(map, handles);
  }

  // 손잡이를 누르면 끌기 시작 (event: 지도의 마우스·손가락 이벤트)
  function start(event) {
    const track = editableTrack();
    if (!track) return;
    const handle = handleAt(map, event.point);
    if (!handle) return;
    // 지도가 끌려 움직이지 않게 막는다
    event.preventDefault();
    const waypoints = track.waypoints.map((point) => [...point]);
    if (handle.kind === 'midpoint') waypoints.splice(handle.index, 0, event.lngLat.toArray());
    drag = { trackId: track.id, original: track.waypoints, waypoints, index: handle.index, kind: handle.kind, lastCoord: null };
    map.getCanvas().style.cursor = 'grabbing';
  }

  function move(event) {
    if (!drag) return;
    drag.lastCoord = event.lngLat.toArray();
    drag.waypoints[drag.index] = drag.lastCoord;
    ui.trackPreview = { id: drag.trackId, waypoints: drag.waypoints };
    renderTracks();

    const { addedKm, cost } = rerouteCost(findTrack(drag.trackId), drag.waypoints);
    const sign = addedKm >= 0 ? '+' : '−';
    const text = `${sign}${Math.abs(addedKm).toFixed(2)} km · ${cost > 0 ? `공사비 +${formatMoney(cost)}` : '공사비 없음'}`;
    const note = costNote(cost);
    cursorTip.show(event.point.x, event.point.y, note ? `${text} · ${note.text}` : text, note?.tone ?? 'info');
  }

  map.on('mousedown', start);
  map.on('mousemove', move);

  // 놓기. coord: 놓은 자리 (지도 밖에서 놓았으면 null: 바꾸지 않고 끝낸다)
  function finish(coord) {
    if (!drag) return;
    const { trackId, original, waypoints } = drag;
    drag = null;
    ui.trackPreview = null;
    cursorTip.hide();
    // 손잡이를 누르기만 하고 움직이지 않았으면 아무것도 바꾸지 않는다
    const moved = JSON.stringify(original) !== JSON.stringify(waypoints);
    if (coord && moved && !setTrackWaypoints(trackId, waypoints)) {
      const { cost } = rerouteCost(findTrack(trackId), waypoints);
      showCallout(map, coord, shortfall(cost), 'bad');
    }
    render();
  }
  map.on('mouseup', (event) => finish(event.lngLat.toArray()));
  // 지도 밖(패널 위 등)에서 놓은 경우 (지도는 그 mouseup을 받지 못한다)
  document.addEventListener('mouseup', (event) => {
    if (drag && !event.target.closest?.('#map')) finish(null);
  });

  // 경유점 하나를 지운다
  function removeWaypoint(track, index) {
    setTrackWaypoints(
      track.id,
      track.waypoints.filter((_, i) => i !== index),
    );
    render();
  }

  // 경유점 손잡이를 두 번 클릭하면 지운다
  map.on('dblclick', (event) => {
    const track = editableTrack();
    if (!track) return;
    const handle = handleAt(map, event.point);
    if (handle?.kind !== 'waypoint') return;
    // 두 번 클릭이 지도 확대로 이어지지 않게 막는다
    event.preventDefault();
    removeWaypoint(track, handle.index);
  });

  // 손가락: 한 손가락으로 누른 채 움직이면 끌기, 같은 경유점 손잡이를 빠르게 두 번 누르면 지우기
  let lastTap = null; // { trackId, index, time }
  map.on('touchstart', (event) => {
    if (event.points.length === 1) start(event);
  });
  map.on('touchmove', (event) => {
    if (drag && event.points.length === 1) move(event);
  });
  map.on('touchend', () => {
    if (!drag) return;
    const { trackId, index, kind, lastCoord } = drag;
    // 움직이지 않고 뗐으면 누르기: 같은 경유점을 빠르게 두 번 누르면 지운다
    if (!lastCoord && kind === 'waypoint') {
      const now = Date.now();
      const again = lastTap && lastTap.trackId === trackId && lastTap.index === index && now - lastTap.time < DOUBLE_TAP_MS;
      lastTap = again ? null : { trackId, index, time: now };
      finish(null);
      if (again) removeWaypoint(findTrack(trackId), index);
      return;
    }
    finish(lastCoord);
  });

  return { showHandles };
}
