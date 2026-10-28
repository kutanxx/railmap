// 화면 위쪽 도구 막대. 버튼을 누르면 onSelect(도구 id)를 부른다. [선로] 도구일 때는 끝에 [곡선]·[계획] 단추가 붙는다
// key: 키보드 숫자키 단축키 (ui/mapInput.js). 버튼 옆에 작게 적어 둔다
export const TOOLS = [
  { id: 'select', label: '선택', key: '1' },
  { id: 'station', label: '역 놓기', key: '2' },
  { id: 'track', label: '선로', key: '3' },
  { id: 'route', label: '노선', key: '4' },
];

// onSelect(도구 id): 도구 버튼을 눌렀을 때, onToggleCurve(): [곡선] 단추를 눌렀을 때 (새로 그릴 선로를 직선 ↔ 곡선)
// onTogglePlan(): [계획] 단추를 눌렀을 때 (새로 그릴 선로를 계획 선로로)
export function createToolbar(element, onSelect, onToggleCurve, onTogglePlan) {
  const buttons = new Map();

  for (const tool of TOOLS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-button';
    const shortcut = document.createElement('span');
    shortcut.className = 'tool-key';
    shortcut.textContent = tool.key;
    // 화면 읽기 프로그램이 "선택1"처럼 이름에 붙여 읽지 않게 숨기고, 단축키는 따로 알린다
    shortcut.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-keyshortcuts', tool.key);
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
  curveKey.setAttribute('aria-hidden', 'true');
  curveButton.setAttribute('aria-keyshortcuts', 'V');
  curveButton.append('곡선', curveKey);
  curveButton.addEventListener('click', onToggleCurve);
  // [계획 P]: 켜면(남색) 돈을 내지 않고 주황 점선으로 그려만 둔다. 선로 카드의 [짓기]로 나중에 짓는다
  const planButton = document.createElement('button');
  planButton.type = 'button';
  planButton.className = 'tool-button';
  const planKey = document.createElement('span');
  planKey.className = 'tool-key';
  planKey.textContent = 'P';
  planKey.setAttribute('aria-hidden', 'true');
  planButton.setAttribute('aria-keyshortcuts', 'P');
  planButton.append('계획', planKey);
  planButton.addEventListener('click', onTogglePlan);
  element.append(divider, curveButton, planButton);

  // 지금 고른 도구 버튼만 남색으로 칠한다. curve: 새로 그릴 선로가 곡선인지, plan: 계획 선로로 그리는지
  function setActive(toolId, curve, plan) {
    for (const [id, button] of buttons) {
      button.classList.toggle('active', id === toolId);
      button.setAttribute('aria-pressed', String(Boolean(id === toolId)));
    }
    const drawingTrack = toolId === 'track';
    divider.hidden = !drawingTrack;
    curveButton.hidden = !drawingTrack;
    planButton.hidden = !drawingTrack;
    planButton.classList.toggle('active', plan);
    planButton.setAttribute('aria-pressed', String(Boolean(plan)));
    planButton.title = plan
      ? '계획 선로로 그리는 중: 돈이 들지 않고, 나중에 선로 카드에서 지어요. 누르면 바로 짓기로 (P 키)'
      : '바로 짓는 중: 누르면 돈을 내지 않는 계획 선로로 그려요 (P 키)';
    curveButton.classList.toggle('active', curve);
    curveButton.setAttribute('aria-pressed', String(Boolean(curve)));
    curveButton.title = curve
      ? '곡선으로 그리는 중: 누르면 직선으로 (V 키)'
      : '직선으로 그리는 중: 누르면 경유점을 지나는 곡선으로 (V 키)';
  }

  return { setActive };
}
