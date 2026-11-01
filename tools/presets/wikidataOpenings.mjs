// 런던·파리·뉴욕·시카고 실제 노선망의 개통 연도 (대략): 역마다 Wikidata의 "공식 개통일"(P1619, 없으면 "시작"P571)과
// 노선(계통)마다 처음 생긴 해(LINE_STARTS)로 정한다. 이웃한 두 역 사이 구간 = 그 노선이 생긴 해, 두 역의 개통 연도 중 가장 늦은 해.
// (빅토리아선이 1863년에 연 킹스크로스를 지나도 그 구간은 1968년. 연장 구간은 새로 연 역의 해)
// 역 하나가 여러 노선의 역을 한 항목으로 묶은 곳은 가장 먼저 연 해가 적혀 있어서, 나중에 지나간 노선의 구간이 노선이 생긴 해로 나올 수 있다 (대략).
// 양옆 역보다 늦게 연 역(나중에 사이에 끼운 역)은 양옆 중 늦은 해로 친다 (한국 도시처럼. 안 그러면 그 역 앞뒤로 노선이 끊겨 조각난다).
// 프리셋 역과 Wikidata 항목은 OpenStreetMap 역(railway=station)의 wikidata 꼬리표로 잇는다: 같은 이름이면 600m, 아니면 200m 안의 가장 가까운 역.
// Wikidata 자료는 누구나 마음대로 쓸 수 있다 (CC0). 인터넷이 필요하다
import { overpass, meters } from './osm.mjs';
import { setOpenings } from './openings.mjs';
import { REGIONS } from '../../src/regions.js';

// 노선(계통) 이름(갈래 이름 " · …" 앞) → 그 노선(계통)이 처음 다니기 시작한 해 (위키백과 각 노선 문서)
export const LINE_STARTS = {
  london: {
    베이커루선: 1906,
    센트럴선: 1900,
    서클선: 1884, // 고리를 이어 도는 운행을 시작한 해
    디스트릭트선: 1868,
    '해머스미스 & 시티선': 1864,
    주빌리선: 1979,
    메트로폴리탄선: 1863,
    노던선: 1890, // 시티 앤드 사우스 런던 철도
    피카딜리선: 1906,
    빅토리아선: 1968,
    '워털루 & 시티선': 1898,
    엘리자베스선: 2022,
    DLR: 1987,
  },
  paris: {
    '1호선': 1900,
    '2호선': 1900,
    '3호선': 1904,
    '3bis호선': 1971,
    '4호선': 1908,
    '5호선': 1906,
    '6호선': 1909,
    '7호선': 1910,
    '7bis호선': 1967,
    '8호선': 1913,
    '9호선': 1922,
    '10호선': 1923,
    '11호선': 1935,
    '12호선': 1910,
    '13호선': 1911,
    '14호선': 1998,
    'RER A': 1969,
    'RER B': 1977,
  },
  newyork: {
    '1 트레인': 1904,
    '2 트레인': 1904,
    '3 트레인': 1904,
    '4 트레인': 1904,
    '5 트레인': 1904,
    '6 트레인': 1904,
    '7 트레인': 1915,
    'A 트레인': 1932,
    'C 트레인': 1933,
    'E 트레인': 1933,
    'B 트레인': 1940,
    'D 트레인': 1940,
    'F 트레인': 1940,
    'M 트레인': 1914,
    'G 트레인': 1933,
    'J 트레인': 1893,
    'L 트레인': 1924,
    'N 트레인': 1915,
    'Q 트레인': 1920,
    'R 트레인': 1915,
    'W 트레인': 1917,
  },
  chicago: {
    레드라인: 1900,
    블루라인: 1895,
    브라운라인: 1907,
    그린라인: 1892,
    오렌지라인: 1993,
    퍼플라인: 1908,
    핑크라인: 2006, // 핑크라인으로 다니기 시작한 해 (선로는 더 오래됐다)
    옐로라인: 1964,
  },
};

const SPARQL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'railmap-preset-tool (https://github.com/kutanxx/railmap)';
// 같은 이름이면 이 거리(m) 안, 이름이 달라도 이 거리(m) 안의 OpenStreetMap 역을 같은 역으로 본다
const SAME_NAME_M = 600;
const NEAR_M = 200;
const nameKey = (name) =>
  (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

// Wikidata 항목들의 개통 연도: Map(Q번호 → 해). 공식 개통일(P1619)이 있으면 그중 가장 이른 해, 없으면 시작(P571)
async function openingYears(ids) {
  const years = new Map();
  for (let i = 0; i < ids.length; i += 300) {
    const values = ids.slice(i, i + 300).map((id) => `wd:${id}`).join(' ');
    const query = `SELECT ?item ?opened ?inception WHERE { VALUES ?item { ${values} }
      OPTIONAL { ?item wdt:P1619 ?opened } OPTIONAL { ?item wdt:P571 ?inception } }`;
    const response = await fetch(`${SPARQL}?format=json&query=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
    });
    if (!response.ok) throw new Error(`Wikidata 자료를 받지 못했어요 (${response.status})`);
    const found = new Map(); // Q번호 → { opened: [해], inception: [해] }
    for (const row of (await response.json()).results.bindings) {
      const id = row.item.value.split('/').pop();
      const entry = found.get(id) ?? { opened: [], inception: [] };
      if (row.opened) entry.opened.push(Number(row.opened.value.slice(0, 4)));
      if (row.inception) entry.inception.push(Number(row.inception.value.slice(0, 4)));
      found.set(id, entry);
    }
    for (const [id, { opened, inception }] of found) {
      const list = (opened.length ? opened : inception).filter((year) => year > 1800 && year < 2100);
      if (list.length) years.set(id, Math.min(...list));
    }
  }
  return years;
}

// LINE_STARTS가 있는 도시면 개통 연도를 적고 true, 아니면 false
export async function applyWikidataOpenings(regionId, network) {
  const starts = LINE_STARTS[regionId];
  if (!starts) return false;
  const [west, south, east, north] = REGIONS[regionId].bounds;
  const osm = await overpass(
    `[out:json][timeout:120];nwr["railway"="station"]["wikidata"](${south},${west},${north},${east});out center tags;`,
  );
  const places = osm.elements.map((element) => ({
    key: nameKey(element.tags.name),
    wikidata: element.tags.wikidata,
    coord: [element.lon ?? element.center.lon, element.lat ?? element.center.lat],
  }));
  // 프리셋 역 → Wikidata 항목
  const itemOf = new Map();
  for (const station of network.stations) {
    const around = places
      .map((place) => ({ ...place, distance: meters(place.coord, station.coord) }))
      .sort((a, b) => a.distance - b.distance);
    const pick =
      around.find((place) => place.key === nameKey(station.name) && place.distance < SAME_NAME_M) ??
      around.find((place) => place.distance < NEAR_M);
    if (pick) itemOf.set(station.id, pick.wikidata);
  }
  const years = await openingYears([...new Set(itemOf.values())]);
  const stationYear = (id) => years.get(itemOf.get(id));
  console.log(`  Wikidata 개통 연도가 있는 역 ${network.stations.filter((s) => stationYear(s.id)).length}/${network.stations.length}`);
  setOpenings(network, (route) => {
    const base = route.name.split(' · ')[0];
    const start = starts[base];
    if (!start) throw new Error(`노선이 생긴 해가 없어요: ${route.name} (tools/presets/wikidataOpenings.mjs)`);
    // 노선 위 역마다 해 (그 노선이 생긴 해보다 이르면 그해), 사이에 끼운 역은 양옆 중 늦은 해로
    const years = route.stations.map((id) => Math.max(start, stationYear(id) ?? start));
    for (let changed = true; changed; ) {
      changed = false;
      for (let i = 1; i + 1 < years.length; i++) {
        const sides = Math.max(years[i - 1], years[i + 1]);
        if (years[i] > sides) {
          years[i] = sides;
          changed = true;
        }
      }
    }
    return years.slice(1).map((year, k) => Math.max(years[k], year));
  });
  return true;
}
