// 도시마다 실제 지하철·도시철도 노선 이름과 색. 새 노선은 이 순서대로 이름과 색을 받고 (첫 노선이 첫째),
// 모자라면 이름은 "n호선", 색은 config.js의 추천 색으로 이어 간다. 노선 패널의 색 견본에도 이 이름으로 나온다.
// 이름은 노선 목록·말풍선에 그대로 나오므로 짧게 쓴다. 노선 번호 배지(1, 2, 3 …)와 헷갈리지 않게, 실제 번호가 순서와 다른
// 뉴욕은 기호(1·2·3, A·C·E) 대신 MTA의 공식 노선 이름(브로드웨이–7번가선 …)을 쓰고 기호는 옆에 적어 둔다. 지도 id는 regions.js와 같다 (가상 지도는 목록이 없어서 추천 색만 쓴다).
// 출처: 운영사가 색 번호를 공개하지 않아서 위키백과의 노선색 틀을 썼다 (2026-10-28 확인)
// - 한국 도시: 한국어 위키백과 「틀:한국 철도 노선색」, 영어 위키백과 Module:Adjacent stations와 대조
//   (서로 조금 다르면 한국어 쪽. 인천은 영어 쪽 2호선이 부산 1호선 값을 베낀 것으로 보여 한국어 쪽을 썼다)
// - 도쿄: 도쿄메트로(개통 순) 다음 도에이(개통 순). 운영사가 색 번호를 공개하지 않아 위키백과 Module:Adjacent stations와
//   오픈데이터 프로젝트 Mini Tokyo 3D의 같은 값을 썼다
// - 뉴욕: MTA의 전통 노선 색(Pantone 기준, 노선도·표지판의 색). 노선 묶음마다 한 색 (1/2/3, 4/5/6 …). 회색이 둘이라 셔틀(S)은 뺐다
// - 런던: TfL Colour Standard의 화면용 색 (알파벳 순, 엘리자베스선은 TfL Design Idiom). 노던선은 원래 검정이다
// - 파리: 일드프랑스 모빌리테(IDFM) 공개 자료의 공식 웹 색 (1~14호선. 3bis·7bis는 13·6호선과 같은 색이라 뺐다)
// 순서: 번호가 있는 노선은 번호 순, 그 뒤에 그 도시의 이름 있는 노선을 덧붙였다
export const LINE_COLORS = {
  seoul: [
    { name: '1호선', color: '#0052A4' },
    { name: '2호선', color: '#00A84D' },
    { name: '3호선', color: '#EF7C1C' },
    { name: '4호선', color: '#00A5DE' },
    { name: '5호선', color: '#996CAC' },
    { name: '6호선', color: '#CD7C2F' },
    { name: '7호선', color: '#747F00' },
    { name: '8호선', color: '#E6186C' },
    { name: '9호선', color: '#BDB092' },
    { name: '신분당선', color: '#D4003B' },
    { name: '경의·중앙선', color: '#77C4A3' },
    { name: '수인·분당선', color: '#F5A200' },
    { name: '공항철도', color: '#0090D2' },
    { name: '우이신설선', color: '#B0CE18' },
    { name: '신림선', color: '#6789CA' },
  ],
  busan: [
    { name: '1호선', color: '#F06A00' },
    { name: '2호선', color: '#81BF48' },
    { name: '3호선', color: '#BB8C00' },
    { name: '4호선', color: '#217DCB' },
    { name: '부산김해경전철', color: '#8652A1' },
    { name: '동해선', color: '#0066B3' },
  ],
  incheon: [
    { name: '인천 1호선', color: '#7CA8D5' },
    { name: '인천 2호선', color: '#ED8B00' },
  ],
  daegu: [
    { name: '1호선', color: '#D93F5C' },
    { name: '2호선', color: '#00AA80' },
    { name: '3호선', color: '#FFB100' },
  ],
  daejeon: [{ name: '1호선', color: '#007448' }],
  gwangju: [
    { name: '1호선', color: '#009088' },
    { name: '2호선', color: '#0471C3' }, // 아직 공사 중인 노선
  ],
  tokyo: [
    { name: '긴자선', color: '#FF9500' },
    { name: '마루노우치선', color: '#F62E36' },
    { name: '히비야선', color: '#B5B5AC' },
    { name: '도자이선', color: '#009BBF' },
    { name: '지요다선', color: '#00BB85' },
    { name: '유라쿠초선', color: '#C1A470' },
    { name: '한조몬선', color: '#8F76D6' },
    { name: '난보쿠선', color: '#00AC9B' },
    { name: '후쿠토신선', color: '#9C5E31' },
    { name: '도에이 아사쿠사선', color: '#EC6E65' },
    { name: '도에이 미타선', color: '#006AB8' },
    { name: '도에이 신주쿠선', color: '#B0BF1E' },
    { name: '도에이 오에도선', color: '#CE045B' },
  ],
  newyork: [
    { name: '브로드웨이–7번가선', color: '#EE352E' }, // 1·2·3
    { name: '렉싱턴가선', color: '#00933C' }, // 4·5·6
    { name: '플러싱선', color: '#B933AD' }, // 7
    { name: '8번가선', color: '#0039A6' }, // A·C·E
    { name: '6번가선', color: '#FF6319' }, // B·D·F·M
    { name: '크로스타운선', color: '#6CBE45' }, // G
    { name: '나소가선', color: '#996633' }, // J·Z
    { name: '커내시선', color: '#A7A9AC' }, // L (14번가–커내시)
    { name: '브로드웨이선', color: '#FCCC0A' }, // N·Q·R·W
  ],
  london: [
    { name: '베이커루선', color: '#B36305' },
    { name: '센트럴선', color: '#E32017' },
    { name: '서클선', color: '#FFD300' },
    { name: '디스트릭트선', color: '#00782A' },
    { name: '엘리자베스선', color: '#6950A1' },
    { name: '해머스미스 & 시티선', color: '#F3A9BB' },
    { name: '주빌리선', color: '#A0A5A9' },
    { name: '메트로폴리탄선', color: '#9B0056' },
    { name: '노던선', color: '#000000' },
    { name: '피카딜리선', color: '#003688' },
    { name: '빅토리아선', color: '#0098D4' },
    { name: '워털루 & 시티선', color: '#95CDBA' },
  ],
  paris: [
    { name: '1호선', color: '#FFBE00' },
    { name: '2호선', color: '#0055C8' },
    { name: '3호선', color: '#6E6E00' },
    { name: '4호선', color: '#A0006E' },
    { name: '5호선', color: '#FF5A00' },
    { name: '6호선', color: '#82DC73' },
    { name: '7호선', color: '#FF82B4' },
    { name: '8호선', color: '#D282BE' },
    { name: '9호선', color: '#D2D200' },
    { name: '10호선', color: '#DC9600' },
    { name: '11호선', color: '#6E491E' },
    { name: '12호선', color: '#00643C' },
    { name: '13호선', color: '#82C8E6' },
    { name: '14호선', color: '#640082' },
  ],
};

// 광역급행 노선(노선 종류 [광역급행], game/routeKinds.js)의 실제 이름과 색. 광역급행 노선이 이 순서대로 받고,
// 모자라거나 목록이 없는 도시는 "급행 n호선"과 추천 색으로 이어 간다 (game/routeColors.js)
// - 서울: GTX(수도권 광역급행철도) A·B·C. 색은 공식 색을 확인하지 못해 다른 서울 노선과 구별되게 게임에서 고른 색이다
// - 런던: 엘리자베스선(크로스레일) — 위 지하철 목록에도 있어서, 이미 쓴 이름이면 건너뛴다
// - 파리: RER A~E. 색은 널리 쓰이는 RER 노선색 (공식 자료와 다시 맞춰 볼 것)
export const EXPRESS_LINE_COLORS = {
  seoul: [
    { name: 'GTX-A', color: '#9A6292' },
    { name: 'GTX-B', color: '#1E4F9C' },
    { name: 'GTX-C', color: '#3C8C5A' },
  ],
  london: [{ name: '엘리자베스선', color: '#6950A1' }],
  paris: [
    { name: 'RER A', color: '#E3051C' },
    { name: 'RER B', color: '#5291CE' },
    { name: 'RER C', color: '#FFCE00' },
    { name: 'RER D', color: '#00814F' },
    { name: 'RER E', color: '#C04191' },
  ],
};
