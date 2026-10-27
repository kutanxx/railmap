// 조작 안내 카드: 위쪽 [?] 버튼으로 연다. (처음 온 사람에게는 튜토리얼이 먼저 나온다, tutorial.js)
// 브라우저 alert 대신 화면 안의 카드로 만든다. [알겠어요], 바깥 클릭, Esc로 닫힌다.

// [키, 하는 일]
const ITEMS = [
  ['1 · 2 · 3 · 4', '선택 · 역 놓기 · 선로 · 노선 도구'],
  ['Space', '시간 멈춤 / 다시 가기 · 왼쪽 위 날짜 배지를 눌러도 돼요'],
  ['C', '혼잡도 보기 켜고 끄기 (선로를 여유·붐빔·넘침 색과 굵기로) · 왼쪽 아래 [혼잡도]'],
  ['T', '지형(등고선) 켜고 끄기 · 가상 지도에서만. 산을 뚫으면 터널, 강을 건너면 교량이 돼요'],
  ['N', '관제실 모드 (어두운 지도) 켜고 끄기 · 왼쪽 아래 [관제실]'],
  ['M', '소리 켜고 끄기 · 크기와 배경 음악은 왼쪽 아래 [소리]를 눌러서. 열차 도착 소리는 가까이, 레일 덜컹 소리는 아주 가까이 확대했을 때만 나요'],
  ['메뉴', '왼쪽 아래 [메뉴]: 내보내기 · 불러오기 · 지도 바꾸기 · 새로 시작'],
  ['Ctrl+Z / Ctrl+Y', '되돌리기 / 다시 하기 (쓴 돈도 돌려받아요)'],
  ['Esc · 오른쪽 클릭', '그리던 선로·노선 취소, 고른 것 놓기'],
  ['Backspace', '그리던 선로·노선의 마지막 점 빼기'],
  ['Enter', '노선 완성'],
  ['Delete', '고른 역·선로·노선 지우기. 삭제 버튼에 마우스를 올리면 함께 사라질 것이 빨갛게 보여요'],
  ['역 놓기', '지도를 충분히 확대해야 놓을 수 있어요. 마우스 옆에 공사비와 주변 인구가 나와요'],
  ['역 옮기기', '역을 고른 뒤 끌어요. 이전 비용과 늘어난 선로 공사비가 들어요'],
  ['선로 경유점', '흰 점을 끌어 옮기고, 두 번 클릭해 지워요. 선 가운데 작은 점을 끌면 새로 생겨요'],
];

// onTutorial: [튜토리얼 다시 하기]를 눌렀을 때
export function createHelpCard(element, button, { onTutorial }) {
  element.innerHTML = `
    <div class="dialog help-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="dialog-title" id="help-title">조작 안내</div>
      <dl class="help-list"></dl>
      <div class="dialog-buttons">
        <button type="button" class="help-tutorial">튜토리얼 다시 하기</button>
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
  element.querySelector('.help-tutorial').addEventListener('click', () => {
    close();
    onTutorial();
  });
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

}
