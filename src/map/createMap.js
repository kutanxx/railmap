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

// 가상 지도에서 지도 밖으로 얼마나 더 나갈 수 있는지 (경도·위도, 지도 가장자리를 화면 가운데까지 볼 수 있게)
const VIRTUAL_MARGIN = 0.05;

// region: getRegion()의 결과, virtualData: 가상 지도 자료 (실제 지도면 null)
export async function createMap(containerId, region, virtualData) {
  const workerBlob = new Blob([mapWorkerCode], { type: 'text/javascript' });
  setWorkerUrl(URL.createObjectURL(workerBlob));

  const options = { container: containerId, center: region.center, zoom: region.zoom };
  if (virtualData) {
    // 가상 지도는 자료가 있는 곳만 보이게 움직일 수 있는 범위를 막는다
    const [west, south, east, north] = virtualData.bbox;
    options.style = sollaeStyle(virtualData);
    options.maxBounds = [
      [west - VIRTUAL_MARGIN, south - VIRTUAL_MARGIN],
      [east + VIRTUAL_MARGIN, north + VIRTUAL_MARGIN],
    ];
  } else {
    options.style = await loadBeigeStyle(BASE_STYLE_URL);
  }
  return new MapLibreMap(options);
}
