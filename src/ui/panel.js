import { bindNameInput } from './nameInput.js';

// 오른쪽 정보 패널. 선택한 역 또는 선로의 정보를 보여주고 고치거나 지운다.
// 상태를 직접 고치지 않고 onRename, onRotate, onDeleteStation, onDeleteTrack으로 알려주기만 한다.

export function createPanel(element, { onRename, onRotate, onDeleteStation, onDeleteTrack }) {
  element.innerHTML = `
    <section class="panel-station">
      <div class="panel-title">역 정보</div>
      <label class="panel-field">
        <span>이름</span>
        <input class="panel-name" type="text" maxlength="20" />
      </label>
      <div class="panel-field">
        <span>방향 <b class="panel-angle-text"></b></span>
        <input class="panel-angle" type="range" min="0" max="175" step="5" />
        <div class="panel-angle-presets">
          <button type="button" data-angle="0">가로</button>
          <button type="button" data-angle="90">세로</button>
        </div>
      </div>
      <div class="panel-coord"></div>
      <button type="button" class="panel-delete panel-delete-station">역 삭제</button>
    </section>
    <section class="panel-track">
      <div class="panel-title">선로 정보</div>
      <dl class="panel-facts">
        <dt>길이</dt><dd class="panel-track-length"></dd>
        <dt>구간</dt><dd class="panel-track-ends"></dd>
        <dt>경유점</dt><dd class="panel-track-waypoints"></dd>
      </dl>
      <button type="button" class="panel-delete panel-delete-track">선로 삭제</button>
    </section>
  `;

  const stationSection = element.querySelector('.panel-station');
  const trackSection = element.querySelector('.panel-track');

  // ── 역 ──
  const nameInput = element.querySelector('.panel-name');
  const angleInput = element.querySelector('.panel-angle');
  const angleText = element.querySelector('.panel-angle-text');
  const coordText = element.querySelector('.panel-coord');

  // 지금 보여주는 역 { id } 또는 선로 { id }
  let station = null;
  let track = null;
  const stationName = bindNameInput(nameInput, onRename);

  // 슬라이더를 움직이면 승강장을 돌린다
  angleInput.addEventListener('input', () => {
    if (station) onRotate(station.id, Number(angleInput.value));
  });
  for (const button of element.querySelectorAll('.panel-angle-presets button')) {
    button.addEventListener('click', () => {
      if (station) onRotate(station.id, Number(button.dataset.angle));
    });
  }

  element.querySelector('.panel-delete-station').addEventListener('click', () => {
    if (station) onDeleteStation(station.id);
  });

  // ── 선로 ──
  const lengthText = element.querySelector('.panel-track-length');
  const endsText = element.querySelector('.panel-track-ends');
  const waypointsText = element.querySelector('.panel-track-waypoints');

  element.querySelector('.panel-delete-track').addEventListener('click', () => {
    if (track) onDeleteTrack(track.id);
  });

  function showStation(nextStation) {
    station = { id: nextStation.id };
    stationName.show(nextStation.id, nextStation.name);
    angleInput.value = nextStation.angle;
    angleText.textContent = angleLabel(nextStation.angle);
    const [lng, lat] = nextStation.coord;
    coordText.textContent = `위도 ${lat.toFixed(5)}, 경도 ${lng.toFixed(5)}`;
  }

  // info = { id, lengthKm, fromName, toName, waypointCount }
  function showTrack(info) {
    track = { id: info.id };
    lengthText.textContent = `${info.lengthKm.toFixed(2)} km`;
    endsText.textContent = `${info.fromName} ↔ ${info.toName}`;
    waypointsText.textContent = `${info.waypointCount}개`;
  }

  // view = { type: 'station', station } | { type: 'track', track: info } | null (숨김)
  function show(view) {
    if (view?.type !== 'station') {
      station = null;
      stationName.clear();
    }
    if (view?.type !== 'track') track = null;
    element.hidden = !view;
    stationSection.hidden = view?.type !== 'station';
    trackSection.hidden = view?.type !== 'track';
    if (view?.type === 'station') showStation(view.station);
    if (view?.type === 'track') showTrack(view.track);
  }

  show(null);
  return { show };
}

// 각도를 읽기 쉬운 말로: 0 → "가로", 90 → "세로", 그 밖에는 "45°"
function angleLabel(angle) {
  if (angle === 0) return '가로';
  if (angle === 90) return '세로';
  return `${angle}°`;
}
