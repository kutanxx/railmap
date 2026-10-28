// 새 역의 이름 짓기: 지도에 적힌 가까운 지명(동네·마을·도시 이름)을 따서 붙인다.
// - 가까운 지명부터 차례로, 아직 다른 역이 쓰지 않은 이름을 고른다 (한국어 이름이 있으면 한국어)
// - 이미 쓴 이름이면 실제 철도처럼 방향을 붙인다: "동대구", "서대전" (한국어 이름), "West Shinjuku" (그 밖)
//   방향은 지명이 있는 자리에서 역 쪽이다
// - STATION_NAME_SEARCH_M 안에 쓸 만한 지명이 없으면 null (그러면 "역 n"이 된다)
// 지명은 지도 자료에서 읽는다 (mapFeatures.js: 실제 지도는 불러온 타일의 place 층, 가상 지도는 GeoJSON의 마을).
import { STATION_NAME_SEARCH_M, STATION_NAME_KINDS } from '../config.js';
import { readMapFeatures } from './mapFeatures.js';
import { localProjection } from './population.js';

const HANGUL = /[가-힣]/;
// 방향 이름: [한국어 앞말, 영어 앞말]
const DIRECTIONS = { east: ['동', 'East'], west: ['서', 'West'], south: ['남', 'South'], north: ['북', 'North'] };

// 지명 하나의 이름: 한국어 → 로마자 → 그 나라 글자 순서
function placeName(properties) {
  return properties['name:ko'] || properties['name:latin'] || properties.name_en || properties.name || null;
}

// coord: 새 역 자리 [경도, 위도], usedNames: 다른 역들이 이미 쓰는 이름들(Set). 결과: 이름 또는 null
export function nearbyPlaceName(map, coord, usedNames) {
  const toMeters = localProjection(coord);
  const places = readMapFeatures(map, 'place')
    .filter((feature) => feature.geometry.type === 'Point')
    .filter((feature) => STATION_NAME_KINDS.includes(feature.properties.class ?? feature.properties.kind))
    .map((feature) => {
      const [x, y] = toMeters(feature.geometry.coordinates);
      return { name: placeName(feature.properties), x, y, distance: Math.hypot(x, y) };
    })
    .filter((place) => place.name && place.distance <= STATION_NAME_SEARCH_M)
    .sort((a, b) => a.distance - b.distance);

  // 같은 지명이 여러 조각(타일)에 겹쳐 나오므로 이름마다 가장 가까운 것 하나만
  const seen = new Set();
  for (const place of places) {
    if (seen.has(place.name)) continue;
    seen.add(place.name);
    if (!usedNames.has(place.name)) return place.name;
    const withDirection = directionName(place);
    if (!usedNames.has(withDirection)) return withDirection;
  }
  return null;
}

// 지명 자리에서 역 쪽 방향을 붙인 이름 (place.x·y는 역에서 지명까지 미터라서 반대로 본다)
function directionName({ name, x, y }) {
  const [dx, dy] = [-x, -y];
  const direction = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : dy > 0 ? 'north' : 'south';
  const [korean, english] = DIRECTIONS[direction];
  return HANGUL.test(name) ? `${korean}${name}` : `${english} ${name}`;
}
