// 시작점: 지도와 화면 요소를 연결만 한다
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// 지도 타일을 뒤에서 처리하는 작업 파일(워커). Vite가 이 파일을 고치지 않도록
// 원본 글자 그대로 받아와서 브라우저 안의 임시 주소(blob)로 만들어 MapLibre에 알려준다
import mapWorkerCode from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';
import './style.css';

import {
  START_CENTER,
  START_ZOOM,
  BASE_STYLE_URL,
  REGION_NAME,
  START_YEAR,
  START_MONTH,
} from './config.js';
import { loadBeigeStyle } from './map/style.js';
import { renderBadge } from './ui/badge.js';

renderBadge(document.getElementById('badge'), {
  year: START_YEAR,
  month: START_MONTH,
  region: REGION_NAME,
});

const workerBlob = new Blob([mapWorkerCode], { type: 'text/javascript' });
setWorkerUrl(URL.createObjectURL(workerBlob));

const style = await loadBeigeStyle(BASE_STYLE_URL);

const map = new MapLibreMap({
  container: 'map',
  style,
  center: START_CENTER,
  zoom: START_ZOOM,
});
