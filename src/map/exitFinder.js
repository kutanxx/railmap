// 출구 자리 찾기: 대합실 양옆으로 통로를 뻗어, 건물이 없는 가장 가까운 길가(보도)에 출구를 놓는다.
// - 역이 도로 밑이면: 도로를 건너 양쪽 보도에 출구가 나온다
// - 역이 건물 밑이면: 통로가 건물 밑을 지나 길가까지 길어진다
// - EXIT_SEARCH_M 안에 길가가 없으면: 건물 밑이면 "건물 연결" 출구, 빈 땅(공원 등)이면 그냥 출구
// 건물·도로는 지금 불러온 지도 타일에서 읽는다 (population.js와 같은 방법).
// 계산은 역을 원점으로 한 평면 좌표(미터, 동쪽 x·북쪽 y)에서 한다.
import {
  EXIT_SEARCH_M,
  BUILDING_EXIT_M,
  SIDEWALK_M,
  ROAD_HALF_WIDTH_M,
  MAX_EXITS_PER_STATION,
  EXIT_MIN_GAP_M,
} from '../config.js';
import { localProjection, inverseProjection } from './population.js';

const BASE_SOURCE = 'openmaptiles';
// 통로를 뻗으며 몇 미터마다 확인할지
const STEP_M = 4;

// 지금 불러온 건물과 도로를 한 번 모아 둔다 (여러 역을 한꺼번에 찾을 때 다시 읽지 않도록)
// 아직 지도 타일이 없으면 null
export function readSurroundings(map) {
  const buildings = map
    .querySourceFeatures(BASE_SOURCE, { sourceLayer: 'building' })
    .map((feature) => {
      const { type, coordinates } = feature.geometry;
      const polygons = type === 'MultiPolygon' ? coordinates : [coordinates];
      return { bbox: boundsOf(polygons.flat(2)), polygons };
    });
  const roads = map
    .querySourceFeatures(BASE_SOURCE, { sourceLayer: 'transportation' })
    .filter(
      (feature) =>
        ROAD_HALF_WIDTH_M[feature.properties.class] !== undefined &&
        feature.properties.brunnel !== 'tunnel' &&
        feature.geometry.type.endsWith('LineString'),
    )
    .map((feature) => {
      const { type, coordinates } = feature.geometry;
      const lines = type === 'MultiLineString' ? coordinates : [coordinates];
      return { bbox: boundsOf(lines.flat()), lines, half: ROAD_HALF_WIDTH_M[feature.properties.class] };
    });
  if (buildings.length === 0 && roads.length === 0) return null;
  return { buildings, roads };
}

// 결과: [{ coord: 출구 [경도, 위도], passage: [대합실 가운데, 출구], building: 건물 연결인지,
//          bearing: 역에서 출구 쪽 나침반 방향(도) }]
// parts: 역 모양 조각들 (ui/stationBands.js). 대합실마다 양옆으로 하나씩 찾는다
export function findExits(surroundings, stationCoord, parts) {
  const toMeters = localProjection(stationCoord);
  const toLngLat = inverseProjection(stationCoord);

  // 역 둘레만 골라서 미터 좌표로 바꾼다
  const reach = EXIT_SEARCH_M + 100;
  const area = boundsOf([toLngLat([-reach, -reach]), toLngLat([reach, reach])]);
  const buildings = surroundings.buildings
    .filter((building) => overlaps(building.bbox, area))
    .map(({ polygons }) => {
      const rings = polygons.map((polygon) => polygon.map((ring) => ring.map(toMeters)));
      return { bbox: boundsOf(rings.flat(2)), rings };
    });
  const segments = [];
  for (const road of surroundings.roads) {
    if (!overlaps(road.bbox, area)) continue;
    for (const line of road.lines) {
      const points = line.map(toMeters);
      for (let i = 1; i < points.length; i++) segments.push([points[i - 1], points[i], road.half]);
    }
  }

  // 그 자리가 건물 안인지
  const inBuilding = (p) =>
    buildings.some(
      ({ bbox, rings }) =>
        p[0] >= bbox[0] && p[0] <= bbox[2] && p[1] >= bbox[1] && p[1] <= bbox[3] &&
        rings.some((polygon) => insideRings(p, polygon)),
    );
  // 가장 가까운 도로 가장자리까지 거리 (음수면 도로 위)
  const roadEdge = (p) => {
    let best = Infinity;
    for (const [a, b, half] of segments) best = Math.min(best, segmentDistance(p, a, b) - half);
    return best;
  };

  // 출발점에서 dir 쪽으로 통로를 뻗어 출구 자리를 찾는다. start: 출발 거리 (대합실 가장자리)
  const walk = (origin, dir, start) => {
    const at = (s) => [origin[0] + dir[0] * s, origin[1] + dir[1] * s];
    let wasOffRoad = false;
    for (let s = start; s <= EXIT_SEARCH_M; s += STEP_M) {
      const p = at(s);
      const edge = roadEdge(p);
      if (edge < 0.5) {
        // 길 밖에서 걷다가 도로에 닿으면, 도로 바로 앞(보도)에 낸다
        if (wasOffRoad) {
          let back = s;
          while (back > start && roadEdge(at(back)) < 0.5) back -= 1;
          return { point: at(back), building: false };
        }
        continue; // 역이 도로 밑이면 도로를 건너 보도까지 간다
      }
      wasOffRoad = true;
      if (edge <= SIDEWALK_M && !inBuilding(p)) return { point: p, building: false };
    }
    // 가까운 길가가 없다: 건물 밑이면 건물 연결, 아니면 빈 땅 위 출구
    const p = at(Math.max(start, BUILDING_EXIT_M));
    return { point: p, building: inBuilding(p) };
  };

  const exits = [];
  for (const part of parts) {
    if (part.kind !== 'concourse') continue;
    const points = part.coords.map(toMeters);
    const first = points[0];
    const last = points[points.length - 1];
    const length = Math.hypot(last[0] - first[0], last[1] - first[1]);
    if (length === 0) continue;
    const middle = [(first[0] + last[0]) / 2, (first[1] + last[1]) / 2];
    const along = [(last[0] - first[0]) / length, (last[1] - first[1]) / length];
    for (const side of [1, -1]) {
      const dir = [-along[1] * side, along[0] * side];
      const found = walk(middle, dir, part.width / 2);
      // 이미 찾은 출구와 너무 가까우면 하나로 친다
      const close = exits.some(
        (exit) => Math.hypot(exit.point[0] - found.point[0], exit.point[1] - found.point[1]) < EXIT_MIN_GAP_M,
      );
      if (!close) exits.push({ ...found, from: middle });
    }
  }

  return exits.slice(0, MAX_EXITS_PER_STATION).map(({ point, building, from }) => ({
    coord: toLngLat(point),
    passage: [toLngLat(from), toLngLat(point)],
    building,
    bearing: ((Math.atan2(point[0], point[1]) * 180) / Math.PI + 360) % 360,
  }));
}

// 점들을 감싸는 네모 [최소x, 최소y, 최대x, 최대y]
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

// 점이 다각형(바깥선 + 구멍들) 안인지. 선을 몇 번 넘는지 세는 방법이라 구멍도 저절로 빠진다
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

// 점 p에서 선분 a-b까지 거리
function segmentDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSquared));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
