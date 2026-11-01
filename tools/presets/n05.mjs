// 도쿄·오사카 실제 노선망의 개통 연도: 국토교통성 국토수치정보 「철도 시계열 데이터」(N05, 2023년판)에서 읽는다.
// N05는 선로 조각마다 그 노선 이름·운영 회사와 "있던 기간(시작 해 ~ 끝 해)"을 적은 자료다. 프리셋의 이웃한 역 짝마다
// 그 노선의 N05 조각 중 선로 가운데에서 가까운 것들을 찾아, 가장 이른 시작 해를 개통 연도로 쓴다.
// N05는 1950년 자료부터라 그 전에 생긴 구간은 1950으로 나온다. 그래서 1950년 전 구간은 FIXED에 손으로 적고(널리 알려진 연도),
// 운행 계통이 선로보다 늦게 생긴 노선(야마노테선 순환, 오사카 순환선, 후쿠토신선)은 노선 전체를 그해로 적는다.
// 자료 받기: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N05-2023.html 의 N05-23_GML.zip 을 풀어
// UTF-8/N05-23_RailroadSection2.geojson 경로를 환경 변수 N05로 준다 (게임은 이 파일을 쓰지 않고, 고른 연도만 프리셋에 적힌다).
// 이용 조건: 국토수치정보 이용약관 (비상업 이용, 출처 표기). 시작 화면에 출처를 적는다
import { readFileSync } from 'node:fs';
import { sectionYears, setOpenings } from './openings.mjs';
import { meters } from './osm.mjs';

// 프리셋 노선 이름(갈래 이름 " · …" 앞) → N05에서 고를 조각 (운영 회사, 노선 이름). 2004년 전 도쿄메트로는 帝都高速度交通営団,
// 2018년 전 오사카 메트로는 大阪市라서 둘 다 고른다. year: N05를 쓰지 않고 노선 전체를 그해로
const TOKYO_METRO = /帝都高速度交通営団|東京地下鉄/;
const TOEI = /^東京都$/;
const OSAKA_METRO = /^大阪市$|大阪市高速電気軌道/;
const LINES = {
  tokyo: {
    긴자선: { operator: TOKYO_METRO, line: /銀座線/ },
    마루노우치선: { operator: TOKYO_METRO, line: /丸ノ内線|荻窪線/ },
    히비야선: { operator: TOKYO_METRO, line: /日比谷線/ },
    도자이선: { operator: TOKYO_METRO, line: /東西線/ },
    지요다선: { operator: TOKYO_METRO, line: /千代田線/ },
    유라쿠초선: { operator: TOKYO_METRO, line: /有楽町線/ },
    한조몬선: { operator: TOKYO_METRO, line: /半蔵門線/ },
    난보쿠선: { operator: TOKYO_METRO, line: /南北線/ },
    후쿠토신선: { year: 2008 }, // 이케부쿠로–시부야가 이어져 후쿠토신선으로 다니기 시작한 해
    // 도에이는 같은 이름의 옛 노면전차(都電 新宿線·三田線 등)가 있어서 지하철 번호까지 맞춘다
    '도에이 아사쿠사선': { operator: TOEI, line: /^1号線浅草線/ },
    '도에이 미타선': { operator: TOEI, line: /^6号線三田線/ },
    '도에이 신주쿠선': { operator: TOEI, line: /^10号線新宿線/ },
    '도에이 오에도선': { operator: TOEI, line: /^12号線大江戸線/ },
    'JR 야마노테선': { year: 1925 }, // 순환 운행을 시작한 해
  },
  osaka: {
    미도스지선: { operator: OSAKA_METRO, line: /^1号線/ },
    다니마치선: { operator: OSAKA_METRO, line: /^2号線/ },
    요쓰바시선: { operator: OSAKA_METRO, line: /^3号線/ },
    주오선: { operator: OSAKA_METRO, line: /^4号線/ },
    센니치마에선: { operator: OSAKA_METRO, line: /^5号線/ },
    사카이스지선: { operator: OSAKA_METRO, line: /^6号線/ },
    나가호리쓰루미료쿠치선: { operator: OSAKA_METRO, line: /^7号線/ },
    이마자토스지선: { operator: OSAKA_METRO, line: /^8号線/ },
    난코포트타운선: { operator: OSAKA_METRO, line: /南港ポートタウン線/ },
    'JR 오사카 순환선': { year: 1961 }, // 순환선으로 다니기 시작한 해
  },
};

// 1950년 전에 개통한 구간 (N05가 1950으로 적는 곳)과 N05(2023년판)보다 뒤에 개통한 구간: [이 역부터, 이 역까지, 개통 연도]
const FIXED = {
  tokyo: {
    긴자선: [
      ['아사쿠사', '우에노', 1927],
      ['우에노', '간다', 1931],
      ['간다', '신바시', 1934],
      ['신바시', '시부야', 1939],
    ],
  },
  osaka: {
    미도스지선: [
      ['우메다', '신사이바시', 1933],
      ['신사이바시', '난바', 1935],
      ['난바', '덴노지', 1938],
    ],
    요쓰바시선: [['다이코쿠초', '하나조노초', 1942]],
    주오선: [['코스모스퀘어', '유메시마', 2025]], // 오사카 엑스포 연장
  },
};

// 선로 가운데에서 가장 가까운 그 노선의 N05 조각과, 그보다 NEAR_EXTRA_M 안쪽까지 더 먼 조각들을 그 구간으로 본다
// (N05 선 모양은 실제 선로와 수백 m 어긋나는 곳이 있고, 같은 자리에 기간이 다른 조각이 겹쳐 있다). FAR_M보다 멀면 못 찾은 것
const NEAR_EXTRA_M = 100;
const FAR_M = 600;

// 점 p에서 선분 a–b까지 거리 (m, 평면 어림)
function distanceToSegment(p, a, b) {
  const ax = 0;
  const ay = 0;
  const bx = meters(a, [b[0], a[1]]) * Math.sign(b[0] - a[0]);
  const by = meters(a, [a[0], b[1]]) * Math.sign(b[1] - a[1]);
  const px = meters(a, [p[0], a[1]]) * Math.sign(p[0] - a[0]);
  const py = meters(a, [a[0], p[1]]) * Math.sign(p[1] - a[1]);
  const length2 = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / length2));
  return Math.hypot(ax + (bx - ax) * t - px, ay + (by - ay) * t - py);
}

// 점들(선로)의 가운데 점 (길이로 반)
function middleOf(points) {
  const lengths = points.slice(1).map((point, i) => meters(points[i], point));
  let left = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]) {
      const t = lengths[i] === 0 ? 0 : left / lengths[i];
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * t, points[i][1] + (points[i + 1][1] - points[i][1]) * t];
    }
    left -= lengths[i];
  }
  return points.at(-1);
}

// N05가 있는 도시(도쿄·오사카)면 개통 연도를 적고 true, 아니면 false. n05Path: RailroadSection2.geojson 경로
export function applyN05Openings(regionId, network, n05Path) {
  const lines = LINES[regionId];
  if (!lines) return false;
  if (!n05Path) throw new Error('도쿄·오사카 개통 연도에는 N05 자료가 필요해요: 환경 변수 N05에 RailroadSection2.geojson 경로를 주세요');
  const sections = JSON.parse(readFileSync(n05Path, 'utf8')).features.map((feature) => ({
    operator: feature.properties.N05_003,
    line: feature.properties.N05_002,
    start: Number(feature.properties.N05_005b),
    parts: feature.geometry.type === 'LineString' ? [feature.geometry.coordinates] : feature.geometry.coordinates,
  }));
  setOpenings(network, (route, names, pairPoints) => {
    const base = route.name.split(' · ')[0];
    const pick = lines[base];
    if (!pick) throw new Error(`N05 노선을 정하지 않은 노선이에요: ${route.name} (tools/presets/n05.mjs)`);
    const fixed = FIXED[regionId][base] ?? [];
    if (pick.year) return sectionYears(route.name, names, names.slice(1).map(() => pick.year), fixed);
    const own = sections.filter((section) => pick.operator.test(section.operator) && pick.line.test(section.line));
    const years = names.slice(1).map((_, k) => {
      const middle = middleOf(pairPoints(k));
      const away = own.map((section) => ({
        start: section.start,
        distance: Math.min(
          ...section.parts.flatMap((part) => part.slice(1).map((point, i) => distanceToSegment(middle, part[i], point))),
        ),
      }));
      const nearest = Math.min(...away.map((section) => section.distance));
      if (!(nearest < FAR_M)) return null; // 아래 FIXED로 채우지 못하면 알린다
      return Math.min(...away.filter((section) => section.distance < nearest + NEAR_EXTRA_M).map((section) => section.start));
    });
    sectionYears(route.name, names, years, fixed);
    const missing = years.indexOf(null);
    if (missing >= 0) throw new Error(`${route.name}: ${names[missing]}–${names[missing + 1]} 근처에서 N05 조각을 찾지 못했어요`);
    return years;
  });
  return true;
}
