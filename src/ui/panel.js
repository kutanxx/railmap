import { bindNameInput } from './nameInput.js';
import { formatPopulation, formatPeopleShort } from './format.js';
import { loadTone } from './routeList.js';
import { inkOn } from '../map/ink.js';

// 오른쪽 정보 패널: 고른 역 또는 선로의 카드. 노선 목록 자리에 잠시 갈아 끼운다 (app.js가 둘 중 하나만 보여준다).
// 맨 위 [← 노선 목록]·[✕]는 고른 것을 놓고 목록으로 돌아간다 (onClose, Esc와 같다).
// 역 카드: 이름(눌러서 고치기) · 환승/종착 · 지나는 노선 번호, 큰 숫자 셋(이용객, 주변 인구, 가장 붐빔),
// 한 줄 설명, [역 삭제], 접힌 "자세히"(승강장 방향, 인구를 센 근거, 위치)
// 선로 카드: 길이·구간·경유점, [직선][곡선] (onSetCurve), [선로 삭제]
// 상태를 직접 고치지 않고 onRename, onRotate, onSetCurve, onDeleteStation, onDeleteTrack으로 알려주기만 한다.

// onDeletePreview(true | false): 삭제 버튼에 마우스를 올리고 내릴 때 (지도에 사라질 것을 보여준다)
export function createPanel(
  element,
  { onRename, onRotate, onSetCurve, onDeleteStation, onDeleteTrack, onDeletePreview, onClose },
) {
  const head = `
      <div class="panel-head">
        <button type="button" class="panel-back">← 노선 목록</button>
        <button type="button" class="panel-close" title="닫기 (Esc)" aria-label="닫기">✕</button>
      </div>`;
  element.innerHTML = `
    <section class="panel-station">
      ${head}
      <div class="panel-station-name">
        <input class="panel-name panel-name-title" type="text" maxlength="20" title="눌러서 이름 바꾸기" aria-label="역 이름" />
        <span class="panel-station-tag"></span>
      </div>
      <div class="panel-badges"></div>
      <div class="panel-stats">
        <div class="panel-stat"><small>이용객</small><b class="panel-riders"></b></div>
        <div class="panel-stat"><small>주변 인구</small><b class="panel-population"></b></div>
        <div class="panel-stat"><small>가장 붐빔</small><b class="panel-load"></b></div>
      </div>
      <p class="panel-hint panel-station-note"></p>
      <button type="button" class="panel-delete panel-delete-station">역 삭제</button>
      <p class="panel-removal panel-station-removal"></p>
      <details class="panel-more">
        <summary>자세히</summary>
        <div class="panel-field">
          <span>방향 <b class="panel-angle-text"></b></span>
          <input class="panel-angle" type="range" min="0" max="175" step="5" />
          <div class="panel-angle-presets">
            <button type="button" data-angle="0">가로</button>
            <button type="button" data-angle="90">세로</button>
          </div>
        </div>
        <p class="panel-hint panel-population-source"></p>
        <div class="panel-coord"></div>
        <p class="panel-hint">이 역을 끌면 옮길 수 있어요. 이전 비용과 늘어난 선로 공사비가 들어요.</p>
      </details>
    </section>
    <section class="panel-track">
      ${head}
      <div class="panel-title">선로 정보</div>
      <dl class="panel-facts">
        <dt>길이</dt><dd class="panel-track-length"></dd>
        <dt>구간</dt><dd class="panel-track-ends"></dd>
        <dt>경유점</dt><dd class="panel-track-waypoints"></dd>
      </dl>
      <div class="panel-angle-presets panel-track-shape">
        <button type="button" data-curve="0">직선</button>
        <button type="button" data-curve="1">곡선</button>
      </div>
      <p class="panel-hint panel-track-shape-hint"></p>
      <p class="panel-hint">흰 점을 끌어서 경유점을 옮기고, 두 번 클릭해 지워요. 선 중간의 작은 점을 끌면 경유점이 생겨요.</p>
      <button type="button" class="panel-delete panel-delete-track">선로 삭제</button>
      <p class="panel-removal panel-track-removal"></p>
    </section>
  `;

  const stationSection = element.querySelector('.panel-station');
  const trackSection = element.querySelector('.panel-track');

  // ── 역 ──
  const nameInput = element.querySelector('.panel-name');
  const angleInput = element.querySelector('.panel-angle');
  const angleText = element.querySelector('.panel-angle-text');
  const anglePresets = element.querySelector('.panel-angle-presets');
  const coordText = element.querySelector('.panel-coord');
  const populationText = element.querySelector('.panel-population');
  const ridersText = element.querySelector('.panel-riders');
  const loadText = element.querySelector('.panel-load');
  const tagText = element.querySelector('.panel-station-tag');
  const badges = element.querySelector('.panel-badges');
  const noteText = element.querySelector('.panel-station-note');
  const sourceText = element.querySelector('.panel-population-source');
  for (const button of element.querySelectorAll('.panel-back, .panel-close')) {
    button.addEventListener('click', onClose);
  }
  // 노선이 하나도 없으면 돌아갈 목록이 없으므로 [← 노선 목록]을 숨긴다
  const backButtons = element.querySelectorAll('.panel-back');

  // 지금 보여주는 역 { id } 또는 선로 { id }
  let station = null;
  let track = null;
  const stationName = bindNameInput(nameInput, onRename);

  // 슬라이더를 움직이면 승강장을 돌린다
  angleInput.addEventListener('input', () => {
    if (station) onRotate(station.id, Number(angleInput.value));
  });
  for (const button of element.querySelectorAll('.panel-angle-presets button[data-angle]')) {
    button.addEventListener('click', () => {
      if (station) onRotate(station.id, Number(button.dataset.angle));
    });
  }

  element.querySelector('.panel-delete-station').addEventListener('click', () => {
    if (station) onDeleteStation(station.id);
  });
  for (const button of element.querySelectorAll('.panel-delete')) {
    button.addEventListener('mouseenter', () => onDeletePreview(true));
    button.addEventListener('mouseleave', () => onDeletePreview(false));
  }
  const stationRemoval = element.querySelector('.panel-station-removal');
  const trackRemoval = element.querySelector('.panel-track-removal');

  // ── 선로 ──
  const lengthText = element.querySelector('.panel-track-length');
  const endsText = element.querySelector('.panel-track-ends');
  const waypointsText = element.querySelector('.panel-track-waypoints');
  const shapeButtons = [...element.querySelectorAll('.panel-track-shape button')];
  const shapeHint = element.querySelector('.panel-track-shape-hint');
  for (const button of shapeButtons) {
    button.addEventListener('click', () => {
      if (track) onSetCurve(track.id, button.dataset.curve === '1');
    });
  }

  element.querySelector('.panel-delete-track').addEventListener('click', () => {
    if (track) onDeleteTrack(track.id);
  });

  // view = { station, sharedPopulation: 이웃 역과 나눈 뒤 인구, riders: 하루 이용객, averageRiders: 역 평균,
  //          angle: 화면에 보이는 승강장 방향, followsTrack: 선로 모양을 따르는지, removal: 지우면 사라지는 것,
  //          tag: '환승' | '종착' | '', routes: 지나는 노선 [{ number, color }],
  //          maxLoad: 둘레 구간의 가장 높은 혼잡도 (열차가 안 다니면 null) }
  function showStation(view) {
    const { station: nextStation, sharedPopulation, riders, averageRiders, angle, followsTrack } = view;
    tagText.textContent = view.tag ? `${view.tag}역` : '';
    badges.replaceChildren(
      ...view.routes.map((route) => {
        const badge = document.createElement('span');
        badge.className = 'route-item-dot';
        badge.style.background = route.color;
        badge.style.color = inkOn(route.color);
        badge.textContent = route.number;
        return badge;
      }),
    );
    station = { id: nextStation.id };
    stationRemoval.textContent = view.removal;
    stationName.show(nextStation.id, nextStation.name);
    // 선로가 이어진 역은 승강장이 선로를 따라 휘므로 방향을 직접 돌릴 수 없다
    angleInput.hidden = followsTrack;
    anglePresets.hidden = followsTrack;
    angleInput.value = Math.round(angle / 5) * 5;
    angleText.textContent = followsTrack ? '선로 모양을 따라가요' : angleLabel(Math.round(angle));
    // 큰 숫자 셋: 하루 이용객(이 역에서 타고 내린 사람), 이웃 역과 나눈 뒤 주변 인구, 둘레 구간의 가장 높은 혼잡도
    ridersText.textContent = `${formatPeopleShort(riders)}명`;
    populationText.textContent = `${formatPeopleShort(sharedPopulation)}명`;
    loadText.textContent = view.maxLoad === null ? '-' : `${Math.round(view.maxLoad * 100)}%`;
    loadText.className = `panel-load ${view.maxLoad === null ? '' : loadTone(view.maxLoad)}`;
    // 한 줄 설명: 역 평균과 비교 (노선이 없으면 그 사실)
    const average = formatPopulation(averageRiders);
    if (riders === 0) noteText.textContent = '아직 이 역을 지나는 노선이 없어요.';
    else if (riders >= averageRiders) noteText.textContent = `역 평균(${average})보다 이용객이 많아요.`;
    else noteText.textContent = `역 평균(${average})보다 이용객이 적어요.`;
    // 자세히: 인구를 어떻게 셌는지. 건물 면적으로 추정했으면 면적을, 못 쟀으면 기본값이라고 알려준다
    // 이웃 역과 나눠서 (1% 넘게) 줄었으면 나누기 전 인구도 함께 보여준다
    const source =
      nextStation.builtArea === null
        ? '주변 인구는 기본값이에요 (건물을 재지 못했어요)'
        : `주변 인구는 반경 안 건물 ${(nextStation.builtArea / 10000).toFixed(1)}만 ㎡로 셌어요`;
    const shared =
      sharedPopulation < nextStation.population * 0.99
        ? `. 이웃 역과 나눠서 줄었어요 (원래 ${formatPopulation(nextStation.population)})`
        : '';
    sourceText.textContent = source + shared;
    const [lng, lat] = nextStation.coord;
    coordText.textContent = `위도 ${lat.toFixed(5)}, 경도 ${lng.toFixed(5)}`;
  }

  // info = { id, lengthKm, bridgeKm·tunnelKm: 교량·터널 길이, fromName, toName, waypointCount, curve: 곡선인지 }, removal: 지우면 사라지는 것
  function showTrack(info, removal) {
    track = { id: info.id };
    trackRemoval.textContent = removal;
    // 교량·터널 구간이 있으면 그 길이도 함께 적는다
    const structures = [];
    if (info.bridgeKm >= 0.01) structures.push(`교량 ${info.bridgeKm.toFixed(2)} km`);
    if (info.tunnelKm >= 0.01) structures.push(`터널 ${info.tunnelKm.toFixed(2)} km`);
    const detail = structures.length ? ` (${structures.join(' · ')})` : '';
    lengthText.textContent = `${info.lengthKm.toFixed(2)} km${detail}`;
    endsText.textContent = `${info.fromName} ↔ ${info.toName}`;
    waypointsText.textContent = `${info.waypointCount}개`;
    // 지금 모양은 남색으로 채운다. 곡선은 경유점이 있어야 휜다
    for (const button of shapeButtons) button.classList.toggle('active', (button.dataset.curve === '1') === info.curve);
    shapeHint.textContent =
      info.curve && info.waypointCount === 0
        ? '경유점이 없으면 곡선도 곧게 이어져요. 선 가운데 작은 점을 끌어 경유점을 만들어 보세요.'
        : '곡선은 경유점을 모두 지나는 부드러운 선이에요. 좁게 휠수록 열차가 느려져요.';
  }

  // view = { type: 'station', station } | { type: 'track', track: info } | null (숨김)
  function show(view) {
    if (view?.type !== 'station') {
      station = null;
      stationName.clear();
    }
    if (view?.type !== 'track') track = null;
    element.hidden = !view;
    for (const button of backButtons) button.hidden = !view?.hasRoutes;
    stationSection.hidden = view?.type !== 'station';
    trackSection.hidden = view?.type !== 'track';
    if (view?.type === 'station') showStation(view);
    if (view?.type === 'track') showTrack(view.track, view.removal);
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
