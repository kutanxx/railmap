// 배경 음악: 음악 파일 없이 그때그때 만든다 (설계 근거 docs/sound-research.md의 Mini Metro 이야기).
// - 느린 화음(MUSIC_CHORDS)이 MUSIC_CHORD_BEATS박마다 바뀌며 깔리고, 그 위에 멜로디 음이 가끔 하나씩 지도 음색으로 울린다
// - 멜로디는 앞 음에서 한두 칸만 움직여서 노래처럼 들리고, 화음이 바뀌기 전 두 박은 쉰다
// - 노선이 많을수록 멜로디 음이 조금 잦아진다 (MUSIC_NOTE_CHANCE). 게임을 멈추면 화음만 울린다
// - 모든 음은 효과음과 같은 5음 음계라서 효과음과 겹쳐도 어울린다. 큰 효과음이 날 때는 잠깐 작아진다 (덕킹)
// - 브라우저는 사용자가 한 번 누르기 전에는 소리를 막으므로, 화면을 처음 누를 때 시작한다
// - [음악] 버튼으로 끄고 켜고, 브라우저에 기억한다. 전체 음량·[소리] 끄기는 음악에도 똑같이 걸린다
import {
  SOUND_NOTES,
  SOUND_PEAK,
  SOUND_VARIATION,
  MUSIC_BPM,
  MUSIC_DB,
  MUSIC_CHORDS,
  MUSIC_CHORD_BEATS,
  MUSIC_MELODY_NOTES,
  MUSIC_NOTE_CHANCE,
} from '../config.js';
import { getState } from '../game/state.js';
import { audio, fromDb } from './soundEngine.js';
import { paletteFor, play, strikePad } from './instruments.js';

const MUSIC_KEY = 'railmap-music';
// 화음은 멜로디보다 이만큼(dB) 작게 깔린다
const PAD_DB = -6;
// 미리 정해 두는 시간 (초). 이만큼 앞의 음까지 오디오 시계에 예약해서, 화면이 바빠도 박자가 흔들리지 않게 한다
const LOOKAHEAD = 0.5;

let enabled = localStorage.getItem(MUSIC_KEY) !== '0';
let output = null; // 음악 전체 크기 (끌 때 0으로)
let timer = null;
let nextTime = 0; // 다음 반 박의 오디오 시각
let step = 0; // 지금까지 지난 반 박 수
let melodyIndex = 4; // 지금 멜로디 음 (MUSIC_MELODY_NOTES 안의 번호)

// 'C3' 같은 음 이름을 Hz로: SOUND_NOTES(5옥타브)에서 옥타브만큼 반씩 낮춘다
const pitch = (name) => SOUND_NOTES[`${name[0]}5`] * 2 ** (Number(name.slice(1)) - 5);
const vary = () => 1 + (Math.random() * 2 - 1) * SOUND_VARIATION;

function start() {
  if (timer || !enabled) return;
  const { context, groups } = audio();
  context.resume();
  if (!output) {
    output = context.createGain();
    output.connect(groups.music);
  }
  output.gain.cancelScheduledValues(context.currentTime);
  output.gain.setTargetAtTime(1, context.currentTime, 0.1);
  nextTime = context.currentTime + 0.1;
  step = 0;
  timer = setInterval(schedule, 200);
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  // 이미 예약한 화음은 1초쯤에 걸쳐 조용히 줄인다
  const { context } = audio();
  output.gain.setTargetAtTime(0, context.currentTime, 0.3);
}

// 앞으로 LOOKAHEAD초 안에 올 반 박들을 예약한다
function schedule() {
  const { context } = audio();
  // 탭을 오래 비웠다 돌아오면 밀린 음을 한꺼번에 내지 않고 지금부터 다시 센다
  if (nextTime < context.currentTime) nextTime = context.currentTime + 0.05;
  const half = 60 / MUSIC_BPM / 2;
  while (nextTime < context.currentTime + LOOKAHEAD) {
    playStep(nextTime, half);
    nextTime += half;
    step += 1;
  }
}

// 반 박 하나: 화음이 바뀔 때면 새 화음을 깔고, 가끔 멜로디 음을 하나 낸다
function playStep(at, half) {
  const stepsPerChord = MUSIC_CHORD_BEATS * 2;
  const inChord = step % stepsPerChord;
  if (inChord === 0) {
    const chord = MUSIC_CHORDS[Math.floor(step / stepsPerChord) % MUSIC_CHORDS.length];
    const peak = (SOUND_PEAK * fromDb(MUSIC_DB + PAD_DB)) / chord.length ** 0.8;
    for (const note of chord) strikePad(pitch(note), at, peak, stepsPerChord * half, output);
  }
  // 멈춤 중이거나, 화음이 바뀌기 전 두 박(반 박 4개)은 쉰다
  if (getState().speed === 0 || inChord >= stepsPerChord - 4) return;
  const routes = getState().routes.length;
  const chance = Math.min(MUSIC_NOTE_CHANCE.max, MUSIC_NOTE_CHANCE.start + MUSIC_NOTE_CHANCE.perRoute * routes);
  // 박 위(짝수 반 박)에서 더 자주, 박 사이에서는 덜 자주
  if (Math.random() >= chance * (step % 2 === 0 ? 1.4 : 0.6)) return;
  const moves = [-2, -1, -1, 1, 1, 2];
  const move = moves[Math.floor(Math.random() * moves.length)];
  melodyIndex = Math.max(0, Math.min(MUSIC_MELODY_NOTES.length - 1, melodyIndex + move));
  const [instrument, trim] = paletteFor('melody');
  const peak = SOUND_PEAK * fromDb(MUSIC_DB + trim) * vary();
  play(instrument, pitch(MUSIC_MELODY_NOTES[melodyIndex]), at, peak, 1.4 * vary(), output);
}

// [음악] 버튼. 처음 화면을 누를 때(음악이 켜져 있으면) 시작한다
export function createMusicToggle(button) {
  const show = () => {
    button.textContent = enabled ? '음악 켬' : '음악 끔';
    button.classList.toggle('active', enabled);
  };
  button.addEventListener('click', () => {
    enabled = !enabled;
    localStorage.setItem(MUSIC_KEY, enabled ? '1' : '0');
    if (enabled) start();
    else stop();
    show();
  });
  for (const type of ['pointerdown', 'keydown']) {
    document.addEventListener(type, start, { once: true });
  }
  show();
}
