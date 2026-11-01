// 노선도 옷 갈아입히기 ([노선도] 위쪽 막대의 [서울풍][벡풍][비녤리풍]): 같은 노선도를 다른 그리기 규칙으로.
// 실제 옛 노선도 그림·상표는 쓰지 않고 규칙만 흉내 낸다. 땅색 바탕, 그림자 없음, 색은 base.css 변수 그대로.
// - 서울풍: 지금 레일맵 방식. 일반역 흰 원 + 노선 색 테두리, 환승역 흰 원 + 굵은 남색 테두리
// - 벡풍 (1933년 런던 지하철 노선도의 규칙): 굵은 선, 모서리가 각진 꺾임, 일반역은 선 옆에 짧은 눈금, 환승역은 흰 마름모
// - 비녤리풍 (1972년 뉴욕 지하철 노선도의 규칙): 가는 선을 바짝 붙여 나란히, 일반역은 남색 점, 환승역은 가운데가 흰 남색 점
// 고른 모양은 브라우저에 기억한다. [그림 저장]도 고른 모양 그대로 (diagramExport.js가 그린 것을 그대로 옮긴다)
import { svgElement, cssColor } from './svg.js';

const SKIN_KEY = 'railmap-diagram-skin';

// lineWidth: 노선 선 굵기, gap: 나란한 노선 사이 간격(선 굵기 + 땅색 틈), radius: 일반역 크기,
// join·cap: 선이 꺾이는 곳·끝 모양 (SVG stroke-linejoin·stroke-linecap)
export const SKINS = {
  seoul: { label: '서울풍', title: '지금 레일맵 노선도 (흰 원 역, 남색 테두리 환승역)', lineWidth: 6, gap: 8, radius: 5, join: 'round', cap: 'round' },
  beck: { label: '벡풍', title: '1933년 런던 노선도처럼: 굵은 선, 눈금 역, 마름모 환승역', lineWidth: 9, gap: 11, radius: 4, join: 'miter', cap: 'butt' },
  vignelli: { label: '비녤리풍', title: '1972년 뉴욕 노선도처럼: 가는 선, 점 역', lineWidth: 4, gap: 5, radius: 4, join: 'round', cap: 'round' },
};

export const loadSkin = () => (SKINS[localStorage.getItem(SKIN_KEY)] ? localStorage.getItem(SKIN_KEY) : 'seoul');
export const saveSkin = (id) => localStorage.setItem(SKIN_KEY, id);

// 역 표시 하나: x·y 자리, radius: 그 역에 닿는 나란한 선들을 덮는 크기, transfer: 환승역인지,
// color: 지나는 첫 노선 색, outgoing: 선이 나가는 방향들(라디안). 결과: SVG 요소
export function stationMark(skinId, { x, y, radius, transfer, color, outgoing }) {
  const navy = cssColor('navy');
  if (skinId === 'beck') {
    if (transfer) {
      const size = radius + 3;
      return svgElement('polygon', {
        points: `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`,
        fill: '#ffffff',
        stroke: navy,
        'stroke-width': 2.5,
      });
    }
    // 눈금: 선이 나가는 방향에 직각으로, 선 한쪽 밖으로 조금 튀어나오게
    const angle = (outgoing[0] ?? 0) + Math.PI / 2;
    const length = radius + 5;
    return svgElement('line', {
      x1: x,
      y1: y,
      x2: x + Math.cos(angle) * length,
      y2: y + Math.sin(angle) * length,
      stroke: color,
      'stroke-width': 4,
    });
  }
  if (skinId === 'vignelli') {
    const group = svgElement('g');
    group.append(svgElement('circle', { cx: x, cy: y, r: transfer ? radius + 1 : radius - 1, fill: navy }));
    if (transfer) group.append(svgElement('circle', { cx: x, cy: y, r: 2.5, fill: '#ffffff' }));
    return group;
  }
  return svgElement('circle', {
    cx: x,
    cy: y,
    r: radius,
    fill: '#ffffff',
    stroke: transfer ? navy : color,
    'stroke-width': transfer ? 3 : 2.5,
  });
}
