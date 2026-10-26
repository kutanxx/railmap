// 날짜 배지 옆의 시간 배속 버튼: [멈춤] [1배] [3배]
import { SPEED_OPTIONS } from '../config.js';

export function createSpeedControl(element, onSelect) {
  const buttons = new Map();

  for (const speed of SPEED_OPTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'speed-button';
    button.textContent = speed === 0 ? '멈춤' : `${speed}배`;
    button.addEventListener('click', () => onSelect(speed));
    element.append(button);
    buttons.set(speed, button);
  }

  // 지금 배속 버튼만 칠한다
  function setActive(speed) {
    for (const [value, button] of buttons) {
      button.classList.toggle('active', value === speed);
    }
  }

  return { setActive };
}
