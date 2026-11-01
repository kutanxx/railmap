// 실제 노선망 겹쳐 보기 레이어 (왼쪽 아래 [실제 노선], ui/realOverlay.js): 그 도시의 실제 지하철을 내 선로 밑에 회색으로.
// 플레이어가 지은 것이 아니라서 색 없이 회색 한 가지로만 칠한다 (역은 흰 점 + 회색 테두리). 바탕 지도의 길·기존 철도(#A69C8B)와
// 섞이지 않게 그보다 짙은 회갈색(작은 지명 글자 색쯤)으로 조금 굵게.
// 선로 레이어보다 먼저 올려 내 선로가 위에 보인다 (map/gameLayers.js). 관제실 모드 색은 map/theme.js
import { zoomWidth } from './trackLayers.js';

const LINE_SOURCE = 'real-lines';
const STATION_SOURCE = 'real-stations';
const EMPTY = { type: 'FeatureCollection', features: [] };
// 짙은 회갈색 (바탕 지도의 기존 철도 #A69C8B보다 짙게)
const GRAY = '#857B6B';

export function addRealLayers(map) {
  map.addSource(LINE_SOURCE, { type: 'geojson', data: EMPTY });
  map.addSource(STATION_SOURCE, { type: 'geojson', data: EMPTY });
  map.addLayer({
    id: 'real-line',
    type: 'line',
    source: LINE_SOURCE,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': GRAY, 'line-width': zoomWidth(2.2, 4.5, 10) },
  });
  map.addLayer({
    id: 'real-station',
    type: 'circle',
    source: STATION_SOURCE,
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': zoomWidth(1.5, 3.5, 7),
      'circle-stroke-color': GRAY,
      'circle-stroke-width': zoomWidth(1, 1.5, 2.5),
    },
  });
}

// network: 실제 노선망 (게임 저장의 network 모양: 역·선로), 없으면 지운다
export function showReal(map, network = null) {
  const coordOf = new Map((network?.stations ?? []).map((station) => [station.id, station.coord]));
  map.getSource(LINE_SOURCE)?.setData({
    type: 'FeatureCollection',
    features: (network?.tracks ?? [])
      .filter((track) => coordOf.has(track.from) && coordOf.has(track.to))
      .map((track) => ({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [coordOf.get(track.from), ...track.waypoints, coordOf.get(track.to)] },
        properties: {},
      })),
  });
  map.getSource(STATION_SOURCE)?.setData({
    type: 'FeatureCollection',
    features: [...coordOf.values()].map((coordinates) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: {},
    })),
  });
}
