// 멀리서 보이는 환승역 캡슐 그림 (서울 2023 "신호등 방식"·홍콩 MTR처럼):
// 지나는 노선마다 노선 색 원 하나씩을 노선 번호 순서로 맞붙이고, 흰 띠와 남색 테두리 하나로 감싼다.
// 노선 색 조합마다 그림을 한 번만 만들어 지도에 등록한다 (매 프레임 다시 그리지 않는다).
// 그림은 줌 15 바로 아래 크기로 만들고, 더 멀리서는 줄여서 보여준다 (stationLayers.js의 icon-size).
import { STATION_CAPSULE } from '../config.js';

const SELECTED = '#F2C230';
// 캡슐 테두리 색: 보통 남색, 관제실 모드면 밝은 회색 (map/theme.js가 바꾼다)
let outlineColor = '#1F3A55';
export function setCapsuleOutline(color) {
  outlineColor = color;
}
const SCALE = 2; // 선명하게 2배로 그린다

// 노선 색 목록으로 등록할 그림 이름. selected면 노란 바깥 테두리가 있는 그림
export function capsuleImageName(colors, selected) {
  return `station-capsule${selected ? '-selected' : ''}:${outlineColor}:${colors.join(',')}`;
}

// 아직 없는 조합이면 그림을 만들어 지도에 등록한다
export function ensureCapsuleImage(map, colors, selected) {
  const name = capsuleImageName(colors, selected);
  if (!map.hasImage(name)) map.addImage(name, drawCapsule(colors, selected), { pixelRatio: SCALE });
  return name;
}

function drawCapsule(colors, selected) {
  const { circle, band, outline, ring } = STATION_CAPSULE;
  const halo = selected ? ring : 0;
  const pad = outline + band; // 원 바깥 여백 (흰 띠 + 남색 테두리)
  const height = circle + pad * 2;
  const width = pad * 2 + colors.length * circle + (colors.length - 1) * band;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((width + halo * 2) * SCALE);
  canvas.height = Math.ceil((height + halo * 2) * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  // 고른 역: 노란 바깥 테두리
  if (selected) pill(ctx, 0, 0, width + halo * 2, height + halo * 2, SELECTED);
  // 남색 테두리 → 흰 띠 → 노선 색 원들
  pill(ctx, halo, halo, width, height, outlineColor);
  pill(ctx, halo + outline, halo + outline, width - outline * 2, height - outline * 2, '#FFFFFF');
  colors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(halo + pad + circle / 2 + i * (circle + band), halo + height / 2, circle / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// 양 끝이 둥근 막대 (캡슐) 하나를 칠한다
function pill(ctx, x, y, width, height, color) {
  const r = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arc(x + width - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + height);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
