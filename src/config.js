// 게임의 모든 숫자 설정. 주제별로 나눈 세 파일을 여기서 한꺼번에 내보낸다
// (코드는 지금처럼 이 파일에서 가져오고, 숫자를 고칠 때는 아래 파일을 연다). 값을 바꾸고 저장하면 브라우저가 알아서 새로고침된다.
// - config/rules.js    게임 규칙과 밸런스: 시간·열차, 돈·빚, 지형, 날짜, 승객 수요, 역 주변 인구, 게임 목표, 요금
// - config/display.js  화면 모양: 지도 주소·시작 날짜, 역(승강장) 모양, 역 출구, 노선 색, 통계 그래프, 노선도, 알림
// - config/sound.js    소리: 효과음, 배경 음악, 레일 덜컹
// 지도 목록과 지도별 밸런스(시작 자금, 인구 배율 등)는 regions.js에 있다
export * from './config/rules.js';
export * from './config/display.js';
export * from './config/sound.js';
