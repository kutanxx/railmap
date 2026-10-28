// 노선도 보기 ([노선도] 버튼, D 키): 지도를 덮는 화면에 내 노선망을 지하철 노선도처럼 그린다.
// - 역 자리는 diagramLayout.js가 가로·세로·45도 선에 맞게 고친다 (실제 위치를 바탕으로)
// - 같은 두 역 사이를 여러 노선이 지나면 나란히 그린다 (노선 번호 순서)
// - 일반역은 흰 원 + 노선 색 테두리, 환승역은 흰 원 + 굵은 남색 테두리 (지도의 아주 먼 줌 모양과 같다)
// - 역 이름은 선이 덜 지나는 쪽에 붙인다
// - 끌어서 옮기고, 휠이나 두 손가락으로 확대한다. 역을 누르면 노선도를 닫고 지도에서 그 역으로 간다
// - [그림 저장]으로 PNG 파일을 받는다 (diagramExport.js)
// - D 키, Esc, [닫기]로 닫는다. 상태는 읽기만 한다
import { getState, findStation } from '../game/state.js';
import { saveDiagramPng } from './diagramExport.js';
import { svgElement, cssColor } from './svg.js';
import { getRegion } from '../game/region.js';
import { routeNumber } from '../game/routes.js';
import { isExpress } from '../game/routeKinds.js';
import { routeBadge } from './routeBadge.js';
import { diagramPositions, edgePoints, offsetPolyline } from './diagramLayout.js';

// 그림 크기 (px, 확대 1배일 때)
const LINE_WIDTH = 6; // 노선 선 굵기
const LINE_GAP = 8; // 나란한 노선 사이 간격 (선 굵기 + 땅색 틈 2px)
const STATION_RADIUS = 5; // 일반역 원
const MAX_UNIT = 110; // 역 간격 1이 화면에서 가장 클 때 (역이 몇 개 없을 때 너무 커지지 않게)
const MARGIN = 90; // 화면 가장자리 여백 (역 이름이 잘리지 않게)
const LABEL_GAP = 6; // 역 원과 이름 사이
const LABEL_PAD = 2; // 이름끼리 띄울 여유 (px)
// 역 이름을 붙일 수 있는 8방향 (앞쪽이 먼저 고려된다: 오른쪽, 왼쪽, 위, 아래, 대각선)
const LABEL_SIDES = [0, 180, -90, 90, -45, -135, 45, 135].map((deg) => (deg * Math.PI) / 180);

// 선 토막 p–q가 네모(box)를 지나는지 (리앙–바스키 자르기: 토막을 네모 안으로 잘라 남는 부분이 있으면 지난다)
function segmentHitsBox([x1, y1], [x2, y2], box) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [
    [-dx, x1 - box.left],
    [dx, box.right - x1],
    [-dy, y1 - box.top],
    [dy, box.bottom - y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r);
      else t1 = Math.min(t1, r);
      if (t0 > t1) return false;
    }
  }
  return true;
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
    <p class="diagram-hint">끌어서 옮기기 · 휠·두 손가락으로 확대 · 역을 누르면 지도에서 보기</p>
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
    const segments = []; // 그린 선 토막들 [[x, y], [x, y]] (역 이름이 선을 덮지 않게 피할 때 쓴다)
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
      for (let i = 1; i < points.length; i++) segments.push([points[i - 1], points[i]]);
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
    const boxesHit = (box) =>
      taken.filter((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top).length;
    const linesHit = (box) => segments.filter(([p, q]) => segmentHitsBox(p, q, box)).length;

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
          stroke: transfer ? cssColor('navy') : color,
          'stroke-width': transfer ? 3 : 2.5,
        }),
      );
      const label = svgElement('text', { class: 'diagram-label', stroke: cssColor('land') });
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
        // 이름 둘레에 조금 여유를 두고 잰다 (이름끼리 딱 붙어 보이지 않게)
        const { x: left, y: top, width, height } = label.getBBox();
        return { left: left - LABEL_PAD, top: top - LABEL_PAD, right: left + width + LABEL_PAD, bottom: top + height + LABEL_PAD };
      };
      // 트인 쪽부터 놓아 보고, 아무것도 덮지 않는 첫 자리에 둔다. 어디든 덮으면 가장 덜 덮는 자리
      // (다른 이름·역을 덮는 것이 선을 덮는 것보다 훨씬 나쁘다)
      let best = null;
      for (const { angle } of sides) {
        const box = place(angle);
        const hits = boxesHit(box) * 100 + linesHit(box);
        if (!best || hits < best.hits) best = { angle, box, hits };
        if (hits === 0) break;
      }
      place(best.angle);
      taken.push(best.box);

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
        item.append(routeBadge(route.color, routeNumber(route), 'span', isExpress(route)), route.name);
        return item;
      }),
    );
  }

  // ── 끌어서 옮기기·휠로 확대·두 손가락으로 확대 ──
  // (sx, sy) 화면 자리가 그대로 있게 확대 정도를 scale로 바꾼다
  function zoomAt(sx, sy, scale) {
    const next = Math.min(4, Math.max(0.4, scale));
    const rect = svg.getBoundingClientRect();
    const mx = sx - rect.left;
    const my = sy - rect.top;
    view.x = mx - ((mx - view.x) * next) / view.scale;
    view.y = my - ((my - view.y) * next) / view.scale;
    view.scale = next;
    applyView();
  }
  // 누르고 있는 손가락·마우스: pointerId → [x, y]. 하나면 끌기, 둘이면 벌리고 오므려 확대
  const pointers = new Map();
  let drag = null;
  let pinch = null; // { distance: 처음 두 손가락 거리, scale: 그때 확대 정도 }
  const fingerGap = () => {
    const [[x1, y1], [x2, y2]] = [...pointers.values()];
    return { distance: Math.hypot(x2 - x1, y2 - y1), x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  };
  svg.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.diagram-station')) return;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    svg.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      drag = { x: event.clientX - view.x, y: event.clientY - view.y };
      svg.classList.add('dragging');
    } else if (pointers.size === 2) {
      drag = null;
      pinch = { distance: fingerGap().distance, scale: view.scale };
    }
  });
  svg.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pinch && pointers.size === 2) {
      const { distance, x, y } = fingerGap();
      if (pinch.distance > 0) zoomAt(x, y, (pinch.scale * distance) / pinch.distance);
    } else if (drag) {
      view.x = event.clientX - drag.x;
      view.y = event.clientY - drag.y;
      applyView();
    }
  });
  const release = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      drag = null;
      svg.classList.remove('dragging');
    }
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
  svg.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      // 마우스 자리가 그대로 있게 확대한다
      zoomAt(event.clientX, event.clientY, view.scale * Math.exp(-event.deltaY * 0.0015));
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
