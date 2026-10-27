// 시작 화면: 어느 지도에서 할지 고른다 (regions.js의 REGIONS).
// 위에서부터: 제목과 작은 노선 그림 → [이어서 하기] (저장이 있는 게임만) → 묶음 탭 (한국 도시 / 세계 도시 / 가상 지도)
// → 고른 묶음의 지도 카드 (지도 그림, 이름, 한 줄 설명, 저장 상태, [샌드박스]).
// 카드를 누르면 그 지도로 시작(저장이 있으면 이어하기), [샌드박스]는 돈 무제한 게임 (저장 칸이 따로다).
// 지도 그림은 public/thumbnails/<지도 id>.svg (node tools/make-thumbnails.mjs로 만든다).
import { REGIONS } from '../regions.js';
import { savedGameInfo } from '../game/save.js';

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

// 저장 상태를 글로: "2032년 5월 · 노선 8개"
const saveSummary = (info) => `${info.year}년 ${info.month}월 · 노선 ${info.routeCount}개`;

// 만들기 쉽게: 태그 이름, class, 글
function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// element에 시작 화면을 띄우고, 고르면 { id: 지도 id, sandbox: 샌드박스인지 }로 끝나는 Promise를 돌려준다
export function chooseRegion(element) {
  element.innerHTML = `
    <div class="start-card">
      <header class="start-head">
        <div>
          <h1 class="start-title">레일맵</h1>
          <p class="start-lead">역을 놓고 선로를 깔면 열차가 달려요</p>
        </div>
        ${ROUTE_ART}
      </header>
      <section class="start-continue" hidden>
        <h2 class="start-section">이어서 하기</h2>
        <div class="start-continue-list"></div>
      </section>
      <h2 class="start-section">새로 시작할 지도</h2>
      <div class="start-tabs" role="tablist"></div>
      <div class="start-choices"></div>
      <p class="start-credit">지도 그림 © OpenStreetMap 기여자 · OpenFreeMap</p>
    </div>
  `;
  element.hidden = false;
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

    // 이어서 하기: 저장이 있는 게임 (일반 게임 먼저, 그다음 샌드박스)
    for (const sandbox of [false, true]) {
      for (const [id, region] of Object.entries(REGIONS)) {
        const info = savedGameInfo(id, sandbox);
        if (!info || info.broken) continue;
        const item = make('button', 'start-continue-item');
        item.type = 'button';
        const text = make('span', 'start-continue-text');
        text.append(make('b', '', sandbox ? `${region.name} 샌드박스` : region.name), make('small', '', saveSummary(info)));
        item.append(text, make('span', 'start-continue-go', '이어하기'));
        item.addEventListener('click', () => choose(id, sandbox));
        continueList.append(item);
      }
    }
    continueSection.hidden = continueList.childElementCount === 0;

    // 묶음 탭: 고르면 그 묶음의 카드만 보인다 (고른 탭은 기억한다)
    const tabButtons = new Map();
    let shownGroup = localStorage.getItem(TAB_KEY);
    if (!groups.some((group) => group.id === shownGroup)) shownGroup = groups[0].id;
    for (const group of groups) {
      const tab = make('button', 'start-tab', group.title);
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.append(make('span', 'start-tab-count', String(group.regions.length)));
      tab.addEventListener('click', () => {
        shownGroup = group.id;
        localStorage.setItem(TAB_KEY, group.id);
        showGroup();
      });
      tabs.append(tab);
      tabButtons.set(group.id, tab);
    }

    function showGroup() {
      for (const [id, tab] of tabButtons) {
        tab.classList.toggle('active', id === shownGroup);
        tab.setAttribute('aria-selected', String(id === shownGroup));
      }
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
  picture.alt = `${region.name} 지도`;
  picture.loading = 'lazy';
  const name = make('b', 'start-name', region.name);
  // 하던 게임이 있으면 이름 앞에 노란 점
  if (info && !info.broken) name.prepend(make('span', 'start-dot'));
  const kind = make('span', 'start-kind', region.virtual ? '가상 지도' : `실제 지도 · ${COUNTRY_NAMES[region.country]}`);
  const description = make('span', 'start-description', region.description);
  main.append(picture, name, kind, description);
  main.addEventListener('click', () => choose(id, false));

  const footer = make('div', 'start-region-foot');
  let status = '새 게임';
  if (info?.broken) status = '저장이 망가져서 새 게임으로 시작해요';
  else if (info) status = `이어하기 · ${info.year}년 ${info.month}월`;
  footer.append(make('span', `start-status${info && !info.broken ? ' has-save' : ''}`, status));
  const sandbox = make('button', 'start-sandbox', sandboxInfo && !sandboxInfo.broken ? '샌드박스 이어하기' : '샌드박스');
  sandbox.type = 'button';
  sandbox.title = '돈 무제한 (빚·파산·목표 없음). 저장 칸이 따로예요';
  sandbox.addEventListener('click', () => choose(id, true));
  footer.append(sandbox);

  card.append(main, footer);
  return card;
}
