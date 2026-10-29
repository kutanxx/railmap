// 실제 노선망 프리셋: 실제 도시의 지하철 노선을 미리 깔아 둔 게임 저장 (tools/make-presets.mjs가 src/data/presets/에 만든다).
// 시작 화면 지도 카드의 [실제 노선망으로 시작]이 그 지도의 샌드박스로 연다 (ui/startScreen.js, main.js).
// 자료가 커서(서울 약 640KB) 처음부터 받지 않고, 고를 때만 받는다.
// 노선 자료: © OpenStreetMap 기여자 (ODbL)

// 지도 id → { label: 카드에 보일 노선 설명, load: 자료 받기 }
const PRESETS = {
  seoul: { label: '1~9호선', load: () => import('../data/presets/seoul.json') },
};

// 그 지도의 프리셋 (없으면 null)
export const presetOf = (regionId) => PRESETS[regionId] ?? null;

// 프리셋 자료(게임 저장 모양)를 받는다
export async function loadPreset(regionId) {
  return (await PRESETS[regionId].load()).default;
}
