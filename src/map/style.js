// 기본 지도 스타일(OpenFreeMap positron)을 받아와서
// CLAUDE.md 아트 규칙의 베이지 팔레트로 색을 바꾼다.
// 레이어마다 어떤 팔레트 색을 쓰는지 적어 두어서(metadata 'railmap:palette'), 관제실 모드에서
// 다른 팔레트(CONTROL_ROOM_PALETTE)로 한꺼번에 바꿀 수 있다 (map/theme.js).

// 아트 규칙 표의 색 (배경 지도용)
export const PALETTE = {
  land: '#EFE7D6', // 땅 (배경)
  urban: '#E9E0CC', // 시가지 블록
  building: '#E2D6BF', // 건물
  buildingOutline: '#CFC0A3', // 건물 테두리
  road: '#FBF7EE', // 도로
  roadCasing: '#D6C9AF', // 도로 테두리
  green: '#CFE0B4', // 공원·녹지
  water: '#B8CBDA', // 강·물
  rail: '#A69C8B', // 기존 철도
  label: '#6F6656', // 큰 지명 글자
  labelSmall: '#9A8F7B', // 작은 지명 글자 (도로 이름, 동네 이름 등)
  labelHalo: '#EFE7D6', // 글자 테두리
};

// 관제실 모드의 바탕 지도 색: 짙은 회남색 (실제 철도 관제실 화면처럼 평소엔 차분하게, 색은 플레이어가 지은 것에만)
export const CONTROL_ROOM_PALETTE = {
  land: '#1E2630',
  urban: '#232C37',
  building: '#2A3441',
  buildingOutline: '#36414F',
  road: '#38434F',
  roadCasing: '#2B3440',
  green: '#25302C',
  water: '#1A2B3B',
  rail: '#4F5A68',
  label: '#9DABB9',
  labelSmall: '#73828F',
  labelHalo: '#1E2630',
};

// 레이어의 칠할 곳(prop)에 팔레트 색(key)을 칠하고, 어떤 색인지 metadata에 적어 둔다 (관제실 모드로 바꿀 때 쓴다)
export function usePalette(layer, paint, prop, key) {
  paint[prop] = PALETTE[key];
  layer.metadata = { ...layer.metadata, 'railmap:palette': { ...layer.metadata?.['railmap:palette'], [prop]: key } };
}

// 지명은 한국어 이름을 먼저, 없으면 원래 이름
const KOREAN_NAME = ['coalesce', ['get', 'name:ko'], ['get', 'name']];

// 큰 지명으로 칠할 레이어 (도시·시도·나라 이름)
const BIG_LABEL_IDS = ['label_city', 'label_city_capital', 'label_state', 'label_country'];

// 기본 스타일 JSON을 받아와 베이지 톤으로 바꾼 스타일을 돌려준다
export async function loadBeigeStyle(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`지도 스타일을 불러오지 못했어요 (${response.status}): ${url}`);
  }
  const style = await response.json();
  style.layers = style.layers.map(recolorLayer);
  return style;
}

// 레이어 하나의 id와 type을 보고 어떤 색을 입힐지 정한다
function recolorLayer(original) {
  const layer = { ...original };
  const id = layer.id;
  const paint = { ...layer.paint };
  const layout = { ...layer.layout };
  const color = (prop, key) => usePalette(layer, paint, prop, key);

  if (layer.type === 'background') {
    color('background-color', 'land');
  } else if (layer.type === 'fill') {
    recolorFill(id, paint, color);
  } else if (layer.type === 'line') {
    recolorLine(id, paint, layout, color);
  } else if (layer.type === 'symbol') {
    recolorSymbol(id, paint, layout, color);
  }

  return { ...layer, paint, layout };
}

function recolorFill(id, paint, color) {
  if (id.includes('water')) {
    color('fill-color', 'water');
  } else if (id.includes('park') || id.includes('wood')) {
    color('fill-color', 'green');
  } else if (id.includes('building')) {
    color('fill-color', 'building');
    color('fill-outline-color', 'buildingOutline');
  } else if (id.includes('residential') || id.includes('aeroway')) {
    color('fill-color', 'urban');
  } else {
    // 빙하, 부두 등 나머지 면은 땅 색으로 묻는다
    color('fill-color', 'land');
  }
  // 반투명 없이 완전히 칠한다
  paint['fill-opacity'] = 1;
}

function recolorLine(id, paint, layout, color) {
  if (id.includes('rail')) {
    if (id.includes('dashline')) {
      // 철도 위의 흰 점선은 숨긴다
      layout.visibility = 'none';
    }
    color('line-color', 'rail');
  } else if (id.includes('waterway')) {
    color('line-color', 'water');
  } else if (id.includes('boundary')) {
    color('line-color', 'buildingOutline');
  } else if (id.includes('casing')) {
    color('line-color', 'roadCasing');
  } else {
    // 일반 도로, 고속도로 안쪽, 터널, 활주로, 보행로
    color('line-color', 'road');
  }
  paint['line-opacity'] = 1;
}

function recolorSymbol(id, paint, layout, color) {
  // 글자가 없는 아이콘 전용 레이어는 건드리지 않는다
  if (!layout['text-field']) return;

  // 도로 번호판(숫자)은 이름이 아니라 번호를 보여주므로 글자 내용은 그대로 둔다
  const isShield = id.includes('shield');
  if (!isShield) {
    layout['text-field'] = KOREAN_NAME;
  }

  // 도시 이름 앞의 검은 점 아이콘은 팔레트에 없으므로 뺀다
  if (id.startsWith('label_')) {
    delete layout['icon-image'];
  }

  const isBig = BIG_LABEL_IDS.some((prefix) => id.startsWith(prefix));
  color('text-color', isBig ? 'label' : 'labelSmall');
  color('text-halo-color', 'labelHalo');
  paint['text-halo-blur'] = 0;
}
