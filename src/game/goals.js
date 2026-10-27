// 게임 목표: config.js의 GOALS를 위에서부터 차례로. 이룬 목표는 상태(state.achievedGoals)에 번호로 남고 저장된다.
// 이루면 보상(억)을 자금에 더한다. 샌드박스에는 목표가 없다.
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
    const count = new Map();
    for (const route of state.routes) {
      for (const id of new Set(route.stations)) count.set(id, (count.get(id) ?? 0) + 1);
    }
    return [...count.values()].filter((n) => n >= 2).length;
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

// 새로 이룬 목표를 찾아 기록하고 보상을 준다. 결과: 이번에 이룬 목표들 (goalList의 항목)
// 상태가 바뀔 때마다 (수요를 다시 계산한 뒤에) 부른다
export function checkGoals() {
  if (isSandbox() || getState().bankrupt) return [];
  const state = getState();
  const reached = goalList().filter(
    (item) => !item.done && (item.goal.kind === 'net' ? item.current > item.target : item.current >= item.target),
  );
  if (reached.length === 0) return [];
  for (const item of reached) {
    state.achievedGoals.push(item.index);
    state.money += item.goal.reward;
  }
  notify();
  return reached;
}
