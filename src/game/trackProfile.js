// 선로 하나의 높이 분석 (종단면): 땅 높이, 선로 높이, 구간마다 땅 위·터널·교량.
// 계산 방식은 reference/prototype-sollae.html의 analyze 함수를 옮겼다.
// 1) 선로를 PROFILE_STEP_M마다 짚어 땅 높이를 잰다 (game/terrain.js)
// 2) 선로 높이 = 땅 높이를 앞뒤 PROFILE_SMOOTH_M 범위로 고르게 편 뒤, 이웃한 점 사이 경사가 MAX_GRADE를 넘지 않게 깎는다.
//    양 끝(역)은 땅 높이에 붙인다
// 3) 땅이 선로보다 TUNNEL_DEPTH_M 넘게 높으면 터널, 물 위이거나 선로가 땅보다 VIADUCT_HEIGHT_M 넘게 높으면 교량.
//    MIN_TUNNEL_M보다 짧은 터널은 땅을 깎아 지나가는 것으로 친다
// 높이 자료가 없는 실제 지도(서울)는 땅·선로 높이를 0으로 두고, 물 위만 교량으로 판정한다.
import { length, lineString, along } from '@turf/turf';
import {
  PROFILE_STEP_M,
  PROFILE_SMOOTH_M,
  MAX_GRADE,
  TUNNEL_DEPTH_M,
  VIADUCT_HEIGHT_M,
  MIN_TUNNEL_M,
} from '../config.js';
import { hasTerrain, heightAt } from './terrain.js';

// 점들이 하나씩 물 위인지 알려주는 함수. 게임 규칙 코드는 지도를 직접 읽지 않으므로
// 지도를 가진 화면 쪽(ui/app.js → map/water.js)이 정해 준다. 정해 주기 전에는 물이 없는 것으로 친다
// version: 물 모양이 바뀔 때마다(실제 지도에서 물이 있는 타일을 새로 불러오면) 달라지는 번호
let waterTest = (points) => points.map(() => false);
let waterVersion = () => 0;
export function setWaterTest(test, version) {
  waterTest = test;
  waterVersion = version;
  cache.clear();
}

// 같은 모양의 선로는 몇 번을 물어도 답이 같으므로 기억해 둔다. 바뀔 때마다 모든 선로의 공사비·달리는 모습·그림이
// 이 분석을 다시 부르는데, 물 위인지 재는 계산이 무거워서 역 50개 가상 지도에서 바뀜 하나에 50ms쯤 걸렸다.
// 물 모양이 바뀌면 모두 잊는다. 선로를 그리는 동안 생기는 모양까지 다 쌓이지 않게 MAX_CACHED개까지만 둔다
const MAX_CACHED = 500;
const cache = new Map();
let cachedVersion = 0;

// coords: 선로 [경도, 위도] 점들 (출발역, 경유점…, 도착역)
// 결과: { km: 길이, stepKm: 짚은 간격, points, ground: 땅 높이(m), rail: 선로 높이(m), water: 물 위인지,
//         type: 점마다 'ground' | 'tunnel' | 'bridge', groundKm, tunnelKm, bridgeKm, maxGrade: 가장 가파른 경사(0.03 = 3%),
//         gradeAt(km): 그 자리의 경사 }
export function trackProfile(coords) {
  const version = waterVersion();
  if (version !== cachedVersion) {
    cache.clear();
    cachedVersion = version;
  }
  const key = coords.join(';');
  let profile = cache.get(key);
  if (!profile) {
    profile = analyze(coords);
    if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value);
    cache.set(key, profile);
  }
  return profile;
}

// 실제 분석 (결과는 trackProfile 설명과 같다)
function analyze(coords) {
  const km = coords.length >= 2 ? length(lineString(coords), { units: 'kilometers' }) : 0;
  const count = Math.max(2, Math.ceil((km * 1000) / PROFILE_STEP_M) + 1);
  const stepKm = km / (count - 1);
  const line = coords.length >= 2 ? lineString(coords) : null;
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push(line ? along(line, i * stepKm, { units: 'kilometers' }).geometry.coordinates : coords[0]);
  }
  const water = km > 0 ? waterTest(points) : points.map(() => false);
  const terrain = hasTerrain();
  const ground = points.map((point) => (terrain ? heightAt(point) : 0));
  const rail = terrain ? railHeights(ground, stepKm * 1000) : ground.slice();

  const type = ground.map((height, i) => {
    const cut = height - rail[i];
    if (cut > TUNNEL_DEPTH_M) return 'tunnel';
    if (water[i] || cut < -VIADUCT_HEIGHT_M) return 'bridge';
    return 'ground';
  });
  // 짧은 터널은 깎아서 지나간다
  const minTunnelPoints = Math.ceil(MIN_TUNNEL_M / Math.max(1, stepKm * 1000));
  for (let i = 0; i < count; ) {
    if (type[i] !== 'tunnel') {
      i += 1;
      continue;
    }
    let j = i;
    while (j < count && type[j] === 'tunnel') j += 1;
    if (j - i < minTunnelPoints) for (let q = i; q < j; q++) type[q] = water[q] ? 'bridge' : 'ground';
    i = j;
  }

  // 종류별 길이: 점마다 같은 몫을 가진다
  const share = (kind) => (type.filter((t) => t === kind).length / count) * km;
  const grade = (i) => {
    const a = Math.max(0, i - 1);
    const b = Math.min(count - 1, i + 1);
    return b > a && stepKm > 0 ? Math.abs(rail[b] - rail[a]) / ((b - a) * stepKm * 1000) : 0;
  };
  let maxGrade = 0;
  for (let i = 0; i < count; i++) maxGrade = Math.max(maxGrade, grade(i));

  return {
    km,
    stepKm,
    points,
    ground,
    rail,
    water,
    type,
    groundKm: share('ground'),
    tunnelKm: share('tunnel'),
    bridgeKm: share('bridge'),
    maxGrade,
    gradeAt: (at) => grade(Math.round(stepKm > 0 ? at / stepKm : 0)),
  };
}

// 땅 높이를 고르게 펴고 경사를 깎아 선로 높이를 만든다 (stepM: 점 사이 거리)
function railHeights(ground, stepM) {
  const n = ground.length;
  const k = Math.max(1, Math.round(PROFILE_SMOOTH_M / stepM));
  // 앞뒤 k개 점의 평균 (누적합으로 빠르게)
  const sum = [0];
  for (let i = 0; i < n; i++) sum.push(sum[i] + ground[i]);
  const rail = ground.map((_, i) => {
    const lo = Math.max(0, i - k);
    const hi = Math.min(n - 1, i + k);
    return (sum[hi + 1] - sum[lo]) / (hi - lo + 1);
  });
  // 양 끝으로 갈수록 역(땅 높이)에 붙인다
  for (let i = 0; i < Math.min(k, n); i++) {
    const w = i / k;
    rail[i] = ground[0] * (1 - w) + rail[i] * w;
    rail[n - 1 - i] = ground[n - 1] * (1 - w) + rail[n - 1 - i] * w;
  }
  // 이웃한 점 사이 높이 차가 최대 경사를 넘지 않게, 앞에서 뒤로 한 번, 뒤에서 앞으로 한 번 (몇 번 되풀이)
  const most = MAX_GRADE * stepM;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  for (let round = 0; round < 4; round++) {
    rail[0] = ground[0];
    for (let i = 1; i < n; i++) rail[i] = clamp(rail[i], rail[i - 1] - most, rail[i - 1] + most);
    rail[n - 1] = ground[n - 1];
    for (let i = n - 2; i >= 0; i--) rail[i] = clamp(rail[i], rail[i + 1] - most, rail[i + 1] + most);
  }
  return rail;
}
