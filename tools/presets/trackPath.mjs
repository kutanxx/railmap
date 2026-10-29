// 실제 노선망 프리셋의 선로 모양: 노선 자료의 선로 길을 역 사이마다 잘라 경유점으로 (tools/make-presets.mjs가 부른다)
import { meters, round6 } from './osm.mjs';

// 선로 모양: 실제 선로에서 이만큼(미터)보다 덜 벗어나는 점은 뺀다 (작을수록 정확하지만 경유점이 많아진다)
const SIMPLIFY_M = 12;
// 역에서 이만큼(미터) 안의 경유점은 뺀다 (역 자리를 여러 노선의 가운데로 옮겨서, 역 바로 옆에서 꺾이지 않게)
const STATION_CLEAR_M = 60;
// 정류 위치가 선로 길에서 이만큼(미터) 넘게 떨어지면 그 노선은 곧은 선로로 둔다 (자료가 어긋난 곳)
export const SNAP_MAX_M = 250;

// 계통의 선로 조각(way)들을 이어 한 줄로: [[경도, 위도], …]. 조각이 끊긴 곳도 가까운 끝끼리 그대로 잇는다
export function routePath(relation, ways) {
  const pieces = relation.members
    .filter((member) => member.type === 'way' && !/platform/.test(member.role))
    .map((member) => ways.get(member.ref)?.geometry?.map(({ lon, lat }) => [lon, lat]))
    .filter((coords) => coords && coords.length >= 2);
  if (pieces.length === 0) return null;
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  // 첫 조각의 방향: 다음 조각과 맞닿는 끝이 뒤로 가게
  let path = [...pieces[0]];
  if (pieces[1] && (same(path[0], pieces[1][0]) || same(path[0], pieces[1].at(-1)))) path.reverse();
  for (const piece of pieces.slice(1)) {
    const end = path.at(-1);
    let next = piece;
    if (same(end, piece.at(-1)) || (!same(end, piece[0]) && meters(end, piece.at(-1)) < meters(end, piece[0]))) {
      next = [...piece].reverse();
    }
    path = path.concat(same(end, next[0]) ? next.slice(1) : next);
  }
  return path;
}

// 정류 위치들을 선로 길 위의 자리로: 차례대로 앞으로만 나아가며 가장 가까운 곳 ({ index: 조각 번호, t: 조각 안 비율, gap: 떨어진 거리 m })
export function snapStops(path, coords) {
  const result = [];
  let from = 0;
  for (const coord of coords) {
    let best = null;
    for (let i = from; i + 1 < path.length; i++) {
      const [a, b] = [path[i], path[i + 1]];
      const scale = Math.cos((coord[1] * Math.PI) / 180);
      const ax = (a[0] - coord[0]) * scale;
      const ay = a[1] - coord[1];
      const dx = (b[0] - a[0]) * scale;
      const dy = b[1] - a[1];
      const length = dx * dx + dy * dy;
      const t = length > 0 ? Math.min(1, Math.max(0, -(ax * dx + ay * dy) / length)) : 0;
      const gap = meters(coord, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      if (!best || gap < best.gap) best = { index: i, t, gap };
      // 가까운 곳을 찾은 뒤 멀리 벗어나면 그만 본다 (고리 노선이 나중에 다시 지나가는 곳을 잡지 않게)
      if (best.gap < SNAP_MAX_M && gap > best.gap + 2000) break;
    }
    if (!best) return null;
    result.push(best);
    from = best.index;
  }
  return result;
}

const pointAt = (path, { index, t }) => {
  const [a, b] = [path[index], path[index + 1] ?? path[index]];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};

// 더글러스-퍼커: 직선에서 tolerance(m)보다 덜 벗어나는 점을 뺀다
function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const [first, last] = [points[0], points.at(-1)];
  let farthest = 0;
  let at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const gap = distanceToSegment(points[i], first, last);
    if (gap > farthest) {
      farthest = gap;
      at = i;
    }
  }
  if (farthest <= tolerance) return [first, last];
  return simplify(points.slice(0, at + 1), tolerance).slice(0, -1).concat(simplify(points.slice(at), tolerance));
}
function distanceToSegment(point, a, b) {
  const scale = Math.cos((point[1] * Math.PI) / 180);
  const dx = (b[0] - a[0]) * scale;
  const dy = b[1] - a[1];
  const px = (point[0] - a[0]) * scale;
  const py = point[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length > 0 ? Math.min(1, Math.max(0, (px * dx + py * dy) / length)) : 0;
  return meters(point, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
}

// 두 정류 위치 사이 선로 길의 경유점 (역 자리 fromCoord·toCoord 가까운 점은 빼고). 길이 이상하면 null (곧은 선로)
export function waypointsBetween(path, start, end, fromCoord, toCoord) {
  if (!path || start.gap > SNAP_MAX_M || end.gap > SNAP_MAX_M) return null;
  if (end.index < start.index || (end.index === start.index && end.t < start.t)) return null;
  const points = [pointAt(path, start), ...path.slice(start.index + 1, end.index + 1), pointAt(path, end)];
  let length = 0;
  for (let i = 1; i < points.length; i++) length += meters(points[i - 1], points[i]);
  const straight = meters(fromCoord, toCoord);
  // 선로 길이가 곧은 거리의 2.5배를 넘으면 자료가 어긋난 것으로 본다 (끊긴 조각을 잘못 이었을 때)
  if (length > straight * 2.5 + 300) return null;
  return simplify(points, SIMPLIFY_M)
    .slice(1, -1)
    .filter((point) => meters(point, fromCoord) > STATION_CLEAR_M && meters(point, toCoord) > STATION_CLEAR_M)
    .map(([lng, lat]) => [round6(lng), round6(lat)]);
}
