// 역세권 나누기: 가까이 붙은 역들이 같은 건물을 두 번 세지 않게, 인구를 칸마다 가장 가까운 역에만 준다.
// 역마다 지을 때 적어 둔 칸 목록(station.cells)을 쓰므로 지도 데이터 없이 계산할 수 있다.
// 그래서 역을 짓거나 지우거나 되돌리거나 불러와도 언제나 같은 결과가 나온다.
import { MIN_STATION_POPULATION, POPULATION_RADIUS_M } from '../config.js';
import { peoplePerBuiltM2 } from './region.js';

// 결과: Map(역 id → 이웃 역과 나눈 뒤의 인구)
export function sharedPopulations(stations) {
  const result = new Map();
  for (const station of stations) {
    // 칸을 적지 못한 역(건물 데이터가 없었던 역, 예전 저장 파일)은 원래 인구를 그대로 쓴다
    if (!station.cells) {
      result.set(station.id, station.population);
      continue;
    }
    const near = neighbors(station, stations);
    // 이웃 역은 1~2km 안이라 경도를 줄이는 비율(cos 위도)은 이 역 것 하나로 써도 된다 (칸마다 다시 계산하지 않게)
    const scale = lngScale(station.coord[1]);
    let builtArea = 0;
    for (const [lng, lat, area] of station.cells) {
      const own = distanceSq(station.coord, lng, lat, scale);
      // 이 칸에 더 가까운 다른 역이 있으면 그 역 몫이다
      if (near.every((other) => distanceSq(other.coord, lng, lat, scale) >= own)) builtArea += area;
    }
    result.set(station.id, Math.max(MIN_STATION_POPULATION, Math.round(builtArea * peoplePerBuiltM2())));
  }
  return result;
}

// 반경 두 배(=두 원이 겹칠 수 있는 거리) 안의 다른 역들
function neighbors(station, stations) {
  const reach = ((2 * POPULATION_RADIUS_M) / 111320) ** 2 * 1.2; // 위도 1도 ≈ 111km, 여유 20%
  const scale = lngScale(station.coord[1]);
  return stations.filter((other) => other !== station && distanceSq(station.coord, ...other.coord, scale) < reach);
}

// 경도 1도가 위도 1도보다 얼마나 짧은지 (그 위도에서)
const lngScale = (lat) => Math.cos((lat * Math.PI) / 180);

// 두 점 사이 거리의 제곱 (도 단위, 경도는 scale만큼 줄인다). 크기 비교에만 쓴다
function distanceSq([lng1, lat1], lng2, lat2, scale) {
  const dx = (lng1 - lng2) * scale;
  const dy = lat1 - lat2;
  return dx * dx + dy * dy;
}
