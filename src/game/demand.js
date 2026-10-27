// 승객 수요와 수입 계산 (중력 모델).
// 두 역 사이 하루 승객 = RIDERS_FACTOR × (인구 A ÷ 1000) × (인구 B ÷ 1000) ÷ 소요 시간^DEMAND_TIME_POWER
// 월 수입 = 하루 승객 × 거리 요금(fareWon) × 한 달 날수
// 소요 시간(분) = 처음 타는 열차 기다리는 시간 + 타고 가는 시간 (+ 갈아타기)
// 타고 가는 시간은 열차가 실제로 달리는 모습(가속·감속·꺾이는 곳 감속, running.js)으로 잰다
// 열차가 많을수록 기다리는 시간이 줄어서 수요가 늘어난다. 열차가 0대인 노선은 승객을 나르지 않는다.
// 정원: 가장 붐비는 한 시간(출퇴근)에 노선이 나를 수 있는 양(열차 × 운행 횟수 × 정원 × 노선 길이)보다
//       그 시간에 타려는 양(승객 × 그 노선에서 탄 거리 × PEAK_HOUR_SHARE)이 많으면
//       혼잡도가 100%를 넘고, 넘친 만큼 승객을 놓친다.
// 같은 두 역 사이를 여러 노선이 함께 다니면 (같은 선로를 쓰는 노선들) 그 구간 승객·수입·혼잡을 열차 수에 비례해 나눠 가진다
// (길찾기는 그중 한 노선만 고르므로, 그대로 두면 나중에 만든 노선은 승객이 0명이 된다)
// 상태가 바뀔 때만 다시 계산하고(updateEconomy), 매달 정산 때는 저장해 둔 값을 쓴다(getEconomy).
import { getState, routeTracks, trackLengthKm, trackCoords, findTrackBetween } from './state.js';
import { monthlyOpex, fareWon } from './economy.js';
import { sharedPopulations } from './catchment.js';
import { buildRun } from './running.js';
import {
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
//   stationPopulation: Map(역 id → 이웃 역과 나눈 뒤의 인구),
//   trackLoad: Map(선로 id → 그 구간의 혼잡도, 1 = 100%. 여러 노선이 지나면 가장 붐비는 노선) }
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
  trackLoad: new Map(),
};

export function getEconomy() {
  return economy;
}

// 노선망과 인구로 월 수입과 운영비를 다시 계산한다
export function updateEconomy() {
  runSeconds.clear();
  const { stations, tracks, routes } = getState();
  const running = routes.filter((route) => route.trainCount > 0);
  const graph = buildGraph(running);
  // 가까이 붙은 역끼리는 겹치는 건물을 나눠 가진다
  const population = sharedPopulations(stations);

  const zeros = (items) => new Map(items.map((item) => [item.id, 0]));
  const servedStations = [...new Set(running.flatMap((route) => route.stations))];
  // 같은 두 역 사이를 함께 다니는 노선들 (예: 같은 선로를 쓰는 두 노선). 그 구간 승객을 열차 수에 비례해 나눠 가진다
  const sharers = segmentSharers(running);

  // 1) 타려는 승객: 두 역 사이마다 { origin, destination, riders, km, routeKm }
  const journeys = [];
  const wantedKm = zeros(routes); // 노선별 (타려는 승객 × 그 노선에서 탈 거리) 합
  const segmentWanted = new Map(); // 노선의 이웃한 두 역 사이를 지나려는 승객 ("노선|역|역" → 명)
  for (const origin of servedStations) {
    for (const [destination, trip] of shortestTrips(graph, origin)) {
      // 같은 두 역을 두 번 세지 않도록 한 방향만 센다 (riders에 오가는 사람이 모두 들어 있다)
      if (destination <= origin) continue;
      const minutes = Math.max(trip.minutes, MIN_TRIP_MINUTES);
      const riders =
        (RIDERS_FACTOR * (population.get(origin) / 1000) * (population.get(destination) / 1000)) /
        minutes ** DEMAND_TIME_POWER;
      // 길찾기는 같은 구간을 다니는 노선 중 하나만 고르므로, 그 구간을 함께 다니는 노선들에게 나눠 준다
      const { routeKm, share } = spreadOverSharers(trip, sharers, riders, segmentWanted);
      journeys.push({ origin, destination, riders, km: trip.km, routeKm, share, routeCount: trip.routeKm.size });
      for (const [routeId, km] of routeKm) {
        wantedKm.set(routeId, wantedKm.get(routeId) + riders * km);
      }
    }
  }

  // 혼잡도 = 가장 붐비는 한 시간에 타려는 양 ÷ 그 한 시간에 나를 수 있는 양
  const routeLoad = zeros(routes);
  for (const route of running) {
    routeLoad.set(route.id, (wantedKm.get(route.id) * PEAK_HOUR_SHARE) / hourlyCapacityKm(route));
  }
  // 구간 혼잡도 = 가장 붐비는 한 시간에 그 구간을 지나려는 사람 ÷ 한 시간에 그 구간을 지나는 자리
  // (지도에서 혼잡도 보기를 켜면 선로를 이 값으로 칠한다)
  const trackLoad = new Map();
  for (const route of running) {
    const seatsPerHour = hourlyCapacityKm(route) / routeLengthKm(route);
    routeTracks(route).forEach((track, i) => {
      const key = segmentKey(route.id, route.stations[i], route.stations[i + 1]);
      const load = ((segmentWanted.get(key) ?? 0) * PEAK_HOUR_SHARE) / seatsPerHour;
      trackLoad.set(track.id, Math.max(trackLoad.get(track.id) ?? 0, load));
    });
  }

  // 2) 실제로 탄 승객: 지나는 노선 중 가장 붐비는 노선이 100%를 넘으면 그만큼 못 탄다
  let revenue = 0;
  let dailyRiders = 0;
  const routeRevenue = zeros(routes);
  const routeRiders = zeros(routes);
  const routeLost = zeros(routes);
  const routeKm = zeros(routes); // 노선별 (승객 × 그 노선에서 탄 거리) 합. 평균 거리를 구할 때 쓴다
  const stationRiders = zeros(stations);
  for (const { origin, destination, riders: wanted, km, routeKm: kmByRoute, share, routeCount } of journeys) {
    const worstLoad = Math.max(1, ...[...kmByRoute.keys()].map((id) => routeLoad.get(id)));
    const riders = wanted / worstLoad;
    const monthly = (riders * fareWon(km) * DAYS_PER_MONTH) / WON_PER_EOK;
    revenue += monthly;
    dailyRiders += riders;
    // 두 역 모두 이 승객들이 타고 내린다
    stationRiders.set(origin, stationRiders.get(origin) + riders);
    stationRiders.set(destination, stationRiders.get(destination) + riders);
    // 이 여행에서 탄 노선들: 승객은 모두에게 세고, 수입은 똑같이 나눠 가진다
    // (같은 구간을 함께 다니는 노선들은 그 몫(share)을 나눠 가진다)
    for (const [routeId, routeDistance] of kmByRoute) {
      const part = share.get(routeId);
      routeRevenue.set(routeId, routeRevenue.get(routeId) + (monthly * part) / routeCount);
      routeRiders.set(routeId, routeRiders.get(routeId) + riders * part);
      routeLost.set(routeId, routeLost.get(routeId) + (wanted - riders) * part);
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
    trackLoad,
  };
}

// ── 안쪽에서만 쓰는 계산 ──────────────────

// 선로 하나를 역에서 역까지 달리는 데 걸리는 시간 (게임 초). 한 번 계산할 때마다 선로별로 기억해 둔다
const runSeconds = new Map();
function trackRunSeconds(track) {
  if (!runSeconds.has(track.id)) runSeconds.set(track.id, buildRun(trackCoords(track)).seconds);
  return runSeconds.get(track.id);
}

// 노선의 이웃한 두 역 사이 구간 이름. 오가는 방향을 같은 구간으로 친다
function segmentKey(routeId, a, b) {
  return a < b ? `${routeId}|${a}|${b}` : `${routeId}|${b}|${a}`;
}

// 두 역 사이(오가는 방향 같음)를 이웃한 역으로 다니는 노선들과 그 몫 (열차 수 비례)
// 결과: Map("역|역" → [{ routeId, weight }]) — weight를 더하면 1
function segmentSharers(running) {
  const byPair = new Map();
  for (const route of running) {
    for (let i = 0; i + 1 < route.stations.length; i++) {
      const [a, b] = [route.stations[i], route.stations[i + 1]].sort();
      const pair = `${a}|${b}`;
      const list = byPair.get(pair) ?? new Map();
      list.set(route.id, route.trainCount);
      byPair.set(pair, list);
    }
  }
  const result = new Map();
  for (const [pair, trains] of byPair) {
    const total = [...trains.values()].reduce((sum, count) => sum + count, 0);
    result.set(
      pair,
      [...trains].map(([routeId, count]) => ({ routeId, weight: count / total })),
    );
  }
  return result;
}

// 한 여행(trip)의 구간들을 그 구간을 함께 다니는 노선들에게 나눠 준다
// 결과: { routeKm: Map(노선 → 그 노선에서 탄 거리), share: Map(노선 → 원래 탄 노선 하나를 1로 쳤을 때의 몫) }
// segmentWanted(구간별 타려는 승객)에도 나눈 만큼 더한다
function spreadOverSharers(trip, sharers, riders, segmentWanted) {
  const routeKm = new Map();
  const share = new Map();
  const add = (map, key, value) => map.set(key, (map.get(key) ?? 0) + value);
  // 원래 노선별로 구간 길이를 모아, 원래 노선 하나의 몫(1)을 구간 길이 비율로 나눈다
  const segmentsByRoute = new Map();
  for (const key of trip.segments) {
    const [routeId, a, b] = key.split('|');
    const km = trackLengthKm(findTrackBetween(a, b));
    const list = segmentsByRoute.get(routeId) ?? [];
    list.push({ pair: `${a}|${b}`, km });
    segmentsByRoute.set(routeId, list);
  }
  for (const [routeId, totalKm] of trip.routeKm) {
    const segments = segmentsByRoute.get(routeId) ?? [];
    if (segments.length === 0 || totalKm <= 0) {
      add(routeKm, routeId, totalKm);
      add(share, routeId, 1);
      continue;
    }
    for (const { pair, km } of segments) {
      for (const { routeId: sharer, weight } of sharers.get(pair) ?? [{ routeId, weight: 1 }]) {
        add(routeKm, sharer, km * weight);
        add(share, sharer, (km / totalKm) * weight);
        add(segmentWanted, segmentKey(sharer, ...pair.split('|')), riders * weight);
      }
    }
  }
  return { routeKm, share };
}

const routeLengthKm = (route) => routeTracks(route).reduce((sum, track) => sum + trackLengthKm(track), 0);

// 노선 하나를 왕복하는 데 걸리는 시간 (분): 달리는 시간 × 2 + 역에 서는 시간
// (가운데 역은 오가며 두 번, 끝 역은 한 번 선다. sim.js의 배차 간격과 같은 계산)
function roundTripMinutes(route) {
  const running = routeTracks(route).reduce((sum, track) => sum + trackRunSeconds(track), 0) / 60;
  return 2 * running + (2 * route.stations.length - 2) * DWELL_MINUTES;
}

// 노선이 한 시간에 나를 수 있는 양 (사람 × km)
// = 열차 대수 × 열차 한 대의 한 시간 편도 운행 횟수 × 정원 × 노선 길이
function hourlyCapacityKm(route) {
  const oneWayRunsPerTrain = (60 / roundTripMinutes(route)) * 2;
  return route.trainCount * oneWayRunsPerTrain * TRAIN_CAPACITY * routeLengthKm(route);
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
      const minutes = trackRunSeconds(track) / 60 + DWELL_MINUTES;
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
// 결과: Map(도착역 id → { minutes, km: 탄 거리, routeKm: Map(탄 노선 id → 그 노선에서 탄 거리),
//                        segments: 지나는 구간 이름들 (segmentKey) })
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
    const segments = [];
    for (let i = best; i >= 0; i = previous[i]) {
      const before = previous[i] >= 0 ? km[previous[i]] : 0;
      const route = nodes[i].route;
      routeKm.set(route, (routeKm.get(route) ?? 0) + (km[i] - before));
      // 같은 노선의 두 역 사이를 달린 것이면 그 구간을 적는다 (갈아타기는 빼고)
      const from = nodes[previous[i]];
      if (from && from.route === route && from.station !== nodes[i].station) {
        segments.push(segmentKey(route, from.station, nodes[i].station));
      }
    }
    trips.set(station, { minutes: minutes[best], km: km[best], routeKm, segments });
  }
  return trips;
}
