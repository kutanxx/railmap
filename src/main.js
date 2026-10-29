// 시작점: 시작 화면에서 지도 고르기 → 그 지도의 저장된 게임 불러오기 → 지도 만들기 → 게임 화면 시작
// 화면 글꼴 Pretendard (SIL 오픈 폰트 라이선스): 화면에 나온 글자가 든 조각만 그때그때 받는다 ("나눠 받기")
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './style.css';
import { START_YEAR, START_MONTH } from './config.js';
import { setRegion, getRegion, setSandbox, isSandbox } from './game/region.js';
import { createMap } from './map/createMap.js';
import { useVirtualMap } from './map/mapFeatures.js';
import { setTerrain } from './game/terrain.js';
import { loadFromBrowser, resetGame, writeSandboxSave } from './game/save.js';
import { readSharedLink } from './game/share.js';
import { measureStations } from './map/buildingTiles.js';
import { loadPreset, presetOf } from './game/presets.js';
import { renderBadge } from './ui/badge.js';
import { chooseRegion, showMapLoading } from './ui/startScreen.js';
import { startApp } from './ui/app.js';

// 공유 링크(…/#share=…)로 들어왔으면 시작 화면 맨 위에 "공유받은 노선망" 칸을 띄운다 (game/share.js)
// 링크가 잘렸거나 망가졌으면 그 칸에 이유를 보여준다
const link = {};
try {
  link.shared = await readSharedLink();
} catch (error) {
  link.problem = error.message;
}
const choice = await chooseRegion(document.getElementById('start'), link);
setRegion(choice.id);
setSandbox(choice.sandbox);
const region = getRegion();

renderBadge(document.getElementById('badge'), {
  year: START_YEAR,
  month: START_MONTH,
  region: region.name,
  sandbox: isSandbox(),
});

// 지도가 뜰 때까지 "불러오는 중" 표시 (실제 노선망·가상 지도 자료를 받는 동안에도)
const loading = showMapLoading(region.name);

// [실제 노선망으로 시작]을 골랐으면 실제 노선을 깐 저장(game/presets.js)을 받아 그 지도의 샌드박스 저장 칸에 넣는다
// 받지 못하면 (인터넷이 끊김) 하던 샌드박스나 새 게임으로 열고, 지도가 뜬 뒤에 이유를 알려준다
let presetProblem = null;
if (choice.preset) {
  try {
    writeSandboxSave(await loadPreset(region.id));
  } catch (error) {
    presetProblem = error.message;
  }
}

// 가상 지도는 GeoJSON 자료와 땅 높이 격자를 읽어 둔다 (실제 지도를 고르면 받지 않는다)
let virtualData = null;
if (region.id === 'sollae') {
  virtualData = (await import('./data/sollae.json')).default;
  useVirtualMap(virtualData);
  setTerrain((await import('./data/sollae-height.json')).default);
}

// 공유받은 노선망을 열면 그 지도의 샌드박스 저장 칸에 넣고, 아래에서 그 저장을 불러온다.
// 링크에는 역 주변 건물 칸이 없어서 지도 조각으로 다시 잰다 (가까운 역끼리 사람을 나누는 계산이 보낸 사람과 같아지게,
// map/buildingTiles.js). 재지 못하면 (인터넷이 끊김) 링크에 적힌 역 인구를 그대로 쓰고, 지도가 뜬 뒤에 알려준다
let sharedProblem = null;
if (choice.shared) {
  let shared = choice.shared;
  try {
    const stations = await measureStations(shared.network.stations, (percent) =>
      loading.note(`공유받은 노선망의 역 주변 건물을 재는 중 ${percent}%`),
    );
    shared = { ...shared, network: { ...shared.network, stations } };
  } catch (error) {
    sharedProblem = error.message;
  }
  writeSandboxSave(shared);
}

// 브라우저에 저장해 둔 이 지도의 게임이 있으면 이어서 한다
// 저장 내용이 망가졌으면 새 게임으로 시작하고, 지도가 뜬 뒤에 이유를 알려준다
// 이어 할 게임이 없으면 이 지도의 시작 자금으로 새 게임을 차린다
let loadMessage = null;
try {
  if (loadFromBrowser()) {
    loadMessage = { text: '저장된 게임을 이어서 해요', tone: 'info' };
    if (choice.shared) loadMessage.text = '공유받은 노선망을 샌드박스로 열었어요';
    if (choice.preset && !presetProblem) {
      loadMessage.text = `${region.name} 실제 노선망(${presetOf(region.id).label})을 샌드박스로 열었어요. Space나 위쪽 [1배]를 누르면 열차가 달려요`;
    }
  } else {
    resetGame();
    // 새 게임은 멈춘 채 시작한다고 알려준다 (튜토리얼이 뜨는 처음 온 사람에게는 튜토리얼이 대신 안내한다, app.js)
    loadMessage = { text: '시간이 멈춘 채 시작해요. 준비되면 Space나 위쪽 [1배]를 누르세요', tone: 'info', newGame: true };
  }
} catch (error) {
  resetGame();
  loadMessage = { text: `저장된 게임을 읽지 못해 새로 시작해요: ${error.message}`, tone: 'bad' };
}
if (sharedProblem) {
  loadMessage = { text: `역 주변 건물을 재지 못해 링크에 적힌 역 인구를 그대로 써요 (${sharedProblem})`, tone: 'warn' };
}
if (presetProblem) loadMessage = { text: `실제 노선망을 받지 못했어요: ${presetProblem}. 인터넷 연결을 확인해 주세요`, tone: 'bad' };

// 지도를 못 불러오면 (인터넷이 끊김, 지도 서버 문제) 빈 화면 대신 이유와 [다시 시도]를 보여준다
function showMapError(error) {
  const box = document.getElementById('bankrupt');
  box.innerHTML = `
    <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="map-error-title">
      <div class="dialog-title" id="map-error-title">지도를 불러오지 못했어요</div>
      <p class="dialog-text">인터넷 연결을 확인하고 다시 시도해 주세요. 저장한 게임은 그대로 있어요.</p>
      <p class="dialog-text"><small></small></p>
      <div class="dialog-buttons">
        <button type="button" class="dialog-primary">다시 시도</button>
      </div>
    </div>`;
  box.querySelector('small').textContent = `(${error.message})`;
  box.querySelector('button').addEventListener('click', () => location.reload());
  box.hidden = false;
}

try {
  const map = await createMap('map', region, virtualData);
  // 지도가 다 준비된 뒤에 도구와 패널을 연결한다 (그 전에 누르면 그릴 곳이 없다)
  map.on('load', () => {
    loading.hide();
    startApp(map, loadMessage);
  });
} catch (error) {
  loading.hide();
  showMapError(error);
}
