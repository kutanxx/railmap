// [메뉴] 펼침 안: 맨 위 [역·노선 찾기]와 화면 크기 [작게][보통][크게], 줄 아래 파일 버튼 [내보내기] [불러오기] [지도 바꾸기],
// 줄 아래 빨간 [새로 시작]
// [새로 시작]은 실수로 누르지 않게 한 번 더 눌러야 실행된다 (브라우저 confirm 창 대신)
// 항목을 누르면 할 일을 하고 펼침을 닫는다 ([새로 시작]의 첫 누름은 "한 번 더"를 묻느라 열어 둔다)
import { closePopovers } from './popovers.js';
import { createUiSizeControl } from './uiSize.js';

const CONFIRM_MS = 4000; // "정말요?" 상태로 기다리는 시간

export function createFileMenu(element, { onSearch, onExport, onImport, onReset, onChangeMap }) {
  element.innerHTML = `
    <button type="button" class="file-button file-search">역·노선 찾기<span class="tool-key">/</span></button>
    <hr class="popover-divider" />
    <button type="button" class="file-button file-export">내보내기</button>
    <button type="button" class="file-button file-import">불러오기</button>
    <button type="button" class="file-button file-change-map">지도 바꾸기</button>
    <hr class="popover-divider" />
    <button type="button" class="file-button file-reset">새로 시작</button>
    <input type="file" class="file-input" accept=".json,application/json" hidden />
  `;
  element.querySelector('.file-search').after(createUiSizeControl());
  element.querySelector('.file-search').addEventListener('click', () => {
    closePopovers();
    onSearch();
  });
  const input = element.querySelector('.file-input');
  const resetButton = element.querySelector('.file-reset');

  element.querySelector('.file-export').addEventListener('click', () => {
    closePopovers();
    onExport();
  });
  element.querySelector('.file-change-map').addEventListener('click', onChangeMap);
  element.querySelector('.file-import').addEventListener('click', () => {
    closePopovers();
    input.click();
  });
  input.addEventListener('change', () => {
    const [file] = input.files;
    if (file) onImport(file);
    input.value = ''; // 같은 파일을 다시 골라도 change가 일어나게
  });

  let confirmTimer = null;
  resetButton.addEventListener('click', () => {
    if (confirmTimer === null) {
      resetButton.textContent = '정말 새로 시작? 한 번 더';
      resetButton.classList.add('confirm');
      confirmTimer = setTimeout(restoreReset, CONFIRM_MS);
      return;
    }
    restoreReset();
    closePopovers();
    onReset();
  });

  function restoreReset() {
    clearTimeout(confirmTimer);
    confirmTimer = null;
    resetButton.textContent = '새로 시작';
    resetButton.classList.remove('confirm');
  }
}
