// 오른쪽 노선 패널: 새 노선 만들기 안내, 고른 노선 정보, 노선 목록.
// 상태를 직접 고치지 않고 받은 함수들(onSelect 등)로 알려주기만 한다.
import { ROUTE_COLORS } from '../config.js';
import { bindNameInput } from './nameInput.js';

export function createRoutePanel(
  element,
  { onSelect, onRename, onRecolor, onDelete, onFinishDraft, onCancelDraft },
) {
  element.innerHTML = `
    <section class="route-draft">
      <div class="panel-title">새 노선 만들기</div>
      <p class="route-hint"></p>
      <div class="route-sequence"></div>
      <p class="route-message"></p>
      <div class="route-draft-buttons">
        <button type="button" class="route-finish">완성 (Enter)</button>
        <button type="button" class="route-cancel">취소 (Esc)</button>
      </div>
    </section>
    <section class="route-detail">
      <div class="panel-title">노선 정보</div>
      <label class="panel-field">
        <span>이름</span>
        <input class="panel-name route-name" type="text" maxlength="20" />
      </label>
      <div class="panel-field">
        <span>색</span>
        <div class="route-swatches"></div>
      </div>
      <dl class="panel-facts">
        <dt>길이</dt><dd class="route-length"></dd>
        <dt>역 순서</dt><dd class="route-stations"></dd>
      </dl>
      <button type="button" class="panel-delete route-delete">노선 삭제</button>
    </section>
    <section class="route-list-section">
      <div class="panel-title">노선 목록</div>
      <div class="route-list"></div>
    </section>
  `;

  const draftSection = element.querySelector('.route-draft');
  const detailSection = element.querySelector('.route-detail');
  const hintText = element.querySelector('.route-hint');
  const sequenceText = element.querySelector('.route-sequence');
  const messageText = element.querySelector('.route-message');
  const lengthText = element.querySelector('.route-length');
  const stationsText = element.querySelector('.route-stations');
  const list = element.querySelector('.route-list');

  let routeId = null; // 지금 보여주는 노선 id
  const routeName = bindNameInput(element.querySelector('.route-name'), onRename);

  // 색 고르기 버튼 6개
  const swatches = element.querySelector('.route-swatches');
  const swatchButtons = ROUTE_COLORS.map(({ name, color }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'route-swatch';
    button.title = name;
    button.style.background = color;
    button.dataset.color = color;
    button.addEventListener('click', () => {
      if (routeId) onRecolor(routeId, color);
    });
    swatches.append(button);
    return button;
  });

  element.querySelector('.route-finish').addEventListener('click', onFinishDraft);
  element.querySelector('.route-cancel').addEventListener('click', onCancelDraft);
  element.querySelector('.route-delete').addEventListener('click', () => {
    if (routeId) onDelete(routeId);
  });

  // view = {
  //   tool: 지금 도구 id,
  //   draft: { stationNames: [...], message } 또는 null (노선 고르는 중이 아님),
  //   routes: [{ id, name, color, lengthKm }],
  //   selected: { id, name, color, lengthKm, stationNames } 또는 null,
  // }
  function show({ tool, draft, routes, selected }) {
    const showDraft = tool === 'route';
    draftSection.hidden = !showDraft;
    detailSection.hidden = !selected;
    element.hidden = !showDraft && !selected && routes.length === 0;

    if (showDraft) {
      hintText.textContent = draft
        ? '이어서 다음 역을 클릭하세요. 앞 역과 선로로 이어져 있어야 해요.'
        : '노선의 첫 역을 클릭하세요.';
      sequenceText.textContent = draft ? draft.stationNames.join(' → ') : '';
      messageText.textContent = draft?.message ?? '';
    }

    routeId = selected?.id ?? null;
    if (selected) {
      routeName.show(selected.id, selected.name);
      for (const button of swatchButtons) {
        button.classList.toggle('active', button.dataset.color === selected.color);
      }
      lengthText.textContent = `${selected.lengthKm.toFixed(2)} km`;
      stationsText.textContent = selected.stationNames.join(' → ');
    } else {
      routeName.clear();
    }

    renderList(routes, routeId);
  }

  // 노선 목록: 색 점 + 이름 + 길이. 누르면 그 노선을 고른다
  function renderList(routes, selectedId) {
    if (routes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'route-empty';
      empty.textContent = '아직 노선이 없어요.';
      list.replaceChildren(empty);
      return;
    }
    list.replaceChildren(
      ...routes.map((route) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'route-item';
        item.classList.toggle('active', route.id === selectedId);
        const dot = document.createElement('span');
        dot.className = 'route-item-dot';
        dot.style.background = route.color;
        const name = document.createElement('span');
        name.className = 'route-item-name';
        name.textContent = route.name;
        const length = document.createElement('span');
        length.className = 'route-item-length';
        length.textContent = `${route.lengthKm.toFixed(1)} km`;
        item.append(dot, name, length);
        item.addEventListener('click', () => onSelect(route.id));
        return item;
      }),
    );
  }

  return { show };
}
