// 왼쪽 아래 [메뉴]·[소리]의 펼침 판: 자기 버튼 바로 위로 열리고, 한 번에 하나만 열린다.
// 다른 펼침을 열거나, 펼침 밖을 누르거나, Esc를 누르면 닫힌다. 열린 동안 버튼은 남색으로 채워진다 (aria-expanded).

const popovers = []; // [{ button, panel }]

// button을 누르면 panel이 열리고 닫힌다. 결과: { close }
export function createPopover(button, panel) {
  const entry = { button, panel };
  popovers.push(entry);
  button.addEventListener('click', () => (panel.hidden ? open(entry) : close(entry)));
  return { close: () => close(entry) };
}

// 열린 펼침을 모두 닫는다 (메뉴 항목을 누른 뒤 등)
export function closePopovers() {
  for (const entry of popovers) close(entry);
}

function open(entry) {
  for (const other of popovers) if (other !== entry) close(other);
  entry.panel.hidden = false;
  entry.button.setAttribute('aria-expanded', 'true');
}

function close(entry) {
  entry.panel.hidden = true;
  entry.button.setAttribute('aria-expanded', 'false');
}

// 펼침 밖(지도, 다른 버튼)을 누르면 닫는다
document.addEventListener('pointerdown', (event) => {
  for (const entry of popovers) {
    if (entry.panel.hidden) continue;
    if (entry.panel.contains(event.target) || entry.button.contains(event.target)) continue;
    close(entry);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopovers();
});
