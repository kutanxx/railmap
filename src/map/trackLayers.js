// 선로와 그리는 중인 선로 미리보기를 지도 레이어로 그린다.
// 화면은 상태를 읽어서 그리기만 한다.
import { hitPad } from './hitPad.js';

const TRACK_SOURCE = 'tracks';
// 터널 구간 (땅 높이가 있는 가상 지도만): 선로 몸통 위에 땅 색 점선을 그어 속이 빈 점선처럼 보이게 한다
const TUNNEL_SOURCE = 'track-tunnels';
const TRACK_SELECTED_LAYER = 'track-selected';
const TRACK_CASING_LAYER = 'track-casing';
const TRACK_BODY_LAYER = 'track-body';
const TRACK_CENTER_LAYER = 'track-center';
const TRACK_PLANNED_LAYER = 'track-planned';
// 지은 선로만 (계획 선로는 몸통·가운데 줄 대신 주황 점선으로 그린다)
const BUILT = ['!', ['get', 'planned']];

const TRACK_COLORS = {
  casing: '#D8C9AA', // 테두리
  body: '#3E4651', // 몸통
  center: '#D8C9AA', // 가운데 줄
  selected: '#F2C230', // 선택 표시
  removing: '#B0402F', // 지우면 사라질 것 (경고 말풍선과 같은 빨강)
  planned: '#C9772F', // 계획 선로 (아트 규칙의 "공사 중" 주황 점선, 그리는 중인 선로와 같은 색)
};

// 혼잡도 보기를 켰을 때 선로 가운데 줄 색 (노선 패널의 혼잡도 글자색과 같은 뜻)
// 색만으로 나누지 않고 굵기로도 나눈다: 여유는 가늘게, 붐빔은 중간, 넘침은 선로를 거의 채우게 굵게 + "128%" 글자.
// 여유는 밝은 초록이라, 빨강·초록을 잘 구별하지 못해도 밝기로 넘침(진한 빨강)과 구별된다
export const LOAD_COLORS = {
  ok: '#A9CBA0', // 여유
  busy: '#D9A031', // 붐빔 (CROWDED_WARNING 이상)
  over: '#B0402F', // 넘침 (100% 넘음)
};

// 줌에 따라 선 굵기를 바꾼다 (줌 → px). 지수 보간이라 확대할수록 빠르게 굵어진다
// 열차 레이어에서도 같이 쓴다
export const zoomWidth = (z10, z14, z18) => [
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
// 가운데 줄: 노선이 지나는 선로는 노선 색으로 조금 더 굵게, 아니면 베이지로 얇게.
// 혼잡도 보기를 켜면 혼잡도 단계(load: 'ok' | 'busy' | 'over')마다 굵기가 다르다
const HAS_ROUTE = ['!=', ['get', 'routeColor'], null];
const LOAD = ['get', 'load'];
// 가운데 줄 굵기: 혼잡도 보기 단계 → 광역급행이 지나는 선로(노선 색으로 더 굵게) → 노선이 지나는 선로 → 아무 노선도 없음
const centerWidth = ({ express, route, none, ok, busy, over }) => [
  'case',
  ['==', LOAD, 'over'],
  over,
  ['==', LOAD, 'busy'],
  busy,
  ['==', LOAD, 'ok'],
  ok,
  ['all', HAS_ROUTE, ['get', 'express']],
  express,
  HAS_ROUTE,
  route,
  none,
];
const TRACK_CENTER_WIDTH = zoomWidth(
  centerWidth({ express: 2, route: 1.2, none: 0.5, ok: 0.8, busy: 1.4, over: 1.9 }),
  centerWidth({ express: 4, route: 2.5, none: 1, ok: 1.5, busy: 3, over: 4.6 }),
  centerWidth({ express: 9.5, route: 6, none: 2.5, ok: 3.5, busy: 7.5, over: 12.5 }),
);
const TRACK_CENTER_COLOR = ['coalesce', ['get', 'routeColor'], TRACK_COLORS.center];

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
    filter: BUILT,
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.body, 'line-width': TRACK_BODY_WIDTH },
  });
  map.addSource(TUNNEL_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({
    id: 'track-tunnel',
    type: 'line',
    source: TUNNEL_SOURCE,
    paint: {
      'line-color': '#EFE7D6',
      'line-width': zoomWidth(1.2, 3.5, 10),
      'line-dasharray': [1.5, 1.5],
    },
  });
  map.addLayer({
    id: TRACK_CENTER_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    filter: BUILT,
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_CENTER_COLOR, 'line-width': TRACK_CENTER_WIDTH },
  });
  // 계획 선로: 옅은 테두리 위에 주황 점선 (누르면 고를 수 있게 테두리는 지은 선로와 같이 깐다)
  map.addLayer({
    id: TRACK_PLANNED_LAYER,
    type: 'line',
    source: TRACK_SOURCE,
    filter: ['get', 'planned'],
    paint: {
      'line-color': TRACK_COLORS.planned,
      'line-width': zoomWidth(1.5, 3.5, 9),
      'line-dasharray': [2, 1.5],
    },
  });
  // 혼잡도 보기에서 넘친 구간 가운데에 혼잡도 숫자 ("128%"). 굵은 빨간 줄 위에 흰 글자 + 빨간 테두리라
  // 선로 위에 빨간 이름표처럼 보인다 (말풍선에 가리지 않게 선 위에 바로 쓴다)
  map.addLayer({
    id: 'track-load-label',
    type: 'symbol',
    source: TRACK_SOURCE,
    filter: ['==', LOAD, 'over'],
    layout: {
      'symbol-placement': 'line-center',
      'text-field': ['get', 'loadLabel'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 13,
    },
    paint: {
      'text-color': '#FFFFFF',
      'text-halo-color': LOAD_COLORS.over,
      'text-halo-width': 3,
    },
  });
  // 지우기 미리보기: 함께 지워질 선로는 빨간 몸통, 사라질 노선이 지나는 선로는 빨간 점선
  map.addLayer({
    id: 'track-removing-gone',
    type: 'line',
    source: TRACK_SOURCE,
    filter: ['==', ['get', 'removing'], 'gone'],
    layout: ROUND_LINE,
    paint: { 'line-color': TRACK_COLORS.removing, 'line-width': TRACK_BODY_WIDTH },
  });
  map.addLayer({
    id: 'track-removing-route',
    type: 'line',
    source: TRACK_SOURCE,
    filter: ['==', ['get', 'removing'], 'route'],
    paint: {
      'line-color': TRACK_COLORS.removing,
      'line-width': zoomWidth(1.5, 3, 7),
      'line-dasharray': [2, 1.5],
    },
  });
}

// 선로 전체를 다시 그린다
// lines = [{ id, coords: [[경도, 위도], …], routeColor: 노선 색 또는 null,
//            load: 혼잡도 보기의 단계 'ok' | 'busy' | 'over' 또는 null, loadLabel: 넘친 구간에 쓸 글자 ("128%"),
//            removing: 지우기 미리보기 'gone'(선로가 사라짐) | 'route'(지나는 노선이 사라짐) | null,
//            planned: 계획 선로인지, express: 광역급행 노선이 지나는지 (가운데 줄을 더 굵게),
//            tunnels: 터널 구간들 [[[경도, 위도], …], …] (없으면 빈 목록) }]
// selectedIds = 노란색으로 강조할 선로 id들 (Set)
export function updateTracks(map, lines, selectedIds) {
  map.getSource(TRACK_SOURCE).setData({
    type: 'FeatureCollection',
    features: lines.map((line) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: line.coords },
      properties: {
        id: line.id,
        routeColor: line.routeColor,
        load: line.load ?? null,
        loadLabel: line.loadLabel ?? '',
        selected: selectedIds.has(line.id),
        removing: line.removing ?? null,
        planned: Boolean(line.planned),
        express: Boolean(line.express),
      },
    })),
  });
  map.getSource(TUNNEL_SOURCE).setData({
    type: 'FeatureCollection',
    features: lines
      .filter((line) => line.tunnels?.length)
      .map((line) => ({
        type: 'Feature',
        geometry: { type: 'MultiLineString', coordinates: line.tunnels },
        properties: { id: line.id },
      })),
  });
}

// 화면의 한 점(px) 근처에 있는 선로의 id를 돌려준다. 없으면 null
export function trackIdAt(map, point) {
  const pad = hitPad(4);
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

// ── 선로 손잡이 (고른 선로의 경유점을 끌어서 옮기기) ─────────
// 진짜 경유점: 흰 원 + 남색 테두리. 두 점 사이 가운데: 작은 원 (끌면 경유점이 새로 생긴다)

const HANDLE_SOURCE = 'track-handles';
const HANDLE_LAYER = 'track-handles';

// 손잡이는 맨 마지막에 추가해서 역·열차보다 위에 보이게 한다
export function addHandleLayers(map) {
  map.addSource(HANDLE_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: HANDLE_LAYER,
    type: 'circle',
    source: HANDLE_SOURCE,
    paint: {
      'circle-radius': ['case', ['==', ['get', 'kind'], 'waypoint'], 6, 4],
      'circle-color': '#FFFFFF',
      'circle-stroke-color': ['case', ['==', ['get', 'kind'], 'waypoint'], '#1F3A55', '#9A8F7B'],
      'circle-stroke-width': 2,
    },
  });
}

// handles = [{ coord, kind: 'waypoint' | 'midpoint', index }]
export function updateHandles(map, handles) {
  map.getSource(HANDLE_SOURCE).setData({
    type: 'FeatureCollection',
    features: handles.map(({ coord, kind, index }) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coord },
      properties: { kind, index },
    })),
  });
}

// 화면의 한 점(px) 근처의 손잡이 { kind, index }. 없으면 null
export function handleAt(map, point) {
  const pad = hitPad(6);
  const features = map.queryRenderedFeatures(
    [
      [point.x - pad, point.y - pad],
      [point.x + pad, point.y + pad],
    ],
    { layers: [HANDLE_LAYER] },
  );
  if (features.length === 0) return null;
  // 진짜 경유점과 가운데 손잡이가 겹치면 진짜 경유점을 먼저 잡는다
  const best = features.find((f) => f.properties.kind === 'waypoint') ?? features[0];
  return { kind: best.properties.kind, index: best.properties.index };
}
