// 링크로 공유하기 화면 (자료를 주소에 넣고 꺼내는 일은 game/share.js).
// - [메뉴]의 [링크로 공유]: 지금 노선망을 담은 링크를 복사한다. 복사가 막힌 브라우저면 링크를 글자 칸에 띄워 직접 복사하게 한다
// - 시작 화면 맨 위 "공유받은 노선망" 칸: 받은 노선망을 그 지도의 샌드박스로 연다.
//   그 지도의 샌드박스 저장이 이미 있으면 버튼에 "덮어쓰고"를 적어 알린다 (브라우저 confirm 창 대신)
import { REGIONS } from '../regions.js';
import { savedGameInfo } from '../game/save.js';
import { shareLink } from '../game/share.js';

// [링크로 공유]: notice(글, 모양)는 화면 가운데 말풍선
export function copyShareLink(notice) {
  shareLink()
    .then((link) =>
      navigator.clipboard.writeText(link).then(
        () => notice('공유 링크를 복사했어요. 메신저에 붙여 넣어 보내세요 (받은 사람은 샌드박스로 열어요)'),
        () => showLinkBox(link),
      ),
    )
    .catch((error) => notice(`공유 링크를 만들지 못했어요: ${error.message}`, 'bad'));
}

// 복사가 막혔을 때: 화면 가운데 창에 링크를 띄워 직접 복사하게 한다
function showLinkBox(link) {
  const box = document.createElement('div');
  box.className = 'dialog-backdrop';
  box.innerHTML = `
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div class="dialog-title" id="share-title">공유 링크</div>
      <p class="dialog-text">아래 링크를 길게 누르거나 전부 골라 복사해 보내세요.</p>
      <input class="share-link-input" type="text" readonly aria-label="공유 링크" />
      <div class="dialog-buttons"><button type="button" class="dialog-primary">닫기</button></div>
    </div>`;
  const input = box.querySelector('input');
  input.value = link;
  box.querySelector('button').addEventListener('click', () => box.remove());
  document.body.append(box);
  input.select();
}

// 시작 화면의 "공유받은 노선망" 칸
// shared: 받은 노선망 (저장 모양) 또는 null, problem: 링크를 읽지 못한 이유 또는 null
// onOpen(): 샌드박스로 열기, onClose(): 칸 닫기
export function renderSharedCard(section, { shared, problem, onOpen, onClose }) {
  if (!shared && !problem) return;
  section.hidden = false;
  if (problem) {
    section.innerHTML = `
      <div class="start-shared-card">
        <p class="start-first-label">공유받은 노선망</p>
        <p class="start-shared-text"></p>
        <div class="start-shared-buttons"><button type="button" class="start-shared-close">닫기</button></div>
      </div>`;
    section.querySelector('.start-shared-text').textContent = `링크를 읽지 못했어요: ${problem}. 링크가 끝까지 복사됐는지 확인해 주세요.`;
  } else {
    const region = REGIONS[shared.region];
    const { stations, routes } = shared.network;
    const existing = savedGameInfo(shared.region, true);
    section.innerHTML = `
      <div class="start-shared-card">
        <p class="start-first-label">공유받은 노선망</p>
        <p class="start-first-name"></p>
        <p class="start-shared-text"></p>
        <div class="start-shared-buttons">
          <button type="button" class="start-first-go start-shared-open"></button>
          <button type="button" class="start-shared-close">닫기</button>
        </div>
      </div>`;
    section.querySelector('.start-first-name').textContent = `${region.name} · 역 ${stations.length}곳 · 노선 ${routes.length}개`;
    section.querySelector('.start-shared-text').textContent = existing
      ? `${region.name} 샌드박스에 저장해 둔 게임이 있어요. 열면 그 게임이 이 노선망으로 바뀌어요 (돈 무제한, 일반 게임은 그대로).`
      : `${region.name} 샌드박스(돈 무제한)로 열어요. 일반 게임 저장은 그대로예요.`;
    section.querySelector('.start-shared-open').textContent = existing ? '샌드박스를 바꾸고 열기 ▶' : '샌드박스로 열기 ▶';
    section.querySelector('.start-shared-open').addEventListener('click', onOpen);
  }
  section.querySelector('.start-shared-close').addEventListener('click', () => {
    section.hidden = true;
    onClose();
  });
}
