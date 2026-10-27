// 악기: 음 하나를 소리로 만드는 방법들 (소리 파일 없이 Web Audio로). 효과음(sounds.js)과 배경 음악(music.js)이 함께 쓴다.
// 모든 함수는 (높이 Hz, 시작 시각(오디오 시계), 크기, 길이 배율, 보낼 곳)을 받는다.
import { getRegion } from '../game/region.js';
import { audio } from './soundEngine.js';

// 이보다 높은 배음은 빼서 날카롭지 않게 한다 (Hz)
const MAX_PARTIAL_HZ = 4000;

// 배음 악기: 배음마다 [기본 음의 몇 배, 크기, 사라지는 데 걸리는 초]
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

// 지도 음색마다 소리별 [악기, 크기 보정(dB)]. 악기는 배음 목록(BELL, MARIMBA)이거나 'fm'(FM 벨), 'flute'(국악 관악기풍)
// 악기마다 같은 크기로 쳐도 크게 들리는 정도가 달라서, 녹음해 0.1초 평균 크기를 재 보고 SOUND_LEVELS 순서대로 들리게 맞춘 값이다
// (길게 이어지는 관악기는 같은 크기여도 더 크게 들려서 많이 줄였다. 마림바는 음이 짧아서 여러 음인 개통만 키웠다)
// melody는 배경 음악의 멜로디 음
const PALETTES = {
  bell: { station: [BELL, 0], track: [BELL, 0], open: ['fm', 0], arrive: [MARIMBA, 0], melody: [BELL, -4] },
  gugak: {
    station: ['flute', -8.5],
    track: ['flute', -4.5],
    open: ['flute', 0],
    arrive: ['flute', -10.5],
    melody: ['flute', -8],
  },
  marimba: {
    station: [MARIMBA, -3],
    track: [MARIMBA, 1],
    open: [MARIMBA, 7],
    arrive: [MARIMBA, -6],
    melody: [MARIMBA, 0],
  },
};

// 지금 지도 음색에서 그 소리의 [악기, 크기 보정(dB)]
export const paletteFor = (name) => PALETTES[getRegion().soundStyle][name];

// 악기로 음 하나를 친다. instrument: 배음 목록이거나 'fm', 'flute', 'horn'
export function play(instrument, frequency, at, peak, lengthScale, output) {
  if (instrument === 'fm') strikeFm(frequency, at, peak, lengthScale, output);
  else if (instrument === 'horn') strikeHorn(frequency, at, peak, lengthScale, output);
  else if (instrument === 'flute') strikeFlute(frequency, at, peak, lengthScale, output);
  else strike(instrument, frequency, at, peak, lengthScale, output);
}

// 배음 악기 (벨, 마림바)
function strike(instrument, frequency, at, peak, lengthScale, output) {
  const { context } = audio();
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

// FM 벨: 음 하나(carrier)를 1.4배 높이 음(modulator)으로 빠르게 흔들면 벨처럼 어긋난 배음이 생긴다.
// 흔드는 세기를 점점 줄여서, 처음엔 쨍하다가 맑은 음으로 사라진다. 너무 높은 소리는 필터로 깎는다
function strikeFm(frequency, at, peak, lengthScale, output) {
  const { context } = audio();
  const duration = 1.8 * lengthScale;
  const carrier = context.createOscillator();
  const modulator = context.createOscillator();
  const depth = context.createGain();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  carrier.frequency.value = frequency;
  modulator.frequency.value = frequency * 1.4;
  depth.gain.setValueAtTime(frequency * 1.4 * 3.5, at);
  depth.gain.exponentialRampToValueAtTime(frequency * 0.01, at + duration * 0.6);
  filter.type = 'lowpass';
  filter.frequency.value = MAX_PARTIAL_HZ;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  modulator.connect(depth).connect(carrier.frequency);
  carrier.connect(filter).connect(gain).connect(output);
  for (const oscillator of [carrier, modulator]) {
    oscillator.start(at);
    oscillator.stop(at + duration + 0.05);
  }
}

// 흰 잡음 1초 (숨소리, 덜컹 소리에 쓴다. 한 번 만들어 두고 함께 쓴다)
let noiseBuffer = null;
function noise() {
  const { context } = audio();
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// 국악 관악기풍 (대금·소금 느낌): 맑은 기본 음에 약한 배음, 처음에 "후" 하는 숨소리,
// 조금 지나서 살짝 떨리는 소리(바이브레이션). 부드럽게 커졌다가 서서히 사라진다
function strikeFlute(frequency, at, peak, lengthScale, output) {
  const { context } = audio();
  const duration = 0.8 * lengthScale;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.04);
  gain.gain.setValueAtTime(peak, at + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  gain.connect(output);
  // 떨림: 초당 5.5번, 음 높이의 0.4%만큼. 0.15초 뒤부터 서서히
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  vibrato.frequency.value = 5.5;
  vibratoDepth.gain.setValueAtTime(0, at);
  vibratoDepth.gain.linearRampToValueAtTime(frequency * 0.004, at + 0.15 + duration * 0.2);
  vibrato.connect(vibratoDepth);
  const voices = [vibrato];
  for (const [ratio, amount] of [[1, 1], [2, 0.18], [3, 0.06]]) {
    const oscillator = context.createOscillator();
    const level = context.createGain();
    oscillator.frequency.value = frequency * ratio;
    vibratoDepth.connect(oscillator.frequency);
    level.gain.value = amount / 1.24;
    oscillator.connect(level).connect(gain);
    voices.push(oscillator);
  }
  // 숨소리: 그 음 높이 둘레만 남긴 잡음을 처음 0.25초 동안 짧게
  const breath = context.createBufferSource();
  const band = context.createBiquadFilter();
  const breathGain = context.createGain();
  breath.buffer = noise();
  band.type = 'bandpass';
  band.frequency.value = frequency * 1.5;
  band.Q.value = 1.2;
  breathGain.gain.setValueAtTime(0, at);
  breathGain.gain.linearRampToValueAtTime(peak * 0.5, at + 0.02);
  breathGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
  breath.connect(band).connect(breathGain).connect(output);
  voices.push(breath);
  for (const voice of voices) {
    voice.start(at);
    voice.stop(at + duration + 0.05);
  }
}

// 경적: 거친 톱니파 두 개(아주 살짝 어긋나게)를 한 옥타브 낮게 내고, 높은 소리를 깎아 멀리서 들리는 느낌으로.
// 처음에 음이 살짝 낮았다가 제 높이로 올라가고, 0.1초에 걸쳐 커졌다가 짧게 끝난다
function strikeHorn(frequency, at, peak, lengthScale, output) {
  const { context } = audio();
  const low = frequency / 2;
  const hold = 0.45 * lengthScale;
  const end = at + hold + 0.2;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'lowpass';
  filter.frequency.value = 1100;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.1);
  gain.gain.setValueAtTime(peak, at + hold);
  gain.gain.linearRampToValueAtTime(0, end);
  filter.connect(gain).connect(output);
  for (const detune of [-4, 4]) {
    const oscillator = context.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.detune.value = detune; // 센트 (반음의 1/100)
    oscillator.frequency.setValueAtTime(low * 0.97, at);
    oscillator.frequency.linearRampToValueAtTime(low, at + 0.12);
    oscillator.connect(filter);
    oscillator.start(at);
    oscillator.stop(end + 0.05);
  }
}

// 레일 덜컹 "탁": 바퀴가 레일 이음매를 넘는 소리. 짧은 잡음(쇠 부딪히는 소리)에 낮은 "쿵"을 조금 섞는다
// 음 높이가 없는 소리라 음계와 부딪치지 않는다
export function strikeClack(at, peak, output) {
  const { context } = audio();
  const hit = context.createBufferSource();
  const band = context.createBiquadFilter();
  const hitGain = context.createGain();
  hit.buffer = noise();
  band.type = 'bandpass';
  band.frequency.value = 1800 * (0.9 + Math.random() * 0.2);
  band.Q.value = 1.5;
  hitGain.gain.setValueAtTime(peak, at);
  hitGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  hit.connect(band).connect(hitGain).connect(output);
  const thump = context.createOscillator();
  const thumpGain = context.createGain();
  thump.frequency.setValueAtTime(140, at);
  thump.frequency.exponentialRampToValueAtTime(70, at + 0.06);
  thumpGain.gain.setValueAtTime(peak * 0.7, at);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
  thump.connect(thumpGain).connect(output);
  for (const voice of [hit, thump]) {
    voice.start(at, voice === hit ? Math.random() * 0.9 : undefined);
    voice.stop(at + 0.1);
  }
}

// 배경 음악 화음: 부드러운 사인파 두 개(아주 살짝 어긋나게)를 천천히 키웠다가 천천히 줄인다
// seconds: 화음이 이어지는 초 (앞뒤로 겹쳐서 화음이 자연스럽게 넘어가게, 커지고 줄어드는 데 각각 1.5초)
export function strikePad(frequency, at, peak, seconds, output) {
  const { context } = audio();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 1.5);
  gain.gain.setValueAtTime(peak, at + seconds);
  gain.gain.linearRampToValueAtTime(0, at + seconds + 1.5);
  filter.connect(gain).connect(output);
  for (const detune of [-3, 3]) {
    const oscillator = context.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    oscillator.connect(filter);
    oscillator.start(at);
    oscillator.stop(at + seconds + 1.6);
  }
}
