// 효과음: 소리 파일 없이 Web Audio로 만든다. 설계 근거는 docs/sound-research.md.
// - 음색은 지도마다 다르다 (config.js REGIONS의 soundStyle, instruments.js의 PALETTES):
//   서울은 대금 같은 국악 관악기풍, 솔내 지방은 마림바(나무 건반)풍, 'bell'은 벨·마림바 섞음
// - 노선 개통은 레일맵만의 네 음 차임, 새 노선의 첫 열차가 떠날 때는 멀리서 들리는 듯한 짧은 경적 (경적은 지도와 상관없이 같다)
//   차임은 처음부터 새로 만든 음 순서다. 실제 역 멜로디(환승 음악, 발차 멜로디 등)의 음 순서는 옮기지 않는다
// - 큰 소리(개통, 경적)가 나는 동안은 열차 소리와 배경 음악을 잠깐 줄인다 (덕킹)
// - 열차 도착음은 노선마다 다른 음이다 (ARRIVAL_NOTES). 짧은 동안 선 열차들은 묶어서 최대 몇 음만 낸다
//   가까이 볼 때(ARRIVAL_SOUND_MIN_ZOOM 이상) 화면 안 열차만 소리를 낸다 (ui/animation.js)
// - 아주 가까이 보면 열차 한 대의 레일 덜컹 소리 (ui/railClack.js가 고른다)
// - 모든 음은 config.js의 SOUND_NOTES(도·레·미·솔·라 5음 음계) 안에서만 고른다. 겹쳐도 부딪치지 않게
// - 소리 길은 soundEngine.js (묶음 → 울림 → 전체 음량 → 압축기), 악기는 instruments.js, 배경 음악은 music.js
// - 매번 크기와 길이를 조금씩 바꿔서 똑같이 반복되지 않게 한다
// - 소리 끄기와 음량은 브라우저에 기억한다
import {
  SOUND_NOTES,
  SOUND_LEVELS,
  SOUND_PEAK,
  DEFAULT_SOUND_VOLUME,
  SOUND_VARIATION,
  ARRIVAL_SOUND_GAP_SECONDS,
  ARRIVAL_NOTES,
  MAX_ARRIVAL_NOTES,
  ARRIVAL_NOTE_SPACING,
} from '../config.js';
import { audio, setMasterGain, duck, fromDb } from './soundEngine.js';
import { paletteFor, play, strikeClack } from './instruments.js';

const MUTED_KEY = 'railmap-muted';
const VOLUME_KEY = 'railmap-volume';

// 소리마다: 악기(지도 음색을 따르지 않는 소리만), 묶음, 음 이름들과 시작 시각(초), 길이 배율
const SOUNDS = {
  station: { group: 'event', notes: [['E5', 0]], length: 0.6 }, // 역 놓기: 미 한 번
  track: { group: 'event', notes: [['C5', 0], ['E5', 0.14]], length: 0.6 }, // 선로 완성: 도→미
  // 개통: 도·미·라·솔 — 올라갔다가 한 칸 내려와 마무리하는 새 차임 (FM 벨)
  open: { group: 'event', notes: [['C5', 0], ['E5', 0.18], ['A5', 0.36], ['G5', 0.56]], length: 1 },
  // 경적: 도·미·솔·라를 한 옥타브 낮게 한꺼번에 (장6화음, 실제 열차 경적과 같은 성격의 화음)
  horn: { instrument: 'horn', group: 'event', notes: [['C5', 0], ['E5', 0], ['G5', 0], ['A5', 0]], length: 1 },
  arrive: { group: 'train', notes: [['A5', 0]], length: 0.7 }, // 열차 도착 (음은 노선마다 바뀐다)
};

let muted = localStorage.getItem(MUTED_KEY) === '1';
let volume = readVolume();
let lastArrival = 0;
let eventBusyUntil = 0; // 개통 차임이 울리는 동안 (오디오 시계). 경적은 그 뒤에 울린다
let lastHorn = -Infinity;
let lastArrivalNote = null; // 바로 전에 낸 열차 음 (같은 음이 연달아 나지 않게)
const pendingArrivals = new Set(); // 이번 묶음 동안 열차가 선 노선들의 음

function readVolume() {
  const saved = Number(localStorage.getItem(VOLUME_KEY));
  return localStorage.getItem(VOLUME_KEY) !== null && saved >= 0 && saved <= 1 ? saved : DEFAULT_SOUND_VOLUME;
}

// 막대 값(0~1)을 실제 크기로: 귀는 작은 소리 쪽 차이를 더 크게 느끼므로 제곱해서 쓴다
const masterGain = () => (muted ? 0 : volume * volume);
setMasterGain(masterGain());

// 1 ± SOUND_VARIATION 사이의 무작위 배율
const vary = () => 1 + (Math.random() * 2 - 1) * SOUND_VARIATION;

// name: SOUNDS의 이름. notes: 음 목록을 바꿔 낼 때 [[음 이름, 시작 초], …] (없으면 SOUNDS 그대로)
export function playSound(name, notes) {
  if (muted || volume === 0) return;
  const { context, groups } = audio();
  const sound = SOUNDS[name];
  const played = notes ?? sound.notes;
  let start = context.currentTime + 0.01;
  if (name === 'horn') {
    // 경적은 드물어야 한다: 3초 안에 또 울리지 않고, 개통 차임이 울리는 중이면 끝난 뒤에 울린다
    if (start - lastHorn < 3) return;
    start = Math.max(start, eventBusyUntil);
    lastHorn = start;
  }
  // 악기: 경적처럼 정해진 것이 아니면 지금 지도의 음색을 따른다
  const [instrument, trim] = sound.instrument ? [sound.instrument, 0] : paletteFor(name);
  // 음이 여러 개면 겹쳐서 커지므로, 음 개수에 맞춰 한 음을 줄인다 (그래야 SOUND_LEVELS대로 들린다)
  const peak = (SOUND_PEAK * fromDb(SOUND_LEVELS[name] + trim) * vary()) / played.length ** 0.8;
  const length = sound.length * vary();
  for (const [note, offset] of played) {
    play(instrument, SOUND_NOTES[note], start + offset, peak, length, groups[sound.group]);
  }
  if (name === 'open' || name === 'horn') {
    const lastNote = Math.max(...played.map(([, offset]) => offset));
    const until = start + lastNote + (name === 'open' ? 1.0 : 0.6);
    if (name === 'open') eventBusyUntil = until;
    duck(start, until);
  }
}

// 노선 번호의 열차 도착 음 (1호선은 ARRIVAL_NOTES의 첫 음, 노선이 더 많으면 처음부터 다시)
const arrivalNote = (routeNumber) => ARRIVAL_NOTES[(routeNumber - 1) % ARRIVAL_NOTES.length];

// 열차 도착: 매 프레임 이번에 선 열차들의 노선 번호를 받는다 (아무도 안 섰으면 빈 목록)
// 실제 시간 ARRIVAL_SOUND_GAP_SECONDS 동안 선 노선들을 모아 두었다가 한꺼번에, 다른 음 MAX_ARRIVAL_NOTES개까지만 낸다
// 열차가 많아도, 3배속이어도 소리는 이 간격에 한 번이다
export function playArrivals(routeNumbers) {
  for (const number of routeNumbers) pendingArrivals.add(arrivalNote(number));
  if (pendingArrivals.size === 0) return;
  const now = performance.now() / 1000;
  if (now - lastArrival < ARRIVAL_SOUND_GAP_SECONDS) return;
  lastArrival = now;
  // 바로 전에 낸 음은 뒤로 미뤄서, 다른 음이 있으면 그것부터 낸다
  const notes = [...pendingArrivals]
    .sort((a, b) => (a === lastArrivalNote) - (b === lastArrivalNote))
    .slice(0, MAX_ARRIVAL_NOTES);
  pendingArrivals.clear();
  lastArrivalNote = notes[notes.length - 1];
  playSound(
    'arrive',
    notes.map((note, i) => [note, i * ARRIVAL_NOTE_SPACING]),
  );
}

// 레일 덜컹 "따닥": 바퀴 두 쌍이 이음매를 차례로 넘는 소리. loudness: 0~1 (열차가 화면 가운데에 가깝고 빠를수록 크게)
export function playClack(loudness) {
  if (muted || volume === 0 || loudness <= 0) return;
  const { context, groups } = audio();
  const peak = SOUND_PEAK * fromDb(SOUND_LEVELS.clack) * loudness * vary();
  const start = context.currentTime + 0.01;
  strikeClack(start, peak, groups.train);
  strikeClack(start + 0.09 * vary(), peak * 0.8, groups.train);
}

// [소리] 버튼과 음량 막대
// button: 누르면 켜고 끈다 ("소리 켬"/"소리 끔"), slider: 0~100 음량 막대
export function createSoundToggle(button, slider) {
  const show = () => {
    button.textContent = muted ? '소리 끔' : '소리 켬';
    button.classList.toggle('active', !muted);
    slider.value = Math.round(volume * 100);
    slider.disabled = muted;
  };
  const toggle = () => {
    muted = !muted;
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
    setMasterGain(masterGain());
    show();
  };
  button.addEventListener('click', toggle);
  slider.addEventListener('input', () => {
    volume = Number(slider.value) / 100;
    localStorage.setItem(VOLUME_KEY, String(volume));
    setMasterGain(masterGain());
  });
  // 막대를 놓으면 그 크기를 들려준다 (얼마나 큰지 바로 알 수 있게)
  slider.addEventListener('change', () => playSound('station'));
  show();
  return { toggle };
}
