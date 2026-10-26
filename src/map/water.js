// 선로가 물(한강·호수 등) 위를 지나는 길이 재기. 그 구간은 교량 공사비를 받는다 (game/economy.js).
// 물 모양은 지도 자료에서 읽는다 (mapFeatures.js). 실제 지도는 불러온 타일만 있어서 화면 밖 먼 곳의 물은 못 볼 수 있다.
// 선을 WATER_STEP_M마다 짚어 보고, 물 안에 든 점의 비율로 길이를 어림한다.
import { length, lineString, along } from '@turf/turf';
import { readMapFeatures } from './mapFeatures.js';

// 몇 미터마다 짚어 볼지 (작을수록 정확하지만 느리다)
const WATER_STEP_M = 25;
// 교량으로 치지 않는 물 (수영장)
const SKIPPED_CLASSES = new Set(['swimming_pool']);

// 지도마다 읽어 둔 물 모양. 지도를 움직여 타일을 새로 불러오면(idle) 다시 읽는다
const cache = new WeakMap();

function waterShapes(map) {
  let entry = cache.get(map);
  if (!entry) {
    entry = { shapes: null };
    cache.set(map, entry);
    map.on('idle', () => {
      entry.shapes = null;
    });
  }
  entry.shapes ??= readMapFeatures(map, 'water')
    .filter((f) => !SKIPPED_CLASSES.has(f.properties.class) && f.properties.brunnel !== 'tunnel')
    .flatMap((feature) => {
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon') return [coordinates];
      if (type === 'MultiPolygon') return coordinates;
      return [];
    })
    .map((rings) => ({ rings, bbox: boundsOf(rings[0]) }));
  return entry.shapes;
}

// coords([경도, 위도] 목록)를 잇는 선이 물 위를 지나는 길이 (km)
export function waterKm(map, coords) {
  if (coords.length < 2) return 0;
  const line = lineString(coords);
  const totalKm = length(line, { units: 'kilometers' });
  const shapes = waterShapes(map);
  if (shapes.length === 0 || totalKm === 0) return 0;

  const lineBox = boundsOf(coords);
  const nearby = shapes.filter(({ bbox }) => overlaps(bbox, lineBox));
  if (nearby.length === 0) return 0;

  const steps = Math.max(1, Math.ceil((totalKm * 1000) / WATER_STEP_M));
  let wet = 0;
  for (let i = 0; i < steps; i++) {
    // 각 칸의 가운데를 짚는다
    const point = along(line, ((i + 0.5) / steps) * totalKm, { units: 'kilometers' }).geometry.coordinates;
    if (nearby.some(({ rings, bbox }) => inBox(point, bbox) && insideRings(point, rings))) wet += 1;
  }
  return (wet / steps) * totalKm;
}

function boundsOf(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

const overlaps = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
const inBox = ([x, y], box) => x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3];

// 점이 다각형(바깥선 + 구멍들) 안인지. 선을 몇 번 넘는지 세는 방법이라 섬(구멍)은 저절로 빠진다
function insideRings(p, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
