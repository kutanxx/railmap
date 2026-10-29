// 도시마다 처음부터 지도에 있는 고속철도역 (KTX·SRT, 신칸센, 암트랙, 유로스타·TGV 등)과 공항역.
// 플레이어가 짓거나 운영하지 않는 "고정 역"이다: 누를 수도 지울 수도 없고 열차도 다니지 않는다.
// 가까이(config.js의 INTERCITY_LINK_M 안) 지하철역을 지으면, 이 역을 드나드는 사람이 그 지하철역 인구에 더해진다 (game/intercity.js).
// 그때 새 지하철역은 이 이름을 받는다 (서울역 옆 지하철역은 "서울역")
// size: 'large'(큰 역) | 'medium'(중간 역) — 드나드는 사람 수는 config.js의 INTERCITY_PEOPLE
// kind: 'airport'면 공항역 (지도·역 카드에 "공항"으로 적는다). 없으면 고속철도역
// 자리는 역 건물 가운데쯤 [경도, 위도]. 출처: OpenStreetMap 역 자리.
// 인천은 지금 KTX가 서는 역이 없어서, 대신 인천국제공항의 공항철도역 두 곳을 공항역으로 둔다.
// 솔내 지방(가상 지도)은 솔내 마을 남서쪽에 지어낸 역을 하나 둔다.
export const INTERCITY_STATIONS = {
  seoul: [
    { name: '서울역', coord: [126.9707, 37.5547], size: 'large' },
    { name: '용산역', coord: [126.9648, 37.5298], size: 'large' },
    { name: '수서역', coord: [127.1017, 37.4873], size: 'large' },
    { name: '광명역', coord: [126.8847, 37.4163], size: 'medium' },
    { name: '청량리역', coord: [127.0471, 37.5803], size: 'medium' },
    { name: '영등포역', coord: [126.9074, 37.5157], size: 'medium' },
  ],
  busan: [
    { name: '부산역', coord: [129.0397, 35.1152], size: 'large' },
    { name: '구포역', coord: [128.9973, 35.2054], size: 'medium' },
  ],
  incheon: [
    { name: '인천공항1터미널역', coord: [126.4525, 37.4475], size: 'large', kind: 'airport' },
    { name: '인천공항2터미널역', coord: [126.4337, 37.4665], size: 'medium', kind: 'airport' },
  ],
  daegu: [
    { name: '동대구역', coord: [128.6287, 35.8793], size: 'large' },
    { name: '대구역', coord: [128.5964, 35.8758], size: 'medium' },
  ],
  daejeon: [
    { name: '대전역', coord: [127.4348, 36.3324], size: 'large' },
    { name: '서대전역', coord: [127.4049, 36.3224], size: 'medium' },
  ],
  gwangju: [{ name: '광주송정역', coord: [126.7928, 35.1378], size: 'large' }],
  tokyo: [
    { name: '도쿄역', coord: [139.7671, 35.6812], size: 'large' },
    { name: '시나가와역', coord: [139.7387, 35.6285], size: 'large' },
    { name: '우에노역', coord: [139.7774, 35.7141], size: 'medium' },
  ],
  osaka: [
    { name: '신오사카역', coord: [135.5003, 34.7334], size: 'large' },
    { name: '오사카역', coord: [135.4959, 34.7025], size: 'medium' },
    { name: '오사카공항역', coord: [135.4402, 34.7869], size: 'medium', kind: 'airport' },
  ],
  chicago: [
    { name: '유니언역', coord: [-87.6403, 41.8789], size: 'large' },
    { name: '오헤어공항역', coord: [-87.9043, 41.9773], size: 'large', kind: 'airport' },
    { name: '미드웨이공항역', coord: [-87.7378, 41.7866], size: 'medium', kind: 'airport' },
  ],
  newyork: [
    { name: '펜실베이니아역', coord: [-73.9935, 40.7506], size: 'large' },
    { name: '그랜드 센트럴역', coord: [-73.9772, 40.7527], size: 'medium' },
  ],
  london: [
    { name: '세인트판크라스역', coord: [-0.1263, 51.5317], size: 'large' },
    { name: '킹스크로스역', coord: [-0.1238, 51.5308], size: 'medium' },
    { name: '패딩턴역', coord: [-0.1755, 51.5154], size: 'medium' },
    { name: '워털루역', coord: [-0.1132, 51.5031], size: 'medium' },
  ],
  paris: [
    { name: '파리 북역', coord: [2.3553, 48.8809], size: 'large' },
    { name: '리옹역', coord: [2.3743, 48.8443], size: 'large' },
    { name: '몽파르나스역', coord: [2.321, 48.8412], size: 'large' },
    { name: '파리 동역', coord: [2.3592, 48.8768], size: 'medium' },
  ],
  sollae: [{ name: '솔내역', coord: [130.926, 37.553], size: 'large' }],
};
