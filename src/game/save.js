// 저장과 불러오기.
// - 자동 저장: 상태가 바뀌면 잠깐 기다렸다가 브라우저 저장 공간(localStorage)에 저장한다
// - 내보내기: 저장 내용을 JSON 파일로 받는다
// - 불러오기: JSON 파일을 읽어 그 상태로 바꾼다
// 지도(지역)마다 저장 칸이 따로 있고, 저장 파일에도 어느 지도인지 적어 둔다
import { START_YEAR, START_MONTH } from '../config.js';
import { REGIONS } from '../regions.js';
import { getRegion, isSandbox } from './region.js';
import {
  getState,
  subscribe,
  notify,
  snapshotNetwork,
  restoreNetwork,
  clearHistory,
} from './state.js';

const state = getState();

const SAVE_VERSION = 1;

// 저장할 내용 (열차 위치는 저장하지 않고, 불러올 때 노선에 맞춰 새로 놓는다)
export function saveData() {
  return {
    version: SAVE_VERSION,
    region: getRegion().id,
    network: snapshotNetwork(),
    speed: state.speed,
    elapsedSeconds: state.elapsedSeconds,
    year: state.year,
    month: state.month,
    monthProgress: state.monthProgress,
    lastSettlement: state.lastSettlement,
    monthsOverDebtLimit: state.monthsOverDebtLimit,
    bankrupt: state.bankrupt,
    achievedGoals: state.achievedGoals,
  };
}

// 저장한 내용을 불러온다. 형식이 맞지 않으면 이유를 담은 에러를 던진다
export function loadData(data) {
  const network = data?.network;
  if (data?.version !== SAVE_VERSION || !network) {
    throw new Error('레일맵 저장 파일이 아니거나, 지원하지 않는 버전이에요.');
  }
  for (const key of ['stations', 'tracks', 'routes']) {
    if (!Array.isArray(network[key])) throw new Error(`저장 파일에 ${key} 목록이 없어요.`);
  }
  // 다른 지도의 게임은 불러오지 않는다 (지도 이름이 없는 예전 파일은 서울 게임이다)
  const region = data.region ?? 'seoul';
  if (region !== getRegion().id) {
    const name = REGIONS[region]?.name ?? region;
    throw new Error(`${name} 지도의 저장 파일이에요. 시작 화면에서 ${name} 지도를 골라 불러오세요.`);
  }
  restoreNetwork(network);
  state.money = network.money;
  state.trains = [];
  state.speed = data.speed;
  state.elapsedSeconds = data.elapsedSeconds;
  state.year = data.year;
  state.month = data.month;
  state.monthProgress = data.monthProgress;
  state.lastSettlement = data.lastSettlement;
  // 빚·파산 기록이 없는 예전 저장 파일은 빚이 없던 것으로 친다
  state.monthsOverDebtLimit = data.monthsOverDebtLimit ?? 0;
  state.bankrupt = data.bankrupt ?? false;
  // 목표 기록이 없는 예전 저장 파일은 아직 아무 목표도 이루지 않은 것으로 친다 (지금 상태로 다시 확인된다)
  state.achievedGoals = Array.isArray(data.achievedGoals) ? [...data.achievedGoals] : [];
  clearHistory();
  notify();
}

// 처음 상태로 돌아간다
export function resetGame() {
  restoreNetwork({
    stations: [],
    tracks: [],
    routes: [],
    nextStationNumber: 1,
    nextTrackNumber: 1,
    nextRouteNumber: 1,
  });
  state.trains = [];
  state.money = getRegion().startMoney;
  state.speed = 1;
  state.elapsedSeconds = 0;
  state.year = START_YEAR;
  state.month = START_MONTH;
  state.monthProgress = 0;
  state.lastSettlement = null;
  state.monthsOverDebtLimit = 0;
  state.bankrupt = false;
  state.achievedGoals = [];
  clearHistory();
  notify();
}

const AUTOSAVE_DELAY_MS = 1000; // 바뀐 뒤 이만큼 조용하면 저장한다 (연달아 바뀔 때 매번 저장하지 않게)

// 지도마다 브라우저 저장 칸 이름 (서울은 예전부터 쓰던 이름 그대로). 샌드박스는 칸이 따로다
const storageKey = (regionId, sandbox = isSandbox()) =>
  `${regionId === 'seoul' ? 'railmap-save' : `railmap-save-${regionId}`}${sandbox ? '-sandbox' : ''}`;

// 시작 화면에 보여줄 그 지도의 저장 상태: 저장이 없으면 null, 있으면 { year, month, routeCount }, 읽을 수 없으면 { broken: true }
// sandbox: 샌드박스 저장 칸을 볼지
export function savedGameInfo(regionId, sandbox = false) {
  const text = localStorage.getItem(storageKey(regionId, sandbox));
  if (text === null) return null;
  try {
    const { year, month, network } = JSON.parse(text);
    return { year, month, routeCount: network?.routes?.length ?? 0 };
  } catch {
    // 망가진 저장은 이 지도를 고르면 새 게임으로 시작하면서 이유를 알려준다 (main.js)
    return { broken: true };
  }
}

// 브라우저에 저장해 둔 게임이 있으면 불러온다. 불러왔으면 true
// 저장 내용이 망가졌으면 이유를 담은 에러를 던진다
export function loadFromBrowser() {
  const text = localStorage.getItem(storageKey(getRegion().id));
  if (text === null) return false;
  loadData(JSON.parse(text));
  return true;
}

// 자동 저장을 켠다. 저장에 실패하면 (예: 저장 공간이 꽉 참) onError(이유)를 부른다
export function startAutosave(onError) {
  let timer = null;

  const saveNow = () => {
    clearTimeout(timer);
    timer = null;
    try {
      localStorage.setItem(storageKey(getRegion().id), JSON.stringify(saveData()));
    } catch (error) {
      // 브라우저가 저장을 막으면 게임은 계속하되, 저장이 안 된다는 걸 화면에 알린다
      onError(`자동 저장에 실패했어요: ${error.message}`);
    }
  };

  subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(saveNow, AUTOSAVE_DELAY_MS);
  });
  // 탭을 닫거나 다른 탭으로 갈 때는 기다리지 않고 바로 저장한다 (흐른 시간까지 담기게)
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveNow();
  });
}

// 지금 게임을 JSON 파일로 내려받는다. 파일 이름에 지도와 게임 날짜를 넣는다
export function exportToFile() {
  const data = saveData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `railmap-${data.region}-${data.year}-${String(data.month).padStart(2, '0')}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 고른 JSON 파일을 읽어 불러온다. 형식이 틀리면 이유를 담은 에러를 던진다
export async function importFromFile(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON 파일이 아니에요. [내보내기]로 받은 파일을 골라주세요.');
  }
  loadData(data);
}
