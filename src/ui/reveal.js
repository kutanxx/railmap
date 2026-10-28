// 단계적 공개: 처음엔 꼭 필요한 것만 보이고, 쓸 일이 생기면 버튼이 하나씩 나타난다.
// (근거: reports/레일맵 화면 UI 개선안.md "단계적 공개", Cities: Skylines가 인구에 따라 기능을 차례로 여는 방식)
// - 처음부터: 날짜, 배속, 자금, 도구 4개, [목표], [메뉴]·[소리]·[?]
// - 첫 선로: [지형] (땅 높이가 있는 가상 지도만)
// - 첫 노선: 월 수지·하루 승객, [통계], [혼잡도], [노선도], [관제실]
// - 첫 알림 (또는 첫 노선): [알림]
// 한 번 나타난 것은 다시 숨지 않는다 (노선을 다 지워도). 샌드박스와 이미 노선이 있는 저장은 처음부터 다 보인다.
// 새로 나타나면 화면 가운데 말풍선으로 한 번 알려준다 (불러온 첫 화면에서는 알리지 않는다. 개통 말풍선이 사라진 뒤에).
import { REVEAL_NOTICE_DELAY_SECONDS } from '../config.js';
import { getState } from '../game/state.js';
import { isSandbox } from '../game/region.js';
import { hasTerrain } from '../game/terrain.js';
import { noticeCount } from './noticeLog.js';

// 단계: 언제 나타나는지(when)와 나타날 때 알려줄 말(text, 없으면 알리지 않는다)
const STEPS = [
  {
    id: 'terrain',
    when: ({ tracks }) => hasTerrain() && tracks.length > 0,
    text: '왼쪽 아래에 [지형]이 생겼어요. 등고선으로 땅 높이를 볼 수 있어요.',
  },
  {
    id: 'flow',
    when: ({ routes }) => routes.length > 0,
    text: '월 수지·하루 승객과 위쪽 [통계]가 보여요. 왼쪽 아래에 [혼잡도]·[노선도]·[관제실]도 생겼어요.',
  },
  // 노선이 있는 게임을 불러왔을 때도 보인다 (지난 알림은 저장하지 않아서 목록은 비어 있다)
  { id: 'notice', when: ({ routes }) => noticeCount() > 0 || routes.length > 0, text: null },
];

// notice(글): 화면 가운데 말풍선 (app.js)
// 결과: { update: 다시 그릴 때마다 부른다, shown(id): 그 단계가 나타났는지 }
export function createReveal({ notice }) {
  const shownSteps = new Set();
  let firstUpdate = true;

  // 단계마다 숨기고 보일 화면 요소
  const congestion = document.getElementById('congestion');
  const controlRoom = document.getElementById('control-room-button').closest('.view-toggle');
  const terrain = document.getElementById('terrain');
  const noticeAnchor = document.getElementById('notice-button').closest('.pop-anchor');
  const statsAnchor = document.getElementById('stats-button').closest('.pop-anchor');
  const diagram = document.getElementById('diagram-button').closest('.view-toggle');

  function update() {
    const state = getState();
    for (const step of STEPS) {
      if (shownSteps.has(step.id)) continue;
      if (!isSandbox() && !step.when(state)) continue;
      shownSteps.add(step.id);
      // 안내는 조금 뒤에: 같은 순간 뜨는 "1호선 개통" 말풍선과 겹치지 않게
      if (!firstUpdate && step.text) setTimeout(() => notice(step.text), REVEAL_NOTICE_DELAY_SECONDS * 1000);
    }
    firstUpdate = false;
    congestion.hidden = !shownSteps.has('flow');
    controlRoom.hidden = !shownSteps.has('flow');
    statsAnchor.hidden = !shownSteps.has('flow');
    diagram.hidden = !shownSteps.has('flow');
    terrain.hidden = !hasTerrain() || !shownSteps.has('terrain');
    noticeAnchor.hidden = !shownSteps.has('notice');
  }

  return { update, shown: (id) => shownSteps.has(id) };
}
