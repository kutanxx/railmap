// 승객·수입 계산을 화면과 따로 도는 일꾼(웹 워커, economyWorker.js)에게 맡긴다.
// 역이 300곳쯤이면 계산이 0.1초 넘게 걸려서, 화면에서 하면 그동안 열차가 멈췄다.
// 철도망이 바뀔 때마다 requestEconomy(onDone)를 부르면, 다 계산한 뒤 결과를 demand.js에 넣고 onDone()을 부른다
// (그동안 화면은 바로 앞 결과를 보여준다). 계산하는 동안 또 바뀌면, 끝난 뒤 마지막 모양으로 한 번만 더 계산한다.
// 역 주변 건물 칸(cells)은 크니까 새로 생기거나 바뀐 역 것만 보낸다 (되돌리기는 칸을 그대로 둔 채 역을 되살려서 다시 보내지 않는다).
// 일꾼을 만들 수 없는 브라우저이거나 일꾼이 고장 나면 화면에서 바로 계산한다.
import { getState } from './state.js';
import { getRegion, isSandbox } from './region.js';
import { terrainGrid } from './terrain.js';
import { updateEconomy, setEconomy } from './demand.js';

let worker = null;
let busy = false; // 일꾼이 계산하는 중인지
let current = null; // 지금 계산하는 요청의 onDone
let waiting = null; // 계산하는 동안 들어온 마지막 요청의 onDone (중간 요청은 건너뛴다)
const sentCells = new WeakSet(); // 일꾼에게 이미 보낸 건물 칸 배열

// 게임을 시작할 때 한 번 부른다 (지도와 불러온 게임이 정해진 뒤)
export function startEconomyWorker() {
  if (typeof Worker === 'undefined') return;
  worker = new Worker(new URL('./economyWorker.js', import.meta.url), { type: 'module' });
  worker.postMessage({ type: 'start', region: getRegion().id, sandbox: isSandbox(), terrain: terrainGrid() });
  worker.onmessage = ({ data }) => {
    setEconomy(data.economy);
    finish();
  };
  // 일꾼이 고장 나면 이유를 콘솔에 남기고, 그 뒤로는 화면에서 계산한다
  worker.onerror = (event) => {
    console.error('승객 계산 일꾼이 멈췄어요. 화면에서 계산해요:', event.message);
    worker.terminate();
    worker = null;
    updateEconomy();
    finish();
  };
}

// 철도망이 바뀌었으니 다시 계산해 달라고 한다. 다 되면 onDone()
export function requestEconomy(onDone) {
  if (!worker) {
    updateEconomy();
    onDone();
    return;
  }
  if (busy) {
    waiting = onDone;
    return;
  }
  send(onDone);
}

// 지금 철도망을 일꾼에게 보낸다
function send(onDone) {
  busy = true;
  current = onDone;
  const { stations, tracks, routes } = getState();
  const newCells = [];
  const list = stations.map(({ cells, ...station }) => {
    if (!cells) return station;
    if (!sentCells.has(cells)) {
      sentCells.add(cells);
      newCells.push([station.id, cells]);
    }
    return { ...station, hasCells: true };
  });
  worker.postMessage({ type: 'compute', stations: list, newCells, tracks, routes });
}

// 계산이 끝났다: 기다리는 요청이 있으면 마지막 모양으로 한 번 더 보내고, 끝난 요청의 onDone을 부른다
function finish() {
  busy = false;
  const done = current;
  current = null;
  if (waiting) {
    const next = waiting;
    waiting = null;
    if (worker) send(next);
    else {
      updateEconomy();
      next();
    }
  }
  done?.();
}
