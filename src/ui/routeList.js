// 노선 목록 (오른쪽 노선 패널의 평소 모습, routePanel.js가 쓴다)
// 줄마다 번호 배지(노선 색) + 이름 + 하루 승객 · 월 수입. 누르면 그 노선을 고른다
import { CROWDED_WARNING } from '../config.js';
import { formatPeopleShort, formatSignedMoney } from './format.js';

// list: 목록을 넣을 칸, routes: [{ id, name, color, number, lengthKm, revenue, riders, load }]
export function renderRouteList(list, routes, onSelect) {
  if (routes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'route-empty';
    empty.textContent = '아직 노선이 없어요.';
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(
    ...routes.map((route) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'route-item';
      const dot = document.createElement('span');
      dot.className = 'route-item-dot';
      dot.style.background = route.color;
      dot.textContent = route.number;
      const name = document.createElement('span');
      name.className = 'route-item-name';
      name.textContent = route.name;
      const length = document.createElement('span');
      length.className = 'route-item-length';
      length.textContent = `${formatPeopleShort(route.riders)}명 · ${formatSignedMoney(route.revenue)}`;
      // 넘치는 노선은 목록에서도 빨간 "혼잡"으로 알려준다
      if (route.load > 1) {
        const crowded = document.createElement('span');
        crowded.className = 'route-item-crowded';
        crowded.textContent = '혼잡';
        name.append(crowded);
      }
      length.title = `하루 승객 · 월 수입 (길이 ${route.lengthKm.toFixed(1)} km)`;
      item.append(dot, name, length);
      item.addEventListener('click', () => onSelect(route.id));
      return item;
    }),
  );
}

// 혼잡도 색: 여유(초록) / 붐빔(주황) / 넘침(빨강)
export function loadTone(load) {
  if (load > 1) return 'load-over';
  if (load >= CROWDED_WARNING) return 'load-busy';
  return 'load-ok';
}
