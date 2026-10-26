// 저장과 불러오기.
// - 자동 저장: 상태가 바뀌면 잠깐 기다렸다가 브라우저 저장 공간(localStorage)에 저장한다
// - 내보내기: 저장 내용을 JSON 파일로 받는다
// - 불러오기: JSON 파일을 읽어 그 상태로 바꾼다
import { saveData, loadData, subscribe } from './state.js';

const STORAGE_KEY = 'railmap-save';
const AUTOSAVE_DELAY_MS = 1000; // 바뀐 뒤 이만큼 조용하면 저장한다 (연달아 바뀔 때 매번 저장하지 않게)

// 브라우저에 저장해 둔 게임이 있으면 불러온다. 불러왔으면 true
// 저장 내용이 망가졌으면 이유를 담은 에러를 던진다
export function loadFromBrowser() {
  const text = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData()));
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

// 지금 게임을 JSON 파일로 내려받는다. 파일 이름에 게임 날짜를 넣는다
export function exportToFile() {
  const data = saveData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `railmap-${data.year}-${String(data.month).padStart(2, '0')}.json`;
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
