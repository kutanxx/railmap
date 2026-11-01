// 개통 연출: 철도망이 바뀐 순간에 바로 붙는 작은 움직임 (화면 흔들림·번쩍임 없이 줄만 움직인다).
// - 노선을 만들면(다시 하기 포함) 그 노선 색 줄이 첫 역에서 끝 역까지 그려진다. 노선에 역을 끼워 넣으면 새 구간만
// - 지우거나 되돌려서 없어진 선로는 끝에서부터 거둬지고, 없어진 노선·구간은 노선 색이 끝에서부터 빠진다
// 무엇이 바뀌었는지는 짓기 기록(game/buildLog.js)의 마지막 장면을 읽는다. 불러오기·새로 시작은 기록이 통째로 바뀌므로 연출하지 않는다.
// 컴퓨터에서 "움직임 줄이기"를 켰거나 한 번에 많이 바뀌면(LINE_SWEEP_MAX_ITEMS) 연출하지 않는다.
import { LINE_SWEEP_GROW_MS, LINE_SWEEP_SHRINK_MS, LINE_SWEEP_MAX_ITEMS } from '../config.js';
import { getState, subscribe } from '../game/state.js';
import { networkShapes, applyEntry, loggedTrackCoords } from '../game/buildLog.js';
import { METERS_PER_DEGREE_LAT, metersPerDegreeLng } from '../game/earth.js';
import { showSweep } from '../map/sweepLayers.js';

// 없어진 선로를 거둘 때 몸통 색 (낮 / 관제실, map/trackLayers.js·theme.js의 선로 몸통과 같다)
const RAIL = { day: '#3E4651', control: '#8C98A5' };

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// 두 점 사이 거리 (m, 평면 어림)
function distance([lng1, lat1], [lng2, lat2]) {
  const dx = (lng2 - lng1) * metersPerDegreeLng((lat1 + lat2) / 2);
  const dy = (lat2 - lat1) * METERS_PER_DEGREE_LAT;
  return Math.hypot(dx, dy);
}

// 줄들을 처음부터 length(m)만큼만 자른다 (줄들은 차례로 이어 그린다)
function cut(lines, length) {
  const result = [];
  let left = length;
  for (const coords of lines) {
    const part = [coords[0]];
    for (let i = 1; i < coords.length; i++) {
      const step = distance(coords[i - 1], coords[i]);
      if (step >= left) {
        const t = step === 0 ? 0 : left / step;
        const [a, b] = [coords[i - 1], coords[i]];
        part.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        if (part.length > 1) result.push(part);
        return result;
      }
      left -= step;
      part.push(coords[i]);
    }
    result.push(part);
  }
  return result;
}

const totalLength = (lines) =>
  lines.reduce((sum, coords) => sum + coords.slice(1).reduce((s, point, i) => s + distance(coords[i], point), 0), 0);

// 노선의 역 순서에서 고른 구간들(pairs: 몇 번째 역부터인지)의 선로 좌표를 노선 방향으로
function routeLines(stationIds, indices, shapes) {
  const trackBetween = new Map([...shapes.tracks.values()].map((track) => [pairKey(track[1], track[2]), track]));
  const lines = [];
  for (const i of indices) {
    const [a, b] = [stationIds[i], stationIds[i + 1]];
    const track = trackBetween.get(pairKey(a, b));
    const coords = track && loggedTrackCoords(track, shapes.stations);
    if (!coords) continue;
    lines.push(track[1] === a ? coords : [...coords].reverse());
  }
  return lines;
}

// 노선의 이웃한 역 짝 → 몇 번째 역부터인지
const routePairs = (stationIds) => new Map(stationIds.slice(1).map((id, i) => [pairKey(stationIds[i], id), i]));

// map: 지도, controlRoom(): 관제실 모드인지 (app.js)
export function startLineSweep(map, controlRoom) {
  let seenLog = getState().buildLog;
  let lastEntry = seenLog.at(-1);
  let shapes = networkShapes(); // 마지막 장면까지 적용한 모양 (없어진 것의 모양을 알기 위해)
  let active = []; // 움직이는 중인 줄 묶음 { lines, length, color, kind, grow, start, duration }
  let frame = null;

  subscribe((state, kind) => {
    if (kind !== 'network') return;
    const log = state.buildLog;
    // 불러오기·새로 시작: 기록이 통째로 바뀌었으니 지금 모양만 기억하고 연출하지 않는다
    if (log !== seenLog) {
      seenLog = log;
      lastEntry = log.at(-1);
      shapes = networkShapes();
      return;
    }
    const entry = log.at(-1);
    if (!entry || entry === lastEntry) return;
    lastEntry = entry;
    const items = changedLines(entry);
    if (items.length > 0 && items.length <= LINE_SWEEP_MAX_ITEMS && !reducedMotion()) {
      const start = performance.now();
      active.push(
        ...items.map((item) => ({
          ...item,
          length: totalLength(item.lines),
          start,
          duration: item.grow ? LINE_SWEEP_GROW_MS : LINE_SWEEP_SHRINK_MS,
        })),
      );
      if (frame === null) frame = requestAnimationFrame(draw);
    }
  });

  // 장면 하나에서 움직일 줄들 (shapes를 장면 뒤 모양으로 바꾼다)
  function changedLines(entry) {
    const items = [];
    const rail = controlRoom() ? RAIL.control : RAIL.day;
    // 없어진 선로 (모양만 바뀐 선로는 add에 같은 id로 들어오므로 빼지 않는다)
    for (const id of entry.remove.tracks) {
      const coords = loggedTrackCoords(shapes.tracks.get(id), shapes.stations);
      if (coords) items.push({ lines: [coords], color: rail, kind: 'track', grow: false });
    }
    // 없어진 노선과 노선에서 빠진 구간 (바뀌기 전 모양으로)
    const after = new Map(entry.add.routes.map((route) => [route[0], route]));
    for (const id of [...entry.remove.routes, ...after.keys()]) {
      const old = shapes.routes.get(id);
      if (!old) continue;
      const kept = after.has(id) ? routePairs(after.get(id)[2]) : new Map();
      const gone = [...routePairs(old[2])].filter(([key]) => !kept.has(key)).map(([, i]) => i);
      const lines = routeLines(old[2], gone, shapes);
      if (lines.length) items.push({ lines, color: old[1], kind: 'route', grow: false });
    }
    // 바뀌기 전 노선마다 있던 구간 (아래 applyEntry가 shapes를 바꾸기 전에)
    const hadPairs = new Map(
      [...after.keys()].map((id) => [id, shapes.routes.has(id) ? routePairs(shapes.routes.get(id)[2]) : new Map()]),
    );
    applyEntry(shapes, entry);
    // 새 노선과 노선에 새로 생긴 구간 (바뀐 뒤 모양으로, 첫 역에서 끝 역 쪽으로)
    for (const [id, route] of after) {
      const had = hadPairs.get(id);
      const added = [...routePairs(route[2])].filter(([key]) => !had.has(key)).map(([, i]) => i);
      const lines = routeLines(route[2], added, shapes);
      if (lines.length) items.push({ lines, color: route[1], kind: 'route', grow: true });
    }
    return items;
  }

  function draw(now) {
    const lines = [];
    active = active.filter((item) => now - item.start < item.duration);
    for (const item of active) {
      const t = easeInOut(Math.min(1, (now - item.start) / item.duration));
      const shown = item.length * (item.grow ? t : 1 - t);
      for (const coords of cut(item.lines, shown)) lines.push({ coords, color: item.color, kind: item.kind });
    }
    showSweep(map, lines);
    frame = active.length > 0 ? requestAnimationFrame(draw) : null;
  }
}
