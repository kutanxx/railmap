// 화면 아래 종단면도: 선로를 따라 가며 땅 높이와 선로 높이, 터널·교량 구간을 옆에서 본 그림으로 보여준다.
// 선로를 그리는 중이거나, 선로·노선을 골랐을 때 나온다 (땅 높이가 있는 가상 지도만).
// 그림은 canvas에 그린다. 상태를 고치지 않고 받은 분석 결과(game/trackProfile.js)를 그리기만 한다.
import { isNarrowScreen } from './sidePanels.js';

const COLORS = {
  groundFill: '#E6D9BE', // 땅 (옆에서 본 단면)
  groundLine: '#B9A47E',
  rail: '#1F3A55', // 선로 (남색)
  tunnelBack: '#E9E0CC', // 터널 구간 바탕
  tunnelText: '#6F6656',
  water: '#B8CBDA', // 강·물
  pier: '#8FA6BB', // 교량 기둥
  grid: '#EFE7D6', // 높이 눈금선
  axis: '#6F6656', // 눈금 글자 (흰 바탕에서 읽기 충분히 진하게)
};
const PAD = { left: 44, right: 12, top: 10, bottom: 20 };
// 왼쪽 아래 버튼 줄·오른쪽 패널과 띄우는 간격 (px)
const GAP_PX = 12;
// 버튼 줄 옆 자리가 이보다 좁으면 (오른쪽 패널을 펼쳤을 때 등) 버튼 줄 위로 올려 넓게 그린다 (px)
const MIN_WIDTH_PX = 480;

export function createProfilePanel(element) {
  element.innerHTML = `
    <div class="profile-title"></div>
    <canvas class="profile-canvas"></canvas>
  `;
  const title = element.querySelector('.profile-title');
  const canvas = element.querySelector('.profile-canvas');

  // 자리: 왼쪽 아래 버튼 줄 오른쪽 ~ 오른쪽 패널 왼쪽 (버튼 줄 폭은 단계적 공개·화면 크기로 바뀌어서 볼 때마다 잰다).
  // 그 사이가 MIN_WIDTH_PX보다 좁으면 버튼 줄 바로 위에, 버튼 줄 왼쪽 끝부터 넓게.
  // 좁은 화면(휴대폰)에서는 화면 폭으로, 아래 버튼 줄(판이 열려 있으면 그 판) 바로 위에
  function place() {
    const buttons = document.querySelector('.bottom-left').getBoundingClientRect();
    const side = document.querySelector('.side').getBoundingClientRect();
    const sideOpen = document.body.classList.contains('side-panel-open');
    // 화면 크기 [작게][크게]는 판을 CSS zoom으로 줄이고 키워서, 자리 숫자도 그만큼 나눠 적는다
    const zoom = Number(getComputedStyle(element).zoom) || 1;
    const px = (value) => `${value / zoom}px`;
    if (isNarrowScreen()) {
      const above = sideOpen ? side.top : buttons.height > 0 ? buttons.top : window.innerHeight;
      element.style.left = px(8);
      element.style.right = px(8);
      element.style.bottom = px(window.innerHeight - above + 8);
    } else {
      const right = sideOpen ? window.innerWidth - side.left + GAP_PX : 16;
      const besideWidth = window.innerWidth - right - (buttons.right + GAP_PX);
      const beside = besideWidth >= MIN_WIDTH_PX;
      element.style.left = px(beside ? buttons.right + GAP_PX : buttons.left);
      element.style.right = px(right);
      element.style.bottom = px(beside ? 16 : window.innerHeight - buttons.top + GAP_PX);
    }
  }

  // view = { title: 제목, parts: [trackProfile 결과, …] (이어서 그린다) } 또는 null (숨김)
  function show(view) {
    element.hidden = !view;
    if (!view) return;
    place();
    const parts = view.parts.filter((part) => part.km > 0);
    const km = parts.reduce((sum, part) => sum + part.km, 0);
    const sum = (key) => parts.reduce((total, part) => total + part[key], 0);
    const grade = Math.max(0, ...parts.map((part) => part.maxGrade));
    const facts = [`${km.toFixed(1)} km`];
    if (sum('tunnelKm') >= 0.01) facts.push(`터널 ${sum('tunnelKm').toFixed(1)} km`);
    if (sum('bridgeKm') >= 0.01) facts.push(`교량 ${sum('bridgeKm').toFixed(1)} km`);
    facts.push(`가장 가파른 곳 ${(grade * 100).toFixed(1)}%`);
    title.textContent = `${view.title} · ${facts.join(' · ')}`;
    draw(canvas, parts, km);
  }

  show(null);
  return { show };
}

function draw(canvas, parts, totalKm) {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const g = canvas.getContext('2d');
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.clearRect(0, 0, width, height);
  if (totalKm <= 0) return;

  // 모든 점을 출발점에서 거리(km) 순으로 이어 붙인다
  const samples = [];
  let offset = 0;
  for (const part of parts) {
    part.ground.forEach((ground, i) => {
      samples.push({
        km: offset + i * part.stepKm,
        ground,
        rail: part.rail[i],
        water: part.water[i],
        type: part.type[i],
      });
    });
    offset += part.km;
  }

  // 높이 범위: 50m 단위로 맞추고 적어도 150m는 보이게
  let low = Infinity;
  let high = -Infinity;
  for (const s of samples) {
    low = Math.min(low, s.ground, s.rail);
    high = Math.max(high, s.ground, s.rail);
  }
  low = Math.max(0, Math.floor((low - 20) / 50) * 50);
  high = Math.ceil((high + 30) / 50) * 50;
  if (high - low < 150) high = low + 150;
  const X = (km) => PAD.left + (km / totalKm) * (width - PAD.left - PAD.right);
  const Y = (h) => PAD.top + (1 - (h - low) / (high - low)) * (height - PAD.top - PAD.bottom);
  const bottom = Y(low);

  // 눈금: 높이(왼쪽), 거리(아래)
  g.font = '12px sans-serif';
  g.fillStyle = COLORS.axis;
  g.textAlign = 'right';
  const yStep = high - low > 400 ? 100 : 50;
  for (let h = low; h <= high; h += yStep) {
    g.strokeStyle = COLORS.grid;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(PAD.left, Y(h));
    g.lineTo(width - PAD.right, Y(h));
    g.stroke();
    g.fillText(`${h}m`, PAD.left - 6, Y(h) + 3);
  }
  g.textAlign = 'center';
  const xStep = totalKm > 14 ? 2 : totalKm > 6 ? 1 : 0.5;
  for (let k = 0; k <= totalKm + 1e-6; k += xStep) g.fillText(`${k}km`, X(k), height - 5);

  // 터널 구간 바탕과 길이 글자
  for (const run of runsOf(samples, 'tunnel')) {
    const x0 = X(samples[run[0]].km);
    const x1 = X(samples[run[1]].km);
    g.fillStyle = COLORS.tunnelBack;
    g.fillRect(x0, PAD.top, x1 - x0, bottom - PAD.top);
    if (x1 - x0 > 70) {
      g.fillStyle = COLORS.tunnelText;
      g.font = 'bold 12px sans-serif';
      g.fillText(`터널 ${(samples[run[1]].km - samples[run[0]].km).toFixed(1)}km`, (x0 + x1) / 2, PAD.top + 12);
    }
  }

  // 땅 단면
  g.beginPath();
  g.moveTo(X(0), bottom);
  for (const s of samples) g.lineTo(X(s.km), Y(s.ground));
  g.lineTo(X(totalKm), bottom);
  g.closePath();
  g.fillStyle = COLORS.groundFill;
  g.fill();
  g.beginPath();
  samples.forEach((s, i) => (i ? g.lineTo(X(s.km), Y(s.ground)) : g.moveTo(X(s.km), Y(s.ground))));
  g.strokeStyle = COLORS.groundLine;
  g.lineWidth = 1.3;
  g.stroke();

  // 물 (땅 위에 파란 띠)
  g.fillStyle = COLORS.water;
  const stepPx = Math.max(2, X(samples[1]?.km ?? 0) - X(0) + 1);
  for (const s of samples) if (s.water) g.fillRect(X(s.km) - stepPx / 2, Y(s.ground) - 2, stepPx, 5);

  // 교량 기둥: 선로에서 땅까지
  g.strokeStyle = COLORS.pier;
  g.lineWidth = 1.5;
  samples.forEach((s, i) => {
    if (s.type !== 'bridge' || i % 2) return;
    g.beginPath();
    g.moveTo(X(s.km), Y(s.rail));
    g.lineTo(X(s.km), Y(s.ground));
    g.stroke();
  });

  // 선로: 땅 위·교량은 실선, 터널은 점선. 같은 종류끼리 이어서 한 번에 그어야 점선이 끊기지 않는다
  g.lineJoin = 'round';
  g.strokeStyle = COLORS.rail;
  g.lineWidth = 2.2;
  let start = 0;
  for (let i = 1; i <= samples.length; i++) {
    const tunnel = samples[start].type === 'tunnel';
    if (i < samples.length && (samples[i].type === 'tunnel') === tunnel) continue;
    const end = Math.min(i, samples.length - 1);
    g.setLineDash(tunnel ? [5, 4] : []);
    g.beginPath();
    for (let j = start; j <= end; j++) {
      if (j === start) g.moveTo(X(samples[j].km), Y(samples[j].rail));
      else g.lineTo(X(samples[j].km), Y(samples[j].rail));
    }
    g.stroke();
    start = i;
  }
  g.setLineDash([]);
}

// 같은 종류가 이어지는 구간들 [[첫 번호, 끝 번호], …]
function runsOf(samples, type) {
  const runs = [];
  let start = -1;
  samples.forEach((s, i) => {
    if (s.type === type && start < 0) start = i;
    if (s.type !== type && start >= 0) {
      runs.push([start, i - 1]);
      start = -1;
    }
  });
  if (start >= 0) runs.push([start, samples.length - 1]);
  return runs;
}
