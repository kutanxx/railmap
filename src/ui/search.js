// 역·노선 찾기: / 키나 [메뉴]의 [역·노선 찾기]로 화면 위쪽 가운데에 찾기 칸을 연다.
// 이름 일부를 치면 맞는 역·노선이 아래에 나오고, 누르거나 Enter를 치면 그 자리로 지도가 가서 고른다.
// ↑↓로 고르고, Esc나 칸 밖을 누르면 닫힌다. 상태는 고치지 않고 고르기(select)만 한다.
import { bbox } from '@turf/turf';
import { getState, routeCoords } from '../game/state.js';
import { routeNumber } from '../game/routes.js';
import { routeBadge } from './routeBadge.js';

// 한 번에 보여줄 결과 수
const MAX_RESULTS = 8;

// select·render: 고른 것 바꾸기와 다시 그리기 (app.js). 결과: { open, close, isOpen }
export function createSearch({ map, select, render }) {
  const box = document.createElement('div');
  box.className = 'search-box';
  box.hidden = true;
  box.innerHTML = `
    <input class="search-input" type="search" placeholder="역·노선 이름" aria-label="역·노선 이름으로 찾기" />
    <div class="search-results" role="listbox"></div>
  `;
  document.body.append(box);
  const input = box.querySelector('.search-input');
  const list = box.querySelector('.search-results');
  let results = [];
  let active = 0;

  // 이름에 친 글자가 들어 있는 역·노선 (앞에서부터 맞는 것 먼저)
  function find(query) {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    const { stations, routes } = getState();
    const items = [
      ...routes.map((route) => ({ type: 'route', id: route.id, name: route.name, color: route.color, number: routeNumber(route) })),
      ...stations.map((station) => ({ type: 'station', id: station.id, name: station.name })),
    ].filter((item) => item.name.toLowerCase().includes(text));
    items.sort((a, b) => a.name.toLowerCase().indexOf(text) - b.name.toLowerCase().indexOf(text));
    return items.slice(0, MAX_RESULTS);
  }

  function show() {
    results = find(input.value);
    active = Math.min(active, Math.max(0, results.length - 1));
    if (input.value.trim() && results.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = '맞는 역·노선이 없어요';
      list.replaceChildren(empty);
      return;
    }
    list.replaceChildren(
      ...results.map((item, index) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = `search-item${index === active ? ' active' : ''}`;
        row.setAttribute('role', 'option');
        if (item.type === 'route') {
          row.append(routeBadge(item.color, item.number));
        } else {
          const dot = document.createElement('span');
          dot.className = 'search-station-dot';
          row.append(dot);
        }
        const name = document.createElement('span');
        name.textContent = item.name;
        const kind = document.createElement('small');
        kind.textContent = item.type === 'route' ? '노선' : '역';
        row.append(name, kind);
        row.addEventListener('click', () => go(item));
        return row;
      }),
    );
  }

  // 그 자리로 가서 고른다: 역은 가까이, 노선은 노선 전체가 보이게
  function go(item) {
    close();
    select({ type: item.type, id: item.id });
    if (item.type === 'station') {
      const station = getState().stations.find((s) => s.id === item.id);
      map.flyTo({ center: station.coord, zoom: Math.max(map.getZoom(), 15) });
    } else {
      const route = getState().routes.find((r) => r.id === item.id);
      const [west, south, east, north] = bbox({ type: 'LineString', coordinates: routeCoords(route) });
      map.fitBounds([[west, south], [east, north]], { padding: 120, maxZoom: 15 });
    }
    render();
  }

  input.addEventListener('input', () => {
    active = 0;
    show();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length === 0) return;
      active = (active + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length;
      show();
    } else if (event.key === 'Enter' && results[active]) {
      go(results[active]);
    }
  });
  // 찾기 칸 밖을 누르면 닫는다
  document.addEventListener('pointerdown', (event) => {
    if (!box.hidden && !box.contains(event.target)) close();
  });

  function open() {
    box.hidden = false;
    input.value = '';
    active = 0;
    show();
    input.focus();
  }

  function close() {
    box.hidden = true;
    input.blur();
  }

  return { open, close, isOpen: () => !box.hidden };
}
