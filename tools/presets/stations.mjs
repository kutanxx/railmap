// 실제 노선망 프리셋의 역: 정류 위치의 이름 고르기, 정류 위치를 역(환승역)으로 합치기 (tools/make-presets.mjs가 부른다)
import { meters, round6 } from './osm.mjs';

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
// 같은 이름인지 볼 때 악센트·띄어쓰기·문장 부호·대소문자는 무시한다 ("Réaumur Sébastopol"과 "Réaumur - Sébastopol")
const sameNameKey = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

// 역 이름: 한국·일본 도시는 한국어 이름을 먼저 쓴다. 정류 위치에 한국어 이름이 없으면 같은 이름의 가까운 역(railway=station)에서
// 찾고, 그래도 없으면 영어 이름 (한자보다 읽기 쉬워서). 다른 나라 도시는 그 나라 이름만 쓴다
// (한국어 이름이 있는 역이 파리 셋 중 하나, 런던·시카고는 거의 없어서 섞이면 오히려 읽기 어렵다)
// stationNodes: 지도 범위 안의 역(railway=station) 지물, country: 나라 (regions.js). 결과: 정류 위치(노드) → 역 이름
export function makeStopName(stationNodes, country) {
  // 일본 이름은 작은 ヶ·큰 ケ를 섞어 써서 (市ヶ谷·市ケ谷) 같게 맞춘다
  const plain = (name) => name?.replace(/駅$/, '').replace(/[ヶヵ]/g, 'ケ').trim();
  const stationLike = (node) =>
    stationNodes.find(
      (station) => plain(station.tags?.name) === plain(node.tags?.name) && meters([station.lon, station.lat], [node.lon, node.lat]) < 800,
    );
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
  return stopName;
}

// 정류 위치를 역으로 합친다 (같은 이름이고 SAME_NAME_M 안, MERGE_M 안, 괄호만 다르거나 JOINS에 적힌 이름이면 LINKED_M 안)
// picked: 고른 계통들 ({ stops, base }), joins: 그 도시의 JOINS. 계통마다 variant.groups(정류 위치마다 역 묶음)를 적고,
// 묶음마다 group.station을 만든다. 결과: 게임 역 목록 [{ id, name, coord, angle }]
// apart: 그 도시의 APART (가까워도 합치지 않는 이름 짝), sameNameM: 같은 이름을 같은 역으로 치는 거리 (도시마다 다를 때)
export function mergeStations(picked, joins = [], apart = [], sameNameM = SAME_NAME_M) {
  const pairIn = (pairs, a, b) => pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const linked = (a, b) => inBrackets(a, b) || inBrackets(b, a) || pairIn(joins, a, b);
  const sameStation = (a, b) => {
    if (pairIn(apart, a.name, b.name)) return false;
    const gap = meters(a.coord, b.coord);
    return gap < MERGE_M || (sameNameKey(a.name) === sameNameKey(b.name) && gap < sameNameM) || (linked(a.name, b.name) && gap < LINKED_M);
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
  // 같은 이름인데 꽤 떨어진 정류 위치를 합친 역도 알려준다 (따로인 역을 잘못 합쳤는지 살펴보게)
  for (const group of groups.filter((g) => g.names.size === 1)) {
    let far = 0;
    for (const a of group.coords) for (const b of group.coords) far = Math.max(far, meters(a, b));
    if (far > 250) console.log(`  같은 이름으로 합친 역: ${[...group.names][0]} (가장 먼 정류 위치끼리 ${Math.round(far)}m)`);
  }
  for (const group of groups.filter((g) => g.names.size > 1)) {
    let far = 0;
    for (const a of group.coords) for (const b of group.coords) far = Math.max(far, meters(a, b));
    console.log(`  합친 역: ${[...group.names].join(' + ')} (가장 먼 정류 위치끼리 ${Math.round(far)}m)`);
  }
  return stations;
}
