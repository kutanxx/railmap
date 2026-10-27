// 왼쪽 위 남색 배지에 날짜와 지역을 쓴다 (예: "2026년 3월 · 서울", 샌드박스면 "… · 서울 · 샌드박스")
// 배지는 버튼이라 누르면 멈춤·다시 가기 (app.js). 멈춰 있으면 끝에 노란 "❚❚ 멈춤"을 붙인다 (색과 글자가 함께 바뀐다)
export function renderBadge(element, { year, month, region, paused, sandbox }) {
  const text = `${year}년 ${month}월 · ${region}${sandbox ? ' · 샌드박스' : ''}`;
  if (!element.firstChild) {
    const paused = document.createElement('span');
    paused.className = 'badge-paused';
    element.append(document.createTextNode(''), paused);
  }
  if (element.firstChild.textContent !== text) element.firstChild.textContent = text;
  const pausedText = paused ? '❚❚ 멈춤' : '';
  if (element.lastChild.textContent !== pausedText) element.lastChild.textContent = pausedText;
}
