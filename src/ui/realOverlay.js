// 실제와 비교 (왼쪽 아래 [실제 노선], R 키): 그 도시의 실제 지하철 노선망(game/presets.js)을 내 노선망 밑에 회색으로 겹친다.
// 개통 연도가 적혀 있으면 게임 날짜의 해까지 개통한 것만 (타임머신으로 1985년에 시작했으면 1985년의 실제 노선망, 해가 지나면 같이 자란다).
// 실제 노선망이 없는 지도(가상 지도)에서는 버튼을 숨긴다. 자료는 처음 켤 때 받는다
import { getState } from '../game/state.js';
import { getRegion } from '../game/region.js';
import { loadPreset, presetOf } from '../game/presets.js';
import { networkAtYear } from '../game/timeMachine.js';
import { showReal } from '../map/realLayers.js';

// ui.real: 켰는지 (app.js의 화면 상태), notice: 말풍선 알림
// 결과: { toggle, update (다시 그릴 때마다: 버튼 모양과, 해가 바뀌면 다시 그리기), available: 이 지도에 실제 노선망이 있는지 }
export function createRealOverlay({ map, ui, notice }) {
  const button = document.getElementById('real-button');
  const available = presetOf(getRegion().id) !== null;
  let preset = null; // 받은 실제 노선망 (게임 저장 모양)
  let drawnYear = null; // 마지막으로 그린 해 (꺼져 있으면 null)

  function draw() {
    const { year } = getState();
    if (!ui.real || !preset) {
      if (drawnYear !== null) showReal(map);
      drawnYear = null;
      return;
    }
    if (drawnYear === year) return;
    drawnYear = year;
    showReal(map, networkAtYear(preset, year).network);
  }

  async function toggle() {
    if (!available) return;
    ui.real = !ui.real;
    update();
    if (ui.real && !preset) {
      try {
        preset = await loadPreset(getRegion().id);
      } catch (error) {
        ui.real = false;
        update();
        notice(`실제 노선망 자료를 받지 못했어요: ${error.message}`, 'bad');
        return;
      }
    }
    draw();
    if (ui.real) notice(`${getState().year}년까지 개통한 실제 노선망(대략)을 회색으로 겹쳤어요`);
  }

  function update() {
    button.classList.toggle('active', Boolean(ui.real));
    button.setAttribute('aria-pressed', String(Boolean(ui.real)));
    draw();
  }

  button.addEventListener('click', toggle);
  return { toggle, update, available };
}
