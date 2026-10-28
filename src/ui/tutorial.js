// 튜토리얼: 처음 온 사람에게 역 놓기 → 선로 잇기 → 노선 만들기 → 열차 출발을 말풍선으로 하나씩 안내한다.
// 할 일을 해내면 저절로 다음 단계로 넘어간다 (게임 상태를 0.4초마다 들여다본다).
// 눌러야 할 버튼은 노란 테두리로 강조한다. 끝까지 하거나 [건너뛰기]를 누르면 다음부터는 저절로 나오지 않는다.
// 조작 안내 카드의 [튜토리얼 다시 하기]로 언제든 다시 볼 수 있다.
import { getState } from '../game/state.js';
import { TOOLS } from './toolbar.js';

const DONE_KEY = 'railmap-tutorial-done';
const CHECK_MS = 400;
// 열차가 이만큼(게임 초) 달리면 "출발했다"로 친다
const DEPARTED_GAME_SECONDS = 60;

// 단계: 제목, 안내 글, 강조할 도구(TOOLS의 id), 다 했는지
const STEPS = [
  {
    title: '역 놓기',
    text: (s) =>
      `위쪽 [역 놓기]를 누르고(숫자키 2) 지도에서 사람이 많아 보이는 곳 두 군데를 눌러 역을 놓으세요. (${Math.min(2, s.stations.length)}/2)`,
    tool: 'station',
    done: (s) => s.stations.length >= 2,
  },
  {
    title: '선로 잇기',
    text: () =>
      '[선로]를 누르고(3) 첫 역 → 둘째 역을 차례로 누르면 선로가 깔려요. 중간에 빈 땅을 누르면 꺾이는 점이 생겨요.',
    tool: 'track',
    done: (s) => s.tracks.length >= 1,
  },
  {
    title: '노선 만들기',
    text: () =>
      '[노선]을 누르고(4) 선로로 이어진 역을 순서대로 누른 뒤, Enter 또는 오른쪽 패널의 [완성]을 누르세요.',
    tool: 'route',
    done: (s) => s.routes.length >= 1,
  },
  {
    title: '열차 출발',
    text: (s) =>
      s.speed === 0
        ? '노선에 열차가 생겼어요. 지금은 시간이 멈춰 있으니 위쪽 [1배]를 눌러 시간을 흐르게 하세요.'
        : '노선을 따라 열차가 달리기 시작해요. 조금만 지켜보세요…',
    tool: null,
    done: (s, since) => s.speed > 0 && s.trains.length > 0 && s.elapsedSeconds - since >= DEPARTED_GAME_SECONDS,
  },
];

// element: 말풍선을 넣을 곳
export function createTutorial(element) {
  let step = -1; // 지금 단계 번호 (-1이면 꺼짐)
  let since = 0; // 지금 단계를 시작한 게임 시각
  let timer = null;

  element.innerHTML = `
    <div class="tutorial-head"><b class="tutorial-step"></b><span class="tutorial-title"></span></div>
    <p class="tutorial-text"></p>
    <div class="tutorial-buttons"><button type="button" class="tutorial-skip">건너뛰기</button></div>
  `;
  const stepText = element.querySelector('.tutorial-step');
  const title = element.querySelector('.tutorial-title');
  const text = element.querySelector('.tutorial-text');
  const skip = element.querySelector('.tutorial-skip');
  skip.addEventListener('click', finish);

  // 강조할 버튼: 도구 버튼, 또는 시간이 멈춰 있으면 [1배]
  function highlight(target) {
    for (const button of document.querySelectorAll('.tutorial-target')) button.classList.remove('tutorial-target');
    target?.classList.add('tutorial-target');
  }

  function update() {
    // 위쪽 버튼 묶음 바로 아래에 둔다 (좁은 화면에서는 버튼 줄이 여러 줄로 꺾여 높이가 달라진다)
    element.style.top = `${document.querySelector('.top-left').getBoundingClientRect().bottom + 8}px`;
    const state = getState();
    while (step < STEPS.length && STEPS[step].done(state, since)) {
      step += 1;
      since = state.elapsedSeconds;
    }
    if (step >= STEPS.length) {
      // 다 했다: 마지막 인사만 남기고 버튼을 [끝내기]로
      clearInterval(timer);
      highlight(null);
      stepText.textContent = '완료';
      title.textContent = '첫 열차가 출발했어요!';
      text.textContent =
        '승객이 타면 매달 수입이 들어와요. 역과 노선을 늘려 철도망을 키워 보세요. 조작법은 왼쪽 아래 [?]에서 다시 볼 수 있어요.';
      skip.textContent = '끝내기';
      return;
    }
    const current = STEPS[step];
    stepText.textContent = `${step + 1}/${STEPS.length}`;
    title.textContent = current.title;
    text.textContent = current.text(state);
    const toolIndex = TOOLS.findIndex((tool) => tool.id === current.tool);
    const target =
      toolIndex >= 0
        ? document.querySelectorAll('.tool-button')[toolIndex]
        : state.speed === 0
          ? [...document.querySelectorAll('.speed-button')].find((b) => b.textContent === '1배')
          : null;
    highlight(target);
  }

  function start() {
    step = 0;
    since = getState().elapsedSeconds;
    skip.textContent = '건너뛰기';
    element.hidden = false;
    clearInterval(timer);
    timer = setInterval(update, CHECK_MS);
    update();
  }

  function finish() {
    clearInterval(timer);
    step = -1;
    highlight(null);
    element.hidden = true;
    localStorage.setItem(DONE_KEY, '1');
  }

  // 처음 온 사람이면 바로 시작한다
  if (!localStorage.getItem(DONE_KEY)) start();
  else element.hidden = true;

  return { start };
}
