// 화면 UI 크기: [메뉴]의 [작게][보통][크게]. 버튼·패널·글자를 한꺼번에 줄이거나 키운다 (지도와 역 이름표는 그대로).
// body에 ui-size-small / ui-size-large를 붙이면 hud.css가 화면 판들의 크기(CSS zoom)를 바꾼다. 고른 크기는 브라우저에 기억한다.

// 고른 크기를 기억하는 브라우저 저장 이름
const UI_SIZE_KEY = 'railmap-ui-size';
const SIZES = [
  { id: 'small', label: '작게' },
  { id: 'normal', label: '보통' },
  { id: 'large', label: '크게' },
];

function apply(size) {
  document.body.classList.toggle('ui-size-small', size === 'small');
  document.body.classList.toggle('ui-size-large', size === 'large');
}

// 아직 크기를 고른 적이 없을 때, 창이 이만큼 넓으면 처음부터 [크게] (px. 큰 모니터에서 버튼·글자가 너무 작아 보이지 않게)
const LARGE_SCREEN_PX = 1800;

// 게임 화면을 시작할 때 기억한 크기를 입힌다 (고른 적이 없으면 창 너비로 정한다). 결과: 지금 크기 id
export function initUiSize() {
  const size = localStorage.getItem(UI_SIZE_KEY) ?? (window.innerWidth >= LARGE_SCREEN_PX ? 'large' : 'normal');
  apply(size);
  return size;
}

// [메뉴] 안에 넣을 "화면 크기 [작게][보통][크게]" 줄
export function createUiSizeControl() {
  const row = document.createElement('div');
  row.className = 'ui-size-row';
  const label = document.createElement('span');
  label.className = 'ui-size-label';
  label.textContent = '화면 크기';
  row.append(label);
  let current = initUiSize();
  const buttons = SIZES.map(({ id, label: text }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hud-button ui-size-button';
    button.textContent = text;
    button.addEventListener('click', () => {
      current = id;
      localStorage.setItem(UI_SIZE_KEY, id);
      apply(id);
      for (const [i, other] of buttons.entries()) other.classList.toggle('active', SIZES[i].id === current);
    });
    row.append(button);
    return button;
  });
  for (const [i, button] of buttons.entries()) button.classList.toggle('active', SIZES[i].id === current);
  return row;
}
