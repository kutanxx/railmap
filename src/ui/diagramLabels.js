// 노선도 보기의 역 이름 자리 (diagramView.js에서 나눔).
// - 이름은 확대해도 화면에서 늘 같은 크기다 (노선도만 커진다). 그래서 확대할 때마다 자리를 다시 고른다
// - 이름은 선이 덜 지나는 쪽부터 8방향으로 놓아 보고, 다른 이름·역 원과 겹치지 않는 첫 자리에 둔다
// - 어디에 놓아도 다른 이름·역 원과 겹치면 숨긴다 (확대하면 자리가 생겨 나타난다)
// - 중요한 역부터 자리를 잡는다: 환승역 → 종착역 → 나머지 (노선 순서)
import { segmentHitsBox, angleGap } from './diagramLayout.js';

const LABEL_GAP = 6; // 역 원과 이름 사이 (화면 px)
const LABEL_PAD = 2; // 이름끼리 띄울 여유 (화면 px)
// 역 이름을 붙일 수 있는 8방향 (선과 떨어진 정도가 거의 같으면 앞쪽 먼저: 오른쪽, 왼쪽, 위, 아래, 대각선)
const LABEL_SIDES = [0, 180, -90, 90, -45, -135, 45, 135].map((deg) => (deg * Math.PI) / 180);

// root: 노선도 화면 (CSS 변수 --diagram-scale을 여기에 둔다. styles/diagram.css의 .diagram-label이 글자 크기를 이 값으로 나눈다)
// marks: 역마다 { x, y, radius, transfer, terminal, outgoing: 선이 나가는 방향들, label: SVG <text> } (노선도 좌표, 확대 1배)
// segments: 그린 선 토막들 [[x, y], [x, y]] (이름이 선을 덜 덮는 자리를 고를 때)
// 결과: { arrange(scale) } — 확대 정도가 바뀔 때마다 부른다
export function createDiagramLabels(root, marks, segments) {
  const setScale = (scale) => root.style.setProperty('--diagram-scale', String(scale));
  // 확대 1배에서 이름 크기를 한 번만 잰다. 모두 같은 모양으로 놓은 뒤 한꺼번에 읽는다
  // (놓고 읽기를 번갈아 하면 브라우저가 노선도 전체 배치를 매번 다시 계산해서 역이 수백 곳이면 몇 초 걸렸다)
  setScale(1);
  for (const { label } of marks) {
    label.setAttribute('x', 0);
    label.setAttribute('y', 0);
    label.setAttribute('text-anchor', 'start');
    label.setAttribute('dominant-baseline', 'central');
  }
  const sizes = marks.map(({ label }) => label.getBBox());
  const items = marks.map((mark, i) => {
    const { width, height } = sizes[i];
    const clearance = (angle) => Math.min(...mark.outgoing.map((o) => angleGap(o, angle)));
    const sides = LABEL_SIDES.map((angle, order) => ({ angle, order, room: clearance(angle) }))
      .sort((a, b) => (Math.abs(b.room - a.room) < 0.01 ? a.order - b.order : b.room - a.room))
      .map(({ angle }) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const anchor = Math.abs(cos) < 0.1 ? 'middle' : cos > 0 ? 'start' : 'end';
        const baseline = Math.abs(sin) < 0.1 ? 'central' : sin > 0 ? 'hanging' : 'alphabetic';
        // 이름이 붙는 점에서 본 이름 네모 (확대 1배): 가로는 붙는 쪽, 세로는 기준선에 따라
        const left = anchor === 'start' ? 0 : anchor === 'middle' ? -width / 2 : -width;
        const top = baseline === 'central' ? -height / 2 : baseline === 'hanging' ? 0 : -height * 0.8;
        const box = { left: left - LABEL_PAD, top: top - LABEL_PAD, right: left + width + LABEL_PAD, bottom: top + height + LABEL_PAD };
        return { cos, sin, anchor, baseline, box };
      });
    return { mark, sides, shown: null };
  });
  // 선 토막마다 둘레 네모 (이름 네모와 멀리 떨어진 토막은 자세히 재지 않고 넘긴다)
  const lines = segments.map(([p, q]) => ({
    p,
    q,
    left: Math.min(p[0], q[0]),
    right: Math.max(p[0], q[0]),
    top: Math.min(p[1], q[1]),
    bottom: Math.max(p[1], q[1]),
  }));
  // 환승역 → 종착역 → 나머지 순서로 자리를 잡는다 (같으면 원래 순서)
  const ordered = items
    .map((item, order) => ({ item, order }))
    .sort((a, b) => b.item.mark.transfer - a.item.mark.transfer || b.item.mark.terminal - a.item.mark.terminal || a.order - b.order)
    .map(({ item }) => item);

  function arrange(scale) {
    setScale(scale);
    const k = 1 / scale; // 화면 px → 노선도 좌표
    const taken = marks.map(({ x, y, radius }) => ({ left: x - radius, top: y - radius, right: x + radius, bottom: y + radius }));
    const boxesHit = (box) =>
      taken.filter((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)
        .length;
    const linesHit = (box) => {
      let count = 0;
      for (const line of lines) {
        if (line.right < box.left || line.left > box.right || line.bottom < box.top || line.top > box.bottom) continue;
        if (segmentHitsBox(line.p, line.q, box)) count += 1;
      }
      return count;
    };

    for (const item of ordered) {
      const { mark } = item;
      let best = null;
      for (const side of item.sides) {
        const ax = mark.x + side.cos * (mark.radius + LABEL_GAP * k);
        const ay = mark.y + side.sin * (mark.radius + LABEL_GAP * k);
        const box = { left: ax + side.box.left * k, top: ay + side.box.top * k, right: ax + side.box.right * k, bottom: ay + side.box.bottom * k };
        const covers = boxesHit(box);
        // 다른 이름·역을 덮는 것이 선을 덮는 것보다 훨씬 나쁘다
        const hits = covers * 100 + linesHit(box);
        if (!best || hits < best.hits) best = { side, ax, ay, box, covers, hits };
        if (hits === 0) break;
      }
      // 어디든 다른 이름·역을 덮으면 숨긴다 (자리를 차지하지 않는다)
      const shown = best.covers === 0;
      if (shown !== item.shown) {
        item.shown = shown;
        if (shown) mark.label.removeAttribute('display');
        else mark.label.setAttribute('display', 'none');
      }
      if (!shown) continue;
      mark.label.setAttribute('x', best.ax);
      mark.label.setAttribute('y', best.ay);
      mark.label.setAttribute('text-anchor', best.side.anchor);
      mark.label.setAttribute('dominant-baseline', best.side.baseline);
      taken.push(best.box);
    }
  }

  return { arrange };
}
