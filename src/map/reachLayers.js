// 30분 지도 레이어: 고른 역에서 10·20·30분 안에 갈 수 있는 곳 (game/reach.js의 원들).
// 바탕 지도의 땅·공원·주거지 면 위, 도로·건물·글자 밑에 깔아서 땅만 물들고 길과 건물은 그대로 보이게 한다 (반투명 없이 단색).
// 바탕 지도에서는 물이 주거지 면보다 먼저(밑에) 그려지므로, 물 면을 한 번 더 위에 그려 강·바다가 묻히지 않게 한다.
// 짧은 시간일수록 진한 파랑. 긴 시간대를 먼저(밑에) 깔고 짧은 시간대를 위에 겹친다. 관제실 모드 색은 map/theme.js
import { REACH_BANDS, REACH_CIRCLE_POINTS } from '../config.js';
import { METERS_PER_DEGREE_LAT, metersPerDegreeLng } from '../game/earth.js';

// 시간대마다 칠할 색 (REACH_BANDS 순서: 10분, 20분, 30분). 역 카드 색 설명(styles/base.css의 --reach-…)과 같다
export const REACH_COLORS = ['#A3BDD6', '#BDCFDF', '#D5DFE4'];
const layerId = (index) => `reach-${index}`;
const sourceId = (index) => `reach-${index}`;
const EMPTY = { type: 'FeatureCollection', features: [] };

// 바탕 지도에서 이 레이어들을 끼울 자리: 선·건물·글자 중 가장 먼저 그리는 것 바로 밑 (땅·공원·주거지 면 위)
function firstCoverLayer(map) {
  const cover = (layer) =>
    layer.type === 'line' || layer.type === 'symbol' || (layer.type === 'fill' && layer.id.includes('building'));
  return map.getStyle().layers.find(cover)?.id;
}

export function addReachLayers(map) {
  const { layers } = map.getStyle();
  const before = firstCoverLayer(map);
  // 끼울 자리보다 밑에 있는 물 면들
  const waterFills = layers
    .slice(0, layers.findIndex((layer) => layer.id === before))
    .filter((layer) => layer.type === 'fill' && layer.id.includes('water'));
  // 긴 시간대(연한 색)부터 깐다
  for (let i = REACH_BANDS.length - 1; i >= 0; i--) {
    map.addSource(sourceId(i), { type: 'geojson', data: EMPTY });
    map.addLayer(
      { id: layerId(i), type: 'fill', source: sourceId(i), paint: { 'fill-color': REACH_COLORS[i] } },
      before,
    );
  }
  // 물 면을 같은 모양·색으로 한 번 더 (팔레트 표시도 그대로 옮겨서 관제실 모드 색도 바뀐다, map/theme.js)
  for (const layer of waterFills) map.addLayer({ ...layer, id: `reach-cover-${layer.id}` }, before);
}

// bands: game/reach.js의 reachFrom 결과의 bands (없으면 지운다)
export function showReach(map, bands = []) {
  REACH_BANDS.forEach((_, i) => {
    const circles = bands[i]?.circles ?? [];
    map.getSource(sourceId(i))?.setData({
      type: 'FeatureCollection',
      features: circles.map(({ center, radius }) => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [circle(center, radius)] },
        properties: {},
      })),
    });
  });
}

// 가운데 center, 반지름 radius(m)인 원을 REACH_CIRCLE_POINTS개 점으로
function circle([lng, lat], radius) {
  const dx = radius / metersPerDegreeLng(lat);
  const dy = radius / METERS_PER_DEGREE_LAT;
  const points = [];
  for (let i = 0; i <= REACH_CIRCLE_POINTS; i++) {
    const angle = (i / REACH_CIRCLE_POINTS) * 2 * Math.PI;
    points.push([lng + dx * Math.cos(angle), lat + dy * Math.sin(angle)]);
  }
  return points;
}
