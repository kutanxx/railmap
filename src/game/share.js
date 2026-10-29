// 링크로 공유하기: 지금 노선망을 주소 뒤 # 에 압축해 넣고, 받은 주소에서 다시 꺼낸다 (서버 없이, 주소 안에 다 들어 있다).
// # 뒤는 서버로 보내지지 않아서 웹 데모(GitHub Pages)에서도 그대로 쓸 수 있다.
// 짧게 하려고 역 주변 건물 칸(cells)과 통계 기록은 뺀다. 받는 쪽은 저장된 역 인구를 그대로 쓴다 (catchment.js).
// 압축은 브라우저에 들어 있는 CompressionStream('deflate-raw')을 쓴다 (라이브러리 없음).
// 받은 노선망은 그 지도의 샌드박스로 연다 (main.js, ui/shareLink.js).
import { REGIONS } from '../regions.js';
import { saveData } from './save.js';

// 주소에서 공유 자료를 찾는 이름: …/#share=압축한글자
const HASH_KEY = 'share';

// 좌표는 소수 5자리(약 1m)로 줄인다
const round5 = (value) => Math.round(value * 1e5) / 1e5;
const roundCoord = (coord) => coord.map(round5);

// 지금 게임을 공유용 저장 모양으로 (건물 칸·통계 기록·이룬 목표는 빼고 좌표를 줄인다)
export function shareData() {
  const data = saveData();
  const { network } = data;
  return {
    ...data,
    monthlyRecords: [],
    achievedGoals: [],
    network: {
      ...network,
      stations: network.stations.map((station) => {
        const copy = { ...station, coord: roundCoord(station.coord) };
        delete copy.cells;
        delete copy.cellGrid;
        return copy;
      }),
      tracks: network.tracks.map((track) => ({ ...track, waypoints: track.waypoints.map(roundCoord) })),
    },
  };
}

// 공유 링크: 지금 주소 + #share=… (결과: Promise<글자>)
export async function shareLink() {
  const bytes = await squeeze(new TextEncoder().encode(JSON.stringify(shareData())), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#${HASH_KEY}=${toBase64Url(bytes)}`;
}

// 지금 주소에 공유된 노선망이 있으면 꺼낸다: 저장 모양(그 지도의 region이 들어 있다). 없으면 null.
// 글자가 잘렸거나 다른 게임 링크라 읽을 수 없으면 이유를 담은 에러를 던진다
export async function readSharedLink() {
  const match = location.hash.match(new RegExp(`^#${HASH_KEY}=([A-Za-z0-9_-]+)$`));
  if (!match) return null;
  // 글자가 잘려서 풀리지 않으면 브라우저 오류("Failed to fetch"처럼 알아듣기 어렵다) 대신 쉬운 이유로 바꿔 던진다
  const data = await squeeze(fromBase64Url(match[1]), new DecompressionStream('deflate-raw')).then(
    (bytes) => JSON.parse(new TextDecoder().decode(bytes)),
    () => {
      throw new Error('링크 글자가 잘렸거나 망가졌어요');
    },
  );
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
