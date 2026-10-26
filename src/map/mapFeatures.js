// 지도 자료(건물·도로·물) 읽기를 한곳에 모은다. 인구(population.js), 출구(exitFinder.js), 교량(water.js)이 쓴다.
// - 실제 지도: 지금 불러온 지도 타일에서 읽는다 (화면 밖 먼 곳은 없을 수 있다)
// - 가상 지도: 들고 있는 GeoJSON 자료 전체에서 읽는다 (확대 정도와 상관없이 늘 같다)
// 가상 지도 자료는 실제 지도 타일(OpenMapTiles)과 같은 이름(layer, class)을 쓰므로 읽는 쪽 코드는 같다.

const BASE_SOURCE = 'openmaptiles';

// 가상 지도 자료를 layer별로 나눠 둔 것. 실제 지도면 null
let virtual = null;

// 가상 지도를 쓴다면 그 자료(FeatureCollection)를 넘긴다
export function useVirtualMap(data) {
  virtual = new Map();
  for (const feature of data.features) {
    const { layer } = feature.properties;
    if (!virtual.has(layer)) virtual.set(layer, []);
    virtual.get(layer).push(feature);
  }
}

export const isVirtualMap = () => virtual !== null;

// layer: 'building' | 'transportation' | 'water'. 결과: GeoJSON 지물 목록 (geometry, properties)
export function readMapFeatures(map, layer) {
  if (virtual) return virtual.get(layer) ?? [];
  return map.querySourceFeatures(BASE_SOURCE, { sourceLayer: layer });
}
