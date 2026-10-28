// 노선도 그림 저장 (노선도 화면의 [그림 저장]): 지금 노선도를 PNG 파일로 내려받는다.
// 화면의 노선도(SVG)를 복사해서 제목·노선 목록·출처를 붙인 그림을 새로 만들고, 브라우저 안에서 PNG로 바꾼다 (서버 없음).
// 끌어서 옮기거나 확대한 것과 상관없이 노선도 전체가 들어간다. 글자는 화면 CSS를 못 쓰므로 모양을 직접 적는다.
import { routeNumber } from '../game/routes.js';
import { inkOn } from '../map/ink.js';
import { SVG, svgElement, cssColor } from './svg.js';

const FONT = "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
// 그림 여백과 줄 높이 (px, 저장할 때 2배로 키운다)
const PAD = 40;
const TITLE_HEIGHT = 44;
const LEGEND_ROW = 30;
const FOOTER = 36;
const SCALE = 2; // 선명하게 2배 크기로 저장

// 노선 목록을 줄 바꿈해 가며 놓는다. 결과: [{ route, x, row }], 줄 수
function layoutLegend(routes, width) {
  const items = [];
  let x = 0;
  let row = 0;
  for (const route of routes) {
    // 글자 폭 어림: 한글 15px, 그 밖 9px + 번호 배지·간격
    const textWidth = [...route.name].reduce((sum, ch) => sum + (/[가-힣]/.test(ch) ? 15 : 9), 0);
    const itemWidth = 28 + textWidth + 20;
    if (x > 0 && x + itemWidth > width) {
      x = 0;
      row += 1;
    }
    items.push({ route, x, row });
    x += itemWidth;
  }
  return { items, rows: routes.length ? row + 1 : 0 };
}

// world: 노선도의 선·역을 담은 <g>, title: "노선도 · 서울", routes: 노선들, fileName: 저장할 파일 이름
export async function saveDiagramPng({ world, title, routes, fileName }) {
  // 화면에서 끌고 확대한 것(world의 transform)은 빼고, 노선도 자체의 크기
  const box = world.getBBox();
  const width = Math.max(Math.ceil(box.width) + PAD * 2, 640);
  const { items, rows } = layoutLegend(routes, width - PAD * 2);
  const top = PAD + TITLE_HEIGHT + rows * LEGEND_ROW + 16;
  const height = Math.ceil(top + box.height + PAD + FOOTER);

  const svg = svgElement('svg', { xmlns: SVG, width, height, viewBox: `0 0 ${width} ${height}` });
  svg.append(svgElement('rect', { width, height, fill: cssColor('land') }));
  svg.append(
    svgElement('text', { x: PAD, y: PAD + 26, fill: cssColor('navy'), 'font-family': FONT, 'font-size': 26, 'font-weight': 700 }, title),
  );
  // 노선 목록: 번호 배지 + 이름
  for (const { route, x, row } of items) {
    const cy = PAD + TITLE_HEIGHT + row * LEGEND_ROW + 12;
    svg.append(
      svgElement('circle', { cx: PAD + x + 11, cy, r: 11, fill: route.color }),
      svgElement(
        'text',
        {
          x: PAD + x + 11,
          y: cy + 5,
          fill: inkOn(route.color),
          'font-family': FONT,
          'font-size': 13,
          'font-weight': 700,
          'text-anchor': 'middle',
        },
        String(routeNumber(route)),
      ),
      svgElement('text', { x: PAD + x + 28, y: cy + 5, fill: cssColor('navy'), 'font-family': FONT, 'font-size': 15 }, route.name),
    );
  }
  // 노선도 복사본: 왼쪽 위가 여백 안쪽에 오게 옮긴다
  const copy = world.cloneNode(true);
  copy.setAttribute('transform', `translate(${PAD - box.x} ${top - box.y})`);
  // 역 이름은 화면 CSS(.diagram-label) 대신 직접 모양을 적는다
  for (const label of copy.querySelectorAll('.diagram-label')) {
    label.setAttribute('fill', cssColor('navy'));
    label.setAttribute('font-family', FONT);
    label.setAttribute('font-size', 13);
    label.setAttribute('font-weight', 700);
    label.setAttribute('stroke-width', 4);
    label.setAttribute('stroke-linejoin', 'round');
    label.setAttribute('paint-order', 'stroke');
  }
  svg.append(copy);
  // 출처 (역 이름이 지도 지명에서 온다)
  svg.append(
    svgElement(
      'text',
      { x: width - 16, y: height - 14, fill: cssColor('muted'), 'font-family': FONT, 'font-size': 13, 'text-anchor': 'end' },
      '레일맵 · 지도 자료 © OpenStreetMap 기여자',
    ),
  );

  // SVG → 그림 → 캔버스 → PNG
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  const context = canvas.getContext('2d');
  context.scale(SCALE, SCALE);
  context.drawImage(image, 0, 0, width, height);
  URL.revokeObjectURL(url);
  const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const link = document.createElement('a');
  link.href = URL.createObjectURL(png);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
