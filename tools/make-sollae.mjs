// 가상 지도 "솔내 지방"의 자료를 만든다: node tools/make-sollae.mjs
// → src/data/sollae.json (마을·강·산·도로 GeoJSON), src/data/sollae-height.json (땅 높이 격자)
// 배치(마을 4개, 강, 산, 도로)와 계산 방식은 reference/prototype-sollae.html을 그대로 옮겼다.
// 프로토타입은 1단위 = 10m인 평면 좌표(오른쪽 x, 아래쪽 y)를 쓰므로, 끝에 [경도, 위도]로 바꾼다.
// 무작위도 정해진 씨앗으로 만들어서 언제 돌려도 같은 지도가 나온다. 게임은 만들어 둔 sollae.json만 읽는다.
import { writeFileSync } from 'node:fs';
import { INTERCITY_STATIONS } from '../src/intercityStations.js';

// ── 세계 크기와 놓을 자리 ──
const W = 1800; // 가로 1800단위 = 18km
const H = 1100; // 세로 1100단위 = 11km
const UNIT_M = 10;
// 세계 가운데를 놓을 [경도, 위도]. 실제로는 아무것도 없는 바다 위이고, 위도는 서울과 같게 맞췄다
const ANCHOR = [131.0, 37.56];
const M_PER_LNG = 111320 * Math.cos((ANCHOR[1] * Math.PI) / 180);
const M_PER_LAT = 110540;
const round = (v) => Math.round(v * 1e6) / 1e6;
const toLngLat = ([x, y]) => [
  round(ANCHOR[0] + ((x - W / 2) * UNIT_M) / M_PER_LNG),
  round(ANCHOR[1] - ((y - H / 2) * UNIT_M) / M_PER_LAT),
];
// [경도, 위도] → 세계 좌표 (toLngLat의 반대)
const fromLngLat = ([lng, lat]) => [
  W / 2 + ((lng - ANCHOR[0]) * M_PER_LNG) / UNIT_M,
  H / 2 - ((lat - ANCHOR[1]) * M_PER_LAT) / UNIT_M,
];

// ── 프로토타입에서 옮긴 것: 마을, 강, 지형 ──
const TOWNS = [
  { name: '솔내', x: 330, y: 560, r: 110, ang: 0.35 },
  { name: '가람', x: 770, y: 905, r: 82, ang: -0.5 },
  { name: '새터', x: 1020, y: 250, r: 52, ang: 0.9 },
  { name: '한골', x: 1500, y: 390, r: 74, ang: -0.2 },
];
const RIVER_W = 22; // 강 폭 (단위)
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const gauss = (x, y, cx, cy, sx, sy) =>
  Math.exp(-((x - cx) ** 2 / (2 * sx * sx) + (y - cy) ** 2 / (2 * sy * sy)));
function hash(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  let n = 0;
  for (let o = 0; o < 4; o++) {
    s += a * vnoise(x * f, y * f);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}
function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function crPoint(p0, p1, p2, p3, t) {
  const d = (p, q) => Math.max(1e-4, Math.sqrt(Math.hypot(q.x - p.x, q.y - p.y)));
  const t0 = 0;
  const t1 = t0 + d(p0, p1);
  const t2 = t1 + d(p1, p2);
  const t3 = t2 + d(p2, p3);
  const tt = t1 + (t2 - t1) * t;
  const L = (a, b, ta, tb) => {
    const w = (tt - ta) / (tb - ta);
    return { x: a.x + (b.x - a.x) * w, y: a.y + (b.y - a.y) * w };
  };
  const A1 = L(p0, p1, t0, t1);
  const A2 = L(p1, p2, t1, t2);
  const A3 = L(p2, p3, t2, t3);
  return L(L(A1, A2, t0, t2), L(A2, A3, t1, t3), t1, t2);
}
// 점 몇 개를 지나는 부드러운 곡선 (센트립탈 캣멀-롬)
function splineDense(pts) {
  const n = pts.length;
  const ext = [
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    { x: 2 * pts[n - 1].x - pts[n - 2].x, y: 2 * pts[n - 1].y - pts[n - 2].y },
  ];
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const [p0, p1, p2, p3] = ext.slice(i, i + 4);
    const m = Math.max(6, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2));
    for (let k = i === 0 ? 0 : 1; k <= m; k++) out.push(crPoint(p0, p1, p2, p3, k / m));
  }
  return out;
}
const RIVER = splineDense(
  [
    [990, -30], [930, 170], [860, 330], [765, 480], [690, 615], [600, 755], [520, 880], [468, 1000], [440, 1140],
  ].map(([x, y]) => ({ x, y })),
);
function riverDist(x, y) {
  let m = Infinity;
  for (let i = 1; i < RIVER.length; i++) {
    const a = RIVER[i - 1];
    const b = RIVER[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    m = Math.min(m, Math.hypot(a.x + dx * t - x, a.y + dy * t - y));
  }
  return m;
}
function baseH(x, y) {
  let h = 38 + 30 * fbm(x / 320, y / 320);
  h += 85 * sstep(1050, 1650, x);
  h += 440 * gauss(x, y, 1140, 560, 200, 250) * (0.7 + 0.6 * fbm(x / 140 + 7.3, y / 140 + 2.1));
  h += 170 * gauss(x, y, 960, 320, 150, 110);
  h += 150 * gauss(x, y, 1320, 870, 170, 115);
  h += 160 * gauss(x, y, 610, 270, 120, 100);
  h += 55 * (fbm(x / 80 + 13, y / 80 + 5) - 0.5) * sstep(90, 300, h);
  const d = riverDist(x, y);
  h += (14 - h) * Math.exp(-(d * d) / (2 * 75 * 75)) * 0.92;
  return Math.max(4, h);
}
for (const t of TOWNS) t.base = baseH(t.x, t.y);
function terrainH(x, y) {
  let h = baseH(x, y);
  for (const t of TOWNS) {
    const w = 1 - sstep(t.r * 0.7, t.r * 1.7, Math.hypot(x - t.x, y - t.y));
    if (w > 0) h += (t.base - h) * w;
  }
  return h;
}

// ── GeoJSON 만들기 ──
const features = [];
const polygon = (ring, properties) =>
  features.push({
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]].map(toLngLat)] },
  });
const line = (points, properties) =>
  features.push({ type: 'Feature', properties, geometry: { type: 'LineString', coordinates: points.map(toLngLat) } });
const point = (p, properties) =>
  features.push({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: toLngLat(p) } });

// 산: 봉우리에서 사방으로 나가며 높이가 MOUNTAIN_H 아래로 떨어지는 곳까지를 산으로 친다
const MOUNTAIN_H = 270;
let peak = { x: 0, y: 0, h: 0 };
for (let y = 300; y <= 850; y += 5) {
  for (let x = 900; x <= 1400; x += 5) {
    const h = terrainH(x, y);
    if (h > peak.h) peak = { x, y, h };
  }
}
const mountain = [];
for (let k = 0; k < 96; k++) {
  const a = (2 * Math.PI * k) / 96;
  let r = 0;
  while (r < 600 && terrainH(peak.x + Math.cos(a) * (r + 4), peak.y + Math.sin(a) * (r + 4)) >= MOUNTAIN_H) r += 4;
  mountain.push([peak.x + Math.cos(a) * r, peak.y + Math.sin(a) * r]);
}
polygon(mountain, { layer: 'landcover', kind: 'mountain' });

// 공원: 솔내와 가람 시가지 안에 하나씩
const PARKS = [
  { x: 395, y: 600, r: 30 },
  { x: 800, y: 880, r: 20 },
];
const circle = (c, r, n = 40) =>
  Array.from({ length: n }, (_, k) => [c.x + Math.cos((2 * Math.PI * k) / n) * r, c.y + Math.sin((2 * Math.PI * k) / n) * r]);
for (const park of PARKS) polygon(circle(park, park.r), { layer: 'landcover', kind: 'park' });

// 강: 가운데 선을 양쪽으로 RIVER_W / 2씩 넓힌 면
const offset = (pts, o) =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return [p.x - ((b.y - a.y) / L) * o, p.y + ((b.x - a.x) / L) * o];
  });
polygon([...offset(RIVER, RIVER_W / 2), ...offset(RIVER, -RIVER_W / 2).reverse()], { layer: 'water', class: 'river' });

// 마을: 돌려 놓은 격자에 시가지 블록과 건물 (프로토타입과 같은 씨앗·순서)
const rnd = mulberry(11);
const BW = 22;
const BH = 17;
const GAP = 5;
for (const t of TOWNS) {
  const ca = Math.cos(t.ang);
  const sa = Math.sin(t.ang);
  const toWorld = (u, v) => [t.x + u * ca - v * sa, t.y + u * sa + v * ca];
  const quad = (lx, ly, w, h) => [[lx, ly], [lx + w, ly], [lx + w, ly + h], [lx, ly + h]].map(([u, v]) => toWorld(u, v));
  const n = Math.ceil(t.r / (BW + GAP)) + 1;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      if (i % 4 === 0 && rnd() < 0.6) continue;
      const lx = i * (BW + GAP) - BW / 2;
      const ly = j * (BH + GAP) - BH / 2;
      const [wx, wy] = toWorld(lx + BW / 2, ly + BH / 2);
      if (Math.hypot(lx + BW / 2, ly + BH / 2) > t.r * (0.72 + 0.35 * rnd()) || rnd() < 0.07) continue;
      if (riverDist(wx, wy) < RIVER_W) continue;
      const kind = Math.floor(rnd() * 3);
      if (PARKS.some((p) => Math.hypot(wx - p.x, wy - p.y) < p.r + 8)) continue;
      polygon(quad(lx, ly, BW, BH), { layer: 'landuse', kind: 'block' });
      const building = (x0, y0, w, h) => polygon(quad(x0, y0, w, h), { layer: 'building' });
      if (kind === 0) {
        building(lx + 2, ly + 2, BW * 0.42, BH - 4);
        building(lx + BW * 0.52, ly + 2, BW * 0.44, BH * 0.45);
      } else if (kind === 1) {
        building(lx + 2, ly + 2, BW - 4, BH * 0.38);
        building(lx + 2, ly + BH * 0.55, BW * 0.55, BH * 0.38);
      } else {
        building(lx + 2, ly + 2, BW * 0.3, BH - 4);
        building(lx + BW * 0.38, ly + 2, BW * 0.58, BH * 0.3);
        building(lx + BW * 0.38, ly + BH * 0.62, BW * 0.58, BH * 0.3);
      }
    }
  }
  // 블록 사이 동네 길: 격자 틈마다, 마을 둘레(원) 안쪽만
  const R = t.r * 1.05;
  const street = (u1, v1, u2, v2) =>
    line([toWorld(u1, v1), toWorld(u2, v2)], { layer: 'transportation', class: 'minor' });
  for (let i = -n - 1; i <= n; i++) {
    const u = i * (BW + GAP) + (BW + GAP) / 2;
    if (Math.abs(u) < R) street(u, -Math.sqrt(R * R - u * u), u, Math.sqrt(R * R - u * u));
  }
  for (let j = -n - 1; j <= n; j++) {
    const v = j * (BH + GAP) + (BH + GAP) / 2;
    if (Math.abs(v) < R) street(-Math.sqrt(R * R - v * v), v, Math.sqrt(R * R - v * v), v);
  }
}

// 마을을 잇는 큰길
const ROADS = [
  [[330, 560], [460, 690], [610, 790], [770, 905]],
  [[330, 560], [520, 430], [760, 340], [900, 285], [1020, 250]],
  [[1020, 250], [1160, 200], [1320, 270], [1500, 390]],
  [[770, 905], [1040, 1000], [1380, 1010], [1610, 830], [1590, 570], [1500, 390]],
  [[330, 560], [150, 640], [-20, 700]],
  [[330, 560], [200, 380], [120, -20]],
  [[1500, 390], [1660, 330], [1830, 300]],
];
for (const road of ROADS) {
  const curve = splineDense(road.map(([x, y]) => ({ x, y })));
  line(curve.map((p) => [p.x, p.y]), { layer: 'transportation', class: 'primary' });
}

// 지어낸 기존 철도 (고속철도): 서쪽 끝 → 솔내역 → 금빛강을 건너 가람 남쪽 → 동쪽 끝.
// 플레이어가 지은 것이 아닌 배경이라 실제 지도의 기존 철도처럼 회색으로 그린다 (지도 스타일 map/sollaeStyle.js).
// 솔내역 자리는 고속철도역 목록(src/intercityStations.js)에서 읽어서, 역을 옮겨도 선로가 역을 지나게 한다.
// class 'rail'은 실제 지도와 같은 이름이라 출구 찾기(map/exitFinder.js)는 도로로 치지 않는다
const [stationX, stationY] = fromLngLat(INTERCITY_STATIONS.sollae[0].coord);
const RAILWAY = [
  [-20, stationY - 40],
  [stationX, stationY],
  [470, 760],
  [640, 930],
  [800, 1035],
  [1050, 1070],
  [1400, 1075],
  [1830, 1060],
];
line(
  splineDense(RAILWAY.map(([x, y]) => ({ x, y }))).map((p) => [p.x, p.y]),
  { layer: 'transportation', class: 'rail' },
);

// 지명
for (const t of TOWNS) point([t.x, t.y], { layer: 'place', kind: 'town', name: t.name });
point([peak.x, peak.y], { layer: 'place', kind: 'peak', name: `봉우리산 ${Math.round(peak.h)}m` });
const riverLabel = RIVER.reduce((b, q) => (Math.hypot(q.x - 650, q.y - 690) < Math.hypot(b.x - 650, b.y - 690) ? q : b));
point([riverLabel.x + 30, riverLabel.y], { layer: 'place', kind: 'water', name: '금빛강' });

// ── 땅 높이 격자: HEIGHT_STEP단위(60m)마다 높이(m). 터널·교량 판정과 등고선에 쓴다 (game/terrain.js) ──
const HEIGHT_STEP = 6;
const nx = Math.floor(W / HEIGHT_STEP) + 1;
const ny = Math.floor(H / HEIGHT_STEP) + 1;
const heights = [];
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) heights.push(Math.round(terrainH(i * HEIGHT_STEP, j * HEIGHT_STEP)));
const [gridWest, gridNorth] = toLngLat([0, 0]);
writeFileSync(
  new URL('../src/data/sollae-height.json', import.meta.url),
  JSON.stringify({
    west: gridWest,
    north: gridNorth,
    stepLng: (HEIGHT_STEP * UNIT_M) / M_PER_LNG,
    stepLat: (HEIGHT_STEP * UNIT_M) / M_PER_LAT,
    nx,
    ny,
    heights,
  }),
);

const [west, north] = toLngLat([0, 0]);
const [east, south] = toLngLat([W, H]);
const data = { type: 'FeatureCollection', bbox: [west, south, east, north], features };
writeFileSync(new URL('../src/data/sollae.json', import.meta.url), JSON.stringify(data));
const count = (layer) => features.filter((f) => f.properties.layer === layer).length;
console.log(
  `건물 ${count('building')}개, 길 ${count('transportation')}개, 면 ${count('landuse') + count('landcover') + count('water')}개, 봉우리 ${Math.round(peak.h)}m`,
);
