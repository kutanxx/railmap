// 오른쪽 노선 패널: 새 노선 만들기 안내, 고른 노선 정보, 노선 목록.
// 상태를 직접 고치지 않고 받은 함수들(onSelect 등)로 알려주기만 한다.
import { ROUTE_COLORS, MAX_TRAINS_PER_ROUTE, TRAIN_COST, CROWDED_WARNING } from '../config.js';
import { bindNameInput } from './nameInput.js';
import { formatMoney, formatSignedMoney, formatPopulation, formatPeopleShort } from './format.js';

export function createRoutePanel(
  element,
  {
    onSelect,
    onRename,
    onRecolor,
    onTrainCount,
    onDelete,
    onDeletePreview,
    onDuplicate,
    onMoveStop,
    onRemoveStation,
    onToggleInsert,
    onFinishDraft,
    onCancelDraft,
  },
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
      <div class="panel-field">
        <span>열차 수</span>
        <div class="route-trains">
          <button type="button" class="route-trains-minus" aria-label="열차 빼기">−</button>
          <b class="route-trains-count"></b>
          <button type="button" class="route-trains-plus" aria-label="열차 더하기">+</button>
          <span class="route-trains-price"></span>
        </div>
      </div>
      <dl class="panel-facts">
        <dt>혼잡도</dt><dd class="route-load"></dd>
        <dt>하루 승객</dt><dd class="route-riders"></dd>
        <dt>평균 이동</dt><dd class="route-avg-km"></dd>
        <dt>월 수입</dt><dd class="route-revenue"></dd>
        <dt>길이</dt><dd class="route-length"></dd>
      </dl>
      <div class="panel-field">
        <span>역 순서 <small class="route-stops-hint">끌어서 순서를 바꿔요</small></span>
        <ol class="route-stops"></ol>
        <button type="button" class="route-insert">역 끼워넣기</button>
        <p class="route-message route-edit-message"></p>
      </div>
      <button type="button" class="route-insert route-duplicate">노선 복제 (같은 역 순서로 새 노선)</button>
      <button type="button" class="panel-delete route-delete">노선 삭제</button>
      <p class="panel-removal route-removal"></p>
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
  const revenueText = element.querySelector('.route-revenue');
  const ridersText = element.querySelector('.route-riders');
  const loadText = element.querySelector('.route-load');
  element.querySelector('.route-trains-price').textContent = `1대 ${formatMoney(TRAIN_COST)}`;
  const avgKmText = element.querySelector('.route-avg-km');
  const stopList = element.querySelector('.route-stops');
  const insertButton = element.querySelector('.route-insert');
  const editMessage = element.querySelector('.route-edit-message');
  const list = element.querySelector('.route-list');

  const trainCountText = element.querySelector('.route-trains-count');
  const minusButton = element.querySelector('.route-trains-minus');
  const plusButton = element.querySelector('.route-trains-plus');

  let routeId = null; // 지금 보여주는 노선 id
  let trainCount = 0; // 지금 보여주는 노선의 열차 수

  minusButton.addEventListener('click', () => {
    if (routeId) onTrainCount(routeId, trainCount - 1);
  });
  plusButton.addEventListener('click', () => {
    if (routeId) onTrainCount(routeId, trainCount + 1);
  });
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
  element.querySelector('.route-duplicate').addEventListener('click', () => {
    if (routeId) onDuplicate(routeId);
  });
  const deleteButton = element.querySelector('.route-delete');
  deleteButton.addEventListener('click', () => {
    if (routeId) onDelete(routeId);
  });
  // 마우스를 올리면 지도에 사라질 노선을 빨간 점선으로 보여준다
  deleteButton.addEventListener('mouseenter', () => onDeletePreview(true));
  deleteButton.addEventListener('mouseleave', () => onDeletePreview(false));
  const removalText = element.querySelector('.route-removal');
  insertButton.addEventListener('click', () => {
    if (routeId) onToggleInsert(routeId);
  });

  // view = {
  //   tool: 지금 도구 id,
  //   draft: { stationNames: [...], message } 또는 null (노선 고르는 중이 아님),
  //   routes: [{ id, name, color, lengthKm, revenue, riders, load }],
  //   selected: { id, name, color, lengthKm, stops: [{ id, name }], trainCount, revenue, riders, avgKm, load, lost } 또는 null,
  //   (load: 혼잡도, 1 = 100%. lost: 자리가 없어 놓친 하루 승객)
  //   inserting: 역을 끼워넣는 중인지, message: 노선 편집 안내 글
  // }
  function show({ tool, draft, routes, selected, inserting, message }) {
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
      trainCount = selected.trainCount;
      removalText.textContent = `지우면 열차 ${trainCount}대도 함께 사라져요 (열차 값은 돌려받지 않아요). 선로와 역은 남아요.`;
      trainCountText.textContent = `${trainCount}대`;
      minusButton.disabled = trainCount <= 0;
      plusButton.disabled = trainCount >= MAX_TRAINS_PER_ROUTE;
      lengthText.textContent = `${selected.lengthKm.toFixed(2)} km`;
      ridersText.textContent = selected.trainCount > 0 ? formatPopulation(selected.riders) : '0명';
      showLoad(selected);
      avgKmText.textContent = selected.riders > 0 ? `${selected.avgKm.toFixed(1)} km` : '-';
      revenueText.textContent =
        selected.trainCount > 0 ? `${formatSignedMoney(selected.revenue)} / 월` : '열차가 없어 운행 안 함';
      renderStops(selected.stops);
      insertButton.classList.toggle('active', inserting);
      insertButton.textContent = inserting ? '끼워넣기 끝내기' : '역 끼워넣기';
      editMessage.textContent = message;
    } else {
      routeName.clear();
    }

    renderList(routes, routeId);
  }

  // 혼잡도: 가장 붐비는 한 시간 기준. 넘치면 놓친 승객도 알려준다
  function showLoad({ trainCount, load, lost }) {
    loadText.className = `route-load ${loadTone(load)}`;
    if (trainCount === 0) {
      loadText.replaceChildren('-');
      return;
    }
    const small = document.createElement('small');
    small.textContent =
      load > 1
        ? `자리가 없어 하루 ${formatPopulation(lost)}을 놓쳐요. 열차를 늘려보세요`
        : '출퇴근 시간 기준';
    loadText.replaceChildren(`${Math.round(load * 100)}%`, small);
  }

  // 역 순서: 역 이름 + [빼기] 버튼. 줄을 끌어다 다른 줄 위에 놓으면 그 자리로 옮긴다
  let draggedIndex = null;
  function renderStops(stops) {
    stopList.replaceChildren(
      ...stops.map((stop, index) => {
        const item = document.createElement('li');
        item.draggable = true;
        item.addEventListener('dragstart', (event) => {
          draggedIndex = index;
          event.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragover', (event) => {
          if (draggedIndex === null) return;
          event.preventDefault(); // 여기에 놓을 수 있다고 알린다
          item.classList.add('drop-target');
        });
        item.addEventListener('dragleave', () => item.classList.remove('drop-target'));
        item.addEventListener('drop', (event) => {
          event.preventDefault();
          item.classList.remove('drop-target');
          if (draggedIndex !== null && draggedIndex !== index) onMoveStop(routeId, draggedIndex, index);
          draggedIndex = null;
        });
        item.addEventListener('dragend', () => {
          draggedIndex = null;
        });
        const name = document.createElement('span');
        name.textContent = stop.name;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'route-stop-remove';
        remove.textContent = '빼기';
        remove.addEventListener('click', () => onRemoveStation(routeId, stop.id));
        item.append(name, remove);
        return item;
      }),
    );
  }

  // 노선 목록: 번호 배지(노선 색) + 이름 + 월 수입. 누르면 그 노선을 고른다
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
        dot.textContent = route.number;
        const name = document.createElement('span');
        name.className = 'route-item-name';
        name.textContent = route.name;
        const length = document.createElement('span');
        length.className = 'route-item-length';
        length.textContent = `${formatPeopleShort(route.riders)}명 · ${formatSignedMoney(route.revenue)}`;
        // 넘치는 노선은 목록에서도 빨간 "혼잡"으로 알려준다
        if (route.load > 1) {
          const crowded = document.createElement('span');
          crowded.className = 'route-item-crowded';
          crowded.textContent = '혼잡';
          name.append(crowded);
        }
        length.title = `하루 승객 · 월 수입 (길이 ${route.lengthKm.toFixed(1)} km)`;
        item.append(dot, name, length);
        item.addEventListener('click', () => onSelect(route.id));
        return item;
      }),
    );
  }

  return { show };
}

// 혼잡도 색: 여유(초록) / 붐빔(주황) / 넘침(빨강)
function loadTone(load) {
  if (load > 1) return 'load-over';
  if (load >= CROWDED_WARNING) return 'load-busy';
  return 'load-ok';
}
