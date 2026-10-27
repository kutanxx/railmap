// 화면 위쪽 도구 막대. 버튼을 누르면 onSelect(도구 id)를 부른다. [선로] 도구일 때는 끝에 [곡선] 단추가 붙는다
// key: 키보드 숫자키 단축키 (ui/mapInput.js). 버튼 옆에 작게 적어 둔다
export const TOOLS = [
  { id: 'select', label: '선택', key: '1' },
  { id: 'station', label: '역 놓기', key: '2' },
  { id: 'track', label: '선로', key: '3' },
  { id: 'route', label: '노선', key: '4' },
];

// onSelect(도구 id): 도구 버튼을 눌렀을 때, onToggleCurve(): [곡선] 단추를 눌렀을 때 (새로 그릴 선로를 직선 ↔ 곡선)
export function createToolbar(element, onSelect, onToggleCurve) {
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

  // [선로] 도구를 고른 동안만 막대 끝에 [곡선 V]: 켜면(남색) 경유점을 지나는 부드러운 곡선, 끄면 꺾이는 직선
  const divider = document.createElement('span');
  divider.className = 'toolbar-divider';
  const curveButton = document.createElement('button');
  curveButton.type = 'button';
  curveButton.className = 'tool-button';
  const curveKey = document.createElement('span');
  curveKey.className = 'tool-key';
  curveKey.textContent = 'V';
  curveButton.append('곡선', curveKey);
  curveButton.addEventListener('click', onToggleCurve);
  element.append(divider, curveButton);

  // 지금 고른 도구 버튼만 남색으로 칠한다. curve: 새로 그릴 선로가 곡선인지
  function setActive(toolId, curve) {
    for (const [id, button] of buttons) {
      button.classList.toggle('active', id === toolId);
    }
    const drawingTrack = toolId === 'track';
    divider.hidden = !drawingTrack;
    curveButton.hidden = !drawingTrack;
    curveButton.classList.toggle('active', curve);
    curveButton.title = curve
      ? '곡선으로 그리는 중: 누르면 직선으로 (V 키)'
      : '직선으로 그리는 중: 누르면 경유점을 지나는 곡선으로 (V 키)';
  }

  return { setActive };
}
