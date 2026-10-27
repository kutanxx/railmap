// 역 출구를 지도 레이어로 그린다: 대합실에서 길가로 나가는 통로, 노란 출구 배지(번호·이름).
// 이름이 없는 출구(뉴욕식)는 가까이서도 노란 점만 그린다.
// 화면은 받은 출구를 그리기만 한다. 출구 자리는 map/exitFinder.js, 이름은 ui/exitNames.js가 정한다.
import { PASSAGE_WIDTH_M, EXIT_DOT_ZOOM, EXIT_LABEL_ZOOM } from '../config.js';
import { metersWide, outlinePx } from './stationLayers.js';

const PASSAGE_SOURCE = 'exit-passages';
const EXIT_SOURCE = 'exit-points';
const BADGE_IMAGE = 'exit-badge';

const COLORS = {
  passage: '#A7BED4', // 통로 (승강장과 같은 색)
  border: '#1F3A55', // 테두리·글자 (남색)
  badge: '#F2C230', // 출구 배지 (노란색)
};

// 통로는 역 레이어보다 먼저 추가해서 대합실 밑에서 나오는 것처럼 보이게 한다
export function addPassageLayers(map) {
  map.addSource(PASSAGE_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  const layout = { 'line-join': 'round', 'line-cap': 'round' };
  map.addLayer({
    id: 'exit-passage-casing',
    type: 'line',
    source: PASSAGE_SOURCE,
    minzoom: EXIT_LABEL_ZOOM,
    layout,
    paint: { 'line-color': COLORS.border, 'line-width': metersWide((zoom) => outlinePx(zoom) * 2) },
  });
  map.addLayer({
    id: 'exit-passage-fill',
    type: 'line',
    source: PASSAGE_SOURCE,
    minzoom: EXIT_LABEL_ZOOM,
    layout,
    paint: { 'line-color': COLORS.passage, 'line-width': metersWide(() => 0) },
  });
}

// 출구 배지는 열차보다 나중에 추가해서 맨 위에 보이게 한다
export function addExitLayers(map) {
  // 배지 그림은 글자 길이에 맞춰 늘어난다 ("1"은 네모, "A12"·"Strand"는 알약). 모서리는 늘리지 않는다
  map.addImage(BADGE_IMAGE, drawBadge(), {
    pixelRatio: 2,
    stretchX: [[8, 28]],
    stretchY: [[8, 28]],
    content: [8, 8, 28, 28],
  });
  map.addSource(EXIT_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  // 중간 확대: 작은 노란 점
  map.addLayer({
    id: 'exit-dots',
    type: 'circle',
    source: EXIT_SOURCE,
    minzoom: EXIT_DOT_ZOOM,
    maxzoom: EXIT_LABEL_ZOOM,
    paint: {
      'circle-radius': 3.5,
      'circle-color': COLORS.badge,
      'circle-stroke-color': COLORS.border,
      'circle-stroke-width': 1.2,
    },
  });
  // 가까이, 이름 없는 출구: 조금 큰 노란 점
  map.addLayer({
    id: 'exit-dots-nameless',
    type: 'circle',
    source: EXIT_SOURCE,
    minzoom: EXIT_LABEL_ZOOM,
    filter: ['==', ['get', 'name'], ''],
    paint: {
      'circle-radius': 5,
      'circle-color': COLORS.badge,
      'circle-stroke-color': COLORS.border,
      'circle-stroke-width': 1.5,
    },
  });
  // 가까이: 노란 배지 + 번호·이름
  const always = { 'icon-allow-overlap': true, 'icon-ignore-placement': true };
  map.addLayer({
    id: 'exit-badges',
    type: 'symbol',
    source: EXIT_SOURCE,
    minzoom: EXIT_LABEL_ZOOM,
    filter: ['!=', ['get', 'name'], ''],
    layout: {
      ...always,
      'icon-image': BADGE_IMAGE,
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [3, 5, 3, 5],
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 11,
      'text-max-width': 30, // 긴 길 이름도 한 줄로 ("Northumberland Street")
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: { 'text-color': COLORS.border },
  });
  // 건물과 바로 이어진 출구에는 배지 아래에 "건물 연결"을 적는다
  map.addLayer({
    id: 'exit-building-labels',
    type: 'symbol',
    source: EXIT_SOURCE,
    minzoom: EXIT_LABEL_ZOOM,
    filter: ['get', 'building'],
    layout: {
      'text-field': '건물 연결',
      'text-font': ['Noto Sans Bold'],
      'text-size': 10,
      'text-offset': [0, 1.6],
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: { 'text-color': COLORS.border, 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 },
  });
}

// exits = [{ coord, passage: [[경도, 위도], [경도, 위도]], name, building }]
export function updateExits(map, exits) {
  map.getSource(PASSAGE_SOURCE).setData({
    type: 'FeatureCollection',
    features: exits.map((exit) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: exit.passage },
      properties: { width: PASSAGE_WIDTH_M },
    })),
  });
  map.getSource(EXIT_SOURCE).setData({
    type: 'FeatureCollection',
    features: exits.map((exit) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: exit.coord },
      properties: { name: exit.name, building: exit.building },
    })),
  });
}

// 출구 배지 그림: 노란 둥근 네모 + 남색 테두리 (18px)
function drawBadge() {
  const size = 18;
  const scale = 2; // 선명하게 2배로 그린다
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, 3);
  ctx.fillStyle = COLORS.badge;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = COLORS.border;
  ctx.stroke();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
