// 지도 위 경고 말풍선: 노선 혼잡, 빚 한도.
// 상태가 바뀔 때마다 불러서, 새로 생긴 일만 한 번씩 알린다 (같은 경고를 계속 띄우지 않게).
import { DEBT_LIMIT, BANKRUPT_GRACE_MONTHS } from '../config.js';
import { getState, findStation } from '../game/state.js';
import { getEconomy } from '../game/demand.js';
import { showCallout } from './callouts.js';
import { formatMoney } from './format.js';

// notice(글, 'info' | 'bad'): 화면 가운데 말풍선
export function createWarnings(map, notice) {
  // 노선이 새로 혼잡해지면 (혼잡도 100% 넘음) 그 노선 가운데 역 위에 말풍선을 띄운다
  // 이미 혼잡한 노선은 다시 알리지 않는다. silent: 처음 불러올 때는 알리지 않고 기억만 한다
  let crowdedRoutes = new Set();
  function crowding({ silent = false } = {}) {
    const { routeLoad } = getEconomy();
    const now = new Set(getState().routes.filter((r) => routeLoad.get(r.id) > 1).map((r) => r.id));
    if (!silent) {
      for (const route of getState().routes) {
        if (!now.has(route.id) || crowdedRoutes.has(route.id)) continue;
        const middle = route.stations[Math.floor(route.stations.length / 2)];
        showCallout(map, findStation(middle).coord, `${route.name} 혼잡 — 열차가 더 필요해요`, 'bad');
      }
    }
    crowdedRoutes = now;
  }

  // 빚 경고: 한도를 처음 넘은 달, 그 뒤 매달 남은 달, 한도 안으로 돌아온 달에 말풍선을 띄운다
  let lastDebtMonths = getState().monthsOverDebtLimit;
  function debt() {
    const { monthsOverDebtLimit: months, bankrupt } = getState();
    if (months === lastDebtMonths || bankrupt) {
      lastDebtMonths = months;
      return;
    }
    if (months === 1) {
      notice(
        `빚이 한도(${formatMoney(DEBT_LIMIT)})를 넘었어요. ${BANKRUPT_GRACE_MONTHS}개월 안에 갚지 못하면 파산해요`,
        'bad',
      );
    } else if (months > 1) {
      notice(`파산까지 ${BANKRUPT_GRACE_MONTHS - months}개월 남았어요`, 'bad');
    } else {
      notice('빚이 한도 안으로 돌아왔어요');
    }
    lastDebtMonths = months;
  }

  return { crowding, debt };
}
