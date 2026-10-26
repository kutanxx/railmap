// 숫자를 화면에 보여줄 글로 바꾼다

// 돈 (억 원): 612.3 → "612.3억", 1234 → "1,234억"
export function formatMoney(amount) {
  const rounded = Math.abs(amount) >= 100 ? Math.round(amount) : Math.round(amount * 10) / 10;
  return `${rounded.toLocaleString('ko-KR')}억`;
}

// 부호를 붙인 돈: 4.81 → "+4.8억", -1.2 → "−1.2억"
export function formatSignedMoney(amount) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${formatMoney(Math.abs(amount))}`;
}

// 짧은 사람 수 (말풍선처럼 좁은 곳): 23400 → "2.3만", 4000 → "4,000"
export function formatPeopleShort(people) {
  if (people >= 10000) return `${(people / 10000).toFixed(1)}만`;
  return Math.round(people).toLocaleString('ko-KR');
}

// 인구: 23400 → "2.3만 명", 4000 → "4,000명"
export function formatPopulation(people) {
  if (people >= 10000) return `${(people / 10000).toFixed(1)}만 명`;
  return `${Math.round(people).toLocaleString('ko-KR')}명`;
}
