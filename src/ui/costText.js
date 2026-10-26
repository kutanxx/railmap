// 공사비 안내 글: 빚 한도까지 써도 모자라는지, 빚을 내서 짓는지.
import { DEBT_LIMIT } from '../config.js';
import { getState } from '../game/state.js';
import { formatMoney } from './format.js';

// 빚 한도까지 써도 공사비가 모자라면 모자란 금액을 알려주는 글, 아니면 null
export function shortfall(cost) {
  const room = getState().money - DEBT_LIMIT; // 빚 한도까지 쓸 수 있는 돈
  return cost > room
    ? `빚 한도(${formatMoney(DEBT_LIMIT)})까지 ${formatMoney(cost - room)} 모자라요`
    : null;
}

// 마우스 옆 공사비 안내에 붙일 말: 못 지으면 붉게, 빚을 내서 지으면 주황으로, 아니면 null
export function costNote(cost) {
  const problem = shortfall(cost);
  if (problem) return { text: problem, tone: 'bad' };
  const borrowed = cost - Math.max(getState().money, 0);
  if (borrowed > 0) return { text: `빚 ${formatMoney(borrowed)}으로 지어요`, tone: 'warn' };
  return null;
}
