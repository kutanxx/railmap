// 역 모양 정하기: 승강장 방향, 환승역·종착역.
// 게임 상태를 고치지 않고, 지금 역·선로·노선을 보고 그때그때 계산한다.
// 그래서 선로를 깔거나 옮기거나 되돌려도 늘 맞는 모양이 나온다.
import { bearing } from '@turf/turf';

// 역이 "자동 방향"인지. 예전 저장 파일(값 없음)은 방향을 손대지 않았으면(0) 자동으로 본다
export const isAutoAngle = (station) => station.autoAngle ?? station.angle === 0;

// 결과: Map(역 id → { angle: 승강장 방향(도, 0 = 가로), transfer: 환승역인지, tag: '환승' | '종착' | '' })
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
    const auto = isAutoAngle(station) ? trackAngle(station, tracks, coordOf) : null;
    shapes.set(station.id, { angle: auto ?? station.angle, transfer, tag });
  }
  return shapes;
}

// 이어진 선로들이 역에서 뻗어 나가는 방향으로 승강장 방향을 정한다. 선로가 없으면 null
// 승강장은 앞뒤가 같으므로(0도와 180도가 같은 방향) 각도를 두 배로 해서 평균을 낸다
// 예) 동쪽과 서쪽으로 선로가 나가면 → 가로, 북쪽 하나만 있으면 → 세로
function trackAngle(station, tracks, coordOf) {
  let x = 0;
  let y = 0;
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
  }
  if (x === 0 && y === 0) return null;
  const angle = (Math.atan2(y, x) * 180) / Math.PI / 2;
  // 0~180도로 맞추고, 소수 첫째 자리에서 반올림한다 (179.99도처럼 거의 가로인 값을 0도로)
  return (Math.round(angle * 10) / 10 + 180) % 180;
}
