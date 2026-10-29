// 실제 노선망 프리셋 만들기: node tools/make-presets.mjs [지도 id …] → src/data/presets/<지도 id>.json (게임 저장 파일과 같은 모양)
// 지도 id를 적지 않으면 아래 CITIES의 모든 도시를 만든다. 시작 화면 지도 카드의 [실제 노선망으로 시작]이 이 파일을
// 그 지도의 샌드박스로 연다 (game/presets.js, ui/startScreen.js).
// - 역 순서: OpenStreetMap(Overpass API)의 노선 자료. 노선(route_master)마다 계통(route) 중 서울 범위 안 역이 가장 많은 것을 고르고,
//   그 노선에서 아직 안 다닌 역이 BRANCH_MIN_NEW곳 이상 있는 계통은 갈래(지선)로 따로 넣는다 (런던 노던선, 파리 13호선 …)
// - 지도 범위(regions.js의 bounds) 밖 역은 뺀다 (노선 끝이 범위 밖으로 나가는 곳)
// - 이름이 같고 SAME_NAME_M 안이거나, 이름이 달라도 MERGE_M 안인 정류 위치는 한 역(환승역)으로 합친다. 자리는 그 정류 위치들의 가운데
// - 선로는 실제 선로 모양을 따라 꺾인 선으로 그린다 (노선 자료의 선로 길을 역 사이마다 잘라, 덜 중요한 점은 빼고 경유점으로)
// - 역 주변 인구는 게임과 같은 계산(map/population.js의 populationFromBuildings)으로,
//   OpenFreeMap 지도 조각(줌 14, 게임이 역을 놓을 때 읽는 것과 같은 자료)의 건물로 잰다
// 도시·노선 목록은 presets/cities.mjs, 자료 받기는 presets/osm.mjs, 선로 모양은 presets/trackPath.mjs,
// 역 이름·합치기는 presets/stations.mjs.
// 지도·노선 자료: © OpenStreetMap 기여자 (ODbL). 시작 화면에 출처를 적는다. 인터넷이 필요하다 (가입·키 없음).
import { mkdirSync, writeFileSync } from 'node:fs';
import { REGIONS } from '../src/regions.js';
import { LINE_COLORS } from '../src/lineColors.js';
import { setRegion } from '../src/game/region.js';
import { populationFromBuildings } from '../src/map/population.js';
import { packCells } from '../src/game/cellPacking.js';
import { POPULATION_RADIUS_M, START_YEAR, START_MONTH } from '../src/config.js';
import { getState } from '../src/game/state.js';
import { loadData } from '../src/game/save.js';
import { clearTrackMemory, roundTripMinutes } from '../src/game/tripFinder.js';
import { maxTrainCount } from '../src/game/routes.js';
import { CITIES, JOINS } from './presets/cities.mjs';
import { meters, sleep, overpass, buildingsNear } from './presets/osm.mjs';
import { SNAP_MAX_M, routePath, snapStops, waypointsBetween } from './presets/trackPath.mjs';
import { makeStopName, mergeStations } from './presets/stations.mjs';

// 이미 고른 계통의 정류 위치에서 이만큼(미터) 안이면 같은 역으로 보고 갈래를 가린다
const COVERED_M = 250;
// 갈래(지선)로 따로 넣으려면 그 노선에서 아직 안 다닌 역이 이만큼은 있어야 한다 (반대 방향·짧게 도는 계통은 빼려고)
const BRANCH_MIN_NEW = 2;
// 노선마다 열차 수: 이만큼(분)마다 한 대가 오게 (왕복 시간 ÷ 이 값, 2대 ~ 게임의 최대 열차 수 maxTrainCount).
// 작을수록 덜 붐비지만 열차가 많아져 화면이 무거워진다 (런던은 노선이 갈래마다 따로라 열차가 특히 많다)
const PRESET_HEADWAY_MINUTES = 5;

// ── 도시 하나 만들기 ──
async function makePreset(regionId) {
  console.log(`\n== ${REGIONS[regionId].name} (${regionId})`);
  setRegion(regionId);
  const [west, south, east, north] = REGIONS[regionId].bounds;
  const inside = ([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north;
  const lines = CITIES[regionId];

  // 1. 노선·계통·정류 위치·선로 조각을 한꺼번에 받는다
  const masters = lines.filter((line) => line.master).map((line) => line.master);
  const direct = lines.filter((line) => line.relation).map((line) => line.relation);
  const query = `[out:json][timeout:300];
    ${masters.length ? `relation(id:${masters.join(',')})->.m;.m out body;relation(r.m)->.v;` : '()->.v;'}
    ${direct.length ? `relation(id:${direct.join(',')})->.d;` : '()->.d;'}
    (.v;.d;)->.r;.r out body;node(r.r);out body;way(r.r);out geom;`;
  const osm = await overpass(query);
  const relations = new Map(osm.elements.filter((e) => e.type === 'relation').map((e) => [e.id, e]));
  const nodes = new Map(osm.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]));
  const ways = new Map(osm.elements.filter((e) => e.type === 'way').map((e) => [e.id, e]));

  // 역 이름 (한국·일본 도시는 한국어, 다른 나라는 그 나라 이름, presets/stations.mjs)
  const stationNodes = (await overpass(`[out:json][timeout:120];node["railway"="station"](${south},${west},${north},${east});out body;`))
    .elements;
  const stopName = makeStopName(stationNodes, REGIONS[regionId].country);

  // 계통 하나: 범위 안의 이어진 정류 위치 중 가장 긴 구간 + 선로 길
  const variantOf = (relationId) => {
    const relation = relations.get(relationId);
    if (!relation) throw new Error(`OpenStreetMap 자료(relation ${relationId})가 없어요`);
    const stops = relation.members
      .filter((member) => member.type === 'node' && /^stop/.test(member.role) && nodes.has(member.ref))
      .map((member) => nodes.get(member.ref))
      .map((node) => ({ name: stopName(node), coord: [node.lon, node.lat] }));
    let best = [];
    let run = [];
    for (const stop of stops) {
      if (inside(stop.coord)) run.push(stop);
      else run = [];
      if (run.length > best.length) best = [...run];
    }
    const path = routePath(relation, ways);
    const snaps = path ? snapStops(path, best.map((stop) => stop.coord)) : null;
    return { id: relationId, stops: best, path, snaps };
  };

  // 2. 노선마다 계통 고르기: 역이 가장 많은 계통 + 아직 안 다닌 역이 있는 갈래
  const picked = []; // { name, number, stops, path, snaps }
  for (const line of lines) {
    const base = line.name ?? LINE_COLORS[regionId][line.number - 1].name;
    const candidates = line.relation
      ? [variantOf(line.relation)]
      : relations.get(line.master).members.filter((m) => m.type === 'relation').map((m) => variantOf(m.ref));
    candidates.sort((a, b) => b.stops.length - a.stops.length);
    // 이미 고른 계통이 다니는 역인지: 이름이 아니라 자리로 본다 (방향마다 정류 위치·이름 표기가 달라서)
    const covered = [];
    const isCovered = (stop) => covered.some((coord) => meters(coord, stop.coord) < COVERED_M);
    const chosen = [];
    for (const variant of candidates) {
      if (variant.stops.length < 2) continue;
      const fresh = variant.stops.filter((stop) => !isCovered(stop));
      if (chosen.length > 0 && fresh.length < BRANCH_MIN_NEW) continue;
      // 갈래 이름: 새로 다니는 끝 역 ("노던선 · Edgware"), 끝이 같으면 처음 새로 지나는 역 ("노던선 · Charing Cross 경유")
      const [first, last] = [variant.stops[0], variant.stops.at(-1)];
      const end = !isCovered(last) ? last.name : !isCovered(first) ? first.name : `${fresh[0].name} 경유`;
      const name = chosen.length === 0 ? base : `${base} · ${end}`;
      chosen.push({ ...variant, name, base, number: line.number });
      for (const stop of variant.stops) covered.push(stop.coord);
    }
    for (const variant of chosen) {
      const curved = variant.snaps ? variant.snaps.filter((snap) => snap.gap <= SNAP_MAX_M).length : 0;
      console.log(
        `${variant.name}: 역 ${variant.stops.length}곳 (${variant.stops[0].name} → ${variant.stops.at(-1).name}), 선로 길에 붙은 역 ${curved}곳`,
      );
    }
    picked.push(...chosen);
  }

  // 3. 정류 위치를 역으로 합친다 (presets/stations.mjs)
  const stations = mergeStations(picked, JOINS[regionId]);

  // 4. 선로 (이웃한 두 역마다 하나, 실제 선로 모양) 와 노선
  const tracks = [];
  const trackIds = new Map();
  let curvedTracks = 0;
  let fallbackTracks = 0; // 선로 길 자료가 어긋나 곧게 둔 선로
  const routes = picked.map((variant, index) => {
    const ids = variant.groups.map((group) => group.station.id);
    for (let i = 1; i < ids.length; i++) {
      const [a, b] = [ids[i - 1], ids[i]];
      const key = [a, b].sort().join('|');
      if (a === b || trackIds.has(key)) continue;
      const from = variant.groups[i - 1].station.coord;
      const to = variant.groups[i].station.coord;
      const waypoints = variant.snaps ? waypointsBetween(variant.path, variant.snaps[i - 1], variant.snaps[i], from, to) : null;
      if (waypoints?.length) curvedTracks++;
      if (!waypoints) fallbackTracks++;
      const id = `t${tracks.length + 1}`;
      trackIds.set(key, id);
      tracks.push({ id, from: a, to: b, waypoints: waypoints ?? [], curve: false });
    }
    const stationIds = ids.filter((id, i) => i === 0 || id !== ids[i - 1]);
    return {
      id: `r${index + 1}`,
      name: variant.name,
      color: LINE_COLORS[regionId][variant.number - 1].color,
      stations: stationIds,
      trainCount: 2, // 아래 7.에서 노선 왕복 시간으로 정한다
    };
  });

  // 5. 역 주변 인구 (지도 조각의 건물로, 게임과 같은 계산)
  for (const [i, station] of stations.entries()) {
    const features = await buildingsNear(station.coord, POPULATION_RADIUS_M);
    const { population, builtArea, cells } = populationFromBuildings(features, station.coord);
    station.population = population;
    station.builtArea = builtArea;
    const grid = cells ? packCells(station.coord, cells) : null;
    if (grid) station.cellGrid = grid;
    else station.cells = cells;
    if ((i + 1) % 100 === 0) console.log(`  인구 잰 역 ${i + 1}/${stations.length}`);
  }

  // 6. 게임 저장 파일 모양으로 쓴다 (save.js의 saveData와 같은 모양)
  const save = {
    version: 1,
    region: regionId,
    network: {
      stations,
      tracks,
      routes,
      nextStationNumber: stations.length + 1,
      nextTrackNumber: tracks.length + 1,
      nextRouteNumber: routes.length + 1,
      money: REGIONS[regionId].startMoney,
    },
    speed: 0,
    elapsedSeconds: 0,
    year: START_YEAR,
    month: START_MONTH,
    monthProgress: 0,
    lastSettlement: null,
    monthlyRecords: [],
    monthsOverDebtLimit: 0,
    bankrupt: false,
    achievedGoals: [],
    savedAt: 0,
  };
  // 7. 열차 수: 게임에 불러와 노선 왕복 시간(실제 선로 모양으로 달리는 시간)을 재고, PRESET_HEADWAY_MINUTES분마다 한 대
  clearTrackMemory(); // 다른 도시의 선로 번호가 같아서, 기억해 둔 선로 길이·달리는 시간을 비운다
  loadData(save);
  for (const route of getState().routes) {
    const count = Math.round(roundTripMinutes(route) / PRESET_HEADWAY_MINUTES);
    save.network.routes.find((r) => r.id === route.id).trainCount = Math.max(2, Math.min(maxTrainCount(route), count));
  }
  const trains = save.network.routes.reduce((sum, r) => sum + r.trainCount, 0);

  mkdirSync(new URL('../src/data/presets/', import.meta.url), { recursive: true });
  const text = JSON.stringify(save);
  writeFileSync(new URL(`../src/data/presets/${regionId}.json`, import.meta.url), text);
  const average = Math.round(stations.reduce((sum, s) => sum + s.population, 0) / stations.length);
  console.log(
    `역 ${stations.length}곳, 선로 ${tracks.length}개 (실제 모양 ${curvedTracks}개, 자료가 어긋나 곧게 ${fallbackTracks}개), 노선 ${routes.length}개, 열차 ${trains}대, 평균 인구 ${average}명, 파일 ${Math.round(text.length / 1024)} KB`,
  );
}

const wanted = process.argv.slice(2);
for (const id of wanted.length ? wanted : Object.keys(CITIES)) {
  if (!CITIES[id]) throw new Error(`실제 노선망을 만들 수 없는 지도예요: ${id} (만들 수 있는 것: ${Object.keys(CITIES).join(', ')})`);
  await makePreset(id);
  await sleep(5000); // Overpass API를 너무 자주 부르지 않게
}
