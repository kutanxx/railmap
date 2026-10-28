// 말풍선 알림. 화면 구석 팝업 대신 일이 일어난 자리(지도) 또는 관련 숫자(자금) 옆에 띄운다.
// 예: "1호선 개통", "자금이 12억 모자라요", "파산까지 2개월 남았어요"
// 단계(tone)마다 모양 표시가 달라서 색을 못 봐도 구별된다:
// - 'info'   정보: 노란 점, CALLOUT_SECONDS초
// - 'bad'    안 되는 이유 (방금 누른 것이 안 될 때): 빨간 테두리 + ✕, CALLOUT_SECONDS초
// - 'warn'   주의 (노선 혼잡 등): 주황 테두리 + !, CALLOUT_WARN_SECONDS초
// - 'danger' 위험 (빚 한도, 파산까지 남은 달): 굵은 빨간 테두리 + !, 누를 때까지 남는다
// 'bad'를 뺀 알림은 지난 알림 목록에도 남긴다 (noticeLog.js)
import { Marker } from 'maplibre-gl';
import { CALLOUT_SECONDS, CALLOUT_WARN_SECONDS } from '../config.js';
import { logNotice } from './noticeLog.js';

function createBubble(text, tone) {
  const element = document.createElement('div');
  element.className = `callout callout-${tone}`;
  const bubble = document.createElement('div');
  bubble.className = 'callout-bubble';
  bubble.textContent = text;
  element.append(bubble);
  return element;
}

// 단계에 맞춰 없앤다: 위험은 누를 때까지, 나머지는 몇 초 뒤
function scheduleRemoval(element, tone, remove) {
  if (tone === 'danger') {
    element.classList.add('callout-sticky');
    element.title = '눌러서 닫기';
    element.addEventListener('click', remove);
    return;
  }
  setTimeout(remove, (tone === 'warn' ? CALLOUT_WARN_SECONDS : CALLOUT_SECONDS) * 1000);
}

// 지도 위 coord([경도, 위도]) 자리에 띄운다. log: 지난 알림 목록([알림])에 남길지 (조작 안내 같은 것은 남기지 않는다)
export function showCallout(map, coord, text, tone = 'info', { log = true } = {}) {
  const element = createBubble(text, tone);
  const marker = new Marker({ element, anchor: 'bottom', offset: [0, -14] }).setLngLat(coord).addTo(map);
  scheduleRemoval(element, tone, () => marker.remove());
  if (tone !== 'bad' && log) logNotice({ text, tone, coord });
}

// 위쪽 자금 숫자를 꼬리로 가리키는 말풍선 (빚·정산처럼 지도에 자리가 없는 알림). 새 것이 오면 앞의 것은 닫는다
let moneyCallout = null;
export function showMoneyCallout(text, tone = 'info') {
  moneyCallout?.remove();
  const element = createBubble(text, tone);
  element.classList.add('callout-money');
  const money = document.querySelector('.status-money').getBoundingClientRect();
  element.style.left = `${Math.max(8, money.left + money.width / 2 - 24)}px`;
  element.style.top = `${money.bottom + 14}px`;
  document.body.append(element);
  moneyCallout = element;
  scheduleRemoval(element, tone, () => element.remove());
  if (tone !== 'bad') logNotice({ text, tone, coord: null });
}
