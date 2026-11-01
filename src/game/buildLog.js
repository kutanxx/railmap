// 짓기 기록: 철도망이 바뀔 때마다 바뀐 것(새로 생긴·없어진·모양이 바뀐 역·선로·노선)만 그때 게임 날짜와 함께 적는다.
// 노선망이 자라는 모습 다시 보기(ui/timelapse.js)가 이 기록을 처음부터 차례로 펼쳐 보여준다. 저장 파일에도 들어간다 (save.js).
// 지도에 그릴 모양만 적는다 (역 자리, 선로 모양, 노선 색·역 순서). 이름·열차 수·인구는 적지 않아서
// 이름만 바꾸거나 열차 수만 바꾸면 기록이 생기지 않는다. 되돌리기·다시 하기도 바뀐 그대로 적는다 (실제로 지어 온 순서).
// 예전 저장·실제 노선망·공유받은 노선망처럼 기록 없이 시작한 게임은 그때 있던 노선망을 첫 장면(before: 기록 전부터)으로 적는다.
//
// 장면 하나 = { year, month, before?: 기록 전부터 있던 것인지,
//              add: { stations: [[id, 경도, 위도, (개통 연도)]], tracks: [[id, 출발역 id, 도착역 id, [경도, 위도, …](경유점), 곡선 1·계획 2, (개통 연도)]],
//                     (개통 연도: 타임머신이 쓰는 실제 노선망의 opened. 있을 때만 적는다, game/timeMachine.js)
//                     routes: [[id, 색, [역 id, …], ([이웃한 역 짝마다 그 노선이 다니기 시작한 해])]] },  (모양이 바뀐 것도 add에 새 모양으로)
//              remove: { stations: [id], tracks: [id], routes: [id] } }
import { BUILD_LOG_MAX_ENTRIES } from '../config.js';
import { getState, subscribe } from './state.js';
import { shapeCoords } from './trackShape.js';

const KINDS = ['stations', 'tracks', 'routes'];
const round5 = (value) => Math.round(value * 1e5) / 1e5;

// 지도에 그릴 모양만 짧게 (장면에 적는 모양과 같다)
const shapeOf = {
  stations: (station) => [
    station.id,
    round5(station.coord[0]),
    round5(station.coord[1]),
    ...(station.opened !== undefined ? [station.opened] : []),
  ],
  tracks: (track) => [
    track.id,
    track.from,
    track.to,
    track.waypoints.flatMap(([lng, lat]) => [round5(lng), round5(lat)]),
    (track.curve ? 1 : 0) + (track.planned ? 2 : 0),
    ...(track.opened !== undefined ? [track.opened] : []),
  ],
  routes: (route) => [route.id, route.color, [...route.stations], ...(route.opened ? [[...route.opened]] : [])],
};

// 지금 철도망의 짧은 모양: { stations: Map(id → 모양), tracks, routes } (장면에 적는 모양과 같다. 개통 연출 ui/lineSweep.js가 쓴다)
export function networkShapes() {
  const state = getState();
  return Object.fromEntries(KINDS.map((kind) => [kind, new Map(state[kind].map((item) => [item.id, shapeOf[kind](item)]))]));
}

// 짧은 모양들(shapes)에 장면 하나를 적용한다 (없어진 것을 빼고 새 모양을 넣는다)
export function applyEntry(shapes, entry) {
  for (const kind of KINDS) {
    for (const id of entry.remove[kind]) shapes[kind].delete(id);
    for (const item of entry.add[kind]) shapes[kind].set(item[0], item);
  }
}

// 짧은 모양의 선로가 지나는 좌표들 (stations: 역 id → 짧은 모양). 양 끝 역을 모르면 null
export function loggedTrackCoords(track, stations) {
  const [, from, to, steps, flags] = track;
  if (!stations.has(from) || !stations.has(to)) return null;
  const at = (id) => stations.get(id).slice(1, 3);
  const waypoints = [];
  for (let i = 0; i + 1 < steps.length; i += 2) waypoints.push([steps[i], steps[i + 1]]);
  return shapeCoords([at(from), ...waypoints, at(to)], (flags & 1) === 1);
}

// 지금 철도망의 모양: { stations: Map(id → 모양 글자), … } (바뀌었는지 글자로 견준다)
function snapshot() {
  const state = getState();
  const result = {};
  for (const kind of KINDS) {
    result[kind] = new Map(state[kind].map((item) => [item.id, JSON.stringify(shapeOf[kind](item))]));
  }
  return result;
}

let last = null; // 마지막으로 적은 뒤의 모양 (snapshot)

// 지금 모양을 기준으로 삼는다. log가 없으면 새로 시작하고, 노선망이 이미 있으면 그것을 첫 장면(기록 전부터)으로 적는다.
// 불러오기·새로 시작할 때 save.js가 부른다 (불러온 노선망 전체를 "방금 지은 것"으로 적지 않게)
export function resetBuildLog(log) {
  const state = getState();
  last = snapshot();
  if (Array.isArray(log)) {
    state.buildLog = log;
    return;
  }
  state.buildLog = [];
  const entry = entryBetween(emptySnapshot(), last);
  if (entry) state.buildLog.push({ ...entry, before: true });
}

// 철도망이 바뀌면 바뀐 것을 적는다 (app.js가 게임을 시작할 때 한 번 부른다)
export function startBuildLog() {
  if (!last) last = snapshot();
  subscribe((state, kind) => {
    if (kind !== 'network') return;
    const now = snapshot();
    const entry = entryBetween(last, now);
    last = now;
    if (!entry) return;
    state.buildLog.push(entry);
    // 너무 길어지면 맨 앞 두 장면을 하나로 합친다 (저장 파일이 끝없이 커지지 않게. 오래된 순서는 조금 뭉개진다)
    while (state.buildLog.length > BUILD_LOG_MAX_ENTRIES) {
      state.buildLog.splice(0, 2, mergeEntries(state.buildLog[0], state.buildLog[1]));
    }
  });
}

const emptySnapshot = () => Object.fromEntries(KINDS.map((kind) => [kind, new Map()]));

// 두 모양 사이에 바뀐 것: 장면 하나, 바뀐 것이 없으면 null
function entryBetween(before, after) {
  const add = {};
  const remove = {};
  let changed = false;
  for (const kind of KINDS) {
    add[kind] = [];
    remove[kind] = [];
    for (const [id, text] of after[kind]) {
      if (before[kind].get(id) !== text) add[kind].push(JSON.parse(text));
    }
    for (const id of before[kind].keys()) if (!after[kind].has(id)) remove[kind].push(id);
    if (add[kind].length || remove[kind].length) changed = true;
  }
  if (!changed) return null;
  const { year, month } = getState();
  return { year, month, add, remove };
}

// 이어진 두 장면을 하나로 (앞 장면의 날짜를 쓴다)
function mergeEntries(first, second) {
  const merged = { year: first.year, month: first.month, add: {}, remove: {} };
  if (first.before) merged.before = true;
  for (const kind of KINDS) {
    const added = new Map(first.add[kind].map((item) => [item[0], item]));
    const removed = new Set(first.remove[kind]);
    for (const id of second.remove[kind]) {
      if (added.has(id)) added.delete(id);
      else removed.add(id);
    }
    for (const item of second.add[kind]) {
      added.set(item[0], item);
      removed.delete(item[0]);
    }
    merged.add[kind] = [...added.values()];
    merged.remove[kind] = [...removed];
  }
  return merged;
}

// 기록을 처음부터 펼친 장면들: [{ year, month, before, history, stations: Map, tracks: Map, routes: Map }]
// (Map은 id → 짧은 모양. 다시 보기가 장면마다 지도에 그린다)
// 기록 전부터 있던 노선망(실제 노선망 등)은 한꺼번에 나타나지 않게 펼친다: 개통 연도가 적혀 있으면(서울 실제 노선망)
// 실제 개통한 해마다 한 장면(history: 그해, month 없음), 아니면 노선 하나씩
export function buildLogFrames(log = getState().buildLog) {
  const current = Object.fromEntries(KINDS.map((kind) => [kind, new Map()]));
  return log.flatMap((entry) => {
    applyEntry(current, entry);
    const frame = {
      year: entry.year,
      month: entry.month,
      before: Boolean(entry.before),
      stations: new Map(current.stations),
      tracks: new Map(current.tracks),
      routes: new Map(current.routes),
    };
    if (!frame.before) return [frame];
    return [...frame.stations.values()].some((station) => station[3] !== undefined) ? yearByYear(frame) : routeByRoute(frame);
  });
}

// 장면 하나를 실제 개통한 해마다 한 장면씩: 그해까지 개통한 역·선로 (개통 연도가 없는 것은 처음부터 있던 것으로).
// 노선은 그해 선로를 하나라도 지나는 것만 (역·노선 수 글에 쓴다. 선로 색은 그해 선로만 그리므로 맞다)
function yearByYear(frame) {
  const openedBy = (opened, year) => opened === undefined || opened <= year;
  const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const years = [...new Set([...frame.tracks.values()].map((track) => track[5]).filter((year) => year !== undefined))];
  return years
    .sort((a, b) => a - b)
    .map((year) => {
      const tracks = new Map([...frame.tracks].filter(([, track]) => openedBy(track[5], year)));
      const pairs = new Set([...tracks.values()].map((track) => pairKey(track[1], track[2])));
      // 노선마다 다니기 시작한 해가 적혀 있으면(route[3]) 그것도 본다: 같은 선로를 나중에 같이 쓴 노선은 그때부터.
      // 플레이어가 역을 끼우거나 빼서 역 수와 맞지 않으면 쓰지 않는다
      const runs = (route) => {
        const opened = route[3]?.length === route[2].length - 1 ? route[3] : [];
        return route[2].some((id, i) => i > 0 && pairs.has(pairKey(route[2][i - 1], id)) && openedBy(opened[i - 1], year));
      };
      return {
        ...frame,
        before: false,
        history: true,
        year,
        month: null,
        stations: new Map([...frame.stations].filter(([, station]) => openedBy(station[3], year))),
        tracks,
        routes: new Map([...frame.routes].filter(([, route]) => runs(route))),
      };
    });
}

// 장면 하나를 노선마다 한 장면씩: 노선을 하나 더할 때마다 그 노선의 역과 역 사이 선로가 함께 생긴다.
// 노선이 지나지 않는 역·선로는 마지막 장면(원래 장면)에 나온다
function routeByRoute(frame) {
  const trackBetween = new Map([...frame.tracks.values()].map((track) => [[track[1], track[2]].sort().join('|'), track]));
  const shown = Object.fromEntries(KINDS.map((kind) => [kind, new Map()]));
  const frames = [];
  for (const route of frame.routes.values()) {
    const stations = route[2];
    for (const id of stations) if (frame.stations.has(id)) shown.stations.set(id, frame.stations.get(id));
    for (let i = 0; i + 1 < stations.length; i++) {
      const track = trackBetween.get([stations[i], stations[i + 1]].sort().join('|'));
      if (track) shown.tracks.set(track[0], track);
    }
    shown.routes.set(route[0], route);
    frames.push({ ...frame, ...Object.fromEntries(KINDS.map((kind) => [kind, new Map(shown[kind])])) });
  }
  if (shown.stations.size < frame.stations.size || shown.tracks.size < frame.tracks.size) frames.push(frame);
  return frames;
}
