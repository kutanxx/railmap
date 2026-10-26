import { bindNameInput } from './nameInput.js';
import { formatPopulation } from './format.js';

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
      <dl class="panel-facts panel-station-facts">
        <dt>주변 인구</dt><dd class="panel-population"></dd>
        <dt>하루 이용객</dt><dd class="panel-riders"></dd>
      </dl>
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
  const populationText = element.querySelector('.panel-population');
  const ridersText = element.querySelector('.panel-riders');

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

  // view = { station, sharedPopulation: 이웃 역과 나눈 뒤 인구, riders: 하루 이용객, averageRiders: 역 평균 }
  function showStation({ station: nextStation, sharedPopulation, riders, averageRiders }) {
    station = { id: nextStation.id };
    stationName.show(nextStation.id, nextStation.name);
    angleInput.value = nextStation.angle;
    angleText.textContent = angleLabel(nextStation.angle);
    // 큰 글씨로 숫자, 그 아래 작은 글씨로 설명
    // 건물 면적으로 추정했으면 면적을, 못 쟀으면 기본값이라고 알려준다
    // 이웃 역과 나눠서 줄었으면 나누기 전 인구도 함께 보여준다
    const source =
      nextStation.builtArea === null
        ? '기본값'
        : `건물 ${(nextStation.builtArea / 10000).toFixed(1)}만 ㎡`;
    const shared =
      // 아주 조금 줄어든 건 (1% 미만) 굳이 알리지 않는다
      sharedPopulation < nextStation.population * 0.99
        ? ` · 이웃 역과 나눔 (원래 ${formatPopulation(nextStation.population)})`
        : '';
    showFact(populationText, formatPopulation(sharedPopulation), source + shared);
    // 하루 이용객 = 이 역에서 타고 내린 사람. 노선이 없으면 0
    if (riders > 0) {
      showFact(ridersText, formatPopulation(riders), `타고 내린 사람 · 역 평균 ${formatPopulation(averageRiders)}`);
    } else {
      showFact(ridersText, '0명', '아직 이 역을 지나는 노선이 없어요');
    }
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
    if (view?.type === 'station') showStation(view);
    if (view?.type === 'track') showTrack(view.track);
  }

  show(null);
  return { show };
}

// 숫자(굵게) + 설명(작은 글씨, 다음 줄)을 칸에 넣는다
function showFact(element, value, detail) {
  const small = document.createElement('small');
  small.textContent = detail;
  element.replaceChildren(value, small);
}

// 각도를 읽기 쉬운 말로: 0 → "가로", 90 → "세로", 그 밖에는 "45°"
function angleLabel(angle) {
  if (angle === 0) return '가로';
  if (angle === 90) return '세로';
  return `${angle}°`;
}
