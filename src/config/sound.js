// 소리 숫자: 효과음·배경 음악·레일 덜컹 (ui/sounds.js, 설계 근거 docs/sound-research.md).
// (src/config.js가 이 파일을 그대로 내보낸다)

// ── 소리 (ui/sounds.js, 설계 근거 docs/sound-research.md) ──
// 효과음에 쓰는 음: C장조 5음 음계(도·레·미·솔·라). 반음으로 부딪치는 음이 없어서 소리가 겹쳐도 어울린다.
// 새 소리를 만들 때도 이 음들만 쓴다 (Hz)
export const SOUND_NOTES = {
  C5: 523.25, // 도
  D5: 587.33, // 레
  E5: 659.25, // 미
  G5: 783.99, // 솔
  A5: 880.0, // 라
};
// 소리마다 크기 (dB). −6이면 대략 절반. 자주 나는 소리일수록 작게 (악기마다 크게 들리는 정도가 달라서 귀로 맞춘 값)
export const SOUND_LEVELS = {
  open: -3, // 노선 개통 (아주 드묾, 가장 큰 소리)
  horn: -14, // 새 노선의 첫 열차가 떠날 때 경적 (노선마다 한 번). 톱니파라 같은 값이어도 크게 들려서 낮게
  track: -4, // 선로 완성
  station: -6, // 역 놓기
  arrive: -14, // 열차 도착 (계속 남)
  clack: -23, // 레일 덜컹 (아주 가까이 볼 때 열차 한 대만, 계속 남)
};
// 가장 큰 소리(노선 개통)의 크기 (0~1). 음량 막대를 끝까지 올렸을 때 기준
export const SOUND_PEAK = 0.3;
// 음량 막대 처음 값 (0~1)
export const DEFAULT_SOUND_VOLUME = 0.8;
// 매번 크기와 길이를 이만큼(±) 무작위로 바꿔서 똑같이 반복되지 않게 한다 (0.05 = ±5%)
export const SOUND_VARIATION = 0.05;
// 맨 끝 압축기: 소리가 겹쳐 갑자기 커질 때만 부드럽게 눌러 준다 (브라우저 기본값보다 약하게)
// threshold 이 크기(dB)를 넘으면 누르기 시작, ratio 넘친 만큼을 이 비율로 줄임, knee 부드럽게 시작하는 폭(dB),
// attack·release 누르기 시작·풀리는 데 걸리는 초
export const SOUND_COMPRESSOR = { threshold: -18, knee: 12, ratio: 4, attack: 0.005, release: 0.2 };
// 노선 개통·경적처럼 큰 소리가 날 때 열차 소리(도착·덜컹)와 배경 음악을 이만큼(dB) 잠깐 줄인다 (덕킹)
export const DUCK_DB = -6;
// 열차가 역에 서는 소리는 열차가 많아도 이만큼(실제 초)에 한 번만 낸다 (3배속이어도 같다)
// 그 사이에 선 열차들은 묶어서 다음 소리 때 한꺼번에 낸다
export const ARRIVAL_SOUND_GAP_SECONDS = 1.5;
// 노선마다 열차 도착 음 (SOUND_NOTES의 이름). 1호선 라, 2호선 미, 3호선 솔, 4호선 도, 5호선 레, 6호선부터 다시 라
// 소리만 들어도 어느 노선 열차가 섰는지 어렴풋이 알 수 있게
export const ARRIVAL_NOTES = ['A5', 'E5', 'G5', 'C5', 'D5'];
// 열차 도착 소리는 이 줌 이상으로 가까이 볼 때만, 화면 안 역에 선 열차만 낸다
// (15 ≈ 화면에 동네 몇 블록, 가로 2~3km). 멀리서 노선망 전체를 볼 때는 열차가 몇십 대여도 조용하다
export const ARRIVAL_SOUND_MIN_ZOOM = 15;
// 한 번에 내는 열차 음은 많아야 이만큼 (서로 다른 노선 음), 음 사이 간격 (초)
export const MAX_ARRIVAL_NOTES = 2;
export const ARRIVAL_NOTE_SPACING = 0.12;
// 울림(잔향): 넓은 역 대합실 안처럼 소리 뒤에 옅은 울림을 남긴다
// 울림이 사라지는 데 걸리는 초, 울림 크기 (dB, 원래 소리 대비. 작을수록 옅다)
export const REVERB_SECONDS = 1.8;
export const REVERB_DB = -15;
// 레일 덜컹 소리: 이 줌 이상으로 아주 가까이 볼 때, 화면 가운데에서 가장 가까운 달리는 열차 한 대만 낸다
// (16 ≈ 화면에 한두 블록). 열차 30대가 모두 내면 가장 피곤한 소리가 되므로 한 대만
export const CLACK_MIN_ZOOM = 16;
// 최고 속도로 달릴 때 "따닥" 사이 간격 (실제 초). 느리게 달리면 간격이 길어지고, 서 있으면 조용하다
export const CLACK_GAP_SECONDS = 0.8;
// 화면 가운데에서 이만큼(화면 픽셀) 넘게 떨어진 열차는 덜컹 소리를 내지 않는다. 가까울수록 크다
export const CLACK_REACH_PX = 400;
// 배경 음악: 5음 음계의 느린 화음 위에 가끔 음 몇 개가 지도 음색으로 울린다 ([음악] 버튼으로 끄고 켠다)
// 빠르기 (1분에 몇 박. 72 = 한 박 약 0.8초), 크기 (dB, 노선 개통 소리 대비. 효과음보다 훨씬 작게)
export const MUSIC_BPM = 72;
export const MUSIC_DB = -25;
// 화음 순서. 한 화음이 MUSIC_CHORD_BEATS박 동안 이어진 뒤 다음으로 넘어가고, 끝나면 처음부터 다시
// 음 이름 = SOUND_NOTES의 글자 + 옥타브 숫자 (C3은 C5보다 두 옥타브 낮은 도). 모두 5음 음계 안의 음
export const MUSIC_CHORDS = [
  ['C3', 'G3', 'E4'], // 도 화음
  ['A2', 'E3', 'C4'], // 라 화음 (조금 쓸쓸하게)
  ['D3', 'A3', 'E4'], // 레·라·미 (열린 느낌)
  ['G2', 'D3', 'A3'], // 솔·레·라 (다시 도로 돌아가고 싶게)
];
export const MUSIC_CHORD_BEATS = 8;
// 멜로디에 쓰는 음 (낮은 음부터 차례로). 앞 음에서 한두 칸만 움직여서 노래처럼 들리게 한다
export const MUSIC_MELODY_NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
// 반 박마다 멜로디 음이 날 확률. 노선이 없으면 처음 값, 노선이 하나 늘 때마다 조금씩 늘어 최대값까지
// (노선망이 커질수록 음악이 조금씩 풍성해진다). 멈춤 중에는 화음만 울린다
export const MUSIC_NOTE_CHANCE = { start: 0.08, perRoute: 0.03, max: 0.28 };
