// 고른 역 둘레의 모서리 괄호: 네 모서리에 남색 L자 괄호를 그려 "지금 이 역을 보고 있다"를 보여준다
// (디비전 게임의 작전 화면에서 빌린 조각. 반투명·빛 번짐 없이 남색 선만 쓴다).
// 괄호 크기는 역 모양(승강장 띠·대합실)이 화면에서 차지하는 크기에 맞추고, 지도를 움직이거나 확대하면 따라간다.
// HTML 조각 하나를 지도 위에 띄워 두고 자리만 옮긴다 (역마다 만들지 않는다).

// 괄호와 역 모양 사이 여백, 괄호 상자의 가장 작은 반지름 (px)
const PADDING = 10;
const MIN_HALF = 26;

let element = null;
let target = null; // 지금 감싸는 점들 [[경도, 위도], …] 또는 null

// points: 고른 역의 모양을 이루는 점들 (없으면 null = 괄호 숨김)
export function updateSelectionBracket(map, points) {
  if (!element) {
    element = document.createElement('div');
    element.className = 'selection-bracket';
    element.innerHTML = '<i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>';
    map.getContainer().append(element);
    map.on('move', () => place(map));
  }
  target = points;
  place(map);
}

// 점들을 화면에 옮겨 감싸는 네모를 구하고, 괄호를 그 둘레에 놓는다
function place(map) {
  element.hidden = !target;
  if (!target) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const coord of target) {
    const { x, y } = map.project(coord);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const halfX = Math.max(MIN_HALF, (maxX - minX) / 2 + PADDING);
  const halfY = Math.max(MIN_HALF, (maxY - minY) / 2 + PADDING);
  element.style.transform = `translate(${centerX - halfX}px, ${centerY - halfY}px)`;
  element.style.width = `${halfX * 2}px`;
  element.style.height = `${halfY * 2}px`;
}
