// 시작 화면: 게임 타이틀처럼 (Hallmark로 다시 디자인한 시안 D, 2026-11-04).
// 첫 화면: 화면을 채운 지도 그림 위에 타이틀 판 ("레일맵" + 작은 노선 + 한 줄) → (공유 링크로 들어왔으면) "공유받은 노선망" 칸
// (ui/shareLink.js) → (휴대폰·좁은 창이면) 안내 한 줄 → 게임 메뉴: [이어서 하기](가장 최근 게임) 또는 처음 온 사람은 [바로 시작],
// 다른 저장들, [지도 고르기]. 메뉴는 고른(마우스를 올린·초점이 간) 줄이 노랗게 칠해지고 ▶가 붙는다.
// 그 아래: 스테이지 고르기처럼 묶음 탭(한국 도시 / 세계 도시 / 가상 지도) → 왼쪽 지도 타일, 오른쪽 고른 지도 판
// ([새 게임] 또는 [이어하기], [샌드박스], 실제 노선망 프리셋이 있으면 [실제 노선망으로 시작]과 그해의 노선망 해 단추).
// 처음 온 사람이 열세 개 중에 고르는 숙제 없이 한 번 눌러 시작하게 한다 (reports/레일맵 시작 화면 개선 조사.md).
// 지도를 고르면 지도가 뜰 때까지 "불러오는 중" 표시를 띄운다 (showMapLoading, main.js).
// 지도 그림은 public/thumbnails/<지도 id>.svg (node tools/make-thumbnails.mjs로 만든다).
import { REGIONS, RECOMMENDED_REGION } from '../regions.js';
import { savedGameInfo } from '../game/save.js';
import { prefetchMap } from '../map/prefetch.js';
import { renderSharedCard } from './shareLink.js';
import { clearSharedLink } from '../game/share.js';
import { presetOf } from '../game/presets.js';
import { NARROW_SCREEN_PX } from '../config.js';

// 마지막으로 고른 묶음 탭을 기억하는 브라우저 저장 이름
const TAB_KEY = 'railmap-start-tab';
// 메뉴에 줄로 보여줄 다른 저장 수 (더 있으면 "저장 n개 더" 한 줄)
const MENU_OTHER_SAVES = 2;

// 나라 이름 ("실제 지도, 한국")
const COUNTRY_NAMES = { kr: '한국', jp: '일본', us: '미국', uk: '영국', fr: '프랑스' };

// 지도들을 묶음으로: [{ id, title, regions: [[지도 id, 지도], …] }] (빈 묶음은 뺀다)
function groupRegions() {
  const entries = Object.entries(REGIONS);
  return [
    { id: 'korea', title: '한국 도시', regions: entries.filter(([, r]) => !r.virtual && r.country === 'kr') },
    { id: 'world', title: '세계 도시', regions: entries.filter(([, r]) => !r.virtual && r.country !== 'kr') },
    { id: 'virtual', title: '가상 지도', regions: entries.filter(([, r]) => r.virtual) },
  ].filter((group) => group.regions.length > 0);
}

// 저장 상태를 글로: "2032년 5월, 노선 8개"
const saveSummary = (info) => `${info.year}년 ${info.month}월, 노선 ${info.routeCount}개`;
// 저장 이름: "서울" 또는 "서울 샌드박스"
const saveName = (save) => (save.sandbox ? `${save.region.name} 샌드박스` : save.region.name);

// 만들기 쉽게: 태그 이름, class, 글
function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// 글 두 줄짜리 버튼 (굵은 이름 + 작은 설명). 메뉴 줄은 앞에 ▶ 자리(고른 줄에만 보인다)
function twoLineButton(className, title, note, { cursor = false } = {}) {
  const button = make('button', className);
  button.type = 'button';
  // ▶ 표시는 글자 모양으로 (︎: 휴대폰에서 색 그림 문자로 바뀌지 않게), 화면 읽기 프로그램은 읽지 않는다
  if (cursor) {
    const mark = make('span', 'start-cursor', '▶︎');
    mark.setAttribute('aria-hidden', 'true');
    button.append(mark);
  }
  const name = make('b', '', title);
  const small = make('small', '', note ?? '');
  button.append(name, small);
  return { button, name, small };
}

// element에 시작 화면을 띄우고, 고르면 { id: 지도 id, sandbox: 샌드박스인지, shared: 받은 노선망 또는 없음,
// preset: [실제 노선망으로 시작]을 골랐으면 true, year: 타임머신으로 고른 해 }으로 끝나는 Promise를 돌려준다. link: 공유 링크로 들어왔을 때 { shared: 받은 노선망, problem: 읽지 못한 이유 } (main.js)
export function chooseRegion(element, link = {}) {
  element.innerHTML = `
    <section class="start-title-screen">
      <div class="start-plate">
        <header class="start-plate-top">
          <h1 class="start-title">레일맵</h1>
          <div class="start-logo-line" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
          <p class="start-lead">역을 놓고 선로를 깔면 열차가 달려요</p>
        </header>
        <section class="start-shared" hidden></section>
        <p class="start-device" hidden>손가락으로도 할 수 있어요: 두 손가락으로 지도를 움직이고 키우세요. 화면이 넓은 컴퓨터에서 가장 편해요.</p>
        <ul class="start-menu" aria-label="시작 메뉴"></ul>
      </div>
    </section>
    <section class="start-select" aria-labelledby="start-select-title">
      <div class="start-select-head">
        <h2 class="start-select-title" id="start-select-title">지도 고르기</h2>
        <div class="start-tabs" role="tablist" aria-label="지도 묶음"></div>
      </div>
      <div class="start-stage" id="start-choices" role="tabpanel">
        <div class="start-tiles"></div>
        <aside class="start-detail" aria-live="polite"></aside>
      </div>
      <p class="start-credit">지도 그림과 실제 노선 자료: © OpenStreetMap 기여자, OpenFreeMap. 개통 연도: 서울교통공사 「지하철 개통 정보」(공공누리 제1유형), 일본 국토교통성 「국토수치정보(철도 시계열 데이터)」를 가공, Wikidata 외</p>
    </section>
  `;
  element.hidden = false;
  element.scrollTop = 0;
  // 손가락으로 쓰는 기기이거나 창이 좁으면 안내 한 줄 (막지는 않는다). 창 크기가 바뀌면 다시 본다
  const deviceNote = element.querySelector('.start-device');
  const smallDevice = window.matchMedia(`(pointer: coarse), (max-width: ${NARROW_SCREEN_PX - 1}px)`);
  const showDeviceNote = () => {
    deviceNote.hidden = !smallDevice.matches;
  };
  showDeviceNote();
  smallDevice.addEventListener('change', showDeviceNote);
  const menu = element.querySelector('.start-menu');
  const tabs = element.querySelector('.start-tabs');
  const tiles = element.querySelector('.start-tiles');
  const detail = element.querySelector('.start-detail');
  const groups = groupRegions();

  return new Promise((resolve) => {
    const finish = (result) => {
      smallDevice.removeEventListener('change', showDeviceNote);
      element.hidden = true;
      resolve(result);
    };
    const choose = (id, sandbox, extra = {}) => {
      // 공유 링크로 들어왔는데 다른 지도를 골랐으면 주소에서 공유 자료를 지운다
      // ([지도 바꾸기]로 시작 화면에 돌아왔을 때 "공유받은 노선망" 칸이 또 뜨지 않게)
      if (link.shared || link.problem) clearSharedLink();
      finish({ id, sandbox, ...extra });
    };

    // 공유받은 노선망: 그 지도의 샌드박스로 연다. 열거나 닫으면 주소에서 공유 자료를 지운다
    renderSharedCard(element.querySelector('.start-shared'), {
      shared: link.shared,
      problem: link.problem,
      onOpen: () => {
        clearSharedLink();
        finish({ id: link.shared.region, sandbox: true, shared: link.shared });
      },
      onClose: clearSharedLink,
    });

    // 저장이 있는 게임들. 가장 최근에 한 게임이 메뉴 첫 줄 [이어서 하기], 나머지는 그 아래 작은 줄로
    // (저장한 때가 같으면, 예를 들어 예전 저장끼리면, 일반 게임 먼저 그다음 샌드박스 순서)
    const saves = [];
    for (const sandbox of [false, true]) {
      for (const [id, region] of Object.entries(REGIONS)) {
        const info = savedGameInfo(id, sandbox);
        if (info && !info.broken) saves.push({ id, region, sandbox, info });
      }
    }
    const latest = saves.reduce((best, save) => (!best || save.info.savedAt > best.info.savedAt ? save : best), null);
    // 다음에 열 것 같은 지도(가장 최근 게임, 없으면 추천 지도)를 미리 준비하고, 그 지도 그림을 타이틀 바탕에 깐다 (map/prefetch.js)
    const likely = latest?.id ?? RECOMMENDED_REGION;
    prefetchMap(likely, REGIONS[likely]);
    element.querySelector('.start-title-screen').style.setProperty('--start-map', `url("thumbnails/${likely}.svg")`);

    const addMenuItem = (className, title, note, onClick) => {
      const { button } = twoLineButton(className, title, note, { cursor: true });
      button.addEventListener('click', onClick);
      const item = make('li');
      item.append(button);
      menu.append(item);
      return button;
    };
    // 메뉴 첫 줄: 돌아온 사람은 가장 최근 게임, 처음 온 사람은 추천 지도에서 바로 시작 (튜토리얼이 알려준다)
    if (latest) {
      addMenuItem('start-menu-item is-default', '이어서 하기', `${saveName(latest)}, ${saveSummary(latest.info)}`, () =>
        choose(latest.id, latest.sandbox),
      );
    } else {
      const region = REGIONS[RECOMMENDED_REGION];
      addMenuItem('start-menu-item is-default', '바로 시작', `${region.name}에서, 처음 몇 걸음은 튜토리얼이 알려줘요`, () =>
        choose(RECOMMENDED_REGION, false),
      );
    }
    // 아래 지도 고르기로 내려가 고른 지도 타일에 초점
    const goToSelect = () => {
      const target = tiles.querySelector('[aria-pressed="true"]') ?? tiles.querySelector('button');
      element.querySelector('.start-select').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      target?.focus({ preventScroll: true });
    };
    // 다른 저장들: 최근 것부터 MENU_OTHER_SAVES개까지 작은 줄로 (저장이 많아도 판이 첫 화면을 넘지 않게),
    // 나머지는 "저장 n개 더" 한 줄 (지도 고르기의 타일에 하던 게임 표시가 있다)
    const others = saves.filter((save) => save !== latest).sort((a, b) => b.info.savedAt - a.info.savedAt);
    for (const save of others.slice(0, MENU_OTHER_SAVES)) {
      addMenuItem('start-menu-item start-menu-save', `${saveName(save)} 이어하기`, saveSummary(save.info), () =>
        choose(save.id, save.sandbox),
      );
    }
    if (others.length > MENU_OTHER_SAVES) {
      addMenuItem('start-menu-item start-menu-save', `저장 ${others.length - MENU_OTHER_SAVES}개 더`, '지도 고르기에서 남색 점이 붙은 지도', goToSelect);
    }
    // [지도 고르기]
    addMenuItem('start-menu-item', '지도 고르기', `${Object.keys(REGIONS).length}개 지도, 실제 노선망과 타임머신`, goToSelect);

    // 묶음 탭: 고르면 그 묶음의 지도 타일만 보인다 (고른 탭은 기억한다)
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

    // 지도 타일을 고르면 오른쪽 판에 그 지도의 시작 방법들
    let pickedRegion = null;
    const pickRegion = (id, { reveal = false } = {}) => {
      pickedRegion = id;
      for (const tile of tiles.children) tile.setAttribute('aria-pressed', String(tile.dataset.region === id));
      detail.replaceChildren(...regionDetail(id, REGIONS[id], choose));
      prefetchMap(id, REGIONS[id]);
      // 좁은 화면은 판이 타일 아래에 있어서, 고르면 판이 보이게 내려 준다
      if (reveal && window.innerWidth < NARROW_SCREEN_PX) detail.scrollIntoView({ block: 'nearest' });
    };

    function showGroup() {
      for (const [id, tab] of tabButtons) {
        tab.classList.toggle('active', id === shownGroup);
        tab.setAttribute('aria-selected', String(id === shownGroup));
        // Tab 키는 고른 탭에만 멈추고, 다른 탭은 화살표로 간다
        tab.tabIndex = id === shownGroup ? 0 : -1;
      }
      element.querySelector('.start-stage').setAttribute('aria-labelledby', `start-tab-${shownGroup}`);
      const group = groups.find((g) => g.id === shownGroup);
      tiles.replaceChildren(...group.regions.map(([id, region]) => regionTile(id, region, () => pickRegion(id, { reveal: true }))));
      // 지도가 셋보다 적은 묶음(가상 지도)은 칸 수를 지도 수에 맞춘다 (타일 하나가 빈 칸 옆에 홀로 있지 않게)
      tiles.dataset.count = String(group.regions.length);
      // 처음 고른 지도: 이 묶음에 가장 최근 게임이 있으면 그 지도, 아니면 첫 지도
      const ids = group.regions.map(([id]) => id);
      pickRegion(ids.includes(pickedRegion) ? pickedRegion : ids.includes(likely) ? likely : ids[0]);
    }
    showGroup();
  });
}

// 지도 타일 하나: 지도 그림과 이름 (하던 게임이 있으면 이름 앞에 남색 점). 누르면 그 지도를 고른다
function regionTile(id, region, onPick) {
  const tile = make('button', 'start-tile');
  tile.type = 'button';
  tile.dataset.region = id;
  const picture = make('img', 'start-tile-thumb');
  picture.src = `thumbnails/${id}.svg`;
  // 바로 아래 이름이 있으므로 그림 설명은 비운다 (화면 읽기 프로그램이 이름을 두 번 읽지 않게)
  picture.alt = '';
  picture.loading = 'lazy';
  const name = make('b', 'start-tile-name', region.name);
  const info = savedGameInfo(id);
  if (info && !info.broken) name.prepend(make('span', 'start-dot', ''));
  tile.append(picture, name);
  tile.addEventListener('click', onPick);
  // 마우스를 올리면 그 지도도 미리 준비한다 (고를 것 같으니까)
  tile.addEventListener('pointerenter', () => prefetchMap(id, region));
  return tile;
}

// 고른 지도 판: 이름, 종류, 설명, 시작 방법들 ([새 게임]/[이어하기], [샌드박스], [실제 노선망으로 시작], 그해의 노선망)
function regionDetail(id, region, choose) {
  const info = savedGameInfo(id);
  const sandboxInfo = savedGameInfo(id, true);
  const title = make('h3', 'start-detail-name', region.name);
  const kind = make('p', 'start-detail-kind', region.virtual ? '가상 지도' : `실제 지도, ${COUNTRY_NAMES[region.country]}`);
  const description = make('p', 'start-detail-description', region.description);
  const modes = make('div', 'start-modes');

  // 일반 게임: 저장이 있으면 이어하기 (망가진 저장은 새 게임으로)
  let mainTitle = '새 게임';
  let mainNote = '';
  if (info?.broken) mainNote = '저장이 망가져서 새 게임으로 시작해요';
  else if (info) {
    mainTitle = '이어하기';
    mainNote = saveSummary(info);
  }
  const main = twoLineButton('start-mode start-mode-main', mainTitle, mainNote, { cursor: true }).button;
  main.addEventListener('click', () => choose(id, false));
  // [샌드박스]: 무엇인지 글로도 보이게 (마우스를 올려야 보이는 설명은 터치·키보드로 못 본다)
  const hasSandbox = sandboxInfo && !sandboxInfo.broken;
  const sandbox = twoLineButton('start-mode', hasSandbox ? '샌드박스 이어하기' : '샌드박스', '돈 무제한', { cursor: true }).button;
  sandbox.title = '돈 무제한 (빚·파산·목표 없음). 저장 칸이 따로예요';
  sandbox.addEventListener('click', () => choose(id, true));
  modes.append(main, sandbox);

  const preset = presetOf(id);
  if (preset) modes.append(presetButton(id, preset, hasSandbox, choose));
  const parts = [title, kind, description, modes];
  if (preset?.years) parts.push(timeMachineRow(id, preset.years, hasSandbox, choose));
  return parts;
}

// 그해의 노선망 줄 (개통 연도가 적힌 프리셋만, game/timeMachine.js): "그해의 노선망으로 시작 [1974] [1985] …"
// 고른 해까지 개통한 노선만 깐 샌드박스를 그해 날짜로 연다. 샌드박스 저장이 있으면 [실제 노선망으로 시작]처럼 한 번 더 묻는다
function timeMachineRow(id, years, hasSandbox, choose) {
  const row = make('div', 'start-history');
  const label = make('p', 'start-history-label', '그해의 노선망으로 시작');
  const buttons = make('div', 'start-history-years');
  row.append(label, buttons);
  for (const year of years) {
    const button = make('button', 'start-history-year', String(year));
    button.type = 'button';
    button.title = `${year}년까지 개통한 실제 노선(대략)만 깐 샌드박스. 노선 자료 © OpenStreetMap 기여자, 개통 연도 자료는 화면 맨 아래 출처`;
    button.addEventListener('click', () => {
      if (hasSandbox && !button.classList.contains('armed')) {
        for (const other of buttons.querySelectorAll('.armed')) other.classList.remove('armed');
        button.classList.add('armed');
        label.textContent = `하던 샌드박스가 ${year}년 노선망으로 바뀌어요. 한 번 더 누르세요`;
        return;
      }
      choose(id, true, { preset: true, year });
    });
    buttons.append(button);
  }
  return row;
}

// [실제 노선망으로 시작]: 실제 노선을 미리 깐 게임(game/presets.js)을 그 지도의 샌드박스로 연다.
// 샌드박스 저장이 이미 있으면 첫 번째 누름에서 "바꿀까요?"로 바꾸고, 한 번 더 누르면 연다 (브라우저 confirm 창 대신)
function presetButton(id, preset, hasSandbox, choose) {
  const { button, name, small } = twoLineButton('start-mode start-preset', '실제 노선망으로 시작', `${preset.label}, 샌드박스`, { cursor: true });
  button.title = '실제 지하철 노선을 미리 깔아 둔 샌드박스 (돈 무제한). 노선 자료 © OpenStreetMap 기여자';
  button.addEventListener('click', () => {
    if (hasSandbox && !button.classList.contains('armed')) {
      button.classList.add('armed');
      name.textContent = '샌드박스를 바꿀까요?';
      small.textContent = '하던 샌드박스가 이 노선망으로 바뀌어요. 한 번 더 누르세요';
      return;
    }
    choose(id, true, { preset: true });
  });
  return button;
}

// 지도를 고른 뒤 지도가 뜰 때까지 화면 가운데에 띄우는 "불러오는 중" 판 (빈 화면을 멈춘 줄 알고 떠나지 않게).
// 결과: { note(글): 작은 글 바꾸기, hide } — hide는 지도가 뜨거나 못 불러왔을 때 부른다 (main.js)
export function showMapLoading(regionName) {
  // 게임 화면의 버튼 판들은 아직 비어 있으므로 다 뜰 때까지 숨긴다 (빈 테두리만 보이면 고장 난 것처럼 보인다)
  document.body.classList.add('map-loading-now');
  const box = make('div', 'map-loading');
  box.setAttribute('role', 'status');
  const note = make('small', '', '처음에는 몇 초 걸릴 수 있어요');
  box.append(make('b', '', `${regionName} 지도를 불러오는 중…`), note, make('span', 'map-loading-bar'));
  document.body.append(box);
  return {
    // 작은 글을 바꾼다 (공유받은 노선망의 역 주변 건물을 재는 동안 "n/m")
    note: (text) => {
      note.textContent = text;
    },
    hide: () => {
      box.remove();
      document.body.classList.remove('map-loading-now');
    },
  };
}
