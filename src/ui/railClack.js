// 레일 덜컹 소리: 아주 가까이 볼 때(CLACK_MIN_ZOOM 이상) 화면 가운데에서 가장 가까운 달리는 열차 한 대만
// "따닥… 따닥" 소리를 낸다. 빠를수록 간격이 짧고 크며, 화면 가운데에서 멀수록 작다. 서 있는 열차는 조용하다.
// 게임 시간은 실제보다 훨씬 빨라서(TIME_SCALE) 진짜 이음매 간격대로 내면 "드르륵"이 되므로, 느긋한 박자로 줄였다.
import { CLACK_MIN_ZOOM, CLACK_GAP_SECONDS, CLACK_REACH_PX } from '../config.js';
import { trainMotion } from '../game/sim.js';
import { playClack } from './sounds.js';

// 이 빠르기(최고 속도 대비)보다 느린 열차는 덜컹 소리를 내지 않는다 (막 출발하거나 거의 선 열차)
const MIN_SPEED_RATIO = 0.15;
let wait = 0; // 다음 "따닥"까지 남은 실제 초

// 매 프레임 부른다. realSeconds: 지난 프레임부터 흐른 실제 초, speed: 배속 (0이면 멈춤)
export function updateRailClack(map, realSeconds, speed) {
  if (speed === 0 || map.getZoom() < CLACK_MIN_ZOOM) {
    wait = 0;
    return;
  }
  wait -= realSeconds;
  if (wait > 0) return;
  const canvas = map.getCanvas();
  const centerX = canvas.clientWidth / 2;
  const centerY = canvas.clientHeight / 2;
  let nearest = null;
  let nearestPx = Infinity;
  for (const train of trainMotion()) {
    if (train.speedRatio < MIN_SPEED_RATIO) continue;
    const { x, y } = map.project(train.coord);
    const px = Math.hypot(x - centerX, y - centerY);
    if (px < nearestPx) {
      nearest = train;
      nearestPx = px;
    }
  }
  if (!nearest || nearestPx > CLACK_REACH_PX) {
    wait = 0.2; // 가까운 열차가 없으면 잠깐 뒤에 다시 본다
    return;
  }
  const closeness = 1 - nearestPx / CLACK_REACH_PX;
  playClack(nearest.speedRatio * (0.4 + 0.6 * closeness));
  // 3배속이면 조금 더 잦게 (√3배)
  wait = CLACK_GAP_SECONDS / nearest.speedRatio / Math.sqrt(speed);
}
