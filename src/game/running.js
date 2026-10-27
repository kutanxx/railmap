// 역 사이 한 구간을 달리는 모습: 출발하면 TRAIN_ACCELERATION으로 빨라지고, 도착 전에 같은 만큼 느려지며,
// 선로가 많이 꺾이는 곳 앞뒤와 가파른 경사(땅 높이가 있는 가상 지도, trackProfile.js)에서는 제한 속도까지 줄인다. 열차 움직임(sim.js)과 소요 시간 계산(demand.js)이 함께 쓴다.
// 구간을 RUN_STEP_M마다 나눠 각 자리의 속도를 정하고(앞에서 가속, 뒤에서 감속), 자리마다 걸린 시간을 쌓아 둔다.
// 가속과 감속이 같아서 거꾸로 달리는 모습은 앞으로 달리는 모습을 뒤집은 것과 같다.
import { distance, bearing } from '@turf/turf';
import {
  TRAIN_SPEED_KMH,
  TRAIN_ACCELERATION,
  GENTLE_CURVE_ANGLE,
  SHARP_CURVE_ANGLE,
  SHARP_CURVE_SPEED_KMH,
  CURVE_ZONE_M,
  CURVE_WINDOW_M,
  GRADE_SLOW_START,
  MAX_GRADE,
  SPEED_RATIO_AT_MAX_GRADE,
} from '../config.js';
import { trackProfile } from './trackProfile.js';

// 몇 미터마다 속도를 정할지 (작을수록 매끄럽지만 계산이 늘어난다)
const RUN_STEP_M = 10;
const CRUISE = TRAIN_SPEED_KMH / 3.6; // m/s

// coords: 출발역에서 도착역까지 [경도, 위도] 점들
// 결과: { km: 구간 길이, seconds: 달리는 데 걸리는 시간(게임 초),
//         positionAt(t): 출발 t초 뒤 출발역에서 간 거리(km), timeAt(km): 그 거리까지 걸린 시간(초) }
export function buildRun(coords) {
  // 점마다 출발역에서의 거리(m)와, 그 점에서 꺾이는 각도에 따른 제한 속도
  const along = [0];
  for (let i = 1; i < coords.length; i++) {
    along.push(along[i - 1] + distance(coords[i - 1], coords[i], { units: 'meters' }));
  }
  const total = along[along.length - 1];
  // 점마다 꺾인 각도. 그 점 앞뒤 CURVE_WINDOW_M 안에서 꺾인 각도를 모두 더한 값으로 제한 속도를 정한다
  // (꺾인 직선은 한 점에서 크게, 곡선은 여러 점에서 조금씩 꺾이므로 더해야 비교할 수 있다)
  const turns = coords.map((_, i) =>
    i === 0 || i === coords.length - 1 ? 0 : turnAngle(coords[i - 1], coords[i], coords[i + 1]),
  );
  const limits = [];
  let first = 0;
  let last = 0;
  let windowTurn = 0; // turns[first..last]의 합
  for (let i = 1; i < coords.length - 1; i++) {
    while (last + 1 < coords.length && along[last + 1] - along[i] <= CURVE_WINDOW_M / 2) windowTurn += turns[++last];
    while (along[i] - along[first] > CURVE_WINDOW_M / 2) windowTurn -= turns[first++];
    if (turns[i] > 0 && windowTurn > GENTLE_CURVE_ANGLE) limits.push({ at: along[i], speed: curveSpeed(windowTurn) });
  }

  const steps = Math.max(1, Math.ceil(total / RUN_STEP_M));
  const step = total / steps;
  const profile = trackProfile(coords);
  // 자리마다 낼 수 있는 가장 빠른 속도: 달리는 속도, 꺾이는 곳 근처면 제한 속도, 가파르면 경사 제한 속도
  const speed = [];
  for (let i = 0; i <= steps; i++) {
    let v = CRUISE * gradeSpeedRatio(profile.gradeAt((i * step) / 1000));
    for (const limit of limits) if (Math.abs(i * step - limit.at) <= CURVE_ZONE_M) v = Math.min(v, limit.speed);
    speed.push(v);
  }
  // 앞에서부터: 서 있다가 가속, 뒤에서부터: 도착역에 서도록 감속 (v² = v₀² + 2as)
  speed[0] = 0;
  for (let i = 1; i <= steps; i++) {
    speed[i] = Math.min(speed[i], Math.sqrt(speed[i - 1] ** 2 + 2 * TRAIN_ACCELERATION * step));
  }
  speed[steps] = 0;
  for (let i = steps - 1; i >= 0; i--) {
    speed[i] = Math.min(speed[i], Math.sqrt(speed[i + 1] ** 2 + 2 * TRAIN_ACCELERATION * step));
  }
  // 자리마다 거기까지 걸린 시간 (한 칸은 두 끝 속도의 평균으로 달린다고 본다)
  const time = [0];
  for (let i = 1; i <= steps; i++) {
    const average = (speed[i - 1] + speed[i]) / 2;
    time.push(time[i - 1] + (average > 0 ? step / average : 0));
  }
  const seconds = time[steps];

  return {
    km: total / 1000,
    seconds,
    positionAt(t) {
      if (t <= 0) return 0;
      if (t >= seconds) return total / 1000;
      // 시간표에서 t가 들어가는 칸을 찾아 그 안에서 비례로 나눈다
      let low = 0;
      let high = steps;
      while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (time[middle] <= t) low = middle;
        else high = middle;
      }
      const span = time[high] - time[low];
      const part = span > 0 ? (t - time[low]) / span : 0;
      return ((low + part) * step) / 1000;
    },
    timeAt(km) {
      const index = Math.max(0, Math.min(steps, (km * 1000) / step));
      const low = Math.floor(index);
      const high = Math.min(steps, low + 1);
      return time[low] + (time[high] - time[low]) * (index - low);
    },
  };
}

// 경사에 따른 속도 비율: GRADE_SLOW_START까지는 1, 가장 가파른 경사(MAX_GRADE)에서 SPEED_RATIO_AT_MAX_GRADE (그 사이는 비례로)
function gradeSpeedRatio(grade) {
  if (grade <= GRADE_SLOW_START) return 1;
  const t = Math.min(1, (grade - GRADE_SLOW_START) / (MAX_GRADE - GRADE_SLOW_START));
  return 1 - (1 - SPEED_RATIO_AT_MAX_GRADE) * t;
}

// 세 점 a → b → c에서 b에서 꺾이는 각도 (0 = 곧게, 180 = 되돌아감)
function turnAngle(a, b, c) {
  const difference = Math.abs(bearing(b, c) - bearing(a, b)) % 360;
  return difference > 180 ? 360 - difference : difference;
}

// 꺾이는 각도에 따른 제한 속도 (m/s): GENTLE_CURVE_ANGLE까지는 그대로, SHARP_CURVE_ANGLE 이상이면
// SHARP_CURVE_SPEED_KMH, 그 사이는 비례로 줄인다
function curveSpeed(turn) {
  const sharp = SHARP_CURVE_SPEED_KMH / 3.6;
  const ratio = Math.min(1, (turn - GENTLE_CURVE_ANGLE) / (SHARP_CURVE_ANGLE - GENTLE_CURVE_ANGLE));
  return CRUISE - (CRUISE - sharp) * ratio;
}
