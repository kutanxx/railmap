// 게임이 지도에 그리는 레이어를 정한 순서대로 올린다 (나중에 올린 것이 위에 보인다).
// 순서: 등고선 → 역세권 원 → 선로 → 출구 통로 → 고속철도역 → 역 → 열차 → 출구 배지 → 그리는 중 미리보기 → 선로 손잡이
import { addContourLayers } from './contours.js';
import { addStationLayers, addCatchmentLayer } from './stationLayers.js';
import { addTrackLayers, addDraftLayers, addHandleLayers } from './trackLayers.js';
import { addTrainLayers } from './trainLayers.js';
import { addPassageLayers, addExitLayers } from './exitLayers.js';
import { addIntercityLayers } from './intercityLayers.js';

// 게임이 올린 레이어 id들 (노선망 다시 보기가 보는 동안 숨겼다 되돌린다, ui/timelapse.js)
let added = [];
export const gameLayerIds = () => added;

// contourGrid: 등고선을 그릴 땅 높이 격자 (땅 높이가 없는 실제 지도면 null)
export function addGameLayers(map, contourGrid) {
  const before = new Set(map.getStyle().layers.map((layer) => layer.id));
  addAll(map, contourGrid);
  added = map
    .getStyle()
    .layers.map((layer) => layer.id)
    .filter((id) => !before.has(id));
}

function addAll(map, contourGrid) {
  if (contourGrid) addContourLayers(map, contourGrid);
  addCatchmentLayer(map);
  addTrackLayers(map);
  addPassageLayers(map);
  addIntercityLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addExitLayers(map);
  addDraftLayers(map);
  addHandleLayers(map);
}
