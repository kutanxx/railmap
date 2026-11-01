// 화면 가운데 창(.dialog: 조작 안내·서랍·만약에 노선)의 키보드 초점.
// 열면 창 안 첫 칸·버튼으로 초점을 옮기고, Tab은 창 안에서만 돌고, 닫으면 연 버튼으로 돌려준다
// (연 버튼이 닫힌 [메뉴] 안에 있어 보이지 않으면 fallback, 예: [메뉴] 버튼)
const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), a[href]';

// backdrop: 창 바깥 판(.dialog-backdrop). 결과: { opened(first?), closed() }
export function dialogFocus(backdrop, fallback = null) {
  let returnTo = null;
  const visible = (element) => element?.isConnected && element.getClientRects().length > 0;

  backdrop.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = [...backdrop.querySelectorAll(FOCUSABLE)].filter(visible);
    if (items.length === 0) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return {
    // first: 처음 초점을 줄 것 (없으면 창 안 첫 칸·버튼)
    // 창은 맨 위부터 보여준다 (초점 줄 버튼이 긴 창 맨 아래에 있어도 그쪽으로 굴리지 않는다)
    opened(first = null) {
      returnTo = document.activeElement;
      (first ?? [...backdrop.querySelectorAll(FOCUSABLE)].find(visible))?.focus({ preventScroll: true });
      for (const box of backdrop.querySelectorAll('.dialog')) box.scrollTop = 0;
    },
    closed() {
      const target = visible(returnTo) ? returnTo : fallback;
      returnTo = null;
      target?.focus();
    },
  };
}
