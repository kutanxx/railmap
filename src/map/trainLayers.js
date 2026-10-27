// 열차를 지도 레이어로 그린다.
import { TRAIN_LABEL_MIN_ZOOM } from '../config.js';
import { zoomWidth } from './trackLayers.js';

// 모든 열차를 GeoJSON source 하나에 담고, 매 프레임 setData로 한 번에 바꾼다.
// 열차 하나 = 노선을 따라 휘는 짧은 선. 끝이 둥근 선 세 겹(노란 테두리, 남색 몸통, 노선 색 띠)이라
// 캡슐처럼 보이고, 가운데 띠 색으로 어느 노선 열차인지 알 수 있다

const TRAIN_SOURCE = 'trains';
const TRAIN_CAPSULE = { 'line-join': 'round', 'line-cap': 'round' };

// 역보다 나중에 추가해서 승강장 위로 지나가게 보인다
export function addTrainLayers(map) {
  map.addSource(TRAIN_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: 'train-border',
    type: 'line',
    source: TRAIN_SOURCE,
    layout: TRAIN_CAPSULE,
    paint: { 'line-color': '#F2C230', 'line-width': zoomWidth(5, 10, 22) },
  });
  map.addLayer({
    id: 'train-body',
    type: 'line',
    source: TRAIN_SOURCE,
    layout: TRAIN_CAPSULE,
    paint: { 'line-color': '#1F3A55', 'line-width': zoomWidth(3, 6.5, 15) },
  });
  map.addLayer({
    id: 'train-stripe',
    type: 'line',
    source: TRAIN_SOURCE,
    layout: TRAIN_CAPSULE,
    paint: { 'line-color': ['get', 'routeColor'], 'line-width': zoomWidth(1, 2.5, 6) },
  });
  // 가까이 보면 열차 위에 번호표: 열차 id "r3-1"에서 앞의 r을 뺀 "3-1", 노선 색 바탕에 흰 글자
  // 같은 source를 쓰므로 열차 위치를 한 번에 갱신하는 규칙은 그대로다
  map.addLayer({
    id: 'train-label',
    type: 'symbol',
    source: TRAIN_SOURCE,
    minzoom: TRAIN_LABEL_MIN_ZOOM,
    layout: {
      'symbol-placement': 'line-center',
      'text-field': ['slice', ['get', 'id'], 1],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-offset': [0, -1.4],
      'text-rotation-alignment': 'viewport',
    },
    paint: {
      'text-color': '#FFFFFF',
      'text-halo-color': ['get', 'routeColor'],
      'text-halo-width': 3,
    },
  });
}

export function updateTrains(map, features) {
  map.getSource(TRAIN_SOURCE).setData({ type: 'FeatureCollection', features });
}
