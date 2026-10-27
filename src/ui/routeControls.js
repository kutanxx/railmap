// 오른쪽 노선 패널(routePanel.js)과 게임을 잇는다: 패널에서 누른 것을 노선 바꾸기(game/routes.js)로 옮기고,
// 못 하면 그 이유를 말풍선이나 패널 안내로 알려준다.
import { getState } from '../game/state.js';
import {
  renameRoute,
  recolorRoute,
  setRouteTrainCount,
  removeStationFromRoute,
  duplicateRoute,
  moveRouteStop,
  newRouteCost,
  trainPurchaseCost,
} from '../game/routes.js';
import { createRoutePanel } from './routePanel.js';
import { shortfall } from './costText.js';

// ctx: app.js가 넘겨주는 화면 상태와 도구들
// onClose: 노선 정보를 닫고 목록으로, onFold(true | false): 패널 접기·펼치기
export function createRouteControls(
  element,
  { ui, select, render, notice, routeTool, deleteSelected, previewDelete, onClose, onFold },
) {
  return createRoutePanel(element, {
    onClose,
    onFold,
    onSelect: (id) => {
      select({ type: 'route', id });
      render();
    },
    onRename: (id, name) => renameRoute(id, name),
    onRecolor: (id, color) => recolorRoute(id, color),
    // 열차를 늘릴 돈이 모자라면 이유를 알려준다
    onTrainCount: (id, count) => {
      if (setRouteTrainCount(id, count)) return;
      const route = getState().routes.find((r) => r.id === id);
      notice(shortfall(trainPurchaseCost(route, count)), 'bad');
    },
    onDelete: deleteSelected,
    onDeletePreview: previewDelete,
    // [노선 복제]: 같은 역 순서로 새 노선. 열차 값이 모자라면 이유를 알려준다
    onDuplicate: (id) => {
      const copy = duplicateRoute(id);
      if (!copy) {
        notice(`${shortfall(newRouteCost())} (열차 값)`, 'bad');
        return;
      }
      select({ type: 'route', id: copy.id });
      render();
      notice(`${copy.name}을(를) 만들었어요`);
    },
    // 역 순서 끌어서 바꾸기: 못 바꾸면 이유를 패널에 보여준다
    onMoveStop: (routeId, from, to) => {
      ui.routeMessage = moveRouteStop(routeId, from, to) ?? '';
      render();
    },
    // 노선에서 역 빼기: 못 빼면 이유를 패널에 보여준다
    onRemoveStation: (routeId, stationId) => {
      ui.routeMessage = removeStationFromRoute(routeId, stationId) ?? '';
      render();
    },
    // [역 끼워넣기]: 켜면 지도에서 역을 클릭해 넣는다 (mapInput.js가 처리)
    onToggleInsert: (routeId) => {
      ui.insertingInto = ui.insertingInto === routeId ? null : routeId;
      ui.routeMessage = ui.insertingInto ? '노선에 넣을 역을 지도에서 클릭하세요. (Esc로 끝내기)' : '';
      render();
    },
    onFinishDraft: () => routeTool.finish(),
    onCancelDraft: () => routeTool.cancel(),
  });
}
