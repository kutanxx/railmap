// 지도 미리 준비: 시작 화면이 떠 있는 동안, 다음에 열 것 같은 지도의 첫 화면 자료를 미리 받아 둔다.
// 받은 자료는 브라우저가 기억(HTTP 캐시)해 두므로, 지도를 고르면 MapLibre가 다시 받지 않고 바로 쓴다.
// - 지도 스타일(색·글꼴 정보): style.js가 한 번 받은 것을 그대로 다시 쓴다 (loadBeigeStyle)
// - 지도 조각(타일): 그 지도의 처음 위치·확대 정도에서 화면에 들어올 조각들
// 가상 지도(솔내)는 자료가 게임 파일 안에 있어서 받을 것이 없다.
// 받다가 실패해도 게임은 그대로 지도를 처음부터 받으면 되므로, 실패는 조용히 넘긴다 (미리 받기는 덤이다).
import { BASE_STYLE_URL } from '../config.js';
import { loadBeigeStyle } from './style.js';

// 벡터 지도 조각 한 장의 화면 크기 (px). MapLibre 벡터 지도는 512px 조각을 쓴다
const TILE_PX = 512;
// 화면 크기보다 조금 넓게 받는다 (가장자리 조각이 반쯤 걸쳐도 받게)
const MARGIN_PX = 256;

// 이미 미리 받은 지도 (같은 지도를 두 번 받지 않게)
const prepared = new Set();
// 지도 조각 주소 틀 ("…/{z}/{x}/{y}.pbf"). 스타일의 TileJSON에서 한 번 읽어 둔다
let tileTemplate = null;

// 경도·위도 → 그 확대 정도에서의 조각 번호 (소수, 웹 메르카토르)
function tileXY([lng, lat], zoom) {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return [x, y];
}

async function readTileTemplate() {
  if (tileTemplate) return tileTemplate;
  const style = await loadBeigeStyle(BASE_STYLE_URL);
  const tileJson = await (await fetch(style.sources.openmaptiles.url)).json();
  tileTemplate = { url: tileJson.tiles[0], maxzoom: tileJson.maxzoom ?? 14 };
  return tileTemplate;
}

// region: regions.js의 지도 하나 ({ center, zoom, virtual }), id: 지도 id
export function prefetchMap(id, region) {
  if (region.virtual || prepared.has(id)) return;
  prepared.add(id);
  readTileTemplate()
    .then(({ url, maxzoom }) => {
      // 벡터 조각은 지도 확대 정도와 같은 번호의 조각을 쓴다 (가장 깊은 조각보다 더 확대하면 그 조각을 키워 쓴다)
      const zoom = Math.min(Math.floor(region.zoom), maxzoom);
      const scale = 2 ** (region.zoom - zoom); // 조각 하나가 화면에서 몇 배로 보이는지
      const [cx, cy] = tileXY(region.center, zoom);
      const halfX = (window.innerWidth / 2 + MARGIN_PX) / (TILE_PX * scale);
      const halfY = (window.innerHeight / 2 + MARGIN_PX) / (TILE_PX * scale);
      const requests = [];
      for (let x = Math.floor(cx - halfX); x <= Math.floor(cx + halfX); x++) {
        for (let y = Math.floor(cy - halfY); y <= Math.floor(cy + halfY); y++) {
          const tile = url.replace('{z}', zoom).replace('{x}', x).replace('{y}', y);
          requests.push(fetch(tile));
        }
      }
      return Promise.allSettled(requests);
    })
    .catch(() => {
      // 미리 받기에 실패하면 지도를 고를 때 처음부터 받는다 (다시 미리 받을 수 있게 표시를 지운다)
      prepared.delete(id);
    });
}
