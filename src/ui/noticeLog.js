// 지난 알림: 말풍선 알림(정보·주의·위험)을 NOTICE_LOG_SIZE개까지 기억하고, 위쪽 [알림 n] 버튼으로 목록을 연다.
// n은 아직 보지 않은 알림 수. 목록의 알림을 누르면 지도가 그 자리로 간다 (자리가 있는 알림만).
import { NOTICE_LOG_SIZE } from '../config.js';
import { getState } from '../game/state.js';
import { createPopover, closePopovers } from './popovers.js';

const log = []; // 최근 것이 앞: [{ text, tone, coord, date }]
let unread = 0;
let refresh = () => {}; // 목록 화면이 만들어지면 바꾼다

// 알림 하나를 기억한다 (callouts.js가 부른다)
export function logNotice({ text, tone, coord }) {
  const { year, month } = getState();
  log.unshift({ text, tone, coord, date: `${year}년 ${month}월` });
  log.length = Math.min(log.length, NOTICE_LOG_SIZE);
  unread += 1;
  refresh();
}

// button: [알림] 버튼, panel: 목록을 넣을 펼침 판, map: 알림 자리로 날아갈 지도
export function createNoticeLog(button, panel, map) {
  createPopover(button, panel);
  // 목록을 열면 다 본 것으로 친다
  button.addEventListener('click', () => {
    unread = 0;
    refresh();
  });

  refresh = () => {
    button.textContent = unread > 0 ? `알림 ${unread}` : '알림';
    button.classList.toggle('has-unread', unread > 0);
    if (log.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'notice-empty';
      empty.textContent = '아직 알림이 없어요.';
      panel.replaceChildren(empty);
      return;
    }
    panel.replaceChildren(
      ...log.map((entry) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `notice-item notice-${entry.tone}`;
        const text = document.createElement('span');
        text.textContent = entry.text;
        const date = document.createElement('small');
        date.textContent = entry.date;
        item.append(text, date);
        if (entry.coord) {
          item.title = '눌러서 그 자리로 가기';
          item.addEventListener('click', () => {
            closePopovers();
            map.flyTo({ center: entry.coord, zoom: Math.max(map.getZoom(), 15) });
          });
        } else {
          item.disabled = true;
        }
        return item;
      }),
    );
  };
  refresh();
}
