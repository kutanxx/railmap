// 실제 노선망 프리셋: 실제 도시의 지하철 노선을 미리 깔아 둔 게임 저장 (tools/make-presets.mjs가 src/data/presets/에 만든다).
// 시작 화면 지도 카드의 [실제 노선망으로 시작]이 그 지도의 샌드박스로 연다 (ui/startScreen.js, main.js).
// 자료가 커서(뉴욕 약 1.2MB) 처음부터 받지 않고, 고를 때만 받는다.
// 뉴욕은 역이 400곳 가까이 되어 승객 계산이 0.3초쯤 걸리지만, 계산은 화면과 따로 도는 일꾼이 해서 화면이 멈추지 않는다 (economyJob.js).
// 노선 자료: © OpenStreetMap 기여자 (ODbL)

// 지도 id → { label: 카드에 보일 노선 설명, load: 자료 받기 }
const PRESETS = {
  seoul: { label: '1~9호선', load: () => import('../data/presets/seoul.json') },
  busan: { label: '1~4호선', load: () => import('../data/presets/busan.json') },
  incheon: { label: '인천 1·2호선', load: () => import('../data/presets/incheon.json') },
  daegu: { label: '1~3호선', load: () => import('../data/presets/daegu.json') },
  daejeon: { label: '1호선', load: () => import('../data/presets/daejeon.json') },
  gwangju: { label: '1호선', load: () => import('../data/presets/gwangju.json') },
  tokyo: { label: '도쿄메트로·도에이 13개 노선', load: () => import('../data/presets/tokyo.json') },
  osaka: { label: '오사카 메트로 9개 노선', load: () => import('../data/presets/osaka.json') },
  newyork: { label: '지하철 21개 계통', load: () => import('../data/presets/newyork.json') },
  chicago: { label: "'L' 8개 노선", load: () => import('../data/presets/chicago.json') },
  london: { label: '지하철 11개 노선', load: () => import('../data/presets/london.json') },
  paris: { label: '메트로 1~14호선', load: () => import('../data/presets/paris.json') },
};

// 그 지도의 프리셋 (없으면 null)
export const presetOf = (regionId) => PRESETS[regionId] ?? null;

// 프리셋 자료(게임 저장 모양)를 받는다
export async function loadPreset(regionId) {
  return (await PRESETS[regionId].load()).default;
}
