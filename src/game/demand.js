// 승객 수요와 수입 계산 (중력 모델).
// 두 역 사이 하루 승객 = RIDERS_FACTOR × (인구 A ÷ 1000) × (인구 B ÷ 1000) ÷ 소요 시간^DEMAND_TIME_POWER
// 월 수입 = 하루 승객 × 거리 요금(fareWon) × 한 달 날수
// 소요 시간(분) = 처음 타는 열차 기다리는 시간 + 타고 가는 시간 (+ 갈아타기)
// 열차가 많을수록 기다리는 시간이 줄어서 수요가 늘어난다. 열차가 0대인 노선은 승객을 나르지 않는다.
// 정원: 가장 붐비는 한 시간(출퇴근)에 노선이 나를 수 있는 양(열차 × 운행 횟수 × 정원 × 노선 길이)보다
//       그 시간에 타려는 양(승객 × 그 노선에서 탄 거리 × PEAK_HOUR_SHARE)이 많으면
//       혼잡도가 100%를 넘고, 넘친 만큼 승객을 놓친다.
// 상태가 바뀔 때만 다시 계산하고(updateEconomy), 매달 정산 때는 저장해 둔 값을 쓴다(getEconomy).
import { getState, routeTracks, trackLengthKm } from './state.js';
import { monthlyOpex, fareWon } from './economy.js';
import { sharedPopulations } from './catchment.js';
import {
  TRAIN_SPEED_KMH,
  STATION_DWELL_SECONDS,
  RIDERS_FACTOR,
  DEMAND_TIME_POWER,
  DAYS_PER_MONTH,
  MIN_TRIP_MINUTES,
  TRANSFER_MINUTES,
  TRAIN_CAPACITY,
  PEAK_HOUR_SHARE,
} from '../config.js';

const DWELL_MINUTES = STATION_DWELL_SECONDS / 60;
const WON_PER_EOK = 100000000; // 1억 원

// 마지막으로 계산한 결과
// { revenue, opex, net: 월 수입·운영비·수지(억),
//   dailyRiders: 하루 승객 전체(명),
//   routeRevenue / routeRiders / routeAvgKm: Map(노선 id → 월 수입 / 하루 승객 / 평균 탄 거리 km),
//   routeLoad: Map(노선 id → 혼잡도, 1 = 100%), routeLost: Map(노선 id → 자리가 없어 놓친 하루 승객),
//   stationRiders: Map(역 id → 하루 이용객 = 그 역에서 타고 내린 사람),
//   stationPopulation: Map(역 id → 이웃 역과 나눈 뒤의 인구) }
let economy = {
  revenue: 0,
  opex: 0,
  net: 0,
  dailyRiders: 0,
  routeRevenue: new Map(),
  routeRiders: new Map(),
  routeAvgKm: new Map(),
  routeLoad: new Map(),
  routeLost: new Map(),
  stationRiders: new Map(),
  stationPopulation: new Map(),
};

export function getEconomy() {
  return economy;
}

// 노선망과 인구로 월 수입과 운영비를 다시 계산한다
export function updateEconomy() {
  const { stations, tracks, routes } = getState();
  const running = routes.filter((route) => route.trainCount > 0);
  const graph = buildGraph(running);
  // 가까이 붙은 역끼리는 겹치는 건물을 나눠 가진다
  const population = sharedPopulations(stations);

  const zeros = (items) => new Map(items.map((item) => [item.id, 0]));
  const servedStations = [...new Set(running.flatMap((route) => route.stations))];

  // 1) 타려는 승객: 두 역 사이마다 { origin, destination, riders, km, routeKm }
  const journeys = [];
  const wantedKm = zeros(routes); // 노선별 (타려는 승객 × 그 노선에서 탈 거리) 합
  for (const origin of servedStations) {
    for (const [destination, trip] of shortestTrips(graph, origin)) {
      // 같은 두 역을 두 번 세지 않도록 한 방향만 센다 (riders에 오가는 사람이 모두 들어 있다)
      if (destination <= origin) continue;
      const minutes = Math.max(trip.minutes, MIN_TRIP_MINUTES);
      const riders =
        (RIDERS_FACTOR * (population.get(origin) / 1000) * (population.get(destination) / 1000)) /
        minutes ** DEMAND_TIME_POWER;
      journeys.push({ origin, destination, riders, km: trip.km, routeKm: trip.routeKm });
      for (const [routeId, km] of trip.routeKm) {
        wantedKm.set(routeId, wantedKm.get(routeId) + riders * km);
      }
    }
  }

  // 혼잡도 = 가장 붐비는 한 시간에 타려는 양 ÷ 그 한 시간에 나를 수 있는 양
  const routeLoad = zeros(routes);
  for (const route of running) {
    routeLoad.set(route.id, (wantedKm.get(route.id) * PEAK_HOUR_SHARE) / hourlyCapacityKm(route));
  }

  // 2) 실제로 탄 승객: 지나는 노선 중 가장 붐비는 노선이 100%를 넘으면 그만큼 못 탄다
  let revenue = 0;
  let dailyRiders = 0;
  const routeRevenue = zeros(routes);
  const routeRiders = zeros(routes);
  const routeLost = zeros(routes);
  const routeKm = zeros(routes); // 노선별 (승객 × 그 노선에서 탄 거리) 합. 평균 거리를 구할 때 쓴다
  const stationRiders = zeros(stations);
  for (const { origin, destination, riders: wanted, km, routeKm: kmByRoute } of journeys) {
    const worstLoad = Math.max(1, ...[...kmByRoute.keys()].map((id) => routeLoad.get(id)));
    const riders = wanted / worstLoad;
    const monthly = (riders * fareWon(km) * DAYS_PER_MONTH) / WON_PER_EOK;
    revenue += monthly;
    dailyRiders += riders;
    // 두 역 모두 이 승객들이 타고 내린다
    stationRiders.set(origin, stationRiders.get(origin) + riders);
    stationRiders.set(destination, stationRiders.get(destination) + riders);
    // 이 여행에서 탄 노선들: 승객은 모두에게 세고, 수입은 똑같이 나눠 가진다
    for (const [routeId, routeDistance] of kmByRoute) {
      routeRevenue.set(routeId, routeRevenue.get(routeId) + monthly / kmByRoute.size);
      routeRiders.set(routeId, routeRiders.get(routeId) + riders);
      routeLost.set(routeId, routeLost.get(routeId) + (wanted - riders));
      routeKm.set(routeId, routeKm.get(routeId) + riders * routeDistance);
    }
  }

  const routeAvgKm = new Map();
  for (const [id, riders] of routeRiders) {
    routeAvgKm.set(id, riders > 0 ? routeKm.get(id) / riders : 0);
  }

  const trackKm = tracks.reduce((sum, track) => sum + trackLengthKm(track), 0);
  const trainCount = routes.reduce((sum, route) => sum + route.trainCount, 0);
  const opex = monthlyOpex(stations.length, trackKm, trainCount);
  economy = {
    revenue,
    opex,
    net: revenue - opex,
    dailyRiders,
    routeRevenue,
    routeRiders,
    routeAvgKm,
    routeLoad,
    routeLost,
    stationRiders,
    stationPopulation: population,
  };
}

// ── 안쪽에서만 쓰는 계산 ──────────────────

// 노선 하나를 왕복하는 데 걸리는 시간 (분): 달리는 시간 + 역마다 서는 시간
function roundTripMinutes(route) {
  const km = routeTracks(route).reduce((sum, track) => sum + trackLengthKm(track), 0);
  return 2 * ((km / TRAIN_SPEED_KMH) * 60 + route.stations.length * DWELL_MINUTES);
}

// 노선이 한 시간에 나를 수 있는 양 (사람 × km)
// = 열차 대수 × 열차 한 대의 한 시간 편도 운행 횟수 × 정원 × 노선 길이
function hourlyCapacityKm(route) {
  const km = routeTracks(route).reduce((sum, track) => sum + trackLengthKm(track), 0);
  const oneWayRunsPerTrain = (60 / roundTripMinutes(route)) * 2;
  return route.trainCount * oneWayRunsPerTrain * TRAIN_CAPACITY * km;
}

// 길찾기용 그래프. 점 하나 = "어느 역에서 어느 노선을 타고 있음"
// { nodes: [{ station, route }], edges: Map(점 번호 → [{ to, minutes, km }]), boarding: Map(노선 id → 기다리는 시간) }
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
  const connect = (a, b, minutes, km) => edges.get(a).push({ to: b, minutes, km });

  for (const route of routes) {
    // 평균 기다리는 시간 = 열차 간격의 절반
    boarding.set(route.id, roundTripMinutes(route) / route.trainCount / 2);
    // 이웃한 역 사이: 달리는 시간 + 다음 역에 서는 시간, 탄 거리는 선로 길이
    routeTracks(route).forEach((track, i) => {
      const km = trackLengthKm(track);
      const minutes = (km / TRAIN_SPEED_KMH) * 60 + DWELL_MINUTES;
      const a = nodeOf(route.stations[i], route.id);
      const b = nodeOf(route.stations[i + 1], route.id);
      connect(a, b, minutes, km);
      connect(b, a, minutes, km);
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
        if (a !== b) connect(a, b, TRANSFER_MINUTES + boarding.get(nodes[b].route), 0);
      }
    }
  }

  return { nodes, edges, boarding, byStation };
}

// 출발역에서 갈 수 있는 모든 역까지 가장 빠른 여행
// 결과: Map(도착역 id → { minutes, km: 탄 거리, routeKm: Map(탄 노선 id → 그 노선에서 탄 거리) })
function shortestTrips(graph, origin) {
  const { nodes, edges, boarding, byStation } = graph;
  const minutes = new Array(nodes.length).fill(Infinity);
  const km = new Array(nodes.length).fill(0);
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
    for (const { to, minutes: cost, km: distance } of edges.get(current)) {
      if (minutes[current] + cost < minutes[to]) {
        minutes[to] = minutes[current] + cost;
        km[to] = km[current] + distance;
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
    // 거꾸로 따라가며 노선마다 탄 거리를 더한다 (갈아타기는 거리 0)
    const routeKm = new Map();
    for (let i = best; i >= 0; i = previous[i]) {
      const before = previous[i] >= 0 ? km[previous[i]] : 0;
      const route = nodes[i].route;
      routeKm.set(route, (routeKm.get(route) ?? 0) + (km[i] - before));
    }
    trips.set(station, { minutes: minutes[best], km: km[best], routeKm });
  }
  return trips;
}
