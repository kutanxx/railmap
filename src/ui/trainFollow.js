// 열차 따라가기 카메라: [선택] 도구로 열차를 누르면 화면 가운데에 그 열차를 두고 따라간다 (구경용, 운전이 아니다).
// 북쪽이 위인 채로 가운데만 옮긴다 (지도를 돌리지 않아 멀미가 나지 않게). 확대·축소는 그대로 할 수 있다 (가운데 기준).
// 아래 가운데 막대: "2호선 3-1 열차 · 다음 역 서면" + [그만 보기]. 지도를 끌거나, Esc, [그만 보기], 열차가 없어지면 끝난다.
// 막대는 선로 그리기 막대(drawBar.js)와 같은 모양을 쓴다 (styles/mobile.css의 .draw-bar)
import { FOCUS_ZOOM } from '../config.js';
import { findRoute, findStation } from '../game/state.js';
import { trainInfo } from '../game/sim.js';

// 열차 id "r3-1" → 번호표 "3-1" (지도 위 열차 번호표와 같다, map/trainLayers.js)
const trainLabel = (trainId) => trainId.slice(1);

export function createTrainFollow({ map }) {
  const bar = document.createElement('div');
  bar.className = 'draw-bar follow-bar';
  bar.hidden = true;
  bar.innerHTML = `
    <span class="draw-bar-text" aria-live="polite"></span>
    <button type="button" class="hud-button follow-stop" aria-keyshortcuts="Escape">그만 보기</button>
  `;
  document.body.append(bar);
  const text = bar.querySelector('.draw-bar-text');
  bar.querySelector('.follow-stop').addEventListener('click', () => stop());

  let following = null; // 따라가는 열차 id
  let frame = null;
  let shown = '';

  // 열차 이야기 한 줄: "2호선 3-1 열차 · 다음 역 서면" (역에 서 있으면 "서면에 서 있어요")
  function describe(trainId, info) {
    const route = findRoute(info.routeId);
    const station = info.stationId ? findStation(info.stationId)?.name : null;
    const where = !station ? '' : info.stopped ? ` · ${station}에 서 있어요` : ` · 다음 역 ${station}`;
    return `${route?.name ?? ''} ${trainLabel(trainId)} 열차${where}`;
  }

  function tick() {
    const info = following && trainInfo(following);
    if (!info) {
      stop();
      return;
    }
    map.jumpTo({ center: info.coord });
    const line = describe(following, info);
    if (line !== shown) text.textContent = shown = line;
    frame = requestAnimationFrame(tick);
  }

  function start(trainId) {
    const info = trainInfo(trainId);
    if (!info) return;
    stop();
    following = trainId;
    // 멀리서 눌렀으면 열차가 잘 보이게 다가간다 (움직임 줄이기 설정이면 MapLibre가 바로 옮긴다)
    if (map.getZoom() < FOCUS_ZOOM) map.jumpTo({ center: info.coord, zoom: FOCUS_ZOOM });
    // 휠로 확대·축소해도 열차가 가운데에 남게
    map.scrollZoom.enable({ around: 'center' });
    bar.hidden = false;
    bar.style.bottom = `${window.innerHeight - document.querySelector('.bottom-left').getBoundingClientRect().top + 8}px`;
    window.addEventListener('keydown', onKey, true);
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (!following) return;
    following = null;
    shown = '';
    cancelAnimationFrame(frame);
    frame = null;
    map.scrollZoom.enable();
    bar.hidden = true;
    window.removeEventListener('keydown', onKey, true);
  }

  // Esc는 따라가기만 끝낸다 (고른 것 풀기 같은 다른 Esc 동작은 하지 않게 먼저 받는다)
  function onKey(event) {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    stop();
  }

  // 손으로 지도를 끌면 그만 따라간다 (사람이 카메라를 잡았으니)
  map.on('dragstart', stop);

  return { start, stop, isFollowing: () => following !== null };
}
