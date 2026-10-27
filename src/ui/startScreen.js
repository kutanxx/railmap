// 시작 화면: 어느 지도에서 할지 고른다 (regions.js의 REGIONS). 한국 도시 / 세계 도시 / 가상 지도로 묶어 보여준다.
// 지도마다 브라우저에 저장된 게임이 있으면 "이어하기 · 2026년 5월"처럼 알려준다.
// 지도 카드 아래 [샌드박스]로 돈 무제한(빚·파산·목표 없음) 게임을 따로 할 수 있다 (저장 칸도 따로).
import { REGIONS } from '../regions.js';
import { savedGameInfo } from '../game/save.js';

// element에 시작 화면을 띄우고, 고르면 { id: 지도 id, sandbox: 샌드박스인지 }로 끝나는 Promise를 돌려준다
export function chooseRegion(element) {
  element.innerHTML = `
    <div class="start-card">
      <h1 class="start-title">레일맵</h1>
      <p class="start-lead">어느 지도에 철도를 놓을까요?</p>
      <div class="start-groups"></div>
    </div>
  `;
  const groups = element.querySelector('.start-groups');
  element.hidden = false;

  return new Promise((resolve) => {
    for (const { title, regions } of groupRegions()) {
      const heading = document.createElement('h2');
      heading.className = 'start-group-title';
      heading.textContent = title;
      const choices = document.createElement('div');
      choices.className = 'start-choices';
      groups.append(heading, choices);
      for (const [id, region] of regions) addChoice(choices, id, region);
    }

    function addChoice(choices, id, region) {
      const choose = (sandbox) => {
        element.hidden = true;
        resolve({ id, sandbox });
      };
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'start-choice';
      const title = document.createElement('b');
      title.textContent = region.name;
      const description = document.createElement('span');
      description.textContent = region.description;
      const save = document.createElement('small');
      save.textContent = saveText(savedGameInfo(id));
      button.append(title, description, save);
      button.addEventListener('click', () => choose(false));
      // 같은 지도의 샌드박스 (돈 무제한)
      const sandbox = document.createElement('button');
      sandbox.type = 'button';
      sandbox.className = 'start-sandbox';
      const sandboxSave = savedGameInfo(id, true);
      sandbox.textContent = `샌드박스 · 돈 무제한${sandboxSave && !sandboxSave.broken ? ` · 이어하기 ${sandboxSave.year}년 ${sandboxSave.month}월` : ''}`;
      sandbox.addEventListener('click', () => choose(true));
      const card = document.createElement('div');
      card.className = 'start-choice-row';
      card.append(button, sandbox);
      choices.append(card);
    }
  });
}

// 지도들을 묶음으로: [{ title, regions: [[id, region], …] }] (빈 묶음은 뺀다)
function groupRegions() {
  const entries = Object.entries(REGIONS);
  return [
    { title: '한국 도시', regions: entries.filter(([, r]) => !r.virtual && r.country === 'kr') },
    { title: '세계 도시', regions: entries.filter(([, r]) => !r.virtual && r.country !== 'kr') },
    { title: '가상 지도', regions: entries.filter(([, r]) => r.virtual) },
  ].filter((group) => group.regions.length > 0);
}

function saveText(info) {
  if (!info) return '새 게임';
  if (info.broken) return '저장이 망가져서 새 게임으로 시작해요';
  return `이어하기 · ${info.year}년 ${info.month}월`;
}
