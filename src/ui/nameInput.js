// 이름 입력 칸 공통 동작 (역 이름, 노선 이름에 같이 쓴다)
// - 글자를 칠 때마다 onRename을 불러서 지도에 바로 보이게 한다
// - 다 지우고 나가면 처음 이름으로 돌려놓는다
// - Enter를 누르면 입력을 마친다

export function bindNameInput(input, onRename) {
  // 지금 고치는 대상 { id, defaultName }
  let target = null;

  input.addEventListener('input', () => {
    if (target) onRename(target.id, input.value);
  });
  input.addEventListener('change', () => {
    if (!target) return;
    const trimmed = input.value.trim();
    if (trimmed === '') {
      input.value = target.defaultName;
      onRename(target.id, target.defaultName);
    } else if (trimmed !== input.value) {
      input.value = trimmed;
      onRename(target.id, trimmed);
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') input.blur();
  });

  // 대상과 이름을 보여준다. 사용자가 입력 중일 때는 칸을 덮어쓰지 않는다
  function show(id, name) {
    const isNewTarget = !target || target.id !== id;
    if (isNewTarget) target = { id, defaultName: name };
    if (isNewTarget || document.activeElement !== input) input.value = name;
  }

  function clear() {
    target = null;
  }

  return { show, clear };
}
