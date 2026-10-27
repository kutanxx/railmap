// 노선 색 바탕 위 글자색: 어두운 색이면 흰 글자, 밝은 색(노랑·하늘·연분홍 등)이면 남색 글자.
// 번호 배지(역 이름표, 역 카드, 노선 목록, 번호 띠)와 열차 번호표가 함께 쓴다.
// 실제 노선도처럼 흰 글자를 먼저 쓰고, 흰 글자 대비(WCAG)가 WHITE_MIN_CONTRAST보다 낮을 만큼 밝은 색에서만
// 두 글자색 중 대비가 더 큰 쪽을 고른다.
const WHITE = '#FFFFFF';
const NAVY = '#1F3A55';
// 흰 글자가 이만큼 대비가 나면 흰 글자를 쓴다 (서울 2호선 초록 3.1, 9호선 금색 2.0, 런던 서클선 노랑 1.5쯤)
const WHITE_MIN_CONTRAST = 3;

const remembered = new Map();

// 상대 밝기 (WCAG): 0 = 검정, 1 = 흰색
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// color: '#RRGGBB' 노선 색. 결과: 그 위에 쓸 글자색
export function inkOn(color) {
  let ink = remembered.get(color);
  if (!ink) {
    const background = luminance(color);
    const onWhite = contrast(background, 1);
    ink = onWhite >= WHITE_MIN_CONTRAST || onWhite >= contrast(background, luminance(NAVY)) ? WHITE : NAVY;
    remembered.set(color, ink);
  }
  return ink;
}
