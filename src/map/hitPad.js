// 지도 위 역·선로·흰 점을 누를 때 빗나가도 잡히는 여유(px).
// 손가락이 주로 쓰는 화면(휴대폰·태블릿)은 마우스보다 넓게 잡는다 (config.js의 FINGER_HIT_PAD_PX)
import { FINGER_HIT_PAD_PX } from '../config.js';

// 손가락이 주로 쓰는 화면인지 (화면 글도 "클릭·Enter" 대신 손가락 말로 바꾼다, ui/)
export const FINGER = window.matchMedia('(pointer: coarse)').matches;

// mousePx: 마우스일 때의 여유
export const hitPad = (mousePx) => (FINGER ? Math.max(mousePx, FINGER_HIT_PAD_PX) : mousePx);
