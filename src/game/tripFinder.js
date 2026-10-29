// 길찾기: 노선망을 "어느 역에서 어느 노선을 타고 있음" 점들의 그래프로 만들고, 출발역에서 가장 빠른 여행을 찾는다.
// 승객 수요 계산(demand.js)이 쓴다. 선로 길이와 달리는 시간은 한 번 계산할 때마다 선로별로 기억해 둔다.
import { routeTracks, trackLengthKm, trackCoords } from './state.js';
import { buildRun } from './running.js';
import { kindOf, trainSpec, isExpress } from './routeKinds.js';
import { STATION_DWELL_SECONDS, TRANSFER_MINUTES, EXPRESS_FARE_MINUTES_PER_KM } from '../config.js';

const DWELL_MINUTES = STATION_DWELL_SECONDS / 60;

// 철도망이 바뀌면 다시 계산할 수 있게 기억해 둔 선로 길이·달리는 시간을 비운다 (demand.js의 updateEconomy가 맨 처음에 부른다)
export function clearTrackMemory() {
  runSeconds.clear();
  lengthKm.clear();
}

// 선로 길이 (km). 한 번 계산할 때마다 선로별로 기억해 둔다 (곡선 선로는 점이 많아 길이 재기가 느리다)
const lengthKm = new Map();
export function trackKm(track) {
  if (!lengthKm.has(track.id)) lengthKm.set(track.id, trackLengthKm(track));
  return lengthKm.get(track.id);
}

// 선로 하나를 역에서 역까지 달리는 데 걸리는 시간 (게임 초). 열차 종류(kind: 지하철·광역급행)마다 다르다.
// 한 번 계산할 때마다 "선로|종류"별로 기억해 둔다
const runSeconds = new Map();
export function trackRunSeconds(track, kind = 'subway') {
  const key = `${track.id}|${kindOf(kind)}`;
  if (!runSeconds.has(key)) runSeconds.set(key, buildRun(trackCoords(track), trainSpec(kind)).seconds);
  return runSeconds.get(key);
}

export const routeLengthKm = (route) => routeTracks(route).reduce((sum, track) => sum + trackKm(track), 0);

// 노선 하나를 왕복하는 데 걸리는 시간 (분): 달리는 시간 × 2 + 역에 서는 시간
// (가운데 역은 오가며 두 번, 끝 역은 한 번 선다. sim.js의 배차 간격과 같은 계산)
export function roundTripMinutes(route) {
  const running = routeTracks(route).reduce((sum, track) => sum + trackRunSeconds(track, kindOf(route)), 0) / 60;
  return 2 * running + (2 * route.stations.length - 2) * DWELL_MINUTES;
}

// 길찾기용 그래프. 점 하나 = "어느 역에서 어느 노선을 타고 있음"
// 노선은 id 대신 routes 안의 순서 번호(노선 번호)로 적는다
// { nodes: [{ station, route: 노선 번호 }], edges: Map(점 번호 → [{ to, minutes, km, segment }]),
//   boarding: Map(점 번호 → 그 역에서 그 노선을 타려고 기다리는 시간(분)),
//   segments: 구간 번호 → { route: 노선 번호, pair: 짝 번호, km } (노선의 이웃한 두 역 사이, 오가는 방향은 같은 구간),
//   segmentIndex: Map(segmentKey "노선 id|역|역" → 구간 번호),
//   pairSharers: 짝 번호 → [{ route: 노선 번호, weight, segment }] (같은 두 역 사이를 다니는 노선들과 열차 수 비례 몫, weight 합 1) }
// 승객을 노선들에 나눌 때(demand.js) 글자 이름 대신 번호로 찾는다 (역 300곳이면 승객 쌍이 5만 개라 글자로 찾으면 느렸다)
// 기다리는 시간 = 열차 간격의 절반. 같은 구간을 함께 다니는 노선들이 있으면 (같은 선로를 쓰는 노선들)
// 그 노선들의 열차를 모두 탈 수 있으므로 열차가 더 자주 오는 것으로 친다 (합친 간격 = 1 ÷ 노선마다 1/간격의 합)
export function buildGraph(routes) {
  const nodes = [];
  const index = new Map(); // "역|노선" → 점 번호
  const edges = new Map();
  const boarding = new Map();
  const headway = new Map(routes.map((route) => [route.id, roundTripMinutes(route) / route.trainCount]));
  // 이웃한 두 역 사이("역|역") → 그 사이를 다니는 노선들
  const pairRoutes = new Map();
  for (const route of routes) {
    for (let i = 0; i + 1 < route.stations.length; i++) {
      const pair = [route.stations[i], route.stations[i + 1]].sort().join('|');
      if (!pairRoutes.has(pair)) pairRoutes.set(pair, new Set());
      pairRoutes.get(pair).add(route.id);
    }
  }
  // 역 station에서 노선 route를 탈 때 기다리는 시간: 그 역 앞뒤 구간을 함께 다니는 노선들의 열차를 모두 친다
  const waitAt = (route, i) => {
    const sharing = new Set([route.id]);
    for (const other of [route.stations[i - 1], route.stations[i + 1]]) {
      if (other === undefined) continue;
      const pair = [route.stations[i], other].sort().join('|');
      for (const id of pairRoutes.get(pair) ?? []) sharing.add(id);
    }
    const perMinute = [...sharing].reduce((sum, id) => sum + 1 / headway.get(id), 0);
    return 1 / perMinute / 2;
  };

  const nodeOf = (station, route) => {
    const key = `${station}|${route}`;
    if (!index.has(key)) {
      index.set(key, nodes.length);
      nodes.push({ station, route });
      edges.set(nodes.length - 1, []);
    }
    return index.get(key);
  };
  // segment: 노선의 구간 번호 (갈아타기는 -1)
  const connect = (a, b, minutes, km, segment = -1) => edges.get(a).push({ to: b, minutes, km, segment });

  // 구간과 짝(두 역)에 번호를 붙인다
  const segments = [];
  const segmentIndex = new Map();
  const pairIndex = new Map();
  const pairTrains = []; // 짝 번호 → Map(노선 번호 → 열차 수)
  const segmentOf = (route, r, a, b) => {
    const key = segmentKey(route.id, a, b);
    if (!segmentIndex.has(key)) {
      const pairKey = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (!pairIndex.has(pairKey)) {
        pairIndex.set(pairKey, pairTrains.length);
        pairTrains.push(new Map());
      }
      const pair = pairIndex.get(pairKey);
      pairTrains[pair].set(r, route.trainCount);
      segmentIndex.set(key, segments.length);
      segments.push({ route: r, pair, km: 0 });
    }
    return segmentIndex.get(key);
  };

  routes.forEach((route, r) => {
    route.stations.forEach((station, i) => {
      const node = nodeOf(station, r);
      boarding.set(node, Math.min(boarding.get(node) ?? Infinity, waitAt(route, i)));
    });
    // 이웃한 역 사이: 달리는 시간 + 다음 역에 서는 시간, 탄 거리는 선로 길이
    routeTracks(route).forEach((track, i) => {
      const km = trackKm(track);
      // 광역급행은 비싼 요금을 탄 거리만큼 시간처럼 더 친다 (EXPRESS_FARE_MINUTES_PER_KM)
      const fareMinutes = isExpress(route) ? km * EXPRESS_FARE_MINUTES_PER_KM : 0;
      const minutes = trackRunSeconds(track, kindOf(route)) / 60 + DWELL_MINUTES + fareMinutes;
      const a = nodeOf(route.stations[i], r);
      const b = nodeOf(route.stations[i + 1], r);
      const segment = segmentOf(route, r, route.stations[i], route.stations[i + 1]);
      segments[segment].km = km;
      connect(a, b, minutes, km, segment);
      connect(b, a, minutes, km, segment);
    });
  });
  // 짝마다 함께 다니는 노선들의 몫 (열차 수 비례)
  const segmentOfRoutePair = new Map(segments.map((s, i) => [`${s.route}#${s.pair}`, i]));
  const pairSharers = pairTrains.map((trains, pair) => {
    const total = [...trains.values()].reduce((sum, count) => sum + count, 0);
    return [...trains].map(([route, count]) => ({
      route,
      weight: count / total,
      segment: segmentOfRoutePair.get(`${route}#${pair}`),
    }));
  });

  // 같은 역에서 다른 노선으로 갈아타기: 걷는 시간 + 새 노선 기다리는 시간
  const byStation = new Map();
  nodes.forEach((node, i) => {
    if (!byStation.has(node.station)) byStation.set(node.station, []);
    byStation.get(node.station).push(i);
  });
  for (const group of byStation.values()) {
    for (const a of group) {
      for (const b of group) {
        if (a !== b) connect(a, b, TRANSFER_MINUTES + boarding.get(b), 0);
      }
    }
  }

  return { nodes, edges, boarding, byStation, segments, segmentIndex, pairSharers };
}

// 노선의 이웃한 두 역 사이 구간 이름. 오가는 방향을 같은 구간으로 친다
export function segmentKey(routeId, a, b) {
  return a < b ? `${routeId}|${a}|${b}` : `${routeId}|${b}|${a}`;
}

// 출발역에서 갈 수 있는 역까지 가장 빠른 여행. 같은 두 역을 두 번 세지 않게, 이름이 출발역보다 뒤인 역만 돌려준다
// 결과: [{ destination: 도착역 id, minutes, km: 탄 거리,
//          routes: 탄 노선 번호들, routeKm: 그 노선마다 탄 거리 (routes와 같은 순서),
//          segments: 지나는 구간 번호들 (graph.segments의 번호, 도착역에서 거꾸로) }]
export function shortestTrips(graph, origin) {
  const { nodes, edges, boarding, byStation } = graph;
  const minutes = new Array(nodes.length).fill(Infinity);
  const km = new Array(nodes.length).fill(0);
  const previous = new Array(nodes.length).fill(-1);
  const previousSegment = new Array(nodes.length).fill(-1); // 앞 점에서 올 때 지난 구간 번호 (갈아타기는 -1)
  const done = new Array(nodes.length).fill(false);

  // 다익스트라: 아직 끝나지 않은 점 중 가장 빨리 닿는 점부터 (같으면 번호가 작은 점부터) 차례로 넓혀 간다.
  // 그 점을 고르는 데 "가장 작은 것부터 꺼내 주는 줄(우선순위 큐)"을 쓴다. 점마다 다 훑으면 역 300곳에서 느렸다
  const queue = new MinQueue();
  // 출발역에서 각 노선을 처음 탈 때는 그 노선을 기다린다
  for (const i of byStation.get(origin) ?? []) {
    minutes[i] = boarding.get(i);
    queue.push(minutes[i], i);
  }
  while (queue.size > 0) {
    const current = queue.pop();
    // 더 빠른 길이 나중에 들어와 이미 끝난 점이면 건너뛴다 (줄에 같은 점이 여러 번 들어갈 수 있다)
    if (done[current]) continue;
    done[current] = true;
    for (const { to, minutes: cost, km: distance, segment } of edges.get(current)) {
      if (minutes[current] + cost < minutes[to]) {
        minutes[to] = minutes[current] + cost;
        km[to] = km[current] + distance;
        previous[to] = current;
        previousSegment[to] = segment;
        queue.push(minutes[to], to);
      }
    }
  }

  // 역마다 가장 빨리 도착하는 점을 고르고, 거꾸로 따라가며 탄 노선을 모은다
  const trips = [];
  for (const [station, group] of byStation) {
    if (station <= origin) continue;
    let best = -1;
    for (const i of group) if (best < 0 || minutes[i] < minutes[best]) best = i;
    if (minutes[best] === Infinity) continue;
    // 거꾸로 따라가며 노선마다 탄 거리를 더한다 (갈아타기는 거리 0)
    const routes = [];
    const routeKm = [];
    const segments = [];
    for (let i = best; i >= 0; i = previous[i]) {
      const before = previous[i] >= 0 ? km[previous[i]] : 0;
      let at = routes.indexOf(nodes[i].route);
      if (at < 0) {
        at = routes.push(nodes[i].route) - 1;
        routeKm.push(0);
      }
      routeKm[at] += km[i] - before;
      // 같은 노선의 두 역 사이를 달린 것이면 그 구간을 적는다 (갈아타기는 빼고)
      if (previousSegment[i] >= 0) segments.push(previousSegment[i]);
    }
    trips.push({ destination: station, minutes: minutes[best], km: km[best], routes, routeKm, segments });
  }
  return trips;
}

// 가장 작은 값부터 꺼내 주는 줄 (이진 힙). 값이 같으면 번호가 작은 것부터 (예전 방식과 같은 순서라 결과가 같다)
class MinQueue {
  constructor() {
    this.keys = [];
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  // a가 b보다 먼저 나와야 하는지
  before(a, b) {
    return this.keys[a] < this.keys[b] || (this.keys[a] === this.keys[b] && this.items[a] < this.items[b]);
  }

  swap(a, b) {
    const key = this.keys[a];
    this.keys[a] = this.keys[b];
    this.keys[b] = key;
    const item = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = item;
  }

  push(key, item) {
    this.keys.push(key);
    this.items.push(item);
    for (let i = this.items.length - 1; i > 0; ) {
      const parent = (i - 1) >> 1;
      if (!this.before(i, parent)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  // 가장 작은 것을 꺼낸다
  pop() {
    const top = this.items[0];
    const lastKey = this.keys.pop();
    const lastItem = this.items.pop();
    if (this.items.length > 0) {
      this.keys[0] = lastKey;
      this.items[0] = lastItem;
      for (let i = 0; ; ) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < this.items.length && this.before(left, smallest)) smallest = left;
        if (right < this.items.length && this.before(right, smallest)) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }
}
