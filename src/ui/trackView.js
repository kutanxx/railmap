// 선로 그리기: 게임 상태와 화면 상태를 읽어 선로 레이어(map/trackLayers.js)에 넘긴다.
// - 끌어서 고치는 중인 경유점·역은 그 모양대로
// - 가운데 줄은 노선 색, 혼잡도 보기를 켜면 구간 혼잡도 색과 굵기 (넘친 구간은 "128%" 글자도)
// - 삭제 버튼에 마우스를 올렸으면 함께 사라질 선로·노선을 빨갛게
// - 땅 높이가 있는 가상 지도면 터널 구간을 점선으로
import { CROWDED_WARNING } from '../config.js';
import { updateTracks, LOAD_COLORS } from '../map/trackLayers.js';
import { getState, findStation, routeTracks } from '../game/state.js';
import { removalPreview } from '../game/build.js';
import { getEconomy } from '../game/demand.js';
import { routeColors, highlightedTracks } from './views.js';
import { hasTerrain } from '../game/terrain.js';
import { trackProfile } from '../game/trackProfile.js';

// 선로 id → { key: 선로 모양, tunnels }. 모양이 그대로면 높이 분석을 다시 하지 않는다 (끄는 동안 매번 부르므로)
const tunnelCache = new Map();

// 선로 모양(coords)의 터널 구간들 [[[경도, 위도], …], …]
function tunnelsOf(id, coords) {
  const key = JSON.stringify(coords);
  const cached = tunnelCache.get(id);
  if (cached?.key === key) return cached.tunnels;
  const { points, type } = trackProfile(coords);
  const tunnels = [];
  let run = null;
  type.forEach((kind, i) => {
    if (kind === 'tunnel') {
      run ??= i > 0 ? [points[i - 1]] : [];
      run.push(points[i]);
    } else if (run) {
      run.push(points[i]);
      tunnels.push(run);
      run = null;
    }
  });
  if (run) tunnels.push(run);
  tunnelCache.set(id, { key, tunnels });
  return tunnels;
}

// ui: app.js의 화면 상태, shownCoord(역): 끌고 있는 역이면 끄는 자리, 아니면 역 자리
export function drawTracks(map, ui, shownCoord) {
  const { tracks, routes } = getState();
  const { trackColor } = routeColors(routes);
  // 혼잡도 보기를 켜면 가운데 줄을 노선 색 대신 구간 혼잡도 단계로 (열차가 다니지 않는 선로는 칠하지 않는다)
  const { trackLoad } = getEconomy();
  const loadLevel = (track) => {
    if (!ui.congestion) return null;
    const load = trackLoad.get(track.id);
    if (load === undefined) return null;
    if (load > 1) return 'over';
    return load >= CROWDED_WARNING ? 'busy' : 'ok';
  };
  const centerColor = (track, level) => (level ? LOAD_COLORS[level] : (trackColor.get(track.id) ?? null));
  const preview = ui.trackPreview;
  const coordsOf = (track) => [
    shownCoord(findStation(track.from)),
    ...(preview?.id === track.id ? preview.waypoints : track.waypoints),
    shownCoord(findStation(track.to)),
  ];
  // 지우기 미리보기: 함께 지워질 선로는 'gone', 사라질 노선이 지나는 선로는 'route'
  const removing = new Map();
  if (ui.removing) {
    const { trackIds, routes: lostRoutes } = removalPreview(ui.removing);
    for (const route of lostRoutes) {
      for (const track of routeTracks(route)) if (track) removing.set(track.id, 'route');
    }
    for (const id of trackIds) removing.set(id, 'gone');
  }
  updateTracks(
    map,
    tracks.map((track) => {
      const coords = coordsOf(track);
      const level = loadLevel(track);
      return {
        id: track.id,
        coords,
        routeColor: centerColor(track, level),
        load: level,
        loadLabel: level === 'over' ? `${Math.round(trackLoad.get(track.id) * 100)}%` : '',
        removing: removing.get(track.id) ?? null,
        tunnels: hasTerrain() ? tunnelsOf(track.id, coords) : [],
      };
    }),
    highlightedTracks(ui.selected),
  );
}
