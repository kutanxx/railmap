// 되돌리기·다시 하기 기록.
// 바뀌기 전 모습(before)과 바뀐 뒤 모습(after)을 한 쌍으로 쌓아 둔다.
// 같은 key의 바뀜이 이어지면(예: 이름 칸에 글자를 계속 칠 때) 한 번으로 합친다.

const LIMIT = 100; // 기억할 최대 횟수. 너무 많으면 메모리를 많이 쓴다

export function createHistory() {
  let undoStack = [];
  let redoStack = [];

  // key: 바뀜의 종류 (같은 종류가 이어지면 합친다, null이면 합치지 않는다)
  function record(key, before, after) {
    const last = undoStack[undoStack.length - 1];
    if (key !== null && last && last.key === key && redoStack.length === 0) {
      last.after = after;
    } else {
      undoStack.push({ key, before, after });
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

  return { record, undo, redo, clear };
}
