// 선로 모양: 직선(역 → 경유점 → 역을 곧게 잇는 꺾인 선) 또는 곡선(경유점을 모두 지나는 부드러운 곡선).
// 곡선은 "구심 캣멀-롬 곡선"으로 만든다. 경유점을 정확히 지나고, 점 사이가 들쭉날쭉해도 고리가 생기거나 꼬이지 않는다.
// 팽팽함(config.js의 CURVE_TENSION)만큼 경유점에서의 휘는 기세를 줄여서, 곡선이 바깥으로 덜 부풀게 한다.
// 선로를 그리는 곳, 길이·공사비, 열차 달리기, 승강장 방향이 모두 이 모양을 쓴다.
import { CURVE_SAMPLE_M, CURVE_TENSION } from '../config.js';

// 같은 모양을 여러 번 계산하지 않게 기억해 둔다 (그리기·수요 계산이 같은 선로를 자주 묻는다)
const remembered = new Map();
const REMEMBER_LIMIT = 2000;

// points: 출발역 → 경유점들 → 도착역 [경도, 위도], curve: 곡선인지
// 결과: 실제 선로가 지나는 점들 (직선이면 points 그대로, 곡선이면 촘촘한 점들)
export function shapeCoords(points, curve) {
  if (!curve || points.length < 3) return points;
  const key = points.map(([lng, lat]) => `${lng.toFixed(7)},${lat.toFixed(7)}`).join(';');
  let coords = remembered.get(key);
  if (!coords) {
    if (remembered.size >= REMEMBER_LIMIT) remembered.clear();
    coords = curveSegments(points).flat();
    coords.push(points.at(-1));
    remembered.set(key, coords);
  }
  return coords;
}

// 곡선을 경유점 사이 조각으로 나눈 것: [[조각 시작점, …중간 점들], …] (조각 끝점은 다음 조각의 시작점)
// 경유점 손잡이 사이의 "가운데 점"을 곡선 위에 놓을 때도 쓴다
export function curveSegments(points) {
  // 경도·위도를 첫 점 기준 미터 평면으로 바꿔서 계산한다 (도시 하나 크기면 지구가 둥근 건 무시해도 된다)
  const [lng0, lat0] = points[0];
  const metersPerLng = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const metersPerLat = 110540;
  const p = points.map(([lng, lat]) => [(lng - lng0) * metersPerLng, (lat - lat0) * metersPerLat]);
  const back = ([x, y]) => [lng0 + x / metersPerLng, lat0 + y / metersPerLat];
  // 양 끝 바깥에 가상의 점을 하나씩 둔다 (끝 조각도 곡선 공식을 쓸 수 있게, 역에서는 곧게 나가도록)
  const ext = [mirror(p[1], p[0]), ...p, mirror(p.at(-2), p.at(-1))];

  const segments = [];
  for (let i = 1; i < ext.length - 2; i++) {
    const [a, b, c, d] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]];
    const steps = Math.min(60, Math.max(4, Math.ceil(gap(b, c) / CURVE_SAMPLE_M)));
    const segment = [];
    for (let s = 0; s < steps; s++) segment.push(back(catmullRom(a, b, c, d, s / steps)));
    segments.push(segment);
  }
  return segments;
}

// 구심(alpha 0.5) 캣멀-롬: b에서 c까지, u는 0~1
// b·c에서 나가는 방향과 기세(접선)를 구심 캣멀-롬 그대로 구한 뒤, 팽팽함만큼 줄여서 이어 그린다 (에르미트 곡선).
// 팽팽함 0이면 구심 캣멀-롬과 똑같고, 1이면 경유점을 잇는 직선과 같다
function catmullRom(a, b, c, d, u) {
  const t1 = knot(a, b);
  const t2 = t1 + knot(b, c);
  const t3 = t2 + knot(c, d);
  const span = t2 - t1;
  const keep = 1 - CURVE_TENSION;
  // b와 c에서의 접선 (한 조각을 u 0~1로 달릴 때 기준)
  const tangentAt = (p, q, r, tp, tq, tr) =>
    [0, 1].map(
      (k) => span * keep * ((q[k] - p[k]) / (tq - tp) - (r[k] - p[k]) / (tr - tp) + (r[k] - q[k]) / (tr - tq)),
    );
  const mb = tangentAt(a, b, c, 0, t1, t2);
  const mc = tangentAt(b, c, d, t1, t2, t3);
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return [0, 1].map((k) => h00 * b[k] + h10 * mb[k] + h01 * c[k] + h11 * mc[k]);
}

// 점 사이 거리의 제곱근 (구심 곡선의 간격). 겹친 점에서 0으로 나누지 않게 아주 작은 값을 둔다
const knot = (p, q) => Math.max(Math.sqrt(gap(p, q)), 1e-3);
const gap = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
// q를 기준으로 p를 반대쪽으로 옮긴 점
const mirror = (p, q) => [2 * q[0] - p[0], 2 * q[1] - p[1]];
