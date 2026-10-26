// 지도 위 말풍선 알림. 화면 구석 팝업 대신 일이 일어난 자리에 몇 초 동안 띄운다.
// 예: "1호선 개통", "자금이 12억 모자라요"
import { Marker } from 'maplibre-gl';
import { CALLOUT_SECONDS } from '../config.js';

// tone: 'info' (남색 테두리) 또는 'bad' (붉은 테두리, 안 되는 이유를 알릴 때)
export function showCallout(map, coord, text, tone = 'info') {
  const element = document.createElement('div');
  element.className = `callout callout-${tone}`;
  const bubble = document.createElement('div');
  bubble.className = 'callout-bubble';
  bubble.textContent = text;
  element.append(bubble);

  const marker = new Marker({ element, anchor: 'bottom', offset: [0, -14] })
    .setLngLat(coord)
    .addTo(map);
  setTimeout(() => marker.remove(), CALLOUT_SECONDS * 1000);
}
