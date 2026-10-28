// 그리기 도구 두 개를 만들고 게임에 잇는다: [선로] (trackTool.js), [노선] (routeTool.js).
// 다 그리면 짓고(game/), 돈이 모자라거나 선로가 없으면 그 이유를 말풍선으로 알려준다.
import { findStation, findTrackBetween, routeCoords } from '../game/state.js';
import { shapeCoords } from '../game/trackShape.js';
import { addTrack } from '../game/build.js';
import { addRoute, newRouteCost } from '../game/routes.js';
import { trackCostForCoords } from '../game/economy.js';
import { updateDraft } from '../map/trackLayers.js';
import { createTrackTool } from './trackTool.js';
import { createRouteTool } from './routeTool.js';
import { showCallout } from './callouts.js';
import { shortfall } from './costText.js';
import { playSound } from './sounds.js';

// 새 선로를 곡선으로 그릴지 브라우저에 기억해 둔다 (다음에 켜도 같은 모양으로)
const CURVE_KEY = 'railmap-track-curve';

// select: 고른 것 바꾸기, render: 화면 다시 그리기, notice: 화면 가운데 말풍선 (app.js)
// 결과: { trackTool, routeTool, setDraftCurve: 새로 그릴 선로 모양 정하기 (곡선이면 true),
//         setDraftPlan: 새로 그릴 선로를 계획 선로로 할지 }
export function createDrawingTools({ map, select, render, notice }) {
  const trackTool = createTrackTool({
    curve: localStorage.getItem(CURVE_KEY) === '1',
    onChange: (draft) => updateDraft(map, draft),
    onComplete: (from, to, waypoints, curve, plan) => {
      const track = addTrack(from, to, waypoints, curve, plan);
      if (!track) {
        const coords = shapeCoords([findStation(from).coord, ...waypoints, findStation(to).coord], curve);
        const { cost } = trackCostForCoords(coords);
        showCallout(map, findStation(to).coord, shortfall(cost), 'bad');
        return false;
      }
      select({ type: 'track', id: track.id });
      render();
      playSound('track');
      return true;
    },
  });

  const routeTool = createRouteTool({
    // 앞 역과 다음 역 사이에 지은 선로가 없으면 이유를 알려준다 (계획 선로만 있으면 먼저 지으라고)
    checkLink: (from, to) => {
      if (findTrackBetween(from, to)) return null;
      const names = `${findStation(from).name}과(와) ${findStation(to).name}`;
      return findTrackBetween(from, to, { planned: true })
        ? `${names} 사이 선로는 아직 계획이에요. 선로를 눌러 [짓기]로 먼저 지어주세요.`
        : `${names} 사이에 선로가 없어요. [선로] 도구로 먼저 이어주세요.`;
    },
    onChange: () => {
      // 고른 역들을 잇는 선로를 점선으로 미리 보여준다
      const draft = routeTool.getDraft();
      updateDraft(
        map,
        draft && {
          coords: routeCoords({ stations: draft.stations }),
          waypoints: draft.stations.map((id) => findStation(id).coord),
          cursor: null,
        },
      );
      render();
    },
    onComplete: (stationIds) => {
      const route = addRoute(stationIds);
      if (!route) {
        // 기본 열차 값을 낼 돈이 모자라면 고르던 역을 그대로 두고 이유를 알려준다
        notice(`${shortfall(newRouteCost())} (열차 값)`, 'bad');
        return false;
      }
      select({ type: 'route', id: route.id });
      render();
      // 노선 가운데쯤 역 위에 개통 말풍선을 띄운다
      const middle = stationIds[Math.floor(stationIds.length / 2)];
      showCallout(map, findStation(middle).coord, `${route.name} 개통`);
      playSound('open');
    },
  });

  function setDraftCurve(curve) {
    trackTool.setCurve(curve);
    localStorage.setItem(CURVE_KEY, curve ? '1' : '0');
    render();
  }

  function setDraftPlan(plan) {
    trackTool.setPlan(plan);
    render();
  }

  return { trackTool, routeTool, setDraftCurve, setDraftPlan };
}
