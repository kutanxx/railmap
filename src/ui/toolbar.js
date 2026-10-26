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
