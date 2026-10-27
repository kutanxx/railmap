// 출구 이름 붙이기. 나라마다 출구를 부르는 방식이 달라서 방식별로 따로 둔다 (근거: docs/station-exit-research.md).
// 지도의 나라(regions.js의 country)마다 어떤 방식을 쓸지는 config.js의 EXIT_NAMING에 있다.
// 다른 방식을 더하려면 STYLES에 함수를 하나 더하고 EXIT_NAMING에서 그 이름을 쓰면 된다.
import { EXIT_NAMING } from '../config.js';
import { getRegion } from '../game/region.js';

// 띠(노선 묶음)마다, 상행 쪽을 보고 섰을 때 오른쪽 앞부터 시계 방향으로 줄 세운다.
// 결과: [{ index: exits 안의 순서, group }] (먼저 만든 노선 쪽 띠의 출구가 앞)
function clockwise(exits, headings) {
  return exits
    .map((exit, index) => ({
      index,
      group: exit.group,
      turn: (exit.bearing - headings[exit.group] + 360) % 360,
    }))
    .sort((a, b) => a.group - b.group || a.turn - b.turn);
}

const STYLES = {
  // 서울(파리도 숫자): 상행 쪽을 보고 섰을 때 오른쪽 앞 출구가 1번, 그다음 시계 방향으로 2, 3, …
  // 환승역은 먼저 만든 노선 쪽 출구부터 번호를 매기고, 다음 노선 쪽 출구가 이어서 번호를 받는다
  seoul(exits, headings) {
    const names = [];
    clockwise(exits, headings).forEach(({ index }, rank) => {
      names[index] = String(rank + 1);
    });
    return names;
  },
  // 도쿄: 글자 + 숫자. 노선 묶음(띠)마다 글자 A, B, C …, 그 안에서 시계 방향으로 1, 2, … (A1, A2, B1)
  tokyo(exits, headings) {
    const names = [];
    const count = new Map();
    const letters = [...new Set(exits.map((exit) => exit.group))].sort((a, b) => a - b);
    for (const { index, group } of clockwise(exits, headings)) {
      const letter = String.fromCharCode(65 + letters.indexOf(group));
      count.set(group, (count.get(group) ?? 0) + 1);
      names[index] = `${letter}${count.get(group)}`;
    }
    return names;
  },
  // 런던: 번호 없이 나가는 길 이름 ("Way out: Strand"). 가까이 이름 있는 길이 없으면 이름 없음
  street(exits) {
    return exits.map((exit) => exit.street ?? '');
  },
  // 뉴욕: 출구에 번호도 이름도 없다 (노란 점만)
  none(exits) {
    return exits.map(() => '');
  },
};

// 지금 지도의 나라가 쓰는 방식
function namingStyle() {
  const style = EXIT_NAMING[getRegion().country];
  if (!STYLES[style]) throw new Error(`config.js의 EXIT_NAMING에 '${getRegion().country}' 나라 방식이 없어요`);
  return style;
}

// 출구를 찾을 때 길 이름도 읽어야 하는지 (거리 이름 방식만)
export const usesStreetNames = () => namingStyle() === 'street';

// exits: [{ bearing: 역에서 출구 쪽 나침반 방향(도), group: 몇 번째 띠(노선 묶음)의 출구인지, street: 가까운 길 이름 }]
// headings: 띠마다 상행 방향(도) (ui/stationBands.js)
// 결과: exits와 같은 순서의 출구 이름들 ('' 이면 이름 없이 노란 점만)
export function nameExits(exits, headings) {
  return STYLES[namingStyle()](exits, headings);
}
