// 처음 쓸 때 안내: 튜토리얼(역 → 선로 → 노선 → 출발) 뒤에 나온 기능들을, 쓸 일이 생긴 첫 순간에 한 번씩 알려준다.
// (계획 선로, 고속철도역, 노선도, 광역급행, 통계, 찾기)
// 지도 가운데 말풍선(정보) + 그 버튼을 잠깐 노란 테두리로 강조한다 (튜토리얼과 같은 모양).
// 본 안내는 브라우저에 기억해서 다시 나오지 않는다. 튜토리얼이 떠 있는 동안은 기다리고, 한 번에 하나씩, 사이를 띄워서 낸다.
import { getState } from '../game/state.js';
import { getEconomy } from '../game/demand.js';
import { intercityStations } from '../game/intercity.js';
import { isExpress } from '../game/routeKinds.js';
import { INTERCITY_LINK_M } from '../config.js';

// 본 안내 id들을 기억하는 브라우저 저장 이름
const SEEN_KEY = 'railmap-tips-seen';
// 안내 하나를 낸 뒤 다음 안내까지 적어도 이만큼 (실제 밀리초). 한꺼번에 쏟아지지 않게
const TIP_GAP_MS = 20000;
// 버튼을 노란 테두리로 강조해 두는 시간 (실제 밀리초)
const HIGHLIGHT_MS = 6000;
// 안내가 나오는 때 (역 수·정산한 달 수)
const SEARCH_TIP_STATIONS = 15;
const STATS_TIP_MONTHS = 3;
const EXPRESS_TIP_ROUTES = 3;

// 안내: id, 나올 때(when), 글(지도마다 달라지면 글을 만드는 함수), 강조할 버튼 찾기
const TIPS = [
  {
    id: 'plan',
    // 선로를 한 번 지어 본 뒤 다시 [선로] 도구를 골랐을 때
    when: (state, ui) => ui.tool === 'track' && state.tracks.some((track) => !track.planned),
    text: '[계획](P)을 켜고 그리면 돈 없이 주황 점선으로 선로를 그려 둘 수 있어요. 나중에 선로를 눌러 [짓기]로 지어요.',
    button: () => [...document.querySelectorAll('#toolbar .tool-button')].find((b) => b.textContent.startsWith('계획')),
  },
  {
    id: 'intercity',
    // 첫 노선을 만든 뒤, 아직 고속철도역과 이어진 역이 없으면 (고속철도역이 있는 지도만)
    when: (state) =>
      state.routes.length > 0 && intercityStations().length > 0 && getEconomy().stationIntercity.size === 0,
    // 지도마다 고속철도역·공항역 중 있는 것으로 부른다 (인천은 공항역)
    text: () =>
      `지도의 회색 동그라미는 ${[...new Set(intercityStations().map((hub) => hub.label))].join('·')}역이에요. ${INTERCITY_LINK_M}m 안에 역을 지으면 그곳을 드나드는 사람들이 더해져 승객이 크게 늘어요.`,
    button: () => null,
  },
  {
    id: 'diagram',
    when: (state) => state.routes.length >= 2,
    text: '왼쪽 아래 [노선도](D)로 내 노선망을 지하철 노선도처럼 볼 수 있어요. 그림 파일로 저장도 돼요.',
    button: () => document.getElementById('diagram-button'),
  },
  {
    id: 'express',
    // 노선이 몇 개 생겼는데 아직 광역급행이 없으면
    when: (state) => state.routes.length >= EXPRESS_TIP_ROUTES && !state.routes.some(isExpress),
    text: '[노선]을 만들 때 [광역급행]을 고르면 GTX처럼 빠르고 많이 나르는 노선이 돼요. 역을 띄엄띄엄, 선로를 곧게 이을수록 빨라요. 있는 노선은 노선 정보에서 바꿔요.',
    button: () => [...document.querySelectorAll('#toolbar .tool-button')].find((b) => b.textContent.startsWith('노선')),
  },
  {
    id: 'stats',
    when: (state) => state.routes.length > 0 && state.monthlyRecords.length >= STATS_TIP_MONTHS,
    text: '위쪽 [통계]에서 달마다 자금 · 월 수지 · 하루 승객이 어떻게 변했는지 그래프로 볼 수 있어요.',
    button: () => document.getElementById('stats-button'),
  },
  {
    id: 'search',
    when: (state) => state.stations.length >= SEARCH_TIP_STATIONS,
    text: '역이 많아졌어요. / 키(또는 [메뉴]의 [역·노선 찾기])로 이름을 쳐서 역·노선을 찾을 수 있어요.',
    button: () => document.getElementById('menu-button'),
  },
];

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'));
  } catch {
    // 망가진 기록이면 처음부터 다시 (안내를 한 번 더 볼 뿐이다)
    return new Set();
  }
}

// ui: app.js의 화면 상태, notice(글): 지도 가운데 말풍선
// 결과: { update } — 다시 그릴 때마다 부른다 (가볍다: 조건만 본다)
export function createTips({ ui, notice }) {
  const seen = readSeen();
  const tutorial = document.getElementById('tutorial');
  let lastShown = 0;

  function update() {
    // 튜토리얼이 떠 있으면 그것부터 (안내가 겹치지 않게)
    if (!tutorial.hidden) return;
    if (Date.now() - lastShown < TIP_GAP_MS) return;
    const state = getState();
    const tip = TIPS.find((item) => !seen.has(item.id) && item.when(state, ui));
    if (!tip) return;
    seen.add(tip.id);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    lastShown = Date.now();
    notice(typeof tip.text === 'function' ? tip.text() : tip.text);
    const button = tip.button();
    if (button && !button.closest('[hidden]')) {
      button.classList.add('tutorial-target');
      setTimeout(() => button.classList.remove('tutorial-target'), HIGHLIGHT_MS);
    }
  }

  return { update };
}
