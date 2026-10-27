// 소리 길: 오디오를 만들고, 묶음(사건·열차·음악) → 전체 음량 → 압축기 → 스피커로 잇는다.
// 묶음마다 울림(잔향)으로 가는 곁길도 있다: 묶음 → 울림 → 전체 음량
// 브라우저는 사용자가 한 번 누르기 전에는 소리를 막으므로, 처음 소리를 낼 때 오디오를 만든다.
// 효과음(sounds.js), 배경 음악(music.js)이 함께 쓴다.
import { SOUND_COMPRESSOR, DUCK_DB, REVERB_SECONDS, REVERB_DB } from '../config.js';

let context = null;
let master = null; // 전체 음량
const groups = {}; // 묶음별 음량 (event: 역·선로·개통·경적, train: 열차 도착·덜컹, music: 배경 음악)
let masterValue = 1;

// 오디오를 처음 쓸 때 소리 길을 만든다. 결과: { context, groups }
export function audio() {
  if (context) return { context, groups };
  context = new AudioContext();
  const compressor = context.createDynamicsCompressor();
  for (const [key, value] of Object.entries(SOUND_COMPRESSOR)) compressor[key].value = value;
  compressor.connect(context.destination);
  master = context.createGain();
  master.gain.value = masterValue;
  master.connect(compressor);
  const reverb = createReverb(master);
  for (const name of ['event', 'train', 'music']) {
    groups[name] = context.createGain();
    groups[name].connect(master);
    groups[name].connect(reverb);
  }
  return { context, groups };
}

// 전체 음량을 바꾼다 (0이면 소리 끔). 오디오가 아직 없으면 기억해 뒀다가 만들 때 쓴다
export function setMasterGain(value) {
  masterValue = value;
  if (master) master.gain.setTargetAtTime(value, context.currentTime, 0.02);
}

// 울림: 잡음이 점점 사라지는 짧은 "방 울림 녹음"을 직접 만들어 소리에 입힌다 (convolver).
// 왼쪽·오른쪽 잡음을 따로 만들어 넓게 퍼지는 느낌을 낸다. 높은 소리는 필터로 깎아 부드럽게 한다
// output: 울린 소리를 보낼 곳. 결과: 곁길 입구 (묶음들이 여기에 잇는다)
function createReverb(output) {
  const length = Math.round(context.sampleRate * REVERB_SECONDS);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
  }
  const convolver = context.createConvolver();
  convolver.buffer = impulse;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 3000;
  const wet = context.createGain();
  wet.gain.value = fromDb(REVERB_DB);
  convolver.connect(filter).connect(wet).connect(output);
  return convolver;
}

// 큰 소리가 나는 동안 열차 소리와 음악 묶음을 DUCK_DB만큼 줄였다가 천천히 되돌린다
export function duck(from, until) {
  for (const name of ['train', 'music']) {
    const gain = groups[name].gain;
    gain.cancelScheduledValues(from);
    gain.setTargetAtTime(fromDb(DUCK_DB), from, 0.03);
    gain.setTargetAtTime(1, until, 0.3);
  }
}

// dB를 크기 배율로 (−6dB ≈ 절반)
export const fromDb = (db) => 10 ** (db / 20);
