// 역 모양 정하기: 승강장 방향, 환승역·종착역.
// 게임 상태를 고치지 않고, 지금 역·선로·노선을 보고 그때그때 계산한다.
// 그래서 선로를 깔거나 옮기거나 되돌려도 늘 맞는 모양이 나온다.
// 가까이서 보이는 띠·대합실 모양은 stationBands.js가 계산한다.
import { bearing } from '@turf/turf';

// 결과: Map(역 id → { angle: 승강장 방향(도, 0 = 가로), followsTrack: 선로 방향을 따르는지,
//                     aligned: 이어진 선로들이 모두 한 방향(한 줄)인지, 엇갈리면 false,
//                     transfer: 환승역인지, tag: '환승' | '종착' | '' })
// 선로가 이어진 역은 늘 선로 방향을 따른다. 선로가 없는 역만 직접 정한 방향(station.angle)을 쓴다
// stations: 화면에 보일 역들 (끌어서 옮기는 중이면 그 자리가 들어 있다)
export function stationShapes(stations, tracks, routes) {
  const coordOf = new Map(stations.map((station) => [station.id, station.coord]));

  // 역마다 지나는 노선 수와, 노선의 끝 역인지
  const routeCount = new Map();
  const isEnd = new Set();
  for (const route of routes) {
    for (const id of new Set(route.stations)) routeCount.set(id, (routeCount.get(id) ?? 0) + 1);
    isEnd.add(route.stations[0]);
    isEnd.add(route.stations[route.stations.length - 1]);
  }

  const shapes = new Map();
  for (const station of stations) {
    const transfer = (routeCount.get(station.id) ?? 0) >= 2;
    const tag = transfer ? '환승' : isEnd.has(station.id) ? '종착' : '';
    const followsTrack = tracks.some((track) => track.from === station.id || track.to === station.id);
    // 선로 방향이 딱 갈리지 않으면(예: 직각으로 두 선로) 정한 방향을 쓴다
    const fromTracks = followsTrack ? trackAngle(station, tracks, coordOf) : null;
    const angle = fromTracks?.angle ?? station.angle;
    const aligned = fromTracks?.aligned ?? true;
    shapes.set(station.id, { angle, followsTrack, aligned, transfer, tag });
  }
  return shapes;
}

// 이어진 선로들이 역에서 뻗어 나가는 방향으로 승강장 방향을 정한다
// 승강장은 앞뒤가 같으므로(0도와 180도가 같은 방향) 각도를 두 배로 해서 평균을 낸다
// 예) 동쪽과 서쪽으로 선로가 나가면 → 가로, 북쪽 하나만 있으면 → 세로
// 결과: { angle, aligned: 선로들이 모두 거의 한 방향인지 (엇갈려 지나가면 false) }.
//       방향이 서로 지워져 정할 수 없으면 (예: 십자로) angle은 null
function trackAngle(station, tracks, coordOf) {
  let x = 0;
  let y = 0;
  let count = 0;
  for (const track of tracks) {
    let next;
    if (track.from === station.id) next = track.waypoints[0] ?? coordOf.get(track.to);
    else if (track.to === station.id) next = track.waypoints.at(-1) ?? coordOf.get(track.from);
    else continue;
    // 나침반 방향(북쪽 0°, 시계 방향) → 승강장 각도(가로 0°, 시계 방향)
    const angle = bearing(station.coord, next) - 90;
    const doubled = (angle * 2 * Math.PI) / 180;
    x += Math.cos(doubled);
    y += Math.sin(doubled);
    count += 1;
  }
  // 모든 방향이 같으면 평균 길이가 1, 엇갈릴수록 작아진다. 0.9면 대략 ±13도 안쪽
  const aligned = count === 0 || Math.hypot(x, y) / count > ALIGNED_THRESHOLD;
  if (Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9) return { angle: null, aligned };
  const angle = (Math.atan2(y, x) * 180) / Math.PI / 2;
  // 0~180도로 맞추고, 소수 첫째 자리에서 반올림한다 (179.99도처럼 거의 가로인 값을 0도로)
  return { angle: (Math.round(angle * 10) / 10 + 180) % 180, aligned };
}

// 선로 방향들이 이만큼 모여 있으면 "한 방향"으로 본다 (두 배 각도 평균의 길이, 0~1)
const ALIGNED_THRESHOLD = 0.9;
