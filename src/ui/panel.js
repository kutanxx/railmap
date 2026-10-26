// 오른쪽 정보 패널. 선택한 역의 이름 바꾸기와 삭제를 한다.
// 상태를 직접 고치지 않고 onRename, onDelete로 알려주기만 한다.

export function createPanel(element, { onRename, onRotate, onDelete }) {
  element.innerHTML = `
    <div class="panel-title">역 정보</div>
    <label class="panel-field">
      <span>이름</span>
      <input class="panel-name" type="text" maxlength="20" />
    </label>
    <div class="panel-field">
      <span>방향 <b class="panel-angle-text"></b></span>
      <input class="panel-angle" type="range" min="0" max="175" step="5" />
      <div class="panel-angle-presets">
        <button type="button" data-angle="0">가로</button>
        <button type="button" data-angle="90">세로</button>
      </div>
    </div>
    <div class="panel-coord"></div>
    <button type="button" class="panel-delete">역 삭제</button>
  `;

  const nameInput = element.querySelector('.panel-name');
  const angleInput = element.querySelector('.panel-angle');
  const angleText = element.querySelector('.panel-angle-text');
  const coordText = element.querySelector('.panel-coord');
  const deleteButton = element.querySelector('.panel-delete');

  // 슬라이더를 움직이면 승강장을 돌린다
  angleInput.addEventListener('input', () => {
    if (station) onRotate(station.id, Number(angleInput.value));
  });
  for (const button of element.querySelectorAll('.panel-angle-presets button')) {
    button.addEventListener('click', () => {
      if (station) onRotate(station.id, Number(button.dataset.angle));
    });
  }

  let station = null;

  // 글자를 칠 때마다 이름을 바꿔서 말풍선에 바로 보이게 한다
  nameInput.addEventListener('input', () => {
    if (station) onRename(station.id, nameInput.value);
  });
  // 입력을 마쳤는데 비어 있으면 원래 이름으로 돌려놓는다
  nameInput.addEventListener('change', () => {
    if (!station) return;
    const trimmed = nameInput.value.trim();
    if (trimmed === '') {
      nameInput.value = station.defaultName;
      onRename(station.id, station.defaultName);
    } else if (trimmed !== nameInput.value) {
      nameInput.value = trimmed;
      onRename(station.id, trimmed);
    }
  });
  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') nameInput.blur();
  });

  deleteButton.addEventListener('click', () => {
    if (station) onDelete(station.id);
  });

  // 역을 보여준다. null이면 패널을 숨긴다
  function show(nextStation) {
    if (!nextStation) {
      station = null;
      element.hidden = true;
      return;
    }
    const isNewStation = !station || station.id !== nextStation.id;
    station = {
      id: nextStation.id,
      // 이름을 비우면 돌아갈 이름 (선택했을 때의 이름)
      defaultName: isNewStation ? nextStation.name : station.defaultName,
    };
    element.hidden = false;

    // 사용자가 입력 중일 때는 칸을 덮어쓰지 않는다
    if (isNewStation || document.activeElement !== nameInput) {
      nameInput.value = nextStation.name;
    }
    angleInput.value = nextStation.angle;
    angleText.textContent = angleLabel(nextStation.angle);
    const [lng, lat] = nextStation.coord;
    coordText.textContent = `위도 ${lat.toFixed(5)}, 경도 ${lng.toFixed(5)}`;
  }

  show(null);
  return { show };
}

// 각도를 읽기 쉬운 말로: 0 → "가로", 90 → "세로", 그 밖에는 "45°"
function angleLabel(angle) {
  if (angle === 0) return '가로';
  if (angle === 90) return '세로';
  return `${angle}°`;
}
