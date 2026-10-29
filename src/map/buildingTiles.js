// 화면에 보이지 않는 곳의 건물 읽기: OpenFreeMap 지도 조각(줌 14, 게임 지도가 쓰는 것과 같은 자료)을 직접 받아 건물을 꺼낸다.
// 공유받은 노선망처럼 역 주변 건물 칸(cells)이 없는 역을 다시 잴 때 쓴다 (measureStations, main.js).
// 그래야 가까운 역끼리 사람을 나눠 가지는 계산(game/catchment.js)이 보낸 사람과 같아진다.
// 가상 지도는 들고 있는 자료(mapFeatures.js)에서 읽는다.
// 지도 조각을 읽는 라이브러리(pbf, @mapbox/vector-tile)는 쓸 때만 받는다 (MapLibre도 안에서 같은 방식으로 읽는다).
import { BASE_STYLE_URL, POPULATION_RADIUS_M } from '../config.js';
import { readMapFeatures, isVirtualMap } from './mapFeatures.js';
import { populationFromBuildings } from './population.js';
import { packCells } from '../game/cellPacking.js';

const TILE_ZOOM = 14;
// 지도 조각을 한꺼번에 몇 개까지 받을지 (서울 실제 노선망 역 320곳은 조각 약 150개. 기다리는 시간이 대부분이다)
const PARALLEL_TILES = 16;

// 역들 가운데 건물 칸이 없는 역을 다시 잰다: 인구·건물 면적·건물 칸(격자 번호로 줄여서)을 고쳐 쓴 새 역 목록을 돌려준다.
// onProgress(0~100): 얼마나 했는지 (%). 불러오는 중 표시에 쓴다 (지도 조각 받기 절반, 역 재기 절반)
export async function measureStations(stations, onProgress = () => {}) {
  const missing = stations.filter((station) => !station.cells && !station.cellGrid);
  if (missing.length === 0) return stations;
  const readTile = isVirtualMap() ? null : await tileReader();
  // 필요한 지도 조각을 먼저 다 받는다 (같은 조각을 여러 역이 쓴다). 늘 PARALLEL_TILES개씩 받고 있게 한다
  if (readTile) {
    const keys = [...new Set(missing.flatMap((station) => tilesAround(station.coord)))];
    let next = 0;
    let done = 0;
    const worker = async () => {
      while (next < keys.length) {
        await readTile(keys[next++]);
        onProgress(Math.round((++done / keys.length) * 50));
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_TILES }, worker));
  }
  const measured = new Map();
  for (const [i, station] of missing.entries()) {
    const features = readTile
      ? (await Promise.all(tilesAround(station.coord).map(readTile))).flat()
      : readMapFeatures(null, 'building');
    const { population, builtArea, cells } = populationFromBuildings(features, station.coord);
    const grid = cells ? packCells(station.coord, cells) : null;
    measured.set(station.id, grid ? { population, builtArea, cellGrid: grid } : { population, builtArea, cells });
    onProgress(50 + Math.round(((i + 1) / missing.length) * 50));
    // 불러오는 중 표시가 멈춰 보이지 않게 역 사이마다 화면에 틈을 준다
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return stations.map((station) => (measured.has(station.id) ? { ...station, ...measured.get(station.id) } : station));
}

// 역 둘레(반경을 덮는 네모)에 걸치는 지도 조각들 ["x/y", …]
function tilesAround([lng, lat]) {
  const reach = (POPULATION_RADIUS_M * 1.2) / 111320; // 원을 덮는 네모 (도)
  const [x0, y0] = tileXY([lng - reach, lat + reach]);
  const [x1, y1] = tileXY([lng + reach, lat - reach]);
  const keys = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) keys.push(`${x}/${y}`);
  return keys;
}

const tileXY = ([lng, lat]) => {
  const n = 2 ** TILE_ZOOM;
  const rad = (lat * Math.PI) / 180;
  return [
    Math.floor(((lng + 180) / 360) * n),
    Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n),
  ];
};

// "x/y" → 그 지도 조각의 건물 지물 목록 (한 번 받은 조각은 기억한다)
async function tileReader() {
  const [{ PbfReader }, { VectorTile }, style] = await Promise.all([
    import('pbf'),
    import('@mapbox/vector-tile'),
    fetch(BASE_STYLE_URL).then((response) => response.json()),
  ]);
  const template = (await (await fetch(style.sources.openmaptiles.url)).json()).tiles[0];
  const cache = new Map();
  return (key) => {
    if (!cache.has(key)) {
      const [x, y] = key.split('/').map(Number);
      const url = template.replace('{z}', TILE_ZOOM).replace('{x}', x).replace('{y}', y);
      cache.set(
        key,
        fetch(url).then(async (response) => {
          if (!response.ok) throw new Error(`지도 조각을 받지 못했어요 (${response.status})`);
          const layer = new VectorTile(new PbfReader(new Uint8Array(await response.arrayBuffer()))).layers.building;
          const features = [];
          for (let i = 0; layer && i < layer.length; i++) features.push(layer.feature(i).toGeoJSON(x, y, TILE_ZOOM));
          return features;
        }),
      );
    }
    return cache.get(key);
  };
}
