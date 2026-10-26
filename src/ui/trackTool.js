// 선로 그리기 도구.
// 역 A 클릭 → (빈 곳 클릭으로 경유점 추가) → 역 B 클릭으로 완성.
// 그리는 중인 상태는 게임 상태가 아니라 화면 쪽 임시 상태라서 여기서 따로 들고 있는다.

export function createTrackTool({ onChange, onComplete }) {
  // 그리는 중이면 { from: 역 id, fromCoord, waypoints: [[경도, 위도], …], cursor }
  let draft = null;

  function changed() {
    onChange(preview());
  }

  // 역을 눌렀을 때: 그리기 시작, 또는 다른 역이면 완성
  function clickStation(stationId, coord) {
    if (!draft) {
      draft = { from: stationId, fromCoord: coord, waypoints: [], cursor: null };
      changed();
      return;
    }
    if (stationId === draft.from) return; // 같은 역으로 돌아오는 선로는 만들지 않는다
    const { from, waypoints } = draft;
    draft = null;
    changed();
    onComplete(from, stationId, waypoints);
  }

  // 빈 지도를 눌렀을 때: 그리는 중이면 경유점을 추가한다
  function clickEmpty(coord) {
    if (!draft) return;
    draft.waypoints.push(coord);
    changed();
  }

  // 마우스 위치까지 점선 미리보기를 늘인다
  function moveCursor(coord) {
    if (!draft) return;
    draft.cursor = coord;
    changed();
  }

  // Backspace: 마지막 경유점을 지운다
  function undoWaypoint() {
    if (!draft || draft.waypoints.length === 0) return;
    draft.waypoints.pop();
    changed();
  }

  // Esc 또는 다른 도구로 바꿀 때: 그리기를 취소한다
  function cancel() {
    if (!draft) return;
    draft = null;
    changed();
  }

  // 미리보기로 그릴 내용. 그리는 중이 아니면 null
  function preview() {
    if (!draft) return null;
    return {
      coords: [draft.fromCoord, ...draft.waypoints],
      waypoints: draft.waypoints,
      cursor: draft.cursor,
    };
  }

  return {
    clickStation,
    clickEmpty,
    moveCursor,
    undoWaypoint,
    cancel,
    isDrawing: () => draft !== null,
  };
}
