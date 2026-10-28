// 되돌리기·다시 하기 기록.
// 바뀌기 전 모습(before)과 바뀐 뒤 모습(after)을 한 쌍으로 쌓아 둔다.
// 같은 key의 바뀜이 이어지면(예: 이름 칸에 글자를 계속 칠 때) 한 번으로 합친다.
// 매달 정산하면 그때까지의 기록에 "정산됨(settled)" 표시를 한다. 정산된 기록은 되돌려도 돈을 돌려주지 않는다 (state.js).

const LIMIT = 100; // 기억할 최대 횟수. 너무 많으면 메모리를 많이 쓴다

export function createHistory() {
  let undoStack = [];
  let redoStack = [];

  // key: 바뀜의 종류 (같은 종류가 이어지면 합친다, null이면 합치지 않는다)
  function record(key, before, after) {
    const last = undoStack[undoStack.length - 1];
    if (key !== null && last && last.key === key && !last.settled && redoStack.length === 0) {
      last.after = after;
    } else {
      undoStack.push({ key, before, after, settled: false });
      if (undoStack.length > LIMIT) undoStack.shift();
    }
    redoStack = [];
  }

  // 되돌릴 기록을 꺼낸다. 없으면 null
  function undo() {
    const entry = undoStack.pop();
    if (!entry) return null;
    redoStack.push(entry);
    return entry;
  }

  // 다시 할 기록을 꺼내지 않고 본다 (돈이 모자라면 다시 하지 않으려고). 없으면 null
  function peekRedo() {
    return redoStack[redoStack.length - 1] ?? null;
  }

  // 다시 할 기록을 꺼낸다. 없으면 null
  function redo() {
    const entry = redoStack.pop();
    if (!entry) return null;
    undoStack.push(entry);
    return entry;
  }

  function clear() {
    undoStack = [];
    redoStack = [];
  }

  // 매달 정산할 때: 지금까지의 기록을 모두 정산됨으로 (되돌려도 돈은 그대로)
  function settle() {
    for (const entry of [...undoStack, ...redoStack]) entry.settled = true;
  }

  return { record, undo, redo, peekRedo, clear, settle };
}
