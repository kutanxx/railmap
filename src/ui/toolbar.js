// 화면 위쪽 도구 막대. 버튼을 누르면 onSelect(도구 id)를 부른다
export const TOOLS = [
  { id: 'select', label: '선택' },
  { id: 'station', label: '역 놓기' },
  { id: 'track', label: '선로' },
];

export function createToolbar(element, onSelect) {
  const buttons = new Map();

  for (const tool of TOOLS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-button';
    button.textContent = tool.label;
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
