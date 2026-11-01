// 노선망이 자란 모습 다시 보기 ([메뉴]의 [노선망 자란 모습 보기]).
// 짓기 기록(game/buildLog.js)을 처음부터 차례로 펼쳐, 빈 지도에서 선로·역·노선이 지은 순서대로 생겨나는 모습을 보여준다.
// 기록이 많든 적든 TIMELAPSE_SECONDS쯤에 끝나게 장면 사이 시간을 맞춘다. 보는 동안 게임은 멈추고, 게임 레이어와 버튼은 숨긴다.
// 아래 막대: 날짜·역 수, 진행 막대, [❚❚ 멈춤 / ▶ 다시 재생], [영상 저장](처음부터 다시 틀며 녹화, ui/timelapseRecorder.js), [✕]
// 키: Esc 닫기, Space 멈춤·다시 재생. 다른 키는 뒤의 게임에 닿지 않게 막는다.
import {
  TIMELAPSE_SECONDS,
  TIMELAPSE_MIN_STEP_MS,
  TIMELAPSE_MAX_STEP_MS,
  TIMELAPSE_START_HOLD_MS,
  TIMELAPSE_END_HOLD_MS,
} from '../config.js';
import { getState, setSpeed } from '../game/state.js';
import { getRegion } from '../game/region.js';
import { buildLogFrames } from '../game/buildLog.js';
import { gameLayerIds } from '../map/gameLayers.js';
import { addTimelapseLayers, removeTimelapseLayers, showTimelapseFrame } from '../map/timelapseLayers.js';
import { applyMapTheme } from '../map/theme.js';
import { canRecord, startRecording } from './timelapseRecorder.js';

const EMPTY_FRAME = { stations: new Map(), tracks: new Map(), routes: new Map() };

// 날짜 글: 기록 전부터 있던 노선망, 실제 개통 연도(타임머신이 쓰는 서울 실제 노선망: "1985년 · 실제 개통"), 게임 날짜
const dateText = (frame) => {
  if (frame.before) return '기록 전부터 있던 노선망';
  if (frame.history) return `${frame.year}년 · 실제 개통`;
  return `${frame.year}년 ${frame.month}월`;
};
const countText = (frame) => `역 ${frame.stations.size} · 노선 ${frame.routes.size}`;

// notice: 말풍선 알림, select·render: 고른 것 풀기와 다시 그리기, controlRoom(): 관제실 모드인지 (app.js)
// 결과: { open, close, isOpen }
export function createTimelapse({ map, notice, select, render, controlRoom }) {
  const bar = document.createElement('div');
  bar.className = 'timelapse-bar';
  bar.hidden = true;
  bar.innerHTML = `
    <div class="timelapse-text">
      <span class="timelapse-date" aria-live="polite"></span>
      <span class="timelapse-count"></span>
    </div>
    <div class="timelapse-progress" aria-hidden="true"><div class="timelapse-progress-fill"></div></div>
    <button type="button" class="hud-button timelapse-play"></button>
    <button type="button" class="hud-button timelapse-record">영상 저장</button>
    <button type="button" class="hud-button timelapse-close" aria-label="다시 보기 닫기" aria-keyshortcuts="Escape">✕</button>
  `;
  document.body.append(bar);
  const dateLabel = bar.querySelector('.timelapse-date');
  const countLabel = bar.querySelector('.timelapse-count');
  const fill = bar.querySelector('.timelapse-progress-fill');
  const playButton = bar.querySelector('.timelapse-play');
  const recordButton = bar.querySelector('.timelapse-record');

  let frames = [];
  let index = -1; // 지금 보여주는 장면 (-1: 처음 빈 지도)
  let timer = null;
  let playing = false;
  let recorder = null;
  let saved = null; // 열기 전 모습 { speed, camera, hiddenLayers }

  // 지금 막대·영상에 쓰는 글
  const shownDate = () => (index < 0 ? '빈 지도' : dateText(frames[index]));
  const shownCount = () => countText(index < 0 ? EMPTY_FRAME : frames[index]);

  function show(next) {
    index = next;
    showTimelapseFrame(map, index < 0 ? EMPTY_FRAME : frames[index]);
    dateLabel.textContent = shownDate();
    countLabel.textContent = shownCount();
    fill.style.width = `${((index + 1) / frames.length) * 100}%`;
    recorder?.frame();
  }

  function updateButtons() {
    playButton.textContent = playing ? '❚❚ 멈춤' : '▶ 다시 재생';
    playButton.disabled = Boolean(recorder);
    recordButton.disabled = Boolean(recorder) || !canRecord();
    recordButton.textContent = recorder ? '녹화 중…' : '영상 저장';
    recordButton.title = canRecord() ? '처음부터 다시 틀며 영상 파일로 저장해요' : '이 브라우저는 영상 저장을 못 해요';
  }

  // 기록이 많든 적든 TIMELAPSE_SECONDS쯤에 끝나게
  const stepMs = () =>
    Math.min(TIMELAPSE_MAX_STEP_MS, Math.max(TIMELAPSE_MIN_STEP_MS, (TIMELAPSE_SECONDS * 1000) / frames.length));

  function tick() {
    if (index + 1 < frames.length) {
      show(index + 1);
      timer = setTimeout(tick, index + 1 < frames.length ? stepMs() : TIMELAPSE_END_HOLD_MS);
      return;
    }
    // 다 보여주고 마지막 모습을 잠깐 둔 뒤
    timer = null;
    playing = false;
    if (recorder) finishRecording();
    updateButtons();
  }

  // 처음 빈 지도부터 다시 튼다
  function playFromStart() {
    clearTimeout(timer);
    show(-1);
    playing = true;
    timer = setTimeout(tick, TIMELAPSE_START_HOLD_MS);
    updateButtons();
  }

  function togglePlay() {
    if (recorder) return;
    if (playing) {
      clearTimeout(timer);
      timer = null;
      playing = false;
    } else if (index + 1 < frames.length) {
      // 멈춘 자리에서 이어서
      playing = true;
      timer = setTimeout(tick, stepMs());
    } else {
      playFromStart();
      return;
    }
    updateButtons();
  }

  function startVideo() {
    if (recorder || !canRecord()) return;
    const region = getRegion();
    recorder = startRecording(map, () => ({
      title: `레일맵 · ${region.name}`,
      date: shownDate(),
      count: shownCount(),
      credit: region.virtual ? '레일맵 · 가상 지도 · 글꼴 OpenFreeMap' : '지도 © OpenFreeMap · OpenStreetMap 기여자',
    }));
    document.addEventListener('visibilitychange', stopIfHidden);
    notice('녹화를 시작해요. 끝날 때까지 이 창을 가리지 마세요');
    playFromStart();
  }

  // 창이 가려지거나 다른 탭으로 가면 브라우저가 지도를 그리지 않아 영상이 끊긴다. 그때는 녹화를 그만두고 알린다
  function stopIfHidden() {
    if (!document.hidden || !recorder) return;
    cancelRecording();
    clearTimeout(timer);
    timer = null;
    playing = false;
    updateButtons();
    notice('창이 가려져서 녹화를 멈췄어요. [영상 저장]을 다시 눌러 주세요', 'warn');
  }

  function cancelRecording() {
    document.removeEventListener('visibilitychange', stopIfHidden);
    recorder?.cancel();
    recorder = null;
  }

  async function finishRecording() {
    const fileName = `레일맵 ${getRegion().name} 노선망`;
    const done = recorder;
    recorder = null;
    document.removeEventListener('visibilitychange', stopIfHidden);
    await done.finish(fileName);
    notice(`영상을 저장했어요 (${fileName})`);
    updateButtons();
  }

  // 키: Esc 닫기, Space 멈춤·다시 재생. 다른 키는 뒤의 게임(mapInput.js)에 닿지 않게 먼저 받아 막는다
  function onKey(event) {
    event.stopPropagation();
    if (event.key === 'Escape') close();
    else if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    }
  }

  function open() {
    if (saved) return;
    frames = buildLogFrames();
    if (frames.length === 0) {
      notice('아직 지은 것이 없어요. 역과 선로를 지으면 자란 모습을 다시 볼 수 있어요', 'bad');
      return;
    }
    select(null);
    render();
    saved = {
      speed: getState().speed,
      camera: { center: map.getCenter(), zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() },
      hiddenLayers: gameLayerIds().filter((id) => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== 'none'),
    };
    setSpeed(0);
    for (const id of saved.hiddenLayers) map.setLayoutProperty(id, 'visibility', 'none');
    addTimelapseLayers(map);
    applyMapTheme(map, controlRoom());
    document.body.classList.add('timelapse-on');
    bar.hidden = false;
    window.addEventListener('keydown', onKey, true);
    fitFinalNetwork();
    playFromStart();
    playButton.focus();
  }

  // 다 자란 노선망이 화면에 들어오게 (아래 막대와 영상의 왼쪽 위 글 자리를 비운다)
  function fitFinalNetwork() {
    const coords = [...frames.at(-1).stations.values()].map(([, lng, lat]) => [lng, lat]);
    if (coords.length === 0) return;
    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: { top: 130, bottom: 110, left: 60, right: 60 }, maxZoom: 15, bearing: 0, pitch: 0, animate: false },
    );
  }

  function close() {
    if (!saved) return;
    clearTimeout(timer);
    timer = null;
    playing = false;
    cancelRecording();
    window.removeEventListener('keydown', onKey, true);
    removeTimelapseLayers(map);
    for (const id of saved.hiddenLayers) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
    document.body.classList.remove('timelapse-on');
    bar.hidden = true;
    map.jumpTo(saved.camera);
    setSpeed(saved.speed);
    saved = null;
    render();
  }

  playButton.addEventListener('click', togglePlay);
  recordButton.addEventListener('click', startVideo);
  bar.querySelector('.timelapse-close').addEventListener('click', close);

  return { open, close, isOpen: () => saved !== null };
}
