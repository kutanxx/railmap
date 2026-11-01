// "만약에" 노선 카드 ([메뉴] → [만약에 노선]): 그 도시에서 짓고 있거나 계획만 된 실제 노선을 카드로 보여주고,
// [계획으로 깔기]를 누르면 내 노선망에 계획 선로(주황 점선)로 깐다 (game/whatIf.js). 새 역은 주변 건물을 재서 짓는다
// (화면 밖일 수 있어 지도 조각을 직접 받는다, map/buildingTiles.js). 깐 뒤에는 그 노선이 보이게 지도를 옮긴다.
// 화면 가운데 창 모양(조작 안내 카드와 같은 .dialog)이고, [닫기]·바깥 누르기·Esc로 닫힌다
import { whatIfLines, whatIfPlan, applyWhatIf } from '../game/whatIf.js';
import { canAfford } from '../game/state.js';
import { isSandbox } from '../game/region.js';
import { measureStations } from '../map/buildingTiles.js';
import { unpackCells } from '../game/cellPacking.js';
import { formatMoney } from './format.js';
import { shortfall } from './costText.js';

// notice: 말풍선 알림, render: 다시 그리기 (app.js)
// 결과: { open, available: 이 지도에 "만약에" 노선이 있는지 }
export function createWhatIfCard({ map, notice, render }) {
  const lines = whatIfLines();
  const element = document.createElement('div');
  element.className = 'dialog-backdrop';
  element.hidden = true;
  element.innerHTML = `
    <div class="dialog whatif-card" role="dialog" aria-modal="true" aria-labelledby="whatif-title">
      <div class="dialog-title" id="whatif-title">만약에 노선</div>
      <p class="dialog-text">실제로 짓고 있거나 계획만 된 노선이에요. 고르면 내 노선망에 주황 점선(계획 선로)으로 깔려요.
        가까이 내 역이 있으면 그 역을 쓰고, 없으면 새 역을 지어요. 선로는 눌러서 [짓기]로 지어요.</p>
      <ul class="whatif-list"></ul>
      <div class="dialog-buttons"><button type="button" class="whatif-close">닫기</button></div>
    </div>
  `;
  document.body.append(element);
  const list = element.querySelector('.whatif-list');

  const close = () => {
    element.hidden = true;
  };
  element.querySelector('.whatif-close').addEventListener('click', close);
  element.addEventListener('click', (event) => {
    if (event.target === element) close();
  });
  document.addEventListener(
    'keydown',
    (event) => {
      if (element.hidden || event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      close();
    },
    true,
  );

  // 카드 한 장: 노선 이름, 상태, 역 수·새 역·공사비, [계획으로 깔기]
  function card(line) {
    const plan = whatIfPlan(line);
    const item = document.createElement('li');
    item.className = 'whatif-item';
    const title = document.createElement('b');
    title.textContent = line.name;
    const status = document.createElement('small');
    status.textContent = line.status;
    const facts = document.createElement('span');
    // 샌드박스는 돈이 무제한이라 공사비를 적지 않는다
    const price = plan.cost > 0 && !isSandbox() ? ` · 공사비 ${formatMoney(plan.cost)}` : '';
    facts.textContent = `역 ${line.stations.length}곳 (새 역 ${plan.newStations}곳${price})`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'whatif-apply';
    const done = plan.newTracks === 0;
    button.textContent = done ? '이미 깔려 있어요' : '계획으로 깔기';
    button.disabled = done;
    button.addEventListener('click', () => lay(line, button));
    item.append(title, status, facts, button);
    return item;
  }

  async function lay(line, button) {
    const plan = whatIfPlan(line);
    // 공사비를 낼 수 없으면 재기 전에 알린다 (빚 한도까지는 낼 수 있다. 샌드박스는 늘 된다)
    if (!canAfford(plan.cost)) {
      notice(shortfall(plan.cost), 'bad');
      return;
    }
    button.disabled = true;
    button.textContent = '역 주변 재는 중…';
    let measured;
    try {
      const fresh = plan.stops.map((stop, i) => ({ id: String(i), coord: stop.coord, existing: stop.existing }));
      const result = await measureStations(fresh.filter((stop) => !stop.existing).map(({ id, coord }) => ({ id, coord })));
      measured = new Map(
        result.map((station) => [
          Number(station.id),
          {
            population: station.population,
            builtArea: station.builtArea,
            cells: station.cells ?? (station.cellGrid ? unpackCells(station.coord, station.cellGrid) : null),
          },
        ]),
      );
    } catch (error) {
      button.disabled = false;
      button.textContent = '계획으로 깔기';
      notice(`역 주변 건물을 재지 못했어요: ${error.message}`, 'bad');
      return;
    }
    const result = applyWhatIf(line, measured);
    close();
    if (!result) {
      notice(shortfall(plan.cost), 'bad');
      return;
    }
    // 깐 노선이 보이게 지도를 옮긴다
    const lngs = line.stations.map((stop) => stop.coord[0]);
    const lats = line.stations.map((stop) => stop.coord[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 120, maxZoom: 14 },
    );
    render();
    notice(`${line.name}을(를) 계획 선로로 깔았어요. 선로를 눌러 [짓기]나 [계획 선로 모두 짓기]로 지어요`);
  }

  function open() {
    list.replaceChildren(...lines.map(card));
    element.hidden = false;
    element.querySelector('.whatif-apply:not(:disabled)')?.focus();
  }

  return { open, available: lines.length > 0 };
}
