// 역 이름 말풍선: 흰 말풍선 + 남색 테두리 + 노란 점 + 지시선.
// 이름 옆에는 "환승"·"종착" 표시, 그 역을 지나는 노선 번호 배지(노선 색 동그라미 + 흰 번호),
// 하루 이용객(예: "2.3만")을 작게 붙인다. 번호가 있어서 색이 비슷해도 노선을 구별할 수 있다.
// MapLibre Marker(지도 좌표에 붙어 다니는 HTML 조각)로 만들어서
// 확대·이동해도 역 위치에 붙어 있다.
// 말풍선은 역 둘레 여러 자리 중 출구 배지와 다른 말풍선을 덮지 않는 곳에 놓는다 (arrangeStationLabels).
import { Marker } from 'maplibre-gl';
import { EXIT_DOT_ZOOM, EXIT_LABEL_ZOOM } from '../config.js';
import { formatPeopleShort } from '../ui/format.js';

// 역 id → { marker, line, bubble, placeKey, name, tag, dots, routesKey, riders, coordKey }
const labels = new Map();

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
export function updateStationLabels(map, stations, stationRoutes, riders, shapes) {
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
          badge.textContent = route.number;
          return badge;
        }),
      );
    }
    // 하루 이용객: 노선이 지나지 않아 0이면 비운다
    const count = riders.get(station.id) ?? 0;
    const ridersText = count > 0 ? formatPeopleShort(count) : '';
    if (label.riders.textContent !== ridersText) label.riders.textContent = ridersText;
  }

  for (const [id, label] of labels) {
    if (!aliveIds.has(id)) {
      label.marker.remove();
      labels.delete(id);
    }
  }
}

// 말풍선 자리를 다시 고른다: 출구 배지와 먼저 놓인 다른 말풍선을 되도록 덮지 않는 곳으로
// exitCoords: 지도에 보이는 출구 자리들 [[경도, 위도], …]
// 지도를 움직이거나 출구가 바뀔 때마다 부른다. 화면 밖 역은 건너뛴다
export function arrangeStationLabels(map, exitCoords) {
  const zoom = map.getZoom();
  // 출구가 보이는 크기 (px): 줌 16부터 번호 배지, 15부터 작은 점, 그보다 멀면 안 보인다
  const exitRadius = zoom >= EXIT_LABEL_ZOOM ? 11 : zoom >= EXIT_DOT_ZOOM ? 5 : 0;
  const exits = exitRadius > 0 ? exitCoords.map((coord) => map.project(coord)) : [];
  const { clientWidth, clientHeight } = map.getContainer();
  const placed = []; // 먼저 자리를 정한 말풍선들 (화면 네모)

  for (const label of labels.values()) {
    const at = map.project(label.marker.getLngLat());
    if (at.x < -200 || at.y < -200 || at.x > clientWidth + 200 || at.y > clientHeight + 200) continue;
    const width = label.bubble.offsetWidth;
    const height = label.bubble.offsetHeight;
    let best = 0;
    let bestScore = Infinity;
    PLACES.forEach((place, order) => {
      const box = shift(bubbleBox(place, width, height), at);
      const covered =
        exits.filter((exit) => boxNearPoint(box, exit, exitRadius)).length +
        placed.filter((other) => boxesOverlap(box, other)).length;
      const score = covered * 100 + order;
      if (score < bestScore) {
        bestScore = score;
        best = order;
      }
    });
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
    marker,
    line,
    bubble,
    placeKey: '',
    name,
    tag,
    dots,
    routesKey: '',
    riders: ridersCount,
    coordKey: coord.join(','),
  };
}
