// 노선망이 자란 모습 다시 보기(ui/timelapse.js)가 그리는 레이어: 그 장면의 선로와 역.
// 노선이 다니는 선로는 그 노선 색으로(먼저 만든 노선의 색), 노선이 없는 선로는 게임 선로 색, 계획 선로는 주황 점선.
// 역은 승강장 색 동그라미 + 남색 테두리. 보는 동안 게임 레이어는 숨긴다 (map/gameLayers.js의 gameLayerIds)
import { shapeCoords } from '../game/trackShape.js';

const TRACK_SOURCE = 'timelapse-tracks';
const STATION_SOURCE = 'timelapse-stations';
const LAYERS = ['timelapse-casing', 'timelapse-track', 'timelapse-planned', 'timelapse-station'];

const COLORS = {
  casing: '#D8C9AA', // 선로 테두리 (게임 선로와 같은 색)
  rail: '#3E4651', // 노선이 없는 선로 (게임 선로 몸통)
  planned: '#C9772F', // 계획 선로 (공사 중 주황)
  platform: '#A7BED4', // 역 (승강장 색)
  navy: '#1F3A55', // 역 테두리
};

// 줌에 따라 굵어지는 선 굵기 (멀리서는 가늘게)
const zoomWidth = (far, near) => ['interpolate', ['linear'], ['zoom'], 10, far, 15, near];

export function addTimelapseLayers(map) {
  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(TRACK_SOURCE, { type: 'geojson', data: empty });
  map.addSource(STATION_SOURCE, { type: 'geojson', data: empty });
  const built = ['!', ['get', 'planned']];
  map.addLayer({
    id: 'timelapse-casing',
    type: 'line',
    source: TRACK_SOURCE,
    filter: built,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': COLORS.casing, 'line-width': zoomWidth(4, 11) },
  });
  map.addLayer({
    id: 'timelapse-track',
    type: 'line',
    source: TRACK_SOURCE,
    filter: built,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    // 노선이 없는 선로(color 없음)는 게임 선로 몸통 색 (관제실 모드에서는 map/theme.js가 밝은 회색으로 바꾼다)
    paint: { 'line-color': ['coalesce', ['get', 'color'], COLORS.rail], 'line-width': zoomWidth(2.5, 7) },
  });
  map.addLayer({
    id: 'timelapse-planned',
    type: 'line',
    source: TRACK_SOURCE,
    filter: ['get', 'planned'],
    paint: { 'line-color': COLORS.planned, 'line-width': zoomWidth(1.5, 4), 'line-dasharray': [2, 1.5] },
  });
  map.addLayer({
    id: 'timelapse-station',
    type: 'circle',
    source: STATION_SOURCE,
    paint: {
      'circle-color': COLORS.platform,
      'circle-radius': zoomWidth(2.5, 7),
      'circle-stroke-color': COLORS.navy,
      'circle-stroke-width': zoomWidth(1, 2),
    },
  });
}

export function removeTimelapseLayers(map) {
  for (const id of LAYERS) if (map.getLayer(id)) map.removeLayer(id);
  for (const id of [TRACK_SOURCE, STATION_SOURCE]) if (map.getSource(id)) map.removeSource(id);
}

// 장면 하나를 그린다 (frame: game/buildLog.js의 buildLogFrames 한 칸)
export function showTimelapseFrame(map, frame) {
  const coordOf = new Map([...frame.stations.values()].map(([id, lng, lat]) => [id, [lng, lat]]));
  // 이웃한 두 역 사이("역|역") → 그 사이를 다니는 노선 중 먼저 만든 노선의 색
  const colorOf = new Map();
  for (const [, color, stations] of frame.routes.values()) {
    for (let i = 0; i + 1 < stations.length; i++) {
      const key = [stations[i], stations[i + 1]].sort().join('|');
      if (!colorOf.has(key)) colorOf.set(key, color);
    }
  }
  const tracks = [];
  for (const [, from, to, steps, flags] of frame.tracks.values()) {
    if (!coordOf.has(from) || !coordOf.has(to)) continue;
    const waypoints = [];
    for (let i = 0; i + 1 < steps.length; i += 2) waypoints.push([steps[i], steps[i + 1]]);
    const coords = shapeCoords([coordOf.get(from), ...waypoints, coordOf.get(to)], (flags & 1) === 1);
    tracks.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: { color: colorOf.get([from, to].sort().join('|')) ?? null, planned: (flags & 2) === 2 },
    });
  }
  const stations = [...coordOf.values()].map((coordinates) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
  }));
  map.getSource(TRACK_SOURCE).setData({ type: 'FeatureCollection', features: tracks });
  map.getSource(STATION_SOURCE).setData({ type: 'FeatureCollection', features: stations });
}
