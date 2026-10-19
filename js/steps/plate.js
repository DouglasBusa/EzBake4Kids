import { el, place, artButton, rectOf, wait, onTap } from '../ui.js';
import { PLATES } from '../data.js';
import { mkCanvas, iconCanvas, drawPlate, treatCanvas } from '../draw.js';
import { sfx, speak } from '../audio.js';

export function create(api) {
  let root, C, plateCv, treats = [], btns = {}, token = 0;
  const spot = i => ({ x: 370 + ((i % 3) - 1) * 120, y: 300 + Math.floor(i / 3) * 105 });
  async function choose(id, first) {
    const my = ++token;
    C.plate = id; api.progress();
    Object.entries(btns).forEach(([k, b]) => b.classList.toggle('selected', k === id));
    if (!first) { sfx('pop'); speak(PLATES.find(p => p.id === id).name); }
    // treats slide off, plate changes, treats slide onto the new plate
    treats.forEach(t => { t.style.transition = first ? 'none' : ''; t.style.transform = 'translate(-700px, 0)'; });
    if (!first) await wait(250);
    if (my !== token) return;
    plateCv.clear(); drawPlate(plateCv.ctx, id, 270, 200, 520, 360);
    await wait(30);
    treats.forEach((t, i) => { t.style.transition = ''; t.style.transitionDelay = i * 0.06 + 's'; t.style.transform = 'translate(0,0)'; });
    setTimeout(() => sfx('clink'), 350);
    api.complete({ quiet: true });
  }
  return {
    enter(r, c) {
      root = r; C = c;
      plateCv = mkCanvas(540, 400, 'plate-canvas'); root.appendChild(plateCv); place(plateCv, 100, 140);
      plateCv.setAttribute('role', 'img'); plateCv.setAttribute('aria-label', 'Plate');
      for (let i = 0; i < 6; i++) { const t = treatCanvas(C, i, 120); t.classList.add('slide'); root.appendChild(t); const s = spot(i); place(t, s.x - 60, s.y - 60); t.style.transform = 'translate(-700px,0)'; treats.push(t); }
      PLATES.forEach((p, i) => {
        const b = artButton(root, { id: p.art, label: p.name, size: 96, cls: 'plate-btn', draw: (c, x, y, s) => drawPlate(c, p.id, x, y, s * 0.92, s * 0.8) });
        place(b, 792 + (i % 2) * 120, 112 + Math.floor(i / 2) * 116, 96, 96);
        onTap(b, () => choose(p.id));
        btns[p.id] = b;
      });
      if (C.plate) choose(C.plate, true);
    },
    isComplete() { return !!C.plate; },
    hintTarget() { return btns['round-pink']; },
    exit() { token++; }
  };
}
