// 조작 안내 카드: 처음 켤 때 한 번, 그리고 위쪽 [?] 버튼으로 다시 연다.
// 브라우저 alert 대신 화면 안의 카드로 만든다. [알겠어요], 바깥 클릭, Esc로 닫힌다.

// 한 번 본 뒤에는 처음 켤 때 다시 띄우지 않는다 (브라우저 저장 공간에 표시만 해 둔다)
const SEEN_KEY = 'railmap-help-seen';

// [키, 하는 일]
const ITEMS = [
  ['1 · 2 · 3 · 4', '선택 · 역 놓기 · 선로 · 노선 도구'],
  ['Space', '시간 멈춤 / 다시 가기'],
  ['C', '혼잡도 보기 켜고 끄기 (선로를 여유·붐빔·넘침 색으로)'],
  ['Ctrl+Z / Ctrl+Y', '되돌리기 / 다시 하기 (쓴 돈도 돌려받아요)'],
  ['Esc · 오른쪽 클릭', '그리던 선로·노선 취소, 고른 것 놓기'],
  ['Backspace', '그리던 선로·노선의 마지막 점 빼기'],
  ['Enter', '노선 완성'],
  ['Delete', '고른 역·선로·노선 지우기. 삭제 버튼에 마우스를 올리면 함께 사라질 것이 빨갛게 보여요'],
  ['역 놓기', '지도를 충분히 확대해야 놓을 수 있어요. 마우스 옆에 공사비와 주변 인구가 나와요'],
  ['역 옮기기', '역을 고른 뒤 끌어요. 이전 비용과 늘어난 선로 공사비가 들어요'],
  ['선로 경유점', '흰 점을 끌어 옮기고, 두 번 클릭해 지워요. 선 가운데 작은 점을 끌면 새로 생겨요'],
];

export function createHelpCard(element, button) {
  element.innerHTML = `
    <div class="dialog help-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="dialog-title" id="help-title">조작 안내</div>
      <dl class="help-list"></dl>
      <div class="dialog-buttons">
        <button type="button" class="dialog-primary help-close">알겠어요</button>
      </div>
    </div>
  `;
  element.querySelector('.help-list').append(
    ...ITEMS.flatMap(([key, text]) => {
      const term = document.createElement('dt');
      term.textContent = key;
      const detail = document.createElement('dd');
      detail.textContent = text;
      return [term, detail];
    }),
  );

  const open = () => {
    element.hidden = false;
  };
  const close = () => {
    element.hidden = true;
  };

  button.addEventListener('click', open);
  element.querySelector('.help-close').addEventListener('click', close);
  // 카드 바깥(빈 곳)을 누르면 닫는다
  element.addEventListener('click', (event) => {
    if (event.target === element) close();
  });
  // 카드가 열려 있을 때 Esc는 카드만 닫는다 (지도의 Esc 동작보다 먼저 받는다)
  document.addEventListener(
    'keydown',
    (event) => {
      if (element.hidden || event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      close();
    },
    true,
  );

  // 처음 켰을 때 한 번 띄운다
  if (!localStorage.getItem(SEEN_KEY)) {
    localStorage.setItem(SEEN_KEY, '1');
    open();
  }
}
