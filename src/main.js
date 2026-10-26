// 시작점: 저장된 게임 불러오기 → 지도 만들기 → 지도가 준비되면 게임 화면 시작
import './style.css';
import { REGION_NAME, START_YEAR, START_MONTH } from './config.js';
import { createMap } from './map/createMap.js';
import { loadFromBrowser } from './game/save.js';
import { renderBadge } from './ui/badge.js';
import { startApp } from './ui/app.js';

renderBadge(document.getElementById('badge'), {
  year: START_YEAR,
  month: START_MONTH,
  region: REGION_NAME,
});

// 브라우저에 저장해 둔 게임이 있으면 이어서 한다
// 저장 내용이 망가졌으면 새 게임으로 시작하고, 지도가 뜬 뒤에 이유를 알려준다
let loadMessage = null;
try {
  if (loadFromBrowser()) loadMessage = { text: '저장된 게임을 이어서 해요', tone: 'info' };
} catch (error) {
  loadMessage = { text: `저장된 게임을 읽지 못해 새로 시작해요: ${error.message}`, tone: 'bad' };
}

const map = await createMap('map');

// 지도가 다 준비된 뒤에 도구와 패널을 연결한다 (그 전에 누르면 그릴 곳이 없다)
map.on('load', () => startApp(map, loadMessage));
