// [메뉴] 안의 창과 저장 버튼들을 만들고 잇는다 (app.js에서 나눔): 역·노선 찾기(search.js), 내 노선망 서랍(drawerCard.js),
// 만약에 노선(whatIfCard.js), 노선망 자란 모습 보기(timelapse.js), 자동 저장·내보내기·불러오기·새로 시작·파산 창(saveControls.js)
import { createSearch } from './search.js';
import { createTimelapse } from './timelapse.js';
import { createWhatIfCard } from './whatIfCard.js';
import { createDrawerCard } from './drawerCard.js';
import { bindSaveControls } from './saveControls.js';

// app.js가 넘겨주는 것: ui(화면 상태), notice·select·render, clearWork(고르던 것·그리던 것 놓기), trainFollow(열차 따라가기),
// loadMessage(불러온 뒤 알릴 말). 결과: { search, timelapse, bankruptDialog }
export function createMenuActions({ map, ui, notice, select, render, clearWork, trainFollow, loadMessage }) {
  // 역·노선 찾기 (/ 키, [메뉴]의 [역·노선 찾기], search.js)
  const search = createSearch({ map, select, render });
  // 내 노선망 서랍 ([메뉴] → [내 노선망 서랍], drawerCard.js): 이름 붙인 노선망을 여러 개 넣어 두고 꺼낸다
  const drawer = createDrawerCard({ notice, render, clearWork });
  // "만약에" 노선 ([메뉴] → [만약에 노선], whatIfCard.js): 짓고 있거나 계획만 된 실제 노선을 계획 선로로
  const whatIf = createWhatIfCard({ map, notice, render });
  // 노선망이 자란 모습 다시 보기 ([메뉴], timelapse.js)
  const timelapse = createTimelapse({ map, notice, select, render, controlRoom: () => ui.controlRoom });
  // 새 게임 안내는 튜토리얼이 떠 있으면 내지 않는다 (튜토리얼이 같은 것을 안내한다)
  const startMessage = loadMessage?.newGame && !document.getElementById('tutorial').hidden ? null : loadMessage;
  const { bankruptDialog } = bindSaveControls({
    notice,
    loadMessage: startMessage,
    clearWork,
    render,
    onSearch: search.open,
    onDrawer: drawer.open,
    // 다시 보기는 카메라를 따로 움직이므로 열차 따라가기를 먼저 끝내고, 그리던 선로·노선도 놓는다 (그리기 막대가 남지 않게)
    onTimelapse: () => {
      trainFollow.stop();
      clearWork();
      timelapse.open();
    },
    onWhatIf: whatIf.available ? whatIf.open : null,
  });

  return { search, timelapse, bankruptDialog };
}
