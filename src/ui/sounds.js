// 효과음: 소리 파일 없이 Web Audio로 만든다. 설계 근거는 docs/sound-research.md.
// - 역 놓기·선로 완성·노선 개통은 부드러운 벨 "딩~", 열차 도착은 마림바 "톡" (나무 건반 소리)
// - 열차 도착음은 노선마다 다른 음이다 (ARRIVAL_NOTES). 짧은 동안 선 열차들은 묶어서 최대 몇 음만 낸다
//   가까이 볼 때(ARRIVAL_SOUND_MIN_ZOOM 이상) 화면 안 열차만 소리를 낸다 (ui/animation.js)
// - 모든 음은 config.js의 SOUND_NOTES(도·레·미·솔·라 5음 음계) 안에서만 고른다. 겹쳐도 부딪치지 않게
// - 소리 길: 소리마다 크기(SOUND_LEVELS) → 사건·열차 묶음 → 전체 음량(음량 막대) → 압축기 → 스피커
//   (묶음은 나중에 큰 소리가 날 때 열차 소리를 잠깐 줄이는 데 쓴다)
// - 매번 크기와 길이를 조금씩 바꿔서 똑같이 반복되지 않게 한다
// - 소리 끄기와 음량은 브라우저에 기억한다
// 브라우저는 사용자가 한 번 누르기 전에는 소리를 막으므로, 처음 소리를 낼 때 오디오를 만든다.
import {
  SOUND_NOTES,
  SOUND_LEVELS,
  SOUND_PEAK,
  DEFAULT_SOUND_VOLUME,
  SOUND_VARIATION,
  SOUND_COMPRESSOR,
  ARRIVAL_SOUND_GAP_SECONDS,
  ARRIVAL_NOTES,
  MAX_ARRIVAL_NOTES,
  ARRIVAL_NOTE_SPACING,
} from '../config.js';

const MUTED_KEY = 'railmap-muted';
const VOLUME_KEY = 'railmap-volume';
// 이보다 높은 배음은 빼서 날카롭지 않게 한다 (Hz)
const MAX_PARTIAL_HZ = 4000;

// 악기: 배음마다 [기본 음의 몇 배, 크기, 사라지는 데 걸리는 초]
const BELL = [
  [1, 1.0, 1.2],
  [1.003, 0.3, 1.2], // 아주 살짝 어긋난 같은 음: "웅~웅" 하는 벨의 떨림
  [2, 0.35, 0.8],
  [2.76, 0.2, 0.5], // 정수배가 아닌 배음이 금속 벨 느낌을 낸다
  [4.07, 0.08, 0.25],
];
const MARIMBA = [
  [1, 1.0, 0.4],
  [4, 0.25, 0.12], // 마림바 건반은 4배·10배 배음이 나게 깎는다
  [9.5, 0.08, 0.05],
];

// 소리마다: 악기, 묶음, 음 이름들과 시작 시각(초), 길이 배율
const SOUNDS = {
  station: { instrument: BELL, group: 'event', notes: [['E5', 0]], length: 0.6 }, // 역 놓기: 미 한 번
  track: { instrument: BELL, group: 'event', notes: [['C5', 0], ['E5', 0.14]], length: 0.6 }, // 선로 완성: 도→미
  open: { instrument: BELL, group: 'event', notes: [['C5', 0], ['E5', 0.16], ['G5', 0.32]], length: 1.3 }, // 개통: 도·미·솔
  arrive: { instrument: MARIMBA, group: 'train', notes: [['A5', 0]], length: 0.7 }, // 열차 도착 (음은 노선마다 바뀐다)
};

let context = null;
let master = null; // 전체 음량
const groups = {}; // 묶음별 음량 (event, train)
let muted = localStorage.getItem(MUTED_KEY) === '1';
let volume = readVolume();
let lastArrival = 0;
let lastArrivalNote = null; // 바로 전에 낸 열차 음 (같은 음이 연달아 나지 않게)
const pendingArrivals = new Set(); // 이번 묶음 동안 열차가 선 노선들의 음

function readVolume() {
  const saved = Number(localStorage.getItem(VOLUME_KEY));
  return localStorage.getItem(VOLUME_KEY) !== null && saved >= 0 && saved <= 1 ? saved : DEFAULT_SOUND_VOLUME;
}

// 막대 값(0~1)을 실제 크기로: 귀는 작은 소리 쪽 차이를 더 크게 느끼므로 제곱해서 쓴다
const masterGain = () => (muted ? 0 : volume * volume);

// 오디오를 처음 쓸 때 소리 길을 만든다
function setup() {
  context = new AudioContext();
  const compressor = context.createDynamicsCompressor();
  for (const [key, value] of Object.entries(SOUND_COMPRESSOR)) compressor[key].value = value;
  compressor.connect(context.destination);
  master = context.createGain();
  master.gain.value = masterGain();
  master.connect(compressor);
  for (const name of ['event', 'train']) {
    groups[name] = context.createGain();
    groups[name].connect(master);
  }
}

function applyVolume() {
  if (master) master.gain.setTargetAtTime(masterGain(), context.currentTime, 0.02);
}

// dB를 크기 배율로 (−6dB ≈ 절반)
const fromDb = (db) => 10 ** (db / 20);
// 1 ± SOUND_VARIATION 사이의 무작위 배율
const vary = () => 1 + (Math.random() * 2 - 1) * SOUND_VARIATION;

// 악기로 음 하나를 친다 (at: 오디오 시계 기준 시작 시각)
function strike(instrument, frequency, at, peak, lengthScale, output) {
  const parts = instrument.filter(([ratio]) => frequency * ratio <= MAX_PARTIAL_HZ);
  const total = parts.reduce((sum, [, amount]) => sum + amount, 0);
  for (const [ratio, amount, seconds] of parts) {
    const duration = seconds * lengthScale;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * ratio;
    // 아주 빠르게 커졌다가(툭 끊기는 소리가 나지 않게) 서서히 사라진다. 0까지는 지수로 줄일 수 없어 0.0001까지
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime((peak * amount) / total, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain).connect(output);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.05);
  }
}

// name: SOUNDS의 이름. notes: 음 목록을 바꿔 낼 때 [[음 이름, 시작 초], …] (없으면 SOUNDS 그대로)
export function playSound(name, notes) {
  if (muted || volume === 0) return;
  if (!context) setup();
  const sound = SOUNDS[name];
  const played = notes ?? sound.notes;
  // 음이 여러 개면 겹쳐서 커지므로, 음 개수에 맞춰 한 음을 줄인다 (그래야 SOUND_LEVELS대로 들린다)
  const peak = (SOUND_PEAK * fromDb(SOUND_LEVELS[name]) * vary()) / played.length ** 0.8;
  const length = sound.length * vary();
  const start = context.currentTime + 0.01;
  for (const [note, offset] of played) {
    strike(sound.instrument, SOUND_NOTES[note], start + offset, peak, length, groups[sound.group]);
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
    applyVolume();
    show();
  };
  button.addEventListener('click', toggle);
  slider.addEventListener('input', () => {
    volume = Number(slider.value) / 100;
    localStorage.setItem(VOLUME_KEY, String(volume));
    applyVolume();
  });
  // 막대를 놓으면 그 크기를 들려준다 (얼마나 큰지 바로 알 수 있게)
  slider.addEventListener('change', () => playSound('station'));
  show();
  return { toggle };
}
