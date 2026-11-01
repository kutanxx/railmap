// 노선망이 자란 모습 다시 보기를 영상 파일로 저장한다 (ui/timelapse.js가 부른다).
// 지도 그림 위에 날짜·제목·지도 출처를 겹쳐 그린 캔버스를 브라우저에 들어 있는 녹화 기능(MediaRecorder)으로 찍는다.
// 지도 그림은 지도가 다시 그려질 때마다(MapLibre 'render' 이벤트) 옮겨 그린다. 그 순간에만 지도 캔버스를 읽을 수 있다.
// 역 이름 말풍선 같은 화면 글자는 지도 캔버스에 없으므로 영상에 들어가지 않는다 (다시 보기도 선과 역만 그린다).
import { cssColor } from './svg.js';

// 고를 영상 형식 (앞에서부터 이 브라우저가 찍을 수 있는 것)
const TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
const FRAME_RATE = 30;

const pickType = () => TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;

// 이 브라우저에서 영상을 찍을 수 있는지
export function canRecord() {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    pickType() !== null
  );
}

// 녹화를 시작한다. overlay(): 지금 겹쳐 쓸 글 { title, date, count, credit }
// 결과: { frame(): 지금 모습을 한 장 더 그리기, finish(fileName): 저장하고 끝내기(Promise), cancel(): 저장하지 않고 끝내기 }
export function startRecording(map, overlay) {
  const source = map.getCanvas();
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const g = canvas.getContext('2d');
  // 화면 1px이 캔버스 몇 칸인지 (고해상도 화면은 2배 등)
  const scale = source.width / source.clientWidth;
  const font = getComputedStyle(document.body).fontFamily;

  const draw = () => {
    g.drawImage(source, 0, 0);
    drawOverlay(g, canvas, scale, font, overlay());
  };
  map.on('render', draw);
  // 그림이 바뀌지 않아도 1초에 FRAME_RATE번 다시 그린다. 캔버스가 그대로면 영상에 장면이 쌓이지 않아서
  // 마지막 장면과 끝에 잠깐 멈춰 보여주는 시간이 영상에서 빠졌다
  const repaint = setInterval(() => map.triggerRepaint(), 1000 / FRAME_RATE);
  map.triggerRepaint();

  const type = pickType();
  const recorder = new MediaRecorder(canvas.captureStream(FRAME_RATE), { mimeType: type });
  const chunks = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  recorder.start();

  const stop = () =>
    new Promise((resolve) => {
      recorder.addEventListener('stop', resolve, { once: true });
      clearInterval(repaint);
      recorder.stop();
      map.off('render', draw);
    });

  return {
    frame: () => map.triggerRepaint(),
    finish: async (fileName) => {
      await stop();
      const extension = type.includes('mp4') ? 'mp4' : 'webm';
      download(new Blob(chunks, { type }), `${fileName}.${extension}`);
    },
    cancel: () => {
      stop();
    },
  };
}

// 영상 위에 겹쳐 쓰는 글: 왼쪽 위 남색 띠(제목 · 날짜 · 역·노선 수), 오른쪽 아래 지도 출처 (지우지 않는다)
// 날짜 배지처럼 남색 바탕에 흰 글자, 그림자 없이 플랫하게 (색은 styles/base.css의 변수, ui/svg.js의 cssColor)
function drawOverlay(g, canvas, scale, font, { title, date, count, credit }) {
  const pad = 14 * scale;
  g.textBaseline = 'top';
  // 왼쪽 위: 제목 줄, 날짜 줄(크게), 역·노선 수 줄
  g.font = `600 ${14 * scale}px ${font}`;
  const titleWidth = g.measureText(title).width;
  g.font = `700 ${24 * scale}px ${font}`;
  const dateWidth = g.measureText(date).width;
  g.font = `400 ${14 * scale}px ${font}`;
  const countWidth = g.measureText(count).width;
  const boxWidth = Math.max(titleWidth, dateWidth, countWidth) + pad * 2;
  const boxHeight = (14 + 6 + 24 + 6 + 14) * scale + pad * 2;
  g.fillStyle = cssColor('navy');
  g.fillRect(pad, pad, boxWidth, boxHeight);
  g.fillStyle = '#FFFFFF';
  g.font = `600 ${14 * scale}px ${font}`;
  g.fillText(title, pad * 2, pad * 2);
  g.font = `700 ${24 * scale}px ${font}`;
  g.fillText(date, pad * 2, pad * 2 + 20 * scale);
  g.font = `400 ${14 * scale}px ${font}`;
  g.fillStyle = cssColor('on-navy-soft');
  g.fillText(count, pad * 2, pad * 2 + 50 * scale);
  // 오른쪽 아래: 지도 출처
  g.font = `400 ${12 * scale}px ${font}`;
  const creditWidth = g.measureText(credit).width;
  const creditPad = 6 * scale;
  g.fillStyle = '#FFFFFF';
  g.fillRect(
    canvas.width - creditWidth - creditPad * 3,
    canvas.height - 12 * scale - creditPad * 3,
    creditWidth + creditPad * 2,
    12 * scale + creditPad * 2,
  );
  g.fillStyle = cssColor('muted');
  g.fillText(credit, canvas.width - creditWidth - creditPad * 2, canvas.height - 12 * scale - creditPad * 2);
}

// 만든 영상 파일을 내려받는다
function download(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
