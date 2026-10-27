// 게임이 지도에 그리는 레이어를 정한 순서대로 올린다 (나중에 올린 것이 위에 보인다).
// 순서: 등고선 → 역세권 원 → 선로 → 출구 통로 → 역 → 열차 → 출구 배지 → 그리는 중 미리보기 → 선로 손잡이
import { addContourLayers } from './contours.js';
import { addStationLayers, addCatchmentLayer } from './stationLayers.js';
import { addTrackLayers, addDraftLayers, addHandleLayers } from './trackLayers.js';
import { addTrainLayers } from './trainLayers.js';
import { addPassageLayers, addExitLayers } from './exitLayers.js';

// contourGrid: 등고선을 그릴 땅 높이 격자 (땅 높이가 없는 실제 지도면 null)
export function addGameLayers(map, contourGrid) {
  if (contourGrid) addContourLayers(map, contourGrid);
  addCatchmentLayer(map);
  addTrackLayers(map);
  addPassageLayers(map);
  addStationLayers(map);
  addTrainLayers(map);
  addExitLayers(map);
  addDraftLayers(map);
  addHandleLayers(map);
}
