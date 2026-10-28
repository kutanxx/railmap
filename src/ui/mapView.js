// 지도 위 역 쪽 그림: 역(멀리서 동그라미·환승 캡슐, 가까이서 승강장 띠·대합실), 500m 역세권 원, 고른 역 괄호,
// 역 이름 말풍선, 출구. app.js의 render가 부른다 (선로는 trackView.js, 열차는 animation.js).
// 끌어서 옮기는 중인 역은 끄는 자리에 있는 것처럼 보여준다.
import { getState, findStation } from '../game/state.js';
import { updateStations, updateCatchment } from '../map/stationLayers.js';
import { updateStationLabels, arrangeStationLabels } from '../map/stationLabels.js';
import { updateSelectionBracket } from '../map/selectionBracket.js';
import { onMapDataSettled, mapDataLoaded } from '../map/mapFeatures.js';
import { stationShapes } from './stationShapes.js';
import { stationBands } from './stationBands.js';
import { createStationExits } from './stationExits.js';
import { isNarrowScreen } from './sidePanels.js';

// ui: 화면 상태 (app.js)
// 결과: { shownCoord, drawStations, updateStationExits, start }
export function createMapView({ map, ui }) {
  let stationExits = null;
  let lastBands = null; // 마지막으로 그린 역들과 그 모양

  // 끌고 있는 역은 끄는 자리에 있는 것처럼 보여준다
  const shownCoord = (station) =>
    ui.stationPreview?.id === station.id ? ui.stationPreview.coord : station.coord;
  const shownStations = () =>
    getState().stations.map((station) =>
      ui.stationPreview?.id === station.id ? { ...station, coord: ui.stationPreview.coord } : station,
    );

  // 역 출구 (stationExits.js): 역 모양이 바뀌었거나, 지도를 움직여 새 역이 보일 때 찾는다
  // 끌어서 옮기는 중인 역은 출구를 숨긴다. 그다음 역 말풍선을 출구를 덮지 않는 쪽으로 옮긴다
  function updateStationExits() {
    // 역을 끌어 옮기는 동안은 찾지 않는다 (이웃 역 출구까지 매 마우스 움직임마다 건물을 다시 읽어 끊겼다). 놓으면 찾는다
    if (ui.stationPreview) return;
    // 지도 조각을 덜 받았으면 다음에 (조각이 다 오면 onMapDataSettled가 다시 부른다). 빈 땅으로 잘못 기억하지 않게
    if (!mapDataLoaded(map)) return;
    if (stationExits && lastBands) {
      stationExits.update(lastBands.stations, lastBands.bands, ui.stationPreview?.id);
      arrangeStationLabels(map, stationExits.coords(), labelArea());
    }
  }

  // 역 말풍선을 놓을 수 있는 지도 화면 { right, bottom } (px): 펼친 오른쪽 패널(좁은 화면은 아래 판)이 덮은 곳은 뺀다
  function labelArea() {
    const { clientWidth: width, clientHeight: height } = map.getContainer();
    if (!document.body.classList.contains('side-panel-open')) return { right: width, bottom: height };
    const side = document.querySelector('.side').getBoundingClientRect();
    return isNarrowScreen() ? { right: width, bottom: side.top } : { right: side.left, bottom: height };
  }

  // 역 쪽을 다시 그린다. stationRoutes: 역마다 서는 노선 색 (views.js의 routeColors), stationRiders: 역별 이용객
  // 결과: 역 모양 (승강장 방향·환승역·종착역, 오른쪽 패널의 역 카드가 쓴다)
  function drawStations(stationRoutes, stationRiders) {
    const { tracks, routes } = getState();
    const stations = shownStations();
    // 승강장 방향(선로 따라 자동), 환승역·종착역, 가까이서 보이는 띠·대합실 모양
    const shapes = stationShapes(stations, tracks, routes);
    const bands = stationBands(stations, tracks, routes, shapes);
    lastBands = { stations, bands };
    updateStations(map, stations, ui.selected?.type === 'station' ? ui.selected.id : null, shapes, bands, stationRoutes);
    // 500m 원: 역 놓기 도구면 마우스 자리, 아니면 고른 역 둘레
    const selectedStation = ui.selected?.type === 'station' ? findStation(ui.selected.id) : null;
    const selectedCoord = selectedStation ? shownCoord(selectedStation) : null;
    updateCatchment(map, ui.tool === 'station' ? ui.hover : selectedCoord);
    // 고른 역 둘레 모서리 괄호: 역 모양(띠·대합실)의 점들과 역 자리를 감싼다
    const bracketPoints = selectedStation
      ? [selectedCoord, ...(bands.get(selectedStation.id)?.parts ?? []).flatMap((part) => part.coords)]
      : null;
    updateSelectionBracket(map, bracketPoints);
    updateStationLabels(map, stations, stationRoutes, stationRiders, shapes, selectedStation?.id ?? null);
    return shapes;
  }

  // 게임 레이어를 다 올린 뒤에 부른다 (출구 레이어가 있어야 한다)
  // 지도를 움직이고 타일을 다 불러오면, 새로 보이는 역의 출구를 찾고 말풍선 자리를 다시 고른다
  function start() {
    stationExits = createStationExits(map);
    onMapDataSettled(map, updateStationExits);
  }

  return { shownCoord, drawStations, updateStationExits, start };
}
