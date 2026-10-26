// 화면 위쪽 자금 표시: 자금, 월 수지 (+는 초록, −는 빨강), 하루 승객
import { formatMoney, formatSignedMoney, formatPopulation } from './format.js';

export function createStatus(element) {
  element.innerHTML = `
    <span class="status-label">자금</span>
    <b class="status-money"></b>
    <span class="status-label">월 수지</span>
    <b class="status-net"></b>
    <span class="status-label">하루 승객</span>
    <b class="status-riders"></b>
    <span class="status-danger" hidden></span>
  `;
  const moneyText = element.querySelector('.status-money');
  const netText = element.querySelector('.status-net');
  const ridersText = element.querySelector('.status-riders');
  const dangerText = element.querySelector('.status-danger');

  // money: 지금 자금, net: 이번 달 예상 수지 (수입 − 운영비 − 이자), riders: 하루 승객 전체
  // monthsLeft: 파산까지 남은 달 (빚이 한도 안이면 null)
  function show({ money, net, riders, monthsLeft }) {
    dangerText.hidden = monthsLeft === null;
    if (monthsLeft !== null) dangerText.textContent = `파산까지 ${monthsLeft}개월`;
    ridersText.textContent = formatPopulation(riders);
    moneyText.textContent = formatMoney(money);
    moneyText.classList.toggle('negative', money < 0);
    netText.textContent = formatSignedMoney(net);
    netText.classList.toggle('positive', net > 0.05);
    netText.classList.toggle('negative', net < -0.05);
  }

  return { show };
}
