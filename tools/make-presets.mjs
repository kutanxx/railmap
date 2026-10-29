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

// 도시마다 넣을 노선: number = lineColors.js의 그 도시 목록 번호(색과 이름), name = 다른 이름을 쓸 때,
// relation = 계통 하나를 직접 고를 때 (OpenStreetMap route 번호), master = 노선 전체(route_master 번호, 계통·갈래는 저절로 고른다)
const CITIES = {
  seoul: [
    { number: 1, name: '1호선 경원·경인선', relation: 8691809 }, // 소요산 → 인천
    { number: 1, name: '1호선 경부선', relation: 8692707 }, // 광운대 → 신창
    { number: 2, relation: 2404374 }, // 외선순환 (시청에서 시작해 시청으로 돌아온다)
    { number: 2, name: '2호선 성수지선', relation: 4729405 },
    { number: 2, name: '2호선 신정지선', relation: 4729407 },
    { number: 3, relation: 443803 }, // 대화 → 오금
    { number: 4, relation: 2718884 }, // 불암산 → 오이도
    { number: 5, relation: 12497486 }, // 방화 → 하남검단산
    { number: 5, name: '5호선 마천지선', relation: 4744338 }, // 강동 → 마천
    { number: 6, relation: 12080315 }, // 응암순환 → 신내
    { number: 7, relation: 12746493 }, // 장암 → 석남
    { number: 8, relation: 2718901 }, // 별내 → 모란
    { number: 9, relation: 2718888 }, // 개화 → 중앙보훈병원
  ],
  busan: [
    { number: 1, master: 8255698 },
    { number: 2, master: 8258658 },
    { number: 3, master: 8247017 },
    { number: 4, master: 8258702 },
  ],
  daegu: [
    { number: 1, master: 7845971 },
    { number: 2, master: 7845969 },
    { number: 3, master: 7845965 },
  ],
  incheon: [
    { number: 1, master: 7854149 },
    { number: 2, master: 7527498 },
  ],
  daejeon: [{ number: 1, master: 7792528 }],
  gwangju: [{ number: 1, master: 13538911 }],
  tokyo: [
    { number: 1, master: 8026077 }, // 긴자선
    { number: 2, master: 8015940 }, // 마루노우치선 (호난초 갈래)
    { number: 3, master: 8026149 }, // 히비야선
    { number: 4, master: 8026124 }, // 도자이선
    { number: 5, master: 8026069 }, // 지요다선
    { number: 6, master: 8026115 }, // 유라쿠초선
    { number: 7, master: 8026157 }, // 한조몬선
    { number: 8, master: 8026071 }, // 난보쿠선
    { number: 9, master: 8026161 }, // 후쿠토신선
    { number: 10, master: 8019854 }, // 도에이 아사쿠사선
    { number: 11, master: 8019914 }, // 도에이 미타선
    { number: 12, master: 8019866 }, // 도에이 신주쿠선
    { number: 13, master: 8019893 }, // 도에이 오에도선
  ],
  osaka: [
    { number: 1, master: 8028805 }, // 미도스지선
    { number: 2, master: 8028879 }, // 다니마치선
    { number: 3, master: 8028853 }, // 요쓰바시선
    { number: 4, master: 8028811 }, // 주오선
    { number: 5, master: 8028801 }, // 센니치마에선
    { number: 6, master: 8028828 }, // 사카이스지선
    { number: 7, master: 8028846 }, // 나가호리쓰루미료쿠치선
    { number: 8, master: 8028826 }, // 이마자토스지선
    { number: 9, master: 9603949 }, // 난코포트타운선
  ],
  chicago: [
    { number: 1, master: 2584583 }, // 레드라인
    { number: 2, master: 2672370 }, // 블루라인
    { number: 3, master: 2562976 }, // 브라운라인
    { number: 4, master: 2613599 }, // 그린라인
    { number: 5, master: 2578312 }, // 오렌지라인
    { number: 6, master: 2675822 }, // 퍼플라인
    { number: 7, master: 2656070 }, // 핑크라인
    { number: 8, master: 2622574 }, // 옐로라인
  ],
  london: [
    { number: 1, master: 7666698 }, // 베이커루선
    { number: 2, master: 7254206 }, // 센트럴선
    { number: 3, master: 7671007 }, // 서클선
    { number: 4, master: 7677096 }, // 디스트릭트선
    { number: 6, master: 7666927 }, // 해머스미스 & 시티선
    { number: 7, master: 7673326 }, // 주빌리선
    { number: 8, master: 7673626 }, // 메트로폴리탄선
    { number: 9, master: 7702944 }, // 노던선
    { number: 10, master: 7702940 }, // 피카딜리선
    { number: 11, master: 6354922 }, // 빅토리아선
    { number: 12, master: 7672075 }, // 워털루 & 시티선
  ],
  paris: [
    { number: 1, master: 3328695 },
    { number: 2, master: 7227705 },
    { number: 3, master: 7733214 },
    { number: 13, name: '3bis호선', master: 7420646 }, // 13호선과 같은 하늘색
    { number: 4, master: 3326845 },
    { number: 5, master: 7420645 },
    { number: 6, master: 3328765 },
    { number: 7, master: 3328805 },
    { number: 6, name: '7bis호선', master: 2554103 }, // 6호선과 같은 연두색
    { number: 8, master: 7420644 },
    { number: 9, master: 3328717 },
    { number: 10, master: 3328741 },
    { number: 11, master: 7420643 },
    { number: 12, master: 7420642 },
    { number: 13, master: 7420641 },
    { number: 14, master: 3328694 },
  ],
};

// 이름이 같은 정류 위치는 이만큼(미터) 안이면 같은 역으로 친다 (멀리 떨어진 같은 이름 역은 따로)
const SAME_NAME_M = 1000;
// 이름이 달라도 이만큼(미터) 가까운 정류 위치는 같은 역으로 친다 (더 멀면 갈아탈 수 없는 이웃 역일 때가 많다:
// 파리 Saint-Germain-des-Prés와 Mabillon은 90m, 런던 Regent's Park와 Great Portland Street는 190m)
const MERGE_M = 80;
// 한 이름이 다른 이름을 품으면 (4호선 "총신대입구 (이수)"와 7호선 "이수") 이만큼(미터) 안까지 같은 역으로 친다
const LINKED_M = 400;
// 긴 이름이 짧은 이름에 괄호만 더한 것인지 ("대림(구로구청)"과 "대림", "총신대입구 (이수)"와 "이수", "오시아게〈스카이트리〉"와 "오시아게")
// ("용산"과 "신용산", "Aldgate"와 "Aldgate East"처럼 이름 일부만 같은 이웃 역은 합치지 않는다)
const inBrackets = (long, short) => {
  const outside = long.replace(/\s*[(（〈][^)）〉]*[)）〉]\s*/g, '').trim();
  const inside = [...long.matchAll(/[(（〈]([^)）〉]*)[)）〉]/g)].map((match) => match[1].trim());
  return long !== short && (outside === short || inside.includes(short));
};
// 이름이 다르지만 실제로 갈아타는 역 (LINKED_M 안이면 같은 역으로 친다)
const JOINS = {
  tokyo: [
    ['고라쿠엔', '가스가'],
    ['히가시니혼바시', '바쿠로요코야마'],
    ['아와지초', '오가와마치'],
    ['키타센쥬', '기타센주'], // 같은 역의 다른 한글 표기
  ],
  osaka: [['다니마치로쿠초메', '다니마치6초메']], // 같은 역의 다른 한글 표기
};
// 같은 이름인지 볼 때 악센트·띄어쓰기·문장 부호·대소문자는 무시한다 ("Réaumur Sébastopol"과 "Réaumur - Sébastopol")
const sameNameKey = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();
// 이미 고른 계통의 정류 위치에서 이만큼(미터) 안이면 같은 역으로 보고 갈래를 가린다
const COVERED_M = 250;
// 갈래(지선)로 따로 넣으려면 그 노선에서 아직 안 다닌 역이 이만큼은 있어야 한다 (반대 방향·짧게 도는 계통은 빼려고)
const BRANCH_MIN_NEW = 2;
// 노선마다 열차 수: 역 수 ÷ 이 값 (2대 ~ MAX_TRAINS_PER_ROUTE대)
const STATIONS_PER_TRAIN = 4;
// 선로 모양: 실제 선로에서 이만큼(미터)보다 덜 벗어나는 점은 뺀다 (작을수록 정확하지만 경유점이 많아진다)
const SIMPLIFY_M = 12;
// 역에서 이만큼(미터) 안의 경유점은 뺀다 (역 자리를 여러 노선의 가운데로 옮겨서, 역 바로 옆에서 꺾이지 않게)
const STATION_CLEAR_M = 60;
// 정류 위치가 선로 길에서 이만큼(미터) 넘게 떨어지면 그 노선은 곧은 선로로 둔다 (자료가 어긋난 곳)
const SNAP_MAX_M = 250;
const TILE_ZOOM = 14;
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'railmap-preset-tool (https://github.com/kutanxx/railmap)';

const round6 = (value) => Math.round(value * 1e6) / 1e6;
const meters = ([lng1, lat1], [lng2, lat2]) => {
  const x = (lng2 - lng1) * 111320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = (lat2 - lat1) * 110540;
  return Math.hypot(x, y);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Overpass API 묻기. 바쁘면(429·502·504) 조금 쉬고 다시 묻는다
async function overpass(query) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (response.ok) return response.json();
    if (attempt >= 8 || ![429, 502, 503, 504].includes(response.status)) {
      throw new Error(`OpenStreetMap 자료를 받지 못했어요 (${response.status})`);
    }
    console.log(`  Overpass가 바빠요 (${response.status}), ${attempt * 15}초 뒤 다시`);
    await sleep(attempt * 15000);
  }
}

// ── 선로 길 ──
// 계통의 선로 조각(way)들을 이어 한 줄로: [[경도, 위도], …]. 조각이 끊긴 곳도 가까운 끝끼리 그대로 잇는다
function routePath(relation, ways) {
  const pieces = relation.members
    .filter((member) => member.type === 'way' && !/platform/.test(member.role))
    .map((member) => ways.get(member.ref)?.geometry?.map(({ lon, lat }) => [lon, lat]))
    .filter((coords) => coords && coords.length >= 2);
  if (pieces.length === 0) return null;
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  // 첫 조각의 방향: 다음 조각과 맞닿는 끝이 뒤로 가게
  let path = [...pieces[0]];
  if (pieces[1] && (same(path[0], pieces[1][0]) || same(path[0], pieces[1].at(-1)))) path.reverse();
  for (const piece of pieces.slice(1)) {
    const end = path.at(-1);
    let next = piece;
    if (same(end, piece.at(-1)) || (!same(end, piece[0]) && meters(end, piece.at(-1)) < meters(end, piece[0]))) {
      next = [...piece].reverse();
    }
    path = path.concat(same(end, next[0]) ? next.slice(1) : next);
  }
  return path;
}

// 정류 위치들을 선로 길 위의 자리로: 차례대로 앞으로만 나아가며 가장 가까운 곳 ({ index: 조각 번호, t: 조각 안 비율, gap: 떨어진 거리 m })
function snapStops(path, coords) {
  const result = [];
  let from = 0;
  for (const coord of coords) {
    let best = null;
    for (let i = from; i + 1 < path.length; i++) {
      const [a, b] = [path[i], path[i + 1]];
      const scale = Math.cos((coord[1] * Math.PI) / 180);
      const ax = (a[0] - coord[0]) * scale;
      const ay = a[1] - coord[1];
      const dx = (b[0] - a[0]) * scale;
      const dy = b[1] - a[1];
      const length = dx * dx + dy * dy;
      const t = length > 0 ? Math.min(1, Math.max(0, -(ax * dx + ay * dy) / length)) : 0;
      const gap = meters(coord, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      if (!best || gap < best.gap) best = { index: i, t, gap };
      // 가까운 곳을 찾은 뒤 멀리 벗어나면 그만 본다 (고리 노선이 나중에 다시 지나가는 곳을 잡지 않게)
      if (best.gap < SNAP_MAX_M && gap > best.gap + 2000) break;
    }
    if (!best) return null;
    result.push(best);
    from = best.index;
  }
  return result;
}

const pointAt = (path, { index, t }) => {
  const [a, b] = [path[index], path[index + 1] ?? path[index]];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};

// 더글러스-퍼커: 직선에서 tolerance(m)보다 덜 벗어나는 점을 뺀다
function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const [first, last] = [points[0], points.at(-1)];
  let farthest = 0;
  let at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const gap = distanceToSegment(points[i], first, last);
    if (gap > farthest) {
      farthest = gap;
      at = i;
    }
  }
  if (farthest <= tolerance) return [first, last];
  return simplify(points.slice(0, at + 1), tolerance).slice(0, -1).concat(simplify(points.slice(at), tolerance));
}
function distanceToSegment(point, a, b) {
  const scale = Math.cos((point[1] * Math.PI) / 180);
  const dx = (b[0] - a[0]) * scale;
  const dy = b[1] - a[1];
  const px = (point[0] - a[0]) * scale;
  const py = point[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length > 0 ? Math.min(1, Math.max(0, (px * dx + py * dy) / length)) : 0;
  return meters(point, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
}

// 두 정류 위치 사이 선로 길의 경유점 (역 자리 fromCoord·toCoord 가까운 점은 빼고). 길이 이상하면 null (곧은 선로)
function waypointsBetween(path, start, end, fromCoord, toCoord) {
  if (!path || start.gap > SNAP_MAX_M || end.gap > SNAP_MAX_M) return null;
  if (end.index < start.index || (end.index === start.index && end.t < start.t)) return null;
  const points = [pointAt(path, start), ...path.slice(start.index + 1, end.index + 1), pointAt(path, end)];
  let length = 0;
  for (let i = 1; i < points.length; i++) length += meters(points[i - 1], points[i]);
  const straight = meters(fromCoord, toCoord);
  // 선로 길이가 곧은 거리의 2.5배를 넘으면 자료가 어긋난 것으로 본다 (끊긴 조각을 잘못 이었을 때)
  if (length > straight * 2.5 + 300) return null;
  return simplify(points, SIMPLIFY_M)
    .slice(1, -1)
    .filter((point) => meters(point, fromCoord) > STATION_CLEAR_M && meters(point, toCoord) > STATION_CLEAR_M)
    .map(([lng, lat]) => [round6(lng), round6(lat)]);
}

// ── 지도 조각의 건물 ──
let tileTemplate = null;
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
    if (!tileTemplate) {
      const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
      tileTemplate = (await (await fetch(style.sources.openmaptiles.url)).json()).tiles[0];
    }
    const url = tileTemplate.replace('{z}', TILE_ZOOM).replace('{x}', x).replace('{y}', y);
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

  // 역 이름: 한국·일본 도시는 한국어 이름을 먼저 쓴다. 정류 위치에 한국어 이름이 없으면 같은 이름의 가까운 역(railway=station)에서
  // 찾고, 그래도 없으면 영어 이름 (한자보다 읽기 쉬워서). 다른 나라 도시는 그 나라 이름만 쓴다
  // (한국어 이름이 있는 역이 파리 셋 중 하나, 런던·시카고는 거의 없어서 섞이면 오히려 읽기 어렵다)
  const stationNodes = (await overpass(`[out:json][timeout:120];node["railway"="station"](${south},${west},${north},${east});out body;`))
    .elements;
  // 일본 이름은 작은 ヶ·큰 ケ를 섞어 써서 (市ヶ谷·市ケ谷) 같게 맞춘다
  const plain = (name) => name?.replace(/駅$/, '').replace(/[ヶヵ]/g, 'ケ').trim();
  const stationLike = (node) =>
    stationNodes.find(
      (station) => plain(station.tags?.name) === plain(node.tags?.name) && meters([station.lon, station.lat], [node.lon, node.lat]) < 800,
    );
  const { country } = REGIONS[regionId];
  const korean = ['kr', 'jp'].includes(country);
  const stopName = (node) => {
    const station = korean ? stationLike(node) : null;
    const name =
      (korean ? (node.tags?.['name:ko'] ?? station?.tags?.['name:ko']) : null) ??
      // 한국 도시는 그 나라 이름이 한국어라서 영어보다 먼저
      (country === 'jp' ? (node.tags?.['name:en'] ?? station?.tags?.['name:en']) : null) ??
      node.tags?.name ??
      '?';
    // "아사쿠사 역", "市ヶ谷駅", "오지 역 (도쿄 도)" → "아사쿠사", "市ヶ谷", "오지" (게임 역 이름에는 "역"을 붙이지 않는다,
    // 괄호 속 지역 이름은 백과사전처럼 같은 이름을 가리려고 붙인 것이라 뺀다)
    return name.replace(/ 역( \([^)]*\))?$/, '').replace(/駅$/, '').trim();
  };

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

  // 3. 정류 위치를 역으로 합친다 (같은 이름이고 SAME_NAME_M 안, 또는 MERGE_M 안)
  const joins = JOINS[regionId] ?? [];
  const linked = (a, b) =>
    inBrackets(a, b) || inBrackets(b, a) || joins.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const sameStation = (a, b) => {
    const gap = meters(a.coord, b.coord);
    return gap < MERGE_M || (sameNameKey(a.name) === sameNameKey(b.name) && gap < SAME_NAME_M) || (linked(a.name, b.name) && gap < LINKED_M);
  };
  const groups = []; // { names: Set, counts: Map(이름 → 정류 위치 수), stops: [] }
  const groupOf = (stop) => {
    let group = groups.find((g) => g.stops.some((other) => sameStation(other, stop)));
    if (!group) {
      group = { names: new Set(), counts: new Map(), stops: [] };
      groups.push(group);
    }
    group.names.add(stop.name);
    group.counts.set(stop.name, (group.counts.get(stop.name) ?? 0) + 1);
    group.stops.push(stop);
    return group;
  };
  for (const variant of picked) variant.groups = variant.stops.map(groupOf);
  const stations = groups.map((group, i) => {
    group.coords = group.stops.map((stop) => stop.coord);
    const lng = group.coords.reduce((sum, c) => sum + c[0], 0) / group.coords.length;
    const lat = group.coords.reduce((sum, c) => sum + c[1], 0) / group.coords.length;
    // 이름이 여럿이면: 한글 이름 먼저, 그중 정류 위치가 가장 많이 쓴 이름, 같으면 긴 것 (예: "총신대입구 (이수)")
    const hangul = [...group.names].filter((n) => /[가-힣]/.test(n));
    const name = (hangul.length ? hangul : [...group.names]).sort(
      (a, b) => group.counts.get(b) - group.counts.get(a) || b.length - a.length,
    )[0];
    group.station = { id: `s${i + 1}`, name, coord: [round6(lng), round6(lat)], angle: 0 };
    return group.station;
  });
  // 같은 이름의 다른 역이 있으면 지나는 노선 이름을 붙인다 ("Western (블루라인)", 시카고는 길 이름이 역 이름이라 많다).
  // 그래도 같으면 (한 노선의 두 갈래) 번호를 더 붙인다. 게임은 역 이름으로 찾기도 해서 이름이 겹치지 않게 한다
  const lineOf = new Map();
  for (const variant of picked) for (const group of variant.groups) if (!lineOf.has(group)) lineOf.set(group, variant.base);
  const sameName = new Map();
  for (const station of stations) sameName.set(station.name, (sameName.get(station.name) ?? 0) + 1);
  groups.forEach((group, i) => {
    if (sameName.get(stations[i].name) > 1) stations[i].name = `${stations[i].name} (${lineOf.get(group)})`;
  });
  const seen = new Map();
  for (const station of stations) {
    const count = (seen.get(station.name) ?? 0) + 1;
    seen.set(station.name, count);
    if (count > 1) station.name = `${station.name} ${count}`;
  }
  const renamed = stations.filter((station) => / \(/.test(station.name) && sameName.get(station.name.replace(/ \(.*$/, '')) > 1);
  if (renamed.length) console.log(`  이름이 같은 다른 역에 노선 이름을 붙임: ${renamed.map((station) => station.name).join(', ')}`);
  for (const group of groups.filter((g) => g.names.size > 1)) {
    let far = 0;
    for (const a of group.coords) for (const b of group.coords) far = Math.max(far, meters(a, b));
    console.log(`  합친 역: ${[...group.names].join(' + ')} (가장 먼 정류 위치끼리 ${Math.round(far)}m)`);
  }

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
      trainCount: Math.max(2, Math.min(MAX_TRAINS_PER_ROUTE, Math.round(stationIds.length / STATIONS_PER_TRAIN))),
    };
  });

  // 5. 역 주변 인구 (지도 조각의 건물로, 게임과 같은 계산)
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
  mkdirSync(new URL('../src/data/presets/', import.meta.url), { recursive: true });
  const text = JSON.stringify(save);
  writeFileSync(new URL(`../src/data/presets/${regionId}.json`, import.meta.url), text);
  const average = Math.round(stations.reduce((sum, s) => sum + s.population, 0) / stations.length);
  console.log(
    `역 ${stations.length}곳, 선로 ${tracks.length}개 (실제 모양 ${curvedTracks}개, 자료가 어긋나 곧게 ${fallbackTracks}개), 노선 ${routes.length}개, 평균 인구 ${average}명, 파일 ${Math.round(text.length / 1024)} KB`,
  );
}

const wanted = process.argv.slice(2);
for (const id of wanted.length ? wanted : Object.keys(CITIES)) {
  if (!CITIES[id]) throw new Error(`실제 노선망을 만들 수 없는 지도예요: ${id} (만들 수 있는 것: ${Object.keys(CITIES).join(', ')})`);
  await makePreset(id);
  await sleep(5000); // Overpass API를 너무 자주 부르지 않게
}
