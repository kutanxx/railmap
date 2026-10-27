// 애니메이션: 매 프레임 시간을 흘리고 열차를 다시 그린다 (requestAnimationFrame).
// 게임 시간 = 실제 흐른 시간 × 배속. 열차 위치는 GeoJSON source 하나에 setData로 한 번에 바꾼다.
import { TRAIN_LENGTH_M, TRAIN_MIN_SCREEN_PX, ARRIVAL_SOUND_MIN_ZOOM } from '../config.js';
import { getState, findRoute, findStation } from '../game/state.js';
import { routeNumber } from '../game/routes.js';
import { stepSimulation, trainFeatures } from '../game/sim.js';
import { updateTrains } from '../map/trainLayers.js';
import { METERS_PER_PIXEL_Z0 } from '../map/stationLayers.js';
import { playArrivals, playSound } from './sounds.js';

// 지금 줌에서 그릴 열차 길이 (km): 실제 길이, 단 화면에서 TRAIN_MIN_SCREEN_PX보다 짧아지지 않게
function shownTrainLengthKm(map) {
  const metersPerPixel = METERS_PER_PIXEL_Z0 / 2 ** map.getZoom();
  return Math.max(TRAIN_LENGTH_M, TRAIN_MIN_SCREEN_PX * metersPerPixel) / 1000;
}

// 결과: { markTrainsChanged } — 노선·열차가 바뀌었을 때 불러서, 멈춤 중에도 다음 프레임에 다시 그리게 한다
export function startAnimation(map) {
  let trainsChanged = true;
  let lastFrame = performance.now();
  // 첫 열차가 이미 떠난 노선들. 새 노선의 첫 열차가 종점을 떠날 때 한 번만 경적을 울린다
  // (불러온 게임의 노선들은 처음부터 넣어 둬서 경적이 한꺼번에 울리지 않게)
  const departedRoutes = new Set(getState().routes.map((route) => route.id));

  function frame(now) {
    // 탭을 오래 비웠다 돌아와도 열차가 순간이동하지 않게 한 프레임은 최대 0.1초로 친다
    const realSeconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const { speed, trains } = getState();
    // 시간이 흐르면 달력·정산을 위해 매 프레임 계산하지만,
    // 열차를 다시 그리는 건 움직이는 열차가 있거나 열차가 바뀌었을 때만 한다 (지도가 쉴 수 있게)
    // 열차가 역에 서면 그 노선의 음으로 작은 소리. 가까이 볼 때만, 화면 안 역에 선 열차만 낸다
    // (sounds.js가 짧은 동안 선 열차들을 묶어서 너무 잦지 않게 낸다. 아무도 안 서도 불러서 묶은 소리를 내보낸다)
    const step = stepSimulation(realSeconds * speed);
    for (const routeId of step.departures) {
      if (departedRoutes.has(routeId)) continue;
      departedRoutes.add(routeId);
      playSound('horn');
    }
    const close = map.getZoom() >= ARRIVAL_SOUND_MIN_ZOOM;
    const arrivals = step.arrivals.filter(() => close);
    const bounds = arrivals.length > 0 ? map.getBounds() : null;
    const routes = arrivals
      .filter(({ stationId }) => bounds.contains(findStation(stationId).coord))
      .map(({ routeId }) => routeNumber(findRoute(routeId)));
    playArrivals(routes);
    if ((speed > 0 && trains.length > 0) || trainsChanged) {
      updateTrains(map, trainFeatures(shownTrainLengthKm(map)));
      trainsChanged = false;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // 확대·축소하면 그릴 열차 길이가 바뀌므로, 멈춤 중에도 다시 그린다
  map.on('zoom', () => {
    trainsChanged = true;
  });

  return {
    markTrainsChanged: () => {
      trainsChanged = true;
      // 지워진 노선은 잊는다. 새로 시작하거나 지운 뒤 같은 이름표(r1 등)의 새 노선이 생겨도 경적이 울리게
      const alive = new Set(getState().routes.map((route) => route.id));
      for (const id of departedRoutes) if (!alive.has(id)) departedRoutes.delete(id);
    },
  };
}
