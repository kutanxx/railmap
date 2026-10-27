// 노선의 처음 이름과 색 정하기: 지금 지도(도시)의 실제 노선 이름·색을 첫 노선부터 차례로 쓰고 (src/lineColors.js),
// 모자라면 이름은 "n호선", 색은 추천 색(config.js의 ROUTE_COLORS)으로 이어 간다. 추천 색 가운데 도시 색과 거의 같은 색은 건너뛴다.
// 노선 패널의 색 고르기 견본도 같은 목록을 쓴다.
import { ROUTE_COLORS, SAME_ROUTE_COLOR_DISTANCE } from '../config.js';
import { LINE_COLORS } from '../lineColors.js';
import { getRegion } from './region.js';

// 고를 수 있는 노선 색 목록: [{ name: '1호선' 또는 '남색' 같은 이름, color: '#RRGGBB' }]
export function colorChoices() {
  const city = LINE_COLORS[getRegion().id] ?? [];
  const extra = ROUTE_COLORS.filter(({ color }) =>
    city.every((line) => colorDistance(line.color, color) >= SAME_ROUTE_COLOR_DISTANCE),
  );
  return [...city, ...extra];
}

// number번째 노선(1부터)의 처음 이름: 그 도시의 number번째 실제 노선 이름 (서울 "1호선", 런던 "베이커루선" …).
// 실제 노선보다 많으면 "n호선"
export function routeNameFor(number) {
  const city = LINE_COLORS[getRegion().id] ?? [];
  return city[number - 1]?.name ?? `${number}호선`;
}

// number번째 노선(1부터)의 처음 색. 목록을 다 쓰면 처음부터 다시 돈다
export function routeColorFor(number) {
  const choices = colorChoices();
  return choices[(number - 1) % choices.length].color;
}

// 두 색이 사람 눈에 얼마나 다른지 (CIELAB 거리 ΔE, 2.3쯤이면 겨우 구별, 15면 확실히 다름)
function colorDistance(a, b) {
  const [x, y] = [toLab(a), toLab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function toLab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
