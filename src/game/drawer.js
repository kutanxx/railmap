// 내 노선망 서랍: 한 지도(일반 게임·샌드박스 따로)에 이름 붙인 노선망을 여러 개 넣어 두고 꺼낸다 ([메뉴] → [서랍], ui/drawerCard.js).
// 넣는 것은 [내보내기] 파일과 같은 게임 저장 모양(save.js의 saveData) 통째로, 작은 그림(노선망 모양 SVG)과 함께.
// 브라우저의 큰 저장 공간(IndexedDB)에 둔다: 자동 저장 칸(localStorage, 5MB쯤)과 따로라 실제 노선망처럼 큰 것도 여러 개 넣을 수 있다.
// 이 브라우저에만 있다 (다른 컴퓨터로 옮기려면 꺼내서 [내보내기])
import { getRegion, isSandbox } from './region.js';

const DB_NAME = 'railmap-drawer';
const STORE = 'networks';

// 서랍 칸 이름: 지도 + 일반 게임/샌드박스 ("seoul", "seoul-sandbox"). 샌드박스 노선망은 샌드박스에서만 꺼낸다
export const drawerSlot = () => `${getRegion().id}${isSandbox() ? '-sandbox' : ''}`;

let opening = null;
function database() {
  opening ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('slot', 'slot');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`서랍을 열지 못했어요: ${request.error?.message ?? '브라우저가 막았어요'}`));
  });
  return opening;
}

// 저장 공간에 묻기 하나 (mode: 'readonly' | 'readwrite', work(store) → IDBRequest). 결과: 그 요청의 결과
async function ask(mode, work) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = work(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`서랍을 쓰지 못했어요: ${request.error?.message ?? ''}`));
  });
}

// 이 칸의 노선망들 (최근 것부터): [{ id, slot, name, savedAt, summary: { stations, routes, year, month }, picture, data }]
export async function drawerEntries(slot = drawerSlot()) {
  const entries = await ask('readonly', (store) => store.index('slot').getAll(slot));
  return entries.sort((a, b) => b.savedAt - a.savedAt);
}

// 넣는다. data: 게임 저장 모양, picture: 작은 그림 (SVG 글). 결과: 넣은 항목
export async function putInDrawer({ name, data, picture, slot = drawerSlot() }) {
  const entry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    slot,
    name,
    savedAt: Date.now(),
    summary: {
      stations: data.network.stations.length,
      routes: data.network.routes.length,
      year: data.year,
      month: data.month,
    },
    picture,
    data,
  };
  await ask('readwrite', (store) => store.put(entry));
  return entry;
}

export const getFromDrawer = (id) => ask('readonly', (store) => store.get(id));

export async function renameInDrawer(id, name) {
  const entry = await getFromDrawer(id);
  await ask('readwrite', (store) => store.put({ ...entry, name }));
}

// 복사본을 넣는다 ("꿈의 서울 (복사)"). 원본은 그대로
export async function copyInDrawer(id) {
  const entry = await getFromDrawer(id);
  return putInDrawer({ name: `${entry.name} (복사)`, data: entry.data, picture: entry.picture, slot: entry.slot });
}

export const removeFromDrawer = (id) => ask('readwrite', (store) => store.delete(id));
