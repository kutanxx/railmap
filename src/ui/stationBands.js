// 가까이서 보이는 역 모양 계산: 승강장 띠 + 대합실.
// 승강장 띠는 놓은 선로 모양을 그대로 따라 휘고, 그 위에 더 넓은 대합실 덩어리가 붙는다.
// stationShapes.js처럼 게임 상태를 고치지 않고, 지금 역·선로·노선을 보고 그때그때 계산한다.
//
// 띠를 정하는 법
// - 노선이 지나는 역: 노선마다 "들어오는 선로 + 나가는 선로"로 띠 하나. 노선 끝이면 들어오는 선로만 (종착역)
//   두 노선이 같은 선로를 함께 쓰면 띠를 옆으로 나란히 놓는다
//   노선이 역에서 크게 꺾이면 (예: 북쪽에서 와서 동쪽으로) 띠를 ㄱ자로 꺾지 않고 들어오는 선로 쪽으로만 곧게 깐다.
//   그 선로에 이미 곧은 띠가 있으면 그 옆에 나란히 붙인다 (여러 노선이 모이는 역에서 띠끼리 겹치지 않게)
//   띠가 둘 이상이면(환승역) 역 자리에 큰 대합실을 하나 더 놓는다
// - 노선이 없는 역: 가장 곧게 이어지는 선로 두 개로 띠 하나. 선로가 하나면 종착역처럼
// - 선로가 없는 역: 정한 방향으로 곧은 띠
// 대합실은 역마다 정해진 무작위 값으로 자리와 크기를 조금씩 달리한다. 같은 역은 늘 같은 모양이다.
// 계산은 역을 원점으로 한 평면 좌표(미터, 동쪽 x·북쪽 y)에서 하고, 끝에 [경도, 위도]로 되돌린다.
import {
  PLATFORM_LENGTH_M,
  PLATFORM_WIDTH_M,
  CONCOURSE_LENGTH_M,
  CONCOURSE_WIDTH_M,
  STATION_SHAPE_VARIETY,
  TRANSFER_HALL_M,
  PARALLEL_PLATFORM_GAP_M,
} from '../config.js';
import { localProjection, inverseProjection } from '../map/population.js';

// 결과: Map(역 id → { parts: [{ kind: 'platform' | 'concourse', coords: [[경도, 위도], …], width: 폭(미터),
//                                group: 몇 번째 띠(노선 묶음)의 조각인지 }],
//                     headings: 띠마다 상행(노선의 앞 역 쪽) 방향, 나침반 각도(북쪽 0°, 시계 방향) })
// 띠는 먼저 만든 노선 순서로 놓는다 (0번 띠 = 이 역을 지나는 가장 오래된 노선). 출구 번호를 이 순서로 이어 매긴다
// stations: 화면에 보일 역들 (끌어서 옮기는 중이면 그 자리), shapes: stationShapes()의 결과 (방향)
export function stationBands(stations, tracks, routes, shapes) {
  const coordOf = new Map(stations.map((station) => [station.id, station.coord]));
  const result = new Map();
  for (const station of stations) {
    const angle = shapes.get(station.id)?.angle ?? station.angle;
    result.set(station.id, bandsFor(station, angle, tracks, routes, coordOf));
  }
  return result;
}

function bandsFor(station, angle, tracks, routes, coordOf) {
  const toMeters = localProjection(station.coord);
  const toLngLat = inverseProjection(station.coord);

  // 역에서 뻗어 나가는 선로("팔"): 선로 id → 역(원점)에서 바깥쪽으로 가는 점들 (미터)
  const arms = new Map();
  for (const track of tracks) {
    let coords;
    if (track.from === station.id) {
      coords = [station.coord, ...track.waypoints, coordOf.get(track.to)];
    } else if (track.to === station.id) {
      coords = [station.coord, ...[...track.waypoints].reverse(), coordOf.get(track.from)];
    } else continue;
    arms.set(track.id, coords.map(toMeters));
  }

  const random = seededRandom(station.id);
  const parts = [];
  const headings = [];
  const groups = platformGroups(station, arms, tracks, routes);
  if (groups.length === 0) {
    // 선로가 없는 역: 정한 방향(0 = 가로, 시계 방향)으로 곧게
    const radians = (angle * Math.PI) / 180;
    const half = PLATFORM_LENGTH_M / 2;
    const dx = Math.cos(radians) * half;
    const dy = -Math.sin(radians) * half; // 북쪽이 +y라서 시계 방향은 −
    addPlatform(parts, [[-dx, -dy], [dx, dy]], 1, 'through', random);
    headings.push(compassBearing([dx, dy]));
  }
  const directions = []; // 띠마다 역 자리에서의 방향 (환승역 큰 대합실을 돌릴 때 쓴다)
  groups.forEach((group, index) => {
    let points;
    let origin; // 띠 위에서 역이 있는 곳 (처음부터 몇 미터)
    if (group.armIds.length === 2) {
      // 지나가는 역: 한쪽 선로를 거꾸로 + 다른 쪽 선로. 역이 띠 가운데에 온다
      const back = sliceFrom(arms.get(group.armIds[0]), PLATFORM_LENGTH_M / 2).reverse();
      const ahead = sliceFrom(arms.get(group.armIds[1]), PLATFORM_LENGTH_M / 2);
      points = [...back, ...ahead.slice(1)];
      origin = lineLength(back);
    } else {
      // 종착역: 들어오는 선로를 따라 뒤로 깐다. 역은 띠 끝(처음)에 온다
      points = sliceFrom(arms.get(group.armIds[0]), PLATFORM_LENGTH_M);
      origin = 0;
    }
    const start = parts.length;
    addPlatform(parts, points, group.count, group.armIds.length === 2 ? 'through' : 'terminal', random);
    for (const part of parts.slice(start)) part.group = index;
    directions.push(directionAt(points, origin));
    // 상행: 앞 역 쪽 선로 방향. 노선의 첫 역이라 앞 역이 없으면 뒤 역 쪽의 반대
    const [x, y] = directionAt(arms.get(group.armIds[0]), 15);
    headings.push(compassBearing(group.up ? [x, y] : [-x, -y]));
  });
  if (groups.length >= 2) {
    // 환승역: 선로가 만나는 역 자리에 큰 대합실 (첫 띠 방향으로 놓은 정사각형)
    const [ux, uy] = directions[0];
    const half = TRANSFER_HALL_M / 2;
    parts.push({
      kind: 'concourse',
      width: TRANSFER_HALL_M,
      points: [[-ux * half, -uy * half], [ux * half, uy * half]],
      group: 0,
    });
  }

  return {
    parts: parts.map((part) => ({
      kind: part.kind,
      width: part.width,
      coords: part.points.map(toLngLat),
      group: part.group ?? 0,
    })),
    headings,
  };
}

// 띠 묶음 정하기. 결과: [{ armIds: [선로 id 1~2개], count: 이 띠를 함께 쓰는 노선 수,
//                         up: armIds[0]이 앞 역(상행) 쪽 선로인지 }] — 먼저 만든 노선의 띠가 앞에 온다
function platformGroups(station, arms, tracks, routes) {
  const between = (a, b) =>
    tracks.find((t) => (t.from === a && t.to === b) || (t.from === b && t.to === a));
  // 두 선로가 역에서 거의 반대 방향으로 뻗으면 곧게 지나가는 것 (사이 각도가 대략 135도보다 크면)
  const straight = (a, b) => {
    const [ax, ay] = directionAt(arms.get(a), 15);
    const [bx, by] = directionAt(arms.get(b), 15);
    return ax * bx + ay * by < STRAIGHT_DOT;
  };

  // 노선마다 이 역 앞뒤로 지나는 선로
  const byKey = new Map(); // "선로id+선로id" → { armIds, up, routeIds, oldest: 가장 먼저 만든 노선의 순번 }
  routes.forEach((route, routeIndex) => {
    route.stations.forEach((id, i) => {
      if (id !== station.id) return;
      const armOf = (other) => {
        const armId = other === undefined ? undefined : between(station.id, other)?.id;
        return arms.has(armId) ? armId : null;
      };
      const previous = armOf(route.stations[i - 1]);
      let armIds = [...new Set([previous, armOf(route.stations[i + 1])].filter(Boolean))];
      if (armIds.length === 0) return;
      // 크게 꺾여 지나가면 들어오는 선로 쪽 (첫 역이면 나가는 선로 쪽) 하나로만 곧게
      if (armIds.length === 2 && !straight(armIds[0], armIds[1])) armIds = [armIds[0]];
      // 같은 두 선로를 쓰면 지나는 방향이 달라도 같은 띠다
      const key = [...armIds].sort().join('+');
      const group = byKey.get(key) ?? { armIds, up: previous !== null, routeIds: new Set(), oldest: routeIndex };
      group.routeIds.add(route.id);
      byKey.set(key, group);
    });
  });
  // Y자 갈림: 두 곧은 띠가 선로 하나를 함께 쓰면 (같은 선로로 와서 역에서 갈라지면) 겹치므로,
  // 나중에 만든 노선은 먼저 만든 노선의 띠 옆에 나란히 붙인다 (실제 갈림 역도 갈라지기 전 쪽에 승강장이 나란하다)
  const throughs = [...byKey.entries()]
    .filter(([, group]) => group.armIds.length === 2)
    .sort((x, y) => x[1].oldest - y[1].oldest);
  const kept = [];
  for (const [key, group] of throughs) {
    const earlier = kept.find((other) => other.armIds.some((id) => group.armIds.includes(id)));
    if (!earlier) {
      kept.push(group);
      continue;
    }
    for (const id of group.routeIds) earlier.routeIds.add(id);
    byKey.delete(key);
  }
  // 선로 하나로만 까는 띠가 다른 곧은 띠와 같은 선로를 쓰면, 그 곧은 띠 옆에 나란히 붙인다 (겹치지 않게)
  for (const [key, group] of byKey) {
    if (group.armIds.length !== 1) continue;
    const through = [...byKey.values()].find((other) => other.armIds.length === 2 && other.armIds.includes(group.armIds[0]));
    if (!through) continue;
    for (const id of group.routeIds) through.routeIds.add(id);
    through.oldest = Math.min(through.oldest, group.oldest);
    byKey.delete(key);
  }
  if (byKey.size > 0) {
    // 노선 목록은 만든 순서대로라서, 순번이 작을수록 먼저 만든 노선이다
    return [...byKey.values()]
      .sort((a, b) => a.oldest - b.oldest)
      .map(({ armIds, up, routeIds }) => ({ armIds, up, count: routeIds.size }));
  }

  // 노선이 없으면: 선로가 하나면 그 하나, 여럿이면 가장 곧게 이어지는 두 개
  const ids = [...arms.keys()];
  if (ids.length <= 1) return ids.map((id) => ({ armIds: [id], up: true, count: 1 }));
  const outward = new Map(ids.map((id) => [id, directionAt(arms.get(id), 15)]));
  let best = null;
  let straightest = Infinity; // 두 방향이 반대일수록(곧을수록) 작다
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const [ax, ay] = outward.get(ids[i]);
      const [bx, by] = outward.get(ids[j]);
      const dot = ax * bx + ay * by;
      if (dot < straightest) {
        straightest = dot;
        best = [ids[i], ids[j]];
      }
    }
  }
  return [{ armIds: best, up: true, count: 1 }];
}

// 두 선로 방향의 내적이 이보다 작으면 (사이 각도가 약 135도보다 크면) 역을 곧게 지나가는 것으로 본다
const STRAIGHT_DOT = -0.7;

// 띠(points)에 승강장과 대합실을 붙인다
// count: 나란히 놓을 승강장 수, type: 'through'(지나가는 역) | 'terminal'(처음이 역인 종착역)
function addPlatform(parts, points, count, type, random) {
  const length = lineLength(points);
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * (PLATFORM_WIDTH_M + PARALLEL_PLATFORM_GAP_M);
    parts.push({
      kind: 'platform',
      width: PLATFORM_WIDTH_M,
      points: offset === 0 ? points : offsetLine(points, offset),
    });
  }

  // 대합실: 나란한 승강장을 모두 덮을 만큼은 넓게
  const platformsWidth = count * PLATFORM_WIDTH_M + (count - 1) * PARALLEL_PLATFORM_GAP_M;
  const size = 1 + (random() * 2 - 1) * STATION_SHAPE_VARIETY;
  const width = Math.max(CONCOURSE_WIDTH_M * size, platformsWidth + 12);
  const concourse = Math.min(CONCOURSE_LENGTH_M * size, length / 3);
  const add = (from, to, widthScale) =>
    parts.push({
      kind: 'concourse',
      width: width * widthScale,
      points: subLine(points, Math.max(0, from), Math.min(length, to)),
    });

  if (type === 'terminal') {
    // 종착역: 역 쪽 끝에 넓은 대합실, 반대쪽 끝에 작은 대합실
    add(0, concourse * 1.3, 1.1);
    add(length - concourse * 0.6, length, 0.85);
    return;
  }
  const variant = Math.floor(random() * 3);
  if (variant === 0) {
    // 양 끝에 같은 크기
    add(0, concourse, 1);
    add(length - concourse, length, 1);
  } else if (variant === 1) {
    // 한쪽 끝은 크게, 다른 쪽은 작게
    const startBig = random() < 0.5;
    add(0, concourse * (startBig ? 1.4 : 0.6), startBig ? 1.15 : 0.85);
    add(length - concourse * (startBig ? 0.6 : 1.4), length, startBig ? 0.85 : 1.15);
  } else {
    // 양 끝은 작게, 가운데에 하나 더
    add(0, concourse * 0.7, 0.9);
    add((length - concourse) / 2, (length + concourse) / 2, 1.05);
    add(length - concourse * 0.7, length, 0.9);
  }
}

// ── 선 계산 (평면 좌표, 미터) ───────────────

const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function lineLength(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += distance(points[i - 1], points[i]);
  return sum;
}

// 선의 처음부터 s미터 간 자리 (선보다 길면 끝점)
function pointAt(points, s) {
  let left = Math.max(0, s);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const d = distance(a, b);
    if (left <= d || i === points.length - 1) {
      const t = d === 0 ? 0 : Math.min(1, left / d);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    left -= d;
  }
  return points[0];
}

// 선에서 from~to미터 구간만 잘라낸다 (꺾인 점은 그대로 둔다)
function subLine(points, from, to) {
  const result = [pointAt(points, from)];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    walked += distance(points[i - 1], points[i]);
    if (walked > from && walked < to) result.push(points[i]);
  }
  result.push(pointAt(points, to));
  return result;
}

// 선의 처음부터 length미터까지
const sliceFrom = (points, length) => subLine(points, 0, length);

// 평면 방향(동쪽 x, 북쪽 y) → 나침반 각도 (북쪽 0°, 시계 방향, 0~360)
const compassBearing = ([x, y]) => ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;

// s미터 자리에서 선이 나아가는 방향 (길이 1)
function directionAt(points, s) {
  const total = lineLength(points);
  const a = pointAt(points, Math.max(0, s - 5));
  const b = pointAt(points, Math.min(total, s + 5));
  const d = distance(a, b) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
}

// 선을 옆으로 offset미터 옮긴다 (+면 나아가는 방향의 왼쪽). 꺾인 점에서는 앞뒤 방향의 가운데로 민다
function offsetLine(points, offset) {
  return points.map((point, i) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const d = distance(a, b) || 1;
    return [point[0] - ((b[1] - a[1]) / d) * offset, point[1] + ((b[0] - a[0]) / d) * offset];
  });
}

// 역 id로 늘 같은 순서의 무작위 수(0~1)를 만든다
function seededRandom(text) {
  let seed = 2166136261;
  for (const char of text) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
