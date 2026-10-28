// 역(승강장)을 지도 레이어로 그린다.
// 화면은 상태를 읽어서 그리기만 한다.
import { circle } from '@turf/turf';
import {
  POPULATION_RADIUS_M,
  PLATFORM_REAL_SIZE_ZOOM,
  STATION_CAPSULE_MIN_ZOOM,
} from '../config.js';
import { getRegion } from '../game/region.js';
import { ensureCapsuleImage } from './stationIcons.js';
import { hitPad } from './hitPad.js';

// 역은 줌에 따라 다르게 그린다 (근거: reports/나라별 노선도 역 표기.md)
// - 가까이 (PLATFORM_REAL_SIZE_ZOOM 이상): 실제 크기의 승강장 띠 + 대합실 (ui/stationBands.js가 모양을 정한다)
// - 멀리, 일반역: 노선도처럼 동그라미 (승강장 색 + 남색 테두리)
// - 멀리, 환승역: 노선 색 원을 이어 붙인 캡슐 (서울 2023 "신호등 방식"·홍콩 MTR처럼, map/stationIcons.js)
//   크기가 아니라 모양으로 일반역과 갈라서, 어디서 어느 노선끼리 갈아타는지 멀리서도 보인다
// - 아주 멀리 (STATION_CAPSULE_MIN_ZOOM 아래), 환승역: 흰 원 + 굵은 남색 테두리 (캡슐이 이웃 역과 겹치지 않게)
const POINT_SOURCE = 'station-points';
const BAND_SOURCE = 'station-bands';
const CIRCLE_LAYER = 'station-circles';
const CIRCLE_SELECTED_LAYER = 'station-circle-selected';
const TRANSFER_CIRCLE_LAYER = 'station-transfer-circles';
const CAPSULE_LAYER = 'station-capsules';
const SELECTED_LAYER = 'station-band-selected';
const CASING_LAYER = 'station-band-casing';
const FILL_LAYER = 'station-band-fill';
const CENTERLINE_LAYER = 'station-band-centerline';


const COLORS = {
  platform: '#A7BED4', // 승강장
  border: '#1F3A55', // 테두리 (남색)
  selected: '#F2C230', // 선택 표시 (노란색)
};

// 캡슐로 그리는 환승역 (지나는 노선이 둘 이상): 점마다 캡슐 그림 이름이 붙어 있다
const IS_CAPSULE = ['has', 'capsule'];
// 멀리서 보이는 동그라미 반지름 (줌 → px). 아주 멀리서 환승역 흰 원은 조금 크게.
// extra: 모든 줌에서 더할 px (고른 역의 노란 테두리)
const circleRadius = (extra) => [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  ['case', IS_CAPSULE, 5 + extra, 3.5 + extra],
  13,
  6 + extra,
  PLATFORM_REAL_SIZE_ZOOM,
  8 + extra,
];
const CIRCLE_RADIUS = circleRadius(0);
// 동그라미 테두리 (줌 → px)
const CIRCLE_STROKE = ['interpolate', ['linear'], ['zoom'], 10, 1.5, 13, 2];
// 캡슐 그림 배율 (줌 → 배율). 그림은 줌 15 바로 아래 크기로 만든다
const CAPSULE_SIZE = ['interpolate', ['linear'], ['zoom'], STATION_CAPSULE_MIN_ZOOM, 0.55, 13, 0.75, PLATFORM_REAL_SIZE_ZOOM, 1];

// 줌 0에서 1px이 몇 미터인지 (MapLibre는 512px 타일을 쓴다). 북쪽 도시일수록 1px이 짧아지므로
// 지금 지도의 위도(처음 화면 가운데)로 계산한다. 서울 37.6°와 런던 51.5°는 20% 넘게 다르다
export const metersPerPixelZ0 = () => (40075016.686 * Math.cos((getRegion().center[1] * Math.PI) / 180)) / 512;
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
    ['+', ['*', ['get', 'width'], 2 ** zoom / metersPerPixelZ0()], extraPx(zoom)],
  ]),
];
// 지도를 고른 뒤(레이어를 올릴 때) 만들어야 그 지도의 위도가 들어간다
const fillWidth = () => metersWide(() => 0);
const casingWidth = () => metersWide((zoom) => outlinePx(zoom) * 2);
const selectedWidth = () => metersWide((zoom) => outlinePx(zoom) * 2 + 8);
// 승강장 가운데 흰 점선 굵기 (줌 → px)
const CENTERLINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 1, 18, 2.5];
const BAND_LAYOUT = { 'line-join': 'round', 'line-cap': 'butt' };

export function addStationLayers(map) {
  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(POINT_SOURCE, { type: 'geojson', data: empty });
  map.addSource(BAND_SOURCE, { type: 'geojson', data: empty });

  // ── 멀리서: 동그라미와 캡슐 ──
  // 고른 역은 밑에 더 큰 노란 동그라미를 깔아 노란 테두리처럼 보이게 한다
  // (캡슐 환승역은 줌 STATION_CAPSULE_MIN_ZOOM부터 노란 테두리가 있는 캡슐 그림을 따로 쓴다)
  map.addLayer({
    id: CIRCLE_SELECTED_LAYER,
    type: 'circle',
    source: POINT_SOURCE,
    maxzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: ['get', 'selected'],
    paint: {
      'circle-color': COLORS.selected,
      'circle-radius': circleRadius(5),
      // 캡슐로 바뀌는 줌부터는 환승역의 노란 동그라미를 감춘다
      'circle-opacity': ['step', ['zoom'], 1, STATION_CAPSULE_MIN_ZOOM, ['case', IS_CAPSULE, 0, 1]],
    },
  });
  // 일반역: 승강장 색 동그라미
  map.addLayer({
    id: CIRCLE_LAYER,
    type: 'circle',
    source: POINT_SOURCE,
    maxzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: ['!', IS_CAPSULE],
    paint: {
      'circle-color': COLORS.platform,
      'circle-radius': CIRCLE_RADIUS,
      'circle-stroke-color': COLORS.border,
      'circle-stroke-width': CIRCLE_STROKE,
    },
  });
  // 아주 멀리서 환승역: 흰 원 + 굵은 남색 테두리
  map.addLayer({
    id: TRANSFER_CIRCLE_LAYER,
    type: 'circle',
    source: POINT_SOURCE,
    maxzoom: STATION_CAPSULE_MIN_ZOOM,
    filter: IS_CAPSULE,
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': CIRCLE_RADIUS,
      'circle-stroke-color': COLORS.border,
      'circle-stroke-width': 2.5,
    },
  });
  // 환승역 캡슐: 노선들이 한 선로를 따라 나란히 가면 승강장과 직각으로 놓아서 확대하면 나란한 승강장 띠로 이어지고,
  // 노선들이 엇갈려 지나가면 (X자·십자 환승) 이름표처럼 가로로 눕힌다 (어느 한 선을 따라 비스듬히 놓이지 않게)
  map.addLayer({
    id: CAPSULE_LAYER,
    type: 'symbol',
    source: POINT_SOURCE,
    minzoom: STATION_CAPSULE_MIN_ZOOM,
    maxzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: IS_CAPSULE,
    layout: {
      'icon-image': ['case', ['get', 'selected'], ['get', 'capsuleSelected'], ['get', 'capsule']],
      'icon-size': CAPSULE_SIZE,
      'icon-rotate': ['get', 'capsuleAngle'],
      // 지도를 돌려도 캡슐이 땅에 붙어 같이 돈다
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
    paint: { 'line-color': COLORS.selected, 'line-width': selectedWidth() },
  });
  map.addLayer({
    id: CASING_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    layout: BAND_LAYOUT,
    paint: { 'line-color': COLORS.border, 'line-width': casingWidth() },
  });
  map.addLayer({
    id: FILL_LAYER,
    type: 'line',
    source: BAND_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    layout: BAND_LAYOUT,
    paint: { 'line-color': COLORS.platform, 'line-width': fillWidth() },
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
// stationRoutes = Map(역 id → 지나는 노선 [{ color, number }]) (ui/views.js routeColors)
export function updateStations(map, stations, selectedId, shapes, bands, stationRoutes) {
  const points = [];
  const pieces = [];
  for (const station of stations) {
    const { angle, aligned } = shapes.get(station.id) ?? { angle: station.angle, aligned: true };
    const selected = station.id === selectedId;
    const properties = { id: station.id, angle, selected };
    // 노선이 둘 이상 지나면 캡슐: 노선 번호 순서의 노선 색으로 그림을 (없으면 만들어) 고른다
    const routes = stationRoutes.get(station.id) ?? [];
    if (routes.length >= 2) {
      const colors = [...routes].sort((a, b) => a.number - b.number).map((route) => route.color);
      properties.capsule = ensureCapsuleImage(map, colors, false);
      properties.capsuleSelected = ensureCapsuleImage(map, colors, true);
      properties.capsuleAngle = aligned ? angle + 90 : 0;
    }
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: station.coord },
      properties,
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
  const pad = hitPad(4); // 클릭을 조금 빗나가도 잡히게 하는 여유 (px, 손가락이면 넓게)
  const features = map.queryRenderedFeatures(
    [
      [point.x - pad, point.y - pad],
      [point.x + pad, point.y + pad],
    ],
    { layers: [CIRCLE_LAYER, TRANSFER_CIRCLE_LAYER, CAPSULE_LAYER, CASING_LAYER] },
  );
  return features.length > 0 ? features[0].properties.id : null;
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
