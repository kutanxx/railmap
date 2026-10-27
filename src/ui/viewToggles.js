// 왼쪽 아래 켜고 끄는 버튼들: [혼잡도] (C 키), [지형] (T 키, 땅 높이가 있는 가상 지도만),
// [소리 ▴]를 누르면 펼쳐지는 [소리 켬] (M 키) · 음량 막대 · [음악 켬].
// 혼잡도·지형은 화면 상태(ui.congestion, ui.terrain)를 바꾸고 다시 그린다. 소리·음악은 sounds.js·music.js가 스스로 기억한다.
import { hasTerrain } from '../game/terrain.js';
import { setContoursVisible } from '../map/contours.js';
import { createCongestionToggle } from './congestionToggle.js';
import { createTerrainToggle } from './terrainToggle.js';
import { getEconomy } from '../game/demand.js';
import { createSoundToggle } from './sounds.js';
import { createMusicToggle } from './music.js';
import { createPopover } from './popovers.js';

// ui: app.js의 화면 상태, render: 화면 다시 그리기
// 결과: { toggleCongestion, toggleTerrain, toggleSound (단축키용), show: 버튼 모양을 화면 상태에 맞추기 }
export function createViewToggles({ map, ui, render }) {
  const toggleCongestion = () => {
    ui.congestion = !ui.congestion;
    render();
  };
  const congestion = createCongestionToggle(document.getElementById('congestion'), toggleCongestion);

  // 땅 높이가 없는 지도(서울)에서는 [지형] 버튼을 숨기고, T 키를 눌러도 아무것도 하지 않는다
  const toggleTerrain = () => {
    if (!hasTerrain()) return;
    ui.terrain = !ui.terrain;
    setContoursVisible(map, ui.terrain);
    render();
  };
  const terrainElement = document.getElementById('terrain');
  terrainElement.hidden = !hasTerrain();
  const terrain = createTerrainToggle(terrainElement, toggleTerrain);

  // [소리 ▴]: 소리를 끄면 글자도 "소리 끔 ▴"으로 바뀐다 (색만으로 알리지 않게)
  const soundOpen = document.getElementById('sound-open');
  createPopover(soundOpen, soundOpen.nextElementSibling);
  const sound = createSoundToggle(
    document.getElementById('sound-button'),
    document.getElementById('volume-slider'),
    (muted) => {
      soundOpen.textContent = muted ? '소리 끔 ▴' : '소리 ▴';
    },
  );
  createMusicToggle(document.getElementById('music-button'));

  return {
    toggleCongestion,
    toggleTerrain,
    toggleSound: sound.toggle,
    show() {
      const over = [...getEconomy().trackLoad.values()].filter((load) => load > 1).length;
      congestion.setActive(ui.congestion, over);
      terrain.setActive(ui.terrain);
    },
  };
}
