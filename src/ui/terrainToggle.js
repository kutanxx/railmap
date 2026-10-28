// [지형] 버튼: 켜면 등고선(map/contours.js)이 보인다. 땅 높이가 있는 가상 지도에서만 버튼이 나온다.
export function createTerrainToggle(element, onToggle) {
  element.innerHTML = `<button type="button" class="hud-button" title="등고선 보기 (T 키)">지형<span class="tool-key">T</span></button>`;
  const button = element.querySelector('button');
  button.addEventListener('click', onToggle);

  return {
    setActive(on) {
      button.classList.toggle('active', on);
      button.setAttribute('aria-pressed', String(Boolean(on)));
    },
  };
}
