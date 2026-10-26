// 역 이름 말풍선: 흰 말풍선 + 남색 테두리 + 노란 점 + 지시선.
// 이름 옆에는 그 역을 지나는 노선 색 점과 하루 이용객(예: "2.3만")을 작게 붙인다.
// MapLibre Marker(지도 좌표에 붙어 다니는 HTML 조각)로 만들어서
// 확대·이동해도 역 위치에 붙어 있다.
import { Marker } from 'maplibre-gl';
import { formatPeopleShort } from '../ui/format.js';

// 역 id → { marker, name, dots, colorsKey, riders, coordKey }
const labels = new Map();

// 상태의 역 목록에 맞춰 말풍선을 추가·수정·삭제한다
// routeColors = Map(역 id → 그 역을 지나는 노선 색 배열)
// riders = Map(역 id → 하루 이용객)
export function updateStationLabels(map, stations, routeColors, riders) {
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
    // 노선 색이 바뀌었을 때만 점을 다시 만든다
    const colors = routeColors.get(station.id) ?? [];
    const colorsKey = colors.join(',');
    if (label.colorsKey !== colorsKey) {
      label.colorsKey = colorsKey;
      label.dots.replaceChildren(
        ...colors.map((color) => {
          const dot = document.createElement('span');
          dot.className = 'station-label-route';
          dot.style.background = color;
          return dot;
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
  const dots = document.createElement('span');
  dots.className = 'station-label-routes';
  const ridersCount = document.createElement('span');
  ridersCount.className = 'station-label-riders';
  bubble.append(name, dots, ridersCount);

  element.append(line, dot, bubble);

  const marker = new Marker({ element, anchor: 'center' }).setLngLat(coord).addTo(map);
  return { marker, name, dots, colorsKey: '', riders: ridersCount, coordKey: coord.join(',') };
}
