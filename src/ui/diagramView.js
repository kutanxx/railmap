// 노선도 보기 ([노선도] 버튼, D 키): 지도를 덮는 화면에 내 노선망을 지하철 노선도처럼 그린다.
// - 역 자리는 diagramLayout.js가 가로·세로·45도 선에 맞게 고친다 (실제 위치를 바탕으로)
// - 같은 두 역 사이를 여러 노선이 지나면 나란히 그린다 (노선 번호 순서)
// - 일반역은 흰 원 + 노선 색 테두리, 환승역은 흰 원 + 굵은 남색 테두리 (지도의 아주 먼 줌 모양과 같다)
// - 역 이름은 선이 덜 지나는 쪽에 붙인다
// - 끌어서 옮기고, 휠로 확대한다. 역을 누르면 노선도를 닫고 지도에서 그 역으로 간다
// - [그림 저장]으로 PNG 파일을 받는다 (diagramExport.js)
// - D 키, Esc, [닫기]로 닫는다. 상태는 읽기만 한다
import { getState, findStation } from '../game/state.js';
import { saveDiagramPng } from './diagramExport.js';
import { getRegion } from '../game/region.js';
import { routeNumber } from '../game/routes.js';
import { inkOn } from '../map/ink.js';
import { diagramPositions, edgePoints, offsetPolyline } from './diagramLayout.js';

const SVG = 'http://www.w3.org/2000/svg';
// 그림 크기 (px, 확대 1배일 때)
const LINE_WIDTH = 6; // 노선 선 굵기
const LINE_GAP = 8; // 나란한 노선 사이 간격 (선 굵기 + 땅색 틈 2px)
const STATION_RADIUS = 5; // 일반역 원
const MAX_UNIT = 110; // 역 간격 1이 화면에서 가장 클 때 (역이 몇 개 없을 때 너무 커지지 않게)
const MARGIN = 90; // 화면 가장자리 여백 (역 이름이 잘리지 않게)
const LABEL_GAP = 6; // 역 원과 이름 사이
const NAVY = '#1f3a55';
const LAND = '#efe7d6';
// 역 이름을 붙일 수 있는 8방향 (앞쪽이 먼저 고려된다: 오른쪽, 왼쪽, 위, 아래, 대각선)
const LABEL_SIDES = [0, 180, -90, 90, -45, -135, 45, 135].map((deg) => (deg * Math.PI) / 180);

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

const angleGap = (a, b) => {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
};

// onPickStation(역 id): 역을 눌렀을 때 (app.js가 지도를 그 역으로 옮기고 고른다)
// 결과: { open, close, toggle, isOpen, update }
export function createDiagramView({ onPickStation }) {
  const root = document.createElement('div');
  root.className = 'diagram';
  root.hidden = true;
  root.innerHTML = `
    <div class="diagram-bar">
      <b class="diagram-title"></b>
      <div class="diagram-legend"></div>
      <button class="hud-button diagram-save" type="button" title="노선도를 PNG 그림 파일로 받기">그림 저장</button>
      <button class="hud-button diagram-close" type="button" title="노선도 닫기 (D 키 · Esc)">닫기 ✕</button>
    </div>
    <p class="diagram-hint">끌어서 옮기기 · 휠로 확대 · 역을 누르면 지도에서 보기</p>
    <p class="diagram-empty" hidden>노선을 만들면 노선도가 생겨요</p>
    <p class="diagram-credit">지도 자료 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></p>
  `;
  const svg = svgElement('svg', { class: 'diagram-svg', role: 'img', 'aria-label': '노선도' });
  const world = svgElement('g');
  svg.append(world);
  root.prepend(svg);
  document.body.append(root);
  const title = root.querySelector('.diagram-title');
  const legend = root.querySelector('.diagram-legend');
  const empty = root.querySelector('.diagram-empty');
  root.querySelector('.diagram-close').addEventListener('click', () => close());
  // [그림 저장]: 파일 이름에 지도와 게임 날짜를 넣는다 (내보내기 파일과 같은 모양)
  const saveButton = root.querySelector('.diagram-save');
  saveButton.addEventListener('click', () => {
    saveButton.textContent = '그림 저장';
    const { routes, year, month } = getState();
    saveDiagramPng({
      world,
      title: title.textContent,
      routes: routes.filter((route) => route.stations.length >= 2),
      fileName: `railmap-diagram-${getRegion().id}-${year}-${String(month).padStart(2, '0')}.png`,
    }).catch((error) => {
      saveButton.textContent = '저장 실패';
      saveButton.title = `그림을 만들지 못했어요: ${error.message}`;
    });
  });

  let drawnKey = null; // 마지막으로 그린 노선망 (같으면 다시 계산하지 않는다)
  let layoutCache = { key: null, positions: null };
  // 끌기·확대 상태
  let view = { x: 0, y: 0, scale: 1 };
  const applyView = () => world.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.scale})`);

  // 노선망 모양이 같은지 알아보는 열쇠 (역 위치·이름, 노선 역 순서·색·이름)
  function networkKey(routes) {
    const stations = new Set(routes.flatMap((route) => route.stations));
    return JSON.stringify([
      routes.map((route) => [route.id, route.name, route.color, route.stations]),
      [...stations].map((id) => {
        const station = findStation(id);
        return [id, station.name, station.coord];
      }),
      window.innerWidth,
      window.innerHeight,
    ]);
  }

  function draw() {
    const routes = getState().routes.filter((route) => route.stations.length >= 2);
    title.textContent = `노선도 · ${getRegion().name}`;
    empty.hidden = routes.length > 0;
    saveButton.hidden = routes.length === 0;
    const key = networkKey(routes);
    if (key === drawnKey) return;
    drawnKey = key;
    view = { x: 0, y: 0, scale: 1 };
    applyView();
    world.replaceChildren();
    drawLegend(routes);
    if (routes.length === 0) return;

    // 이웃한 역 쌍 (방향 없이 하나로): "작은 id|큰 id" → { a, b, routes: [노선…] }
    const edges = new Map();
    for (const route of routes) {
      for (let i = 1; i < route.stations.length; i++) {
        const [a, b] = [route.stations[i - 1], route.stations[i]].sort();
        const edgeKey = `${a}|${b}`;
        const edge = edges.get(edgeKey) ?? { a, b, routes: [] };
        if (!edge.routes.includes(route)) edge.routes.push(route);
        edges.set(edgeKey, edge);
      }
    }
    for (const edge of edges.values()) edge.routes.sort((p, q) => routeNumber(p) - routeNumber(q));
    const stationIds = [...new Set(routes.flatMap((route) => route.stations))];

    // 역 자리 (노선망 모양이 바뀔 때만 다시 계산한다. 창 크기만 바뀌면 그대로)
    const layoutKey = JSON.stringify([stationIds.map((id) => findStation(id).coord), [...edges.keys()]]);
    if (layoutCache.key !== layoutKey) {
      const positions = diagramPositions(
        stationIds.map((id) => ({ id, coord: findStation(id).coord })),
        [...edges.values()].map(({ a, b }) => [a, b]),
      );
      layoutCache = { key: layoutKey, positions };
    }
    const positions = layoutCache.positions;

    // 화면에 맞추기: 위쪽 막대 아래 남는 자리에 가운데로
    const xs = stationIds.map((id) => positions.get(id)[0]);
    const ys = stationIds.map((id) => positions.get(id)[1]);
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const width = root.clientWidth;
    const height = root.clientHeight;
    const top = root.querySelector('.diagram-bar').getBoundingClientRect().bottom;
    const unit = Math.min(
      MAX_UNIT,
      (width - 2 * MARGIN) / Math.max(maxX - minX, 0.001),
      (height - top - 2 * MARGIN) / Math.max(maxY - minY, 0.001),
    );
    const left = (width - (maxX - minX) * unit) / 2;
    const upper = top + (height - top - (maxY - minY) * unit) / 2;
    const px = (id) => {
      const [x, y] = positions.get(id);
      return [left + (x - minX) * unit, upper + (y - minY) * unit];
    };

    // 선: 쌍마다 8방향 토막, 노선마다 옆으로 민 자리
    const edgeShape = new Map(); // "a|b" → { points (a→b), offsets: Map(노선 id → px) }
    for (const [edgeKey, edge] of edges) {
      const offsets = new Map(edge.routes.map((route, k) => [route.id, (k - (edge.routes.length - 1) / 2) * LINE_GAP]));
      edgeShape.set(edgeKey, { points: edgePoints(px(edge.a), px(edge.b)), offsets });
    }
    const lines = svgElement('g', { fill: 'none', 'stroke-width': LINE_WIDTH, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    for (const route of routes) {
      const points = [];
      for (let i = 1; i < route.stations.length; i++) {
        const from = route.stations[i - 1];
        const to = route.stations[i];
        const [a, b] = [from, to].sort();
        const shape = edgeShape.get(`${a}|${b}`);
        let part = offsetPolyline(shape.points, shape.offsets.get(route.id));
        if (from !== a) part = [...part].reverse();
        points.push(...part);
      }
      lines.append(svgElement('polyline', { points: points.map((p) => p.join(',')).join(' '), stroke: route.color }));
    }
    world.append(lines);

    // 역: 원과 이름
    // 원 크기: 그 역에 닿는 선들 중 가장 넓게 퍼진 폭을 덮는다. 환승역은 조금 크게
    const marks = stationIds.map((id) => {
      const [x, y] = px(id);
      const through = routes.filter((route) => route.stations.includes(id));
      const touching = [...edges.values()].filter((edge) => edge.a === id || edge.b === id);
      const spread = Math.max(0, ...touching.map((edge) => (edge.routes.length - 1) * LINE_GAP));
      const transfer = through.length >= 2;
      const radius = Math.max(transfer ? STATION_RADIUS + 2 : STATION_RADIUS, spread / 2 + 4);
      return { id, x, y, radius, transfer, color: through[0].color, touching };
    });
    // 이름표끼리, 이름표와 다른 역 원이 겹치지 않게 놓은 자리들 { left, top, right, bottom }
    const taken = marks.map(({ x, y, radius }) => ({ left: x - radius, top: y - radius, right: x + radius, bottom: y + radius }));
    const overlaps = (box) =>
      taken.some((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top);

    const stationLayer = svgElement('g');
    world.append(stationLayer);
    for (const { id, x, y, radius, transfer, color, touching } of marks) {
      const station = findStation(id);
      const group = svgElement('g', { class: 'diagram-station', tabindex: 0, role: 'button' });
      group.setAttribute('aria-label', `${station.name} 지도에서 보기`);
      group.append(
        svgElement('circle', {
          cx: x,
          cy: y,
          r: radius,
          fill: '#ffffff',
          stroke: transfer ? NAVY : color,
          'stroke-width': transfer ? 3 : 2.5,
        }),
      );
      const label = svgElement('text', { class: 'diagram-label', stroke: LAND });
      label.textContent = station.name;
      group.append(label);
      stationLayer.append(group);

      // 이름은 선이 나가는 방향들과 먼 쪽부터 놓아 보고, 다른 이름표·역과 겹치지 않는 첫 자리에 둔다
      const outgoing = touching.map((edge) => {
        const points = edgeShape.get(`${edge.a}|${edge.b}`).points;
        const [p, q] = edge.a === id ? [points[0], points[1]] : [points.at(-1), points.at(-2)];
        return Math.atan2(q[1] - p[1], q[0] - p[0]);
      });
      const clearance = (angle) => Math.min(...outgoing.map((o) => angleGap(o, angle)));
      // 선과 넓게 떨어진 쪽부터 (거의 같으면 LABEL_SIDES 순서: 오른쪽, 왼쪽, 위, 아래, 대각선)
      const sides = LABEL_SIDES.map((angle, order) => ({ angle, order, room: clearance(angle) })).sort((a, b) =>
        Math.abs(b.room - a.room) < 0.01 ? a.order - b.order : b.room - a.room,
      );
      const place = (angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        label.setAttribute('x', x + cos * (radius + LABEL_GAP));
        label.setAttribute('y', y + sin * (radius + LABEL_GAP));
        label.setAttribute('text-anchor', Math.abs(cos) < 0.1 ? 'middle' : cos > 0 ? 'start' : 'end');
        label.setAttribute('dominant-baseline', Math.abs(sin) < 0.1 ? 'central' : sin > 0 ? 'hanging' : 'alphabetic');
        const { x: left, y: top, width, height } = label.getBBox();
        return { left, top, right: left + width, bottom: top + height };
      };
      let box = null;
      for (const { angle } of sides) {
        box = place(angle);
        if (!overlaps(box)) break;
        box = null;
      }
      // 어디에 놓아도 겹치면 가장 트인 쪽에 둔다
      taken.push(box ?? place(sides[0].angle));

      const pick = () => {
        close();
        onPickStation(id);
      };
      group.addEventListener('click', pick);
      group.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        // 뒤의 게임(노선 완성 Enter)까지 가지 않게
        event.stopPropagation();
        pick();
      });
    }
  }

  // 위쪽 막대의 노선 목록: 번호 배지 + 이름
  function drawLegend(routes) {
    legend.replaceChildren(
      ...routes.map((route) => {
        const item = document.createElement('span');
        item.className = 'diagram-legend-item';
        const badge = document.createElement('span');
        badge.className = 'route-item-dot';
        badge.style.background = route.color;
        badge.style.color = inkOn(route.color);
        badge.textContent = routeNumber(route);
        item.append(badge, route.name);
        return item;
      }),
    );
  }

  // ── 끌어서 옮기기·휠로 확대 ──
  let drag = null;
  svg.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.diagram-station')) return;
    drag = { x: event.clientX - view.x, y: event.clientY - view.y };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove', (event) => {
    if (!drag) return;
    view.x = event.clientX - drag.x;
    view.y = event.clientY - drag.y;
    applyView();
  });
  const endDrag = () => {
    drag = null;
    svg.classList.remove('dragging');
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      const scale = Math.min(4, Math.max(0.4, view.scale * factor));
      // 마우스 자리가 그대로 있게 확대한다
      const rect = svg.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      view.x = mx - ((mx - view.x) * scale) / view.scale;
      view.y = my - ((my - view.y) * scale) / view.scale;
      view.scale = scale;
      applyView();
    },
    { passive: false },
  );

  window.addEventListener('resize', () => {
    if (!root.hidden) draw();
  });

  function open() {
    root.hidden = false;
    document.body.classList.add('diagram-open');
    drawnKey = null; // 열 때마다 화면에 맞춰 새로 그린다
    draw();
  }

  function close() {
    root.hidden = true;
    document.body.classList.remove('diagram-open');
  }

  return {
    open,
    close,
    toggle: () => (root.hidden ? open() : close()),
    isOpen: () => !root.hidden,
    // 열려 있으면 노선망이 바뀌었을 때 다시 그린다
    update: () => {
      if (!root.hidden) draw();
    },
  };
}
