// 게임 목표: config.js의 GOALS를 위에서부터 차례로. 이룬 목표는 상태(state.achievedGoals)에 번호로 남고 저장된다.
// 이루면 보상(억)을 자금에 더한다. 샌드박스에는 목표가 없다.
// 목표는 매달 정산할 때만, 위에서부터 차례로 확인한다 (아직 못 이룬 첫 목표에서 멈춘다).
// 멈춘 채 짓고 보상을 받은 뒤 되돌려 공사비를 돌려받는 일을 막으려고: 정산이 지나면 그 공사는 되돌려도 돈이 안 돌아온다.
// 게임 규칙만 담고 화면은 부르지 않는다 (말풍선과 목록은 ui/goalsPanel.js).
import { GOALS } from '../config.js';
import { getState, notify } from './state.js';
import { getRegion, isSandbox } from './region.js';
import { getEconomy } from './demand.js';

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
  if (goal.kind === 'riders') return economy.dailyRiders;
  if (goal.kind === 'net') return economy.net;
  if (goal.kind === 'money') return state.money;
  return 0;
}

// 지도에 맞춘 목표 값 (하루 승객 목표는 지도마다 줄인다)
const targetOf = (goal) => (goal.kind === 'riders' ? goal.value * (getRegion().riderGoalScale ?? 1) : goal.value);

// 목표 목록: [{ index, goal, target, current, done }]. 샌드박스면 빈 목록
export function goalList() {
  if (isSandbox()) return [];
  const done = new Set(getState().achievedGoals);
  return GOALS.map((goal, index) => ({
    index,
    goal,
    target: targetOf(goal),
    current: currentValue(goal),
    done: done.has(index),
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
  // 위에서부터 차례로: 아직 못 이룬 목표를 만나면 멈춘다
  const reached = [];
  for (const item of goalList()) {
    if (item.done) continue;
    const met = item.goal.kind === 'net' ? item.current > item.target : item.current >= item.target;
    if (!met) break;
    reached.push(item);
  }
  if (reached.length === 0) return [];
  for (const item of reached) {
    state.achievedGoals.push(item.index);
    state.money += item.goal.reward;
  }
  notify('time');
  return reached;
}
