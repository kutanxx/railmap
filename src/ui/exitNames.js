// 출구 이름 붙이기. 나라(도시)마다 출구를 부르는 방식이 달라서 방식별로 따로 둔다.
// 지금은 서울식만 있다. 다른 방식은 STYLES에 함수를 하나 더하고 config.js의 EXIT_NAMING을 바꾸면 된다.
// (예: 도쿄 'A1', 베이징 북서쪽 A부터 시계 방향, 뉴욕은 이름 없음 — docs/station-exit-research.md)
import { EXIT_NAMING } from '../config.js';

const STYLES = {
  // 서울: 상행 쪽을 보고 섰을 때 오른쪽 앞 출구가 1번, 그다음 시계 방향으로 2, 3, …
  // 환승역은 먼저 만든 노선 쪽 출구부터 번호를 매기고, 다음 노선 쪽 출구가 이어서 번호를 받는다
  seoul(exits, headings) {
    const order = exits
      .map((exit, index) => ({
        index,
        group: exit.group,
        turn: (exit.bearing - headings[exit.group] + 360) % 360,
      }))
      .sort((a, b) => a.group - b.group || a.turn - b.turn);
    const names = [];
    order.forEach(({ index }, rank) => {
      names[index] = String(rank + 1);
    });
    return names;
  },
};

// exits: [{ bearing: 역에서 출구 쪽 나침반 방향(도), group: 몇 번째 띠(노선 묶음)의 출구인지 }]
// headings: 띠마다 상행 방향(도) (ui/stationBands.js)
// 결과: exits와 같은 순서의 출구 이름들
export function nameExits(exits, headings) {
  const style = STYLES[EXIT_NAMING];
  if (!style) throw new Error(`config.js의 EXIT_NAMING '${EXIT_NAMING}'은(는) 없는 방식이에요`);
  return style(exits, headings);
}
