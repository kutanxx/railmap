// 오른쪽 패널: 늘 하나만 보여준다. 노선 만들기 안내 > 고른 노선·역·선로 카드 > 노선 목록 (접었으면 노선 번호 띠)
// 카드는 panel.js, 노선 패널은 routeControls.js, 번호 띠는 routeStrip.js가 그리고, 여기서는 무엇을 보일지 정하고 잇는다.
// 카드의 [← 노선 목록]·[✕]는 고른 것을 놓는다 (Esc와 같다). 노선 목록을 접은 상태는 브라우저에 기억한다.
import { findTrack } from '../game/state.js';
import { renameStation, rotateStation, setTrackCurve, curveChangeCost, buildPlannedTrack, plannedTrackCost } from '../game/build.js';
import { playSound } from './sounds.js';
import { createPanel } from './panel.js';
import { createRouteStrip } from './routeStrip.js';
import { createRouteControls } from './routeControls.js';
import { infoPanelView, routePanelView } from './views.js';
import { shortfall } from './costText.js';

// 오른쪽 패널을 접었는지 기억하는 브라우저 저장 이름
const PANEL_FOLDED_KEY = 'railmap-panel-folded';

// app.js가 넘겨주는 것: ui(화면 상태), select·render·notice, routeTool([노선] 도구),
// deleteSelected(고른 것 지우기), previewDelete(지울 것 미리 보기)
// 결과: { show({ routes, shapes }) } — 다시 그릴 때마다 부른다
export function createSidePanels({ ui, select, render, notice, routeTool, deleteSelected, previewDelete }) {
  ui.panelFolded = localStorage.getItem(PANEL_FOLDED_KEY) === '1';

  const closeCard = () => {
    select(null);
    render();
  };
  const setPanelFolded = (folded) => {
    ui.panelFolded = folded;
    localStorage.setItem(PANEL_FOLDED_KEY, folded ? '1' : '0');
    render();
  };

  const panel = createPanel(document.getElementById('panel'), {
    onRename: (id, name) => renameStation(id, name),
    onRotate: (id, angle) => rotateStation(id, angle),
    onDeleteStation: deleteSelected,
    onDeleteTrack: deleteSelected,
    onDeletePreview: previewDelete,
    onClose: closeCard,
    // 선로 카드의 [직선][곡선]: 길어지면 늘어난 만큼 공사비를 낸다
    onSetCurve: (id, curve) => {
      if (!setTrackCurve(id, curve)) notice(shortfall(curveChangeCost(findTrack(id), curve).cost), 'bad');
    },
    // 계획 선로 카드의 [짓기]: 공사비를 내고 진짜 선로로
    onBuildTrack: (id) => {
      if (buildPlannedTrack(id)) playSound('track');
      else notice(shortfall(plannedTrackCost(findTrack(id))), 'bad');
    },
  });
  const routeStrip = createRouteStrip(document.getElementById('route-strip'), {
    onUnfold: () => {
      if (ui.tool === 'track') ui.trackPanelOpen = true;
      setPanelFolded(false);
    },
    onSelect: (id) => {
      select({ type: 'route', id });
      render();
    },
  });
  const routePanel = createRouteControls(document.getElementById('routes'), {
    ui,
    select,
    render,
    notice,
    routeTool,
    deleteSelected,
    previewDelete,
    onClose: closeCard,
    onFold: setPanelFolded,
  });

  // routes: 지금 노선들, shapes: 역 모양 (ui/stationShapes.js, 역 카드에 승강장 방향을 보여줄 때 쓴다)
  function show({ routes, shapes }) {
    // 선로 도구를 쓰는 동안은 노선 목록을 번호 띠로 잠깐 접어 지도를 넓게 쓴다 (도구를 바꾸면 다시 펼친다)
    const drafting = ui.tool === 'route';
    const folded = ui.panelFolded || (ui.tool === 'track' && !ui.trackPanelOpen);
    const card = drafting ? null : infoPanelView(ui.selected, shapes);
    let mode = null;
    if (drafting) mode = 'draft';
    else if (ui.selected?.type === 'route') mode = 'detail';
    else if (!card && routes.length > 0 && !folded) mode = 'list';
    panel.show(card);
    const routeView = routePanelView({
      mode,
      selected: ui.selected,
      draft: routeTool.getDraft(),
      routes,
      inserting: ui.insertingInto !== null,
      message: ui.routeMessage,
    });
    routePanel.show(routeView);
    const showStrip = !drafting && !card && mode !== 'detail' && folded && routes.length > 0;
    routeStrip.show(showStrip ? routeView.routes : null);
    // 오른쪽 패널이 펼쳐져 있는지 body에 적어 둔다 (위쪽 버튼 묶음이 그만큼 비켜 줄을 바꾼다, base.css)
    document.body.classList.toggle('side-panel-open', Boolean(card) || mode !== null);
  }

  return { show };
}
