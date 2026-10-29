// 고속철도역(처음부터 있는 고정 역, game/intercity.js)을 지도에 그린다.
// 플레이어가 지은 것이 아니므로 색 없이 기존 철도 회색으로: 흰 동그라미 + 회색 테두리, 이름 아래 작게 종류 ("고속철도" 또는 "공항").
// 이어진 지하철역이 있으면 둘 사이를 남색 점선(갈아타는 통로)으로 잇는다. 플레이어가 역을 지어 생긴 것이라 출구 통로처럼 남색.
const POINT_SOURCE = 'intercity';
const LINK_SOURCE = 'intercity-links';

const COLORS = {
  rail: '#A69C8B', // 기존 철도 색
  fill: '#FBF7EE', // 도로 색 (바탕보다 밝게)
  text: '#6F6656', // 지명 글자 색
  halo: '#EFE7D6', // 땅 색
  link: '#1F3A55', // 갈아타는 통로 (남색, 출구 통로와 같은 색)
};
// 동그라미 반지름 (px): 큰 역 / 중간 역
const RADIUS = { large: 7, medium: 5.5 };
// 이보다 멀리 보면 그리지 않는다 (도시 전체를 볼 때 붐비지 않게). 이름은 조금 더 가까이서부터
const MIN_ZOOM = 10;
const LABEL_MIN_ZOOM = 12;

export function addIntercityLayers(map) {
  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource(POINT_SOURCE, { type: 'geojson', data: empty });
  map.addSource(LINK_SOURCE, { type: 'geojson', data: empty });
  map.addLayer({
    id: 'intercity-links',
    type: 'line',
    source: LINK_SOURCE,
    minzoom: MIN_ZOOM,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': COLORS.link, 'line-width': 3, 'line-dasharray': [1, 1.2] },
  });
  map.addLayer({
    id: 'intercity-circles',
    type: 'circle',
    source: POINT_SOURCE,
    minzoom: MIN_ZOOM,
    paint: {
      'circle-radius': ['match', ['get', 'size'], 'large', RADIUS.large, RADIUS.medium],
      'circle-color': COLORS.fill,
      'circle-stroke-color': COLORS.rail,
      'circle-stroke-width': 3,
    },
  });
  map.addLayer({
    id: 'intercity-labels',
    type: 'symbol',
    source: POINT_SOURCE,
    minzoom: LABEL_MIN_ZOOM,
    layout: {
      'text-field': ['format', ['get', 'name'], {}, ['concat', '\n', ['get', 'label']], { 'font-scale': 0.8 }],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-anchor': 'top',
      'text-offset': [0, 0.9],
      'text-allow-overlap': true,
    },
    paint: { 'text-color': COLORS.text, 'text-halo-color': COLORS.halo, 'text-halo-width': 1.5 },
  });
}

// hubs: 지금 지도의 고속철도역들 [{ name, coord, size, label }]
// links: 이어진 것들 [{ hub, coord: 이어진 지하철역 자리 }]
export function updateIntercity(map, hubs, links) {
  map.getSource(POINT_SOURCE).setData({
    type: 'FeatureCollection',
    features: hubs.map((hub) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: hub.coord },
      properties: { name: hub.name, size: hub.size, label: hub.label },
    })),
  });
  map.getSource(LINK_SOURCE).setData({
    type: 'FeatureCollection',
    features: links.map(({ hub, coord }) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [hub.coord, coord] },
      properties: {},
    })),
  });
}
