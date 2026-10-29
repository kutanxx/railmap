// 위쪽 [목표 n/10]: 누르면 게임 목표 목록이 아래로 펼쳐진다 (이룬 것 ✓, 다음 목표는 진하게, 지금 값과 함께).
// 목표를 이루면 자금 숫자 옆에 "목표 달성" 말풍선을 띄운다. 샌드박스면 버튼을 숨긴다.
import { goalList, checkGoals } from '../game/goals.js';
import { isSandbox } from '../game/region.js';
import { showMoneyCallout } from './callouts.js';
import { createPopover } from './popovers.js';
import { formatMoney, formatPopulation } from './format.js';
import { intercityStations } from '../game/intercity.js';

// 목표를 사람 말로
function goalText({ goal, target }) {
  if (goal.kind === 'routes') return target === 1 ? '첫 노선 개통' : `노선 ${target}개`;
  if (goal.kind === 'stations') return `역 ${target}개`;
  if (goal.kind === 'transfers') return target === 1 ? '첫 환승역' : `환승역 ${target}곳`;
  // 딱 떨어지는 만 단위는 "1만 명"처럼 (formatPopulation은 "1.0만 명")
  if (goal.kind === 'riders') {
    return `하루 승객 ${target % 10000 === 0 ? `${target / 10000}만 명` : formatPopulation(target)}`;
  }
  if (goal.kind === 'net') return target === 0 ? '월 수지 흑자' : `월 수지 +${formatMoney(target)}`;
  if (goal.kind === 'money') return `자금 ${formatMoney(target)}`;
  if (goal.kind === 'hubs') {
    // 지도마다 고속철도역·공항역 중 있는 것으로 부른다 (인천은 공항역)
    const kind = [...new Set(intercityStations().map((hub) => hub.label))].join('·');
    return target === 1 ? `${kind}역과 노선 잇기` : `${kind}역 ${target}곳과 잇기`;
  }
  if (goal.kind === 'express') return target === 1 ? '첫 광역급행 노선' : `광역급행 노선 ${target}개`;
  return '';
}

// 지금 값을 사람 말로
function progressText({ goal, current }) {
  if (goal.kind === 'riders') return `지금 ${formatPopulation(current)}`;
  if (goal.kind === 'net' || goal.kind === 'money') return `지금 ${formatMoney(current)}`;
  return `지금 ${current}`;
}

// button: [목표] 버튼, panel: 목록을 넣을 펼침 판. 결과: { update } — 상태가 바뀔 때마다 부른다
export function createGoalsPanel(button, panel) {
  createPopover(button, panel);
  const group = button.closest('.pop-anchor');
  // 목록 아래 안내: 언제 확인하는지 (지금 값이 넘어도 정산 전에는 보상이 없어서 헷갈리지 않게)
  const hint = document.createElement('p');
  hint.className = 'goals-hint';
  hint.textContent = '목표는 매달 정산할 때 위에서부터 차례로 확인해요.';

  function update() {
    // 새로 이룬 목표: 말풍선 + 보상 (한꺼번에 여럿이면 말풍선 하나로 묶는다)
    const reached = checkGoals();
    if (reached.length > 0) {
      const reward = reached.reduce((sum, item) => sum + item.goal.reward, 0);
      const names = reached.length === 1 ? goalText(reached[0]) : `${goalText(reached[0])} 외 ${reached.length - 1}개`;
      showMoneyCallout(`목표 달성: ${names} · 보상 +${formatMoney(reward)}`);
    }
    const items = goalList();
    group.hidden = isSandbox() || items.length === 0;
    if (group.hidden) return;
    const doneCount = items.filter((item) => item.done).length;
    button.textContent = `목표 ${doneCount}/${items.length}`;
    const next = items.find((item) => !item.done);
    panel.replaceChildren(
      ...items.map((item) => {
        const row = document.createElement('div');
        row.className = `goal-item${item.done ? ' goal-done' : ''}${item === next ? ' goal-next' : ''}`;
        const mark = document.createElement('span');
        mark.className = 'goal-mark';
        mark.textContent = item.done ? '✓' : '';
        const text = document.createElement('span');
        text.className = 'goal-text';
        text.textContent = goalText(item);
        const detail = document.createElement('small');
        detail.textContent = item.done
          ? `보상 ${formatMoney(item.goal.reward)} 받음`
          : `${progressText(item)} · 보상 ${formatMoney(item.goal.reward)}`;
        text.append(detail);
        row.append(mark, text);
        return row;
      }),
      hint,
    );
  }

  return { update };
}
