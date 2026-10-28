// 노선 번호 배지: 노선 색 동그라미 + 번호 (글자는 보통 흰색, 아주 밝은 노선 색이면 남색, map/ink.js).
// 역 카드, 노선 목록, 접은 번호 띠, 역·노선 찾기, 노선도 위쪽 막대가 함께 쓴다 (모양은 styles/routes.css의 .route-item-dot).
import { inkOn } from '../map/ink.js';

// 광역급행 노선(game/routeKinds.js)은 동그라미 대신 모서리가 둥근 네모로 그려 지하철과 구별한다.
// color: 노선 색, number: 노선 번호, tag: 'span' (보여주기만) 또는 'button' (누를 수 있는 번호 띠), express: 광역급행인지
export function routeBadge(color, number, tag = 'span', express = false) {
  const badge = document.createElement(tag);
  if (tag === 'button') badge.type = 'button';
  badge.className = express ? 'route-item-dot route-item-dot-express' : 'route-item-dot';
  badge.style.background = color;
  badge.style.color = inkOn(color);
  badge.textContent = number;
  return badge;
}
