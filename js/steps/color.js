import { el, place, artButton, rectOf, sparkles, wait, onTap } from '../ui.js';
import { COLORS } from '../data.js';
import { mkCanvas, drawBowl, drawColorBlob, iconCanvas } from '../draw.js';
import { sfx, speak } from '../audio.js';

export function create(api) {
  let root, C, under, over, blobs = {}, token = 0;
  const draw = (cv, colorId) => { cv.clear(); drawBowl(cv.ctx, 190, 140, 360, 236, { level: 1, lumps: 0, stirring: true, colorId, recipe: C.recipe }); };
  async function pick(col) {
    const my = ++token;
    api.progress();
    sfx('pop');
    const b = rectOf(blobs[col.id]), w = rectOf(under);
    const drop = el('div', 'tmp drop', document.getElementById('fx'));
    drop.appendChild(iconCanvas(60, (c, x, y, s) => drawColorBlob(c, col.id, x, y, s)));
    place(drop, b.cx - 30, b.cy - 30, 60, 60);
    requestAnimationFrame(() => { drop.style.transform = `translate(${w.cx - b.cx}px, ${w.y + 40 - b.cy}px) scale(.7)`; });
    await wait(450); drop.remove();
    if (my !== token) return;
    sfx('plop'); speak(col.name + '!');
    C.color = col.id;
    Object.entries(blobs).forEach(([k, x]) => x.classList.toggle('selected', k === col.id));
    // swirl: new color fades in over the old one (< 1.5 s)
    draw(over, col.id);
    over.classList.remove('fadein'); void over.offsetWidth; over.classList.add('fadein');
    under.parentElement.classList.remove('swirl'); void under.offsetWidth; under.parentElement.classList.add('swirl');
    await wait(900);
    if (my !== token) return;
    draw(under, col.id); over.classList.remove('fadein');
    sparkles(w.cx, w.cy - 30, 8, 100);
    api.complete({ quiet: false });
  }
  return {
    enter(r, c) {
      root = r; C = c;
      const box = el('div', 'bowl-box', root, { role: 'img', 'aria-label': 'Mixing bowl' });
      place(box, 60, 190, 380, 280);
      under = mkCanvas(380, 280); over = mkCanvas(380, 280, 'over');
      box.appendChild(under); box.appendChild(over);
      draw(under, C.color);
      COLORS.forEach((col, i) => {
        const b = artButton(root, { id: col.art, label: col.name, size: 96, cls: 'blob', draw: (c, x, y, s) => drawColorBlob(c, col.id, x, y, s * 0.9) });
        place(b, 520 + (i % 4) * 120, 180 + Math.floor(i / 4) * 130, 96, 96);
        onTap(b, () => pick(col));
        blobs[col.id] = b;
      });
      if (C.color) blobs[C.color].classList.add('selected');
    },
    isComplete() { return !!C.color; },
    hintTarget() { return Object.values(blobs)[1]; },
    exit() { token++; }
  };
}
