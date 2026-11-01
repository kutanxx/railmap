// 이미 만든 실제 노선망 프리셋에 개통 연도만 다시 적는다 (노선 자료를 다시 받지 않고): node tools/add-openings.mjs [지도 id …]
// 개통 연도 표(presets/openings.mjs), 일본 N05 자료(presets/n05.mjs, 환경 변수 N05), Wikidata(presets/wikidataOpenings.mjs, 인터넷)를 고친 뒤에 쓴다.
// 지도 id를 적지 않으면 개통 연도를 아는 모든 도시. 노선 모양·인구는 그대로 두고 opened만 바꾼다 (make-presets.mjs와 같은 계산)
import { readFileSync, writeFileSync } from 'node:fs';
import { OPENINGS, applyOpenings } from './presets/openings.mjs';
import { applyN05Openings } from './presets/n05.mjs';
import { LINE_STARTS, applyWikidataOpenings } from './presets/wikidataOpenings.mjs';

const ids = process.argv.slice(2);
for (const id of ids.length ? ids : [...Object.keys(OPENINGS), 'tokyo', 'osaka', ...Object.keys(LINE_STARTS)]) {
  const path = new URL(`../src/data/presets/${id}.json`, import.meta.url);
  const save = JSON.parse(readFileSync(path, 'utf8'));
  const known =
    applyOpenings(id, save.network) ||
    applyN05Openings(id, save.network, process.env.N05) ||
    (await applyWikidataOpenings(id, save.network));
  if (!known) {
    throw new Error(`개통 연도를 모르는 도시예요: ${id}`);
  }
  writeFileSync(path, JSON.stringify(save));
  const years = [...new Set(save.network.tracks.map((track) => track.opened))].sort((a, b) => a - b);
  console.log(`${id}: 개통 연도 ${years[0]} ~ ${years.at(-1)} (${years.length}가지)`);
}
