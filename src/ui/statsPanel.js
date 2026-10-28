// 위쪽 [통계]: 누르면 최근 달들의 그래프가 아래로 펼쳐진다 (자금, 월 수지, 하루 승객).
// 매달 정산 기록(state.monthlyRecords)을 읽어서 그리기만 한다. 그래프는 새 라이브러리 없이 SVG로 직접 그린다.
// - 그래프마다 한 가지 값만 그린다 (눈금이 둘인 그래프는 헷갈려서 만들지 않는다)
// - 자금·하루 승객은 남색 선, 월 수지는 흑자 초록·적자 빨강 막대 (색만으로 구별하지 않게 위쪽 숫자에 +·− 부호도 붙는다)
// - 그래프 위에 마우스를 올리면 그 달에 세로선이 생기고, 제목 줄 숫자가 그 달 값으로 바뀐다
// - 샌드박스는 돈이 무제한이라 자금 그래프를 뺀다
import { STATS_SHOWN_MONTHS } from '../config.js';
import { svgElement, cssColor } from './svg.js';
import { getState } from '../game/state.js';
import { isSandbox } from '../game/region.js';
import { createPopover } from './popovers.js';
import { formatMoney, formatSignedMoney, formatPopulation } from './format.js';

// 그래프 크기 (px). 펼침 판 너비에 맞춘다
const WIDTH = 300;
const HEIGHT = 96;
// 위쪽 최댓값 글자와 아래쪽 달 글자가 들어갈 자리
const PAD_TOP = 20;
const PAD_BOTTOM = 20;
// 색은 화면의 색 변수에서 읽는다 (svg.js의 cssColor): 남색 선, 흑자 초록·적자 빨강은 위쪽 자금 줄과 같은 색, 눈금은 칸막이 색

// 그래프 종류: 제목, 값 꺼내기, 값을 글로, 모양(선·막대)
const CHARTS = [
  { id: 'money', title: '자금', value: (r) => r.money, text: formatMoney, kind: 'line', sandbox: false },
  { id: 'net', title: '월 수지', value: (r) => r.net, text: formatSignedMoney, kind: 'bars', sandbox: true },
  { id: 'riders', title: '하루 승객', value: (r) => r.riders, text: formatPopulation, kind: 'line', sandbox: true },
];

const monthText = (record) => `${record.year}년 ${record.month}월`;

// 막대 하나: 바닥(0 줄)에 붙은 쪽은 각지고, 값 쪽 끝만 둥글다
function barPath(x, width, zeroY, valueY) {
  const up = valueY < zeroY;
  const height = Math.abs(zeroY - valueY);
  const r = Math.min(2, width / 2, height);
  const end = valueY; // 값 쪽 끝
  const toward = up ? 1 : -1; // 끝에서 바닥 쪽으로
  return [
    `M${x},${zeroY}`,
    `V${end + toward * r}`,
    `Q${x},${end} ${x + r},${end}`,
    `H${x + width - r}`,
    `Q${x + width},${end} ${x + width},${end + toward * r}`,
    `V${zeroY}`,
    'Z',
  ].join(' ');
}

// 그래프 하나를 만든다. records: 보여줄 달들 (오래된 달부터)
function createChart(chart, records) {
  const box = document.createElement('section');
  box.className = 'stats-chart';
  const head = document.createElement('div');
  head.className = 'stats-head';
  const title = document.createElement('b');
  title.textContent = chart.title;
  const readout = document.createElement('span');
  readout.className = 'stats-readout';
  head.append(title, readout);

  const values = records.map(chart.value);
  // 눈금은 0을 늘 넣는다 (빚·적자가 있으면 0 아래로)
  const top = Math.max(0, ...values);
  const bottom = Math.min(0, ...values);
  const span = top - bottom || 1;
  const y = (value) => PAD_TOP + ((top - value) / span) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const step = WIDTH / records.length;
  const x = (i) => step * (i + 0.5);

  const svg = svgElement('svg', {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    width: WIDTH,
    height: HEIGHT,
    role: 'img',
    'aria-label': `${chart.title}: ${monthText(records[0])} ${chart.text(values[0])}부터 ${monthText(records.at(-1))} ${chart.text(values.at(-1))}까지`,
  });
  // 0 줄과 맨 위 줄 (흐린 칸막이 색), 맨 위 값 글자
  svg.append(
    svgElement('line', { x1: 0, x2: WIDTH, y1: y(top), y2: y(top), stroke: cssColor('divider'), 'stroke-width': 1 }),
    svgElement('line', { x1: 0, x2: WIDTH, y1: y(0), y2: y(0), stroke: cssColor('divider'), 'stroke-width': 1 }),
  );
  const topLabel = svgElement('text', { x: 0, y: 13, class: 'stats-axis' });
  topLabel.textContent = chart.text(top);
  svg.append(topLabel);
  if (bottom < 0) {
    const bottomLabel = svgElement('text', { x: 0, y: HEIGHT - 4, class: 'stats-axis' });
    bottomLabel.textContent = chart.text(bottom);
    svg.append(bottomLabel);
  } else {
    // 아래쪽에는 처음과 마지막 달
    const first = svgElement('text', { x: 0, y: HEIGHT - 3, class: 'stats-axis' });
    first.textContent = monthText(records[0]);
    const last = svgElement('text', { x: WIDTH, y: HEIGHT - 3, class: 'stats-axis', 'text-anchor': 'end' });
    last.textContent = monthText(records.at(-1));
    svg.append(first, last);
  }

  if (chart.kind === 'bars') {
    // 막대 사이는 2px 띄운다
    const width = Math.max(1, step - 2);
    values.forEach((value, i) => {
      if (Math.abs(y(value) - y(0)) < 0.5) return;
      svg.append(
        svgElement('path', {
          d: barPath(x(i) - width / 2, width, y(0), y(value)),
          fill: value >= 0 ? cssColor('positive') : cssColor('danger'),
        }),
      );
    });
  } else {
    const points = values.map((value, i) => `${x(i)},${y(value)}`).join(' ');
    svg.append(
      svgElement('polyline', {
        points,
        fill: 'none',
        stroke: cssColor('navy'),
        'stroke-width': 2,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      }),
    );
  }

  // 마우스를 올린 달: 세로선과 점, 제목 줄 숫자
  const cross = svgElement('line', { y1: PAD_TOP - 4, y2: HEIGHT - PAD_BOTTOM + 4, stroke: cssColor('navy'), 'stroke-width': 1, visibility: 'hidden' });
  const dot = svgElement('circle', { r: 4, fill: cssColor('navy'), stroke: '#ffffff', 'stroke-width': 2, visibility: 'hidden' });
  svg.append(cross, dot);
  // hovering: 마우스를 올린 중인지 (아니면 마지막 달 숫자만 보여주고 세로선은 숨긴다)
  const showMonth = (i, hovering) => {
    readout.textContent = `${chart.text(values[i])} · ${monthText(records[i])}`;
    cross.setAttribute('visibility', hovering ? 'visible' : 'hidden');
    dot.setAttribute('visibility', hovering && chart.kind === 'line' ? 'visible' : 'hidden');
    cross.setAttribute('x1', x(i));
    cross.setAttribute('x2', x(i));
    dot.setAttribute('cx', x(i));
    dot.setAttribute('cy', y(values[i]));
  };
  svg.addEventListener('pointermove', (event) => {
    const rect = svg.getBoundingClientRect();
    const i = Math.floor(((event.clientX - rect.left) / rect.width) * records.length);
    showMonth(Math.max(0, Math.min(records.length - 1, i)), true);
  });
  svg.addEventListener('pointerleave', () => showMonth(records.length - 1, false));
  showMonth(records.length - 1, false);

  box.append(head, svg);
  return box;
}

// button: [통계] 버튼, panel: 그래프를 넣을 펼침 판. 결과: { update } — 다시 그릴 때마다 부른다
export function createStatsPanel(button, panel) {
  createPopover(button, panel);
  let drawnKey = null; // 마지막으로 그린 기록 (같으면 다시 그리지 않는다)

  function draw() {
    const records = getState().monthlyRecords.slice(-STATS_SHOWN_MONTHS);
    const key = `${records.length}:${records.at(-1)?.year}-${records.at(-1)?.month}:${isSandbox()}`;
    if (key === drawnKey) return;
    drawnKey = key;
    const heading = document.createElement('p');
    heading.className = 'stats-title';
    if (records.length === 0) {
      heading.textContent = '첫 달 정산이 끝나면 그래프가 나와요';
      panel.replaceChildren(heading);
      return;
    }
    heading.textContent = records.length === 1 ? '지난 1개월' : `최근 ${records.length}개월`;
    const charts = CHARTS.filter((chart) => chart.sandbox || !isSandbox());
    panel.replaceChildren(heading, ...charts.map((chart) => createChart(chart, records)));
  }

  // 펼칠 때 그린다
  button.addEventListener('click', draw);

  // 열려 있으면 새 달이 정산될 때 다시 그린다
  function update() {
    if (!panel.hidden) draw();
  }

  return { update };
}
