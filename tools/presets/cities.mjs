// 실제 노선망 프리셋에 넣을 도시와 노선 (tools/make-presets.mjs가 읽는다)
// 도시마다 넣을 노선: number = lineColors.js의 그 도시 목록 번호(색과 이름), name = 다른 이름을 쓸 때,
// relation = 계통 하나를 직접 고를 때 (OpenStreetMap route 번호), master = 노선 전체(route_master 번호, 계통·갈래는 저절로 고른다)
export const CITIES = {
  seoul: [
    { number: 1, name: '1호선 경원·경인선', relation: 8691809 }, // 소요산 → 인천
    { number: 1, name: '1호선 경부선', relation: 8692707 }, // 광운대 → 신창
    { number: 2, relation: 2404374 }, // 외선순환 (시청에서 시작해 시청으로 돌아온다)
    { number: 2, name: '2호선 성수지선', relation: 4729405 },
    { number: 2, name: '2호선 신정지선', relation: 4729407 },
    { number: 3, relation: 443803 }, // 대화 → 오금
    { number: 4, relation: 2718884 }, // 불암산 → 오이도
    { number: 5, relation: 12497486 }, // 방화 → 하남검단산
    { number: 5, name: '5호선 마천지선', relation: 4744338 }, // 강동 → 마천
    { number: 6, relation: 12080315 }, // 응암순환 → 신내
    { number: 7, relation: 12746493 }, // 장암 → 석남
    { number: 8, relation: 2718901 }, // 별내 → 모란
    { number: 9, relation: 2718888 }, // 개화 → 중앙보훈병원
  ],
  busan: [
    { number: 1, master: 8255698 },
    { number: 2, master: 8258658 },
    { number: 3, master: 8247017 },
    { number: 4, master: 8258702 },
  ],
  daegu: [
    { number: 1, master: 7845971 },
    { number: 2, master: 7845969 },
    { number: 3, master: 7845965 },
  ],
  incheon: [
    { number: 1, master: 7854149 },
    { number: 2, master: 7527498 },
  ],
  daejeon: [{ number: 1, master: 7792528 }],
  gwangju: [{ number: 1, master: 13538911 }],
  tokyo: [
    { number: 1, master: 8026077 }, // 긴자선
    { number: 2, master: 8015940 }, // 마루노우치선 (호난초 갈래)
    { number: 3, master: 8026149 }, // 히비야선
    { number: 4, master: 8026124 }, // 도자이선
    { number: 5, master: 8026069 }, // 지요다선
    { number: 6, master: 8026115 }, // 유라쿠초선
    { number: 7, master: 8026157 }, // 한조몬선
    { number: 8, master: 8026071 }, // 난보쿠선
    { number: 9, master: 8026161 }, // 후쿠토신선
    { number: 10, master: 8019854 }, // 도에이 아사쿠사선
    { number: 11, master: 8019914 }, // 도에이 미타선
    { number: 12, master: 8019866 }, // 도에이 신주쿠선
    { number: 13, master: 8019893 }, // 도에이 오에도선
  ],
  osaka: [
    { number: 1, master: 8028805 }, // 미도스지선
    { number: 2, master: 8028879 }, // 다니마치선
    { number: 3, master: 8028853 }, // 요쓰바시선
    { number: 4, master: 8028811 }, // 주오선
    { number: 5, master: 8028801 }, // 센니치마에선
    { number: 6, master: 8028828 }, // 사카이스지선
    { number: 7, master: 8028846 }, // 나가호리쓰루미료쿠치선
    { number: 8, master: 8028826 }, // 이마자토스지선
    { number: 9, master: 9603949 }, // 난코포트타운선
  ],
  chicago: [
    { number: 1, master: 2584583 }, // 레드라인
    { number: 2, master: 2672370 }, // 블루라인
    { number: 3, master: 2562976 }, // 브라운라인
    { number: 4, master: 2613599 }, // 그린라인
    { number: 5, master: 2578312 }, // 오렌지라인
    { number: 6, master: 2675822 }, // 퍼플라인
    { number: 7, master: 2656070 }, // 핑크라인
    { number: 8, master: 2622574 }, // 옐로라인
  ],
  // 뉴욕: 계통(1·2·3, A·C·E …)마다 노선 하나. 이름은 뉴욕 사람들이 부르는 대로 "A 트레인", 색은 lineColors.js의 노선 묶음 색.
  // 셔틀(S, 역 2~5곳), Z(J와 같은 선로에서 몇 역만 서는 계통), 다이아몬드 급행(<6> <7> <F>)은 뺐다
  newyork: [
    { number: 1, name: '1 트레인', master: 9651536 },
    { number: 1, name: '2 트레인', master: 9655665 },
    { number: 1, name: '3 트레인', master: 9663807 },
    { number: 2, name: '4 트레인', master: 9677108 },
    { number: 2, name: '5 트레인', master: 9682651 },
    { number: 2, name: '6 트레인', master: 366777 },
    { number: 3, name: '7 트레인', master: 366765 },
    { number: 4, name: 'A 트레인', master: 366774 },
    { number: 4, name: 'C 트레인', master: 9767766 },
    { number: 4, name: 'E 트레인', master: 9769302 },
    { number: 5, name: 'B 트레인', master: 9748435 },
    { number: 5, name: 'D 트레인', master: 9769161 },
    { number: 5, name: 'F 트레인', master: 9753684 },
    { number: 5, name: 'M 트레인', master: 9712349 },
    { number: 6, name: 'G 트레인', master: 366764 },
    { number: 7, name: 'J 트레인', master: 9747970 },
    { number: 8, name: 'L 트레인', master: 9716997 },
    { number: 9, name: 'N 트레인', master: 366768 },
    { number: 9, name: 'Q 트레인', master: 366769 },
    { number: 9, name: 'R 트레인', master: 366780 },
    { number: 9, name: 'W 트레인', master: 6942556 },
  ],
  london: [
    { number: 1, master: 7666698 }, // 베이커루선
    { number: 2, master: 7254206 }, // 센트럴선
    { number: 3, master: 7671007 }, // 서클선
    { number: 4, master: 7677096 }, // 디스트릭트선
    { number: 6, master: 7666927 }, // 해머스미스 & 시티선
    { number: 7, master: 7673326 }, // 주빌리선
    { number: 8, master: 7673626 }, // 메트로폴리탄선
    { number: 9, master: 7702944 }, // 노던선
    { number: 10, master: 7702940 }, // 피카딜리선
    { number: 11, master: 6354922 }, // 빅토리아선
    { number: 12, master: 7672075 }, // 워털루 & 시티선
  ],
  paris: [
    { number: 1, master: 3328695 },
    { number: 2, master: 7227705 },
    { number: 3, master: 7733214 },
    { number: 13, name: '3bis호선', master: 7420646 }, // 13호선과 같은 하늘색
    { number: 4, master: 3326845 },
    { number: 5, master: 7420645 },
    { number: 6, master: 3328765 },
    { number: 7, master: 3328805 },
    { number: 6, name: '7bis호선', master: 2554103 }, // 6호선과 같은 연두색
    { number: 8, master: 7420644 },
    { number: 9, master: 3328717 },
    { number: 10, master: 3328741 },
    { number: 11, master: 7420643 },
    { number: 12, master: 7420642 },
    { number: 13, master: 7420641 },
    { number: 14, master: 3328694 },
  ],
};

// 이름이 다르지만 실제로 갈아타는 역 (LINKED_M 안이면 같은 역으로 친다)
export const JOINS = {
  tokyo: [
    ['고라쿠엔', '가스가'],
    ['히가시니혼바시', '바쿠로요코야마'],
    ['아와지초', '오가와마치'],
    ['키타센쥬', '기타센주'], // 같은 역의 다른 한글 표기
  ],
  osaka: [['다니마치로쿠초메', '다니마치6초메']], // 같은 역의 다른 한글 표기
};

// 가까워도 갈아탈 수 없는 따로인 역 (정류 위치가 MERGE_M 안에 붙어 있어도 합치지 않는다)
export const APART = {
  newyork: [
    ['Park Place', 'City Hall'],
    ['Grand Army Plaza', '7th Avenue'],
    ['Broadway–Lafayette Street', 'Prince Street'],
  ],
};

// 이름이 같은 정류 위치를 같은 역으로 치는 거리(m)를 도시마다 다르게 (적지 않으면 stations.mjs의 SAME_NAME_M).
// 뉴욕은 길 번호가 역 이름이라 "23rd Street"가 맨해튼에만 다섯 곳(애비뉴마다 따로)이어서 짧게 둔다
export const SAME_NAME_DISTANCE = { newyork: 200 };
