// 선로 그리기 막대: [선로] 도구로 그리는 동안 화면 아래 가운데에 지금까지의 길이·공사비와 [마지막 점 빼기][취소]를 보여준다.
// 마우스 옆 안내(cursorTip)와 Esc·Backspace·오른쪽 클릭을 손가락으로도 할 수 있게 (휴대폰·태블릿), 컴퓨터에서도 함께 보인다.
// 계획 선로면 "계획"과 지을 때 공사비를 적는다.
import { trackCostForCoords } from '../game/economy.js';
import { formatMoney } from './format.js';

// onUndoPoint: [마지막 점 빼기], onCancel: [취소]
// 결과: { show(coords, plan), hide } — coords: 지금까지 그린 선로 모양 (점이 하나뿐이면 길이 0)
export function createDrawBar({ onUndoPoint, onCancel }) {
  const bar = document.createElement('div');
  bar.className = 'draw-bar';
  bar.hidden = true;
  bar.innerHTML = `
    <span class="draw-bar-text"></span>
    <button type="button" class="hud-button draw-bar-undo" title="마지막 경유점 빼기 (Backspace)">마지막 점 빼기</button>
    <button type="button" class="hud-button draw-bar-cancel" title="그리던 선로 취소 (Esc · 오른쪽 클릭)">취소</button>
  `;
  document.body.append(bar);
  const text = bar.querySelector('.draw-bar-text');
  bar.querySelector('.draw-bar-undo').addEventListener('click', onUndoPoint);
  bar.querySelector('.draw-bar-cancel').addEventListener('click', onCancel);

  function show(coords, plan) {
    bar.hidden = false;
    // 왼쪽 아래 버튼 줄 바로 위에 (좁은 화면에서는 그 줄이 두 줄로 꺾인다. 숨어 있으면 화면 아래 가장자리에)
    const buttons = document.querySelector('.bottom-left').getBoundingClientRect();
    bar.style.bottom = buttons.height > 0 ? `${window.innerHeight - buttons.top + 8}px` : '16px';
    if (coords.length < 2) {
      text.textContent = '선로 그리는 중 · 빈 땅을 누르면 꺾이는 점, 역을 누르면 완성';
      return;
    }
    const { km, cost } = trackCostForCoords(coords);
    text.textContent = plan
      ? `계획 ${km.toFixed(2)} km · 지을 때 ${formatMoney(cost)}`
      : `${km.toFixed(2)} km · 공사비 ${formatMoney(cost)}`;
  }

  return { show, hide: () => (bar.hidden = true) };
}
