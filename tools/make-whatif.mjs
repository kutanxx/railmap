// "만약에" 노선 자료 만들기: node tools/make-whatif.mjs [지도 id …] → src/data/whatif.json (인터넷 필요).
// 지도 id를 적으면 그 도시만 다시 만들고 나머지 도시는 파일에 있던 그대로 둔다.
// tools/presets/whatif.mjs의 노선마다 역 자리를 찾는다: 그 도시 실제 노선망 프리셋의 같은 이름 역 → OpenStreetMap 역(짓는 중·계획 포함) → 직접 적은 자리.
// 같은 이름이 여러 곳이면 바로 앞 역에서 가장 가까운 곳 (지도 범위 안만). 못 찾은 역은 빼고 알린다.
// 지도·역 자료: © OpenStreetMap 기여자 (ODbL)
import { readFileSync, writeFileSync } from 'node:fs';
import { REGIONS } from '../src/regions.js';
import { WHAT_IF } from './presets/whatif.mjs';
import { overpass, meters, sleep, round6 } from './presets/osm.mjs';

const nameKey = (name) =>
  (name ?? '')
    .replace(/駅|（仮称）|\(仮称\)|\(가칭\)|\(proposed\)/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase();

const OUTPUT = new URL('../src/data/whatif.json', import.meta.url);
const wanted = process.argv.slice(2);
const result = wanted.length ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : {};
for (const [regionId, lines] of Object.entries(WHAT_IF)) {
  if (wanted.length && !wanted.includes(regionId)) continue;
  console.log(`== ${REGIONS[regionId].name}`);
  const [west, south, east, north] = REGIONS[regionId].bounds;
  const inside = ([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north;
  const preset = JSON.parse(readFileSync(new URL(`../src/data/presets/${regionId}.json`, import.meta.url), 'utf8'));
  const presetStations = preset.network.stations.map((station) => ({ keys: [nameKey(station.name)], coord: station.coord }));
  const osm = await overpass(`[out:json][timeout:180];(
    node["railway"~"station|halt|stop|construction|proposed"]["name"](${south},${west},${north},${east});
    node["public_transport"~"station|stop_position"]["name"](${south},${west},${north},${east});
    node["construction:railway"="station"]["name"](${south},${west},${north},${east});
    node["proposed:railway"="station"]["name"](${south},${west},${north},${east});
  );out body;`);
  const osmStations = osm.elements.map((node) => ({
    keys: [node.tags.name, node.tags['name:ko'], node.tags['name:en']].filter(Boolean).map(nameKey),
    coord: [round6(node.lon), round6(node.lat)],
  }));

  result[regionId] = [];
  for (const line of lines) {
    const stations = [];
    for (const entry of line.stations) {
      const { name, find, coord } = typeof entry === 'string' ? { name: entry } : entry;
      const key = nameKey(find ?? name);
      const near = stations.at(-1)?.coord;
      const closest = (list) =>
        list
          .filter((place) => place.keys.includes(key) && inside(place.coord))
          .sort((a, b) => (near ? meters(a.coord, near) - meters(b.coord, near) : 0))[0]?.coord;
      const sources = line.prefer === 'osm' ? [osmStations, presetStations] : [presetStations, osmStations];
      const found = coord ?? closest(sources[0]) ?? closest(sources[1]);
      if (!found) {
        console.log(`  ${line.name}: 역 자리를 못 찾아 뺐어요 → ${name}`);
        continue;
      }
      stations.push({ name, coord: found });
    }
    console.log(`  ${line.name}: 역 ${stations.length}곳 (${stations.map((station) => station.name).join(' → ')})`);
    if (stations.length >= 2) result[regionId].push({ id: line.id, name: line.name, status: line.status, stations });
  }
  await sleep(4000);
}
writeFileSync(OUTPUT, `${JSON.stringify(result, null, 1)}\n`);
console.log('\nsrc/data/whatif.json에 적었어요');
