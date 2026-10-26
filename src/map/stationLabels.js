// 역 이름 말풍선: 흰 말풍선 + 남색 테두리 + 노란 점 + 지시선.
// MapLibre Marker(지도 좌표에 붙어 다니는 HTML 조각)로 만들어서
// 확대·이동해도 역 위치에 붙어 있다.
import { Marker } from 'maplibre-gl';

// 역 id → { marker, bubble }
const labels = new Map();

// 상태의 역 목록에 맞춰 말풍선을 추가·수정·삭제한다
export function updateStationLabels(map, stations) {
  const aliveIds = new Set();

  for (const station of stations) {
    aliveIds.add(station.id);
    let label = labels.get(station.id);
    if (!label) {
      label = createLabel(map, station.coord);
      labels.set(station.id, label);
    }
    if (label.bubble.textContent !== station.name) {
      label.bubble.textContent = station.name;
    }
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

  element.append(line, dot, bubble);

  const marker = new Marker({ element, anchor: 'center' }).setLngLat(coord).addTo(map);
  return { marker, bubble };
}
