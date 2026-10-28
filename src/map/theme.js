// 관제실 모드: 지도와 플레이어가 지은 것의 색을 한꺼번에 바꾼다 ([관제실] 버튼, ui/viewToggles.js).
// 실제 철도 관제실 화면처럼 바탕은 짙은 회남색으로 차분하게, 색은 플레이어가 지은 것(노선 색, 승강장)에만 남긴다.
// 반투명·빛 번짐 없이 색만 바꾸므로 플랫 규칙은 그대로다. (근거: reports/디비전 게임 UI 디자인.md 길 2)
// - 바탕 지도: 레이어마다 적어 둔 팔레트 이름(metadata 'railmap:palette')으로 PALETTE ↔ CONTROL_ROOM_PALETTE를 바꾼다
// - 선로·역·출구·등고선: 아래 표의 레이어 색을 바꾼다
import { PALETTE, CONTROL_ROOM_PALETTE } from './style.js';
import { setCapsuleOutline } from './stationIcons.js';

// 플레이어 레이어 색: [레이어 id, 칠할 곳, 낮(베이지) 색, 관제실 색]
// 선로는 밝은 회색 몸통 + 어두운 테두리로 뒤집어서, 짙은 바탕에서도 또렷하게 보이게 한다
const LAYER_COLORS = [
  ['track-casing', 'line-color', '#D8C9AA', '#1E2630'],
  ['track-body', 'line-color', '#3E4651', '#8C98A5'],
  ['track-tunnel', 'line-color', '#EFE7D6', '#1E2630'],
  ['station-circles', 'circle-stroke-color', '#1F3A55', '#D3DCE5'],
  ['station-transfer-circles', 'circle-stroke-color', '#1F3A55', '#D3DCE5'],
  ['station-band-casing', 'line-color', '#1F3A55', '#D3DCE5'],
  ['exit-passage-casing', 'line-color', '#1F3A55', '#D3DCE5'],
  ['station-catchment', 'line-color', '#1F3A55', '#D3DCE5'],
  ['contour-minor', 'line-color', '#DACDB2', '#2E3946'],
  ['contour-major', 'line-color', '#C4B391', '#45515F'],
  ['contour-label', 'text-color', '#9A8F7B', '#73828F'],
  ['contour-label', 'text-halo-color', '#EFE7D6', '#1E2630'],
  ['exit-building-labels', 'text-halo-color', '#FFFFFF', '#1E2630'],
  ['exit-building-labels', 'text-color', '#1F3A55', '#D3DCE5'],
  ['exit-dots', 'circle-stroke-color', '#1F3A55', '#D3DCE5'],
  ['exit-dots-nameless', 'circle-stroke-color', '#1F3A55', '#D3DCE5'],
  // 고속철도역 (플레이어가 지은 것이 아니라 바탕처럼 차분하게)
  ['intercity-links', 'line-color', '#1F3A55', '#D3DCE5'],
  ['intercity-circles', 'circle-color', '#FBF7EE', '#2E3946'],
  ['intercity-circles', 'circle-stroke-color', '#A69C8B', '#73828F'],
  ['intercity-labels', 'text-color', '#6F6656', '#9AA7B4'],
  ['intercity-labels', 'text-halo-color', '#EFE7D6', '#1E2630'],
];
// 노선이 지나지 않는 선로의 가운데 줄 (노선이 지나면 노선 색)
const CENTER = { day: '#D8C9AA', control: '#1E2630' };

// on: 관제실 모드를 켤지
export function applyMapTheme(map, on) {
  const palette = on ? CONTROL_ROOM_PALETTE : PALETTE;
  // 환승역 캡슐은 그림이라 테두리 색을 그릴 때 정한다 (바꾼 뒤 역을 다시 그리면 새 색 그림을 쓴다)
  setCapsuleOutline(on ? '#D3DCE5' : '#1F3A55');
  for (const layer of map.getStyle().layers) {
    const roles = layer.metadata?.['railmap:palette'];
    if (!roles) continue;
    for (const [prop, key] of Object.entries(roles)) map.setPaintProperty(layer.id, prop, palette[key]);
  }
  for (const [id, prop, day, control] of LAYER_COLORS) {
    if (map.getLayer(id)) map.setPaintProperty(id, prop, on ? control : day);
  }
  map.setPaintProperty('track-center', 'line-color', [
    'coalesce',
    ['get', 'routeColor'],
    on ? CENTER.control : CENTER.day,
  ]);
}
