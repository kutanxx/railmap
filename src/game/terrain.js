// 땅 높이 (가상 지도에만 있다). 높이 격자(src/data/sollae-height.json)를 받아 두고, 어느 자리든 높이를 알려준다.
// 실제 지도(서울)는 높이 자료를 쓰지 않는다 ("실제 지형 고도 데이터"는 만들지 않을 것 목록). 그때는 hasTerrain()이 false다.

// { west, north, stepLng, stepLat, nx, ny, heights } 또는 null
let grid = null;

export function setTerrain(data) {
  grid = data;
}

export const hasTerrain = () => grid !== null;

// 높이 격자 그대로 (등고선 그리기용). 없으면 null
export const terrainGrid = () => grid;

// [경도, 위도] 자리의 땅 높이 (m). 격자 네 점 사이를 비례로 나눈다. 지도 밖이면 가장자리 높이
export function heightAt([lng, lat]) {
  const { west, north, stepLng, stepLat, nx, ny, heights } = grid;
  const fx = Math.min(Math.max((lng - west) / stepLng, 0), nx - 1.001);
  const fy = Math.min(Math.max((north - lat) / stepLat, 0), ny - 1.001);
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const u = fx - i;
  const v = fy - j;
  const at = (x, y) => heights[y * nx + x];
  const a = at(i, j);
  const b = at(i + 1, j);
  const c = at(i, j + 1);
  const d = at(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
