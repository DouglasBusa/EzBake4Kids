import { el, place, artButton, wait, sparkles, rectOf, onTap } from '../ui.js';
import { CARRIERS } from '../data.js';
import { mkCanvas, drawCarrier, treatCanvas, iconCanvas } from '../draw.js';
import { sfx, speak } from '../audio.js';

export function create(api) {
  let root, C, cv, treats = [], btns = {}, token = 0;
  async function choose(id, first) {
    const my = ++token;
    C.carrier = id; api.progress();
    Object.entries(btns).forEach(([k, b]) => b.classList.toggle('selected', k === id));
    if (!first) { sfx('pop'); speak(CARRIERS.find(c => c.id === id).name); }
    treats.forEach(t => { t.classList.remove('in'); });
    cv.clear(); const inner = drawCarrier(cv.ctx, id, 280, 210, 540, 400, true);
    // treats hop in one by one
    for (let i = 0; i < treats.length; i++) {
      const t = treats[i];
      const x = 40 + inner.x + (i % 3) * inner.w / 3 + inner.w / 6 - 45, y = 130 + inner.y + Math.floor(i / 3) * 70 - 45;
      place(t, x, y);
      if (first) { t.classList.add('in'); continue; }
      await wait(160);
      if (my !== token) return;
      t.classList.add('in'); sfx('boing');
    }
    if (!first) { const r = rectOf(cv); sparkles(r.cx, r.cy, 8, 160); }
    api.complete({ quiet: true });
  }
  return {
    enter(r, c) {
      root = r; C = c;
      cv = mkCanvas(560, 420, 'carrier-canvas'); root.appendChild(cv); place(cv, 40, 130);
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Carrier');
      for (let i = 0; i < 6; i++) { const t = treatCanvas(C, i, 90); t.classList.add('hop'); root.appendChild(t); treats.push(t); }
      CARRIERS.forEach((k, i) => {
        const b = artButton(root, { id: k.artOpen, label: k.name, size: 136, cls: 'carrier-btn', draw: (c, x, y, s) => drawCarrier(c, k.id, x, y, s * 0.92, s * 0.7, false) });
        place(b, 688 + (i % 2) * 160, 130 + Math.floor(i / 2) * 170, 136, 136);
        onTap(b, () => choose(k.id));
        btns[k.id] = b;
      });
      if (C.carrier) choose(C.carrier, true);
    },
    isComplete() { return !!C.carrier; },
    hintTarget() { return btns.bento; },
    exit() { token++; }
  };
}
