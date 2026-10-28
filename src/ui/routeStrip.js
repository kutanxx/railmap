// 접은 오른쪽 패널: 노선 번호 배지만 세로로 늘어선 좁은 띠 (오른쪽 끝 역들이 다시 보이게).
// [◂]를 누르면 노선 목록을 다시 펼치고, 번호를 누르면 그 노선 정보를 연다 (닫으면 다시 띠로 돌아온다).
import { routeBadge } from './routeBadge.js';

// onUnfold(): 다시 펼치기, onSelect(노선 id): 노선 고르기
export function createRouteStrip(element, { onUnfold, onSelect }) {
  element.innerHTML = `
    <button type="button" class="route-strip-open" title="노선 목록 펼치기" aria-label="노선 목록 펼치기">◂</button>
    <div class="route-strip-list"></div>
  `;
  element.querySelector('.route-strip-open').addEventListener('click', onUnfold);
  const list = element.querySelector('.route-strip-list');
  let shownKey = '';

  // routes: [{ id, name, number, color }] 또는 null (띠를 숨김)
  function show(routes) {
    element.hidden = !routes;
    if (!routes) return;
    // 노선이 바뀌었을 때만 배지를 다시 만든다
    const key = routes.map((route) => `${route.id}${route.color}${route.name}`).join(',');
    if (key === shownKey) return;
    shownKey = key;
    list.replaceChildren(
      ...routes.map((route) => {
        const badge = routeBadge(route.color, route.number, 'button', route.express);
        badge.classList.add('route-strip-badge');
        badge.title = route.name;
        badge.addEventListener('click', () => onSelect(route.id));
        return badge;
      }),
    );
  }

  return { show };
}
