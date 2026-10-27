// 화면 위쪽 도구 막대. 버튼을 누르면 onSelect(도구 id)를 부른다
// key: 키보드 숫자키 단축키 (ui/mapInput.js). 버튼 옆에 작게 적어 둔다
export const TOOLS = [
  { id: 'select', label: '선택', key: '1' },
  { id: 'station', label: '역 놓기', key: '2' },
  { id: 'track', label: '선로', key: '3' },
  { id: 'route', label: '노선', key: '4' },
];

export function createToolbar(element, onSelect) {
  const buttons = new Map();

  for (const tool of TOOLS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-button';
    const shortcut = document.createElement('span');
    shortcut.className = 'tool-key';
    shortcut.textContent = tool.key;
    button.append(tool.label, shortcut);
    button.title = `${tool.label} (숫자키 ${tool.key})`;
    button.addEventListener('click', () => onSelect(tool.id));
    element.append(button);
    buttons.set(tool.id, button);
  }

  // 지금 고른 도구 버튼만 남색으로 칠한다
  function setActive(toolId) {
    for (const [id, button] of buttons) {
      button.classList.toggle('active', id === toolId);
    }
  }

  return { setActive };
}

// [선로] 도구를 고른 동안 도구 막대 옆에 [직선][곡선] (V 키로도 바꾼다). 새로 그리는 선로 모양을 정한다
// onChoose(curve): 곡선을 골랐으면 true
export function createTrackShapeToggle(element, onChoose) {
  const make = (label, curve, key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hud-button';
    button.textContent = label;
    if (key) {
      const shortcut = document.createElement('span');
      shortcut.className = 'tool-key';
      shortcut.textContent = key;
      button.append(shortcut);
    }
    button.title = curve ? '경유점을 지나는 부드러운 곡선으로 그리기 (V 키)' : '경유점에서 꺾이는 직선으로 그리기 (V 키)';
    button.addEventListener('click', () => onChoose(curve));
    element.append(button);
    return button;
  };
  const straight = make('직선', false, null);
  const curved = make('곡선', true, 'V');

  // visible: [선로] 도구를 쓰는 중인지, curve: 지금 곡선으로 그리는지
  function show(visible, curve) {
    element.hidden = !visible;
    straight.classList.toggle('active', !curve);
    curved.classList.toggle('active', curve);
  }

  return { show };
}
