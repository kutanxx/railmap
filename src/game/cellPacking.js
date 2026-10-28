// 역 주변 건물 칸(station.cells)을 저장 파일에 작게 적기 (save.js가 저장·불러올 때 쓴다).
// 칸은 역을 가운데 둔 CATCHMENT_CELL_M 격자의 칸 가운데다 ([경도, 위도, 면적], map/population.js가 만든다).
// 그래서 경도·위도 대신 "역에서 동쪽·북쪽으로 몇 번째 칸인지"(정수)로 적으면 저장 크기가 절반 아래로 준다.
// 다시 펼친 좌표가 원래와 하나라도 다르면 그 역은 예전처럼 경도·위도로 적는다 (숫자가 조금도 바뀌지 않게).
import { CATCHMENT_CELL_M } from '../config.js';

// map/population.js의 localProjection·inverseProjection과 같은 값·같은 계산 (그래야 펼친 좌표가 똑같다)
const METERS_PER_LAT = 110540;
const metersPerLng = (lat) => 111320 * Math.cos((lat * Math.PI) / 180);
const round5 = (value) => Math.round(value * 10 ** 5) / 10 ** 5;

// 역 자리 coord에서 (gx, gy)번째 칸 가운데의 [경도, 위도]
function cellCoord([lng0, lat0], gx, gy, size) {
  return [round5(lng0 + ((gx + 0.5) * size) / metersPerLng(lat0)), round5(lat0 + ((gy + 0.5) * size) / METERS_PER_LAT)];
}

// 저장할 때. 결과: [칸 크기(m), gx, gy, 면적, gx, gy, 면적, …] 또는 격자로 적을 수 없으면 null (그대로 적는다)
export function packCells(coord, cells) {
  const size = CATCHMENT_CELL_M;
  const packed = [size];
  for (const [lng, lat, area] of cells) {
    const gx = Math.round(((lng - coord[0]) * metersPerLng(coord[1])) / size - 0.5);
    const gy = Math.round(((lat - coord[1]) * METERS_PER_LAT) / size - 0.5);
    const [lngBack, latBack] = cellCoord(coord, gx, gy, size);
    if (lngBack !== lng || latBack !== lat) return null;
    packed.push(gx, gy, area);
  }
  return packed;
}

// 불러올 때: packCells의 결과를 [[경도, 위도, 면적], …]로 되돌린다
export function unpackCells(coord, packed) {
  const [size, ...numbers] = packed;
  const cells = [];
  for (let i = 0; i < numbers.length; i += 3) {
    cells.push([...cellCoord(coord, numbers[i], numbers[i + 1], size), numbers[i + 2]]);
  }
  return cells;
}
