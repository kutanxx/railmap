// 개통 연출 레이어 (ui/lineSweep.js가 매 프레임 채운다): 그려지거나 거둬지는 중인 줄.
// 노선 줄(kind 'route')은 노선 색으로 선로 테두리보다 조금 굵게 (다 지은 선로의 가는 노선 색 줄과 구별되게),
// 없어진 선로(kind 'track')는 테두리 + 선로 몸통 색 (지우기 전 선로 모양 그대로).
// 선로 위·역 밑에 그린다 (map/gameLayers.js의 순서)
import { zoomWidth } from './trackLayers.js';

const SOURCE = 'line-sweep';
const EMPTY = { type: 'FeatureCollection', features: [] };
// 노선 줄 굵기, 선로 줄 굵기 (px, 선로 몸통은 map/trackLayers.js와 같다)
const byKind = (route, track) => ['case', ['==', ['get', 'kind'], 'route'], route, track];

export function addSweepLayers(map) {
  map.addSource(SOURCE, { type: 'geojson', data: EMPTY });
  map.addLayer({
    id: 'sweep-casing',
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'track'],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    // 선로 테두리와 같은 색·굵기 (관제실 모드에서는 map/theme.js가 바꾼다)
    paint: { 'line-color': '#D8C9AA', 'line-width': zoomWidth(3.5, 8, 20) },
  });
  map.addLayer({
    id: 'sweep-line',
    type: 'line',
    source: SOURCE,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    // 색은 줄마다 (노선 색, 또는 선로 몸통 색)
    paint: { 'line-color': ['get', 'color'], 'line-width': zoomWidth(byKind(5, 2), byKind(10, 5.5), byKind(24, 15)) },
  });
}

// lines: [{ coords: [[경도, 위도], …], color, kind }] — 지금 보일 만큼 자른 줄들
export function showSweep(map, lines) {
  map.getSource(SOURCE)?.setData({
    type: 'FeatureCollection',
    features: lines.map(({ coords, color, kind }) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { color, kind },
    })),
  });
}
