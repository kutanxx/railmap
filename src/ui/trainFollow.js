// 열차 따라가기 카메라: [선택] 도구로 열차를 누르면 화면 가운데에 그 열차를 두고 따라간다 (구경용, 운전이 아니다).
// 북쪽이 위인 채로 가운데만 옮긴다 (지도를 돌리지 않아 멀미가 나지 않게). 확대·축소는 그대로 할 수 있다 (가운데 기준).
// 아래 가운데 막대: "2호선 3-1 열차 · 다음 역 서면" + [그만 보기]. 지도를 끌거나, Esc, [그만 보기], 열차가 없어지면 끝난다.
// 막대는 선로 그리기 막대(drawBar.js)와 같은 모양을 쓴다 (styles/mobile.css의 .draw-bar)
import { FOCUS_ZOOM } from '../config.js';
import { findRoute, findStation } from '../game/state.js';
import { trainInfo } from '../game/sim.js';
import { barBottom } from './drawBar.js';

// 열차 id "r3-1" → 번호표 "3-1" (지도 위 열차 번호표와 같다, map/trainLayers.js)
const trainLabel = (trainId) => trainId.slice(1);

// 휠을 굴린 뒤 이만큼(ms)은 카메라를 옮기지 않는다 (휠 확대가 몇 프레임에 걸쳐 끝나게)
const WHEEL_HOLD_MS = 400;

// Esc를 먼저 받아야 하는 것이 열려 있는지: 가운데 창, 찾기 칸, 펼친 버튼([메뉴]·[소리]·[목표] 등), 노선도
const otherEscOpen = () =>
  document.body.classList.contains('diagram-open') ||
  Boolean(document.querySelector('.dialog-backdrop:not([hidden]), .search-box:not([hidden]), button[aria-expanded="true"]'));

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
  // 지도를 누르고 있는 손가락·마우스, 휠을 굴리는 중인지. 그동안은 카메라를 옮기지 않는다
  // (매 프레임 옮기면 MapLibre가 끌기·휠·두 손가락 조작을 처음부터 다시 재서 지도가 움직이지 않는다)
  const pressed = new Set();
  let wheelTimer = null;
  // 지금 카메라를 옮기는 것이 따라가기 자신인지 (다른 코드가 옮기면 따라가기를 끝낸다)
  let ownMove = false;
  const moveCamera = (options) => {
    ownMove = true;
    map.jumpTo(options);
    ownMove = false;
  };

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
    if (pressed.size === 0 && !wheelTimer) moveCamera({ center: info.coord });
    const line = describe(following, info);
    if (line !== shown) text.textContent = shown = line;
    frame = requestAnimationFrame(tick);
  }

  // 왼쪽 아래 버튼 줄 바로 위에 (창 크기가 바뀌면 다시)
  const placeBar = () => {
    bar.style.bottom = barBottom();
  };

  function start(trainId) {
    const info = trainInfo(trainId);
    if (!info) return;
    stop();
    following = trainId;
    // 멀리서 눌렀으면 열차가 잘 보이게 다가간다 (움직임 줄이기 설정이면 MapLibre가 바로 옮긴다)
    moveCamera({ center: info.coord, zoom: Math.max(map.getZoom(), FOCUS_ZOOM) });
    // 휠로 확대·축소해도 열차가 가운데에 남게 (이미 켜져 있으면 enable이 설정을 바꾸지 않아 껐다 켠다)
    map.scrollZoom.disable();
    map.scrollZoom.enable({ around: 'center' });
    bar.hidden = false;
    placeBar();
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', placeBar);
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    if (!following) return;
    following = null;
    shown = '';
    cancelAnimationFrame(frame);
    frame = null;
    pressed.clear();
    clearTimeout(wheelTimer);
    wheelTimer = null;
    map.scrollZoom.disable();
    map.scrollZoom.enable();
    bar.hidden = true;
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', placeBar);
  }

  // Esc는 따라가기만 끝낸다 (고른 것 풀기 같은 다른 Esc 동작은 하지 않게 먼저 받는다)
  // 창·찾기 칸·펼침·노선도가 열려 있으면 그쪽이 먼저 Esc를 받는다
  function onKey(event) {
    if (event.key !== 'Escape' || otherEscOpen()) return;
    event.stopPropagation();
    stop();
  }

  // 누르고 있는 동안·휠을 굴리는 동안은 카메라를 옮기지 않는다
  const canvas = map.getCanvasContainer();
  canvas.addEventListener('pointerdown', (event) => {
    if (following) pressed.add(event.pointerId);
  });
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, (event) => pressed.delete(event.pointerId));
  }
  canvas.addEventListener(
    'wheel',
    () => {
      if (!following) return;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelTimer = null;
      }, WHEEL_HOLD_MS);
    },
    { passive: true },
  );

  // 손으로 지도를 끌면 그만 따라간다 (사람이 카메라를 잡았으니). 두 손가락은 확대라서 그대로
  map.on('dragstart', (event) => {
    if (event.originalEvent?.touches?.length >= 2) return;
    stop();
  });
  // 다른 코드가 카메라를 옮기면(찾기, 노선도에서 역 누르기, [알림] 목록, 만약에 노선 등) 그쪽을 보여주고 그만 따라간다.
  // 사람이 누르고 있거나 휠을 굴리는 중(휠 확대는 originalEvent가 없다)이거나 키보드 확대(originalEvent가 있다)는 그대로 둔다
  map.on('movestart', (event) => {
    if (!following || ownMove || event.originalEvent || pressed.size > 0 || wheelTimer) return;
    stop();
  });

  return { start, stop, isFollowing: () => following !== null };
}
