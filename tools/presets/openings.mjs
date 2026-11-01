// 실제 노선망의 개통 연도 (타임머신: 시작 화면에서 고른 해의 노선망으로 시작, 다시 보기에서 실제 개통 순서대로).
// 노선 이름(프리셋의 route.name)마다 [이 역부터, 이 역까지, 개통 연도] 구간을 노선 역 순서대로 적는다. 적지 않은 구간은 year.
// 구간 하나 = 그 두 역 사이의 이웃한 역 짝들 (노선 역 순서에서 앞뒤 어느 쪽으로 적어도 된다).
// 나중에 사이에 끼워 넣은 역(동묘앞 2005, 마곡나루 2018 같은)은 따로 적지 않아 그 구간과 같은 해로 친다 (대략).
// 출처:
// - 1~8호선 서울교통공사 구간: 서울교통공사 「지하철 개통 정보」(공공데이터포털 15044439, 2024-11-29 자료, 공공누리 제1유형)
// - 그 밖의 구간(코레일 1호선·일산선·과천선, 9호선, 신분당선, 경의·중앙선, 수인·분당선, 공항철도, 7호선 부천 구간, 별내선):
//   널리 알려진 개통 연도 (위키백과 각 노선 문서. 2026-11-01에 따로 맞춰 보지 못한 것도 있어 "대략"으로 밝힌다)
export const OPENINGS = {
  seoul: {
    '1호선 경원·경인선': { year: 1974, sections: [['광운대', '망월사', 1986]] },
    '1호선 경부선': { year: 1974, sections: [] },
    '2호선': {
      year: 1984, // 서울대입구 ↔ 을지로입구 (신도림·신촌 쪽)
      sections: [
        ['성수', '종합운동장', 1980],
        ['종합운동장', '교대(법원·검찰청)', 1982],
        ['을지로입구', '성수', 1983],
        ['교대(법원·검찰청)', '서울대입구', 1983],
      ],
    },
    '2호선 성수지선': { year: 1980, sections: [] },
    '2호선 신정지선': {
      year: 1992,
      sections: [
        ['양천구청', '신정네거리', 1996],
        ['신정네거리', '까치산', 1996],
      ],
    },
    '3호선': {
      year: 1985,
      sections: [
        ['주엽', '지축', 1996], // 일산선 (코레일)
        ['지축', '구파발', 1990],
        ['양재', '수서', 1993],
        ['수서', '오금', 2010],
      ],
    },
    '4호선': {
      year: 1985,
      sections: [
        ['불암산', '상계', 1993],
        ['사당', '남태령', 1994],
        ['남태령', '인덕원', 1994], // 과천선 (코레일)
        ['인덕원', '범계', 1993],
      ],
    },
    '5호선': {
      year: 1996,
      sections: [
        ['왕십리', '상일동', 1995],
        ['상일동', '강일', 2021],
      ],
    },
    '5호선 마천지선': { year: 1996, sections: [] },
    '6호선': {
      year: 2000,
      sections: [
        ['이태원', '약수', 2001],
        ['봉화산', '신내', 2019],
      ],
    },
    '7호선': {
      year: 1996, // 장암 ↔ 건대입구
      sections: [
        ['건대입구', '신풍', 2000],
        ['신풍', '온수', 2000],
        ['온수', '부천시청', 2012],
      ],
    },
    '8호선': {
      year: 1996, // 잠실 ↔ 모란
      sections: [
        ['별내', '암사', 2024], // 별내선
        ['암사', '잠실', 1999],
      ],
    },
    '9호선': {
      year: 2009, // 개화 ↔ 신논현
      sections: [
        ['신논현', '종합운동장', 2015],
        ['종합운동장', '중앙보훈병원', 2018],
      ],
    },
    신분당선: { year: 2011, sections: [['신사', '강남', 2022]] },
    '경의·중앙선': {
      year: 2005, // 용산 ↔ 도농 (중앙선)
      sections: [
        ['야당', '디지털미디어시티', 2009], // 경의선
        ['디지털미디어시티', '공덕', 2012],
        ['공덕', '용산', 2014],
      ],
    },
    '경의·중앙선 · 서울역': { year: 2009, sections: [] },
    '수인·분당선': {
      year: 1994, // 수서 ↔ 서현
      sections: [
        ['청량리', '왕십리', 2020],
        ['왕십리', '선릉', 2012],
        ['선릉', '수서', 2003],
      ],
    },
    공항철도: { year: 2010, sections: [] },
  },
};

// 프리셋의 선로·역·노선에 개통 연도(opened)를 적는다. 선로는 그 선로를 지나는 노선 구간 중 가장 이른 해, 역은 닿은 선로 중 가장 이른 해,
// 노선은 이웃한 역 짝마다 그 노선이 다니기 시작한 해 (같은 선로를 여러 노선이 쓰면 노선마다 다르다: 청량리–회기는 1호선 1974, 경의·중앙선 2005).
// stations·tracks·routes: 프리셋의 게임 저장 모양. 적힌 역 이름을 노선에서 못 찾으면 알린다 (이름이 바뀌었을 때)
export function applyOpenings(regionId, { stations, tracks, routes }) {
  const table = OPENINGS[regionId];
  if (!table) return;
  const nameOf = new Map(stations.map((station) => [station.id, station.name]));
  const trackOf = new Map(tracks.map((track) => [[track.from, track.to].sort().join('|'), track]));
  const earliest = (item, year) => {
    item.opened = Math.min(item.opened ?? Infinity, year);
  };
  for (const route of routes) {
    const entry = table[route.name];
    if (!entry) throw new Error(`개통 연도가 없는 노선이에요: ${route.name} (tools/presets/openings.mjs)`);
    const names = route.stations.map((id) => nameOf.get(id));
    const years = names.slice(1).map(() => entry.year); // 이웃한 역 짝마다 개통 연도
    for (const [a, b, year] of entry.sections) {
      const [i, j] = [names.indexOf(a), names.indexOf(b)];
      if (i < 0 || j < 0) throw new Error(`${route.name}에서 역을 찾지 못했어요: ${i < 0 ? a : b}`);
      for (let k = Math.min(i, j); k < Math.max(i, j); k++) years[k] = year;
    }
    route.opened = years;
    years.forEach((year, k) => {
      const track = trackOf.get([route.stations[k], route.stations[k + 1]].sort().join('|'));
      if (track) earliest(track, year);
    });
  }
  for (const track of tracks) {
    for (const id of [track.from, track.to]) {
      const station = stations.find((candidate) => candidate.id === id);
      if (track.opened) earliest(station, track.opened);
    }
  }
}
