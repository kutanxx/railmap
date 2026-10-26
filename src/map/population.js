// 역 주변 인구 추정: 반경 POPULATION_RADIUS_M 안의 건물 바닥 면적(㎡) × PEOPLE_PER_BUILT_M2.
// 지도 데이터는 도심의 건물을 블록 단위로 합쳐 두어서 "건물 개수"는 실제보다 훨씬 적게 나온다.
// 그래서 개수 대신 원 안에 들어오는 건물 면적을 잰다.
// 건물은 지금 불러온 지도 타일에서 찾는다(querySourceFeatures). 건물 데이터가 없으면 기본값을 쓴다.
//
// 속도: 건물 모양을 원으로 자르는 계산을 범용 함수(Turf intersect)로 하면 역 하나에 2초 넘게 걸렸다.
// 원은 볼록한 모양이라, 볼록한 모양으로 자르는 간단한 방법(서덜랜드-호지먼)을 직접 쓴다.
//
// 이웃 역과 나누기: 원 안의 건물 면적을 CATCHMENT_CELL_M 크기 칸(격자)마다 따로 적어 둔다(cells).
// 나중에 칸마다 가장 가까운 역에만 인구를 주면(game/catchment.js), 붙어 있는 역이 같은 건물을 두 번 세지 않는다.
import {
  STATION_MIN_ZOOM,
  POPULATION_RADIUS_M,
  CATCHMENT_CELL_M,
  PEOPLE_PER_BUILT_M2,
  DEFAULT_STATION_POPULATION,
  MIN_STATION_POPULATION,
} from '../config.js';

// 기본 지도(OpenFreeMap)의 데이터 이름
const BASE_SOURCE = 'openmaptiles';
const BUILDING_LAYER = 'building';
// 원을 몇 각형으로 근사할지
const CIRCLE_STEPS = 32;

// 인구를 믿을 만하게 잴 만큼 확대했는지 (역 놓기·옮기기는 이때만 된다)
export const zoomedInEnough = (map) => map.getZoom() >= STATION_MIN_ZOOM;

// 결과: { population, builtArea: 건물 면적(㎡), cells: [[경도, 위도, 면적㎡], …] }
// 건물 데이터가 없으면 builtArea = null, cells = null, 인구는 기본값
export function estimatePopulation(map, coord) {
  const features = map.querySourceFeatures(BASE_SOURCE, { sourceLayer: BUILDING_LAYER });
  // 너무 멀리 축소하면 건물 데이터가 아예 없다
  if (features.length === 0) {
    return { population: DEFAULT_STATION_POPULATION, builtArea: null, cells: null };
  }

  // 역을 원점으로 한 평면 좌표(미터)로 바꿔서 계산한다. 반경 500m 정도면 지구가 둥근 건 무시해도 된다
  const toMeters = localProjection(coord);
  const radius = POPULATION_RADIUS_M;
  const zone = [];
  for (let i = 0; i < CIRCLE_STEPS; i++) {
    const angle = (2 * Math.PI * i) / CIRCLE_STEPS;
    zone.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
  }

  let builtArea = 0;
  const grid = new Map(); // "칸x,칸y" → 면적
  for (const feature of features) {
    const { type, coordinates } = feature.geometry;
    const polygons = type === 'MultiPolygon' ? coordinates : [coordinates];
    for (const rings of polygons) {
      rings.forEach((ring, i) => {
        const points = ring.map(toMeters);
        // 원과 멀리 떨어진 모양은 자르지 않고 넘어간다
        if (!nearCircle(points, radius)) return;
        const inside = clipToConvex(points, zone);
        if (inside.length < 3) return;
        // 첫 고리는 건물 바깥선, 나머지는 안뜰 같은 구멍이라 뺀다
        const sign = i === 0 ? 1 : -1;
        builtArea += sign * Math.abs(shoelaceArea(inside));
        addToGrid(grid, inside, sign);
      });
    }
  }

  const toLngLat = inverseProjection(coord);
  const cells = [];
  for (const [key, area] of grid) {
    if (area < 1) continue;
    const [gx, gy] = key.split(',').map(Number);
    const [lng, lat] = toLngLat([(gx + 0.5) * CATCHMENT_CELL_M, (gy + 0.5) * CATCHMENT_CELL_M]);
    // 저장 파일이 너무 커지지 않게 좌표는 소수 5자리(약 1m), 면적은 ㎡ 단위로 줄인다
    cells.push([round(lng, 5), round(lat, 5), Math.round(area)]);
  }

  const population = Math.max(MIN_STATION_POPULATION, Math.round(builtArea * PEOPLE_PER_BUILT_M2));
  return { population, builtArea: Math.round(builtArea), cells };
}

// 다각형을 격자 칸마다 잘라서 칸별 면적에 더한다 (sign: 구멍이면 −1)
function addToGrid(grid, polygon, sign) {
  const size = CATCHMENT_CELL_M;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  for (let gx = Math.floor(minX / size); gx * size < maxX; gx++) {
    for (let gy = Math.floor(minY / size); gy * size < maxY; gy++) {
      const x0 = gx * size;
      const y0 = gy * size;
      // 칸(네모)은 볼록하므로 같은 방법으로 자른다. 꼭짓점은 반시계 방향
      const square = [
        [x0, y0],
        [x0 + size, y0],
        [x0 + size, y0 + size],
        [x0, y0 + size],
      ];
      const area = Math.abs(shoelaceArea(clipToConvex(polygon, square)));
      if (area > 0) {
        const key = `${gx},${gy}`;
        grid.set(key, (grid.get(key) ?? 0) + sign * area);
      }
    }
  }
}

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits;

// [경도, 위도] → 기준점에서 동쪽 x, 북쪽 y 미터
export function localProjection([lng0, lat0]) {
  const metersPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const metersPerLat = 110540;
  return ([lng, lat]) => [(lng - lng0) * metersPerLng, (lat - lat0) * metersPerLat];
}

// 기준점에서 동쪽 x, 북쪽 y 미터 → [경도, 위도] (localProjection의 반대)
export function inverseProjection([lng0, lat0]) {
  const metersPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const metersPerLat = 110540;
  return ([x, y]) => [lng0 + x / metersPerLng, lat0 + y / metersPerLat];
}

// 모양의 네모 테두리가 원의 네모 테두리와 겹치는지
function nearCircle(points, radius) {
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
  return maxX >= -radius && minX <= radius && maxY >= -radius && minY <= radius;
}

// 서덜랜드-호지먼: 다각형 subject를 볼록 다각형 clip(반시계 방향) 안쪽만 남기고 자른다
function clipToConvex(subject, clip) {
  let output = subject;
  for (let i = 0; i < clip.length && output.length > 0; i++) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    const inside = ([x, y]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) >= 0;
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];
      if (inside(current)) {
        if (!inside(previous)) output.push(crossing(previous, current, a, b));
        output.push(current);
      } else if (inside(previous)) {
        output.push(crossing(previous, current, a, b));
      }
    }
  }
  return output;
}

// 선분 p-q와 직선 a-b가 만나는 점
function crossing(p, q, a, b) {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const t = (ex * (p[1] - a[1]) - ey * (p[0] - a[0])) / (ey * dx - ex * dy);
  return [p[0] + t * dx, p[1] + t * dy];
}

// 신발끈 공식: 다각형 넓이 (방향에 따라 +/−)
function shoelaceArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}
