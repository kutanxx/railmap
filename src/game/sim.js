// 시뮬레이션: 시간 흐름, 열차 이동, 매달 정산.
// 열차는 노선 끝에서 끝까지 왕복하고, 역마다 STATION_DWELL_SECONDS 동안 멈춘다.
// 역 사이는 출발 가속 → 최고 속도 → 꺾이는 곳 감속 → 도착 감속으로 달린다 (running.js).
// 종점에서는 앞 열차가 떠난 뒤 배차 간격(왕복 시간 ÷ 열차 수)이 지나야 출발해서, 열차가 몰려 다니지 않는다.
// 매 프레임 불리므로 계산을 가볍게 유지한다 (노선 모양과 구간별 달리는 모습은 미리 계산해 둔다).
import { distance } from '@turf/turf';
import { getState, routeCoords, routeTracks, trackLengthKm, settleMonth } from './state.js';
import { getEconomy } from './demand.js';
import { buildRun } from './running.js';
import { STATION_DWELL_SECONDS, TIME_SCALE, SECONDS_PER_MONTH } from '../config.js';
const EPSILON = 1e-6; // 아주 작은 거리(km). "역에 딱 서 있음"을 판단할 때 쓴다
// 배차 간격을 이 비율만큼만 지나도 출발한다 (열차가 한 대일 때 계산 오차로 괜히 기다리지 않게)
const HOLD_TOLERANCE = 0.95;

// 노선 id → 미리 계산한 노선 모양
// { coords, cumulative: [각 점까지의 거리 km], length: 전체 km, stops: [각 역까지의 거리 km], color: 노선 색,
//   runs: [역 사이 구간마다 달리는 모습 (running.js)], headway: 배차 간격(게임 초),
//   departures: [첫 역, 끝 역]에서 마지막으로 열차가 떠난 게임 시각 }
const paths = new Map();

// 노선이 바뀌었을 때 (만들기, 지우기, 열차 수 바꾸기) 불러서 열차를 노선에 맞춘다
export function syncTrains() {
  const state = getState();
  paths.clear();
  const trains = [];

  for (const route of state.routes) {
    const path = buildPath(route);
    paths.set(route.id, path);

    const existing = state.trains.filter((train) => train.routeId === route.id);
    if (existing.length === route.trainCount) {
      // 노선 모양이 바뀌었을 수 있으니 (되돌리기, 경유점 옮기기) 열차가 노선 밖에 있지 않게 당기고,
      // 달리던 구간은 지금 자리에서 다시 찾는다
      for (const train of existing) {
        train.distance = Math.min(train.distance, path.length);
        train.leg = null;
      }
      trains.push(...existing);
    } else {
      // 열차 수가 바뀌면 그 노선의 열차를 새로 고르게 배치한다
      trains.push(...placeTrains(route, path));
    }
  }
  state.trains = trains;
}

// 시간을 흘린다. seconds = 실제 흐른 초 × 배속
// - 열차는 TIME_SCALE배 빠른 게임 시간으로 움직인다 (1배에서 실제 1초 = 게임 TIME_SCALE초)
// - 달력은 SECONDS_PER_MONTH초마다 한 달씩 넘어가고, 넘어갈 때 정산한다
export function stepSimulation(seconds) {
  if (seconds <= 0) return;
  const state = getState();
  const gameSeconds = seconds * TIME_SCALE;
  const startTime = state.elapsedSeconds;
  state.elapsedSeconds += gameSeconds;
  for (const train of state.trains) {
    moveTrain(train, paths.get(train.routeId), gameSeconds, startTime);
  }

  state.monthProgress += seconds / SECONDS_PER_MONTH;
  while (state.monthProgress >= 1) {
    state.monthProgress -= 1;
    const { revenue, opex } = getEconomy();
    settleMonth(revenue, opex);
  }
}

// 지도에 그릴 열차 모양: 노선을 따라 휘는 짧은 선 (캡슐)
// lengthKm: 그릴 열차 길이 (멀리서 볼 때는 화면에서 보이게 실제보다 길게 넘겨준다, ui/animation.js)
export function trainFeatures(lengthKm) {
  const features = [];
  for (const train of getState().trains) {
    const path = paths.get(train.routeId);
    const half = Math.min(lengthKm, path.length) / 2;
    // 열차가 노선 끝을 넘어가 보이지 않게 가운데 위치를 안쪽으로 당긴다
    const center = Math.max(half, Math.min(path.length - half, train.distance));
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: slicePath(path, center - half, center + half) },
      properties: { id: train.id, routeColor: path.color },
    });
  }
  return features;
}

// ── 안쪽에서만 쓰는 계산 ──────────────────

function buildPath(route) {
  const coords = routeCoords(route);
  const cumulative = [0];
  for (let i = 1; i < coords.length; i++) {
    cumulative.push(cumulative[i - 1] + distance(coords[i - 1], coords[i]));
  }
  // 역 위치 = 앞 구간 선로 길이를 차례로 더한 값
  const stops = [0];
  for (const track of routeTracks(route)) {
    stops.push(stops[stops.length - 1] + trackLengthKm(track));
  }
  const path = { coords, cumulative, length: cumulative[cumulative.length - 1], stops, color: route.color };
  // 역 사이 구간마다 달리는 모습
  path.runs = stops.slice(1).map((end, i) => buildRun(slicePath(path, stops[i], end)));
  // 왕복 한 바퀴 = 달리는 시간 × 2 + 역에 서는 시간 (가운데 역은 오가며 두 번, 끝 역은 한 번)
  const runSeconds = path.runs.reduce((sum, run) => sum + run.seconds, 0);
  const roundTrip = 2 * runSeconds + (2 * stops.length - 2) * STATION_DWELL_SECONDS;
  path.headway = route.trainCount > 0 ? roundTrip / route.trainCount : 0;
  path.departures = [-Infinity, -Infinity];
  return path;
}

// 노선의 열차를 왕복 한 바퀴 위에 같은 간격으로 놓는다
function placeTrains(route, path) {
  const trains = [];
  const roundTrip = path.length * 2;
  for (let i = 0; i < route.trainCount; i++) {
    const position = (roundTrip * i) / route.trainCount;
    const goingForward = position <= path.length;
    trains.push({
      id: `${route.id}-${i + 1}`,
      routeId: route.id,
      distance: goingForward ? position : roundTrip - position,
      direction: goingForward ? 1 : -1,
      dwell: position === 0 ? STATION_DWELL_SECONDS : 0,
      leg: null, // 달리는 중인 구간 번호 (역에 서 있으면 null)
      legTime: 0, // 그 구간에서 출발한 뒤 흐른 게임 초
    });
  }
  return trains;
}

// 열차 하나를 seconds초만큼 움직인다. 역에 닿으면 멈추고, 끝 역에서는 방향을 바꾼다
// startTime: 이번 움직임이 시작된 게임 시각 (종점에서 배차 간격을 잴 때 쓴다)
function moveTrain(train, path, seconds, startTime) {
  const last = path.stops.length - 1;
  let remaining = seconds;
  while (remaining > 0) {
    if (train.dwell > 0) {
      const waited = Math.min(train.dwell, remaining);
      train.dwell -= waited;
      remaining -= waited;
      continue;
    }

    if (train.leg === null) {
      const stop = stopIndexAt(path.stops, train.distance);
      if (stop < 0) {
        // 역 사이에 있는데 구간을 모른다 (막 배치했거나 노선이 바뀜): 지금 자리에서 이어 달린다
        resumeLeg(train, path);
      } else {
        // 종점에서는 앞 열차가 떠난 뒤 배차 간격이 지나야 출발한다
        const terminal = stop === 0 ? 0 : stop === last ? 1 : -1;
        if (terminal >= 0 && path.headway > 0) {
          const now = startTime + (seconds - remaining);
          const wait = path.departures[terminal] + path.headway * HOLD_TOLERANCE - now;
          if (wait > 0) {
            remaining -= Math.min(wait, remaining);
            continue;
          }
          path.departures[terminal] = now;
        }
        train.leg = train.direction > 0 ? stop : stop - 1;
        train.legTime = 0;
      }
    }

    const run = path.runs[train.leg];
    const left = run.seconds - train.legTime;
    if (left > remaining) {
      train.legTime += remaining;
      train.distance = legPosition(path, train);
      return;
    }

    // 역 도착
    remaining -= left;
    const stop = train.direction > 0 ? train.leg + 1 : train.leg;
    train.distance = path.stops[stop];
    train.leg = null;
    train.legTime = 0;
    train.dwell = STATION_DWELL_SECONDS;
    if (stop === 0) train.direction = 1;
    if (stop === last) train.direction = -1;
  }
}

// 역에 딱 서 있으면 그 역 번호, 아니면 −1
function stopIndexAt(stops, position) {
  return stops.findIndex((stop) => Math.abs(stop - position) < EPSILON);
}

// 구간에서 출발한 뒤 흐른 시간으로 노선 위 거리를 구한다.
// 가속과 감속이 같아서, 거꾸로 달릴 때는 앞으로 달리는 모습을 시간만 뒤집어 쓴다
function legPosition(path, train) {
  const run = path.runs[train.leg];
  const start = path.stops[train.leg];
  const scale = run.km > 0 ? (path.stops[train.leg + 1] - start) / run.km : 0;
  const time = train.direction > 0 ? train.legTime : run.seconds - train.legTime;
  return start + run.positionAt(time) * scale;
}

// 역 사이에 있는 열차가 어느 구간을 얼마나 달렸는지 지금 자리로 찾는다
function resumeLeg(train, path) {
  let leg = path.stops.findIndex((stop, i) => i < path.stops.length - 1 && train.distance < path.stops[i + 1]);
  if (leg < 0) leg = path.stops.length - 2;
  const run = path.runs[leg];
  const start = path.stops[leg];
  const scale = run.km > 0 ? (path.stops[leg + 1] - start) / run.km : 0;
  const forwardTime = run.timeAt(scale > 0 ? (train.distance - start) / scale : 0);
  train.leg = leg;
  train.legTime = train.direction > 0 ? forwardTime : run.seconds - forwardTime;
}

// 노선 위 from km ~ to km 구간의 좌표들
function slicePath(path, from, to) {
  const coords = [pointAt(path, from)];
  for (let i = 0; i < path.coords.length; i++) {
    if (path.cumulative[i] > from && path.cumulative[i] < to) coords.push(path.coords[i]);
  }
  coords.push(pointAt(path, to));
  return coords;
}

// 노선 위 d km 지점의 좌표 (가까운 두 점 사이를 비례로 나눈다)
function pointAt(path, d) {
  const { coords, cumulative } = path;
  for (let i = 1; i < coords.length; i++) {
    if (d <= cumulative[i]) {
      const segment = cumulative[i] - cumulative[i - 1];
      const t = segment > 0 ? (d - cumulative[i - 1]) / segment : 0;
      const [x1, y1] = coords[i - 1];
      const [x2, y2] = coords[i];
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    }
  }
  return coords[coords.length - 1];
}
