// 노선 만들기 도구.
// 역을 차례로 클릭해서 고르고, [완성] 또는 Enter로 노선을 만든다.
// 고르는 중인 상태는 게임 상태가 아니라 화면 쪽 임시 상태라서 여기서 따로 들고 있는다.

// checkLink(앞 역 id, 다음 역 id) → 이을 수 없으면 이유(글), 이을 수 있으면 null
export function createRouteTool({ checkLink, onChange, onComplete }) {
  // 고르는 중이면 { stations: [역 id, …], message: 패널에 보여줄 안내 }
  let draft = null;

  function clickStation(stationId) {
    if (!draft) {
      draft = { stations: [stationId], message: '' };
    } else if (draft.stations.includes(stationId)) {
      draft.message = '이미 이 노선에 들어 있는 역이에요.';
    } else {
      const last = draft.stations[draft.stations.length - 1];
      const problem = checkLink(last, stationId);
      if (problem) {
        draft.message = problem;
      } else {
        draft.stations.push(stationId);
        draft.message = '';
      }
    }
    onChange();
  }

  // [완성] 또는 Enter
  function finish() {
    if (!draft) return;
    if (draft.stations.length < 2) {
      draft.message = '역을 2개 이상 골라야 노선이 돼요.';
      onChange();
      return;
    }
    const stations = draft.stations;
    draft = null;
    onChange();
    onComplete(stations);
  }

  // Backspace: 마지막에 고른 역을 뺀다
  function undoStation() {
    if (!draft) return;
    draft.stations.pop();
    draft.message = '';
    if (draft.stations.length === 0) draft = null;
    onChange();
  }

  // Esc 또는 다른 도구로 바꿀 때
  function cancel() {
    if (!draft) return;
    draft = null;
    onChange();
  }

  return {
    clickStation,
    finish,
    undoStation,
    cancel,
    isDrawing: () => draft !== null,
    getDraft: () => draft,
  };
}
