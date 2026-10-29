// 링크로 공유하기: 지금 노선망을 주소 뒤 # 에 압축해 넣고, 받은 주소에서 다시 꺼낸다 (서버 없이, 주소 안에 다 들어 있다).
// # 뒤는 서버로 보내지지 않아서 웹 데모(GitHub Pages)에서도 그대로 쓸 수 있다.
// 짧게 하려고 역 주변 건물 칸(cells)과 통계 기록은 빼고, 역·선로·노선을 이름 없는 배열로 적는다 (compactShare).
// 받는 쪽은 저장된 역 인구를 그대로 쓴다 (catchment.js). 예전 링크(저장 모양 그대로의 JSON)도 읽는다.
// 압축은 브라우저에 들어 있는 CompressionStream('deflate-raw')을 쓴다 (라이브러리 없음).
// 받은 노선망은 그 지도의 샌드박스로 연다 (main.js, ui/shareLink.js).
import { REGIONS } from '../regions.js';
import { saveData, SAVE_VERSION } from './save.js';

// 주소에서 공유 자료를 찾는 이름: …/#share=압축한글자
const HASH_KEY = 'share';

// 짧은 공유 모양의 형식 번호 (배열 맨 앞). 예전 링크는 배열이 아니라 저장 모양 그대로다
const COMPACT_VERSION = 2;
// 좌표를 정수로 적는 배율 (소수 5자리, 약 1m)
const COORD_SCALE = 1e5;

// 지금 게임을 짧은 공유 모양으로: [2, 지도 id, [년, 월], [다음 역·선로·노선 번호], 역들, 선로들, 노선들]
// - 역 [이름, Δ경도, Δ위도, 인구, 방향]
// - 선로 [출발 역 순서, 도착 역 순서, [Δ경도, Δ위도, …](경유점), 표시(곡선 1 + 계획 2)]
// - 노선 [노선 번호, 이름, 색, 열차 수, 광역급행이면 1, [역 순서, …]]
// 좌표는 바로 앞 좌표와의 차이를 정수(COORD_SCALE배)로 적는다 (역들, 그다음 선로 경유점들 차례로).
// 역·선로 id 대신 목록 순서를 쓴다 (노선은 번호가 배지에 보여서 그대로). 건물 칸·통계·이룬 목표·건물 면적은 뺀다.
// 서울 실제 노선망(역 320곳) 링크가 약 2.5만 → 1.4만 글자로 줄었다
export function compactShare() {
  const { region, year, month, network } = saveData();
  const order = new Map(network.stations.map((station, i) => [station.id, i]));
  let last = [0, 0];
  const step = ([lng, lat]) => {
    const point = [Math.round(lng * COORD_SCALE), Math.round(lat * COORD_SCALE)];
    const change = [point[0] - last[0], point[1] - last[1]];
    last = point;
    return change;
  };
  return [
    COMPACT_VERSION,
    region,
    [year, month],
    [network.nextStationNumber, network.nextTrackNumber, network.nextRouteNumber],
    network.stations.map((station) => [station.name, ...step(station.coord), station.population, station.angle ?? 0]),
    network.tracks.map((track) => [
      order.get(track.from),
      order.get(track.to),
      track.waypoints.flatMap(step),
      (track.curve ? 1 : 0) + (track.planned ? 2 : 0),
    ]),
    network.routes.map((route) => [
      Number(route.id.slice(1)),
      route.name,
      route.color,
      route.trainCount,
      route.kind === 'express' ? 1 : 0,
      route.stations.map((id) => order.get(id)),
    ]),
  ];
}

// 짧은 공유 모양을 게임 저장 모양으로 되돌린다 (역·선로 id는 s1·t1부터 차례로 새로 붙인다)
function expandShare([, region, [year, month], [nextStation, nextTrack, nextRoute], stations, tracks, routes]) {
  let last = [0, 0];
  const point = (dx, dy) => {
    last = [last[0] + dx, last[1] + dy];
    return [last[0] / COORD_SCALE, last[1] / COORD_SCALE];
  };
  const stationId = (i) => `s${i + 1}`;
  return {
    version: SAVE_VERSION,
    region,
    network: {
      stations: stations.map(([name, dx, dy, population, angle], i) => ({
        id: stationId(i),
        name,
        coord: point(dx, dy),
        angle,
        population,
      })),
      tracks: tracks.map(([from, to, steps, flags], i) => {
        const waypoints = [];
        for (let k = 0; k + 1 < steps.length; k += 2) waypoints.push(point(steps[k], steps[k + 1]));
        const track = { id: `t${i + 1}`, from: stationId(from), to: stationId(to), waypoints, curve: (flags & 1) === 1 };
        if (flags & 2) track.planned = true;
        return track;
      }),
      routes: routes.map(([number, name, color, trainCount, express, order]) => {
        const route = { id: `r${number}`, name, color, stations: order.map(stationId), trainCount };
        if (express) route.kind = 'express';
        return route;
      }),
      nextStationNumber: Math.max(nextStation, stations.length + 1),
      nextTrackNumber: Math.max(nextTrack, tracks.length + 1),
      nextRouteNumber: nextRoute,
      money: REGIONS[region].startMoney,
    },
    speed: 0,
    elapsedSeconds: 0,
    year,
    month,
    monthProgress: 0,
    lastSettlement: null,
    monthlyRecords: [],
    monthsOverDebtLimit: 0,
    bankrupt: false,
    achievedGoals: [],
    savedAt: 0,
  };
}

// 공유 링크: 지금 주소 + #share=… (결과: Promise<글자>)
export async function shareLink() {
  const bytes = await squeeze(new TextEncoder().encode(JSON.stringify(compactShare())), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#${HASH_KEY}=${toBase64Url(bytes)}`;
}

// 지금 주소에 공유된 노선망이 있으면 꺼낸다: 저장 모양(그 지도의 region이 들어 있다). 없으면 null.
// 글자가 잘렸거나 다른 게임 링크라 읽을 수 없으면 이유를 담은 에러를 던진다
export async function readSharedLink() {
  const match = location.hash.match(new RegExp(`^#${HASH_KEY}=([A-Za-z0-9_-]+)$`));
  if (!match) return null;
  // 글자가 잘려서 풀리지 않으면 브라우저 오류("Failed to fetch"처럼 알아듣기 어렵다) 대신 쉬운 이유로 바꿔 던진다
  const parsed = await squeeze(fromBase64Url(match[1]), new DecompressionStream('deflate-raw')).then(
    (bytes) => JSON.parse(new TextDecoder().decode(bytes)),
    () => {
      throw new Error('링크 글자가 잘렸거나 망가졌어요');
    },
  );
  // 짧은 모양(배열)이면 저장 모양으로 되돌린다. 배열 모양이 맞지 않으면 망가진 링크다
  let data = parsed;
  if (Array.isArray(parsed)) {
    if (parsed[0] !== COMPACT_VERSION || !REGIONS[parsed[1]]) throw new Error('레일맵 노선망 링크가 아니에요');
    try {
      data = expandShare(parsed);
    } catch {
      throw new Error('링크 글자가 잘렸거나 망가졌어요');
    }
  }
  if (!REGIONS[data?.region] || !Array.isArray(data?.network?.stations)) {
    throw new Error('레일맵 노선망 링크가 아니에요');
  }
  return data;
}

// 공유 자료를 주소에서 지운다 (열었거나 닫은 뒤. 새로 고쳐도 다시 묻지 않게)
export function clearSharedLink() {
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}

// 바이트를 압축·풀기 흐름에 통과시킨다
async function squeeze(bytes, stream) {
  const output = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

// 바이트 ↔ 주소에 넣어도 되는 글자 (base64url: + / = 대신 - _ 를 쓰고 끝의 = 를 뺀다)
function toBase64Url(bytes) {
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
