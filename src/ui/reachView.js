// 30분 지도 켜고 끄기와 그리기 (역 카드의 [30분 지도]).
// 켜 두면 고른 역마다 그 역에서 10·20·30분 안에 갈 수 있는 곳을 지도에 칠한다 (game/reach.js, map/reachLayers.js).
// 역을 고르지 않았으면 지운다. 철도망이 바뀌면 다시 계산한다 (같은 역·같은 철도망이면 계산해 둔 것을 쓴다)
import { subscribe } from '../game/state.js';
import { reachFrom } from '../game/reach.js';
import { showReach } from '../map/reachLayers.js';

// ui.reach: 켜졌는지 (app.js의 화면 상태)
export function createReachView({ map, ui }) {
  let cache = null; // { stationId, result } 마지막으로 그린 것
  let drawn = false;
  subscribe((state, kind) => {
    if (kind === 'network') cache = null;
  });

  // 다시 그릴 때마다 부른다 (app.js의 render). 결과: 역 카드에 보일 것 { arrivals } 또는 null (꺼짐)
  function update() {
    const stationId = ui.reach && ui.selected?.type === 'station' ? ui.selected.id : null;
    if (!stationId) {
      if (drawn) showReach(map);
      drawn = false;
      cache = null;
      return null;
    }
    if (cache?.stationId !== stationId) {
      cache = { stationId, result: reachFrom(stationId) };
      showReach(map, cache.result.bands);
      drawn = true;
    }
    return { arrivals: cache.result.arrivals };
  }

  const toggle = () => {
    ui.reach = !ui.reach;
  };

  return { update, toggle };
}
