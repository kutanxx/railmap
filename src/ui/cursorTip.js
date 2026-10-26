// 마우스 옆에 붙어 다니는 작은 안내 (예: "역 공사비 15억", "1.2 km · 공사비 26억")
export function createCursorTip(element) {
  // x, y: 화면 위 마우스 위치(px). tone: 'info' 또는 'bad' (자금이 모자랄 때)
  function show(x, y, text, tone = 'info') {
    element.textContent = text;
    element.className = `cursor-tip cursor-tip-${tone}`;
    element.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
    element.hidden = false;
  }

  function hide() {
    element.hidden = true;
  }

  hide();
  return { show, hide };
}
