// 그림(SVG)을 만드는 작은 도움 함수들: 통계 그래프(statsPanel.js), 노선도(diagramView.js), 노선도 그림 저장(diagramExport.js)이 함께 쓴다.
// 색은 화면 모양 파일의 색 변수(styles/base.css 맨 위 :root)에서 읽어서, 색을 한곳(base.css)에서만 고치면 되게 한다.

export const SVG = 'http://www.w3.org/2000/svg';

// SVG 요소 하나. attributes: { 이름: 값 }, text: 안에 쓸 글자 (없으면 null)
export function svgElement(name, attributes = {}, text = null) {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text !== null) element.textContent = text;
  return element;
}

// 색 변수 값: cssColor('navy') → '#1f3a55'. 게임 중에는 바뀌지 않으므로 한 번 읽으면 기억한다
const colors = new Map();
export function cssColor(name) {
  if (!colors.has(name)) {
    colors.set(name, getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim());
  }
  return colors.get(name);
}
