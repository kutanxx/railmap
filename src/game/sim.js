// 시뮬레이션: 시간 흐름과 열차 이동.
// 열차는 노선 끝에서 끝까지 왕복하고, 역마다 STATION_DWELL_SECONDS 동안 멈춘다.
// 매 프레임 불리므로 계산을 가볍게 유지한다 (노선 모양은 미리 계산해 둔다).
import { distance } from '@turf/turf';
import { getState, routeCoords, routeTracks, trackLengthKm } from './state.js';
import { TRAIN_SPEED_KMH, STATION_DWELL_SECONDS, TRAIN_LENGTH_M } from '../config.js';

const SPEED_KM_PER_SECOND = TRAIN_SPEED_KMH / 3600;
const TRAIN_LENGTH_KM = TRAIN_LENGTH_M / 1000;
const EPSILON = 1e-9; // 아주 작은 거리. "역에 딱 서 있음"을 판단할 때 쓴다

// 노선 id → 미리 계산한 노선 모양
// { coords, cumulative: [각 점까지의 거리 km], length: 전체 km, stops: [각 역까지의 거리 km], color: 노선 색 }
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
      trains.push(...existing);
    } else {
      // 열차 수가 바뀌면 그 노선의 열차를 새로 고르게 배치한다
      trains.push(...placeTrains(route, path));
    }
  }
  state.trains = trains;
}

// 게임 시간 seconds초만큼 시간을 흘리고 열차를 움직인다
export function stepSimulation(seconds) {
  if (seconds <= 0) return;
  const state = getState();
  state.elapsedSeconds += seconds;
  for (const train of state.trains) {
    moveTrain(train, paths.get(train.routeId), seconds);
  }
}

// 지도에 그릴 열차 모양: 노선을 따라 휘는 짧은 선 (캡슐)
export function trainFeatures() {
  const features = [];
  for (const train of getState().trains) {
    const path = paths.get(train.routeId);
    const half = Math.min(TRAIN_LENGTH_KM, path.length) / 2;
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
  return {
    coords,
    cumulative,
    length: cumulative[cumulative.length - 1],
    stops,
    color: route.color,
  };
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
    });
  }
  return trains;
}

// 열차 하나를 seconds초만큼 움직인다. 역에 닿으면 멈추고, 끝 역에서는 방향을 바꾼다
function moveTrain(train, path, seconds) {
  let remaining = seconds;
  while (remaining > 0) {
    if (train.dwell > 0) {
      const waited = Math.min(train.dwell, remaining);
      train.dwell -= waited;
      remaining -= waited;
      continue;
    }

    const stop = nextStop(path.stops, train.distance, train.direction);
    const timeToStop = Math.abs(stop - train.distance) / SPEED_KM_PER_SECOND;
    if (timeToStop > remaining) {
      train.distance += train.direction * SPEED_KM_PER_SECOND * remaining;
      return;
    }

    // 역 도착
    train.distance = stop;
    remaining -= timeToStop;
    train.dwell = STATION_DWELL_SECONDS;
    const atEnd = stop <= EPSILON || stop >= path.length - EPSILON;
    if (atEnd) train.direction = stop <= EPSILON ? 1 : -1;
  }
}

// 지금 위치에서 가는 방향으로 다음 역의 거리
function nextStop(stops, position, direction) {
  if (direction > 0) {
    return stops.find((stop) => stop > position + EPSILON) ?? stops[stops.length - 1];
  }
  for (let i = stops.length - 1; i >= 0; i--) {
    if (stops[i] < position - EPSILON) return stops[i];
  }
  return stops[0];
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
