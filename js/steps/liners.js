import { el, place, artButton, startDrag, rectOf, grow, overlaps, sparkles, wait, onTap } from '../ui.js';
import { LINERS } from '../data.js';
import { mkCanvas, iconCanvas, drawLinerSwatch } from '../draw.js';
import { artNode } from '../assets.js';
import { sfx, speak } from '../audio.js';

// 6-cup tin: cup centers in stage coords
export const CUPS = [0, 1, 2, 3, 4, 5].map(i => ({ cx: 384 + (i % 3) * 132, cy: 236 + Math.floor(i / 3) * 140 }));

export function drawTin(root) {
  const tin = el('div', 'tin', root, { 'aria-hidden': 'true' });
  place(tin, 296, 150, 440, 320);
  tin.appendChild(artNode('tin-cupcake-6', () => iconCanvas(440, (c) => {
    c.beginPath(); c.roundRect(4, 64, 432, 312 - 120, 40); c.fillStyle = '#C9D6E0'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7d8f9c'; c.stroke();
  }), 440, 320));
  return tin;
}

export function create(api) {
  let root, C, cups = [], stack, swatches = {}, done = false;
  const lined = () => C.linedCups;
  function renderCup(i) {
    const d = cups[i];
    d.innerHTML = '';
    if (i < lined() || d.dataset.lined === '1') {
      const cv = iconCanvas(120, (c, x, y, s) => drawLinerSwatch(c, C.liner, x, y, s * 0.9));
      d.appendChild(cv);
    } else el('div', 'cup-hole', d);
  }
  function renderAll() { cups.forEach((d, i) => renderCup(i)); renderStack(); Object.entries(swatches).forEach(([k, b]) => b.classList.toggle('selected', k === C.liner)); }
  function renderStack() {
    stack.innerHTML = '';
    for (let k = 2; k >= 0; k--) {
      const layer = iconCanvas(140, (c, x, y, s) => drawLinerSwatch(c, C.liner, x, y - k * 6, s * 0.85));
      layer.style.position = 'absolute'; layer.style.left = layer.style.top = '0';
      stack.appendChild(layer);
    }
  }
  function linedCount() { return cups.filter(d => d.dataset.lined === '1').length; }
  async function fill(i, fly) {
    const d = cups[i];
    if (d.dataset.lined === '1') return;
    d.dataset.lined = '1';
    C.linedCups = linedCount();
    api.progress();
    if (fly) {
      const s = rectOf(stack), t = rectOf(d);
      const g = el('div', 'tmp flyer', document.getElementById('fx'));
      g.appendChild(iconCanvas(110, (c, x, y, sz) => drawLinerSwatch(c, C.liner, x, y, sz * 0.9)));
      place(g, s.cx - 55, s.cy - 55, 110, 110);
      requestAnimationFrame(() => { g.style.transform = `translate(${t.cx - s.cx}px, ${t.cy - s.cy}px)`; });
      await wait(380); g.remove();
    }
    renderCup(i); sfx('fwip');
    const r = rectOf(d); sparkles(r.cx, r.cy, 4, 40);
    if (linedCount() === 6 && !done) {
      done = true; sfx('sparkle');
      cups.forEach(c => { const r = rectOf(c); sparkles(r.cx, r.cy, 5, 60); });
      api.complete();
    }
  }
  return {
    skill: true,
    enter(r, c) {
      root = r; C = c;
      if (!C.liner) C.liner = LINERS[0].id;
      drawTin(root);
      cups = CUPS.map((p, i) => {
        const d = el('button', 'cup', root, { 'aria-label': 'Cup ' + (i + 1), type: 'button' });
        place(d, p.cx - 60, p.cy - 60, 120, 120);
        if (i < C.linedCups) d.dataset.lined = '1';
        onTap(d, () => fill(i, true)); // tap an empty cup: a liner flies in
        return d;
      });
      stack = el('div', 'liner-stack', root, { 'aria-label': 'Liners', role: 'button' });
      place(stack, 70, 230, 140, 140);
      stack.addEventListener('pointerdown', e => {
        api.progress();
        startDrag(e, {
          size: 120, from: rectOf(stack),
          makeGhost: () => iconCanvas(120, (c, x, y, s) => drawLinerSwatch(c, C.liner, x, y, s * 0.9)),
          onDrop: gr => {
            // nearest empty cup whose 1.5x zone the liner touches
            let best = -1, bd = 1e9;
            cups.forEach((d, i) => { if (d.dataset.lined === '1') return; const z = grow(rectOf(d), 1.5); if (overlaps(gr, z)) { const dd = Math.hypot(z.cx - gr.cx, z.cy - gr.cy); if (dd < bd) { bd = dd; best = i; } } });
            if (best >= 0) { fill(best, false); return true; }
            return false;
          }
        });
      });
      LINERS.forEach((L, i) => {
        const b = artButton(root, { id: L.art, label: L.name, size: 96, cls: 'swatch', draw: (c, x, y, s) => drawLinerSwatch(c, L.id, x, y, s * 0.9) });
        place(b, 792 + (i % 2) * 120, 120 + Math.floor(i / 2) * 116, 96, 96);
        onTap(b, () => { C.liner = L.id; sfx('pop'); speak(L.name); api.progress(); renderAll(); b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce'); });
        swatches[L.id] = b;
      });
      renderAll();
      done = linedCount() === 6;
    },
    isComplete() { return linedCount() === 6; },
    autoComplete() { cups.forEach((d, i) => fill(i, true)); },
    hintTarget() { return linedCount() === 0 ? stack : cups.find(d => d.dataset.lined !== '1') || stack; },
    exit() {}
  };
}
