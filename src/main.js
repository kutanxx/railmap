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
import { addStationLayers, updateStations, stationIdAt } from './map/layers.js';
import { updateStationLabels } from './map/stationLabels.js';
import {
  getState,
  subscribe,
  findStation,
  addStation,
  renameStation,
  rotateStation,
  removeStation,
} from './game/state.js';
import { renderBadge } from './ui/badge.js';
import { createToolbar } from './ui/toolbar.js';
import { createPanel } from './ui/panel.js';

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

// 지도가 다 준비된 뒤에 도구와 패널을 연결한다 (그 전에 누르면 그릴 곳이 없다)
map.on('load', () => {
  // 화면 상태: 게임 상태가 아니라 지금 고른 도구와 선택한 역
  let currentTool = 'select';
  let selectedStationId = null;

  const toolbar = createToolbar(document.getElementById('toolbar'), (toolId) => {
    currentTool = toolId;
    render();
  });

  const panel = createPanel(document.getElementById('panel'), {
    onRename: (id, name) => renameStation(id, name),
    onRotate: (id, angle) => rotateStation(id, angle),
    onDelete: (id) => {
      selectedStationId = null;
      removeStation(id);
    },
  });

  // 상태를 읽어서 화면 전체를 다시 그린다
  function render() {
    const { stations } = getState();
    toolbar.setActive(currentTool);
    updateStations(map, stations, selectedStationId);
    updateStationLabels(map, stations);
    panel.show(selectedStationId ? findStation(selectedStationId) : null);
    map.getCanvas().style.cursor = currentTool === 'station' ? 'crosshair' : '';
  }

  addStationLayers(map);
  subscribe(render);
  render();

  map.on('click', (event) => {
    const clickedId = stationIdAt(map, event.point);
    if (clickedId) {
      // 어느 도구든 기존 역을 누르면 그 역을 고른다
      selectedStationId = clickedId;
    } else if (currentTool === 'station') {
      selectedStationId = addStation(event.lngLat.toArray()).id;
    } else {
      selectedStationId = null;
    }
    render();
  });

  // 선택 도구일 때 역 위에 마우스를 올리면 손가락 모양으로 바꾼다
  map.on('mousemove', (event) => {
    if (currentTool !== 'select') return;
    map.getCanvas().style.cursor = stationIdAt(map, event.point) ? 'pointer' : '';
  });
});
