// 플레이어가 만든 것(역 등)을 지도 레이어로 그린다.
// 화면은 상태를 읽어서 그리기만 한다.
import { destination } from '@turf/turf';
import {
  PLATFORM_LENGTH_M,
  PLATFORM_WIDTH_M,
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
const SELECTED_LAYER = 'station-platform-selected';

const ICON_IMAGE = 'station-icon';
const ICON_SELECTED_IMAGE = 'station-icon-selected';

const COLORS = {
  platform: '#A7BED4', // 승강장
  border: '#1F3A55', // 테두리 (남색)
  selected: '#F2C230', // 선택 표시 (노란색)
};

// 멀리서 보이는 그림의 크기 배율 (줌 → 배율). 줌 14에서 1이면 실제 크기 사각형과 같은 크기
const ICON_SIZE = ['interpolate', ['linear'], ['zoom'], 10, 0.4, PLATFORM_REAL_SIZE_ZOOM, 1];
// 사각형 테두리 굵기 (줌 → px)
const OUTLINE_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 1.5, 18, 3];
const SELECTED_WIDTH = ['interpolate', ['linear'], ['zoom'], 14, 7, 18, 12];

export function addStationLayers(map) {
  map.addImage(ICON_IMAGE, drawIcon(false), { pixelRatio: 2 });
  map.addImage(ICON_SELECTED_IMAGE, drawIcon(true), { pixelRatio: 2 });

  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(POINT_SOURCE, { type: 'geojson', data: empty });
  map.addSource(PLATFORM_SOURCE, { type: 'geojson', data: empty });

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
}

// 역 목록 전체를 한 번에 다시 그린다
export function updateStations(map, stations, selectedId) {
  const points = [];
  const platforms = [];
  for (const station of stations) {
    const properties = {
      id: station.id,
      angle: station.angle,
      selected: station.id === selectedId,
    };
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: station.coord },
      properties,
    });
    platforms.push({
      type: 'Feature',
      geometry: platformPolygon(station.coord, station.angle),
      properties,
    });
  }
  map.getSource(POINT_SOURCE).setData({ type: 'FeatureCollection', features: points });
  map.getSource(PLATFORM_SOURCE).setData({ type: 'FeatureCollection', features: platforms });
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

// 역 중심에서 실제 크기(미터) 사각형의 네 꼭짓점을 계산한다.
// angle 0 = 가로(동서), 90 = 세로(남북). 시계 방향으로 돈다
function platformPolygon(center, angle) {
  const along = 90 + angle; // 긴 쪽 방향 (북쪽 0°, 시계 방향 나침반 각도)
  const across = along + 90; // 짧은 쪽 방향
  const halfLength = PLATFORM_LENGTH_M / 2000; // km
  const halfWidth = PLATFORM_WIDTH_M / 2000; // km

  const corner = (lengthSign, widthSign) => {
    const end = destination(center, halfLength * lengthSign, along);
    return destination(end, halfWidth * widthSign, across).geometry.coordinates;
  };
  const ring = [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)];
  ring.push(ring[0]);
  return { type: 'Polygon', coordinates: [ring] };
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

// ── 선로 ─────────────────────────────
// 운행 선로는 세 겹으로 그린다: 베이지 테두리 → 진한 몸통 → 가운데 얇은 줄

const TRACK_SOURCE = 'tracks';
const TRACK_SELECTED_LAYER = 'track-selected';
const TRACK_CASING_LAYER = 'track-casing';
const TRACK_BODY_LAYER = 'track-body';
const TRACK_CENTER_LAYER = 'track-center';

const TRACK_COLORS = {
  casing: '#D8C9AA', // 테두리
  body: '#3E4651', // 몸통
  center: '#D8C9AA', // 가운데 줄
  selected: '#F2C230', // 선택 표시
};

// 줌에 따라 선로 굵기를 바꾼다 (줌 → px). 지수 보간이라 확대할수록 빠르게 굵어진다
const zoomWidth = (z10, z14, z18) => [
  'interpolate',
  ['exponential', 1.5],
  ['zoom'],
  10,
  z10,
  14,
  z14,
  18,
  z18,
];
const TRACK_SELECTED_WIDTH = zoomWidth(7, 13, 26);
const TRACK_CASING_WIDTH = zoomWidth(3.5, 8, 20);
const TRACK_BODY_WIDTH = zoomWidth(2, 5.5, 15);
const TRACK_CENTER_WIDTH = zoomWidth(0.5, 1, 2.5);

const ROUND_LINE = { 'line-join': 'round', 'line-cap': 'round' };

// 선로 레이어는 역보다 먼저 추가해야 역 밑에 깔린다
export function addTrackLayers(map) {
  map.addSource(TRACK_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: TRACK_SELECTED_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    filter: ['get', 'selected'],
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.selected, 'line-width': TRACK_SELECTED_WIDTH },
  });
  map.addLayer({
    id: TRACK_CASING_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.casing, 'line-width': TRACK_CASING_WIDTH },
  });
  map.addLayer({
    id: TRACK_BODY_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.body, 'line-width': TRACK_BODY_WIDTH },
  });
  map.addLayer({
    id: TRACK_CENTER_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.center, 'line-width': TRACK_CENTER_WIDTH },
  });
}

// 선로 전체를 다시 그린다. lines = [{ id, coords: [[경도, 위도], …] }]
export function updateTracks(map, lines, selectedId) {
  map.getSource(TRACK_SOURCE).setData({
    type: 'FeatureCollection',
    features: lines.map((line) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: line.coords },
      properties: { id: line.id, selected: line.id === selectedId },
    })),
  });
}

// 화면의 한 점(px) 근처에 있는 선로의 id를 돌려준다. 없으면 null
export function trackIdAt(map, point) {
  const pad = 4;
  const features = map.queryRenderedFeatures(
    [
      [point.x - pad, point.y - pad],
      [point.x + pad, point.y + pad],
    ],
    { layers: [TRACK_CASING_LAYER] },
  );
  return features.length > 0 ? features[0].properties.id : null;
}

// ── 그리는 중인 선로 미리보기 ─────────────
// 공사 중 색(#C9772F) 점선으로 그리고, 경유점은 작은 점으로 보여준다

const DRAFT_SOURCE = 'track-draft';
const DRAFT_LINE_LAYER = 'track-draft-line';
const DRAFT_POINT_LAYER = 'track-draft-points';
const DRAFT_COLOR = '#C9772F';

// 미리보기는 역보다 나중에 추가해서 맨 위에 보이게 한다
export function addDraftLayers(map) {
  map.addSource(DRAFT_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: DRAFT_LINE_LAYER,
    type: 'line',
    source: DRAFT_SOURCE,
    filter: ['==', ['geometry-type'], 'LineString'],
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': DRAFT_COLOR,
      'line-width': 3,
      'line-dasharray': [2, 1.5],
    },
  });
  map.addLayer({
    id: DRAFT_POINT_LAYER,
    type: 'circle',
    source: DRAFT_SOURCE,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 4,
      'circle-color': DRAFT_COLOR,
      'circle-stroke-color': '#EFE7D6',
      'circle-stroke-width': 1.5,
    },
  });
}

// draft = { coords: [출발역, 경유점…], waypoints: [경유점…], cursor: [경도, 위도] | null }
// null이면 미리보기를 지운다
export function updateDraft(map, draft) {
  const features = [];
  if (draft) {
    const coords = draft.cursor ? [...draft.coords, draft.cursor] : draft.coords;
    if (coords.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      });
    }
    for (const point of draft.waypoints) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: point },
        properties: {},
      });
    }
  }
  map.getSource(DRAFT_SOURCE).setData({ type: 'FeatureCollection', features });
}
