// 타임머신: 개통 연도(opened)가 적힌 실제 노선망 프리셋(서울, tools/presets/openings.mjs)을 고른 해의 모습으로 자른다.
// 시작 화면에서 "1985년"을 고르면 그해까지 개통한 역·선로만 남기고, 노선은 그 노선이 그해까지 다니기 시작한 구간만 남긴다
// (route.opened: 이웃한 역 짝마다 그 노선이 다니기 시작한 해. 같은 선로를 나중에 다른 노선이 같이 쓰면 그 노선은 그때부터)
// (아직 끊겨 있던 노선은 이어진 구간마다 노선 하나). 열차 수는 남은 구간 길이(역 수) 비율로 줄인다. 게임 날짜도 그해로.
// 실제 개통 연도를 따랐지만 나중에 사이에 끼운 역은 그 구간과 같은 해로 치는 등 "대략"이다.

// 개통 연도가 없는 것(플레이어가 지은 것)은 처음부터 있던 것으로 친다
const openedBy = (item, year) => (item.opened ?? -Infinity) <= year;
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

// save: 프리셋 (게임 저장 모양). 결과: 그해 모습의 새 저장 (save는 그대로 둔다)
export function networkAtYear(save, year) {
  const network = save.network;
  const stations = network.stations.filter((station) => openedBy(station, year));
  const alive = new Set(stations.map((station) => station.id));
  const tracks = network.tracks.filter(
    (track) => openedBy(track, year) && alive.has(track.from) && alive.has(track.to),
  );
  const linked = new Set(tracks.map((track) => pairKey(track.from, track.to)));

  let nextRoute = network.nextRouteNumber;
  const routes = [];
  for (const route of network.routes) {
    // 이웃한 두 역이 그해 선로로 이어져 있고 이 노선이 그 구간을 다니기 시작했으면 한 구간으로 모은다
    // (구간 = 노선 역 순서의 [처음 번호, 끝 번호]. 순환선은 같은 역이 처음과 끝에 두 번 나와서 번호로 센다)
    const runs = [];
    let first = 0;
    for (let i = 1; i <= route.stations.length; i++) {
      const started = i < route.stations.length && (route.opened?.[i - 1] ?? -Infinity) <= year;
      // (프리셋 그대로라 route.opened는 역 짝 수와 같다)
      if (started && linked.has(pairKey(route.stations[i - 1], route.stations[i]))) continue;
      if (i - 1 > first) runs.push([first, i - 1]);
      first = i;
    }
    runs.forEach(([from, to], index) => {
      const share = (to - from) / (route.stations.length - 1);
      routes.push({
        ...route,
        // 첫 구간은 원래 노선 그대로, 끊겨서 따로 남은 구간은 새 번호
        id: index === 0 ? route.id : `r${nextRoute++}`,
        stations: route.stations.slice(from, to + 1),
        opened: route.opened?.slice(from, to),
        trainCount: Math.max(1, Math.round(route.trainCount * share)),
      });
    });
  }

  return {
    ...save,
    network: { ...network, stations, tracks, routes, nextRouteNumber: nextRoute },
    year,
  };
}
