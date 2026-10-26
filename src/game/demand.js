// 승객 수요와 수입 계산 (중력 모델).
// 두 역 사이 월 수입 = DEMAND_FACTOR × (인구 A ÷ 1000) × (인구 B ÷ 1000) ÷ 소요 시간^DEMAND_TIME_POWER
// 소요 시간(분) = 처음 타는 열차 기다리는 시간 + 타고 가는 시간 (+ 갈아타기)
// 열차가 많을수록 기다리는 시간이 줄어서 수요가 늘어난다. 열차가 0대인 노선은 승객을 나르지 않는다.
// 상태가 바뀔 때만 다시 계산하고(updateEconomy), 매달 정산 때는 저장해 둔 값을 쓴다(getEconomy).
import { getState, routeTracks, trackLengthKm } from './state.js';
import { monthlyOpex } from './economy.js';
import {
  TRAIN_SPEED_KMH,
  STATION_DWELL_SECONDS,
  DEMAND_FACTOR,
  DEMAND_TIME_POWER,
  MIN_TRIP_MINUTES,
  TRANSFER_MINUTES,
} from '../config.js';

const DWELL_MINUTES = STATION_DWELL_SECONDS / 60;

// 마지막으로 계산한 결과
// { revenue, opex, net: 월 수입·운영비·수지(억), routeRevenue: Map(노선 id → 월 수입) }
let economy = { revenue: 0, opex: 0, net: 0, routeRevenue: new Map() };

export function getEconomy() {
  return economy;
}

// 노선망과 인구로 월 수입과 운영비를 다시 계산한다
export function updateEconomy() {
  const { stations, tracks, routes } = getState();
  const running = routes.filter((route) => route.trainCount > 0);
  const graph = buildGraph(running);
  const population = new Map(stations.map((s) => [s.id, s.population]));

  let revenue = 0;
  const routeRevenue = new Map(routes.map((route) => [route.id, 0]));
  const servedStations = [...new Set(running.flatMap((route) => route.stations))];

  for (const origin of servedStations) {
    const trips = shortestTrips(graph, origin);
    for (const [destination, trip] of trips) {
      // 같은 두 역을 두 번 세지 않도록 한 방향만 센다
      if (destination <= origin) continue;
      const minutes = Math.max(trip.minutes, MIN_TRIP_MINUTES);
      const pair =
        (DEMAND_FACTOR * (population.get(origin) / 1000) * (population.get(destination) / 1000)) /
        minutes ** DEMAND_TIME_POWER;
      revenue += pair;
      // 수입은 이 여행에서 탄 노선들이 똑같이 나눠 가진다
      for (const routeId of trip.routes) {
        routeRevenue.set(routeId, routeRevenue.get(routeId) + pair / trip.routes.size);
      }
    }
  }

  const trackKm = tracks.reduce((sum, track) => sum + trackLengthKm(track), 0);
  const trainCount = routes.reduce((sum, route) => sum + route.trainCount, 0);
  const opex = monthlyOpex(trackKm, trainCount);
  economy = { revenue, opex, net: revenue - opex, routeRevenue };
}

// ── 안쪽에서만 쓰는 계산 ──────────────────

// 노선 하나를 왕복하는 데 걸리는 시간 (분): 달리는 시간 + 역마다 서는 시간
function roundTripMinutes(route) {
  const km = routeTracks(route).reduce((sum, track) => sum + trackLengthKm(track), 0);
  return 2 * ((km / TRAIN_SPEED_KMH) * 60 + route.stations.length * DWELL_MINUTES);
}

// 길찾기용 그래프. 점 하나 = "어느 역에서 어느 노선을 타고 있음"
// { nodes: [{ station, route }], edges: Map(점 번호 → [{ to, minutes }]), boarding: Map(노선 id → 기다리는 시간) }
function buildGraph(routes) {
  const nodes = [];
  const index = new Map(); // "역|노선" → 점 번호
  const edges = new Map();
  const boarding = new Map();

  const nodeOf = (station, route) => {
    const key = `${station}|${route}`;
    if (!index.has(key)) {
      index.set(key, nodes.length);
      nodes.push({ station, route });
      edges.set(nodes.length - 1, []);
    }
    return index.get(key);
  };
  const connect = (a, b, minutes) => edges.get(a).push({ to: b, minutes });

  for (const route of routes) {
    // 평균 기다리는 시간 = 열차 간격의 절반
    boarding.set(route.id, roundTripMinutes(route) / route.trainCount / 2);
    // 이웃한 역 사이: 달리는 시간 + 다음 역에 서는 시간
    routeTracks(route).forEach((track, i) => {
      const minutes = (trackLengthKm(track) / TRAIN_SPEED_KMH) * 60 + DWELL_MINUTES;
      const a = nodeOf(route.stations[i], route.id);
      const b = nodeOf(route.stations[i + 1], route.id);
      connect(a, b, minutes);
      connect(b, a, minutes);
    });
  }

  // 같은 역에서 다른 노선으로 갈아타기: 걷는 시간 + 새 노선 기다리는 시간
  const byStation = new Map();
  nodes.forEach((node, i) => {
    if (!byStation.has(node.station)) byStation.set(node.station, []);
    byStation.get(node.station).push(i);
  });
  for (const group of byStation.values()) {
    for (const a of group) {
      for (const b of group) {
        if (a !== b) connect(a, b, TRANSFER_MINUTES + boarding.get(nodes[b].route));
      }
    }
  }

  return { nodes, edges, boarding, byStation };
}

// 출발역에서 갈 수 있는 모든 역까지 가장 빠른 여행
// 결과: Map(도착역 id → { minutes, routes: Set(탄 노선 id) })
function shortestTrips(graph, origin) {
  const { nodes, edges, boarding, byStation } = graph;
  const minutes = new Array(nodes.length).fill(Infinity);
  const previous = new Array(nodes.length).fill(-1);
  const done = new Array(nodes.length).fill(false);

  // 출발역에서 각 노선을 처음 탈 때는 그 노선을 기다린다
  for (const i of byStation.get(origin) ?? []) minutes[i] = boarding.get(nodes[i].route);

  // 다익스트라 (점이 많지 않아서 단순한 방법으로 충분하다)
  for (;;) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (!done[i] && minutes[i] < Infinity && (current < 0 || minutes[i] < minutes[current])) {
        current = i;
      }
    }
    if (current < 0) break;
    done[current] = true;
    for (const { to, minutes: cost } of edges.get(current)) {
      if (minutes[current] + cost < minutes[to]) {
        minutes[to] = minutes[current] + cost;
        previous[to] = current;
      }
    }
  }

  // 역마다 가장 빨리 도착하는 점을 고르고, 거꾸로 따라가며 탄 노선을 모은다
  const trips = new Map();
  for (const [station, group] of byStation) {
    if (station === origin) continue;
    let best = -1;
    for (const i of group) if (best < 0 || minutes[i] < minutes[best]) best = i;
    if (minutes[best] === Infinity) continue;
    const routes = new Set();
    for (let i = best; i >= 0; i = previous[i]) routes.add(nodes[i].route);
    trips.set(station, { minutes: minutes[best], routes });
  }
  return trips;
}
