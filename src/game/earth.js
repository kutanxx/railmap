// 지구 위 거리 어림: 경도·위도 1도가 몇 미터인지 (도시 하나 크기에서는 지구가 둥근 건 무시해도 된다).
// 역 주변 인구(map/population.js), 건물 칸 적기(cellPacking.js), 곡선 선로(trackShape.js), 이웃 역 찾기(catchment.js)가
// 함께 쓴다. 꼭 같은 값이어야 한다: 건물 칸을 저장할 때와 펼칠 때 좌표가 똑같아야 해서 (바꾸지 않는다)

// 위도 1도의 길이 (m)
export const METERS_PER_DEGREE_LAT = 110540;
// 적도에서 경도 1도의 길이 (m). "1도 ≈ 111km"로 어림할 때도 쓴다
export const METERS_PER_DEGREE = 111320;
// 위도 lat에서 경도 1도의 길이 (m)
export const metersPerDegreeLng = (lat) => METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180);
