// 물(한강·호수·강) 위인지 재기. 물 위를 지나는 선로 구간은 교량이 된다 (game/trackProfile.js).
// 물 모양은 지도 자료에서 읽는다 (mapFeatures.js). 실제 지도는 불러온 타일만 있어서 화면 밖 먼 곳의 물은 못 볼 수 있다.
import { readMapFeatures } from './mapFeatures.js';

// 교량으로 치지 않는 물 (수영장)
const SKIPPED_CLASSES = new Set(['swimming_pool']);

// 지도마다 읽어 둔 물 모양. 지도를 움직여 타일을 새로 불러오면(idle) 다시 읽는다
// version은 다시 읽은 물 모양이 전과 달라졌을 때만 1씩 늘린다 (선로 분석을 기억해 둘지 정하는 데 쓴다)
const cache = new WeakMap();

function waterShapes(map) {
  let entry = cache.get(map);
  if (!entry) {
    entry = { shapes: null, size: -1, version: 0 };
    cache.set(map, entry);
    map.on('idle', () => {
      entry.shapes = null;
    });
  }
  if (entry.shapes) return entry.shapes;
  entry.shapes = readMapFeatures(map, 'water')
    .filter((f) => !SKIPPED_CLASSES.has(f.properties.class) && f.properties.brunnel !== 'tunnel')
    .flatMap((feature) => {
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon') return [coordinates];
      if (type === 'MultiPolygon') return coordinates;
      return [];
    })
    .map((rings) => ({ rings, bbox: boundsOf(rings[0]) }));
  // 물 모양이 달라졌는지는 점 개수로 가늠한다
  const size = entry.shapes.reduce((sum, { rings }) => sum + rings.reduce((n, ring) => n + ring.length, 0), 0);
  if (size !== entry.size) {
    entry.size = size;
    entry.version += 1;
  }
  return entry.shapes;
}

// 물 모양 번호: 읽어 둔 물 모양이 바뀔 때마다 달라진다
export function waterVersion(map) {
  waterShapes(map);
  return cache.get(map).version;
}

// 점들([경도, 위도] 목록)이 하나씩 물 위인지 (true/false 목록). 선로 높이 분석이 쓴다 (game/trackProfile.js)
export function waterAt(map, points) {
  const shapes = waterShapes(map);
  const box = boundsOf(points);
  const nearby = shapes.filter(({ bbox }) => overlaps(bbox, box));
  return points.map((point) =>
    nearby.some(({ rings, bbox }) => inBox(point, bbox) && insideRings(point, rings)),
  );
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
