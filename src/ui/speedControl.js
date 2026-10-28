// 날짜 배지 옆의 시간 배속 버튼: [멈춤] [1배] [3배], 그리고 멈춤·다시 가기 (Space 키, 날짜 배지)
import { SPEED_OPTIONS } from '../config.js';
import { getState, setSpeed } from '../game/state.js';

// 다시 갈 때 쓸 배속 (마지막으로 달리던 배속)
let resumeSpeed = 1;

// 멈춰 있으면 마지막 배속으로 다시 가고, 가고 있으면 멈춘다
export function togglePause() {
  const { speed } = getState();
  if (speed > 0) resumeSpeed = speed;
  setSpeed(speed > 0 ? 0 : resumeSpeed);
}

export function createSpeedControl(element, onSelect) {
  const buttons = new Map();

  for (const speed of SPEED_OPTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'speed-button';
    button.textContent = speed === 0 ? '멈춤' : `${speed}배`;
    if (speed === 0) button.title = 'Space 키나 날짜 배지로도 멈춤·다시 가기';
    button.addEventListener('click', () => onSelect(speed));
    element.append(button);
    buttons.set(speed, button);
  }

  // 지금 배속 버튼만 칠한다
  function setActive(speed) {
    if (speed > 0) resumeSpeed = speed;
    for (const [value, button] of buttons) {
      button.classList.toggle('active', value === speed);
      button.setAttribute('aria-pressed', String(Boolean(value === speed)));
    }
  }

  return { setActive };
}
