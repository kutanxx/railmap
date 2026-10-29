// 조작 안내 카드: 왼쪽 아래 [?] 버튼으로 연다. (처음 온 사람에게는 튜토리얼이 먼저 나온다, tutorial.js)
// 브라우저 alert 대신 화면 안의 카드로 만든다. [알겠어요], 바깥 클릭, Esc로 닫힌다.
// 손가락 화면(휴대폰·태블릿)에서는 키보드로만 되는 줄을 숨기고 버튼 이름으로 바꿔 보여준다.
import { FINGER } from '../map/hitPad.js';

// [키, 하는 일, 손가락 화면에서]
// 세 번째 칸: 없으면 그대로 보여주고, null이면 숨기고(키보드만 되는 일), [이름, 글]이면 그것으로 바꿔 보여준다
const ITEMS = [
  ['1 · 2 · 3 · 4', '선택 · 역 놓기 · 선로 · 노선 도구', null],
  ['Space', '시간 멈춤 / 다시 가기 · 왼쪽 위 날짜 배지를 눌러도 돼요', ['날짜 배지', '왼쪽 위 날짜를 누르면 시간 멈춤 / 다시 가기']],
  ['C', '혼잡도 보기 켜고 끄기 (선로를 여유·붐빔·넘침 색과 굵기로) · 왼쪽 아래 [혼잡도]', ['혼잡도', '왼쪽 아래 [혼잡도]: 선로를 여유·붐빔·넘침 색과 굵기로']],
  ['T', '지형(등고선) 켜고 끄기 · 가상 지도에서만. 산을 뚫으면 터널, 강을 건너면 교량이 돼요', ['지형', '왼쪽 아래 [지형]: 등고선 (가상 지도에서만). 산을 뚫으면 터널, 강을 건너면 교량이 돼요']],
  ['V', '[선로] 도구에서 직선 ↔ 곡선 (경유점을 지나는 부드러운 곡선)', ['곡선', '[선로] 도구 막대 끝 [곡선]: 경유점을 지나는 부드러운 곡선으로']],
  ['P', '[선로] 도구에서 계획 선로로 그리기: 돈 없이 주황 점선으로 그려 두고, 선로를 눌러 [짓기]로 나중에 지어요', ['계획', '[선로] 도구 막대 끝 [계획]: 돈 없이 주황 점선으로 그려 두고, 선로를 눌러 [짓기]로 나중에 지어요']],
  ['/', '역·노선 이름으로 찾기 · [메뉴]의 [역·노선 찾기]', ['찾기', '[메뉴]의 [역·노선 찾기]: 역·노선 이름으로 찾기']],
  ['D', '노선도 보기: 내 노선망을 지하철 노선도처럼 · 왼쪽 아래 [노선도]. 역을 누르면 지도에서 그 역으로 가요', ['노선도', '왼쪽 아래 [노선도]: 내 노선망을 지하철 노선도처럼. 역을 누르면 지도에서 그 역으로 가요']],
  ['H', '버튼·패널 숨기고 지도만 보기 (스크린샷용). H나 Esc로 다시 보여요', null],
  ['N', '관제실 모드 (어두운 지도) 켜고 끄기 · 왼쪽 아래 [관제실]', ['관제실', '왼쪽 아래 [관제실]: 어두운 지도']],
  ['M', '소리 켜고 끄기 · 크기와 배경 음악은 왼쪽 아래 [소리]를 눌러서. 열차 도착 소리는 가까이, 레일 덜컹 소리는 아주 가까이 확대했을 때만 나요', ['소리', '왼쪽 아래 [소리]: 켜고 끄기, 크기, 배경 음악. 열차 도착 소리는 가까이, 레일 덜컹 소리는 아주 가까이 확대했을 때만 나요']],
  ['통계', '위쪽 [통계]: 최근 달들의 자금 · 월 수지 · 하루 승객 그래프. 그래프를 누르거나 마우스를 올리면 그 달 숫자가 나와요'],
  ['메뉴', '왼쪽 아래 [메뉴]: 역·노선 찾기 · 화면 크기 · 내보내기 · 불러오기 · 지도 바꾸기 · 새로 시작'],
  ['Ctrl+Z / Ctrl+Y', '되돌리기 / 다시 하기 (쓴 돈도 돌려받아요)', null],
  ['Esc · 오른쪽 클릭', '그리던 선로·노선 취소, 고른 것 놓기', null],
  ['Backspace', '그리던 선로·노선의 마지막 점 빼기', null],
  ['Enter', '노선 완성', null],
  ['Delete', '고른 역·선로·노선 지우기. 삭제 버튼에 마우스를 올리면 함께 사라질 것이 빨갛게 보여요', null],
  ['↶ ↷', '왼쪽 아래 버튼으로도 되돌리기 · 다시 하기를 할 수 있어요', ['↶ ↷', '왼쪽 아래 버튼: 되돌리기 · 다시 하기 (쓴 돈도 돌려받아요)']],
  ['손가락', '한 손가락으로 지도 끌기, 두 손가락으로 확대·회전. 고른 역·흰 점은 누른 채 움직여 옮기고, 흰 점을 빠르게 두 번 누르면 지워요. 선로를 그리는 동안은 아래 막대의 [마지막 점 빼기][취소]'],
  ['역 놓기', '지도를 충분히 확대해야 놓을 수 있어요. 마우스 옆에 공사비와 주변 인구가 나와요', ['역 놓기', '지도를 충분히 확대해야 놓을 수 있어요. 잘못 놓았으면 [↶]']],
  ['역 옮기기', '역을 고른 뒤 끌어요. 이전 비용과 늘어난 선로 공사비가 들어요'],
  ['선로 경유점', '흰 점을 끌어 옮기고, 두 번 눌러 지워요. 선 가운데 작은 점을 끌면 새로 생겨요'],
  ['광역급행', '노선을 만들 때(또는 노선 정보에서) [광역급행]: GTX처럼 빠르고 많이 나르지만 열차가 비싸요. 역 사이가 멀고 선로가 곧을수록 빨라요'],
  ['고속철도역', '지도의 회색 동그라미: 처음부터 있는 고속철도역이에요. 가까이 역을 지으면 기차 타는 사람들이 더해져 승객이 늘어요'],
];

// 이 화면에서 보여줄 [이름, 글] 목록 (손가락 화면이면 세 번째 칸을 따르고, "손가락" 줄을 맨 위로)
function shownItems() {
  if (!FINGER) return ITEMS.map(([key, text]) => [key, text]);
  const rows = ITEMS.flatMap(([key, text, finger]) => {
    if (finger === undefined) return [[key, text]];
    return finger === null ? [] : [finger];
  });
  return [...rows.filter(([key]) => key === '손가락'), ...rows.filter(([key]) => key !== '손가락')];
}

// onTutorial: [튜토리얼 다시 하기]를 눌렀을 때
export function createHelpCard(element, button, { onTutorial }) {
  element.innerHTML = `
    <div class="dialog help-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="dialog-title" id="help-title">조작 안내</div>
      <dl class="help-list"></dl>
      <div class="dialog-buttons">
        <button type="button" class="help-tutorial">튜토리얼 다시 하기</button>
        <button type="button" class="dialog-primary help-close">알겠어요</button>
      </div>
    </div>
  `;
  element.querySelector('.help-list').append(
    ...shownItems().flatMap(([key, text]) => {
      const term = document.createElement('dt');
      term.textContent = key;
      const detail = document.createElement('dd');
      detail.textContent = text;
      return [term, detail];
    }),
  );

  const open = () => {
    element.hidden = false;
  };
  const close = () => {
    element.hidden = true;
  };

  button.addEventListener('click', open);
  element.querySelector('.help-close').addEventListener('click', close);
  element.querySelector('.help-tutorial').addEventListener('click', () => {
    close();
    onTutorial();
  });
  // 카드 바깥(빈 곳)을 누르면 닫는다
  element.addEventListener('click', (event) => {
    if (event.target === element) close();
  });
  // 카드가 열려 있을 때 Esc는 카드만 닫는다 (지도의 Esc 동작보다 먼저 받는다)
  document.addEventListener(
    'keydown',
    (event) => {
      if (element.hidden || event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      close();
    },
    true,
  );

}
