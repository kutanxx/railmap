// 내 노선망 서랍 창 ([메뉴] → [내 노선망 서랍], game/drawer.js): 이 지도(일반 게임·샌드박스 따로)에 넣어 둔 노선망 카드들.
// 맨 위 이름 칸 + [지금 노선망 넣기], 카드마다 작은 그림(노선망 모양) · 이름 · 날짜·역·노선 수와 [꺼내기][이름 바꾸기][복사][지우기].
// [꺼내기]는 지금 노선망을 먼저 "자동 보관"으로 넣어 두고(서랍에서 꺼낸 그대로면 넣지 않는다) 고른 노선망을 불러온다.
// [지우기]는 실수로 누르지 않게 한 번 더 눌러야 지운다. 화면 가운데 창(.dialog)이고, [닫기]·바깥 누르기·Esc로 닫힌다
import { saveData, loadData } from '../game/save.js';
import { getState } from '../game/state.js';
import { getRegion, isSandbox } from '../game/region.js';
import {
  drawerEntries,
  putInDrawer,
  getFromDrawer,
  renameInDrawer,
  copyInDrawer,
  removeFromDrawer,
} from '../game/drawer.js';
import { cssColor } from './svg.js';
import { dialogFocus } from './dialogFocus.js';

// 작은 그림 크기 (px)
const PICTURE_W = 160;
const PICTURE_H = 100;
// [지우기]를 한 번 누른 뒤 "정말 지울까요?"로 기다리는 시간 (ms)
const CONFIRM_MS = 4000;

// 노선망 모양 그림 (SVG 글): 땅색 바탕에 역과 역 사이를 곧은 선으로, 노선이 지나면 노선 색, 아니면 선로 색, 계획 선로는 주황
export function networkPicture(network) {
  const coordOf = new Map(network.stations.map((station) => [station.id, station.coord]));
  const colorOf = new Map();
  for (const route of network.routes) {
    for (let i = 1; i < route.stations.length; i++) {
      const key = [route.stations[i - 1], route.stations[i]].sort().join('|');
      if (!colorOf.has(key)) colorOf.set(key, route.color);
    }
  }
  const coords = [...coordOf.values()];
  const land = cssColor('land');
  if (coords.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PICTURE_W} ${PICTURE_H}"><rect width="100%" height="100%" fill="${land}"/></svg>`;
  }
  // 경도는 위도에 따라 줄어드니 가로·세로 비율을 맞춘다
  const lats = coords.map(([, lat]) => lat);
  const squeeze = Math.cos((((Math.min(...lats) + Math.max(...lats)) / 2) * Math.PI) / 180);
  const xs = coords.map(([lng]) => lng * squeeze);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...lats), Math.max(...lats)];
  const pad = 8;
  const scale = Math.min((PICTURE_W - 2 * pad) / Math.max(maxX - minX, 1e-6), (PICTURE_H - 2 * pad) / Math.max(maxY - minY, 1e-6));
  const left = (PICTURE_W - (maxX - minX) * scale) / 2;
  const top = (PICTURE_H - (maxY - minY) * scale) / 2;
  const point = ([lng, lat]) => [
    (left + (lng * squeeze - minX) * scale).toFixed(1),
    (top + (maxY - lat) * scale).toFixed(1),
  ];
  const lines = network.tracks
    .filter((track) => coordOf.has(track.from) && coordOf.has(track.to))
    .map((track) => {
      const [x1, y1] = point(coordOf.get(track.from));
      const [x2, y2] = point(coordOf.get(track.to));
      const color = track.planned ? cssColor('orange') : (colorOf.get([track.from, track.to].sort().join('|')) ?? '#3E4651');
      const dash = track.planned ? ' stroke-dasharray="3 2"' : '';
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}"${dash}/>`;
    })
    .join('');
  const dots = coords.length <= 60
    ? coords.map((coord) => `<circle cx="${point(coord)[0]}" cy="${point(coord)[1]}" r="1.6" fill="#fff" stroke="${cssColor('navy')}" stroke-width="0.8"/>`).join('')
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PICTURE_W} ${PICTURE_H}"><rect width="100%" height="100%" fill="${land}"/><g stroke-width="2" stroke-linecap="round">${lines}</g>${dots}</svg>`;
}

const pictureUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const dateText = (time) => {
  const date = new Date(time);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

// notice: 말풍선 알림, render: 다시 그리기, clearWork: 고르던 것·그리던 것 놓기 (app.js). 결과: { open }
export function createDrawerCard({ notice, render, clearWork }) {
  const element = document.createElement('div');
  element.className = 'dialog-backdrop';
  element.hidden = true;
  element.innerHTML = `
    <div class="dialog drawer-card" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div class="dialog-title" id="drawer-title"></div>
      <p class="dialog-text">이름 붙인 노선망을 여러 개 넣어 두고 꺼내요. 꺼내면 지금 노선망은 먼저 "자동 보관"으로 서랍에 들어가요.
        이 브라우저에만 있어요 (다른 컴퓨터로 옮기려면 꺼내서 [내보내기]).</p>
      <form class="drawer-put">
        <input class="drawer-name" type="text" maxlength="30" placeholder="이름 (예: 꿈의 서울)" aria-label="넣을 노선망 이름" />
        <button type="submit" class="drawer-put-button">지금 노선망 넣기</button>
      </form>
      <ul class="drawer-list"></ul>
      <p class="drawer-empty" hidden>아직 넣은 노선망이 없어요.</p>
      <div class="dialog-buttons"><button type="button" class="drawer-close">닫기</button></div>
    </div>
  `;
  document.body.append(element);
  const title = element.querySelector('.dialog-title');
  const list = element.querySelector('.drawer-list');
  const empty = element.querySelector('.drawer-empty');
  const nameInput = element.querySelector('.drawer-name');
  // 마지막으로 서랍에 넣거나 꺼낸 노선망 (그대로면 꺼낼 때 다시 자동 보관하지 않는다)
  let keptNetwork = null;
  const networkText = () => JSON.stringify(saveData().network);

  const focus = dialogFocus(element, document.getElementById('menu-button'));
  const close = () => {
    if (element.hidden) return;
    element.hidden = true;
    focus.closed();
  };
  element.querySelector('.drawer-close').addEventListener('click', close);
  element.addEventListener('click', (event) => {
    if (event.target === element) close();
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (element.hidden || event.key !== 'Escape') return;
      // 이름 바꾸는 칸의 Esc는 이름 바꾸기만 그만둔다 (창은 그대로)
      if (event.target.matches?.('.drawer-item input')) return;
      event.stopImmediatePropagation();
      close();
    },
    true,
  );
  // 서랍을 쓰다 실패하면 (브라우저가 저장 공간을 막음 등) 이유를 알린다
  const failed = (error) => notice(error.message, 'bad');

  // 지금 노선망을 넣는다 (이름이 없으면 "서울 2026년 3월")
  async function putCurrent(name) {
    const data = saveData();
    const { year, month } = getState();
    await putInDrawer({ name: name || `${getRegion().name} ${year}년 ${month}월`, data, picture: networkPicture(data.network) });
    keptNetwork = JSON.stringify(data.network);
  }

  element.querySelector('.drawer-put').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    putCurrent(name)
      .then(() => {
        nameInput.value = '';
        notice(`서랍에 넣었어요${name ? `: ${name}` : ''}`);
        return refresh();
      })
      .catch(failed);
  });

  // 꺼내는 중이면 다시 누른 것은 무시한다 (두 번 누르면 자동 보관이 둘 생기고 불러오기가 엇갈린다)
  let takingOut = false;
  async function takeOut(id) {
    if (takingOut) return;
    takingOut = true;
    try {
      await takeOutNow(id);
    } finally {
      takingOut = false;
    }
  }

  async function takeOutNow(id) {
    const entry = await getFromDrawer(id);
    const { stations } = saveData().network;
    // 지금 노선망을 먼저 넣어 둔다 (비었거나 서랍에서 꺼낸 그대로면 넣지 않는다)
    if (stations.length > 0 && networkText() !== keptNetwork) {
      const { year, month } = getState();
      await putCurrent(`자동 보관 · ${year}년 ${month}월`);
    }
    clearWork();
    loadData(entry.data);
    keptNetwork = networkText();
    close();
    render();
    notice(`서랍에서 "${entry.name}"을(를) 꺼냈어요`);
  }

  // 카드 하나
  function card(entry) {
    const item = document.createElement('li');
    item.className = 'drawer-item';
    const picture = document.createElement('img');
    picture.className = 'drawer-picture';
    picture.alt = '';
    picture.src = pictureUrl(entry.picture);
    const info = document.createElement('div');
    info.className = 'drawer-info';
    const name = document.createElement('b');
    name.className = 'drawer-title';
    name.textContent = entry.name;
    const meta = document.createElement('small');
    const { stations, routes, year, month } = entry.summary;
    meta.textContent = `${dateText(entry.savedAt)}에 넣음 · 게임 ${year}년 ${month}월 · 역 ${stations} · 노선 ${routes}`;
    info.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'drawer-actions';
    const button = (label, className, action) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = className;
      element.textContent = label;
      element.addEventListener('click', () => action(element));
      actions.append(element);
      return element;
    };
    button('꺼내기', 'drawer-take', () => takeOut(entry.id).catch(failed));
    button('이름 바꾸기', 'drawer-rename', () => rename(entry, name));
    button('복사', 'drawer-copy', () =>
      copyInDrawer(entry.id)
        .then(refresh)
        .catch(failed),
    );
    button('지우기', 'drawer-remove', (element) => {
      if (!element.classList.contains('armed')) {
        element.classList.add('armed');
        element.textContent = '정말 지울까요?';
        // 잠시 뒤 다시 누르지 않으면 원래대로 ([메뉴]의 [새로 시작]과 같다)
        setTimeout(() => {
          element.classList.remove('armed');
          element.textContent = '지우기';
        }, CONFIRM_MS);
        return;
      }
      removeFromDrawer(entry.id).then(refresh).catch(failed);
    });
    item.append(picture, info, actions);
    return item;
  }

  // 이름 바꾸기: 이름 자리에 입력 칸을 띄우고 Enter·칸 밖 누르기로 바꾼다 (Esc는 그대로 두기)
  function rename(entry, nameElement) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 30;
    input.className = 'drawer-name';
    input.value = entry.name;
    input.setAttribute('aria-label', '새 이름');
    nameElement.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const finish = (save) => {
      if (done) return;
      done = true;
      const next = input.value.trim();
      if (save && next && next !== entry.name) renameInDrawer(entry.id, next).then(refresh).catch(failed);
      else refresh().catch(failed);
    };
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') finish(true);
      if (event.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
  }

  async function refresh() {
    const entries = await drawerEntries();
    list.replaceChildren(...entries.map(card));
    empty.hidden = entries.length > 0;
  }

  function open() {
    title.textContent = `내 노선망 서랍 · ${getRegion().name}${isSandbox() ? ' 샌드박스' : ''}`;
    element.hidden = false;
    focus.opened(nameInput);
    refresh().catch(failed);
  }

  return { open };
}
