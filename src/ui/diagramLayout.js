// 노선도 모양 계산 (그리지는 않는다. 그리기는 diagramView.js).
// 지하철 노선도처럼 역 사이 선이 가로·세로·45도로만 가게, 실제 위치를 바탕으로 역 자리를 조금씩 옮긴다.
// 1) 역을 미터 좌표로 바꾸고, 역 사이 거리의 가운데값이 1이 되게 줄인다
// 2) 여러 번 되풀이하며 고친다: 이웃한 두 역은 가까운 8방향(45도 단위)으로, 길이는 비슷하게 끌어당기고,
//    너무 가까운 역끼리, 자기가 서지 않는 선 위에 올라앉은 역은 밀어내고,
//    모든 역은 원래 자리 쪽으로 살짝 당긴다 (지리를 너무 잃지 않게. 끝으로 갈수록 약하게 해서 선이 반듯해진다)
// 3) 그래도 남는 비스듬함은 그릴 때 "곧게 → 45도 → 곧게" 세 토막으로 꺾어서 늘 8방향만 쓴다 (edgePoints)
// 역 50개면 되풀이 한 번에 역 쌍 1,200여 개를 보므로, 노선도를 열 때나 노선망이 바뀔 때만 계산한다.
import { DIAGRAM_ITERATIONS } from '../config.js';

// 이웃 역 사이 길이를 이 범위로 맞춘다 (1 = 보통 역 간격). 아주 먼 역은 조금만 길게, 아주 가까운 역은 조금만 짧게
const MIN_EDGE = 1;
const MAX_EDGE = 1.8;
// 역끼리 이보다 가까우면 밀어낸다
const MIN_GAP = 1.1;
// 역이 자기가 서지 않는 선에 이보다 가까우면 밀어낸다
const EDGE_GAP = 0.55;
// 원래 자리로 당기는 힘 (클수록 실제 지도와 비슷하고, 작을수록 반듯하다)
const ANCHOR = 0.04;

const OCTANT = Math.PI / 4;

// 미터 좌표로 바꾼다 (지도 가운데 근처에서는 경도·위도를 이렇게 펴도 충분하다)
function toMeters(coords) {
  const lat0 = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  // 화면은 아래로 갈수록 y가 크므로 위도를 뒤집는다
  return coords.map(([lng, lat]) => [lng * kx, -lat * ky]);
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

// 두 역을 잇는 선의 방향 중 가장 가까운 8방향
function snapAngle(dx, dy) {
  return Math.round(Math.atan2(dy, dx) / OCTANT) * OCTANT;
}

// stations: 노선이 지나는 역 [{ id, coord }], edges: 이웃한 역 쌍 [[역 id, 역 id], …]
// 결과: Map(역 id → [x, y]) (단위: 보통 역 간격 = 1)
export function diagramPositions(stations, edges) {
  const ids = stations.map((station) => station.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const meters = toMeters(stations.map((station) => station.coord));
  const pairs = edges.map(([a, b]) => [index.get(a), index.get(b)]);
  const scale =
    median(pairs.map(([a, b]) => Math.hypot(meters[b][0] - meters[a][0], meters[b][1] - meters[a][1]))) || 1;
  const home = meters.map(([x, y]) => [x / scale, y / scale]);
  const pos = home.map(([x, y]) => [x, y]);
  // 각 선의 바랄 길이: 원래 길이를 범위 안으로
  const wanted = pairs.map(([a, b]) =>
    Math.min(MAX_EDGE, Math.max(MIN_EDGE, Math.hypot(home[b][0] - home[a][0], home[b][1] - home[a][1]))),
  );
  const neighbors = new Set(pairs.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

  for (let round = 0; round < DIAGRAM_ITERATIONS; round++) {
    // 처음에는 크게, 끝으로 갈수록 작게 움직인다
    const step = 0.5 * (1 - round / DIAGRAM_ITERATIONS) + 0.05;
    const move = pos.map(() => [0, 0]);
    // 선: 가까운 8방향, 바랄 길이로
    pairs.forEach(([a, b], i) => {
      const dx = pos[b][0] - pos[a][0];
      const dy = pos[b][1] - pos[a][1];
      const angle = snapAngle(dx, dy);
      const tx = Math.cos(angle) * wanted[i];
      const ty = Math.sin(angle) * wanted[i];
      const fx = (tx - dx) / 2;
      const fy = (ty - dy) / 2;
      move[a][0] -= fx;
      move[a][1] -= fy;
      move[b][0] += fx;
      move[b][1] += fy;
    });
    // 너무 가까운 역끼리 밀어내기 (이웃 역은 위에서 길이를 맞추므로 뺀다)
    for (let a = 0; a < pos.length; a++) {
      for (let b = a + 1; b < pos.length; b++) {
        if (neighbors.has(`${a}|${b}`)) continue;
        const dx = pos[b][0] - pos[a][0];
        const dy = pos[b][1] - pos[a][1];
        const d = Math.hypot(dx, dy);
        if (d >= MIN_GAP) continue;
        // 완전히 겹치면 아무 쪽으로나 민다
        const [ux, uy] = d > 1e-6 ? [dx / d, dy / d] : [1, 0];
        const push = (MIN_GAP - d) / 2;
        move[a][0] -= ux * push;
        move[a][1] -= uy * push;
        move[b][0] += ux * push;
        move[b][1] += uy * push;
      }
    }
    // 자기가 서지 않는 선 위에 올라앉은 역은 선에서 밀어낸다 (선 두 끝은 반대로 조금)
    pairs.forEach(([a, b]) => {
      const ex = pos[b][0] - pos[a][0];
      const ey = pos[b][1] - pos[a][1];
      const length2 = ex * ex + ey * ey || 1;
      pos.forEach(([x, y], n) => {
        if (n === a || n === b) return;
        const t = Math.max(0, Math.min(1, ((x - pos[a][0]) * ex + (y - pos[a][1]) * ey) / length2));
        const dx = x - (pos[a][0] + ex * t);
        const dy = y - (pos[a][1] + ey * t);
        const d = Math.hypot(dx, dy);
        if (d >= EDGE_GAP) return;
        const [ux, uy] = d > 1e-6 ? [dx / d, dy / d] : [-ey / Math.sqrt(length2), ex / Math.sqrt(length2)];
        const push = EDGE_GAP - d;
        move[n][0] += ux * push;
        move[n][1] += uy * push;
        move[a][0] -= (ux * push) / 4;
        move[a][1] -= (uy * push) / 4;
        move[b][0] -= (ux * push) / 4;
        move[b][1] -= (uy * push) / 4;
      });
    });
    // 원래 자리 쪽으로 살짝 (끝으로 갈수록 약하게)
    const anchor = ANCHOR * (1 - round / DIAGRAM_ITERATIONS);
    pos.forEach(([x, y], i) => {
      move[i][0] += (home[i][0] - x) * anchor;
      move[i][1] += (home[i][1] - y) * anchor;
    });
    pos.forEach((p, i) => {
      p[0] += move[i][0] * step;
      p[1] += move[i][1] * step;
    });
  }
  return new Map(ids.map((id, i) => [id, pos[i]]));
}

// 두 점 사이를 8방향 토막으로 잇는 점들: 곧게 → 45도 → 곧게 (꺾임은 가운데에)
// 거의 곧은 선(조금만 비스듬함)은 꺾지 않고 그대로 잇는다
const NEARLY_STRAIGHT = 0.12;
export function edgePoints([ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const major = Math.max(adx, ady);
  const minor = Math.min(adx, ady);
  // 곧은 선, 딱 45도인 선, 거의 그런 선은 한 토막
  if (minor <= major * NEARLY_STRAIGHT || major - minor <= major * NEARLY_STRAIGHT) {
    return [
      [ax, ay],
      [bx, by],
    ];
  }
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  // 곧은 부분 길이를 반씩 앞뒤에
  const straight = (major - minor) / 2;
  const [hx, hy] = adx > ady ? [sx * straight, 0] : [0, sy * straight];
  return [
    [ax, ay],
    [ax + hx, ay + hy],
    [bx - hx, by - hy],
    [bx, by],
  ];
}

// 꺾인 선을 옆으로 offset만큼 민 선 (나란히 달리는 노선을 그릴 때). 꺾이는 곳은 두 토막의 바깥선이 만나는 점
export function offsetPolyline(points, offset) {
  if (offset === 0) return points;
  const normals = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    const d = Math.hypot(dx, dy) || 1;
    normals.push([-dy / d, dx / d]);
  }
  return points.map(([x, y], i) => {
    const before = normals[Math.max(0, i - 1)];
    const after = normals[Math.min(normals.length - 1, i)];
    let nx = before[0] + after[0];
    let ny = before[1] + after[1];
    const d = Math.hypot(nx, ny) || 1;
    nx /= d;
    ny /= d;
    // 꺾인 곳은 1 ÷ cos(꺾인 각의 절반)만큼 더 밀어야 두 토막이 같은 간격을 지킨다
    const stretch = 1 / Math.max(0.5, nx * after[0] + ny * after[1]);
    return [x + nx * offset * stretch, y + ny * offset * stretch];
  });
}
