// 가상 지도 "솔내 지방"의 MapLibre 스타일. 지도 서버 없이 GeoJSON 자료(src/data/sollae.json) 하나로 그린다.
// 색은 실제 지도와 같은 베이지 팔레트(style.js)를 쓴다.
import { PALETTE } from './style.js';

// 칠할 곳(prop) → 팔레트 이름. 관제실 모드에서 이 이름으로 다른 팔레트 색을 찾는다 (map/theme.js)
const paletteMeta = (entries) => ({ 'railmap:palette': entries });
const keyOf = (color) => Object.keys(PALETTE).find((key) => PALETTE[key] === color);

const SOURCE = 'sollae';
// 지명 글자 모양: 실제 지도와 같은 무료 글꼴 (OpenFreeMap, 가입·키 없음)
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

const isLayer = (layer) => ['==', ['get', 'layer'], layer];
const isKind = (kind) => ['==', ['get', 'kind'], kind];
const isClass = (roadClass) => ['==', ['get', 'class'], roadClass];

// 줌에 따라 굵어지는 선 (줌 → px)
const widths = (...stops) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];

// data: sollae.json (FeatureCollection)
export function sollaeStyle(data) {
  const fill = (id, filter, color, outline) => ({
    id,
    type: 'fill',
    source: SOURCE,
    filter,
    paint: { 'fill-color': color, ...(outline ? { 'fill-outline-color': outline } : {}) },
    metadata: paletteMeta({ 'fill-color': keyOf(color), ...(outline ? { 'fill-outline-color': keyOf(outline) } : {}) }),
  });
  const road = (id, roadClass, color, width) => ({
    id,
    type: 'line',
    source: SOURCE,
    filter: ['all', isLayer('transportation'), isClass(roadClass)],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': color, 'line-width': width },
    metadata: paletteMeta({ 'line-color': keyOf(color) }),
  });
  const label = (id, kind, size, color, font) => ({
    id,
    type: 'symbol',
    source: SOURCE,
    filter: ['all', isLayer('place'), isKind(kind)],
    layout: { 'text-field': ['get', 'name'], 'text-font': [font], 'text-size': size },
    paint: { 'text-color': color, 'text-halo-color': PALETTE.labelHalo, 'text-halo-width': 1.5 },
    metadata: paletteMeta({ 'text-color': keyOf(color), 'text-halo-color': 'labelHalo' }),
  });

  return {
    version: 8,
    glyphs: GLYPHS,
    sources: { [SOURCE]: { type: 'geojson', data } },
    layers: [
      {
        id: 'land',
        type: 'background',
        paint: { 'background-color': PALETTE.land },
        metadata: paletteMeta({ 'background-color': 'land' }),
      },
      // 산과 공원은 녹지 색
      fill('mountain', ['all', isLayer('landcover'), isKind('mountain')], PALETTE.green),
      fill('park', ['all', isLayer('landcover'), isKind('park')], PALETTE.green),
      fill('water', isLayer('water'), PALETTE.water),
      fill('block', ['all', isLayer('landuse'), isKind('block')], PALETTE.urban),
      // 도로: 테두리를 먼저 깔고 안쪽을 칠한다 (동네 길 → 큰길 순서로 큰길이 위에)
      road('road-minor-casing', 'minor', PALETTE.roadCasing, widths(12, 1, 14, 3.5, 18, 14)),
      road('road-minor', 'minor', PALETTE.road, widths(12, 0.5, 14, 2.5, 18, 11)),
      road('road-primary-casing', 'primary', PALETTE.roadCasing, widths(10, 2.5, 14, 7, 18, 24)),
      road('road-primary', 'primary', PALETTE.road, widths(10, 1.5, 14, 5.5, 18, 20)),
      fill('building', isLayer('building'), PALETTE.building, PALETTE.buildingOutline),
      label('label-water', 'water', 13, PALETTE.labelSmall, 'Noto Sans Italic'),
      label('label-peak', 'peak', 13, PALETTE.labelSmall, 'Noto Sans Regular'),
      label('label-town', 'town', ['interpolate', ['linear'], ['zoom'], 11, 14, 15, 20], PALETTE.label, 'Noto Sans Bold'),
    ],
  };
}
