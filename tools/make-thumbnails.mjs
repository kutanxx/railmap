// 시작 화면 도시 카드에 넣을 작은 지도 그림을 만든다: node tools/make-thumbnails.mjs
// → public/thumbnails/<지도 id>.svg (게임과 같은 베이지 색으로 물·녹지·시가지·큰길·철도만 그린 그림)
// 실제 지도는 OpenFreeMap의 지도 조각(벡터 타일)을 받아 그리고, 가상 지도(솔내 지방)는 src/data/sollae.json으로 그린다.
// 지도를 더하거나 범위(regions.js의 bounds)를 바꾸면 다시 돌린다. 인터넷이 필요하다 (가입·키 없음).
// 그림의 지도 자료: © OpenStreetMap 기여자 (OpenFreeMap). 시작 화면에 출처를 적는다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PbfReader } from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { REGIONS } from '../src/regions.js';
import { PALETTE } from '../src/map/style.js';

// 그림 크기 (px). 카드 위쪽에 16:9로 들어간다
const WIDTH = 320;
const HEIGHT = 180;
// 지도 조각을 받을 줌. 10이면 도시 하나가 조각 몇 장이고, 큰길과 강이 알아볼 만큼 나온다
const ZOOM = 10;
// 그림에 넣을 길 종류와 굵기 (px)
// 실제 지도는 고속도로(motorway)·주요 도로(trunk)만 (간선도로까지 그리면 너무 복잡하다). 가상 지도는 길이 적어서 큰길·동네 길을 그린다
const ROAD_WIDTH = { motorway: 2.2, trunk: 1.8, primary: 1.3, minor: 0.8 };
const RAIL_WIDTH = 0.9;
const OUT_DIR = 'public/thumbnails';

// 경도·위도 → 줌 ZOOM의 세계 픽셀 (웹 메르카토르, 512px 조각)
const worldPx = ([lng, lat]) => {
  const size = 512 * 2 ** ZOOM;
  const sin = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * size, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size];
};

// 범위 [서, 남, 동, 북]을 그림에 꽉 차게(넘치는 쪽은 잘라서) 놓는 변환. 결과: 세계 픽셀 → 그림 px
function viewFor([west, south, east, north]) {
  const [x0, y0] = worldPx([west, north]);
  const [x1, y1] = worldPx([east, south]);
  const scale = Math.max(WIDTH / (x1 - x0), HEIGHT / (y1 - y0));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return ([x, y]) => [(x - cx) * scale + WIDTH / 2, (y - cy) * scale + HEIGHT / 2];
}

// 그림에서 이보다 가까운 점은 빼고(px), 이보다 작은 도형은 버린다(px). 지도 조각의 점은 그림보다 훨씬 촘촘해서
// 그대로 쓰면 파일이 수 MB가 된다
const MIN_STEP_PX = 1.6;
const MIN_SHAPE_PX = 3;

// 점 줄이기: 앞에 남긴 점과 MIN_STEP_PX보다 가까운 점은 뺀다 (끝점은 남긴다)
function thin(ring) {
  const kept = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    const [px, py] = kept[kept.length - 1];
    const [x, y] = ring[i];
    if (Math.hypot(x - px, y - py) >= MIN_STEP_PX || i === ring.length - 1) kept.push(ring[i]);
  }
  return kept;
}

// 도형이 그림에서 보일 만큼 큰지
function bigEnough(ring) {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  return Math.max(...xs) - Math.min(...xs) >= MIN_SHAPE_PX || Math.max(...ys) - Math.min(...ys) >= MIN_SHAPE_PX;
}

// 그림 테두리(조금 바깥)로 자르기: 그림 밖으로 나간 점은 파일만 키우므로 잘라낸다
const EDGE = 4;
const BOX = [-EDGE, -EDGE, WIDTH + EDGE, HEIGHT + EDGE];

// 면 자르기 (서덜랜드-호지먼: 네 변마다 안쪽만 남긴다)
function clipPolygon(ring) {
  let points = ring;
  const edges = [
    [(p) => p[0] >= BOX[0], (a, b) => cross(a, b, 0, BOX[0])],
    [(p) => p[0] <= BOX[2], (a, b) => cross(a, b, 0, BOX[2])],
    [(p) => p[1] >= BOX[1], (a, b) => cross(a, b, 1, BOX[1])],
    [(p) => p[1] <= BOX[3], (a, b) => cross(a, b, 1, BOX[3])],
  ];
  for (const [inside, meet] of edges) {
    const next = [];
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const previous = points[(i + points.length - 1) % points.length];
      if (inside(current)) {
        if (!inside(previous)) next.push(meet(previous, current));
        next.push(current);
      } else if (inside(previous)) {
        next.push(meet(previous, current));
      }
    }
    points = next;
    if (points.length === 0) break;
  }
  return points;
}

// 선 자르기: 그림 밖으로 나간 구간은 끊고, 안에 있는 구간만 남긴다 (밖의 첫 점은 하나씩 남겨 선이 테두리까지 닿게)
function clipLine(line) {
  const inside = ([x, y]) => x >= BOX[0] && x <= BOX[2] && y >= BOX[1] && y <= BOX[3];
  const pieces = [];
  let piece = [];
  line.forEach((point, i) => {
    if (inside(point) || (line[i - 1] && inside(line[i - 1])) || (line[i + 1] && inside(line[i + 1]))) {
      piece.push(point);
    } else if (piece.length) {
      pieces.push(piece);
      piece = [];
    }
  });
  if (piece.length) pieces.push(piece);
  return pieces;
}

// 선분 a-b가 축(axis, 0=x 1=y)의 값 value를 지나는 점
function cross(a, b, axis, value) {
  const t = (value - a[axis]) / (b[axis] - a[axis]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// 그림 위의 점들을 SVG 경로 글자로 (정수 px. 작은 그림이라 충분하다)
const pathOf = (rings, closed) =>
  rings
    .flatMap((ring) => (closed ? [clipPolygon(ring)] : clipLine(ring)))
    .filter((ring) => ring.length > 1 && bigEnough(ring))
    .map(thin)
    .filter((ring) => ring.length > (closed ? 2 : 1))
    .map((ring) => `M${ring.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L')}${closed ? 'Z' : ''}`)
    .join('');

// 점들이 그림 근처에 하나라도 있는지 (그림 밖 도형은 버려서 파일을 작게)
const nearView = (rings) =>
  rings.some((ring) => ring.some(([x, y]) => x > -40 && x < WIDTH + 40 && y > -40 && y < HEIGHT + 40));

// 그릴 도형 묶음 (그리는 순서대로)
function emptyLayers() {
  return {
    urban: [],
    green: [],
    water: [],
    waterway: [],
    rail: [],
    roads: { motorway: [], trunk: [], primary: [], minor: [] },
  };
}

// 모은 도형으로 SVG 글자를 만든다
function toSvg(layers) {
  // 면은 같은 색 얇은 테두리도 그어서, 지도 조각 경계에 생기는 가는 틈을 메운다
  const fill = (rings, color) =>
    rings.length ? `<path d="${pathOf(rings, true)}" fill="${color}" stroke="${color}" stroke-width="0.6"/>` : '';
  const line = (rings, color, width) =>
    rings.length
      ? `<path d="${pathOf(rings, false)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
      : '';
  // 길은 모양을 한 번만 적고(defs), 테두리색 굵은 선 위에 길색 가는 선으로 두 번 쓴다
  const roadKinds = ['minor', 'primary', 'trunk', 'motorway'].filter((kind) => layers.roads[kind].length > 0);
  const roadDefs = roadKinds.map((kind) => `<path id="${kind}" d="${pathOf(layers.roads[kind], false)}"/>`).join('');
  const useRoad = (kind, color, width) => `<use href="#${kind}" stroke="${color}" stroke-width="${width}"/>`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">`,
    `<defs>${roadDefs}</defs>`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.land}"/>`,
    fill(layers.urban, PALETTE.urban),
    fill(layers.green, PALETTE.green),
    fill(layers.water, PALETTE.water),
    line(layers.waterway, PALETTE.water, 1.6),
    line(layers.rail, PALETTE.rail, RAIL_WIDTH),
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">',
    ...roadKinds.map((kind) => useRoad(kind, PALETTE.roadCasing, ROAD_WIDTH[kind] + 1.2)),
    ...roadKinds.map((kind) => useRoad(kind, PALETTE.road, ROAD_WIDTH[kind])),
    '</g></svg>',
  ].join('');
}

// ── 실제 지도: OpenFreeMap 지도 조각 ──

async function tileUrlTemplate() {
  const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
  const tilejson = await (await fetch(style.sources.openmaptiles.url)).json();
  return tilejson.tiles[0];
}

// 범위를 덮는 줌 zoom의 지도 조각을 하나씩 받아서 visit(조각, 조각 좌표 → 그림 px 바꾸기)를 부른다
async function eachTile(bounds, zoom, template, view, visit) {
  const tileSize = 512 * 2 ** (ZOOM - zoom); // 줌 zoom 조각 하나가 줌 ZOOM 세계 픽셀로 몇 px인지
  const [left, top] = worldPx([bounds[0], bounds[3]]).map((v) => Math.floor(v / tileSize));
  const [right, bottom] = worldPx([bounds[2], bounds[1]]).map((v) => Math.floor(v / tileSize));
  for (let tx = left; tx <= right; tx++) {
    for (let ty = top; ty <= bottom; ty++) {
      const url = template.replace('{z}', zoom).replace('{x}', tx).replace('{y}', ty);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`지도 조각을 받지 못했어요 (${response.status}): ${url}`);
      const tile = new VectorTile(new PbfReader(new Uint8Array(await response.arrayBuffer())));
      visit(tile, (p, extent) => view([(tx + p.x / extent) * tileSize, (ty + p.y / extent) * tileSize]));
    }
  }
}

// 조각 안의 한 층(name)의 도형들을 그림 px로 바꿔 visit(속성, 고리들, 종류)에 넘긴다 (그림 밖 도형은 건너뛴다)
function eachFeature(tile, toView, name, visit) {
  const layer = tile.layers[name];
  if (!layer) return;
  for (let i = 0; i < layer.length; i++) {
    const feature = layer.feature(i);
    const rings = feature.loadGeometry().map((ring) => ring.map((p) => toView(p, layer.extent)));
    if (nearView(rings)) visit(feature.properties, rings, feature.type);
  }
}

// 면(시가지·녹지·물)은 한 줌 낮은 조각에서 읽는다. 그림 크기에 맞게 이미 단순해져 있어서 파일이 훨씬 작다
const AREA_ZOOM = ZOOM - 1;

async function realMapLayers(region, template) {
  const view = viewFor(region.bounds);
  const layers = emptyLayers();
  await eachTile(region.bounds, AREA_ZOOM, template, view, (tile, toView) => {
    eachFeature(tile, toView, 'landuse', (props, rings) => {
      if (['residential', 'commercial', 'industrial', 'retail'].includes(props.class)) layers.urban.push(...rings);
    });
    eachFeature(tile, toView, 'landcover', (props, rings) => {
      if (['wood', 'forest', 'grass'].includes(props.class)) layers.green.push(...rings);
    });
    eachFeature(tile, toView, 'park', (_, rings, type) => {
      if (type === 3) layers.green.push(...rings);
    });
    eachFeature(tile, toView, 'water', (_, rings) => layers.water.push(...rings));
  });
  await eachTile(region.bounds, ZOOM, template, view, (tile, toView) => {
    eachFeature(tile, toView, 'waterway', (props, rings) => {
      if (props.class === 'river') layers.waterway.push(...rings);
    });
    eachFeature(tile, toView, 'transportation', (props, rings) => {
      if (props.brunnel === 'tunnel') return;
      if (['motorway', 'trunk'].includes(props.class)) layers.roads[props.class].push(...rings);
      if (props.class === 'rail') layers.rail.push(...rings);
    });
  });
  return layers;
}

// ── 가상 지도: 솔내 지방 GeoJSON ──

function virtualMapLayers(data) {
  const view = viewFor(data.bbox);
  const layers = emptyLayers();
  for (const { properties, geometry } of data.features) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : null;
    const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.type === 'MultiLineString' ? geometry.coordinates : null;
    const toView = (ring) => ring.map((coord) => view(worldPx(coord)));
    if (polygons && properties.layer === 'landuse') layers.urban.push(...polygons.flat().map(toView));
    if (polygons && properties.layer === 'landcover') layers.green.push(...polygons.flat().map(toView));
    if (polygons && properties.layer === 'water') layers.water.push(...polygons.flat().map(toView));
    if (lines && properties.layer === 'transportation' && layers.roads[properties.class]) {
      layers.roads[properties.class].push(...lines.map(toView));
    }
    if (lines && properties.layer === 'transportation' && properties.class === 'rail') layers.rail.push(...lines.map(toView));
  }
  return layers;
}

mkdirSync(OUT_DIR, { recursive: true });
const template = await tileUrlTemplate();
// 지도 id를 적으면 그 지도만 다시 만든다 (예: node tools/make-thumbnails.mjs sollae). 안 적으면 모두
const only = process.argv.slice(2);
for (const [id, region] of Object.entries(REGIONS)) {
  if (only.length > 0 && !only.includes(id)) continue;
  const layers = region.virtual
    ? virtualMapLayers(JSON.parse(readFileSync(`src/data/${id}.json`, 'utf8')))
    : await realMapLayers(region, template);
  const svg = toSvg(layers);
  writeFileSync(`${OUT_DIR}/${id}.svg`, svg);
  console.log(`${id}: ${(svg.length / 1024).toFixed(0)} KB`);
}
