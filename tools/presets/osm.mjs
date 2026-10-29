// 실제 노선망 프리셋 도구의 바깥 자료 받기: OpenStreetMap(Overpass API) 묻기, OpenFreeMap 지도 조각의 건물. 그리고 작은 거리 계산
import { PbfReader } from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';

const TILE_ZOOM = 14;
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'railmap-preset-tool (https://github.com/kutanxx/railmap)';

export const round6 = (value) => Math.round(value * 1e6) / 1e6;
export const meters = ([lng1, lat1], [lng2, lat2]) => {
  const x = (lng2 - lng1) * 111320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = (lat2 - lat1) * 110540;
  return Math.hypot(x, y);
};
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Overpass API 묻기. 바쁘면(429·502·504) 조금 쉬고 다시 묻는다
export async function overpass(query) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (response.ok) return response.json();
    if (attempt >= 8 || ![429, 502, 503, 504].includes(response.status)) {
      throw new Error(`OpenStreetMap 자료를 받지 못했어요 (${response.status})`);
    }
    console.log(`  Overpass가 바빠요 (${response.status}), ${attempt * 15}초 뒤 다시`);
    await sleep(attempt * 15000);
  }
}

// ── 지도 조각의 건물 ──
let tileTemplate = null;
const tileCache = new Map();
const tileXY = ([lng, lat]) => {
  const n = 2 ** TILE_ZOOM;
  const x = Math.floor(((lng + 180) / 360) * n);
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return [x, y];
};
async function buildingsInTile(x, y) {
  const key = `${x}/${y}`;
  if (!tileCache.has(key)) {
    if (!tileTemplate) {
      const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
      tileTemplate = (await (await fetch(style.sources.openmaptiles.url)).json()).tiles[0];
    }
    const url = tileTemplate.replace('{z}', TILE_ZOOM).replace('{x}', x).replace('{y}', y);
    const tileResponse = await fetch(url);
    if (!tileResponse.ok) throw new Error(`지도 조각을 받지 못했어요 (${tileResponse.status}): ${url}`);
    const tile = new VectorTile(new PbfReader(new Uint8Array(await tileResponse.arrayBuffer())));
    const layer = tile.layers.building;
    const features = [];
    for (let i = 0; layer && i < layer.length; i++) features.push(layer.feature(i).toGeoJSON(x, y, TILE_ZOOM));
    tileCache.set(key, features);
  }
  return tileCache.get(key);
}

// coord 둘레(반경 radius m를 덮는 네모)의 건물 지물 목록 (GeoJSON, 경도·위도)
export async function buildingsNear([lng, lat], radius) {
  const reach = (radius * 1.2) / 111320; // 원을 덮는 네모 (도)
  const [x0, y0] = tileXY([lng - reach, lat + reach]);
  const [x1, y1] = tileXY([lng + reach, lat - reach]);
  const features = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) features.push(...(await buildingsInTile(x, y)));
  return features;
}
