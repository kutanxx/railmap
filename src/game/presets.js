// 실제 노선망 프리셋: 실제 도시의 지하철 노선을 미리 깔아 둔 게임 저장 (tools/make-presets.mjs가 src/data/presets/에 만든다).
// 시작 화면 지도 카드의 [실제 노선망으로 시작]이 그 지도의 샌드박스로 연다 (ui/startScreen.js, main.js).
// 자료가 커서(뉴욕 약 1.4MB) 처음부터 받지 않고, 고를 때만 받는다.
// 뉴욕은 역이 447곳이라 승객 계산이 0.5초쯤 걸리지만, 계산은 화면과 따로 도는 일꾼이 해서 화면이 멈추지 않는다 (economyJob.js).
// 노선 자료: © OpenStreetMap 기여자 (ODbL)

// 지도 id → { label: 카드에 보일 노선 설명, load: 자료 받기,
//            years: 타임머신으로 시작할 수 있는 해 (개통 연도가 적힌 프리셋만, game/timeMachine.js) }
const PRESETS = {
  seoul: {
    label: '1~9호선 외 4개 노선',
    load: () => import('../data/presets/seoul.json'),
    // 1호선만(1974), 1~4호선(1985), 5·7·8호선이 생긴 해(1996), 6호선·분당선 뒤(2005), 9호선 2단계(2015)
    years: [1974, 1985, 1996, 2005, 2015],
  },
  busan: {
    label: '1~4호선 · 동해선 · 김해경전철',
    load: () => import('../data/presets/busan.json'),
    years: [1985, 1994, 2005, 2011, 2017], // 1호선 첫 구간, 1호선 신평까지, 3호선, 4호선·김해경전철, 1호선 다대포
  },
  incheon: {
    label: '인천 1·2호선 · 공항철도',
    load: () => import('../data/presets/incheon.json'),
    years: [1999, 2007, 2016], // 인천 1호선, 공항철도, 인천 2호선
  },
  daegu: {
    label: '1~3호선',
    load: () => import('../data/presets/daegu.json'),
    years: [1997, 2005, 2015], // 1호선, 2호선, 3호선
  },
  daejeon: { label: '1호선', load: () => import('../data/presets/daejeon.json'), years: [2006] }, // 판암~정부청사
  gwangju: { label: '1호선', load: () => import('../data/presets/gwangju.json'), years: [2004] }, // 녹동~상무
  tokyo: { label: '도쿄메트로·도에이 · JR 야마노테선', load: () => import('../data/presets/tokyo.json') },
  osaka: { label: '오사카 메트로 · JR 순환선', load: () => import('../data/presets/osaka.json') },
  newyork: { label: '지하철 21개 계통', load: () => import('../data/presets/newyork.json') },
  chicago: { label: "'L' 8개 노선", load: () => import('../data/presets/chicago.json') },
  london: { label: '지하철 · 엘리자베스선 · DLR', load: () => import('../data/presets/london.json') },
  paris: { label: '메트로 1~14호선 · RER A·B', load: () => import('../data/presets/paris.json') },
};

// 그 지도의 프리셋 (없으면 null)
export const presetOf = (regionId) => PRESETS[regionId] ?? null;

// 프리셋 자료(게임 저장 모양)를 받는다
export async function loadPreset(regionId) {
  return (await PRESETS[regionId].load()).default;
}
