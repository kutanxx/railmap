// 실제 노선망 프리셋 만들기: node tools/make-presets.mjs → src/data/presets/seoul.json (게임 저장 파일과 같은 모양)
// 시작 화면 서울 카드의 [실제 노선망]이 이 파일을 서울 샌드박스로 연다 (ui/startScreen.js).
// - 역 순서: OpenStreetMap(Overpass API)의 노선 자료 (노선마다 급행이 아닌 한 방향 계통 하나, 아래 LINES)
// - 서울 지도 범위(regions.js의 bounds) 밖 역은 뺀다 (노선 끝이 경기·인천으로 나가는 곳)
// - 이름이 같거나 아주 가까운(MERGE_M 안) 정류 위치는 한 역(환승역)으로 합친다. 자리는 그 정류 위치들의 가운데
// - 선로는 이웃한 두 역을 곧게 잇는다 (실제 선로가 휘는 모양은 따르지 않는다)
// - 역 주변 인구는 게임과 같은 계산(map/population.js의 populationFromBuildings)으로,
//   OpenFreeMap 지도 조각(줌 14, 게임이 역을 놓을 때 읽는 것과 같은 자료)의 건물로 잰다
// 지도·노선 자료: © OpenStreetMap 기여자 (ODbL). 시작 화면에 출처를 적는다. 인터넷이 필요하다 (가입·키 없음).
import { mkdirSync, writeFileSync } from 'node:fs';
import { PbfReader } from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { REGIONS } from '../src/regions.js';
import { LINE_COLORS } from '../src/lineColors.js';
import { setRegion } from '../src/game/region.js';
import { populationFromBuildings } from '../src/map/population.js';
import { packCells } from '../src/game/cellPacking.js';
import { POPULATION_RADIUS_M, MAX_TRAINS_PER_ROUTE, START_YEAR, START_MONTH } from '../src/config.js';

const REGION = 'seoul';
// 서울 지하철 1~9호선: 노선 번호(색), 게임에 보일 이름, OpenStreetMap 노선 관계(relation) 번호
// 1호선은 서울 안에서 두 계통이 갈라져서 둘로, 2호선·5호선은 지선을 따로 둔다
const LINES = [
  { number: 1, name: '1호선 경원·경인선', relation: 8691809 }, // 소요산 → 인천
  { number: 1, name: '1호선 경부선', relation: 8692707 }, // 광운대 → 신창
  { number: 2, name: '2호선', relation: 2404374 }, // 외선순환 (시청에서 시작해 시청으로 돌아온다)
  { number: 2, name: '2호선 성수지선', relation: 4729405 },
  { number: 2, name: '2호선 신정지선', relation: 4729407 },
  { number: 3, name: '3호선', relation: 443803 }, // 대화 → 오금
  { number: 4, name: '4호선', relation: 2718884 }, // 불암산 → 오이도
  { number: 5, name: '5호선', relation: 12497486 }, // 방화 → 하남검단산
  { number: 5, name: '5호선 마천지선', relation: 4744338 }, // 강동 → 마천
  { number: 6, name: '6호선', relation: 12080315 }, // 응암순환 → 신내
  { number: 7, name: '7호선', relation: 12746493 }, // 장암 → 석남
  { number: 8, name: '8호선', relation: 2718901 }, // 별내 → 모란
  { number: 9, name: '9호선', relation: 2718888 }, // 개화 → 중앙보훈병원
];
// 이름이 달라도 이만큼(미터) 가까운 정류 위치는 같은 역으로 친다 (예: 4호선 "총신대입구(이수)"와 7호선 "이수")
const MERGE_M = 200;
// 노선마다 열차 수: 역 수 ÷ 이 값 (2대 ~ MAX_TRAINS_PER_ROUTE대)
const STATIONS_PER_TRAIN = 4;
const TILE_ZOOM = 14;
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'railmap-preset-tool (https://github.com/kutanxx/railmap)';

setRegion(REGION);
const [west, south, east, north] = REGIONS[REGION].bounds;
const inside = ([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north;
const round6 = (value) => Math.round(value * 1e6) / 1e6;
const meters = ([lng1, lat1], [lng2, lat2]) => {
  const x = (lng2 - lng1) * 111320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = (lat2 - lat1) * 110540;
  return Math.hypot(x, y);
};

// ── 1. 노선마다 정류 위치를 차례로 받는다 ──
const query = `[out:json][timeout:120];relation(id:${LINES.map((line) => line.relation).join(',')});out body;node(r);out body;`;
const response = await fetch(OVERPASS, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
  body: `data=${encodeURIComponent(query)}`,
});
if (!response.ok) throw new Error(`OpenStreetMap 자료를 받지 못했어요 (${response.status})`);
const osm = await response.json();
const relations = new Map(osm.elements.filter((e) => e.type === 'relation').map((e) => [e.id, e]));
const nodes = new Map(osm.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]));

const lineStops = LINES.map((line) => {
  const relation = relations.get(line.relation);
  if (!relation) throw new Error(`${line.name}의 OpenStreetMap 자료(relation ${line.relation})가 없어요`);
  const stops = relation.members
    .filter((member) => member.type === 'node' && /^stop/.test(member.role))
    .map((member) => nodes.get(member.ref))
    .map((node) => ({ name: node.tags['name:ko'] ?? node.tags.name, coord: [node.lon, node.lat] }));
  // 서울 지도 범위 안의 이어진 구간 중 가장 긴 것만 (끝이 범위 밖으로 나가는 노선)
  let best = [];
  let run = [];
  for (const stop of stops) {
    if (inside(stop.coord)) run.push(stop);
    else run = [];
    if (run.length > best.length) best = [...run];
  }
  console.log(`${line.name}: 정류 ${stops.length}곳 중 서울 범위 안 ${best.length}곳 (${best[0]?.name} → ${best.at(-1)?.name})`);
  return { ...line, stops: best };
});

// ── 2. 정류 위치를 역으로 합친다 (같은 이름이거나 MERGE_M 안) ──
const groups = []; // { names: Set, coords: [] }
const groupOf = (stop) => {
  let group = groups.find(
    (g) => g.names.has(stop.name) || g.coords.some((coord) => meters(coord, stop.coord) < MERGE_M),
  );
  if (!group) {
    group = { names: new Set(), coords: [] };
    groups.push(group);
  }
  group.names.add(stop.name);
  group.coords.push(stop.coord);
  return group;
};
const lineGroups = lineStops.map((line) => ({ ...line, groups: line.stops.map(groupOf) }));

const stations = groups.map((group, i) => {
  const lng = group.coords.reduce((sum, c) => sum + c[0], 0) / group.coords.length;
  const lat = group.coords.reduce((sum, c) => sum + c[1], 0) / group.coords.length;
  // 이름이 여럿이면 가장 긴 것 (예: "총신대입구(이수)")
  const name = [...group.names].sort((a, b) => b.length - a.length)[0];
  group.station = { id: `s${i + 1}`, name, coord: [round6(lng), round6(lat)], angle: 0 };
  return group.station;
});

// ── 3. 선로 (이웃한 두 역마다 하나, 곧게) 와 노선 ──
const tracks = [];
const trackIds = new Map();
const routes = lineGroups.map((line, index) => {
  const ids = line.groups.map((group) => group.station.id);
  for (let i = 1; i < ids.length; i++) {
    const [a, b] = [ids[i - 1], ids[i]];
    const key = [a, b].sort().join('|');
    if (a === b || trackIds.has(key)) continue;
    const id = `t${tracks.length + 1}`;
    trackIds.set(key, id);
    tracks.push({ id, from: a, to: b, waypoints: [], curve: false });
  }
  return {
    id: `r${index + 1}`,
    name: line.name,
    color: LINE_COLORS[REGION][line.number - 1].color,
    stations: ids.filter((id, i) => i === 0 || id !== ids[i - 1]),
    trainCount: Math.max(2, Math.min(MAX_TRAINS_PER_ROUTE, Math.round(ids.length / STATIONS_PER_TRAIN))),
  };
});

// ── 4. 역 주변 인구 (지도 조각의 건물로, 게임과 같은 계산) ──
const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
const template = (await (await fetch(style.sources.openmaptiles.url)).json()).tiles[0];
const tileCache = new Map();
const tileXY = ([lng, lat]) => {
  const n = 2 ** TILE_ZOOM;
  const x = Math.floor(((lng + 180) / 360) * n);
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return [x, y];
};
async function buildingsInTile(x, y) {
  const key = `${x}/${y}`;
  if (!tileCache.has(key)) {
    const url = template.replace('{z}', TILE_ZOOM).replace('{x}', x).replace('{y}', y);
    const tileResponse = await fetch(url);
    if (!tileResponse.ok) throw new Error(`지도 조각을 받지 못했어요 (${tileResponse.status}): ${url}`);
    const tile = new VectorTile(new PbfReader(new Uint8Array(await tileResponse.arrayBuffer())));
    const layer = tile.layers.building;
    const features = [];
    for (let i = 0; layer && i < layer.length; i++) features.push(layer.feature(i).toGeoJSON(x, y, TILE_ZOOM));
    tileCache.set(key, features);
  }
  return tileCache.get(key);
}
const reach = (POPULATION_RADIUS_M * 1.2) / 111320; // 원을 덮는 네모 (도)
for (const [i, station] of stations.entries()) {
  const [lng, lat] = station.coord;
  const [x0, y0] = tileXY([lng - reach, lat + reach]);
  const [x1, y1] = tileXY([lng + reach, lat - reach]);
  const features = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) features.push(...(await buildingsInTile(x, y)));
  const { population, builtArea, cells } = populationFromBuildings(features, station.coord);
  station.population = population;
  station.builtArea = builtArea;
  const grid = cells ? packCells(station.coord, cells) : null;
  if (grid) station.cellGrid = grid;
  else station.cells = cells;
  if ((i + 1) % 50 === 0) console.log(`인구 잰 역 ${i + 1}/${stations.length}`);
}

// ── 5. 게임 저장 파일 모양으로 쓴다 (save.js의 saveData와 같은 모양) ──
const save = {
  version: 1,
  region: REGION,
  network: {
    stations,
    tracks,
    routes,
    nextStationNumber: stations.length + 1,
    nextTrackNumber: tracks.length + 1,
    nextRouteNumber: routes.length + 1,
    money: REGIONS[REGION].startMoney,
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
mkdirSync(new URL('../src/data/presets/', import.meta.url), { recursive: true });
const text = JSON.stringify(save);
writeFileSync(new URL(`../src/data/presets/${REGION}.json`, import.meta.url), text);
const average = Math.round(stations.reduce((sum, s) => sum + s.population, 0) / stations.length);
console.log(
  `역 ${stations.length}곳, 선로 ${tracks.length}개, 노선 ${routes.length}개, 평균 인구 ${average}명, 파일 ${Math.round(text.length / 1024)} KB`,
);
