// 효과음: 소리 파일 없이 Web Audio로 짧은 음을 만들어 낸다.
// 역 놓기, 선로 완성, 노선 개통, 열차가 역에 설 때. 끈 상태는 브라우저에 기억해 둔다.
// 브라우저는 사용자가 한 번 누르기 전에는 소리를 막으므로, 처음 소리를 낼 때 AudioContext를 만든다.
import { SOUND_VOLUME, ARRIVAL_SOUND_GAP_SECONDS } from '../config.js';

const MUTED_KEY = 'railmap-muted';

// 소리마다 음 높이(Hz) 목록과 한 음의 길이(초). 음을 차례로 낸다
const SOUNDS = {
  station: { notes: [660], length: 0.09 }, // 역 놓기: 짧게 톡
  track: { notes: [523, 659], length: 0.08 }, // 선로 완성: 두 음 올라감
  open: { notes: [523, 659, 784], length: 0.12 }, // 노선 개통: 세 음 (도미솔)
  arrive: { notes: [880], length: 0.05, volume: 0.35 }, // 열차가 역에 섬: 작고 짧게
};

let context = null;
let muted = readMuted();
let lastArrival = 0;

function readMuted() {
  return localStorage.getItem(MUTED_KEY) === '1';
}

function setMuted(next) {
  muted = next;
  localStorage.setItem(MUTED_KEY, next ? '1' : '0');
}

// name: SOUNDS의 이름
export function playSound(name) {
  if (muted) return;
  const sound = SOUNDS[name];
  // 열차가 여러 대 한꺼번에 서도 시끄럽지 않게, 열차 소리는 ARRIVAL_SOUND_GAP_SECONDS에 한 번만
  if (name === 'arrive') {
    const now = performance.now() / 1000;
    if (now - lastArrival < ARRIVAL_SOUND_GAP_SECONDS) return;
    lastArrival = now;
  }
  context ??= new AudioContext();
  const start = context.currentTime;
  sound.notes.forEach((frequency, i) => {
    const at = start + i * sound.length;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    // 툭 끊기지 않게 빠르게 커졌다가 서서히 줄인다
    const volume = SOUND_VOLUME * (sound.volume ?? 1);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + sound.length * 1.8);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + sound.length * 2);
  });
}

// [소리] 버튼: 켜져 있으면 "소리 켬", 꺼져 있으면 "소리 끔"
export function createSoundToggle(button) {
  const show = () => {
    button.textContent = muted ? '소리 끔' : '소리 켬';
    button.classList.toggle('active', !muted);
  };
  const toggle = () => {
    setMuted(!muted);
    show();
  };
  button.addEventListener('click', toggle);
  show();
  return { toggle };
}
