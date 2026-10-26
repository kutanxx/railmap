// 시작 화면: 어느 지도에서 할지 고른다 (config.js의 REGIONS).
// 지도마다 브라우저에 저장된 게임이 있으면 "이어하기 · 2026년 5월"처럼 알려준다.
import { REGIONS } from '../config.js';
import { savedGameInfo } from '../game/save.js';

// element에 시작 화면을 띄우고, 고르면 그 지도 id로 끝나는 Promise를 돌려준다
export function chooseRegion(element) {
  element.innerHTML = `
    <div class="start-card">
      <h1 class="start-title">레일맵</h1>
      <p class="start-lead">어느 지도에 철도를 놓을까요?</p>
      <div class="start-choices"></div>
    </div>
  `;
  const choices = element.querySelector('.start-choices');
  element.hidden = false;

  return new Promise((resolve) => {
    for (const [id, region] of Object.entries(REGIONS)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'start-choice';
      const title = document.createElement('b');
      title.textContent = region.title;
      const description = document.createElement('span');
      description.textContent = region.description;
      const save = document.createElement('small');
      save.textContent = saveText(savedGameInfo(id));
      button.append(title, description, save);
      button.addEventListener('click', () => {
        element.hidden = true;
        resolve(id);
      });
      choices.append(button);
    }
  });
}

function saveText(info) {
  if (!info) return '새 게임';
  if (info.broken) return '저장이 망가져서 새 게임으로 시작해요';
  return `이어하기 · ${info.year}년 ${info.month}월`;
}
