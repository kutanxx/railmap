// 저장과 관련된 화면: 자동 저장 켜기, 불러온 게임 알림, 왼쪽 아래 파일 버튼, 파산 창.
import { startAutosave, exportToFile, importFromFile, resetGame } from '../game/save.js';
import { createFileMenu } from './fileMenu.js';
import { createBankruptDialog } from './bankruptDialog.js';

// notice: 화면 가운데 말풍선, loadMessage: 시작할 때 저장된 게임을 불러온 결과 (없으면 null)
// clearWork: 불러오기·새로 시작 뒤 고르던 것과 그리던 것을 놓는다, render: 화면 다시 그리기
// 결과: { bankruptDialog } — render가 파산했는지에 맞춰 창을 띄우고 숨긴다
export function bindSaveControls({ notice, loadMessage, clearWork, render }) {
  startAutosave((problem) => notice(problem, 'bad'));
  if (loadMessage) notice(loadMessage.text, loadMessage.tone);

  const importGame = (file) => {
    importFromFile(file)
      .then(() => {
        clearWork();
        render();
        notice('저장 파일을 불러왔어요');
      })
      .catch((error) => notice(error.message, 'bad'));
  };
  const startOver = () => {
    clearWork();
    resetGame();
    notice('새 게임을 시작해요');
  };

  createFileMenu(document.getElementById('file-menu'), {
    onExport: exportToFile,
    onImport: importGame,
    onReset: startOver,
  });
  const bankruptDialog = createBankruptDialog(document.getElementById('bankrupt'), {
    onReset: startOver,
    onImport: importGame,
  });

  return { bankruptDialog };
}
