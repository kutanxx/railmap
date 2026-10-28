// 등고선: 땅 높이 격자(game/terrain.js)에서 같은 높이를 잇는 선을 만들어 그린다. [지형] 버튼으로 켜고 끈다.
// 격자 칸마다 네 꼭짓점이 그 높이보다 높은지 낮은지를 보고 칸 안에 선분을 긋는 방법(마칭 스퀘어)을 쓴다.
// 처음 한 번만 계산한다 (격자 5만 칸 × 높이 20여 개, 0.1초 안쪽).

const SOURCE = 'contours';
// 등고선 간격 (m). MAJOR_INTERVAL마다 굵은 선에 높이 글자를 붙인다
const INTERVAL = 25;
const MAJOR_INTERVAL = 100;
const COLORS = {
  minor: '#DACDB2', // 가는 등고선
  major: '#C4B391', // 굵은 등고선 (100m마다)
  label: '#9A8F7B', // 높이 글자
  halo: '#EFE7D6',
};
const LAYERS = ['contour-minor', 'contour-major', 'contour-label'];

// grid: { west, north, stepLng, stepLat, nx, ny, heights }. 등고선은 처음에 숨겨 둔다
export function addContourLayers(map, grid) {
  map.addSource(SOURCE, { type: 'geojson', data: contourLines(grid) });
  const hidden = { visibility: 'none' };
  map.addLayer({
    id: 'contour-minor',
    type: 'line',
    source: SOURCE,
    filter: ['!', ['get', 'major']],
    layout: hidden,
    paint: { 'line-color': COLORS.minor, 'line-width': 0.8 },
  });
  map.addLayer({
    id: 'contour-major',
    type: 'line',
    source: SOURCE,
    filter: ['get', 'major'],
    layout: hidden,
    paint: { 'line-color': COLORS.major, 'line-width': 1.4 },
  });
  map.addLayer({
    id: 'contour-label',
    type: 'symbol',
    source: SOURCE,
    filter: ['get', 'major'],
    layout: {
      ...hidden,
      'symbol-placement': 'line',
      'text-field': ['concat', ['to-string', ['get', 'height']], 'm'],
      'text-font': ['Noto Sans Regular'],
      'text-size': 10,
    },
    paint: { 'text-color': COLORS.label, 'text-halo-color': COLORS.halo, 'text-halo-width': 1.5 },
  });
}

export function setContoursVisible(map, visible) {
  for (const id of LAYERS) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
}

// 높이마다 등고선 하나 (MultiLineString: 칸마다 짧은 선분)
function contourLines({ west, north, stepLng, stepLat, nx, ny, heights }) {
  const at = (i, j) => heights[j * nx + i];
  // 칸이 아주 많아서 Math.max(...heights)로 한꺼번에 넘기지 않는다 (브라우저마다 넘길 수 있는 개수에 한계가 있다)
  const top = heights.reduce((max, height) => Math.max(max, height), -Infinity);
  const features = [];
  for (let level = INTERVAL; level < top; level += INTERVAL) {
    const segments = [];
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = at(i, j); // 왼쪽 위
        const b = at(i + 1, j); // 오른쪽 위
        const c = at(i + 1, j + 1); // 오른쪽 아래
        const d = at(i, j + 1); // 왼쪽 아래
        const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        if (index === 0 || index === 15) continue;
        // 칸의 네 변에서 높이가 level인 자리 ([경도, 위도])
        const point = (x, y) => [west + x * stepLng, north - y * stepLat];
        const topEdge = () => point(i + (level - a) / (b - a), j);
        const right = () => point(i + 1, j + (level - b) / (c - b));
        const bottom = () => point(i + (level - d) / (c - d), j + 1);
        const left = () => point(i, j + (level - a) / (d - a));
        const add = (p, q) => segments.push([p(), q()]);
        switch (index) {
          case 1: case 14: add(left, bottom); break;
          case 2: case 13: add(bottom, right); break;
          case 3: case 12: add(left, right); break;
          case 4: case 11: add(topEdge, right); break;
          case 6: case 9: add(topEdge, bottom); break;
          case 7: case 8: add(left, topEdge); break;
          case 5: add(left, topEdge); add(bottom, right); break;
          case 10: add(left, bottom); add(topEdge, right); break;
          default: break;
        }
      }
    }
    features.push({
      type: 'Feature',
      geometry: { type: 'MultiLineString', coordinates: joinSegments(segments) },
      properties: { height: level, major: level % MAJOR_INTERVAL === 0 },
    });
  }
  return { type: 'FeatureCollection', features };
}

// 끝이 맞닿은 짧은 선분들을 긴 선으로 잇는다 (높이 글자를 선을 따라 붙이려면 선이 길어야 한다)
function joinSegments(segments) {
  const key = ([x, y]) => `${x.toFixed(7)},${y.toFixed(7)}`;
  const byEnd = new Map(); // 점 → 그 점에서 끝나는 선분 번호들
  segments.forEach(([p, q], index) => {
    for (const end of [p, q]) {
      const k = key(end);
      if (!byEnd.has(k)) byEnd.set(k, []);
      byEnd.get(k).push(index);
    }
  });
  const used = new Array(segments.length).fill(false);
  const lines = [];
  // 한 끝에서 이어지는 선분을 따라 계속 붙인다
  const extend = (line) => {
    for (;;) {
      const last = line[line.length - 1];
      const next = (byEnd.get(key(last)) ?? []).find((index) => !used[index]);
      if (next === undefined) return;
      used[next] = true;
      const [p, q] = segments[next];
      line.push(key(p) === key(last) ? q : p);
    }
  };
  segments.forEach(([p, q], index) => {
    if (used[index]) return;
    used[index] = true;
    const line = [p, q];
    extend(line);
    line.reverse();
    extend(line);
    lines.push(line);
  });
  return lines;
}
