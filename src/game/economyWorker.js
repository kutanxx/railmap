// 승객·수입 계산 일꾼 (웹 워커): 화면과 따로 돌아서, 역이 많은 노선망을 고쳐도 열차가 멈추지 않는다.
// economyJob.js가 철도망을 보내면 demand.js의 updateEconomy로 계산해 결과(getEconomy)를 돌려보낸다.
// 계산은 화면에서 하던 것과 같은 코드라 결과도 같다.
import { setRegion, setSandbox } from './region.js';
import { setTerrain } from './terrain.js';
import { restoreNetwork } from './state.js';
import { updateEconomy, getEconomy } from './demand.js';

// 역 id → 역 주변 건물 칸 (크다: 서울 실제 노선망은 6만 칸. 한 번 받으면 기억하고, 바뀐 역 것만 다시 받는다)
const cellsOf = new Map();

self.onmessage = ({ data }) => {
  // 게임을 시작할 때 한 번: 지도, 샌드박스인지, 땅 높이 격자 (가상 지도만)
  if (data.type === 'start') {
    setRegion(data.region);
    setSandbox(data.sandbox);
    setTerrain(data.terrain);
    cellsOf.clear();
    return;
  }
  // 철도망이 바뀔 때마다: 새로 받은 건물 칸을 기억하고, 칸이 있는 역(hasCells)에 붙여 계산한다
  for (const [id, cells] of data.newCells) cellsOf.set(id, cells);
  const stations = data.stations.map(({ hasCells, ...station }) =>
    hasCells ? { ...station, cells: cellsOf.get(station.id) } : station,
  );
  restoreNetwork({ stations, tracks: data.tracks, routes: data.routes });
  updateEconomy();
  self.postMessage({ economy: getEconomy() });
};
