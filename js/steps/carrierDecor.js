import { mapPt, el, place, artButton, startDrag, rectOf, sparkles, onTap } from '../ui.js';
import { STICKERS } from '../data.js';
import { mkCanvas, drawCarrier, drawSticker, iconCanvas } from '../draw.js';
import { sfx } from '../audio.js';

const BOX = { x: 40, y: 112, w: 600, h: 350 };

export function create(api) {
  let root, C, layer, page = 0, opts = [], panel;
  const stickerNode = (id, s) => iconCanvas(s, (c, x, y, sz) => drawSticker(c, id, x, y, sz * 0.92));
  function renderPlaced() {
    layer.innerHTML = '';
    C.carrierDecor.forEach((st, i) => {
      const d = el('div', 'placed', layer, { role: 'img', 'aria-label': 'Sticker' });
      place(d, st.x * BOX.w - 48, st.y * BOX.h - 48, 96, 96);
      d.appendChild(stickerNode(st.id, 96));
      d.addEventListener('pointerdown', e => {
        e.stopPropagation();
        C.carrierDecor.splice(C.carrierDecor.indexOf(st), 1); renderPlaced();
        const o = mapPt(BOX.x, BOX.y);
        drag(e, st.id, { cx: o.x + st.x * BOX.w, cy: o.y + st.y * BOX.h, x: 0, y: 0, w: 0, h: 0 });
      });
    });
  }
  function drag(e, id, from) {
    api.progress();
    startDrag(e, {
      size: 96, from, makeGhost: () => stickerNode(id, 96),
      onDrop: (gr, p) => {
        // 1.5x zone around the carrier
        const gx = BOX.w * 0.25, gy = BOX.h * 0.25, o = mapPt(BOX.x, BOX.y);
        if (p.x > o.x - gx && p.x < o.x + BOX.w + gx && p.y > o.y - gy && p.y < o.y + BOX.h + gy) {
          const x = Math.max(0.08, Math.min(0.92, (p.x - o.x) / BOX.w)), y = Math.max(0.15, Math.min(0.9, (p.y - o.y) / BOX.h));
          C.carrierDecor.push({ id, x, y }); sfx('pop'); sparkles(p.x, p.y, 5, 40); renderPlaced(); return true;
        }
        renderPlaced(); return false; // goes back to the sticker tray
      }
    });
  }
  function renderOptions() {
    opts.forEach(o => o.remove()); opts = [];
    STICKERS.slice(page * 6, page * 6 + 6).forEach((s, i) => {
      const b = artButton(panel, { id: s.art, label: 'Sticker', size: 96, cls: 'opt', draw: (c, x, y, sz) => drawSticker(c, s.id, x, y, sz * 0.9) });
      place(b, (i % 2) * 120, Math.floor(i / 2) * 116, 96, 96);
      b.dataset.sticker = s.id;
      b.addEventListener('pointerdown', e => drag(e, s.id, rectOf(b)));
      opts.push(b);
    });
  }
  return {
    praise: 'So pretty!',
    enter(r, c) {
      root = r; C = c; C.carrierDecor = C.carrierDecor || [];
      const cv = mkCanvas(BOX.w, BOX.h, 'carrier-canvas'); root.appendChild(cv); place(cv, BOX.x, BOX.y);
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Your box');
      drawCarrier(cv.ctx, C.carrier || 'bento', BOX.w / 2, BOX.h / 2, BOX.w * 0.9, BOX.h, false);
      layer = el('div', 'sticker-layer', root); place(layer, BOX.x, BOX.y, BOX.w, BOX.h);
      panel = el('div', 'opt-panel', root); place(panel, 792, 112, 216, 336);
      const more = el('button', 'btn more', root, { type: 'button', 'aria-label': 'More stickers' }); place(more, 792, 470, 96, 96);
      more.appendChild(iconCanvas(96, (c, x, y, s) => { c.fillStyle = '#6B4A3A'; [-0.2, 0, 0.2].forEach(d => { c.beginPath(); c.arc(x + d * s, y, s * 0.06, 0, Math.PI * 2); c.fill(); }); }));
      onTap(more, () => { page = (page + 1) % 4; sfx('pop'); renderOptions(); api.progress(); });
      const undo = artButton(root, { id: 'btn-undo', label: 'Oops, undo', size: 96, cls: 'tool', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#FFE98A'; c.fill(); } });
      place(undo, 220, 476, 96, 96);
      onTap(undo, () => { C.carrierDecor.pop(); sfx('pop'); renderPlaced(); api.progress(); });
      const clear = artButton(root, { id: 'btn-clear', label: 'Clear all', size: 96, cls: 'tool', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#B8E8D2'; c.fill(); } });
      place(clear, 364, 476, 96, 96);
      onTap(clear, () => { C.carrierDecor.length = 0; sfx('fwip'); renderPlaced(); api.progress(); });
      renderOptions(); renderPlaced();
    },
    isComplete() { return true; }, // zero stickers is allowed
    hintTarget() { return opts[0]; },
    exit() {}
  };
}
