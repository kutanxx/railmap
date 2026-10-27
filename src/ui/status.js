// 화면 위쪽 자금 표시: 자금, 월 수지 (+는 초록, −는 빨강), 하루 승객
// 좁은 창에서는 이름을 줄여 쓴다 (월 수지 → 월, 하루 승객 → 승객, "명" 빼기. hud.css의 .status-long/.status-short)
// 매달 정산하면 자금 숫자 아래에 그 달 수지("+1.2억 ▲" / "−3.4억 ▼")가 잠깐 떠오른다 (색과 화살표가 함께)
import { formatMoney, formatSignedMoney, formatPopulation } from './format.js';
import { isSandbox } from '../game/region.js';

// 정산 숫자가 떠 있는 시간 (실제 밀리초)
const FLASH_MS = 2000;

export function createStatus(element) {
  element.innerHTML = `
    <span class="status-label">자금</span>
    <b class="status-money"></b>
    <span class="status-label status-flow"><span class="status-long">월 수지</span><span class="status-short">월</span></span>
    <b class="status-net status-flow"></b>
    <span class="status-label status-flow"><span class="status-long">하루 승객</span><span class="status-short">승객</span></span>
    <b class="status-riders status-flow"><span class="status-riders-number"></span><span class="status-long"></span></b>
    <span class="status-danger" hidden></span>
  `;
  const moneyText = element.querySelector('.status-money');
  let flash = null;
  const netText = element.querySelector('.status-net');
  const ridersNumber = element.querySelector('.status-riders-number');
  const ridersUnit = element.querySelector('.status-riders .status-long');
  const dangerText = element.querySelector('.status-danger');

  // money: 지금 자금, net: 이번 달 예상 수지 (수입 − 운영비 − 이자), riders: 하루 승객 전체
  // monthsLeft: 파산까지 남은 달 (빚이 한도 안이면 null)
  // flow: 월 수지·하루 승객을 보일지 (첫 노선을 열기 전에는 둘 다 0이라 숨긴다, reveal.js)
  function show({ money, net, riders, monthsLeft, flow }) {
    element.classList.toggle('status-money-only', !flow);
    dangerText.hidden = monthsLeft === null;
    if (monthsLeft !== null) dangerText.textContent = `파산까지 ${monthsLeft}개월`;
    // "1.3만 명"에서 "명"은 넓은 창에서만 붙인다
    const [, number, unit] = formatPopulation(riders).match(/^(.*?)(\s?명)?$/);
    ridersNumber.textContent = number;
    ridersUnit.textContent = unit ?? '';
    // 샌드박스는 자금 대신 "무제한" (월 수지와 하루 승객은 그대로 보여준다)
    moneyText.textContent = isSandbox() ? '무제한' : formatMoney(money);
    moneyText.classList.toggle('negative', money < 0 && !isSandbox());
    netText.textContent = formatSignedMoney(net);
    netText.classList.toggle('positive', net > 0.05);
    netText.classList.toggle('negative', net < -0.05);
  }

  // 매달 정산: net = 이번 달 수지 (억)
  function flashSettlement(net) {
    flash?.remove();
    flash = document.createElement('span');
    flash.className = `status-flash ${net >= 0 ? 'positive' : 'negative'}`;
    flash.textContent = `${formatSignedMoney(net)} ${net >= 0 ? '▲' : '▼'}`;
    flash.style.left = `${moneyText.offsetLeft}px`;
    element.append(flash);
    const shown = flash;
    setTimeout(() => shown.remove(), FLASH_MS);
  }

  return { show, flashSettlement };
}
