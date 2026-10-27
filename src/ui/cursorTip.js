// 마우스 옆에 붙어 다니는 작은 안내 (예: "역 공사비 15억", "1.2 km · 공사비 26억")

// 오른쪽 패널이 차지하는 너비 (px, 여백 포함)
const RIGHT_PANEL_PX = 320;

export function createCursorTip(element) {
  // x, y: 화면 위 마우스 위치(px). tone: 'info', 'warn' (빚을 내서 지을 때), 'bad' (지을 수 없을 때)
  // 오른쪽 패널을 덮을 만큼 화면 오른쪽에 가까우면 마우스 왼쪽에 띄운다
  function show(x, y, text, tone = 'info') {
    element.textContent = text;
    element.className = `cursor-tip cursor-tip-${tone}`;
    element.hidden = false;
    const width = element.offsetWidth;
    const left = x + 16 + width > window.innerWidth - RIGHT_PANEL_PX ? x - 16 - width : x + 16;
    element.style.transform = `translate(${left}px, ${y + 16}px)`;
  }

  function hide() {
    element.hidden = true;
  }

  hide();
  return { show, hide };
}
