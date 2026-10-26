// 역(승강장)을 지도 레이어로 그린다.
// 화면은 상태를 읽어서 그리기만 한다.
import { circle } from '@turf/turf';
import {
  POPULATION_RADIUS_M,
  PLATFORM_LENGTH_M,
  CONCOURSE_WIDTH_M,
  PLATFORM_REAL_SIZE_ZOOM,
  START_CENTER,
} from '../config.js';

// 역은 두 가지로 그린다
// - 가까이 (PLATFORM_REAL_SIZE_ZOOM 이상): 실제 크기의 승강장 띠 + 대합실 (ui/stationBands.js가 모양을 정한다)
// - 멀리: 작은 승강장 그림. 실제 크기로 그리면 너무 작아서 안 보이기 때문
const POINT_SOURCE = 'station-points';
const BAND_SOURCE = 'station-bands';
const ICON_LAYER = 'station-icons';
const SELECTED_LAYER = 'station-band-selected';
const CASING_LAYER = 'station-band-casing';
const FILL_LAYER = 'station-band-fill';
const CENTERLINE_LAYER = 'station-band-centerline';

const ICON_IMAGE = 'station-icon';
const ICON_SELECTED_IMAGE = 'station-icon-selected';

const COLORS = {
  platform: '#A7BED4', // 승강장
  border: '#1F3A55', // 테두리 (남색)
  selected: '#F2C230', // 선택 표시 (노란색)
};

// 멀리서 보이는 그림의 크기 배율 (줌 → 배율). 줌 14에서 1이면 실제 크기 띠와 비슷한 크기
// 환승역은 조금 크게 그린다
const IS_TRANSFER = ['get', 'transfer'];
const ICON_SIZE = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  ['case', IS_TRANSFER, 0.55, 0.4],
  PLATFORM_REAL_SIZE_ZOOM,
  ['case', IS_TRANSFER, 1.35, 1],
];

// 줌 0에서 1px이 몇 미터인지 (MapLibre는 512px 타일을 쓴다). 서울 위도로 한 번만 계산한다
const METERS_PER_PIXEL_Z0 = (40075016.686 * Math.cos((START_CENTER[1] * Math.PI) / 180)) / 512;
// 띠의 테두리 굵기 (줌 → px): 줌 14에서 1.5, 18부터 3
export const outlinePx = (zoom) => Math.min(3, 1.5 + (zoom - PLATFORM_REAL_SIZE_ZOOM) * 0.375);
// 실제 폭(미터, 지물 속성 width)을 화면 굵기(px)로 바꾸는 식. extraPx(줌)만큼 더 굵게 (통로도 같이 쓴다)
// 한 줌 확대할 때마다 미터당 px이 두 배가 되므로 2의 지수로 보간한다
export const metersWide = (extraPx) => [
  'interpolate',
  ['exponential', 2],
  ['zoom'],
  ...[14, 16, 18, 20, 22].flatMap((zoom) => [
    zoom,
    ['+', ['*', ['get', 'width'], 2 ** zoom / METERS_PER_PIXEL_Z0], extraPx(zoom)],
  ]),
];
const FILL_WIDTH = metersWide(() => 0);
const CASING_WIDTH = metersWide((zoom) => outlinePx(zoom) * 2);
const SELECTED_WIDTH = metersWide((zoom) => outlinePx(zoom) * 2 + 8);
// 승강장 가운데 흰 점선 굵기 (줌 → px)
const CENTERLINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 1, 18, 2.5];
const BAND_LAYOUT = { 'line-join': 'round', 'line-cap': 'butt' };

export function addStationLayers(map) {
  map.addImage(ICON_IMAGE, drawIcon(false), { pixelRatio: 2 });
  map.addImage(ICON_SELECTED_IMAGE, drawIcon(true), { pixelRatio: 2 });

  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(POINT_SOURCE, { type: 'geojson', data: empty });
  map.addSource(BAND_SOURCE, { type: 'geojson', data: empty });

  // ── 멀리서: 작은 그림 ──
  map.addLayer({
    id: ICON_LAYER,
    type: 'symbol',
    source: POINT_SOURCE,
    maxzoom: PLATFORM_REAL_SIZE_ZOOM,
    layout: {
      'icon-image': ['case', ['get', 'selected'], ICON_SELECTED_IMAGE, ICON_IMAGE],
      'icon-size': ICON_SIZE,
      'icon-rotate': ['get', 'angle'],
      // 지도를 돌려도 승강장이 땅에 붙어 같이 돈다
      'icon-rotation-alignment': 'map',
      // 지도 글자에 가려지거나 서로 겹친다고 숨지 않게 한다
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });

  // ── 가까이: 승강장 띠 + 대합실 ──
  // 띠와 대합실은 모두 "실제 폭을 가진 선"이다. 모든 조각의 테두리(남색)를 먼저 깔고 그 위에 채움을 칠해서,
  // 겹친 조각들이 테두리 하나로 이어진 한 덩어리처럼 보이게 한다
  // 선택한 역의 노란 테두리 (가장 밑에 더 굵게 깔아서 바깥쪽만 보이게)
  map.addLayer({
    id: SELECTED_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: ['get', 'selected'],
    layout: BAND_LAYOUT,
    paint: { 'line-color': COLORS.selected, 'line-width': SELECTED_WIDTH },
  });
  map.addLayer({
    id: CASING_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    layout: BAND_LAYOUT,
    paint: { 'line-color': COLORS.border, 'line-width': CASING_WIDTH },
  });
  map.addLayer({
    id: FILL_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    layout: BAND_LAYOUT,
    paint: { 'line-color': COLORS.platform, 'line-width': FILL_WIDTH },
  });
  // 승강장 가운데 흰 점선 (나란한 승강장은 띠마다 한 줄)
  map.addLayer({
    id: CENTERLINE_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: ['==', ['get', 'kind'], 'platform'],
    paint: {
      'line-color': '#FFFFFF',
      'line-width': CENTERLINE_WIDTH,
      'line-dasharray': [2, 2],
    },
  });
}

// 역 목록 전체를 한 번에 다시 그린다
// shapes = Map(역 id → { angle: 승강장 방향, transfer: 환승역인지 }) (ui/stationShapes.js)
// bands = Map(역 id → { parts: [{ kind, coords, width }] }) (ui/stationBands.js)
export function updateStations(map, stations, selectedId, shapes, bands) {
  const points = [];
  const pieces = [];
  for (const station of stations) {
    const { angle, transfer } = shapes.get(station.id) ?? { angle: station.angle, transfer: false };
    const selected = station.id === selectedId;
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: station.coord },
      properties: { id: station.id, angle, transfer, selected },
    });
    for (const { kind, coords, width } of bands.get(station.id)?.parts ?? []) {
      pieces.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { id: station.id, kind, width, selected },
      });
    }
  }
  map.getSource(POINT_SOURCE).setData({ type: 'FeatureCollection', features: points });
  map.getSource(BAND_SOURCE).setData({ type: 'FeatureCollection', features: pieces });
}

// 화면의 한 점(px) 근처에 있는 역의 id를 돌려준다. 없으면 null
export function stationIdAt(map, point) {
  const pad = 4; // 클릭을 조금 빗나가도 잡히게 하는 여유 (px)
  const features = map.queryRenderedFeatures(
    [
      [point.x - pad, point.y - pad],
      [point.x + pad, point.y + pad],
    ],
    { layers: [ICON_LAYER, CASING_LAYER] },
  );
  return features.length > 0 ? features[0].properties.id : null;
}

// 멀리서 보일 승강장 그림. 줌 14에서 실제 크기 띠(길이)·대합실(폭)과 비슷한 px 크기로 만든다
function drawIcon(selected) {
  const metersPerPixel = METERS_PER_PIXEL_Z0 / 2 ** PLATFORM_REAL_SIZE_ZOOM;
  const scale = 2; // 선명하게 2배로 그린다
  const ring = selected ? 3 : 0; // 노란 선택 테두리 (px)
  const border = 1.5; // 남색 테두리 (px)
  const width = PLATFORM_LENGTH_M / metersPerPixel;
  const height = CONCOURSE_WIDTH_M / metersPerPixel;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round((width + ring * 2) * scale);
  canvas.height = Math.round((height + ring * 2) * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  if (selected) {
    ctx.fillStyle = COLORS.selected;
    ctx.fillRect(0, 0, width + ring * 2, height + ring * 2);
  }
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(ring, ring, width, height);
  ctx.fillStyle = COLORS.platform;
  ctx.fillRect(ring + border, ring + border, width - border * 2, height - border * 2);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// ── 역세권 원 (반경 POPULATION_RADIUS_M) ────────────
// 역을 놓기 전 마우스 자리, 또는 고른 역 둘레에 점선 원을 그려서 인구를 세는 범위를 보여준다

const CATCHMENT_SOURCE = 'station-catchment';

export function addCatchmentLayer(map) {
  map.addSource(CATCHMENT_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: 'station-catchment',
    type: 'line',
    source: CATCHMENT_SOURCE,
    paint: { 'line-color': COLORS.border, 'line-width': 1.5, 'line-dasharray': [2, 2] },
  });
}

// center: [경도, 위도] 또는 null (원 지우기)
export function updateCatchment(map, center) {
  const features = center
    ? [circle(center, POPULATION_RADIUS_M / 1000, { steps: 64, units: 'kilometers' })]
    : [];
  map.getSource(CATCHMENT_SOURCE).setData({ type: 'FeatureCollection', features });
}
