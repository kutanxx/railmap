// 노선도 보기 ([노선도] 버튼, D 키): 지도를 덮는 화면에 내 노선망을 지하철 노선도처럼 그린다.
// - 역 자리는 diagramLayout.js가 가로·세로·45도 선에 맞게 고친다 (실제 위치를 바탕으로)
// - 같은 두 역 사이를 여러 노선이 지나면 나란히 그린다 (노선 번호 순서)
// - 일반역은 흰 원 + 노선 색 테두리, 환승역은 흰 원 + 굵은 남색 테두리 (지도의 아주 먼 줌 모양과 같다).
//   위쪽 막대에서 [벡풍][비녤리풍]으로 선 굵기·역 모양을 바꿀 수 있다 (diagramSkins.js)
// - 역 이름은 선이 덜 지나는 쪽에 붙이고, 확대해도 같은 크기로 보인다. 겹치는 이름은 숨겼다가 확대하면 보인다 (diagramLabels.js)
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
import { createDiagramLabels } from './diagramLabels.js';
import { SKINS, loadSkin, saveSkin, stationMark } from './diagramSkins.js';
import { FINGER } from '../map/hitPad.js';

// 그림 크기 (px, 확대 1배일 때). 선 굵기·나란한 간격·역 크기는 고른 모양마다 (diagramSkins.js의 SKINS)
const MAX_UNIT = 110; // 역 간격 1이 화면에서 가장 클 때 (역이 몇 개 없을 때 너무 커지지 않게)
const MARGIN = 90; // 화면 가장자리 여백 (역 이름이 잘리지 않게)

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
      <div class="diagram-skins" role="group" aria-label="노선도 모양"></div>
      <button class="hud-button diagram-save" type="button" title="노선도를 PNG 그림 파일로 받기">그림 저장</button>
      <button class="hud-button diagram-close" type="button" title="노선도 닫기 (D 키 · Esc)">닫기 ✕</button>
    </div>
    <p class="diagram-hint">${FINGER ? '끌어서 옮기기 · 두 손가락으로 확대 · 역을 누르면 지도에서 보기' : '끌어서 옮기기 · 휠로 확대 · 역을 누르면 지도에서 보기'}</p>
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
    // 그림은 확대 1배 모양으로 저장한다: 이름 자리를 1배로 고르고, 복사한 뒤(saveDiagramPng가 바로 복사한다) 보던 확대로 되돌린다
    labels?.arrange(1);
    saveDiagramPng({
      world,
      title: title.textContent,
      routes: routes.filter((route) => route.stations.length >= 2),
      fileName: `railmap-diagram-${getRegion().id}-${year}-${String(month).padStart(2, '0')}.png`,
    }).catch((error) => {
      saveButton.textContent = '저장 실패';
      saveButton.title = `그림을 만들지 못했어요: ${error.message}`;
    });
    labels?.arrange(view.scale);
  });

  // 노선도 모양 [서울풍][벡풍][비녤리풍] (diagramSkins.js). 고르면 다시 그린다
  let skinId = loadSkin();
  const skinButtons = Object.entries(SKINS).map(([id, skin]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hud-button diagram-skin';
    button.textContent = skin.label;
    button.title = skin.title;
    button.addEventListener('click', () => {
      skinId = id;
      saveSkin(id);
      draw();
    });
    return [id, button];
  });
  root.querySelector('.diagram-skins').append(...skinButtons.map(([, button]) => button));

  let drawnKey = null; // 마지막으로 그린 노선망 (같으면 다시 계산하지 않는다)
  let drawnSkin = null; // 마지막으로 그린 모양
  let layoutCache = { key: null, positions: null };
  // 끌기·확대 상태
  let view = { x: 0, y: 0, scale: 1 };
  let labels = null; // 역 이름 자리 (diagramLabels.js)
  let arrangedScale = null; // 이름 자리를 마지막으로 고른 확대 정도
  let arrangeFrame = null;
  const applyView = () => {
    world.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.scale})`);
    // 확대 정도가 바뀌면 다음 프레임에 이름 자리를 다시 고른다 (휠을 여러 번 굴려도 한 프레임에 한 번)
    if (!labels || arrangedScale === view.scale || arrangeFrame) return;
    arrangeFrame = requestAnimationFrame(() => {
      arrangeFrame = null;
      arrangedScale = view.scale;
      labels.arrange(view.scale);
    });
  };

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
    for (const [id, button] of skinButtons) {
      button.classList.toggle('active', id === skinId);
      button.setAttribute('aria-pressed', String(id === skinId));
    }
    const skin = SKINS[skinId];
    const key = networkKey(routes);
    if (key === drawnKey && drawnSkin === skinId) return;
    labels = null; // 새로 그리는 동안 예전 이름표를 다시 놓지 않게
    // 모양만 바꿨으면 보던 자리·확대는 그대로 (같은 곳을 모양만 바꿔 견줄 수 있게)
    if (key !== drawnKey) {
      view = { x: 0, y: 0, scale: 1 };
      applyView();
    }
    drawnKey = key;
    drawnSkin = skinId;
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
      const offsets = new Map(edge.routes.map((route, k) => [route.id, (k - (edge.routes.length - 1) / 2) * skin.gap]));
      edgeShape.set(edgeKey, { points: edgePoints(px(edge.a), px(edge.b)), offsets });
    }
    const lines = svgElement('g', {
      fill: 'none',
      'stroke-width': skin.lineWidth,
      'stroke-linejoin': skin.join,
      'stroke-linecap': skin.cap,
    });
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
      const spread = Math.max(0, ...touching.map((edge) => (edge.routes.length - 1) * skin.gap));
      const transfer = through.length >= 2;
      const terminal = through.some((route) => route.stations[0] === id || route.stations.at(-1) === id);
      const radius = Math.max(transfer ? skin.radius + 2 : skin.radius, spread / 2 + 4);
      return { id, x, y, radius, transfer, terminal, color: through[0].color, touching };
    });

    const stationLayer = svgElement('g');
    world.append(stationLayer);
    for (const mark of marks) {
      const { id, x, y, radius, transfer, color, touching } = mark;
      const station = findStation(id);
      const group = svgElement('g', { class: 'diagram-station', tabindex: 0, role: 'button' });
      group.setAttribute('aria-label', `${station.name} 지도에서 보기`);
      // 선이 이 역에서 나가는 방향들 (역 모양의 눈금 방향과 이름 자리에 쓴다)
      const outgoing = (mark.outgoing = touching.map((edge) => {
        const points = edgeShape.get(`${edge.a}|${edge.b}`).points;
        const [p, q] = edge.a === id ? [points[0], points[1]] : [points.at(-1), points.at(-2)];
        return Math.atan2(q[1] - p[1], q[0] - p[0]);
      }));
      group.append(stationMark(skinId, { x, y, radius, transfer, color, outgoing }));
      const label = svgElement('text', { class: 'diagram-label', stroke: cssColor('land') });
      label.textContent = station.name;
      group.append(label);
      stationLayer.append(group);
      mark.label = label;

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
    // 역 이름 자리: 지금 확대 정도에 맞춰 고르고, 확대할 때마다 다시 (applyView)
    labels = createDiagramLabels(root, marks, segments);
    arrangedScale = view.scale;
    labels.arrange(view.scale);
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
    // 두 손가락 중 하나를 떼면 남은 손가락으로 바로 이어서 끈다
    if (pointers.size === 1) {
      const [[x, y]] = [...pointers.values()];
      drag = { x: x - view.x, y: y - view.y };
    }
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
