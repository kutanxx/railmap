// "만약에" 노선: 도시마다 실제로 짓고 있거나 계획만 된 노선 (tools/make-whatif.mjs가 역 자리를 찾아 src/data/whatif.json에 적는다).
// 게임의 [메뉴] → [만약에 노선]에서 카드로 고르면 계획 선로(주황 점선)로 깔린다 (game/whatIf.js).
// 역: 문자열이면 그 이름, { name: 게임에 보일 이름, find: 지도 자료에서 찾을 이름, coord: [경도, 위도] (직접 적은 자리) }.
// 역 자리는 그 도시 실제 노선망 프리셋의 같은 이름 역 → OpenStreetMap의 역(짓는 중·계획 포함) 이름 → 직접 적은 자리 순서로 찾는다.
// prefer: 'osm'이면 OpenStreetMap을 먼저 (뉴욕처럼 같은 이름 역이 여러 곳인 도시). relation: OpenStreetMap 노선 자료의 선로 가까이 역들을 끝에서부터 이어서.
// 상태·개통 예정은 2026년 11월 기준으로 널리 알려진 것 (대략). 노선 모양은 역 사이 곧은 선 (계획 선로라 끌어서 고칠 수 있다)
export const WHAT_IF = {
  seoul: [
    {
      id: 'gtx-b',
      name: 'GTX-B',
      status: '공사 중 · 2030년쯤 개통 예정',
      stations: ['부천종합운동장', '신도림', '여의도', '용산', '서울역', '청량리', '상봉', '별내'],
    },
    {
      id: 'gtx-c',
      name: 'GTX-C',
      status: '공사 중 · 2028년쯤 개통 예정',
      stations: ['창동', '광운대', '청량리', '왕십리', '삼성', '양재', '과천', '인덕원'],
    },
    {
      id: 'sinansan',
      name: '신안산선',
      status: '공사 중',
      stations: [
        '여의도',
        '영등포',
        // 도림사거리·대림삼거리·시흥사거리역은 지도 자료에 아직 없어 뺐다
        '신풍',
        '구로디지털단지',
        '독산',
        '석수',
        { name: '광명', coord: [126.8847, 37.4163] }, // KTX 광명역
      ],
    },
  ],
  busan: [
    {
      id: 'sasang-hadan',
      name: '사상–하단선',
      status: '공사 중',
      stations: ['사상', '새벽시장', '사상스마트시티', '학장', '엄궁', '동아대', '하단'],
    },
    {
      id: 'yangsan',
      name: '양산선',
      status: '공사 중',
      stations: ['노포', '사송', '내송', '북정', '신기', '양산중앙', '양산시청'],
    },
  ],
  tokyo: [
    {
      id: 'yurakucho-sumiyoshi',
      name: '유라쿠초선 스미요시 연장',
      status: '공사 중 · 2030년대 개통 예정',
      stations: ['도요스', { name: '에다가와', find: '枝川' }, '도요초', { name: '센고쿠', find: '千石' }, '스미요시'],
    },
    {
      id: 'namboku-shinagawa',
      name: '난보쿠선 시나가와 연장',
      status: '공사 중 · 2030년대 개통 예정',
      stations: ['시로카네타카나와', '시나가와'],
    },
  ],
  osaka: [
    {
      id: 'naniwasuji',
      name: '나니와스지선',
      status: '공사 중 · 2031년쯤 개통 예정',
      // 지도 자료에 아직 역이 없어 계획 노선도를 보고 자리를 적었다 (대략)
      stations: [
        { name: '오사카(우메키타)', coord: [135.4943, 34.7047] },
        { name: '나카노시마', coord: [135.4904, 34.6912] },
        { name: '니시혼마치', coord: [135.4929, 34.6826] },
        { name: 'JR난바', coord: [135.4953, 34.6679] },
        { name: '신이마미야', coord: [135.5013, 34.6503] },
      ],
    },
  ],
  london: [
    {
      id: 'bakerloo-lewisham',
      name: '베이커루선 루이셤 연장',
      status: '계획',
      stations: ['Elephant & Castle', 'Burgess Park', 'Old Kent Road', 'New Cross Gate', 'Lewisham'],
    },
  ],
  paris: [
    // 그랑 파리 익스프레스 16·17·18호선은 거의 지도 범위 밖이고, OpenStreetMap 노선 자료에 역이 없어 15호선 남쪽 구간만 역 이름으로 적었다
    {
      id: 'gpe-15-sud',
      name: '그랑 파리 익스프레스 15호선 남쪽',
      status: '공사 중 · 2026년쯤 개통 예정',
      stations: [
        'Pont de Sèvres',
        'Issy RER',
        "Fort d'Issy - Vanves - Clamart",
        'Châtillon - Montrouge',
        'Bagneux',
        'Arcueil - Cachan',
        'Villejuif - Gustave Roussy',
        'Villejuif - Louis Aragon',
        'Vitry Centre',
        'Les Ardoines',
        'Le Vert de Maisons',
        "Créteil - L'Échat",
        'Saint-Maur - Créteil',
        'Champigny Centre',
      ],
    },
  ],
  newyork: [
    {
      id: 'second-avenue-2',
      name: '2번가 지하철 2단계',
      status: '공사 중',
      prefer: 'osm',
      stations: [
        { name: '96th Street', coord: [-73.9473, 40.7841] }, // 2번가선 96번가역 (Q 트레인)
        '106th Street',
        '116th Street',
        '125th Street',
      ],
    },
  ],
  chicago: [
    {
      id: 'red-line-extension',
      name: '레드라인 연장',
      status: '공사 중 · 2030년쯤 개통 예정',
      stations: ['95th/Dan Ryan', '103rd', '111th', 'Michigan', '130th'],
    },
  ],
};
