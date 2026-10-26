// 왼쪽 위 남색 배지에 날짜와 지역을 쓴다 (예: "2026년 3월 · 서울")
export function renderBadge(element, { year, month, region }) {
  element.textContent = `${year}년 ${month}월 · ${region}`;
}
