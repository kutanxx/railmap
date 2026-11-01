// 숫자를 화면에 보여줄 글로 바꾼다

// 돈 (억 원): 612.3 → "612.3억", 1234 → "1,234억", -239 → "−239억", 12345 → "1조 2,345억"
// 선로에서 가장 급하게 휘는 곳을 글로 (game/running.js의 sharpestCurve 결과, 없으면 '').
// 곡선 선로는 반지름, 꺾인 직선은 꺾인 각도. 느려지면 그곳 제한 속도를 함께
export function formatSharpestCurve(sharp, curve) {
  if (!sharp) return '';
  const where = curve
    ? `가장 좁은 곳 반지름 약 ${Math.round(sharp.radiusM / 10) * 10}m`
    : `가장 크게 꺾인 곳 ${Math.round(sharp.turn)}°`;
  return sharp.speedKmh === null ? `${where} · 느려지지 않아요` : `${where} · 시속 ${Math.round(sharp.speedKmh)}km로 느려져요`;
}

export function formatMoney(amount) {
  const size = Math.abs(amount);
  const rounded = size >= 100 ? Math.round(size) : Math.round(size * 10) / 10;
  // 빼기 기호는 글자 폭이 넓은 "−"로 통일한다 (월 수지의 "−"와 같게)
  return `${amount < 0 && rounded > 0 ? '−' : ''}${withJo(rounded)}`;
}

// 1만 억이 넘으면 "조"를 쓴다: 12345 → "1조 2,345억", 20000 → "2조", 345 → "345억"
function withJo(eok) {
  if (eok < 10000) return `${eok.toLocaleString('ko-KR')}억`;
  const jo = Math.floor(eok / 10000);
  const rest = eok - jo * 10000;
  return `${jo.toLocaleString('ko-KR')}조${rest > 0 ? ` ${rest.toLocaleString('ko-KR')}억` : ''}`;
}

// 부호를 붙인 돈: 4.81 → "+4.8억", -1.2 → "−1.2억"
export function formatSignedMoney(amount) {
  const text = formatMoney(Math.abs(amount));
  // 반올림해서 0이 되면 부호를 붙이지 않는다 (−0.03 → "0억", "−0억"이 아니라)
  if (text === '0억') return text;
  return `${amount > 0 ? '+' : '−'}${text}`;
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
