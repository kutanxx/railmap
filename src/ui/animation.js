// 애니메이션: 매 프레임 시간을 흘리고 열차를 다시 그린다 (requestAnimationFrame).
// 게임 시간 = 실제 흐른 시간 × 배속. 열차 위치는 GeoJSON source 하나에 setData로 한 번에 바꾼다.
import { TRAIN_LENGTH_M, TRAIN_MIN_SCREEN_PX } from '../config.js';
import { getState } from '../game/state.js';
import { stepSimulation, trainFeatures } from '../game/sim.js';
import { updateTrains } from '../map/trainLayers.js';
import { METERS_PER_PIXEL_Z0 } from '../map/stationLayers.js';
import { playSound } from './sounds.js';

// 지금 줌에서 그릴 열차 길이 (km): 실제 길이, 단 화면에서 TRAIN_MIN_SCREEN_PX보다 짧아지지 않게
function shownTrainLengthKm(map) {
  const metersPerPixel = METERS_PER_PIXEL_Z0 / 2 ** map.getZoom();
  return Math.max(TRAIN_LENGTH_M, TRAIN_MIN_SCREEN_PX * metersPerPixel) / 1000;
}

// 결과: { markTrainsChanged } — 노선·열차가 바뀌었을 때 불러서, 멈춤 중에도 다음 프레임에 다시 그리게 한다
export function startAnimation(map) {
  let trainsChanged = true;
  let lastFrame = performance.now();

  function frame(now) {
    // 탭을 오래 비웠다 돌아와도 열차가 순간이동하지 않게 한 프레임은 최대 0.1초로 친다
    const realSeconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const { speed, trains } = getState();
    // 시간이 흐르면 달력·정산을 위해 매 프레임 계산하지만,
    // 열차를 다시 그리는 건 움직이는 열차가 있거나 열차가 바뀌었을 때만 한다 (지도가 쉴 수 있게)
    // 열차가 역에 서면 작은 소리 (sounds.js가 너무 잦지 않게 거른다)
    if (stepSimulation(realSeconds * speed) > 0) playSound('arrive');
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
    },
  };
}
