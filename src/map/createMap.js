// MapLibre 지도를 만든다: 작업 파일(워커) 준비 → 지도 스타일 준비 → 지도 생성
// 실제 지도는 OpenFreeMap 스타일을 베이지로 바꿔 쓰고, 가상 지도는 GeoJSON 자료 하나로 그린다
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// 지도 타일을 뒤에서 처리하는 작업 파일(워커). Vite가 이 파일을 고치지 않도록
// 원본 글자 그대로 받아와서 브라우저 안의 임시 주소(blob)로 만들어 MapLibre에 알려준다
import mapWorkerCode from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';
import { BASE_STYLE_URL } from '../config.js';
import { loadBeigeStyle } from './style.js';
import { sollaeStyle } from './sollaeStyle.js';

// 움직일 수 있는 범위 밖으로 얼마나 더 나갈 수 있는지 (경도·위도, 지도 가장자리를 화면 가운데까지 볼 수 있게)
const BOUNDS_MARGIN = 0.05;

// region: getRegion()의 결과, virtualData: 가상 지도 자료 (실제 지도면 null)
export async function createMap(containerId, region, virtualData) {
  const workerBlob = new Blob([mapWorkerCode], { type: 'text/javascript' });
  setWorkerUrl(URL.createObjectURL(workerBlob));

  const options = { container: containerId, center: region.center, zoom: region.zoom };
  if (virtualData) {
    options.style = sollaeStyle(virtualData);
    // 가상 지도는 실제 지도 자료를 쓰지 않지만, 글꼴은 OpenFreeMap에서 받아 쓰므로 밝혀 둔다
    options.attributionControl = { customAttribution: '가상 지도 · 글꼴 OpenFreeMap' };
  } else {
    options.style = await loadBeigeStyle(BASE_STYLE_URL);
  }
  // 움직일 수 있는 범위를 막는다: 가상 지도는 자료가 있는 곳, 실제 지도는 도시 경계쯤 (config.js의 bounds)
  const bounds = virtualData ? virtualData.bbox : region.bounds;
  if (bounds) {
    const [west, south, east, north] = bounds;
    options.maxBounds = [
      [west - BOUNDS_MARGIN, south - BOUNDS_MARGIN],
      [east + BOUNDS_MARGIN, north + BOUNDS_MARGIN],
    ];
  }
  return new MapLibreMap(options);
}
