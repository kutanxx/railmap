// [혼잡도 보기] 버튼: 켜면 선로 가운데 줄을 노선 색 대신 구간 혼잡도 색(여유·붐빔·넘침)으로 칠한다.
// 버튼 옆에 세 색이 무슨 뜻인지 작게 보여주고, 넘친 구간이 몇 곳인지 센다. 다른 도구를 쓰는 중에도 켜 둘 수 있다.
// 색만으로 나누지 않게 설명의 색 막대도 선로처럼 굵기가 다르다 (여유 가늘게, 넘침 굵게)
import { LOAD_COLORS } from '../map/trackLayers.js';

export function createCongestionToggle(element, onToggle) {
  element.innerHTML = `
    <button type="button" class="congestion-button" title="출퇴근 시간 구간별 혼잡도 (C 키)">혼잡도 보기</button>
    <span class="congestion-legend" hidden>
      <i class="load-ok" style="background:${LOAD_COLORS.ok}"></i>여유
      <i class="load-busy" style="background:${LOAD_COLORS.busy}"></i>붐빔
      <i class="load-over" style="background:${LOAD_COLORS.over}"></i>넘침
      <b class="congestion-over-count"></b>
    </span>
  `;
  const button = element.querySelector('.congestion-button');
  const legend = element.querySelector('.congestion-legend');
  const overCount = element.querySelector('.congestion-over-count');
  button.addEventListener('click', onToggle);

  // 켜져 있는지에 맞춰 버튼과 설명을 바꾼다. over: 넘친 구간 수
  function setActive(on, over) {
    button.classList.toggle('active', on);
    legend.hidden = !on;
    const text = over > 0 ? `· 넘침 ${over}곳` : '· 넘침 없음';
    if (overCount.textContent !== text) overCount.textContent = text;
  }

  return { setActive };
}
