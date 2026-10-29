// 게임 목표: config.js의 GOALS를 위에서부터 차례로. 이룬 목표는 상태(state.achievedGoals)에 이름(goalKey: "routes:3")으로 남고 저장된다.
// (목록 사이에 목표를 더해도 이미 이룬 목표가 바뀌지 않게 순서 번호가 아니라 이름으로 적는다)
// 이루면 보상(억)을 자금에 더한다. 샌드박스에는 목표가 없다.
// 목표는 매달 정산할 때만, 위에서부터 차례로 확인한다 (아직 못 이룬 첫 목표에서 멈춘다).
// 다만 이미 이룬 가장 뒤 목표보다 앞에 있는 못 이룬 목표(나중에 목록 사이에 끼운 목표)는 멈추게 하지 않는다:
// 이루면 보상하고, 못 이뤄도 그 뒤 목표를 계속 확인한다 (예전 저장 파일이 새로 끼운 목표에 막히지 않게).
// 멈춘 채 짓고 보상을 받은 뒤 되돌려 공사비를 돌려받는 일을 막으려고: 정산이 지나면 그 공사는 되돌려도 돈이 안 돌아온다.
// 게임 규칙만 담고 화면은 부르지 않는다 (말풍선과 목록은 ui/goalsPanel.js).
import { GOALS } from '../config.js';
import { getState, notify } from './state.js';
import { getRegion, isSandbox } from './region.js';
import { getEconomy } from './demand.js';
import { isExpress } from './routeKinds.js';

// 목표 하나의 지금 값 (목표와 같은 단위)
function currentValue(goal) {
  const state = getState();
  const economy = getEconomy();
  if (goal.kind === 'routes') return state.routes.length;
  if (goal.kind === 'stations') return state.stations.length;
  if (goal.kind === 'transfers') {
    // 역마다 지나는 노선의 "역 묶음"이 몇 가지인지: 노선을 복제한 것(같은 역들)은 한 노선으로 친다
    const shapes = new Map();
    for (const route of state.routes) {
      const shape = [...new Set(route.stations)].sort().join(',');
      for (const id of new Set(route.stations)) {
        if (!shapes.has(id)) shapes.set(id, new Set());
        shapes.get(id).add(shape);
      }
    }
    return [...shapes.values()].filter((set) => set.size >= 2).length;
  }
  if (goal.kind === 'hubs') {
    // 노선이 서는 역과 이어진 고속철도역(공항역) 수 (역만 지어 두고 노선이 없으면 세지 않는다)
    const served = new Set(state.routes.flatMap((route) => route.stations));
    let count = 0;
    for (const [id, hubs] of economy.stationIntercity) if (served.has(id)) count += hubs.length;
    return count;
  }
  if (goal.kind === 'express') return state.routes.filter(isExpress).length;
  if (goal.kind === 'riders') return economy.dailyRiders;
  if (goal.kind === 'net') return economy.net;
  if (goal.kind === 'money') return state.money;
  return 0;
}

// 지도에 맞춘 목표 값 (하루 승객 목표는 지도마다 줄인다)
const targetOf = (goal) => (goal.kind === 'riders' ? goal.value * (getRegion().riderGoalScale ?? 1) : goal.value);

// 목표의 이름: 종류와 값 ("routes:3"). 저장 파일에 이룬 목표를 이 이름으로 적는다
export const goalKey = (goal) => `${goal.kind}:${goal.value}`;

// 예전 저장 파일은 이룬 목표를 순서 번호로 적었다. 그때(2026-10-28 전)의 목표 순서로 이름을 찾는다
const LEGACY_GOAL_KEYS = [
  'routes:1', 'riders:20000', 'transfers:1', 'net:10', 'routes:3',
  'riders:50000', 'stations:20', 'riders:100000', 'net:50', 'riders:300000',
];
// 저장 파일의 이룬 목표 목록을 이름 목록으로 (번호면 예전 순서로 바꾼다)
export function achievedGoalKeys(list) {
  return list.map((entry) => (typeof entry === 'number' ? LEGACY_GOAL_KEYS[entry] : entry)).filter(Boolean);
}

// 목표 목록: [{ index, goal, target, current, done }]. 샌드박스면 빈 목록
export function goalList() {
  if (isSandbox()) return [];
  const done = new Set(getState().achievedGoals);
  return GOALS.map((goal, index) => ({
    index,
    goal,
    target: targetOf(goal),
    current: currentValue(goal),
    done: done.has(goalKey(goal)),
  }));
}

// 마지막으로 목표를 확인한 정산 (state.settledMonths). 처음 부르면 지금 값으로 맞추고 다음 정산부터 확인한다
let checkedAt = null;

// 새로 이룬 목표를 찾아 기록하고 보상을 준다. 결과: 이번에 이룬 목표들 (goalList의 항목)
// 상태가 바뀔 때마다 (수요를 다시 계산한 뒤에) 부르지만, 새 정산이 있었을 때만 확인한다
export function checkGoals() {
  const state = getState();
  if (checkedAt === state.settledMonths) return [];
  const first = checkedAt === null;
  checkedAt = state.settledMonths;
  if (first || isSandbox() || state.bankrupt) return [];
  // 위에서부터 차례로: 아직 못 이룬 목표를 만나면 멈춘다 (이미 이룬 가장 뒤 목표보다 앞의 것은 건너뛰고 계속)
  const list = goalList();
  const lastDone = list.reduce((last, item, i) => (item.done ? i : last), -1);
  const reached = [];
  for (const [i, item] of list.entries()) {
    if (item.done) continue;
    const met = item.goal.kind === 'net' ? item.current > item.target : item.current >= item.target;
    if (met) reached.push(item);
    else if (i > lastDone) break;
  }
  if (reached.length === 0) return [];
  for (const item of reached) {
    state.achievedGoals.push(goalKey(item.goal));
    state.money += item.goal.reward;
  }
  notify('time');
  return reached;
}
