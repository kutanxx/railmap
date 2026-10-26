// 역(승강장)을 지도 레이어로 그린다.
// 화면은 상태를 읽어서 그리기만 한다.
import { circle, destination } from '@turf/turf';
import {
  POPULATION_RADIUS_M,
  PLATFORM_LENGTH_M,
  PLATFORM_WIDTH_M,
  TRANSFER_PLATFORM_WIDTH_RATIO,
  PLATFORM_REAL_SIZE_ZOOM,
  START_CENTER,
} from '../config.js';

// 역은 두 가지로 그린다
// - 가까이 (PLATFORM_REAL_SIZE_ZOOM 이상): 실제 크기 사각형. 확대하면 건물처럼 커진다
// - 멀리: 작은 승강장 그림. 실제 크기로 그리면 너무 작아서 안 보이기 때문
const POINT_SOURCE = 'station-points';
const PLATFORM_SOURCE = 'station-platforms';
const ICON_LAYER = 'station-icons';
const FILL_LAYER = 'station-platform-fill';
const OUTLINE_LAYER = 'station-platform-outline';
const CENTERLINE_SOURCE = 'station-centerlines';
const CENTERLINE_LAYER = 'station-platform-centerline';
const SELECTED_LAYER = 'station-platform-selected';

const ICON_IMAGE = 'station-icon';
const ICON_SELECTED_IMAGE = 'station-icon-selected';

const COLORS = {
  platform: '#A7BED4', // 승강장
  border: '#1F3A55', // 테두리 (남색)
  selected: '#F2C230', // 선택 표시 (노란색)
};

// 멀리서 보이는 그림의 크기 배율 (줌 → 배율). 줌 14에서 1이면 실제 크기 사각형과 같은 크기
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
// 승강장 가운데 흰 점선 굵기 (줌 → px)
const CENTERLINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 1, 18, 2.5];
// 사각형 테두리 굵기 (줌 → px)
const OUTLINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 1.5, 18, 3];
const SELECTED_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 7, 18, 12];

export function addStationLayers(map) {
  map.addImage(ICON_IMAGE, drawIcon(false), { pixelRatio: 2 });
  map.addImage(ICON_SELECTED_IMAGE, drawIcon(true), { pixelRatio: 2 });

  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(POINT_SOURCE, { type: 'geojson', data: empty });
  map.addSource(PLATFORM_SOURCE, { type: 'geojson', data: empty });
  map.addSource(CENTERLINE_SOURCE, { type: 'geojson', data: empty });

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

  // ── 가까이: 실제 크기 사각형 ──
  // 선택한 역의 노란 테두리 (사각형 밑에 두껍게 깔아서 바깥쪽만 보이게)
  map.addLayer({
    id: SELECTED_LAYER,
    type: 'line',
    source: PLATFORM_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    filter: ['get', 'selected'],
    paint: { 'line-color': COLORS.selected, 'line-width': SELECTED_WIDTH },
  });
  map.addLayer({
    id: FILL_LAYER,
    type: 'fill',
    source: PLATFORM_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    paint: { 'fill-color': COLORS.platform },
  });
  map.addLayer({
    id: OUTLINE_LAYER,
    type: 'line',
    source: PLATFORM_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    paint: { 'line-color': COLORS.border, 'line-width': OUTLINE_WIDTH },
  });
  // 승강장 가운데 흰 점선 (환승역은 두 줄: 승강장 두 개)
  map.addLayer({
    id: CENTERLINE_LAYER,
    type: 'line',
    source: CENTERLINE_SOURCE,
    minzoom: PLATFORM_REAL_SIZE_ZOOM,
    paint: {
      'line-color': '#FFFFFF',
      'line-width': CENTERLINE_WIDTH,
      'line-dasharray': [2, 2],
    },
  });
}

// 역 목록 전체를 한 번에 다시 그린다
// shapes = Map(역 id → { angle: 승강장 방향, transfer: 환승역인지 }) (ui/stationShapes.js)
export function updateStations(map, stations, selectedId, shapes) {
  const points = [];
  const platforms = [];
  const centerlines = [];
  for (const station of stations) {
    const { angle, transfer } = shapes.get(station.id) ?? { angle: station.angle, transfer: false };
    const width = PLATFORM_WIDTH_M * (transfer ? TRANSFER_PLATFORM_WIDTH_RATIO : 1);
    const properties = {
      id: station.id,
      angle,
      transfer,
      selected: station.id === selectedId,
    };
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: station.coord },
      properties,
    });
    platforms.push({
      type: 'Feature',
      geometry: platformPolygon(station.coord, angle, width),
      properties,
    });
    centerlines.push({
      type: 'Feature',
      geometry: platformCenterlines(station.coord, angle, width, transfer ? 2 : 1),
      properties: { id: station.id },
    });
  }
  map.getSource(POINT_SOURCE).setData({ type: 'FeatureCollection', features: points });
  map.getSource(PLATFORM_SOURCE).setData({ type: 'FeatureCollection', features: platforms });
  map.getSource(CENTERLINE_SOURCE).setData({ type: 'FeatureCollection', features: centerlines });
}

// 화면의 한 점(px) 근처에 있는 역의 id를 돌려준다. 없으면 null
export function stationIdAt(map, point) {
  const pad = 4; // 클릭을 조금 빗나가도 잡히게 하는 여유 (px)
  const features = map.queryRenderedFeatures(
    [
      [point.x - pad, point.y - pad],
      [point.x + pad, point.y + pad],
    ],
    { layers: [ICON_LAYER, FILL_LAYER] },
  );
  return features.length > 0 ? features[0].properties.id : null;
}

// 승강장 안의 한 점: 역 중심에서 긴 쪽으로 lengthM, 짧은 쪽으로 widthM 미터 간 자리
// angle 0 = 가로(동서), 90 = 세로(남북). 시계 방향으로 돈다
function platformPoint(center, angle, lengthM, widthM) {
  const along = 90 + angle; // 긴 쪽 방향 (북쪽 0°, 시계 방향 나침반 각도)
  const across = along + 90; // 짧은 쪽 방향
  const end = destination(center, lengthM / 1000, along);
  return destination(end, widthM / 1000, across).geometry.coordinates;
}

// 역 중심에서 실제 크기(미터) 사각형의 네 꼭짓점을 계산한다. width: 승강장 폭(미터)
function platformPolygon(center, angle, width) {
  const halfLength = PLATFORM_LENGTH_M / 2;
  const halfWidth = width / 2;
  const corner = (lengthSign, widthSign) =>
    platformPoint(center, angle, halfLength * lengthSign, halfWidth * widthSign);
  const ring = [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)];
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
}

// 승강장 가운데 점선: count개를 폭에 고르게 놓는다 (보통 1줄, 환승역 2줄). 양 끝은 조금 안쪽까지만
function platformCenterlines(center, angle, width, count) {
  const halfLength = (PLATFORM_LENGTH_M / 2) * 0.85;
  const lines = [];
  for (let i = 0; i < count; i++) {
    const offset = width * ((i + 0.5) / count - 0.5);
    lines.push([
      platformPoint(center, angle, -halfLength, offset),
      platformPoint(center, angle, halfLength, offset),
    ]);
  }
  return { type: 'MultiLineString', coordinates: lines };
}

// 멀리서 보일 승강장 그림. 줌 14에서 실제 크기 사각형과 같은 px 크기로 만든다
function drawIcon(selected) {
  // 줌 14에서 1px이 몇 미터인지 (MapLibre는 512px 타일을 쓴다)
  const latitude = (START_CENTER[1] * Math.PI) / 180;
  const metersPerPixel =
    (40075016.686 * Math.cos(latitude)) / (512 * 2 ** PLATFORM_REAL_SIZE_ZOOM);
  const scale = 2; // 선명하게 2배로 그린다
  const ring = selected ? 3 : 0; // 노란 선택 테두리 (px)
  const border = 1.5; // 남색 테두리 (px)
  const width = PLATFORM_LENGTH_M / metersPerPixel;
  const height = PLATFORM_WIDTH_M / metersPerPixel;

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
