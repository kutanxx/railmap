// 출구 자리 찾기: 대합실 양옆으로 통로를 뻗어, 건물이 없는 가장 가까운 길가(보도)에 출구를 놓는다.
// - 역이 도로 밑이면: 도로를 건너 양쪽 보도에 출구가 나온다
// - 역이 건물 밑이면: 통로가 건물 밑을 지나 길가까지 길어진다
// - EXIT_SEARCH_M 안에 길가가 없으면: 건물 밑이면 "건물 연결" 출구, 빈 땅(공원 등)이면 그냥 출구
// - 대합실 가까이 큰 사거리가 있으면: 그 대합실 출구는 양옆 대신 사거리 네 모퉁이 보도에 낸다
// - 거리 이름으로 출구를 부르는 나라(런던)면 출구마다 가장 가까운 이름 있는 길도 찾아 둔다 (street)
// 건물·도로는 지도 자료에서 읽는다 (mapFeatures.js: 실제 지도는 불러온 타일, 가상 지도는 GeoJSON).
// 계산은 역을 원점으로 한 평면 좌표(미터, 동쪽 x·북쪽 y)에서 한다.
import {
  EXIT_SEARCH_M,
  BUILDING_EXIT_M,
  SIDEWALK_M,
  ROAD_HALF_WIDTH_M,
  MAX_EXITS_PER_STATION,
  EXIT_MIN_GAP_M,
  CORNER_EXIT_REACH_M,
  CORNER_ROAD_CLASSES,
  STREET_NAME_REACH_M,
} from '../config.js';
import { localProjection, inverseProjection } from './population.js';
import { readMapFeatures } from './mapFeatures.js';

// 통로를 뻗으며 몇 미터마다 확인할지
const STEP_M = 4;
// 모퉁이 출구를 도로 가장자리에서 적어도 얼마나 떨어뜨릴지 (미터)
const CORNER_MARGIN_M = 3;
// 이보다 가까운 교차점들은 사거리 하나로 친다 (왕복 도로는 교차점이 여러 개 생긴다)
const CROSSING_MERGE_M = 25;
// 출구는 역 모양(띠·대합실) 가장자리에서 이만큼(미터) 밖에 낸다. 역 그림에 가려지지 않게
const STATION_CLEARANCE_M = 4;

// 지금 불러온 건물과 도로를 한 번 모아 둔다 (여러 역을 한꺼번에 찾을 때 다시 읽지 않도록)
// withStreets: 길 이름도 읽을지 (거리 이름 출구를 쓰는 나라만). 아직 지도 타일이 없으면 null
export function readSurroundings(map, withStreets) {
  const buildings = readMapFeatures(map, 'building').map((feature) => {
    const { type, coordinates } = feature.geometry;
    const polygons = type === 'MultiPolygon' ? coordinates : [coordinates];
    return { bbox: boundsOf(polygons.flat(2)), polygons };
  });
  const roads = readMapFeatures(map, 'transportation')
    .filter(
      (feature) =>
        ROAD_HALF_WIDTH_M[feature.properties.class] !== undefined &&
        feature.properties.brunnel !== 'tunnel' &&
        feature.geometry.type.endsWith('LineString'),
    )
    .map((feature) => {
      const { type, coordinates } = feature.geometry;
      const lines = type === 'MultiLineString' ? coordinates : [coordinates];
      return {
        bbox: boundsOf(lines.flat()),
        lines,
        half: ROAD_HALF_WIDTH_M[feature.properties.class],
        major: CORNER_ROAD_CLASSES.includes(feature.properties.class),
      };
    });
  if (buildings.length === 0 && roads.length === 0) return null;
  // 길 이름은 도로 모양과 따로 'transportation_name' 층에 있다. 한국어 이름이 있으면 그것을 쓴다
  const streets = withStreets
    ? readMapFeatures(map, 'transportation_name')
        .filter((feature) => feature.properties.name && feature.geometry.type.endsWith('LineString'))
        .map((feature) => {
          const { type, coordinates } = feature.geometry;
          const lines = type === 'MultiLineString' ? coordinates : [coordinates];
          return { bbox: boundsOf(lines.flat()), lines, name: feature.properties['name:ko'] ?? feature.properties.name };
        })
    : null;
  return { buildings, roads, streets };
}

// 결과: [{ coord: 출구 [경도, 위도], passage: [대합실 가운데, 출구], building: 건물 연결인지,
//          bearing: 역에서 출구 쪽 나침반 방향(도), group: 출구를 낸 대합실이 몇 번째 띠(노선 묶음)인지 }]
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
  const majorSegments = []; // 사거리 찾기용: [a, b, 도로 번호]
  surroundings.roads.forEach((road, roadIndex) => {
    if (!overlaps(road.bbox, area)) return;
    for (const line of road.lines) {
      const points = line.map(toMeters);
      for (let i = 1; i < points.length; i++) {
        segments.push([points[i - 1], points[i], road.half]);
        if (road.major) majorSegments.push([points[i - 1], points[i], roadIndex]);
      }
    }
  });

  // 그 자리가 건물 안인지
  const inBuilding = (p) =>
    buildings.some(
      ({ bbox, rings }) =>
        p[0] >= bbox[0] && p[0] <= bbox[2] && p[1] >= bbox[1] && p[1] <= bbox[3] &&
        rings.some((polygon) => insideRings(p, polygon)),
    );
  // 그 자리가 역 모양(띠·대합실) 위인지
  const pieces = parts.map((part) => ({ points: part.coords.map(toMeters), half: part.width / 2 }));
  const underStation = (p) =>
    pieces.some(({ points, half }) => {
      for (let i = 1; i < points.length; i++) {
        if (segmentDistance(p, points[i - 1], points[i]) < half + STATION_CLEARANCE_M) return true;
      }
      return false;
    });
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
      if (underStation(p)) continue; // 아직 역 그림 밑이다 (다른 띠·대합실 포함)
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

  // 대합실마다 가운데 자리와 놓인 방향
  const concourses = [];
  for (const part of parts) {
    if (part.kind !== 'concourse') continue;
    const points = part.coords.map(toMeters);
    const first = points[0];
    const last = points[points.length - 1];
    const length = Math.hypot(last[0] - first[0], last[1] - first[1]);
    if (length === 0) continue;
    concourses.push({
      middle: [(first[0] + last[0]) / 2, (first[1] + last[1]) / 2],
      along: [(last[0] - first[0]) / length, (last[1] - first[1]) / length],
      width: part.width,
      group: part.group,
    });
  }

  const exits = [];
  // 이미 찾은 출구와 너무 가까우면 하나로 친다
  const add = (found, concourse) => {
    const close = exits.some(
      (exit) => Math.hypot(exit.point[0] - found.point[0], exit.point[1] - found.point[1]) < EXIT_MIN_GAP_M,
    );
    if (!close) exits.push({ ...found, from: concourse.middle, group: concourse.group });
    return !close;
  };

  // 가까운 큰 사거리가 있으면 가장 가까운 대합실에서 네 모퉁이로 출구를 낸다
  // 모퉁이: 사거리 가운데에서 두 길 사이 대각선(네 방향)으로 나가다가, 도로와 역 그림을 벗어난 첫 자리
  const crossing = nearestCrossing(majorSegments, concourses);
  let cornerCount = 0;
  if (crossing) {
    const { point, d1, d2, concourse } = crossing;
    for (const s1 of [1, -1]) {
      for (const s2 of [1, -1]) {
        const out = unit([0, 0], [s1 * d1[0] + s2 * d2[0], s1 * d1[1] + s2 * d2[1]]);
        for (let t = 4; t <= CORNER_EXIT_REACH_M; t += 2) {
          const p = [point[0] + out[0] * t, point[1] + out[1] * t];
          if (underStation(p) || roadEdge(p) < CORNER_MARGIN_M) continue;
          cornerCount += add({ point: p, building: false }, concourse) ? 1 : 0;
          break;
        }
      }
    }
  }
  // 나머지 대합실은 양옆으로 통로를 뻗어 길가를 찾는다
  // 모퉁이 출구가 둘도 안 나왔으면 사거리 쪽 대합실도 양옆으로 찾는다
  for (const concourse of concourses) {
    if (concourse === crossing?.concourse && cornerCount >= 2) continue;
    const { middle, along, width } = concourse;
    for (const side of [1, -1]) {
      add(walk(middle, [-along[1] * side, along[0] * side], width / 2), concourse);
    }
  }

  // 거리 이름 출구용: 역 둘레의 이름 있는 길 조각들
  const streetSegments = [];
  for (const street of surroundings.streets ?? []) {
    if (!overlaps(street.bbox, area)) continue;
    for (const line of street.lines) {
      const points = line.map(toMeters);
      for (let i = 1; i < points.length; i++) streetSegments.push([points[i - 1], points[i], street.name]);
    }
  }
  // 출구에서 STREET_NAME_REACH_M 안의 가장 가까운 길 이름. 없으면 ''
  const streetAt = (p) => {
    let best = { gap: STREET_NAME_REACH_M, name: '' };
    for (const [a, b, name] of streetSegments) {
      const gap = segmentDistance(p, a, b);
      if (gap < best.gap) best = { gap, name };
    }
    return best.name;
  };

  return exits.slice(0, MAX_EXITS_PER_STATION).map(({ point, building, from, group }) => ({
    coord: toLngLat(point),
    passage: [toLngLat(from), toLngLat(point)],
    building,
    bearing: ((Math.atan2(point[0], point[1]) * 180) / Math.PI + 360) % 360,
    group,
    street: streetAt(point),
  }));
}

// 대합실에서 CORNER_EXIT_REACH_M 안의 가장 가까운 큰 사거리. 없으면 null
// 결과: { point: 사거리 가운데, d1·d2: 두 길의 방향, concourse: 가장 가까운 대합실 }
function nearestCrossing(majorSegments, concourses) {
  // 서로 다른 큰 길의 선분이 만나는(끝이 닿는 것도 포함) 자리. 거의 나란하면 같은 길이 이어진 것이라 뺀다
  // 왕복 도로는 상·하행 선이 따로 있어서 교차점이 여러 개 생긴다. 가까운 것끼리 모아 가운데를 쓴다
  const crossings = [];
  for (let i = 0; i < majorSegments.length; i++) {
    const [a1, b1, road1] = majorSegments[i];
    for (let j = i + 1; j < majorSegments.length; j++) {
      const [a2, b2, road2] = majorSegments[j];
      if (road1 === road2) continue;
      const hit = intersect(a1, b1, a2, b2);
      if (!hit) continue;
      const d1 = unit(a1, b1);
      const d2 = unit(a2, b2);
      if (Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) < 0.5) continue; // 30도보다 비스듬하면 사거리로 치지 않는다
      const near = crossings.find((c) => Math.hypot(c.first[0] - hit[0], c.first[1] - hit[1]) < CROSSING_MERGE_M);
      if (near) {
        near.sum[0] += hit[0];
        near.sum[1] += hit[1];
        near.count += 1;
      } else {
        crossings.push({ first: hit, sum: [...hit], count: 1, d1, d2 });
      }
    }
  }

  let best = null;
  for (const { sum, count, d1, d2 } of crossings) {
    const point = [sum[0] / count, sum[1] / count];
    for (const concourse of concourses) {
      const d = Math.hypot(point[0] - concourse.middle[0], point[1] - concourse.middle[1]);
      if (d <= CORNER_EXIT_REACH_M && (!best || d < best.distance)) best = { point, d1, d2, concourse, distance: d };
    }
  }
  return best;
}

// 선분 a1-b1과 a2-b2가 만나는 점 (끝이 살짝 닿는 것도 포함). 안 만나면 null
function intersect(a1, b1, a2, b2) {
  const rx = b1[0] - a1[0];
  const ry = b1[1] - a1[1];
  const sx = b2[0] - a2[0];
  const sy = b2[1] - a2[1];
  const denominator = rx * sy - ry * sx;
  if (denominator === 0) return null;
  const qx = a2[0] - a1[0];
  const qy = a2[1] - a1[1];
  const t = (qx * sy - qy * sx) / denominator;
  const u = (qx * ry - qy * rx) / denominator;
  const slack = 0.01;
  if (t < -slack || t > 1 + slack || u < -slack || u > 1 + slack) return null;
  return [a1[0] + t * rx, a1[1] + t * ry];
}

// a에서 b로 가는 방향 (길이 1)
function unit(a, b) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
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
