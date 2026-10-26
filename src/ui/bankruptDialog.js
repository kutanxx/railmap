// 파산 창: 빚이 한도를 넘은 채 몇 달이 지나 파산하면 화면 가운데에 띄운다.
// 브라우저 alert 대신 화면 안의 창으로 만든다. [새로 시작] 또는 [저장 파일 불러오기]로만 닫힌다.
import { formatMoney } from './format.js';

export function createBankruptDialog(element, { onReset, onImport }) {
  element.innerHTML = `
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="bankrupt-title">
      <div class="dialog-title" id="bankrupt-title">파산했어요</div>
      <p class="dialog-text"></p>
      <div class="dialog-buttons">
        <button type="button" class="dialog-primary bankrupt-reset">새로 시작</button>
        <button type="button" class="bankrupt-import">저장 파일 불러오기</button>
      </div>
      <input type="file" class="bankrupt-file" accept=".json,application/json" hidden />
    </div>
  `;
  const text = element.querySelector('.dialog-text');
  const input = element.querySelector('.bankrupt-file');

  element.querySelector('.bankrupt-reset').addEventListener('click', onReset);
  element.querySelector('.bankrupt-import').addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const [file] = input.files;
    if (file) onImport(file);
    input.value = '';
  });

  // state를 보고 파산했으면 창을 띄우고, 아니면 숨긴다
  function show({ bankrupt, year, month, money }) {
    element.hidden = !bankrupt;
    if (!bankrupt) return;
    text.textContent =
      `${year}년 ${month}월, 빚이 한도를 넘은 채 몇 달이 지나 철도 회사가 문을 닫았어요. ` +
      `마지막 자금은 ${formatMoney(money)}이에요. 적자 노선을 줄이고 승객이 많은 곳을 이어보세요.`;
  }

  return { show };
}
