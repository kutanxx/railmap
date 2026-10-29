// 시작 화면: 어느 지도에서 할지 고른다 (regions.js의 REGIONS).
// 위에서부터: 제목과 작은 노선 그림 → (휴대폰·좁은 창이면) "컴퓨터에서 가장 잘 돌아가요" 한 줄
// → (공유 링크로 들어왔으면) "공유받은 노선망" 칸 (ui/shareLink.js)
// → [이어서 하기] (저장이 있는 게임만) 또는, 저장이 하나도 없으면 "처음이라면 · 서울에서 바로 시작" 큰 칸
// → 묶음 탭 (한국 도시 / 세계 도시 / 가상 지도) → 고른 묶음의 지도 카드 (지도 그림, 이름, 한 줄 설명, 저장 상태, [샌드박스]).
// 처음 온 사람이 열세 개 중에 고르는 숙제 없이 한 번 눌러 시작하게 한다 (reports/레일맵 시작 화면 개선 조사.md).
// 지도를 고르면 지도가 뜰 때까지 "불러오는 중" 표시를 띄운다 (showMapLoading, main.js).
// 카드를 누르면 그 지도로 시작(저장이 있으면 이어하기), [샌드박스]는 돈 무제한 게임 (저장 칸이 따로다).
// 지도 그림은 public/thumbnails/<지도 id>.svg (node tools/make-thumbnails.mjs로 만든다).
import { REGIONS, RECOMMENDED_REGION } from '../regions.js';
import { savedGameInfo } from '../game/save.js';
import { prefetchMap } from '../map/prefetch.js';
import { renderSharedCard } from './shareLink.js';
import { clearSharedLink } from '../game/share.js';

// 마지막으로 고른 묶음 탭을 기억하는 브라우저 저장 이름
const TAB_KEY = 'railmap-start-tab';

// 나라 이름 (카드의 "실제 지도 · 한국")
const COUNTRY_NAMES = { kr: '한국', jp: '일본', us: '미국', uk: '영국', fr: '프랑스' };

// 제목 옆 작은 노선 그림 (게임 지도와 같은 색: 선로, 승강장 동그라미, 노란 열차)
const ROUTE_ART = `
  <svg class="start-art" viewBox="0 0 230 44" aria-hidden="true">
    <path d="M6 34 L70 34 Q86 34 96 22 L108 10 L224 10" fill="none" stroke="#D8C9AA" stroke-width="9" stroke-linecap="round"/>
    <path d="M6 34 L70 34 Q86 34 96 22 L108 10 L224 10" fill="none" stroke="#3E4651" stroke-width="5" stroke-linecap="round"/>
    <circle cx="12" cy="34" r="6" fill="#A7BED4" stroke="#1F3A55" stroke-width="2"/>
    <circle cx="96" cy="22" r="6" fill="#A7BED4" stroke="#1F3A55" stroke-width="2"/>
    <circle cx="160" cy="10" r="6" fill="#A7BED4" stroke="#1F3A55" stroke-width="2"/>
    <circle cx="218" cy="10" r="6" fill="#A7BED4" stroke="#1F3A55" stroke-width="2"/>
    <rect x="128" y="6" width="18" height="8" rx="2" fill="#F2C230" stroke="#1F3A55" stroke-width="1.5"/>
  </svg>`;

// 지도들을 묶음으로: [{ id, title, regions: [[지도 id, 지도], …] }] (빈 묶음은 뺀다)
function groupRegions() {
  const entries = Object.entries(REGIONS);
  return [
    { id: 'korea', title: '한국 도시', regions: entries.filter(([, r]) => !r.virtual && r.country === 'kr') },
    { id: 'world', title: '세계 도시', regions: entries.filter(([, r]) => !r.virtual && r.country !== 'kr') },
    { id: 'virtual', title: '가상 지도', regions: entries.filter(([, r]) => r.virtual) },
  ].filter((group) => group.regions.length > 0);
}

// 이만큼보다 좁은 창이면 휴대폰 안내를 보여준다 (px)
const NARROW_SCREEN_PX = 700;

// 저장 상태를 글로: "2032년 5월 · 노선 8개"
const saveSummary = (info) => `${info.year}년 ${info.month}월 · 노선 ${info.routeCount}개`;

// 만들기 쉽게: 태그 이름, class, 글
function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// element에 시작 화면을 띄우고, 고르면 { id: 지도 id, sandbox: 샌드박스인지, shared: 받은 노선망 또는 없음 }으로
// 끝나는 Promise를 돌려준다. link: 공유 링크로 들어왔을 때 { shared: 받은 노선망, problem: 읽지 못한 이유 } (main.js)
export function chooseRegion(element, link = {}) {
  element.innerHTML = `
    <div class="start-card">
      <header class="start-head">
        <div>
          <h1 class="start-title">레일맵</h1>
          <p class="start-lead">역을 놓고 선로를 깔면 열차가 달려요</p>
        </div>
        ${ROUTE_ART}
      </header>
      <p class="start-device" hidden>손가락으로도 할 수 있어요: 두 손가락으로 지도를 움직이고 키우세요. 화면이 넓은 컴퓨터에서 가장 편해요.</p>
      <section class="start-shared" hidden></section>
      <section class="start-continue" hidden>
        <div class="start-continue-latest"></div>
        <h2 class="start-section start-continue-more" hidden>다른 저장 이어하기</h2>
        <div class="start-continue-list"></div>
      </section>
      <section class="start-first" hidden></section>
      <h2 class="start-section start-new-title">새로 시작할 지도</h2>
      <div class="start-tabs" role="tablist" aria-label="지도 묶음"></div>
      <div class="start-choices" id="start-choices" role="tabpanel"></div>
      <p class="start-credit">지도 그림 © OpenStreetMap 기여자 · OpenFreeMap</p>
    </div>
  `;
  element.hidden = false;
  // 손가락으로 쓰는 기기이거나 창이 좁으면 안내 한 줄 (막지는 않는다)
  element.querySelector('.start-device').hidden = !(
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < NARROW_SCREEN_PX
  );
  const continueSection = element.querySelector('.start-continue');
  const continueList = element.querySelector('.start-continue-list');
  const tabs = element.querySelector('.start-tabs');
  const choices = element.querySelector('.start-choices');
  const groups = groupRegions();

  return new Promise((resolve) => {
    const choose = (id, sandbox) => {
      element.hidden = true;
      resolve({ id, sandbox });
    };

    // 공유받은 노선망: 그 지도의 샌드박스로 연다. 열거나 닫으면 주소에서 공유 자료를 지운다
    renderSharedCard(element.querySelector('.start-shared'), {
      shared: link.shared,
      problem: link.problem,
      onOpen: () => {
        clearSharedLink();
        element.hidden = true;
        resolve({ id: link.shared.region, sandbox: true, shared: link.shared });
      },
      onClose: clearSharedLink,
    });

    // 이어서 하기: 저장이 있는 게임들. 가장 최근에 한 게임은 맨 위에 큰 칸으로, 나머지는 그 아래 작은 줄로
    // (저장한 때가 같으면, 예를 들어 예전 저장끼리면, 일반 게임 먼저 그다음 샌드박스 순서)
    const saves = [];
    for (const sandbox of [false, true]) {
      for (const [id, region] of Object.entries(REGIONS)) {
        const info = savedGameInfo(id, sandbox);
        if (info && !info.broken) saves.push({ id, region, sandbox, info });
      }
    }
    const latest = saves.reduce((best, save) => (!best || save.info.savedAt > best.info.savedAt ? save : best), null);
    // 다음에 열 것 같은 지도(가장 최근 게임, 없으면 추천 지도)를 미리 준비한다 (map/prefetch.js)
    const likely = latest?.id ?? RECOMMENDED_REGION;
    prefetchMap(likely, REGIONS[likely]);
    if (latest) {
      element.querySelector('.start-continue-latest').append(
        bigCard({
          id: latest.id,
          label: '이어서 하기',
          title: latest.sandbox ? `${latest.region.name} 샌드박스` : latest.region.name,
          description: saveSummary(latest.info),
          go: '이어하기 ▶',
          onClick: () => choose(latest.id, latest.sandbox),
        }),
      );
    }
    for (const save of saves) {
      if (save === latest) continue;
      const item = make('button', 'start-continue-item');
      item.type = 'button';
      const text = make('span', 'start-continue-text');
      text.append(make('b', '', save.sandbox ? `${save.region.name} 샌드박스` : save.region.name), make('small', '', saveSummary(save.info)));
      item.append(text, make('span', 'start-continue-go', '이어하기'));
      item.addEventListener('click', () => choose(save.id, save.sandbox));
      continueList.append(item);
    }
    element.querySelector('.start-continue-more').hidden = continueList.childElementCount === 0;
    continueSection.hidden = saves.length === 0;

    // 저장이 하나도 없으면 (처음 온 사람) 추천 지도 하나를 맨 위에 크게: 한 번 누르면 바로 시작
    if (continueSection.hidden) {
      const first = element.querySelector('.start-first');
      const region = REGIONS[RECOMMENDED_REGION];
      first.append(
        bigCard({
          id: RECOMMENDED_REGION,
          label: '처음이라면',
          title: `${region.name}에서 바로 시작`,
          description: `${region.description}. 처음 몇 걸음은 튜토리얼이 알려줘요.`,
          go: '바로 시작 ▶',
          onClick: () => choose(RECOMMENDED_REGION, false),
        }),
      );
      first.hidden = false;
      element.querySelector('.start-new-title').textContent = '다른 지도 고르기';
    }

    // 묶음 탭: 고르면 그 묶음의 카드만 보인다 (고른 탭은 기억한다)
    const tabButtons = new Map();
    let shownGroup = localStorage.getItem(TAB_KEY);
    if (!groups.some((group) => group.id === shownGroup)) shownGroup = groups[0].id;
    const pickGroup = (id) => {
      shownGroup = id;
      localStorage.setItem(TAB_KEY, id);
      showGroup();
    };
    for (const group of groups) {
      const tab = make('button', 'start-tab', group.title);
      tab.type = 'button';
      tab.id = `start-tab-${group.id}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'start-choices');
      tab.append(make('span', 'start-tab-count', String(group.regions.length)));
      tab.addEventListener('click', () => pickGroup(group.id));
      tabs.append(tab);
      tabButtons.set(group.id, tab);
    }
    // 키보드: ←→로 옆 탭, Home·End로 처음·끝 탭 (고르면 바로 그 묶음을 보여준다. 화면 읽기 프로그램의 탭 표준 동작)
    tabs.addEventListener('keydown', (event) => {
      const ids = groups.map((group) => group.id);
      const at = ids.indexOf(shownGroup);
      const next = {
        ArrowRight: (at + 1) % ids.length,
        ArrowLeft: (at - 1 + ids.length) % ids.length,
        Home: 0,
        End: ids.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      pickGroup(ids[next]);
      tabButtons.get(ids[next]).focus();
    });

    function showGroup() {
      for (const [id, tab] of tabButtons) {
        tab.classList.toggle('active', id === shownGroup);
        tab.setAttribute('aria-selected', String(id === shownGroup));
        // Tab 키는 고른 탭에만 멈추고, 다른 탭은 화살표로 간다
        tab.tabIndex = id === shownGroup ? 0 : -1;
      }
      choices.setAttribute('aria-labelledby', `start-tab-${shownGroup}`);
      const group = groups.find((g) => g.id === shownGroup);
      choices.replaceChildren(...group.regions.map(([id, region]) => regionCard(id, region, choose)));
    }
    showGroup();
  });
}

// 지도 카드 하나: 위에 지도 그림, 아래에 이름·종류·설명·저장 상태, 맨 아래 [샌드박스]
function regionCard(id, region, choose) {
  const card = make('div', 'start-region');
  const info = savedGameInfo(id);
  const sandboxInfo = savedGameInfo(id, true);

  const main = make('button', 'start-choice');
  main.type = 'button';
  const picture = make('img', 'start-thumb');
  picture.src = `thumbnails/${id}.svg`;
  // 바로 아래 이름이 있으므로 그림 설명은 비운다 (화면 읽기 프로그램이 이름을 두 번 읽지 않게)
  picture.alt = '';
  picture.loading = 'lazy';
  const name = make('b', 'start-name', region.name);
  // 하던 게임이 있으면 이름 앞에 남색 점
  if (info && !info.broken) name.prepend(make('span', 'start-dot'));
  const kind = make('span', 'start-kind', region.virtual ? '가상 지도' : `실제 지도 · ${COUNTRY_NAMES[region.country]}`);
  const description = make('span', 'start-description', region.description);
  main.append(picture, name, kind, description);
  main.addEventListener('click', () => choose(id, false));
  // 카드에 마우스를 올리면 그 지도도 미리 준비한다 (고를 것 같으니까)
  card.addEventListener('pointerenter', () => prefetchMap(id, region));

  const footer = make('div', 'start-region-foot');
  let status = '새 게임';
  if (info?.broken) status = '저장이 망가져서 새 게임으로 시작해요';
  else if (info) status = `이어하기 · ${info.year}년 ${info.month}월`;
  footer.append(make('span', `start-status${info && !info.broken ? ' has-save' : ''}`, status));
  // [샌드박스]: 무엇인지 글로도 보이게 (마우스를 올려야 보이는 설명은 터치·키보드로 못 본다)
  const sandbox = make('button', 'start-sandbox');
  sandbox.append(
    make('b', '', sandboxInfo && !sandboxInfo.broken ? '샌드박스 이어하기' : '샌드박스'),
    make('small', '', '돈 무제한'),
  );
  sandbox.type = 'button';
  sandbox.title = '돈 무제한 (빚·파산·목표 없음). 저장 칸이 따로예요';
  sandbox.addEventListener('click', () => choose(id, true));
  footer.append(sandbox);

  card.append(main, footer);
  return card;
}

// 맨 위 큰 칸: 왼쪽 지도 그림, 오른쪽 작은 꼬리표 · 제목 · 설명 · [가기 ▶]. 칸 전체가 버튼
// 처음 온 사람의 "처음이라면 · 서울에서 바로 시작", 돌아온 사람의 "이어서 하기 · 가장 최근 게임"에 쓴다
function bigCard({ id, label, title, description, go, onClick }) {
  const button = make('button', 'start-first-card');
  button.type = 'button';
  const picture = make('img', 'start-first-thumb');
  picture.src = `thumbnails/${id}.svg`;
  picture.alt = '';
  const text = make('span', 'start-first-text');
  text.append(
    make('small', 'start-first-label', label),
    make('b', 'start-first-name', title),
    make('span', 'start-first-description', description),
    make('span', 'start-first-go', go),
  );
  button.append(picture, text);
  button.addEventListener('click', onClick);
  return button;
}

// 지도를 고른 뒤 지도가 뜰 때까지 화면 가운데에 띄우는 "불러오는 중" 판 (빈 화면을 멈춘 줄 알고 떠나지 않게).
// 결과: { hide } — 지도가 뜨거나 못 불러왔을 때 부른다 (main.js)
export function showMapLoading(regionName) {
  // 게임 화면의 버튼 판들은 아직 비어 있으므로 다 뜰 때까지 숨긴다 (빈 테두리만 보이면 고장 난 것처럼 보인다)
  document.body.classList.add('map-loading-now');
  const box = make('div', 'map-loading');
  box.setAttribute('role', 'status');
  box.append(
    make('b', '', `${regionName} 지도를 불러오는 중…`),
    make('small', '', '처음에는 몇 초 걸릴 수 있어요'),
    make('span', 'map-loading-bar'),
  );
  document.body.append(box);
  return {
    hide: () => {
      box.remove();
      document.body.classList.remove('map-loading-now');
    },
  };
}
