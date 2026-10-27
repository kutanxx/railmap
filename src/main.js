// 시작점: 시작 화면에서 지도 고르기 → 그 지도의 저장된 게임 불러오기 → 지도 만들기 → 게임 화면 시작
import './style.css';
import { START_YEAR, START_MONTH } from './config.js';
import { setRegion, getRegion, setSandbox, isSandbox } from './game/region.js';
import { createMap } from './map/createMap.js';
import { useVirtualMap } from './map/mapFeatures.js';
import { setTerrain } from './game/terrain.js';
import { loadFromBrowser, resetGame } from './game/save.js';
import { renderBadge } from './ui/badge.js';
import { chooseRegion } from './ui/startScreen.js';
import { startApp } from './ui/app.js';

const choice = await chooseRegion(document.getElementById('start'));
setRegion(choice.id);
setSandbox(choice.sandbox);
const region = getRegion();

renderBadge(document.getElementById('badge'), {
  year: START_YEAR,
  month: START_MONTH,
  region: region.name,
  sandbox: isSandbox(),
});

// 가상 지도는 GeoJSON 자료와 땅 높이 격자를 읽어 둔다 (실제 지도를 고르면 받지 않는다)
let virtualData = null;
if (region.id === 'sollae') {
  virtualData = (await import('./data/sollae.json')).default;
  useVirtualMap(virtualData);
  setTerrain((await import('./data/sollae-height.json')).default);
}

// 브라우저에 저장해 둔 이 지도의 게임이 있으면 이어서 한다
// 저장 내용이 망가졌으면 새 게임으로 시작하고, 지도가 뜬 뒤에 이유를 알려준다
// 이어 할 게임이 없으면 이 지도의 시작 자금으로 새 게임을 차린다
let loadMessage = null;
try {
  if (loadFromBrowser()) loadMessage = { text: '저장된 게임을 이어서 해요', tone: 'info' };
  else resetGame();
} catch (error) {
  resetGame();
  loadMessage = { text: `저장된 게임을 읽지 못해 새로 시작해요: ${error.message}`, tone: 'bad' };
}

const map = await createMap('map', region, virtualData);

// 지도가 다 준비된 뒤에 도구와 패널을 연결한다 (그 전에 누르면 그릴 곳이 없다)
map.on('load', () => startApp(map, loadMessage));
