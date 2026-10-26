// [혼잡도 보기] 버튼: 켜면 선로 가운데 줄을 노선 색 대신 구간 혼잡도 색(여유·붐빔·넘침)으로 칠한다.
// 버튼 옆에 세 색이 무슨 뜻인지 작게 보여준다. 다른 도구를 쓰는 중에도 켜 둘 수 있다.
import { LOAD_COLORS } from '../map/trackLayers.js';

export function createCongestionToggle(element, onToggle) {
  element.innerHTML = `
    <button type="button" class="congestion-button" title="출퇴근 시간 구간별 혼잡도 (C 키)">혼잡도 보기</button>
    <span class="congestion-legend" hidden>
      <i style="background:${LOAD_COLORS.ok}"></i>여유
      <i style="background:${LOAD_COLORS.busy}"></i>붐빔
      <i style="background:${LOAD_COLORS.over}"></i>넘침
    </span>
  `;
  const button = element.querySelector('.congestion-button');
  const legend = element.querySelector('.congestion-legend');
  button.addEventListener('click', onToggle);

  // 켜져 있는지에 맞춰 버튼과 설명을 바꾼다
  function setActive(on) {
    button.classList.toggle('active', on);
    legend.hidden = !on;
  }

  return { setActive };
}
