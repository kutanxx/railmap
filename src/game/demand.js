// 승객 수요와 수입 계산 (중력 모델).
// 두 역 사이 하루 승객 = RIDERS_FACTOR × (인구 A ÷ 1000) × (인구 B ÷ 1000) ÷ 소요 시간^DEMAND_TIME_POWER
// 월 수입 = 하루 승객 × 요금(fareWon, 나라마다 방식이 다르다) × 한 달 날수
//          광역급행(routeKinds.js)을 탄 거리만큼은 요금이 fareRatio배 (더 받은 몫은 그 광역급행 노선이 갖는다)
// 소요 시간(분) = 처음 타는 열차 기다리는 시간 + 타고 가는 시간 (+ 갈아타기)
// 타고 가는 시간은 열차가 실제로 달리는 모습(가속·감속·꺾이는 곳 감속, running.js)으로 잰다
// 열차가 많을수록 기다리는 시간이 줄어서 수요가 늘어난다. 열차가 0대인 노선은 승객을 나르지 않는다.
// 정원: 가장 붐비는 한 시간(출퇴근)에 노선이 나를 수 있는 양(열차 × 운행 횟수 × 정원 × 노선 길이)보다
//       그 시간에 타려는 양(승객 × 그 노선에서 탄 거리 × PEAK_HOUR_SHARE)이 많으면
//       혼잡도가 100%를 넘고, 넘친 만큼 승객을 놓친다.
// 고속철도역(intercity.js)과 이어진 역은 그 역을 드나드는 사람도 인구에 더해 수요를 센다
// 같은 두 역 사이를 여러 노선이 함께 다니면 (같은 선로를 쓰는 노선들) 그 구간 승객·수입·혼잡을 열차 수에 비례해 나눠 가진다
// (길찾기는 그중 한 노선만 고르므로, 그대로 두면 나중에 만든 노선은 승객이 0명이 된다)
// 길찾기(가장 빠른 여행, 기다리는 시간·갈아타기)는 tripFinder.js가 한다
// 상태가 바뀔 때만 다시 계산하고(updateEconomy), 매달 정산 때는 저장해 둔 값을 쓴다(getEconomy).
import { getState, routeTracks, builtTracks } from './state.js';
import { monthlyOpex, fareWon } from './economy.js';
import { sharedPopulations } from './catchment.js';
import { intercityLinks } from './intercity.js';
import { trainSpec, isExpress } from './routeKinds.js';
import {
  clearTrackMemory,
  trackKm,
  routeLengthKm,
  roundTripMinutes,
  buildGraph,
  shortestTrips,
} from './tripFinder.js';
import {
  RIDERS_FACTOR,
  DEMAND_TIME_POWER,
  DAYS_PER_MONTH,
  MIN_TRIP_MINUTES,
  PEAK_HOUR_SHARE,
} from '../config.js';

const WON_PER_EOK = 100000000; // 1억 원

// 마지막으로 계산한 결과
// { revenue, opex, net: 월 수입·운영비·수지(억),
//   dailyRiders: 하루 승객 전체(명),
//   routeRevenue / routeRiders / routeAvgKm: Map(노선 id → 월 수입 / 하루 승객 / 평균 탄 거리 km),
//   routeLoad: Map(노선 id → 혼잡도, 1 = 100%), routeLost: Map(노선 id → 자리가 없어 놓친 하루 승객),
//   stationRiders: Map(역 id → 하루 이용객 = 그 역에서 타고 내린 사람),
//   stationPopulation: Map(역 id → 이웃 역과 나눈 뒤의 인구, 고속철도역에서 오는 사람은 빼고),
//   stationIntercity: Map(역 id → 이어진 고속철도역들 [{ name, coord, size, people }]),
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
  stationIntercity: new Map(),
  trackLoad: new Map(),
};

export function getEconomy() {
  return economy;
}

// 노선망과 인구로 월 수입과 운영비를 다시 계산한다
export function updateEconomy() {
  clearTrackMemory();
  const { stations, tracks, routes } = getState();
  const running = routes.filter((route) => route.trainCount > 0);
  const graph = buildGraph(running);
  // 가까이 붙은 역끼리는 겹치는 건물을 나눠 가진다
  const population = sharedPopulations(stations);
  // 고속철도역과 이어진 역은 그 역을 드나드는 사람도 더한다 (수요에만 쓰고, 역 카드의 "주변 인구"는 따로 보여준다)
  const stationIntercity = new Map();
  for (const { hub, stationId } of intercityLinks(stations)) {
    stationIntercity.set(stationId, [...(stationIntercity.get(stationId) ?? []), hub]);
  }
  const demandPopulation = new Map(population);
  for (const [id, hubs] of stationIntercity) {
    demandPopulation.set(id, demandPopulation.get(id) + hubs.reduce((sum, hub) => sum + hub.people, 0));
  }

  const zeros = (items) => new Map(items.map((item) => [item.id, 0]));
  const servedStations = [...new Set(running.flatMap((route) => route.stations))];
  // 같은 두 역 사이를 함께 다니는 노선들 (예: 같은 선로를 쓰는 두 노선). 그 구간 승객을 열차 수에 비례해 나눠 가진다
  const sharers = segmentSharers(running);

  // 1) 타려는 승객: 두 역 사이마다 { origin, destination, riders, km, routeKm }
  const journeys = [];
  const wantedKm = zeros(routes); // 노선별 (타려는 승객 × 그 노선에서 탈 거리) 합
  const segmentWanted = new Map(); // 노선의 이웃한 두 역 사이를 지나려는 승객 ("노선|역|역" → 명)
  for (const origin of servedStations) {
    // 같은 두 역을 두 번 세지 않도록 한 방향(origin보다 뒤 이름의 역)만 센다 (riders에 오가는 사람이 모두 들어 있다)
    for (const [destination, trip] of shortestTrips(graph, origin)) {
      const minutes = Math.max(trip.minutes, MIN_TRIP_MINUTES);
      const riders =
        (RIDERS_FACTOR * (demandPopulation.get(origin) / 1000) * (demandPopulation.get(destination) / 1000)) /
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
  const coordOf = new Map(stations.map((station) => [station.id, station.coord])); // 구역제 요금에 쓴다
  const express = new Set(routes.filter(isExpress).map((route) => route.id));
  const expressExtra = trainSpec('express').fareRatio - 1; // 광역급행 거리만큼 더 받는 비율
  for (const { origin, destination, riders: wanted, km, routeKm: kmByRoute, share, routeCount } of journeys) {
    const worstLoad = Math.max(1, ...[...kmByRoute.keys()].map((id) => routeLoad.get(id)));
    const riders = wanted / worstLoad;
    const fare = fareWon(km, coordOf.get(origin), coordOf.get(destination));
    const monthly = (riders * fare * DAYS_PER_MONTH) / WON_PER_EOK;
    // 광역급행을 탄 거리 비율만큼 더 받는 요금 (월, 억)
    let expressKm = 0;
    for (const [routeId, routeDistance] of kmByRoute) if (express.has(routeId)) expressKm += routeDistance;
    const extra = km > 0 ? monthly * expressExtra * Math.min(1, expressKm / km) : 0;
    revenue += monthly + extra;
    dailyRiders += riders;
    // 두 역 모두 이 승객들이 타고 내린다
    stationRiders.set(origin, stationRiders.get(origin) + riders);
    stationRiders.set(destination, stationRiders.get(destination) + riders);
    // 이 여행에서 탄 노선들: 승객은 모두에게 세고, 수입은 똑같이 나눠 가진다
    // (같은 구간을 함께 다니는 노선들은 그 몫(share)을 나눠 가진다)
    for (const [routeId, routeDistance] of kmByRoute) {
      const part = share.get(routeId);
      // 더 받은 요금은 광역급행 노선들이 탄 거리 비율로 갖는다
      const extraPart = express.has(routeId) && expressKm > 0 ? (extra * routeDistance) / expressKm : 0;
      routeRevenue.set(routeId, routeRevenue.get(routeId) + (monthly * part) / routeCount + extraPart);
      routeRiders.set(routeId, routeRiders.get(routeId) + riders * part);
      routeLost.set(routeId, routeLost.get(routeId) + (wanted - riders) * part);
      routeKm.set(routeId, routeKm.get(routeId) + riders * routeDistance);
    }
  }

  const routeAvgKm = new Map();
  for (const [id, riders] of routeRiders) {
    routeAvgKm.set(id, riders > 0 ? routeKm.get(id) / riders : 0);
  }

  // 운영비는 지은 선로만 (계획 선로는 돈이 들지 않는다)
  const builtKm = builtTracks().reduce((sum, track) => sum + trackKm(track), 0);
  // 열차 운영비는 노선 종류(지하철·광역급행)마다 열차 한 대 값이 다르다
  const trainOpex = routes.reduce((sum, route) => sum + route.trainCount * trainSpec(route).opexPerTrain, 0);
  const opex = monthlyOpex(stations.length, builtKm, trainOpex);
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
    stationIntercity,
    trackLoad,
  };
}

// ── 안쪽에서만 쓰는 계산 ──────────────────

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
  for (const { route: routeId, a, b, km } of trip.segments) {
    const list = segmentsByRoute.get(routeId) ?? [];
    list.push({ a, b, pair: `${a}|${b}`, km });
    segmentsByRoute.set(routeId, list);
  }
  for (const [routeId, totalKm] of trip.routeKm) {
    const segments = segmentsByRoute.get(routeId) ?? [];
    if (segments.length === 0 || totalKm <= 0) {
      add(routeKm, routeId, totalKm);
      add(share, routeId, 1);
      continue;
    }
    for (const { a, b, pair, km } of segments) {
      for (const { routeId: sharer, weight } of sharers.get(pair) ?? [{ routeId, weight: 1 }]) {
        add(routeKm, sharer, km * weight);
        add(share, sharer, (km / totalKm) * weight);
        add(segmentWanted, segmentKey(sharer, a, b), riders * weight);
      }
    }
  }
  return { routeKm, share };
}

// 노선이 한 시간에 나를 수 있는 양 (사람 × km)
// = 열차 대수 × 열차 한 대의 한 시간 편도 운행 횟수 × 정원(노선 종류마다 다르다) × 노선 길이
function hourlyCapacityKm(route) {
  const oneWayRunsPerTrain = (60 / roundTripMinutes(route)) * 2;
  return route.trainCount * oneWayRunsPerTrain * trainSpec(route).capacity * routeLengthKm(route);
}
