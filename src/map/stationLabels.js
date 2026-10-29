// 역 이름 말풍선: 흰 말풍선 + 남색 테두리 + 노란 점 + 지시선.
// 이름 옆에는 "환승"·"종착" 표시, 그 역을 지나는 노선 번호 배지(노선 색 동그라미 + 흰 번호),
// 하루 이용객(예: "2.3만")을 작게 붙인다. 번호가 있어서 색이 비슷해도 노선을 구별할 수 있다.
// MapLibre Marker(지도 좌표에 붙어 다니는 HTML 조각)로 만들어서
// 확대·이동해도 역 위치에 붙어 있다.
// 말풍선은 역 둘레 여러 자리 중 출구 배지와 다른 말풍선을 덮지 않는 곳에 놓는다 (arrangeStationLabels).
// 어느 자리에 놓아도 다른 말풍선과 겹치면 그 말풍선은 숨긴다 (역이 빽빽한 곳). 중요한 역부터 자리를 잡는다:
// 고른 역 → 환승역·종착역 → 하루 이용객이 많은 역. 숨은 이름은 더 확대하면 나타난다.
// 멀리서 볼수록 말풍선을 줄인다 (config.js LABEL_NAME_ZOOM, LABEL_DETAIL_ZOOM, showForZoom).
import { Marker } from 'maplibre-gl';
import {
  EXIT_DOT_ZOOM,
  EXIT_LABEL_ZOOM,
  LABEL_NAME_ZOOM,
  LABEL_DETAIL_ZOOM,
  PLATFORM_REAL_SIZE_ZOOM,
} from '../config.js';
import { formatPeopleShort } from '../ui/format.js';
import { inkOn } from './ink.js';

// 역 id → { element, marker, line, bubble, placeKey, name, tag, dots, routesKey, riders, riderCount, coordKey,
//          important: 환승역·종착역인지, selected: 고른 역인지, mode: 지금 보이는 모양, far: 노란 점을 숨겼는지,
//          crowded: 자리가 없어 말풍선을 숨겼는지 }
const labels = new Map();
// 줌을 바꿀 때마다 말풍선 모양을 맞추도록 지도에 한 번만 등록한다
const watchedMaps = new WeakSet();

// 말풍선 자리 후보: 역에서 지시선을 length(px)만큼 angle(도, 0 = 오른쪽, 시계 방향) 쪽으로 긋고
// 그 끝에 말풍선을 붙인다. 앞쪽일수록 먼저 고른다 (기본은 오른쪽 위)
const PLACES = [
  { length: 26, angle: -40 }, // 오른쪽 위
  { length: 26, angle: -140 }, // 왼쪽 위
  { length: 26, angle: 40 }, // 오른쪽 아래
  { length: 26, angle: 140 }, // 왼쪽 아래
  { length: 30, angle: 0 }, // 오른쪽
  { length: 30, angle: 180 }, // 왼쪽
  { length: 60, angle: -40 }, // 더 멀리 오른쪽 위
  { length: 60, angle: -140 }, // 더 멀리 왼쪽 위
  { length: 60, angle: 40 }, // 더 멀리 오른쪽 아래
  { length: 60, angle: 140 }, // 더 멀리 왼쪽 아래
];
// 말풍선이 지시선 끝을 얼마나 덮는지 (px). 선과 말풍선이 붙어 보이게
const OVERLAP = 3;

// 상태의 역 목록에 맞춰 말풍선을 추가·수정·삭제한다
// stationRoutes = Map(역 id → 그 역을 지나는 노선 [{ color, number }])
// riders = Map(역 id → 하루 이용객)
// shapes = Map(역 id → { tag: '환승' | '종착' | '' }) (ui/stationShapes.js)
// selectedId = 고른 역 id (없으면 null). 고른 역은 줌과 상관없이 말풍선을 전부 보여준다
export function updateStationLabels(map, stations, stationRoutes, riders, shapes, selectedId) {
  if (!watchedMaps.has(map)) {
    watchedMaps.add(map);
    map.on('zoom', () => showForZoom(map));
  }
  const aliveIds = new Set();

  for (const station of stations) {
    aliveIds.add(station.id);
    let label = labels.get(station.id);
    if (!label) {
      label = createLabel(map, station.coord);
      labels.set(station.id, label);
    }
    // 역을 옮겼으면 말풍선도 새 자리로
    const coordKey = station.coord.join(',');
    if (label.coordKey !== coordKey) {
      label.marker.setLngLat(station.coord);
      label.coordKey = coordKey;
    }
    if (label.name.textContent !== station.name) {
      label.name.textContent = station.name;
    }
    const tag = shapes.get(station.id)?.tag ?? '';
    if (label.tag.textContent !== tag) label.tag.textContent = tag;
    label.important = tag !== '';
    label.selected = station.id === selectedId;
    // 지나는 노선이 바뀌었을 때만 배지를 다시 만든다
    const routes = stationRoutes.get(station.id) ?? [];
    const routesKey = routes.map((route) => `${route.number}${route.color}`).join(',');
    if (label.routesKey !== routesKey) {
      label.routesKey = routesKey;
      label.dots.replaceChildren(
        ...routes.map((route) => {
          const badge = document.createElement('span');
          badge.className = 'station-label-route';
          badge.style.background = route.color;
          badge.style.color = inkOn(route.color);
          badge.textContent = route.number;
          return badge;
        }),
      );
    }
    // 하루 이용객: 노선이 지나지 않아 0이면 비운다
    const count = riders.get(station.id) ?? 0;
    label.riderCount = count;
    const ridersText = count > 0 ? formatPeopleShort(count) : '';
    if (label.riders.textContent !== ridersText) label.riders.textContent = ridersText;
  }

  for (const [id, label] of labels) {
    if (!aliveIds.has(id)) {
      label.marker.remove();
      labels.delete(id);
    }
  }
  showForZoom(map);
}

// 줌에 맞춰 말풍선을 줄인다: 'dot'(말풍선 없음) · 'brief'(이름과 노선 번호) · 'full'(이용객 숫자까지)
// 역이 동그라미·캡슐로 보이는 줌(PLATFORM_REAL_SIZE_ZOOM 아래)에서는 역 가운데 노란 점도 숨긴다
// (점이 작은 동그라미를 덮고, 노랑은 "고른 역" 표시와도 겹쳐서). 지시선은 역 가운데에서 그대로 나간다
// 줌을 바꾸는 동안 매 프레임 불리므로, 모양이 바뀐 말풍선만 고친다
function showForZoom(map) {
  const zoom = map.getZoom();
  const far = zoom < PLATFORM_REAL_SIZE_ZOOM;
  for (const label of labels.values()) {
    if (label.far !== far) {
      label.far = far;
      label.element.classList.toggle('station-label-far', far);
    }
    let mode = 'full';
    if (!label.selected && zoom < LABEL_DETAIL_ZOOM) mode = 'brief';
    if (!label.selected && !label.important && zoom < LABEL_NAME_ZOOM) mode = 'dot';
    if (label.mode === mode) continue;
    label.mode = mode;
    label.element.classList.toggle('station-label-dot-only', mode === 'dot');
    label.element.classList.toggle('station-label-brief', mode === 'brief');
  }
}

// 말풍선 자리를 다시 고른다: 출구 배지와 먼저 놓인 다른 말풍선을 되도록 덮지 않고, 화면 밖으로 나가지 않는 곳으로.
// 어느 자리든 먼저 놓인 말풍선과 겹치면 숨긴다 (고른 역은 언제나 보인다)
// exitCoords: 지도에 보이는 출구 자리들 [[경도, 위도], …]
// area: 말풍선이 보이는 지도 화면 { right, bottom } (px, 패널이 덮은 곳을 뺀 것). 없으면 지도 전체
// 지도를 움직이거나 출구가 바뀔 때마다 부른다. 화면 밖 역은 건너뛴다
export function arrangeStationLabels(map, exitCoords, area = null) {
  const zoom = map.getZoom();
  // 출구가 보이는 크기 (px): 줌 16부터 번호 배지, 15부터 작은 점, 그보다 멀면 안 보인다
  const exitRadius = zoom >= EXIT_LABEL_ZOOM ? 11 : zoom >= EXIT_DOT_ZOOM ? 5 : 0;
  const exits = exitRadius > 0 ? exitCoords.map((coord) => map.project(coord)) : [];
  const { clientWidth, clientHeight } = map.getContainer();
  const right = area?.right ?? clientWidth;
  const bottom = area?.bottom ?? clientHeight;
  const placed = []; // 먼저 자리를 정한 말풍선들 (화면 네모)

  // 크기를 먼저 모두 읽고 나서 자리를 고쳐 쓴다 (읽기·쓰기를 번갈아 하면 브라우저가 말풍선마다 화면 배치를 다시 계산한다)
  const visible = [];
  for (const label of labels.values()) {
    // 노란 점만 보이는 역은 자리를 차지하지 않는다
    if (label.mode === 'dot') continue;
    const at = map.project(label.marker.getLngLat());
    if (at.x < -200 || at.y < -200 || at.x > clientWidth + 200 || at.y > clientHeight + 200) continue;
    visible.push({ label, at, width: label.bubble.offsetWidth, height: label.bubble.offsetHeight });
  }
  // 중요한 역부터 자리를 잡는다: 고른 역 → 환승역·종착역 → 하루 이용객이 많은 역
  visible.sort(
    (a, b) =>
      b.label.selected - a.label.selected ||
      b.label.important - a.label.important ||
      b.label.riderCount - a.label.riderCount,
  );

  for (const { label, at, width, height } of visible) {
    let best = 0;
    let bestScore = Infinity;
    let bestCrowd = 0;
    PLACES.forEach((place, order) => {
      const box = shift(bubbleBox(place, width, height), at);
      // 화면 가장자리·패널 밑으로 들어가는 자리도 출구 하나를 덮는 것만큼 나쁘게 친다 (이름이 잘리거나 가려지지 않게)
      const offScreen = box.left < 0 || box.top < 0 || box.right > right || box.bottom > bottom;
      const crowd = placed.filter((other) => boxesOverlap(box, other)).length;
      const covered = exits.filter((exit) => boxNearPoint(box, exit, exitRadius)).length + (offScreen ? 1 : 0);
      // 다른 말풍선과 겹치는 자리는 가장 나쁘다
      const score = crowd * 10000 + covered * 100 + order;
      if (score < bestScore) {
        bestScore = score;
        best = order;
        bestCrowd = crowd;
      }
    });
    // 어느 자리든 다른 말풍선과 겹치면 숨긴다 (고른 역은 빼고). 숨긴 말풍선은 자리를 차지하지 않는다
    const crowded = bestCrowd > 0 && !label.selected;
    if (label.crowded !== crowded) {
      label.crowded = crowded;
      label.element.classList.toggle('station-label-crowded', crowded);
    }
    if (crowded) continue;
    placed.push(shift(bubbleBox(PLACES[best], width, height), at));
    // 자리나 말풍선 크기가 바뀌었을 때만 고친다
    const placeKey = `${best},${width},${height}`;
    if (label.placeKey !== placeKey) {
      label.placeKey = placeKey;
      const place = PLACES[best];
      const box = bubbleBox(place, width, height);
      label.line.style.width = `${place.length}px`;
      label.line.style.transform = `rotate(${place.angle}deg)`;
      label.bubble.style.left = `${box.left}px`;
      label.bubble.style.top = `${box.top}px`;
      label.bubble.style.bottom = 'auto';
    }
  }
}

// 역(0, 0)을 기준으로 한 말풍선 네모 { left, top, right, bottom } (px)
// 지시선 끝이 오른쪽이면 말풍선은 끝에서 오른쪽으로, 위면 위로 펴진다. 가로·세로로 곧으면 가운데를 맞춘다
function bubbleBox({ length, angle }, width, height) {
  const radians = (angle * Math.PI) / 180;
  const endX = Math.cos(radians) * length;
  const endY = Math.sin(radians) * length;
  let left = endX - width / 2;
  if (Math.cos(radians) > 0.3) left = endX - OVERLAP;
  if (Math.cos(radians) < -0.3) left = endX + OVERLAP - width;
  let top = endY - height / 2;
  if (Math.sin(radians) > 0.3) top = endY - OVERLAP;
  if (Math.sin(radians) < -0.3) top = endY + OVERLAP - height;
  return { left, top, right: left + width, bottom: top + height };
}

// 네모를 화면의 역 자리만큼 옮긴다
const shift = (box, at) => ({
  left: box.left + at.x,
  top: box.top + at.y,
  right: box.right + at.x,
  bottom: box.bottom + at.y,
});

const boxNearPoint = (box, point, radius) =>
  point.x > box.left - radius &&
  point.x < box.right + radius &&
  point.y > box.top - radius &&
  point.y < box.bottom + radius;

const boxesOverlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

function createLabel(map, coord) {
  const element = document.createElement('div');
  element.className = 'station-label';

  const dot = document.createElement('div');
  dot.className = 'station-label-dot';
  const line = document.createElement('div');
  line.className = 'station-label-line';
  const bubble = document.createElement('div');
  bubble.className = 'station-label-bubble';
  const name = document.createElement('span');
  const tag = document.createElement('span');
  tag.className = 'station-label-tag';
  const dots = document.createElement('span');
  dots.className = 'station-label-routes';
  const ridersCount = document.createElement('span');
  ridersCount.className = 'station-label-riders';
  bubble.append(name, tag, dots, ridersCount);

  element.append(line, dot, bubble);

  const marker = new Marker({ element, anchor: 'center' }).setLngLat(coord).addTo(map);
  return {
    element,
    marker,
    line,
    bubble,
    placeKey: '',
    name,
    tag,
    dots,
    routesKey: '',
    riders: ridersCount,
    riderCount: 0,
    coordKey: coord.join(','),
    important: false,
    selected: false,
    mode: 'full',
    far: false,
    crowded: false,
  };
}
